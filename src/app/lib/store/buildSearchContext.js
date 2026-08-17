/**
 * buildSearchContext.js
 *
 * Formats product search results into a structured [SYSTEM: ...] context
 * block that gets injected as the AI's "user message" for this turn.
 *
 * Mirrors the exact pattern used by buildImageMatchContext.js —
 * the AI receives grounded, real product data and cannot hallucinate.
 *
 * Usage (in handleIncomingWhatsapp.js):
 *
 *   const { results, hasResults } = await searchProducts(sellerId, inboundText);
 *
 *   if (hasResults) {
 *     const context = buildSearchMatchContext(results, inboundText, currency);
 *     await triggerAIResponse({ session, user, inboundText: context });
 *   } else {
 *     await triggerAIResponse({ session, user, inboundText });
 *   }
 */

const currencyMap = {
  NGN: "₦", USD: "$", EUR: "€", GBP: "£",
  GHS: "₵", KES: "KSh", ZAR: "R", CAD: "CA$",
  AUD: "A$", INR: "₹", AED: "AED",
};

/* ─────────────────────────────────────────────────────────────
   MATCH FOUND
───────────────────────────────────────────────────────────── */
export function buildSearchMatchContext(products, originalQuery, currency = "NGN") {
  const symbol = currencyMap[currency?.toUpperCase()] || "₦";

  const productSummaries = products
    .map((p, i) => {
      const effectivePrice = p.discountPrice || p.price;
      const hasDiscount = p.discountPrice && p.discountPrice < p.price;

      const imageList = p.images?.length
        ? p.images.slice(0, 3).map(img => `IMAGE_URL: ${img.url}`).join("\n")
        : "    No images available";

      const variantSummary = p.variants?.length
        ? p.variants.map(v =>
            `    ${v.label}: ${v.options?.map(o => o.value).join(", ")}`
          ).join("\n")
        : null;

      return `Result ${i + 1}:
  Name: ${p.name}
  Price: ${symbol}${Number(effectivePrice).toLocaleString()}${hasDiscount ? ` (was ${symbol}${Number(p.price).toLocaleString()})` : ""}
  Category: ${p.category || "General"}
  Description: ${p.description || "No description"}
  Stock: ${p.stock > 0 ? `${p.stock} available` : "Out of stock"}
  Physical Product: ${p.isPhysical ? "Yes" : "No (digital)"}
  ${p.deliveryFee != null ? `Delivery Fee: ${symbol}${Number(p.deliveryFee).toLocaleString()}` : ""}
  ${p.deliveryTimeFrame ? `Delivery Time: ${p.deliveryTimeFrame}` : ""}
  ${p.locationNotes ? `Delivery Location: ${p.locationNotes}` : ""}
  ${variantSummary ? `Available Options:\n${variantSummary}` : ""}
  Product Images:
${imageList}`;
    })
    .join("\n\n");

  return `[SYSTEM: Customer is looking for products. The following items were found in the catalogue that match their request.
Respond based ONLY on these real results — do not invent products.

Customer's message: "${originalQuery}"

SEARCH RESULTS (${products.length} found):
${productSummaries}

INSTRUCTIONS:
- Recommend the best matching product(s) from the results above
- Do NOT auto-attach images unless the customer explicitly asked to see pictures, photos, or images in their query ("${originalQuery}")
- If the customer explicitly asked to see photos/images and the product has images, include them with [SEND_IMAGE: url] tags
- Mention price, availability, and key details naturally
- If variants exist (sizes, colours), ask which option they want
- If something is out of stock, mention it and suggest the next best result
- If multiple strong matches exist, briefly mention up to 3 — let the customer choose
- Keep the response short and conversational — do not list all products robotically
- Do NOT mention products outside these search results
]`;
}

/* ─────────────────────────────────────────────────────────────
   NO MATCH — pass original message through unchanged
   (We return null so the caller knows to use inboundText directly)
───────────────────────────────────────────────────────────── */
export function buildSearchNoMatchContext(originalQuery) {
  // Returning null signals "no results — let AI handle it from system prompt"
  // The AI already has the full product catalogue in its system prompt,
  // so it can still try to help without the extra context block.
  return null;
}
