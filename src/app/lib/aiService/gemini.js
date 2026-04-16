import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const callGeminiAI = async ({ systemPrompt, messages }) => {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    systemInstruction: systemPrompt,
  });

  const lastMessage = messages[messages.length - 1].content;

  // Gemini requires history to start with 'user' and alternate roles
  const historyMessages = messages.slice(0, -1).map(m => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  // ✅ Drop leading assistant messages until we start with 'user'
  while (historyMessages.length > 0 && historyMessages[0].role !== "user") {
    historyMessages.shift();
  }

  const chat = model.startChat({ history: historyMessages });
  const result = await chat.sendMessage(lastMessage);
  const text = result.response.text();

  if (!text) return null;

  return {
    text,
    tokensUsed: result?.response?.usageMetadata?.totalTokenCount || 0,
    model: "gemini-2.0-flash",
  };
};