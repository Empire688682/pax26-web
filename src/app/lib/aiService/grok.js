import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export const callGroqAI = async ({ systemPrompt, messages }) => {
  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    max_tokens: 300, // WhatsApp replies are 1–3 sentences — no need for 1024
    messages: [
      { role: "system", content: systemPrompt },
      ...messages,
    ],
  });

  const text = response?.choices?.[0]?.message?.content;
  if (!text) return null;

  return {
    text,
    tokensUsed: response?.usage?.total_tokens || 0,
    model: response?.model,
  };
};
// No try/catch — let errors bubble up to triggerAIResponse.js