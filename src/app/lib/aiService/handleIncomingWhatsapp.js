import AIMessageModel from "@/app/ults/models/AIMessageModel";
import SessionModel from "@/app/ults/models/SessionModel";
import UserModel from "@/app/ults/models/UserModel";
import { triggerAIResponse } from "@/app/lib/aiService/triggerAIResponse";
import { getOrCreateSession } from "./session";
import { uploadCustomerImageToCloudinary } from "@/app/lib/aiService/customerImageSearch.js";
import { buildImageNoMatchContext } from "@/app/lib/aiService/buildImageMatchContext.js";
import { handlePaymentReceipt, buildPaymentReceiptContext, createPendingOrderFromText } from "@/app/lib/aiService/handlePaymentReceipt.js";
import SellerProfileModel from "@/app/ults/models/SellerProfileModel";
import PlanModel from "@/app/ults/models/PlanModel";
import ServiceProfileModel from "@/app/ults/models/ServiceProfileModel";
import { sendWhatsAppAutomationReply } from "../../api/helper/WhatsAppAutomationReply";
import { searchProducts, shouldSearch } from "@/app/lib/store/searchProducts.js";
import { buildSearchMatchContext } from "@/app/lib/store/buildSearchContext.js";
import { buildStorefrontUrl } from "@/app/lib/store/buildStorefrontUrl.js";

/**
 * buildImageReceivedContext
 *
 * When a customer sends an image, instead of running visual search,
 * we direct them to the storefront where they can browse visually.
 * If no storefront is set up, we ask them to describe what they want.
 */
function buildImageReceivedContext({ caption, storefrontUrl, businessName }) {
  if (storefrontUrl) {
    return `[SYSTEM: Customer sent an image${caption ? ` with caption: "${caption}"` : ""}.
Instead of visual search, guide them to browse the storefront.

INSTRUCTIONS:
- Acknowledge their image warmly in 1 sentence
- Tell them they can browse the full collection with pictures and prices at: ${storefrontUrl}
- Keep it short and natural — do not list products, just send the link
- Example: "Thanks for sharing! You can browse our full collection here: ${storefrontUrl} — tap any item to get details and message us directly."
]`;
  }

  return `[SYSTEM: Customer sent an image${caption ? ` with caption: "${caption}"` : ""}.
The store doesn't have a storefront set up yet.

INSTRUCTIONS:
- Acknowledge their image and ask them to describe what they are looking for in words
- Example: "Thanks for the image! Could you describe what you're looking for — the type, colour, or size? That'll help me find the right product for you."
]`;
}

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
        const serviceProfile = await ServiceProfileModel.findOne({ userId: user._id }).lean();
        businessName = serviceProfile?.businessName || "our business";
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




  // ── Step 8: Handle image messages ───────────────────────
  if (isImageMessage) {
    console.log("🖼️  Step 8 — Image message detected");

    try {
      const mediaUrl = await resolveWhatsAppMediaUrl(message.image.id);
      const caption = message.image?.caption || "";

      const recentMessages = await AIMessageModel.find({
        sessionId: session.sessionId,
        userId: user._id,
      })
        .sort({ createdAt: -1 })
        .limit(12)
        .lean();

      const conversationContext = recentMessages.reverse().map((m) => ({
        role: m.direction === "inbound" ? "user" : "assistant",
        content: m.text,
      }));

      const contactInfo = user.whatsapp?.contacts?.list?.find((c) => c.phone === visitorPhone);
      const customerName = contactInfo?.name || "WhatsApp Customer";

      // Still upload the image for inbox display purposes
      let uploadedImage = null;
      try {
        uploadedImage = await uploadCustomerImageToCloudinary(
          mediaUrl,
          sellerProfile?._id || user._id,
          visitorPhone,
          "customer-images"
        );
        await AIMessageModel.updateOne(
          { messageId: message.id },
          {
            $set: {
              mediaUrl: uploadedImage.url,
              mediaType: "image",
              text: caption || "📷 Image",
            },
          }
        );
      } catch (uploadErr) {
        console.warn("⚠️ Inbox image upload failed:", uploadErr.message);
      }

      // ── Payment receipt check — keep this, it's separate from product search
      if (sellerProfile) {
        const receiptResult = await handlePaymentReceipt({
          sellerId: sellerProfile._id,
          sellerUserId: user._id,
          mediaUrl,
          customerPhone: visitorPhone,
          customerName,
          caption,
          recentMessages: conversationContext,
          imageUrl: uploadedImage?.url,
          imagePublicId: uploadedImage?.publicId,
        });

        if (receiptResult.handled) {
          console.log("💳 Payment receipt saved for order:", receiptResult.order._id);
          await triggerAIResponse({
            session,
            user,
            inboundText: buildPaymentReceiptContext(),
            imageSearchContext: true,
          });
          return { ok: true };
        }
      }

      // ── Instead of visual search, send storefront link ────
      // Build a context block telling the AI to acknowledge the image
      // and direct the customer to browse the storefront visually
      const storefrontUrl = sellerProfile?.slug
        ? await buildStorefrontUrl({
            sellerProfile,
            customerPhone: visitorPhone,
          }).catch(() => null)
        : null;

      const imageContext = buildImageReceivedContext({
        caption,
        storefrontUrl,
        businessName: sellerProfile?.businessName,
      });

      console.log("🏪 Step 8 — Directing customer to storefront for visual browsing");
      await triggerAIResponse({
        session,
        user,
        inboundText: imageContext,
        imageSearchContext: true,
      });

    } catch (err) {
      console.error("❌ Step 8 — Image handling error:", err.message);
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
  if (sellerProfile && isTextMessage) {
    const recentMessages = await AIMessageModel.find({
      sessionId: session.sessionId,
      userId: user._id,
    })
      .sort({ createdAt: -1 })
      .limit(12)
      .lean();

    const conversationContext = recentMessages.reverse().map((m) => ({
      role: m.direction === "inbound" ? "user" : "assistant",
      content: m.text,
    }));

    const contactInfo = user.whatsapp?.contacts?.list?.find((c) => c.phone === visitorPhone);
    await createPendingOrderFromText({
      sellerId: sellerProfile._id,
      sellerUserId: user._id,
      customerPhone: visitorPhone,
      customerName: contactInfo?.name || "WhatsApp Customer",
      recentMessages: conversationContext,
      inboundText,
    });
  }

  // ── Step 9.5: Semantic product search (seller + text only) ───────────
  // If the message looks like a product enquiry, run a real search and
  // inject the matched products as grounded context for the AI.
  // Mirrors the image search flow — AI gets facts, not guesses.
  let enrichedText = inboundText;

  if (sellerProfile && isTextMessage && shouldSearch(inboundText)) {
    try {
      const { results, hasResults } = await searchProducts(
        sellerProfile._id,
        inboundText
      );

      if (hasResults) {
        const searchContext = buildSearchMatchContext(
          results,
          inboundText,
          sellerProfile.currency || "NGN"
        );
        // searchContext is a [SYSTEM: ...] block — pass it as the user turn
        // so the AI responds based on real matched data (same as image search)
        if (searchContext) enrichedText = searchContext;
        console.log(`✅ Step 9.5 — Product search: ${results.length} match(es) injected into AI context`);
      } else {
        console.log("⚠️  Step 9.5 — Product search: no matches, AI falls back to system prompt catalogue");
      }
    } catch (err) {
      // Non-fatal — AI still has the full catalogue in its system prompt
      console.warn("⚠️  Step 9.5 — Product search failed (non-fatal):", err.message);
    }
  }

  console.log("🤖 Step 9 — Triggering AI response...");
  await triggerAIResponse({ session, user, inboundText: enrichedText });
  console.log("📊 Step 9 — messagesUsedThisMonth incremented");

  return { ok: true };
};