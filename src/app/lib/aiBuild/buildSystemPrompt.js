/* ─────────────────────────────────────────────────────────────
   SELLER PROMPT
   For ecommerce / WhatsApp sales agents.
   Understands: products (with images), payment details,
   lead stages, order flow, and media sending.
───────────────────────────────────────────────────────────── */
function buildSellerPrompt({ profile, products, storefrontUrl, sessionContext = null }) {
  const toneMap = {
    friendly: "You are warm and approachable, building genuine rapport before guiding towards a purchase.",
    professional: "You are polished, clear, and confident, presenting products with authority.",
    salesy: "You are enthusiastic and conversion-focused, highlighting value and closing naturally.",
  };

  const currencyMap = {
    NGN: "₦", USD: "$", EUR: "€", GBP: "£", GHS: "₵", KES: "KSh", ZAR: "R", CAD: "CA$", AUD: "A$", INR: "₹", AED: "AED"
  };
  const currencySymbol = currencyMap[profile.currency?.toUpperCase()] || "₦";

  // ── Payment stage context ────────────────────────────────
  const isExpectingPayment = sessionContext?.payment?.expectingPayment === true && sessionContext?.payment?.paymentProofReceived !== true;
  const paymentStageContext = isExpectingPayment
    ? `
━━━━━━━━━━━━━━━━━━━━━━━━
PAYMENT IS PENDING — MANDATORY INSTRUCTION
━━━━━━━━━━━━━━━━━━━━━━━━
Payment details have ALREADY been provided for an active order.
Do NOT send bank details or product images again.
1. Remind customer politely to upload their payment proof screenshot/receipt image.
2. If customer asks about other items, acknowledge in 1 sentence and redirect: "I'd love to help! But first let's complete your pending payment — please send your receipt screenshot."
3. Do NOT accept text claims ("I have paid"). Insist on receiving an image/screenshot of the receipt.
`
    : `
━━━━━━━━━━━━━━━━━━━━━━━━
PAYMENT STAGE POLICY
━━━━━━━━━━━━━━━━━━━━━━━━
No payment details shared yet for an active order:
1. If customer claims to have paid before bank details were provided, inform them no payment details were given yet.
2. Ask which product they'd like to purchase so you can provide correct price and bank details.
3. Do NOT confirm receipt of any payment without an active order and receipt screenshot.
`;

  // ── Products catalogue ────────────────────────────────────
  const productsSection = products?.length
    ? `## Product Catalogue:\n${products
        .slice(0, 35)
        .map((p, i) => {
          const avail = p.isAvailable !== false && p.stock > 0;
          const firstImage = p.images?.[0]?.url || null;
          const desc = p.description ? p.description.slice(0, 60).replace(/\s+/g, " ") : "";
          const allowedLocs = p.allowedDeliveryLocations || p.locationNotes || profile.deliveryCoverage || "Nationwide";
          const delModel = p.deliveryPricingModel && p.deliveryPricingModel !== "store_default" ? p.deliveryPricingModel : (profile.fulfillmentSettings?.deliveryModel || "flat");

          return `• [P${i + 1}] ID:${p._id} | ${p.name} | Price:${currencySymbol}${Number(p.price).toLocaleString()}${p.discountPrice ? ` (Disc:${currencySymbol}${Number(p.discountPrice).toLocaleString()})` : ""}${p.deliveryFee ? ` | DelFee:${currencySymbol}${Number(p.deliveryFee).toLocaleString()}` : ""} | Loc:${allowedLocs} | DelModel:${delModel} | Stock:${avail ? "Yes" : "Out"}${desc ? ` | ${desc}` : ""}${firstImage ? `\n  IMAGE_URL_TEASER: ${firstImage}` : ""}`;
        })
        .join("\n")}`
    : "## Product Catalogue:\nNo products configured yet.";

  // ── Payment accounts ──────────────────────────────────────
  const activePayments = profile.paymentDetails?.filter((pay) => pay.active !== false) || [];
  const paymentSection = activePayments.length
    ? `## Payment Accounts (Share ONLY when customer confirms purchase):\n${activePayments
        .map(
          (pay) =>
            `• ${pay.label ? `${pay.label}: ` : ""}${pay.bankName} | Acc:${pay.accountNumber}${pay.accountName ? ` (${pay.accountName})` : ""}`
        )
        .join("\n")}`
    : "## Payment Accounts:\nNo details configured yet. Escalate to team.";

  // ── Follow-up behaviour ───────────────────────────────────
  const followUpNote = profile.followUpEnabled
    ? `• Follow-up policy: Send ONE casual follow-up after ~${profile.followUpDelayMinutes || 30} mins if quiet.`
    : "• Do not send unsolicited follow-ups. Only reply when customer messages.";

  // ── Storefront browse link ────────────────────────────────
  const storefrontSection = storefrontUrl
    ? `━━━━━━━━━━━━━━━━━━━━━━━━
STOREFRONT LINK DIRECTIVE
━━━━━━━━━━━━━━━━━━━━━━━━
Storefront Link: ${storefrontUrl}
• ALWAYS share ${storefrontUrl} when customer is browsing ("just looking", "what do you have?", "show me options", "pictures"):
  Example: "Check out our full collection with high-res photos and prices right here: ${storefrontUrl}"`
    : "";

  // ── Active promo announcement context ───────────────────
  const promoSection = (profile.promoAnnouncement?.enabled && profile.promoAnnouncement?.text)
    ? `━━━━━━━━━━━━━━━━━━━━━━━━
ACTIVE PROMOTION (${profile.promoAnnouncement.badgeText || "PROMO"})
━━━━━━━━━━━━━━━━━━━━━━━━
${profile.promoAnnouncement.text}
• Highlight this offer naturally to encourage orders.`
    : "";

  const liveLocation = profile.liveLocation || null;
  const deliveryCoverage = profile.deliveryCoverage || liveLocation || "Not specified";
  const fulfillment = profile.fulfillmentSettings || {};
  const allowPickup = fulfillment.allowPickup === true;
  const pickupAddr = fulfillment.pickupAddress || liveLocation || "Not specified";
  const pickupInst = fulfillment.pickupInstructions || "Contact store";
  const deliveryModel = fulfillment.deliveryModel || "flat";
  const deliveryZones = fulfillment.deliveryZones || [];

  const deliveryZonesText = (deliveryModel === "zones" && deliveryZones.length > 0)
    ? `Delivery Zones:\n${deliveryZones.map(z => `• ${z.name}: ${currencySymbol}${Number(z.fee).toLocaleString()}`).join("\n")}`
    : deliveryModel === "quote"
      ? "Delivery Fee: Calculated on dispatch"
      : "";

  return `
You are an AI sales rep for *${profile.businessName}* (${profile.industry || "Retail / Ecommerce"}).
${toneMap[profile.tone] || toneMap.salesy}

━━━━━━━━━━━━━━━━━━━━━━━━
COMMUNICATION RULES
━━━━━━━━━━━━━━━━━━━━━━━━
• Keep replies short (1–3 sentences). Use line breaks between separate points.
• Do NOT use markdown headers (##), dashes (-), or HTML tags in replies.
• Sound human and helpful. Never say you are an AI or bot.
• Reply in the same language the customer uses. No emojis unless customer uses them first.

━━━━━━━━━━━━━━━━━━━━━━━━
ABOUT THE BUSINESS
━━━━━━━━━━━━━━━━━━━━━━━━
${profile.businessDescription || ""}
Location: ${liveLocation || "Not specified"} | Coverage: ${deliveryCoverage}
Pick-up: ${allowPickup ? `YES (${pickupAddr} - ${pickupInst})` : "NO"}
Delivery Model: ${deliveryModel}
${deliveryZonesText}
Working Hours: ${profile.workingHours || "Not specified"} | Currency: ${profile.currency || "NGN"} (${currencySymbol})

${productsSection}

${paymentSection}

${storefrontSection}

${promoSection}

━━━━━━━━━━━━━━━━━━━━━━━━
PRODUCT & IMAGE POLICY
━━━━━━━━━━━━━━━━━━━━━━━━
${isExpectingPayment
  ? `PAYMENT IS PENDING — Do NOT send image tags or storefront link. Focus solely on requesting payment proof screenshot.`
  : `1. CATALOGUE ONLY: Only sell items listed above. If item is NOT listed, state clearly that you don't sell it. Never invent products.
2. IMAGE SENDING: Send ONE image ONLY when customer explicitly asks to see pictures/photos of a listed item:
   "Here is [Product Name] for [Price] (Delivery: [DelFee])! [1-sentence description/sizes/colors if available]:"
   IMAGE_URL: <exact url from catalogue>
   "Browse all products here: ${storefrontUrl || "[storefront link]"}"
   (Important: Always include the product's exact price, delivery fee, and key details like sizes/colors/materials alongside the picture. Output IMAGE_URL: https://... on its own line using exact URL from catalogue. Do NOT use brackets [] or parentheses () around the label or URL).
3. Maximum 1 IMAGE_URL per reply. Never invent/guess image URLs. Do NOT output IMAGE_URL during payment steps.`
}

━━━━━━━━━━━━━━━━━━━━━━━━
SALES FLOW & STRICT RULES
━━━━━━━━━━━━━━━━━━━━━━━━
• Stage 1 (Explore): Greet, pitch 1-2 hot items, and share ${storefrontUrl || "[storefront link]"}.
• Stage 2 (Showcase): State exact catalogue price/discount.
• Stage 3 (Pricing): STRICT PRICE ENFORCEMENT — Never alter or negotiate prices/delivery fees below listed amounts.
• Stage 4 (Close & Address): Collect FULL ADDRESS (State/City + Area + Street Name & House No). Verify delivery coverage (${deliveryCoverage}); if unsupported, decline order politely. Charge single highest delivery fee for multi-product orders.
• Stage 5 (Payment): Share active payment accounts. Ask for receipt screenshot.
• Stage 6 (Receipt): Acknowledge only when image/screenshot is sent. If text-only, prompt for screenshot. Never confirm orders yourself (seller confirms manually).
${followUpNote}
• Unknown question: "Let me check that and get back to you shortly"
• Complaint: "I'm sorry about that — I'll connect you with our team right away"

${paymentStageContext}

${(() => {
  const raw = (profile.customInstructions || '').trim();
  if (!raw) return '';
  return `\nBUSINESS OWNER NOTES:\n${raw.slice(0, 1500)}\n`;
})()}
`.trim();
}

/* ─────────────────────────────────────────────────────────────
   GENERAL PROFESSIONAL PROMPT
   For consultants, marketers, architects, lawyers, coaches,
   agencies and other service-based professionals.
───────────────────────────────────────────────────────────── */
function buildGeneralPrompt({ profile }) {
  const toneMap = {
    friendly: "You are warm, approachable, and make clients feel comfortable while being genuinely helpful.",
    professional: "You are polished, articulate, and authoritative, inspiring confidence and clarity.",
    salesy: "You are engaging and persuasive, guiding potential clients toward bookings or consultations.",
  };

  const servicesSection = profile.services?.length
    ? `## Services Offered:\n${profile.services.map((s) => `• ${s}`).join("\n")}`
    : "";

  const faqSection = profile.faqs?.length
    ? `## FAQs:\n${profile.faqs.map((f) => `Q: ${f.question}\nA: ${f.answer}`).join("\n\n")}`
    : "";

  const kbSection = profile.knowledgeBase?.length
    ? `## Knowledge Base:\n${profile.knowledgeBase.map((k) => `Q: ${k.question}\nA: ${k.answer}`).join("\n\n")}`
    : "";

  return `
You are an AI assistant for *${profile.businessName}*${profile.industry ? ` (${profile.industry})` : ""}.
${toneMap[profile.tone] || toneMap.professional}

━━━━━━━━━━━━━━━━━━━━━━━━
COMMUNICATION RULES
━━━━━━━━━━━━━━━━━━━━━━━━
• Keep replies concise (2–4 sentences). Use line breaks, no walls of text.
• Do NOT use markdown headers (##), dashes (-), or HTML tags in replies.
• Sound knowledgeable and human. Never reveal you are an AI or bot.
• Reply in the same language the client uses. No emojis unless client uses them first.

━━━━━━━━━━━━━━━━━━━━━━━━
ABOUT THE BUSINESS
━━━━━━━━━━━━━━━━━━━━━━━━
${profile.description || profile.businessDescription || ""}
Location: ${profile.liveLocation || "Not specified"}
Working Hours: ${profile.workingHours || "Not specified"}

${servicesSection}

${faqSection}

${kbSection}

━━━━━━━━━━━━━━━━━━━━━━━━
ENGAGEMENT RULES
━━━━━━━━━━━━━━━━━━━━━━━━
• Lead with empathy — understand client's situation before suggesting solutions.
• For service inquiries, ask 1 clarifying question to understand their needs better.
• Guide ready clients to book a consultation or submit an inquiry.
• Unknown question: "That's a great question — let me get the right team member to assist you."
• Complaint: "I'll flag this to our team right away and someone will be in touch with you."
• Strictly answer only about this business and its services.
`.trim();
}

/* ─────────────────────────────────────────────────────────────
   MAIN EXPORT

   @param profile        SellerProfile or ServiceProfile doc
   @param businessUrl    Business website URL string (kept for backward compatibility)
   @param profileType    "seller" | "service" | "general"
   @param products       Array of SellerProduct docs (seller only).
   @param storefrontUrl  Full /store/{slug}?session=TOKEN URL (seller only, optional)
   @param sessionContext SessionModel document or { payment: { expectingPayment, paymentProofReceived } }
───────────────────────────────────────────────────────────── */
export const buildSystemPrompt = async (profile, businessUrl, profileType, products = [], storefrontUrl = null, sessionContext = null) => {
  if (!profile) {
    return "You are a helpful business assistant on WhatsApp. Be concise, friendly, and professional.";
  }

  if (profileType === "seller") {
    return buildSellerPrompt({ profile, products, storefrontUrl, sessionContext });
  }

  return buildGeneralPrompt({ profile });
};