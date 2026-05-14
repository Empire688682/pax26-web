import AIMessageModel from "@/app/ults/models/AIMessageModel";
import SessionModel from "@/app/ults/models/SessionModel";
import UserModel from "@/app/ults/models/UserModel";
import { triggerAIResponse } from "@/app/lib/aiService/triggerAIResponse";
import { getOrCreateSession } from "./session";
import { handleCustomerImage } from "@/app/lib/aiService/customerImageSearch.js";
import { buildImageMatchContext, buildImageNoMatchContext } from "@/app/lib/aiService/buildImageMatchContext.js";
import SellerProfileModel from "@/app/ults/models/SellerProfileModel";
import PlanModel from "@/app/ults/models/PlanModel";
import GeneralBusinessProfileModel from "@/app/ults/models/GeneralBusinessProfileModel";
import { sendWhatsAppAutomationReply } from "../../api/helper/WhatsAppAutomationReply";

// ─────────────────────────────────────────────────────────────
// Fetch actual WhatsApp media download URL from Meta API
// WhatsApp gives you an image ID — this resolves it to a URL
// ─────────────────────────────────────────────────────────────
async function resolveWhatsAppMediaUrl(imageId) {
  const res = await fetch(`https://graph.facebook.com/v19.0/${imageId}`, {
    headers: {
      Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
    },
  });

  if (!res.ok) {
    throw new Error(`Meta media resolve failed: ${res.statusText}`);
  }

  const data = await res.json();
  return data.url; // actual downloadable URL (short-lived, use immediately)
}

// ─────────────────────────────────────────────────────────────
// Main webhook handler
// ─────────────────────────────────────────────────────────────
export const handleIncomingWhatsApp = async (payload) => {
  const value = payload?.entry?.[0]?.changes?.[0]?.value;
  const message = value?.messages?.[0];
  const metadata = value?.metadata;

  if (!message?.from) {
    console.log("❌ Invalid message.from");
    return { ok: true };
  }

  // ── Normalise phone numbers ────────────────────────────────
  const cleaned = message.from.replace(/\D/g, "");
  const visitorPhone = `+${cleaned}`;
  const phoneNumberId = metadata?.phone_number_id || "";
  const displayPhone = metadata?.display_phone_number || "";

  // ── Detect message type ────────────────────────────────────
  const messageType = message.type; // "text" | "image" | "audio" | "document" | ...
  const isTextMessage = messageType === "text";
  const isImageMessage = messageType === "image";

  // For text: use the body. For image: use caption if provided, else a placeholder.
  // This is what gets saved to AIMessageModel — the AI sees context separately.
  const inboundText =
    message?.text?.body ||
    message?.image?.caption ||
    (isImageMessage ? "[Customer sent an image]" : "Good morning");

  console.log("📩 phoneNumberId:", phoneNumberId);
  console.log("📩 Type:", messageType, "| From:", visitorPhone, "| Text:", inboundText);

  // ── Step 1: Find user ──────────────────────────────────────
  let user = await UserModel.findOne({ "whatsapp.phoneNumberId": phoneNumberId });

  if (!user) {
    console.log("❌ No user found for phoneNumberId:", phoneNumberId);
    return { ok: true };
  }
  console.log("✅ Step 1 — User found:", user._id);

  // ── Step 1.5: Guard against self-messages & echos ─────────
  const userPersonalPhone = user.number?.replace(/\D/g, "");
  const businessPhone = displayPhone?.replace(/\D/g, "");
  
  if (cleaned === businessPhone || (userPersonalPhone && cleaned.endsWith(userPersonalPhone))) {
    console.log(`🚫 Ignoring self-message or echo from: ${visitorPhone}`);
    return { ok: true };
  }

  // ── Step 2: Load seller profile (for image search context) ─
  // Only needed for image messages but cheap to load early
  const sellerProfile = await SellerProfileModel.findOne({ userId: user._id }).lean();

  // ── Step 2.5: Check auto-reply permission ───────────────────
  const existingContact = user.whatsapp?.contacts?.list?.find(
    (c) => c.phone === visitorPhone
  );

  const policy = user.whatsapp?.contacts?.unknownContactPolicy || "allow";

  if (existingContact) {
    if (existingContact.status === "blacklist") {
      console.log("🚫 Auto-reply blocked by blacklist. Ignoring message.");
      return { ok: true };
    }

    if (existingContact.status === "pending") {
      const text = inboundText.toLowerCase().trim();
      
      // ONLY check for opt-out on the VERY FIRST response to our opt-in prompt
      // (When inboundCount is 1, it means we just received the 2nd message)
      if (existingContact.inboundCount === 1) {
        // Strict regex: Matches "no", "n", "nope", "stop", "cancel" as standalone words
        const isNo = /^(no|n|nope|stop|cancel)(\b|$)/i.test(text);

        if (isNo) {
          console.log("🛡️ Contact replied 'No' to opt-in. Blacklisting.");
          await UserModel.updateOne(
            { _id: user._id, "whatsapp.contacts.list.phone": visitorPhone },
            { $set: { "whatsapp.contacts.list.$.status": "blacklist" } }
          );
          await sendWhatsAppAutomationReply({
            phoneNumberId,
            to: visitorPhone,
            text: "No problem. I've noted that. Have a great day!",
          });
          return { ok: true };
        }
      }
      
      console.log("🛡️ Contact is pending. Allowing AI response while awaiting manual approval.");
      // Proceed to Step 3 so the AI can actually reply to their message
    }
  } else {
    // New contact flow
    if (policy === "block") {
      console.log("🚫 Auto-reply blocked by 'block' unknown contact policy. Ignoring message.");
      return { ok: true };
    }

  }

  console.log("✅ Step 2.5 — Auto-reply allowed (Policy:", policy, ")");

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
      // Store image metadata if present — useful for audit and future reference
      ...(isImageMessage && {
        mediaType: "image",
        mediaId: message.image?.id,
        mediaCaption: message.image?.caption || "",
      }),
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

  // ── Steps 5 & 6 (parallel): Update contact + session ──────
  try {
    const contactUpdateResult = await UserModel.updateOne(
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

    if (contactUpdateResult.matchedCount === 0) {
      await UserModel.updateOne(
        { _id: user._id },
        {
          $addToSet: {
            "whatsapp.contacts.list": {
              phone: visitorPhone,
              status: policy === "ask" ? "pending" : "whitelist",
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

    // ── Special Case: 'ask' policy for first-time contacts ───
    if (!existingContact && policy === "ask") {
      console.log("🛡️ Unknown contact policy is 'ask'. Sending opt-in prompt.");

      let businessName = sellerProfile?.businessName;
      if (!businessName) {
        const genProfile = await GeneralBusinessProfileModel.findOne({ userId: user._id }).lean();
        businessName = genProfile?.businessName || "our business";
      }
      
      const optInMessage = `Hi! I'm the Agent assistant for ${businessName}. I'm here to help with your enquiries. Would you like to proceed with our Agent automated chat? (Reply with Yes or No to continue)`;

      const response = await sendWhatsAppAutomationReply({
        phoneNumberId,
        to: visitorPhone,
        text: optInMessage,
      });

      if (response) {
        await AIMessageModel.create({
          messageId: `optin_${Date.now()}`,
          userId: user._id,
          sessionId: session.sessionId,
          platform: "whatsapp",
          phoneNumberId,
          from: displayPhone,
          to: visitorPhone,
          text: optInMessage,
          direction: "outbound",
          senderType: "system",
          status: "sent",
        });
      }

      console.log("✅ Opt-in sent. Skipping AI for now.");
      return { ok: true };
    }
  } catch (err) {
    console.error("❌ Step 5 — Error updating contact list:", err);
  }

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

  await sessionUpdatePromise;
  console.log("✅ Step 6 — Session updated");

  // ── Step 7: Monthly usage reset + quota check ─────────────
  const now          = new Date();
  const planStarted  = user.paxAI?.planStartedAt ? new Date(user.paxAI.planStartedAt) : now;
  const daysSinceStart = (now - planStarted) / (1000 * 60 * 60 * 24);
  
  // Fetch latest limit from PlanModel to ensure sync with Admin
  const currentPlan = user.paxAI?.plan || "free";
  const planMeta = await PlanModel.findOne({ key: currentPlan });
  const maxMessages = planMeta?.messagesLimit || user.paxAI?.maxMonthlyMessages || 200;
  let   usedMessages = user.paxAI?.messagesUsedThisMonth ?? 0;

  // Reset monthly counter if 30 days have passed since the plan period started
  if (daysSinceStart >= 30) {
    await UserModel.updateOne(
      { _id: user._id },
      {
        $set: {
          "paxAI.messagesUsedThisMonth": 0,
          "paxAI.planStartedAt": now,
        },
      }
    );
    usedMessages = 0;
    console.log("🔄 Step 7 — Monthly message counter reset for user:", user._id);
  }

  // Block AI reply if monthly quota is exhausted
  if (usedMessages >= maxMessages) {
    console.log(`🚫 Step 7 — Monthly quota exhausted (${usedMessages}/${maxMessages}). Skipping AI reply.`);
    return { ok: true };
  }
  console.log(`✅ Step 7 — Usage OK: ${usedMessages}/${maxMessages}`);


  // ── Step 8: Handle image vs text separately ───────────────
  if (isImageMessage) {
    console.log("🖼️  Step 8 — Image message detected, running visual search...");

    // If the seller has no profile set up, fall back to a polite reply
    if (!sellerProfile) {
      console.log("⚠️  No seller profile found — skipping image search");
      await triggerAIResponse({
        session,
        user,
        inboundText: buildImageNoMatchContext(),
      });
      return { ok: true };
    }

    try {
      // Resolve the Meta image ID → actual download URL
      const mediaUrl = await resolveWhatsAppMediaUrl(message.image.id);

      // Run the full image search pipeline:
      // download → upload to Cloudinary → visual similarity search → map to products
      const { matches, hasMatches, customerImageUrl } = await handleCustomerImage({
        sellerId: sellerProfile._id,
        mediaUrl,
        customerPhone: visitorPhone,
      });

      console.log(
        hasMatches
          ? `✅ Step 8 — Image search found ${matches.length} match(es)`
          : "⚠️  Step 8 — No visual matches found"
      );

      // Build a grounded context block for the AI:
      // Contains only real product data — AI cannot hallucinate matches
      const imageContext = hasMatches
        ? buildImageMatchContext(matches, customerImageUrl, sellerProfile.currency)
        : buildImageNoMatchContext();

      // Trigger AI with the image context injected as the user message
      await triggerAIResponse({
        session,
        user,
        inboundText: imageContext,
        // Pass products so the system prompt is fully hydrated
        // triggerAIResponse should forward this to buildSystemPrompt
        imageSearchContext: true,
      });
      console.log("📊 Step 8 — messagesUsedThisMonth incremented");

    } catch (err) {
      console.error("❌ Step 8 — Image processing error:", err.message);
      // Fail gracefully — tell the AI search failed, let it ask the customer to describe
      await triggerAIResponse({
        session,
        user,
        inboundText: buildImageNoMatchContext(),
        imageSearchContext: true,
      });
    }

    return { ok: true };
  }

  // ── Step 9: Standard text — trigger AI response ───────────
  console.log("🤖 Step 9 — Triggering AI response...");
  await triggerAIResponse({ session, user, inboundText });
  console.log("📊 Step 9 — messagesUsedThisMonth incremented");

  return { ok: true };
};