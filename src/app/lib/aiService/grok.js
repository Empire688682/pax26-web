// lib/callAI.js

import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export const callGroqAI = async ({ systemPrompt, messages }) => {
  try {
    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      max_tokens: 1024,
      messages: [
        { role: "system", content: systemPrompt },
        ...messages
      ]
    });

    return {
      text: response.choices[0].message.content,
      tokensUsed: response.usage.total_tokens,
      model: response.model
    };

  } catch (error) {
    console.error("Groq AI call failed:", error);
    return null;
  }
};