import { callGeminiAI } from "./gemini.js";
import { callGroqAI } from "./grok.js";

const VALID_INTENTS = [
  "GREETING",
  "GENERAL_BROWSING",
  "PRODUCT_SEARCH",
  "PRODUCT_PRICE",
  "PRODUCT_AVAILABILITY",
  "PRODUCT_DETAILS",
  "PRODUCT_IMAGE",
  "PRODUCT_RECOMMENDATION",
  "SELECT_PRODUCT",
  "ADD_TO_ORDER",
  "REMOVE_FROM_ORDER",
  "VIEW_ORDER",
  "PROVIDE_VARIANT",
  "PROVIDE_DELIVERY_ADDRESS",
  "DELIVERY_ENQUIRY",
  "REQUEST_PAYMENT_DETAILS",
  "PAYMENT_CLAIM",
  "PAYMENT_PROOF",
  "ORDER_STATUS",
  "COMPLAINT",
  "REFUND_REQUEST",
  "CANCEL_ORDER",
  "HUMAN_SUPPORT",
  "BUSINESS_INFORMATION",
  "UNKNOWN",
];

const INTENT_SYSTEM_PROMPT = `
You are a strict, precise customer intent analyzer for an e-commerce & business automation system.
Your job is ONLY to extract customer intent and return a valid, well-formed JSON object.

RULES:
1. NEVER output conversational text. Output ONLY raw valid JSON (no markdown \`\`\`json wrappers).
2. DO NOT make any business decisions, confirm orders, verify payments, or calculate prices.
3. Select EXACTLY one intent from this allowed list:
   ${VALID_INTENTS.join(", ")}

JSON OUTPUT SCHEMA:
{
  "intent": "<ONE_OF_ALLOWED_INTENTS>",
  "productQuery": "<string or null>",
  "productId": "<string or null>",
  "quantity": <number or 1>,
  "requestedLocation": "<string or null>",
  "requestedVariant": {
    "color": "<string or null>",
    "size": "<string or null>"
  },
  "customerWantsPurchase": <boolean>,
  "customerWantsImage": <boolean>,
  "confidence": <number between 0.0 and 1.0>
}
`.trim();

function parseAndValidateIntent(rawText) {
  if (!rawText) return null;

  // Clean potential markdown blocks
  let clean = rawText
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  // Find first { and last }
  const firstBrace = clean.indexOf("{");
  const lastBrace = clean.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    clean = clean.slice(firstBrace, lastBrace + 1);
  }

  try {
    const data = JSON.parse(clean);
    if (!data || typeof data !== "object") return null;

    let intent = String(data.intent || "").toUpperCase().trim();
    if (!VALID_INTENTS.includes(intent)) {
      intent = "UNKNOWN";
    }

    return {
      intent,
      productQuery: typeof data.productQuery === "string" ? data.productQuery.trim() : null,
      productId: typeof data.productId === "string" ? data.productId.trim() : null,
      quantity: typeof data.quantity === "number" && data.quantity > 0 ? Math.floor(data.quantity) : 1,
      requestedLocation: typeof data.requestedLocation === "string" ? data.requestedLocation.trim() : null,
      requestedVariant: {
        color: typeof data.requestedVariant?.color === "string" ? data.requestedVariant.color.trim() : null,
        size: typeof data.requestedVariant?.size === "string" ? data.requestedVariant.size.trim() : null,
      },
      customerWantsPurchase: Boolean(data.customerWantsPurchase),
      customerWantsImage: Boolean(data.customerWantsImage),
      confidence: typeof data.confidence === "number" ? Math.min(1, Math.max(0, data.confidence)) : 0.8,
    };
  } catch (err) {
    return null;
  }
}

export async function analyzeCustomerIntent({ inboundText, conversationContext = [] }) {
  if (!inboundText || typeof inboundText !== "string") {
    return {
      intent: "UNKNOWN",
      productQuery: null,
      productId: null,
      quantity: 1,
      requestedLocation: null,
      requestedVariant: { color: null, size: null },
      customerWantsPurchase: false,
      customerWantsImage: false,
      confidence: 0,
    };
  }

  // Build minimal user prompt for intent analyzer
  const recentHistory = conversationContext
    .slice(-6)
    .map((m) => `${m.role === "user" ? "Customer" : "Assistant"}: ${m.content || m.text || ""}`)
    .join("\n");

  const promptContent = `
Recent Conversation:
${recentHistory || "No previous messages"}

Current Customer Message:
"${inboundText}"

Extract structured intent JSON:`;

  const messages = [{ role: "user", content: promptContent }];

  // Attempt 1: Call Gemini / Groq
  let rawOutput = null;
  try {
    const res = await callGeminiAI({ systemPrompt: INTENT_SYSTEM_PROMPT, messages });
    rawOutput = res?.text;
  } catch (err) {
    console.warn("⚠️ Gemini intent analysis failed, trying Groq fallback:", err.message);
  }

  if (!rawOutput) {
    try {
      const res = await callGroqAI({ systemPrompt: INTENT_SYSTEM_PROMPT, messages });
      rawOutput = res?.text;
    } catch (err) {
      console.warn("⚠️ Groq intent analysis failed:", err.message);
    }
  }

  let parsed = parseAndValidateIntent(rawOutput);

  // Attempt 2: Correction Retry if invalid
  if (!parsed) {
    console.warn("⚠️ Intent analysis output malformed. Retrying with correction instruction...");
    const correctionMessages = [
      ...messages,
      { role: "assistant", content: rawOutput || "" },
      {
        role: "user",
        content: "Your previous response was NOT valid JSON matching the schema. Respond ONLY with valid JSON schema without markdown block.",
      },
    ];

    try {
      const retryRes = await callGeminiAI({ systemPrompt: INTENT_SYSTEM_PROMPT, messages: correctionMessages })
        || await callGroqAI({ systemPrompt: INTENT_SYSTEM_PROMPT, messages: correctionMessages });
      parsed = parseAndValidateIntent(retryRes?.text);
    } catch (err) {
      console.warn("⚠️ Correction retry failed:", err.message);
    }
  }

  // Safe fallback if still invalid
  if (!parsed) {
    console.warn("⚠️ Intent parsing failed twice. Falling back safely to UNKNOWN.");
    return {
      intent: "UNKNOWN",
      productQuery: null,
      productId: null,
      quantity: 1,
      requestedLocation: null,
      requestedVariant: { color: null, size: null },
      customerWantsPurchase: false,
      customerWantsImage: false,
      confidence: 0,
    };
  }

  return parsed;
}
