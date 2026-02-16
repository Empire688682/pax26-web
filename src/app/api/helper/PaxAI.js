import OpenAI from "openai";

export async function getAIResponse(userText) {
  try {
    if (!userText) return "No input provided.";

    if (
      !process.env.OPENAI_API_KEY ||
      process.env.OPENAI_API_KEY === "not set"
    ) {
      return `PaxAI is still in development mode. You said: "${userText}"`;
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: userText },
      ],
      temperature: 0.7,
    });

    return response.choices?.[0]?.message?.content
      || "No response from AI.";
  } catch (error) {
    console.error("getAIResponse error:", error);
    return `PaxAI is in development mode. You said: "${userText}"`;
  }
}
