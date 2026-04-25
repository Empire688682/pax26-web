/**
 * buildImageMatchContext.js
 *
 * Called AFTER handleCustomerImage() returns matched products.
 * Builds a context string to inject into the AI message so it can
 * respond accurately based on real matched data — no hallucination.
 *
 * Usage in your webhook handler (after handleCustomerImage):
 *
 *   const { matches, hasMatches, customerImageUrl } = await handleCustomerImage({...});
 *
 *   const userMessage = hasMatches
 *     ? buildImageMatchContext(matches, customerImageUrl)
 *     : buildImageNoMatchContext();
 *
 *   // Then pass userMessage to your AI as the latest user turn
 */

const currencyMap = {
    NGN: "₦",
    USD: "$",
    GBP: "£",
};

/* ─────────────────────────────────────────────────────────────
   MATCH FOUND: Build a rich context message for the AI
   The AI receives this as the "user message" so it knows
   exactly which products matched and can respond truthfully.
───────────────────────────────────────────────────────────── */
export function buildImageMatchContext(matches, customerImageUrl, currency = "NGN") {
    const symbol = currencyMap[currency] || "₦";

    const productSummaries = matches
        .map((p, i) => {
            const imageList = p.images?.length
                ? p.images.slice(0, 3).map((img) => `    [SEND_IMAGE: ${img.url}]`).join("\n")
                : "    No images available";

            return `Match ${i + 1}:
  Name: ${p.name}
  Price: ${symbol}${Number(p.price).toLocaleString()}
  Category: ${p.category || "General"}
  Description: ${p.description || "No description"}
  Stock: ${p.stock > 0 ? `${p.stock} available` : "Out of stock"}
  Product Images:
${imageList}`;
        })
        .join("\n\n");

    return `[SYSTEM: Customer sent an image looking for a product. 
The image has been analysed and the following real products from the catalogue were found as visual matches.
Respond to the customer based ONLY on these results. Do not invent or suggest products not listed here.

Customer's image: ${customerImageUrl}

MATCHED PRODUCTS:
${productSummaries}

INSTRUCTIONS:
- Tell the customer you found something that looks like what they sent
- Describe the top match briefly (name, price, availability)
- Send the product images using the [SEND_IMAGE: url] tags above
- If more than one match, mention the alternatives briefly
- If the top match is out of stock, mention it and offer the alternative
- Ask if this is what they were looking for
]`;
}

/* ─────────────────────────────────────────────────────────────
   NO MATCH: Tell the AI honestly that nothing was found
───────────────────────────────────────────────────────────── */
export function buildImageNoMatchContext() {
    return `[SYSTEM: Customer sent an image looking for a product.
The image was analysed against the product catalogue but no visual matches were found.

INSTRUCTIONS:
- Tell the customer honestly that you could not find an exact match for what they sent
- Ask them to describe what they are looking for in words (e.g. colour, type, size)
- Do NOT invent or suggest random products — only respond with what is in the catalogue
- You can say something like: "I couldn't find an exact match from your picture — could you describe what you're looking for? Eg. the colour, type, or any details about it?"
]`;
}