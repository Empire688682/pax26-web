import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export const callAI = async ({ systemPrompt, messages }) => {
  try {
    const response = await anthropic.messages.create({
      model: "claude-opus-4-5",
      max_tokens: 1024,
      system: systemPrompt || "You are a helpful business assistant. Be concise and friendly. This is a WhatsApp conversation so keep responses short and clear.",
      messages, // already formatted as [{ role: "user"/"assistant", content: "..." }]
    });

    return response.content[0].text;

  } catch (error) {
    console.error("AI call failed:", error);
    return null;
  }
};