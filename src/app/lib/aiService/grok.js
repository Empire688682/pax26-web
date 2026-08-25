import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export const callGroqAI = async ({ systemPrompt, messages }) => {
  const modelsToTry = [
    "llama-3.3-70b-specdec",
    "llama-3.1-70b-versatile",
    "llama-3.1-8b-instant",
    "llama3-8b-8192",
    "mixtral-8x7b-32768",
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
      const isNotFound =
        err?.status === 404 ||
        err?.code === "model_not_found" ||
        err?.error?.code === "model_not_found" ||
        err?.message?.includes("does not exist");

      console.warn(`⚠️ Groq model ${modelName} failed: ${err?.message || err}`);
      if (isNotFound) continue; // Try next model in list
      throw err; // Other errors (auth, quota) bubble up
    }
  }

  if (lastError) throw lastError;
  return null;
};