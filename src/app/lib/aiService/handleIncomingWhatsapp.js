import AIMessageModel from "@/app/ults/models/AIMessageModel";
import SessionModel from "@/app/ults/models/SessionModel";
import UserModel from "@/app/ults/models/UserModel";
import { triggerAIResponse } from "@/app/lib/aiService/triggerAIResponse";
import { getOrCreateSession } from "./session";
import AutomationExecutionModel from "@/app/ults/models/AutomationExecutionModel";

// ─────────────────────────────────────────────────────────────
// Main webhook handler
// ─────────────────────────────────────────────────────────────
export const handleIncomingWhatsApp = async (payload) => {
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

  if (!session || !user) {
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

  // ── Steps 5 & 6 (parallel): Update contact + session simultaneously ───
  // Step 5: Single upsert-style update — try existing contact first, push if new
  const contactUpdatePromise = UserModel.updateOne(
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
  ).then(async (result) => {
    if (result.matchedCount === 0) {
      // Brand new contact — push with lead metadata
      await UserModel.updateOne(
        { _id: user._id },
        {
          $addToSet: {
            "whatsapp.contacts.list": {
              phone: visitorPhone,
              status: "whitelist",
              leadStage: "new",
              leadSource: "whatsapp",
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
      console.log("✅ Step 5 — Existing contact updated:", visitorPhone);
    }
  });

  // Step 6: Session TTL + message count
  const sessionUpdatePromise = SessionModel.updateOne(
    { _id: session._id },
    {
      $inc: {
        "context.messageCount": 1,
        "context.inboundCount": 1,
      },
      $set: {
        lastMessageAt: new Date(),
        "followUp.sent": false,
      },
    }
  );

  await Promise.all([contactUpdatePromise, sessionUpdatePromise]);
  console.log("✅ Steps 5 & 6 — Contact + Session updated in parallel");

  // ── Step 7: Check auto-reply permission — in-memory, no extra DB call ──
  // user.whatsapp.contacts.list was already loaded in Step 1
  const contactIsWhitelisted = user.whatsapp?.contacts?.list?.some(
    (c) => c.phone === visitorPhone && c.status === "whitelist"
  );

  if (!contactIsWhitelisted) {
    console.log("🚫 Step 7 — Auto-reply blocked by contact policy");
    return { ok: true };
  }
  console.log("✅ Step 7 — Auto-reply allowed (in-memory check)");

  // //── Step 8: Opt-in flow ───────────────────────────────────
  //   const handled = await handleNewContact({ session, user, visitorPhone, inboundText });
  //   if (handled) {
  //     console.log("✅ Step 8 — Handled by opt-in flow");
  //     return { ok: true };
  //   }
  //   console.log("✅ Step 8 — Opt-in passed, proceeding to AI");

  // ── Step 9: Trigger AI response ───────────────────────────
  console.log("🤖 Step 9 — Triggering AI response...");
  await triggerAIResponse({ session, user, inboundText });
};