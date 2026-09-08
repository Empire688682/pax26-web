/**
 * Response Validator & Pre-Send Safeguard Layer
 *
 * Validates AI-generated response text against backend verified context
 * before any message is dispatched to WhatsApp.
 */

/**
 * Extracts true monetary expressions from response text while ignoring
 * non-monetary numbers (quantities, phone numbers, order codes, dates).
 */
export function extractMonetaryAmounts(text) {
  if (!text) return [];

  const monetaryAmounts = [];

  // Pattern 1: Explicit currency symbol or code followed by numbers (e.g., ₦43,500, $50, N29,500, NGN 2,000)
  const explicitCurrencyRegex = /(?:₦|N|NGN|\$|£|€|₵|KSh|R|CA\$|A\$|₹|AED)\s*([\d,]+(?:\.\d{2})?)/gi;
  let match;
  while ((match = explicitCurrencyRegex.exec(text)) !== null) {
    const cleanStr = match[1].replace(/,/g, "");
    const val = parseFloat(cleanStr);
    if (!isNaN(val) && val > 0) {
      monetaryAmounts.push(val);
    }
  }

  // Pattern 2: Numbers followed by currency word (e.g., "30,000 naira", "2000 bucks")
  const trailingCurrencyRegex = /\b([\d,]+(?:\.\d{2})?)\s*(?:naira|dollars|pounds|euros|cedis|shillings|rand|rupees|dirhams)\b/gi;
  while ((match = trailingCurrencyRegex.exec(text)) !== null) {
    const cleanStr = match[1].replace(/,/g, "");
    const val = parseFloat(cleanStr);
    if (!isNaN(val) && val > 0 && !monetaryAmounts.includes(val)) {
      monetaryAmounts.push(val);
    }
  }

  return monetaryAmounts;
}

/**
 * Main Validation Function
 */
export function validateAIResponse(responseText, verifiedContext) {
  if (!responseText || typeof responseText !== "string") {
    return { isValid: false, reason: "Empty response text" };
  }

  const text = responseText.trim();
  const lowerText = text.toLowerCase();

  // 1. PRICE & MONETARY AMOUNT VALIDATION (Safeguard 2)
  const extractedAmounts = extractMonetaryAmounts(text);

  if (extractedAmounts.length > 0) {
    // Collect all allowed monetary amounts from verified context
    const allowedAmounts = new Set();

    if (verifiedContext?.products && Array.isArray(verifiedContext.products)) {
      verifiedContext.products.forEach((p) => {
        if (p.currentPrice) allowedAmounts.add(Number(p.currentPrice));
        if (p.regularPrice) allowedAmounts.add(Number(p.regularPrice));
      });
    }

    if (verifiedContext?.order) {
      if (verifiedContext.order.productsTotal) allowedAmounts.add(Number(verifiedContext.order.productsTotal));
      if (verifiedContext.order.deliveryFee) allowedAmounts.add(Number(verifiedContext.order.deliveryFee));
      if (verifiedContext.order.grandTotal) allowedAmounts.add(Number(verifiedContext.order.grandTotal));

      if (Array.isArray(verifiedContext.order.items)) {
        verifiedContext.order.items.forEach((i) => {
          if (i.unitPrice) allowedAmounts.add(Number(i.unitPrice));
          if (i.lineTotal) allowedAmounts.add(Number(i.lineTotal));
        });
      }
    }

    // Check if any extracted amount is not in allowedAmounts
    for (const amount of extractedAmounts) {
      const isAllowed = Array.from(allowedAmounts).some((allowed) => Math.abs(allowed - amount) < 1);
      if (!isAllowed) {
        const allowedStr = Array.from(allowedAmounts).map((a) => `₦${a.toLocaleString()}`).join(", ");
        return {
          isValid: false,
          reason: `You mentioned monetary amount ₦${amount.toLocaleString()}, but the only authorized amounts are: ${allowedStr || "None"}`,
          failedCheck: "PRICE_VALIDATION",
        };
      }
    }
  }

  // 2. PAYMENT ACCOUNT AUTHORIZATION VALIDATION (Part 9)
  const hasPaymentAccountsAuthorized = Array.isArray(verifiedContext?.authorizedPaymentAccounts) && verifiedContext.authorizedPaymentAccounts.length > 0;
  const mentionsBankAccountNum = /\b\d{10}\b/.test(text) || /account number|bank name|account name|acc no|pay to/i.test(text);

  if (mentionsBankAccountNum && !hasPaymentAccountsAuthorized) {
    return {
      isValid: false,
      reason: "You included bank account or payment details, but payment detail sharing is NOT authorized by backend right now.",
      failedCheck: "PAYMENT_AUTHORIZATION",
    };
  }

  // 3. ORDER / PAYMENT CONFIRMATION CLAIMS VALIDATION (Safeguard 7)
  const isOrderConfirmed = ["PAYMENT_VERIFIED", "ORDER_CONFIRMED"].includes(verifiedContext?.order?.orderStage);

  // Check structured confirmation claims (avoiding false positives like "please confirm your address")
  const claimsPaymentConfirmed = /(?:your\s+payment\s+is\s+|payment\s+has\s+been\s+)(?:confirmed|verified|received and confirmed)/i.test(text);
  const claimsOrderConfirmed = /(?:your\s+order\s+is\s+|order\s+has\s+been\s+)(?:confirmed|placed and confirmed)/i.test(text);

  if ((claimsPaymentConfirmed || claimsOrderConfirmed) && !isOrderConfirmed) {
    return {
      isValid: false,
      reason: "You claimed payment or order is confirmed/verified, but backend order status has NOT reached confirmed state yet.",
      failedCheck: "ORDER_STATUS_VALIDATION",
    };
  }

  // 4. REFUND & FINANCIAL ACTION RESTRICTION VALIDATION (Part 15 & Test H)
  const promisesRefund = /(?:i will|we will|i'll|we'll)\s+(?:refund|transfer|send.*money|reverse.*transfer|cancel.*payment)/i.test(text);
  const isRefundAuthorized = verifiedContext?.approvedAction === "PROCESS_REFUND";

  if (promisesRefund && !isRefundAuthorized) {
    return {
      isValid: false,
      reason: "AI must never promise refunds or money transfers directly without prior backend execution authorization.",
      failedCheck: "REFUND_RESTRICTION",
    };
  }

  // 5. PRODUCT IMAGE URL VALIDATION (Part 16)
  const imageUrlRegex = /(?:IMAGE_URL:|\[SEND_IMAGE:)\s*(https?:\/\/\S+)/gi;
  let imgMatch;
  const allowedImageUrls = new Set(
    (verifiedContext?.products || []).map((p) => p.imageUrl).filter(Boolean)
  );

  while ((imgMatch = imageUrlRegex.exec(text)) !== null) {
    const url = imgMatch[1].replace(/[\]\s]+$/, "");
    if (!allowedImageUrls.has(url)) {
      return {
        isValid: false,
        reason: `Image URL '${url}' is not present in verified product catalogue.`,
        failedCheck: "IMAGE_VALIDATION",
      };
    }
  }

  return { isValid: true, reason: "OK" };
}

/**
 * Deterministic Fallback Message Generator
 */
export function getSafeFallbackMessage(intent = "UNKNOWN") {
  return "I want to make sure I give you the correct information. Please hold on while our team checks this and gets back to you shortly! 😊";
}
