import { GoogleGenerativeAI } from "@google/generative-ai";

export const callGeminiAI = async ({ systemPrompt, messages }) => {
  const apiKey = (process.env.GEMINI_API_KEY || "").trim().replace(/^["']|["']$/g, "");
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing or empty");
  }

  const genAI = new GoogleGenerativeAI(apiKey);

  const modelsToTry = [
    "gemini-1.5-flash",
    "gemini-1.5-pro",
    "gemini-2.0-flash-exp",
  ];

  const lastMessage = messages[messages.length - 1]?.content || "";

  // Format message history for Gemini (alternating 'user' and 'model' roles)
  const historyMessages = messages.slice(0, -1).map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content || "" }],
  }));

  // Drop leading model/assistant messages until we start with 'user'
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
      const text = result?.response?.text();

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

      console.warn(`⚠️ Gemini model ${modelName} SDK failed: ${err?.message || err}`);
      if (isNotFound) continue;
      
      // If SDK fails, attempt direct v1beta REST API as a fallback
      try {
        const restUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
        const restRes = await fetch(restUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: systemPrompt }] },
            contents: [
              ...historyMessages.map((h) => ({
                role: h.role,
                parts: h.parts,
              })),
              { role: "user", parts: [{ text: lastMessage }] },
            ],
          }),
        });

        if (restRes.ok) {
          const restData = await restRes.json();
          const restText = restData?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (restText) {
            return {
              text: restText,
              tokensUsed: restData?.usageMetadata?.totalTokenCount || 0,
              model: `${modelName}-rest`,
            };
          }
        }
      } catch (restErr) {
        console.warn(`⚠️ Gemini REST fallback failed for ${modelName}:`, restErr.message);
      }
    }
  }

  if (lastError) throw lastError;
  return null;
};