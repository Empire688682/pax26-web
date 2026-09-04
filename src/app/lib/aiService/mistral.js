import { Mistral } from "@mistralai/mistralai";

const mistral = new Mistral({
  apiKey: process.env.MISTRAL_API_KEY,
});

export const callMistralAI = async ({ systemPrompt, messages }) => {
  const modelsToTry = [
    "mistral-small-latest",
    "open-mistral-7b",
    "open-mistral-nemo",
    "mistral-medium-latest",
    "mistral-large-latest",
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
      console.warn(`⚠️ Mistral model ${modelName} failed: ${err?.message || err}`);

      // Stop trying only on invalid API key / authentication errors (401)
      if (err?.status === 401 || err?.raw_status_code === 401 || err?.message?.includes("Unauthorized")) {
        throw err;
      }

      // For all other errors (429 rate limit, 404, 400, etc.), try next model
      continue;
    }
  }

  if (lastError) throw lastError;
  return null;
};