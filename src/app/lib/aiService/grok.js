import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export const callGroqAI = async ({ systemPrompt, messages }) => {
  const modelsToTry = [
    "llama-3.3-70b-versatile",
    "llama-3.1-8b-instant",
    "llama3-8b-8192",
    "llama3-70b-8192",
    "gemma2-9b-it",
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