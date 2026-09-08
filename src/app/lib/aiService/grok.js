import Groq from "groq-sdk";

export const callGroqAI = async ({ systemPrompt, messages }) => {
  const apiKey = (process.env.GROQ_API_KEY || "").trim().replace(/^["']|["']$/g, "");
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is missing or empty");
  }

  const groq = new Groq({ apiKey });

  const modelsToTry = [
    "groq/compound",
    "groq/compound-mini",
    "openai/gpt-oss-120b",
    "openai/gpt-oss-20b",
  ];

  let lastError = null;

  for (const modelName of modelsToTry) {
    try {
      const response = await groq.chat.completions.create({
        model: modelName,
        max_tokens: 300, // WhatsApp replies are 1–3 sentences — no need for 1024
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
      });

      const text = response?.choices?.[0]?.message?.content;
      if (!text) continue;

      return {
        text,
        tokensUsed: response?.usage?.total_tokens || 0,
        model: response?.model || modelName,
      };
    } catch (err) {
      lastError = err;
      console.warn(`⚠️ Groq model ${modelName} failed: ${err?.message || err}`);

      // Stop trying only on invalid API key / authentication errors (401)
      if (err?.status === 401 || err?.message?.includes("Invalid API Key")) {
        throw err;
      }

      // For all other errors (model_not_found, model_decommissioned, 400, 404, 429, etc.), try next model
      continue;
    }
  }

  if (lastError) throw lastError;
  return null;
};