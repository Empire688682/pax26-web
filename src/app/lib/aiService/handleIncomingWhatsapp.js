import AIMessageModel from "@/app/ults/models/AIMessageModel";
import SessionModel from "@/app/ults/models/SessionModel";
import UserModel from "@/app/ults/models/UserModel";
import { triggerAIResponse } from "@/app/lib/aiService/triggerAIResponse";
import { getOrCreateSession } from "./session";
import { uploadCustomerImageToCloudinary } from "@/app/lib/aiService/customerImageSearch.js";
import { buildImageNoMatchContext } from "@/app/lib/aiService/buildImageMatchContext.js";
import { handlePaymentReceipt, buildPaymentReceiptContext, createPendingOrderFromText, isPaymentStage } from "@/app/lib/aiService/handlePaymentReceipt.js";
import SellerProfileModel from "@/app/ults/models/SellerProfileModel";
import PlanModel from "@/app/ults/models/PlanModel";
import ServiceProfileModel from "@/app/ults/models/ServiceProfileModel";
import { sendWhatsAppAutomationReply } from "../../api/helper/WhatsAppAutomationReply";
import { searchProducts, shouldSearch } from "@/app/lib/store/searchProducts.js";
import { buildSearchMatchContext } from "@/app/lib/store/buildSearchContext.js";
import { buildStorefrontUrl } from "@/app/lib/store/buildStorefrontUrl.js";
import { sendMobilePush } from "@/app/lib/pushNotificationService.js";

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
Do NOT perform visual image search.
INSTRUCTIONS:
- Acknowledge receiving their image politely.
- Offer/provide our storefront URL: ${storefrontUrl}
- Ask the customer if they would like to browse our products or describe what product, size, or color they are looking for.]`;
  }

  return `[SYSTEM: Customer sent an image${caption ? ` with caption: "${caption}"` : ""}.
Do NOT perform visual image search.
INSTRUCTIONS:
- Acknowledge receiving their image politely.
- Ask the customer if they would like to browse our products or describe what product, size, or color they are looking for.]`;
}

// ─────────────────────────────────────────────────────────────
// Fetch actual WhatsApp media download URL from Meta API
// WhatsApp gives you an image ID — this resolves it to a URL
// ─────────────────────────────────────────────────────────────
async function resolveWhatsAppMediaUrl(imageId, userToken = null) {
  const primaryToken = userToken || process.env.WHATSAPP_ACCESS_TOKEN;
  const secondaryToken = userToken ? process.env.WHATSAPP_ACCESS_TOKEN : null;

  let res = await fetch(`https://graph.facebook.com/v19.0/${imageId}`, {
    headers: {
      Authorization: `Bearer ${primaryToken}`,
    },
  });

  if (!res.ok && secondaryToken && secondaryToken !== primaryToken) {
    res = await fetch(`https://graph.facebook.com/v19.0/${imageId}`, {
      headers: {
        Authorization: `Bearer ${secondaryToken}`,
      },
    });
  }

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
        // Push: new lead notification
        await sendMobilePush(user._id, {
          type:  "new_lead",
          title: "👤 New Lead",
          body:  `${visitorPhone} just messaged your store for the first time.`,
          data:  { phone: visitorPhone },
        });
    } else {
      // Auto-update leadStage from "new" to "contacted" once conversation is active
      await UserModel.updateOne(
        {
          _id: user._id,
          "whatsapp.contacts.list.phone": visitorPhone,
          "whatsapp.contacts.list.leadStage": { $in: ["new", null, ""] },
        },
        {
          $set: {
            "whatsapp.contacts.list.$.leadStage": "contacted",
          },
        }
      );
      console.log("✅ Step 5 — Existing contact updated (leadStage set to contacted):", visitorPhone);
      // Push: existing lead message notification
      sendMobilePush(user._id, {
        type:  "new_lead",
        title: `💬 Message from ${existingContact?.name || visitorPhone}`,
        body:  inboundText ? inboundText.slice(0, 80) : "Sent a message",
        data:  { phone: visitorPhone },
      }).catch(() => {});
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
  
  // Fetch latest limits from PlanModel to ensure sync with Admin
  const currentPlan = user.paxAI?.plan || "free";
  const planMeta = await PlanModel.findOne({ key: currentPlan }).lean();
  const maxMessages = planMeta?.messagesLimit || user.paxAI?.maxMonthlyMessages || 200;
  let   usedMessages = user.paxAI?.messagesUsedThisMonth ?? 0;

  // Reset monthly counters if 30 days have passed since the plan period started
  if (daysSinceStart >= 30) {
    await UserModel.updateOne(
      { _id: user._id },
      {
        $set: {
          "paxAI.messagesUsedThisMonth": 0,
          "paxAI.broadcastContactsUsedThisMonth": 0,
          "paxAI.planStartedAt": now,
        },
      }
    );
    usedMessages = 0;
    console.log("🔄 Step 7 — Monthly counters reset for user:", user._id);
  }

  // Also sync plan-level feature flags from PlanModel in case admin updated them
  if (planMeta) {
    const featuresChanged =
      (planMeta.orderReceiptsEnabled   !== undefined && planMeta.orderReceiptsEnabled   !== user.paxAI?.orderReceiptsEnabled)   ||
      (planMeta.salesAlertsEnabled     !== undefined && planMeta.salesAlertsEnabled     !== user.paxAI?.salesAlertsEnabled)     ||
      (planMeta.salesAnalyticsEnabled  !== undefined && planMeta.salesAnalyticsEnabled  !== user.paxAI?.salesAnalyticsEnabled)  ||
      (planMeta.leadFollowupEnabled    !== undefined && planMeta.leadFollowupEnabled    !== user.paxAI?.leadFollowupEnabled)    ||
      (planMeta.leadQualificationEnabled !== undefined && planMeta.leadQualificationEnabled !== user.paxAI?.leadQualificationEnabled) ||
      (planMeta.productRecommendations !== undefined && planMeta.productRecommendations !== user.paxAI?.productRecommendations) ||
      (planMeta.storefrontEnabled      !== undefined && planMeta.storefrontEnabled      !== user.paxAI?.storefrontEnabled)      ||
      (planMeta.productsLimit          !== undefined && planMeta.productsLimit          !== user.paxAI?.productsLimit);

    if (featuresChanged) {
      await UserModel.updateOne(
        { _id: user._id },
        {
          $set: {
            "paxAI.orderReceiptsEnabled":     planMeta.orderReceiptsEnabled     ?? user.paxAI?.orderReceiptsEnabled,
            "paxAI.salesAlertsEnabled":       planMeta.salesAlertsEnabled       ?? user.paxAI?.salesAlertsEnabled,
            "paxAI.salesAnalyticsEnabled":    planMeta.salesAnalyticsEnabled    ?? user.paxAI?.salesAnalyticsEnabled,
            "paxAI.salesAnalyticsDays":       planMeta.salesAnalyticsDays       ?? user.paxAI?.salesAnalyticsDays,
            "paxAI.leadFollowupEnabled":      planMeta.leadFollowupEnabled      ?? user.paxAI?.leadFollowupEnabled,
            "paxAI.leadQualificationEnabled": planMeta.leadQualificationEnabled ?? user.paxAI?.leadQualificationEnabled,
            "paxAI.productRecommendations":   planMeta.productRecommendations   ?? user.paxAI?.productRecommendations,
            "paxAI.storefrontEnabled":        planMeta.storefrontEnabled        ?? user.paxAI?.storefrontEnabled,
            "paxAI.productsLimit":            planMeta.productsLimit            ?? user.paxAI?.productsLimit,
            "paxAI.maxMonthlyMessages":       planMeta.messagesLimit            ?? user.paxAI?.maxMonthlyMessages,
            "paxAI.broadcastContactsLimit":   planMeta.broadcastContactsLimit   ?? user.paxAI?.broadcastContactsLimit,
            "paxAI.lastUpdated": now,
          }
        }
      );
      // Refresh user reference so downstream steps use fresh flags
      user = await UserModel.findById(user._id).lean();
      console.log("🔄 Step 7 — Plan feature flags synced from PlanModel for user:", user._id);
    }
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

    const caption = message.image?.caption || "";

    // Load recent conversation history to evaluate payment stage accurately
    const earlyMessages = await AIMessageModel.find({
      sessionId: session.sessionId,
      userId: user._id,
    })
      .sort({ createdAt: -1 })
      .limit(15)
      .lean();

    const earlyContext = earlyMessages.reverse().map((m) => ({
      role: m.direction === "inbound" ? "user" : "assistant",
      content: m.text,
    }));

    const isExpectingPaymentProof =
      (session?.payment?.expectingPayment === true && session?.payment?.paymentProofReceived !== true) ||
      isPaymentStage(earlyContext, session);

    // ── Step 8a: EARLY payment-stage check (before fetching media URL) ──
    if (sellerProfile && isExpectingPaymentProof) {
      const PAYMENT_KEYWORDS_EARLY = /payment|paid|transfer|receipt|screenshot|proof|sent|done|completed|txn|transaction|have paid|i paid/i;
      const PAYMENT_STAGE_KEYWORDS_EARLY = /account number|bank name|account name|transfer|make payment|pay to|payment details|screenshot of your payment|payment confirmation|once you.?ve transferred|send.*receipt|send.*proof|payment proof|gtbank|zenith|access|kuda|opay|palmpay|moniepoint|firstbank|ubabank|wema|sterling|stanbic|fidelity|acct|acc\/num|bank:/i;

      const captionSignalsPayment = caption && PAYMENT_KEYWORDS_EARLY.test(caption);
      const recentText = earlyContext.map(m => m.content || "").join(" ");
      const stageSignalsPayment =
        PAYMENT_STAGE_KEYWORDS_EARLY.test(recentText) ||
        /\b\d{10}\b/.test(recentText) ||
        (/bank|account|transfer|payment|receipt|proof|pay|naira|₦/i.test(recentText) && earlyContext.length > 0);

      if (captionSignalsPayment || stageSignalsPayment) {
        console.log("💳 Step 8a — Payment stage/caption detected BEFORE media resolve. Treating image as receipt.");
        const contactInfo = user.whatsapp?.contacts?.list?.find((c) => c.phone === visitorPhone);
        const customerName = contactInfo?.name || "WhatsApp Customer";

        let earlyMediaUrl = null;
        try {
          earlyMediaUrl = await resolveWhatsAppMediaUrl(message.image.id, user.whatsapp?.accessToken);
        } catch (mediaErr) {
          console.warn("⚠️ Step 8a — Media URL resolve failed (continuing without image URL):", mediaErr.message);
        }

        const receiptResult = await handlePaymentReceipt({
          sellerId: sellerProfile._id,
          sellerUserId: user._id,
          mediaUrl: earlyMediaUrl,
          customerPhone: visitorPhone,
          customerName,
          caption,
          recentMessages: earlyContext,
          imageUrl: null,
          imagePublicId: null,
        });

        if (receiptResult.handled) {
          console.log("💳 Step 8a — Payment receipt handled early. Order:", receiptResult.order._id);
          await SessionModel.updateOne(
            { _id: session._id },
            {
              $set: {
                "payment.expectingPayment": false,
                "payment.paymentProofReceived": true,
                "payment.deflectionCount": 0,
              }
            }
          );
          if (session.payment) {
            session.payment.expectingPayment = false;
            session.payment.paymentProofReceived = true;
            session.payment.deflectionCount = 0;
          }
          await triggerAIResponse({
            session,
            user,
            inboundText: buildPaymentReceiptContext(),
            imageSearchContext: true,
          });
          return { ok: true };
        }
      }
    }

    try {
      const mediaUrl = await resolveWhatsAppMediaUrl(message.image.id, user.whatsapp?.accessToken).catch(() => null);

      const conversationContext = earlyContext;

      const contactInfo = user.whatsapp?.contacts?.list?.find((c) => c.phone === visitorPhone);
      const customerName = contactInfo?.name || "WhatsApp Customer";

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

      // ── Payment receipt check (full flow with resolved media URL) ────
      if (sellerProfile && isExpectingPaymentProof) {
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
          await SessionModel.updateOne(
            { _id: session._id },
            {
              $set: {
                "payment.expectingPayment": false,
                "payment.paymentProofReceived": true,
                "payment.deflectionCount": 0,
              }
            }
          );
          if (session.payment) {
            session.payment.expectingPayment = false;
            session.payment.paymentProofReceived = true;
            session.payment.deflectionCount = 0;
          }
          await triggerAIResponse({
            session,
            user,
            inboundText: buildPaymentReceiptContext(),
            imageSearchContext: true,
          });
          return { ok: true };
        }
      }

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
      const storefrontUrl = sellerProfile?.slug
        ? await buildStorefrontUrl({
            sellerProfile,
            customerPhone: visitorPhone,
          }).catch(() => null)
        : null;

      const fallbackPrompt = storefrontUrl
        ? `[SYSTEM: Customer sent an image${caption ? ` with caption: "${caption}"` : ""}. Politely acknowledge receiving their image. Provide our storefront link ${storefrontUrl} and ask: "Would you like me to share our storefront URL for you to browse our products?"]`
        : `[SYSTEM: Customer sent an image${caption ? ` with caption: "${caption}"` : ""}. Politely acknowledge receiving their image and ask if they would like to browse our products or describe what product they are looking for.]`;

      await triggerAIResponse({
        session,
        user,
        inboundText: fallbackPrompt,
        imageSearchContext: true,
      });
    }

    return { ok: true };
  }

  // ── Step 9: Standard text — trigger AI response ───────────
  let enrichedText = inboundText;

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

    const isExpectingPaymentProof =
      (session?.payment?.expectingPayment === true && session?.payment?.paymentProofReceived !== true) ||
      isPaymentStage(conversationContext, session);

    const PAYMENT_CLAIM_KEYWORDS = /payment|paid|transfer|receipt|screenshot|proof|sent|done|completed|txn|transaction|have paid|i paid/i;
    const isClaimingPaymentText = inboundText && PAYMENT_CLAIM_KEYWORDS.test(inboundText);

    if (isExpectingPaymentProof) {
      const contactInfo = user.whatsapp?.contacts?.list?.find((c) => c.phone === visitorPhone);
      await createPendingOrderFromText({
        sellerId: sellerProfile._id,
        sellerUserId: user._id,
        customerPhone: visitorPhone,
        customerName: contactInfo?.name || "WhatsApp Customer",
        recentMessages: conversationContext,
        inboundText,
        session,
      });
    } else if (isClaimingPaymentText) {
      const inPaymentStage = isPaymentStage(conversationContext, session);
      if (!inPaymentStage) {
        console.log("⚠️ Customer claiming payment via text when expectingPayment and inPaymentStage are both false.");
        const unaskedPaymentNotice = `[SYSTEM-NOTICE: The customer is stating or claiming they sent payment proof or made a transfer ("${inboundText}"), BUT you (the AI agent) have NOT provided any payment details, bank account numbers, or prices to this customer yet, and no order is awaiting payment. Politely explain to the customer that no payment details or order instructions have been provided for an order yet, so this cannot be processed as a payment receipt. Ask them what product or item they would like to order first so you can give them the correct price and bank details.]`;
        enrichedText = `${unaskedPaymentNotice}\n\n${enrichedText}`;
      } else {
        console.log("💳 Customer claiming payment via text in active payment stage. Prompting customer to attach image receipt.");
        const pendingPaymentHint = `[SYSTEM-NOTICE: The customer states they have completed payment or sent proof ("${inboundText}"). Politely acknowledge their message and ask them to attach or send a screenshot / image of their transfer receipt so our team can confirm their payment.]`;
        enrichedText = `${pendingPaymentHint}\n\n${enrichedText}`;
      }
    }
  }

  // ── Step 9.4: Payment stage deflection tracking ─────────────────

  if (session.payment?.expectingPayment === true && session.payment?.paymentProofReceived !== true) {
    const currentDeflection = session.payment?.deflectionCount || 0;
    const newDeflection = currentDeflection + 1;

    if (newDeflection < 3) {
      console.log(`⚠️ Customer sent non-payment text during expectingPayment (Deflection ${newDeflection}/3)`);
      await SessionModel.updateOne(
        { _id: session._id },
        { $set: { "payment.deflectionCount": newDeflection } }
      );
      if (session.payment) session.payment.deflectionCount = newDeflection;

      const deflectionHint = `[SYSTEM-HINT: Customer sent a message instead of payment proof (Deflection ${newDeflection}/3). Acknowledge their message briefly (1 sentence), then gently remind them to send the payment receipt screenshot.]`;
      enrichedText = `${deflectionHint}\n\n${enrichedText}`;
    } else {
      console.log("🔄 Customer reached 3 deflections without sending payment receipt. Resetting expectingPayment flag.");
      await SessionModel.updateOne(
        { _id: session._id },
        {
          $set: {
            "payment.expectingPayment": false,
            "payment.paymentProofReceived": false,
            "payment.deflectionCount": 0,
          }
        }
      );
      if (session.payment) {
        session.payment.expectingPayment = false;
        session.payment.paymentProofReceived = false;
        session.payment.deflectionCount = 0;
      }
    }
  }

  // ── Step 9.5: Semantic product search (seller + text only) ───────────

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
        if (searchContext) enrichedText = searchContext;
        console.log(`✅ Step 9.5 — Product search: ${results.length} match(es) injected into AI context`);
      } else {
        console.log("⚠️  Step 9.5 — Product search: no matches, AI falls back to system prompt catalogue");
      }
    } catch (err) {
      console.warn("⚠️  Step 9.5 — Product search failed (non-fatal):", err.message);
    }
  }

  // ── Step 9.6: Lead qualification hint (business+ plan) ──────────────
  // If leadQualificationEnabled, inject a lightweight scoring instruction
  // so the AI asks qualifying questions before routing to a human.
  if (sellerProfile && isTextMessage && user.paxAI?.leadQualificationEnabled) {
    const sessionMsgCount = session.context?.inboundCount || 0;
    // Only inject for the first few messages (qualification window)
    if (sessionMsgCount <= 3) {
      const qualHint = `[SYSTEM-HINT: Lead qualification is active. If you don't yet know the customer's budget, timeline, or specific need, ask ONE short qualifying question before presenting products. Do not pitch before qualifying.]`;
      enrichedText = `${qualHint}\n\n${enrichedText}`;
      console.log("🎯 Step 9.6 — Lead qualification hint injected");
    }
  }

  // ── Step 9.7: Product recommendations hint (business+ plan) ─────────
  // If productRecommendations is enabled and a customer has already ordered or
  // expressed clear intent, prompt the AI to suggest related/complementary items.
  if (sellerProfile && isTextMessage && user.paxAI?.productRecommendations) {
    const UPSELL_INTENT = /what else|anything else|recommend|similar|also|other|more|add on/i;
    if (UPSELL_INTENT.test(inboundText)) {
      const recHint = `[SYSTEM-HINT: Product recommendations are enabled. The customer seems open to suggestions. Recommend 1–2 complementary or related products from the catalogue above. Be brief and natural — don't read out the full catalogue.]`;
      enrichedText = `${recHint}\n\n${enrichedText}`;
      console.log("🛍️ Step 9.7 — Product recommendation hint injected");
    }
  }

  // ── Step 9.8: Spam auto-handoff check ─────────────────────
  // Only runs for sellers who have it enabled and for text messages.
  // Checks if this customer has sent too many messages with no buying intent.
  if (
    sellerProfile &&
    isTextMessage &&
    sellerProfile.spamAutoHandoff !== false &&
    !session.handoff?.isHandedOff
  ) {
    const threshold = sellerProfile.spamThreshold || 10;
    const sessionInboundCount = session.context?.inboundCount || 0;

    if (sessionInboundCount >= threshold) {
      // Check if any message in this session shows buying intent
      const BUYING_INTENT = /buy|order|price|cost|how much|delivery|pay|purchase|want|interested|available|stock|send me|i need|i want/i;

      const recentForSpam = await AIMessageModel.find({
        sessionId: session.sessionId,
        direction: "inbound",
      }).select("text").lean();

      const hasBuyingIntent = recentForSpam.some(m => BUYING_INTENT.test(m.text || ""));

      if (!hasBuyingIntent) {
        console.log(`🚫 Step 9.8 — Spam detected for ${visitorPhone} (${sessionInboundCount} msgs, no buying intent). Auto-handing off.`);

        // Send one polite farewell message
        const farewellText = `Thanks for reaching out! Our team has noted your messages and will follow up if needed. Have a great day! 😊`;
        await sendWhatsAppAutomationReply({
          phoneNumberId,
          to: visitorPhone,
          text: farewellText,
        });

        // Save the outbound farewell to the inbox
        await AIMessageModel.create({
          messageId: `spam_handoff_${Date.now()}`,
          userId: user._id,
          sessionId: session.sessionId,
          platform: "whatsapp",
          phoneNumberId,
          from: displayPhone,
          to: visitorPhone,
          text: farewellText,
          direction: "outbound",
          senderType: "system",
          status: "sent",
          automation: { isAutoReply: true, workflowId: "spam_handoff" },
        });

        // Hand off the session — AI will skip this contact until restored
        const autoResumeAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h
        await SessionModel.findByIdAndUpdate(session._id, {
          status: "handed_off",
          "handoff.isHandedOff": true,
          "handoff.handedOffAt": new Date(),
          "handoff.reason": "keyword_trigger",
          "handoff.autoResumeAt": autoResumeAt,
        });

        console.log(`✅ Step 9.8 — ${visitorPhone} handed off until ${autoResumeAt.toISOString()}`);
        return { ok: true };
      }
    }
  }

  console.log("🤖 Step 9 — Triggering AI response...");
  await triggerAIResponse({ session, user, inboundText: enrichedText });
  console.log("📊 Step 9 — messagesUsedThisMonth incremented");

  // Push: agent-reply notification (non-blocking)
  sendMobilePush(user._id, {
    type:  "agent_reply",
    title: "🤖 AI Agent Replied",
    body:  `Your agent responded to ${visitorPhone}`,
    data:  { phone: visitorPhone },
  }).catch(() => {}); // fire-and-forget, never block response

  return { ok: true };
};