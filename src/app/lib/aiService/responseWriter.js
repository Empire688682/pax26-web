import { callGeminiAI } from "./gemini.js";
import { callGroqAI } from "./grok.js";

export async function generateResponseText({
  verifiedContext,
  approvedAction,
  customerLanguage = "English",
  tone = "friendly",
  correctionPrompt = null,
  previousResponse = null,
}) {
  const storeName = verifiedContext?.seller?.businessName || "Our Store";
  const storefrontUrl = verifiedContext?.seller?.storefrontUrl || null;

  const systemPrompt = `
You are a customer service representative communicating through WhatsApp for *${storeName}*.
Write a short, natural, human response using ONLY the VERIFIED CONTEXT and APPROVED ACTION provided.

STRICT WRITING RULES:
1. Do NOT add, infer, guess, calculate, assume, promise, or invent ANY information.
2. Do NOT invent: products, prices, discounts, stock, delivery fees, totals, payment accounts, payment status, order status, refunds, transfers, or delivery dates.
3. If information is not present in VERIFIED CONTEXT, do NOT mention it.
4. Keep replies concise: 1–3 sentences unless explaining product details or store catalog.
5. Sound human, warm, and engaging. Never say you are an AI or bot.
6. Match customer language: ${customerLanguage}.
7. Do NOT use markdown headers (##), dashes (-), or HTML tags.

ACTION GUIDANCE:
- INFORM_GENERAL: Welcome the customer warmly. Introduce ${storeName} using seller.businessDescription/industry and highlight 1–3 available items or categories from seller.availableProductsCatalogue. If storefrontUrl is available (${storefrontUrl || "N/A"}), mention they can browse all products at that link.
- INFORM_PRODUCT_NOT_FOUND: Politely state that the requested product was not found, but suggest available items from seller.availableProductsCatalogue or invite them to check ${storefrontUrl || "our store"}.
- INFORM_PRODUCT_PRICE / INFORM_PRODUCT_DETAILS: Share exact product details, price, and stock status from verifiedContext.
- ASK_PRODUCT_SELECTION: Present the matching products with prices and ask which option the customer would like.
- ORDER_ITEM_ADDED: Confirm item was added to their order, state grand total from verifiedContext.order.grandTotal, and ask if they want to add more or provide delivery address for checkout.
- REQUEST_ADDRESS_DETAILS: Ask for their complete delivery address (street, area, city/state) to calculate delivery fee.
- ADDRESS_RECEIVED_CALCULATED: State the calculated delivery fee and grand total from verifiedContext.order, and ask if they are ready for payment details.
- SHARE_PAYMENT_DETAILS: Share the authorized payment account details and grand total, then request them to send a payment proof/receipt photo.
- PROMPT_PAYMENT_PROOF_IMAGE: Kindly ask the customer to upload or send an image/screenshot of their payment receipt for verification.
- ESCALATE_COMPLAINT_TO_HUMAN: Acknowledge their concern/request empathetically and state that a human support team member will assist them shortly.
`.trim();

  const contextJsonStr = JSON.stringify(verifiedContext, null, 2);

  let userPrompt = `
VERIFIED CONTEXT:
${contextJsonStr}

APPROVED ACTION:
${approvedAction || "INFORM_GENERAL"}

CUSTOMER LANGUAGE:
${customerLanguage}

Write only the customer-facing response. Keep it concise and natural:`;

  if (correctionPrompt && previousResponse) {
    userPrompt += `

IMPORTANT CORRECTION:
Your previous response failed backend validation for this reason:
"${correctionPrompt}"

Previous Invalid Response:
"${previousResponse}"

Write a corrected response. Use ONLY the verified context values. Do NOT repeat the mistake.`;
  }

  const messages = [{ role: "user", content: userPrompt }];

  let responseText = null;
  try {
    const res = await callGeminiAI({ systemPrompt, messages });
    responseText = res?.text;
  } catch (err) {
    console.warn("⚠️ Gemini response writer failed, trying Groq fallback:", err.message);
  }

  if (!responseText) {
    try {
      const res = await callGroqAI({ systemPrompt, messages });
      responseText = res?.text;
    } catch (err) {
      console.warn("⚠️ Groq response writer failed:", err.message);
    }
  }

  if (!responseText) {
    const catalogCount = verifiedContext?.seller?.availableProductsCatalogue?.length || 0;
    if (catalogCount > 0 && storefrontUrl) {
      return `Welcome to ${storeName}! We have ${catalogCount} products available. You can view our collection and order online here: ${storefrontUrl}. How can I help you today?`;
    }
    return `Welcome to ${storeName}! How can I assist you with our products and services today?`;
  }

  // Strip markdown formatting that WhatsApp doesn't render properly
  return responseText
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/__(.*?)__/g, "$1")
    .replace(/~~(.*?)~~/g, "$1")
    .replace(/`(.*?)`/g, "$1")
    .trim();
}
