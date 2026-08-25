import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const callGeminiAI = async ({ systemPrompt, messages }) => {
  const modelsToTry = [
    "gemini-1.5-flash-8b",
    "gemini-1.5-flash",
    "gemini-1.5-pro",
    "gemini-2.0-flash-exp",
  ];

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

  let lastError = null;

  for (const modelName of modelsToTry) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: systemPrompt,
      });

      const chat = model.startChat({ history: historyMessages });
      const result = await chat.sendMessage(lastMessage);
      const text = result.response.text();

      if (!text) continue;

      return {
        text,
        tokensUsed: result?.response?.usageMetadata?.totalTokenCount || 0,
        model: modelName,
      };
    } catch (err) {
      lastError = err;
      const isNotFound =
        err?.status === 404 ||
        err?.message?.includes("not found") ||
        err?.message?.includes("404") ||
        err?.message?.includes("not supported");

      console.warn(`⚠️ Gemini model ${modelName} failed: ${err?.message || err}`);
      if (isNotFound) continue; // Try next model in list
      throw err;
    }
  }

  if (lastError) throw lastError;
  return null;
};