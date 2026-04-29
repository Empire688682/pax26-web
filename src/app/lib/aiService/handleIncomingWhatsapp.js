import AIMessageModel from "@/app/ults/models/AIMessageModel";
import SessionModel from "@/app/ults/models/SessionModel";
import UserModel from "@/app/ults/models/UserModel";
import { triggerAIResponse } from "@/app/lib/aiService/triggerAIResponse";
import { getOrCreateSession } from "./session";
import { handleCustomerImage } from "@/app/lib/aiService/customerImageSearch.js";
import { buildImageMatchContext, buildImageNoMatchContext } from "@/app/lib/aiService/buildImageMatchContext.js";
import SellerProfileModel from "@/app/ults/models/SellerProfileModel";

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

  // ── Step 2: Load seller profile (for image search context) ─
  // Only needed for image messages but cheap to load early
  const sellerProfile = await SellerProfileModel.findOne({ userId: user._id }).lean();

  // ── Step 2.5: Check auto-reply permission ───────────────────
  const existingContact = user.whatsapp?.contacts?.list?.find(
    (c) => c.phone === visitorPhone
  );

  // New contacts (not in the initially loaded user) are created with 'whitelist' status later
  const contactIsWhitelisted = existingContact ? existingContact.status === "whitelist" : true;

  if (!contactIsWhitelisted) {
    console.log("🚫 Auto-reply blocked by contact policy. Ignoring message and preventing db save.");
    return { ok: true };
  }
  console.log("✅ Step 2.5 — Auto-reply allowed");

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

  return { ok: true };
};