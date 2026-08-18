import { Mistral } from "@mistralai/mistralai";

const mistral = new Mistral({
  apiKey: process.env.MISTRAL_API_KEY,
});

export const callMistralAI = async ({ systemPrompt, messages }) => {
  const modelsToTry = [
    "mistral-small-latest",
    "open-mistral-7b",
    "mistral-medium-latest",
  ];

  let lastError = null;

  for (const modelName of modelsToTry) {
    try {
      const response = await mistral.chat.complete({
        model: modelName,
        maxTokens: 1024,
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
      });

      const text = response?.choices?.[0]?.message?.content;
      if (!text) continue;

      return {
        text,
        tokensUsed: response?.usage?.totalTokens || 0,
        model: response?.model || modelName,
      };
    } catch (err) {
      lastError = err;
      const isNotFound =
        err?.status === 404 ||
        err?.message?.includes("not found") ||
        err?.message?.includes("404");

      console.warn(`⚠️ Mistral model ${modelName} failed: ${err?.message || err}`);
      if (isNotFound) continue;
      throw err;
    }
  }

  if (lastError) throw lastError;
  return null;
};