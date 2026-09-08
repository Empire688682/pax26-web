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
  const systemPrompt = `
You are a customer service representative communicating through WhatsApp for *${verifiedContext?.seller?.businessName || "Our Store"}*.
Write a short, natural, human response using ONLY the VERIFIED CONTEXT and APPROVED ACTION provided.

STRICT WRITING RULES:
1. Do NOT add, infer, guess, calculate, assume, promise, or invent ANY information.
2. Do NOT invent: products, prices, discounts, stock, delivery fees, totals, payment accounts, payment status, order status, refunds, transfers, or delivery dates.
3. If information is not present in VERIFIED CONTEXT, do NOT mention it.
4. Keep replies concise: 1–3 sentences unless explaining product details.
5. Sound human, warm, and engaging. Never say you are an AI or bot.
6. Match customer language: ${customerLanguage}.
7. Do NOT use markdown headers (##), dashes (-), or HTML tags.
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
    return "Thanks for reaching out! How can I assist you today?";
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
