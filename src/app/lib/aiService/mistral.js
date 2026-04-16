import { Mistral } from "@mistralai/mistralai";

const mistral = new Mistral({
  apiKey: process.env.MISTRAL_API_KEY,
});

export const callMistralAI = async ({ systemPrompt, messages }) => {
  const response = await mistral.chat.complete({
    model: "mistral-small-latest", // free tier model
    maxTokens: 1024,
    messages: [
      { role: "system", content: systemPrompt },
      ...messages,
    ],
  });

  const text = response?.choices?.[0]?.message?.content;
  if (!text) return null;

  return {
    text,
    tokensUsed: response?.usage?.totalTokens || 0,
    model: response?.model,
  };
};