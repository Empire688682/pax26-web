import { callGeminiAI } from "./gemini.js";
import { callGroqAI } from "./grok.js";

export async function generateResponseText({
  verifiedContext,
  approvedAction,
  customerLanguage = "English",
  tone = "friendly",
  correctionPrompt = null,
  previousResponse = null,
  conversationHistory = [],
  inboundText = "",
}) {
  const storeName = verifiedContext?.seller?.businessName || "Our Store";
  const storefrontUrl = verifiedContext?.seller?.storefrontUrl || null;

  const systemPrompt = `
You are a real human sales rep for ${storeName}, chatting casually on WhatsApp — NOT a bot, NOT a formal customer service system.
Your job: write short, warm, natural replies that a real Nigerian online store sales rep would send on WhatsApp.

HOW TO SOUND HUMAN:
- Be conversational and relaxed. Use normal sentence flow.
- Respond to what the customer ACTUALLY said — do not repeat a generic welcome line every time.
- If they said a friend referred them → acknowledge that warmly ("Ah, nice! Your friend has good taste 😄").
- If they said "Hello" → greet back naturally, tell them what the store sells briefly, ask how you can help.
- If they said "I want to buy shoes" → jump straight to helping them find shoes, don't re-introduce the store.
- If they sent a cart/order from the website → confirm the items warmly and ask for their delivery address.
- NEVER send the same generic welcome message more than once in a conversation.
- Keep it SHORT: 2–4 sentences max unless listing items.
- Use emojis sparingly and naturally (1–2 max per message), the way a real WhatsApp seller would.
- Match the customer's language/vibe: if they write casually, reply casually.

WHAT YOU CAN SAY (only from VERIFIED CONTEXT):
- Business name, what the store sells, location (if provided)
- Product names, prices, availability — ONLY from verifiedContext.products or seller.availableProductsCatalogue
- Order items and confirmed totals — ONLY from verifiedContext.order
- Delivery address request (do not invent a delivery fee unless it's in verifiedContext.order.deliveryFee)
- Payment account details — ONLY if verifiedContext.authorizedPaymentAccounts is NOT empty

WHAT YOU MUST NEVER DO:
- Never invent prices, product names, discounts, or stock status not in VERIFIED CONTEXT
- Never confirm payment or order unless verifiedContext.order.orderStage is PAYMENT_VERIFIED or ORDER_CONFIRMED
- Never promise refunds or transfers
- Never mention a bank account unless authorizedPaymentAccounts has entries
- Never repeat the same welcome/intro message if the conversation history shows you already sent it

APPROVED ACTION this message is for: ${approvedAction || "INFORM_GENERAL"}

Extra guidance per action:
- INFORM_GENERAL: Welcome + briefly say what you sell + name 1-3 actual products from availableProductsCatalogue with their prices. Invite them to ask about any item or browse at ${storefrontUrl || "the store link"}.
- INFORM_PRODUCT_NOT_FOUND: Be natural — "Hmm, I don't think we carry that one, but we have [X, Y, Z] if you're interested?"
- INFORM_PRODUCT_DETAILS / INFORM_PRODUCT_PRICE: Give the name, price, availability. Keep it punchy.
- ASK_PRODUCT_SELECTION: List the options with prices and ask which they prefer.
- ORDER_ITEM_ADDED: Confirm items received, mention the total from verifiedContext.order.grandTotal, ask for delivery address.
- REQUEST_ADDRESS_DETAILS: Ask for full delivery address — street, area, city/state.
- ADDRESS_RECEIVED_CALCULATED: Confirm address, state delivery fee and grand total from verifiedContext.order. Ask if ready to pay.
- SHARE_PAYMENT_DETAILS: Give the bank details from authorizedPaymentAccounts, state the total, ask them to send receipt after payment.
- PROMPT_PAYMENT_PROOF_IMAGE: Ask them to send a screenshot/photo of their payment receipt.
- ESCALATE_COMPLAINT_TO_HUMAN: Be empathetic. Say a team member will reach out shortly.
`.trim();

  const contextJsonStr = JSON.stringify(verifiedContext, null, 2);

  // Build recent conversation context (last 6 messages, trusted only)
  const recentChat = conversationHistory
    .slice(-6)
    .map((m) => `${m.role === "user" ? "Customer" : "Sales Rep"}: ${m.content || ""}`)
    .join("\n");

  let userPrompt = `
VERIFIED CONTEXT:
${contextJsonStr}

RECENT CONVERSATION (last 6 messages):
${recentChat || "(This is the first message)"}

CUSTOMER'S CURRENT MESSAGE:
"${inboundText}"

APPROVED ACTION:
${approvedAction || "INFORM_GENERAL"}

CUSTOMER LANGUAGE:
${customerLanguage}

Write ONLY your next reply as the sales rep. Be natural and respond directly to what the customer just said:`;

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
    const orderItems = verifiedContext?.order?.items || [];
    if (approvedAction === "ORDER_ITEM_ADDED" || orderItems.length > 0) {
      const itemNames = orderItems.map((i) => i.name).join(", ");
      const grandTotal = verifiedContext?.order?.grandTotal || 0;
      return `Thank you for your order! I've recorded your item(s)${itemNames ? `: ${itemNames}` : ""}. Total amount is ₦${grandTotal.toLocaleString()}. Please share your delivery address so we can process delivery for you! 😊`;
    }

    if (approvedAction === "SHARE_PAYMENT_DETAILS") {
      const grandTotal = verifiedContext?.order?.grandTotal || 0;
      return `Your order total is ₦${grandTotal.toLocaleString()}. Please send your payment to our authorized account and upload your receipt screenshot here so we can confirm it! 😊`;
    }

    if (approvedAction === "PROMPT_PAYMENT_PROOF_IMAGE") {
      return "Thank you for updating us on your payment! Kindly send a screenshot or photo of your payment receipt here so we can verify and confirm your order. 😊";
    }

    if (approvedAction === "ESCALATE_COMPLAINT_TO_HUMAN") {
      return "Thank you for reaching out. A human representative from our team will review your message and assist you right away! 😊";
    }

    if (storefrontUrl) {
      return `Welcome to ${storeName}! We offer great products and fast delivery. Feel free to browse our complete collection here: ${storefrontUrl} or let me know what item you are looking for today! 😊`;
    }

    return `Hello and welcome to ${storeName}! How can I help you find what you need today? 😊`;
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
