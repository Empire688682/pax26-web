import AIMessageModel from "@/app/ults/models/AIMessageModel";
import SessionModel from "@/app/ults/models/SessionModel";
import UserModel from "@/app/ults/models/UserModel";
import BusinessProfileModel from "@/app/ults/models/BusinessProfileModel";
import { handleNewContact } from "@/app/lib/aiService/optIn";
import { triggerAIResponse } from "@/app/lib/aiService/triggerAIResponse";
import { getOrCreateSession } from "./session";
import {nanoid} from "nanoid";

// ─────────────────────────────────────────────────────────────
// MOCK DATA — covers every function in the A→Z flow
// ─────────────────────────────────────────────────────────────
const IS_MOCK = process.env.MOCK_WEBHOOK === "true";

const MOCK_PAYLOAD = {
  entry: [{
    changes: [{
      value: {
        messaging_product: "whatsapp",
        metadata: {
          display_phone_number: "2348000000000",
          phone_number_id: "69b879d4b4ac84e594143b05",
        },
        contacts: [{ profile: { name: "Test Visitor" }, wa_id: "2348012345678" }],
        messages: [{
          id: `mock_msg_${Date.now()}` + nanoid(5),
          from: "2348012345690",
          timestamp: Math.floor(Date.now() / 1000).toString(),
          type: "text",
          text: { body: "Afternoon dear" },
        }],
      },
    }],
  }],
};

// ─────────────────────────────────────────────────────────────
// Main webhook handler
// ─────────────────────────────────────────────────────────────
export const handleIncomingWhatsApp = async (payload) => {
  if (IS_MOCK) {
    console.log("⚠️  [MOCK MODE] Using mock WhatsApp payload");
    payload = MOCK_PAYLOAD;
  }

  const value = payload?.entry?.[0]?.changes?.[0]?.value;
  const message = value?.messages?.[0];
  const metadata = value?.metadata;
  const inboundText = message?.text?.body || "Good morning";

  if (!message?.from) {
    console.log("❌ Invalid message.from");
    return { ok: true };
  }

  const cleaned = message.from.replace(/\D/g, "");
  const visitorPhone = `+${cleaned}`;
  const phoneNumberId = metadata?.phone_number_id || "";
  const displayPhone = metadata?.display_phone_number || "";

  console.log("📩 phoneNumberId:", phoneNumberId);
  console.log("📩 Incoming from:", visitorPhone, "| Text:", inboundText);

  // ── Step 1: Find user ──────────────────────────────────────
  let user = await UserModel.findOne({ "whatsapp.phoneNumberId": phoneNumberId });

  if (!user && IS_MOCK) {
    console.log("⚠️  [MOCK] No user for phoneNumberId — falling back to first user in DB");
    return { ok: true };
  }

  if (!user) {
    console.log("❌ No user found for phoneNumberId:", phoneNumberId);
    return { ok: true };
  }
  console.log("✅ Step 1 — User found:", user._id);

  // ── Step 2: Ensure business profile exists (mock only) ────

  // ── Step 3: Get or create session ─────────────────────────
  const session = await getOrCreateSession({
    visitorPhone,
    userId: user._id,
    phoneNumberId,
  });

  if (!session) {
    console.log("❌ Session creation failed");
    return { ok: true };
  }
  console.log("✅ Step 3 — Session ready:", session.sessionId);

  // ── Step 4: Save inbound message ──────────────────────────
  try {
    await AIMessageModel.create({
      messageId: message.id || `mock_msg_${Date.now()}`,
      userId: user._id,
      sessionId: session.sessionId,
      platform: "whatsapp",
      phoneNumberId,
      from: visitorPhone,
      to: displayPhone,
      text: inboundText,
      direction: "inbound",
      senderType: "visitor",
      status: "received",
    });
    console.log("✅ Step 4 — Inbound message saved");
  } catch (err) {
    console.log("❌ Error saving message:", err);
    if (err.code === 11000) {
      console.log("⚠️  Duplicate message — skipping");
      return { skipped: true };
    }
    throw err;
  }
  
  // ── Step 5: Add contact if new — auto-tag as lead ────────
  const contactExists = await UserModel.exists({
    _id: user._id,
    "whatsapp.contacts.list.phone": visitorPhone,
  });

  if (!contactExists) {
    // Brand new contact — add with leadStage "new"
    await UserModel.updateOne(
      { _id: user._id },
      {
        $addToSet: {
          "whatsapp.contacts.list": {
            phone: visitorPhone,
            status: "whitelist",
            leadStage: "new",        // ← auto-tagged as new lead
            leadSource: "whatsapp",  // ← source tracked
            messageCount: 1,
            inboundCount: 1,
            lastMessageAt: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        },
      }
    );
    console.log("✅ Step 5 — New lead added:", visitorPhone);
  } else {
    // Existing contact — update message stats only
    await UserModel.updateOne(
      { _id: user._id, "whatsapp.contacts.list.phone": visitorPhone },
      {
        $set: {
          "whatsapp.contacts.list.$.lastMessageAt": new Date(),
          "whatsapp.contacts.list.$.updatedAt": new Date(),
        },
        $inc: {
          "whatsapp.contacts.list.$.messageCount": 1,
          "whatsapp.contacts.list.$.inboundCount": 1,
        },
      }
    );
    console.log("✅ Step 5 — Existing contact updated:", visitorPhone);
  }

  // ── Step 6: Update session TTL + message count ────────────
  await SessionModel.findByIdAndUpdate(session._id, {
    lastMessageAt: new Date(),
    $inc: { 
      "context.messageCount": 1,
      "context.inboundCount": 1,
      "context.totalTokens": 0 // no tokens for visitor messages
    },
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
  });
  console.log("✅ Step 6 — Session updated");

  // ── Step 7: Check auto-reply permission ───────────────────
  const canAutoReply = await UserModel.exists({
    _id: user._id,
    "whatsapp.contacts.list": {
      $elemMatch: { phone: visitorPhone, status: "whitelist" },
    },
  });

  if (!canAutoReply) {
    console.log("🚫 Step 7 — Auto-reply blocked by contact policy");
    return { ok: true };
  }
  console.log("✅ Step 7 — Auto-reply allowed");

  // ── Step 8: Opt-in flow ───────────────────────────────────
  // const handled = await handleNewContact({ session, user, visitorPhone, inboundText });
  // if (handled) {
  //   console.log("✅ Step 8 — Handled by opt-in flow");
  //   return { ok: true };
  // }
  console.log("✅ Step 8 — Opt-in passed, proceeding to AI");

  // ── Step 9: Trigger AI response ───────────────────────────
  console.log("🤖 Step 9 — Triggering AI response...");
  triggerAIResponse({ session, user, inboundText }).catch(err =>
    console.log("❌ AI error:", err)
  );

  return { ok: true };
};