"use client";
import { useEffect, useState } from "react";
import { CardContent } from "@/components/ui/Cards";
import { Button } from "@/components/ui/Button";
import { Bot, Send } from "lucide-react";
import { useGlobalContext } from "@/components/Context";
import Image from "next/image";

export default function AiPreviewTestPage({aiData, previewData}) {
  const { pax26, userData } = useGlobalContext();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { role: "ai", text: `Hi 👋 I’m ${aiData?.aiName} Smart Assist. Ask me anything about your business.` }
  ]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedMessages = localStorage.getItem("aiPreviewMessages");
    if (storedMessages) {
      setMessages(JSON.parse(storedMessages));
    }
    }
  }, []);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    // 🔁 TEMP: Replace with real API call
    setTimeout(() => {
      const aiReply = {
        role: "ai",
        text: "Thanks for your message! This is how your AI assistant will reply to customers."
      };
      setMessages((prev) => [...prev, aiReply]);
      setLoading(false);
      localStorage.setItem("aiPreviewMessages", JSON.stringify([...messages, userMessage, aiReply]));
    }, 1200);
  };

  const clearChat = () => {
    localStorage.removeItem("aiPreviewMessages");
    setMessages([]);
  };

  if (!previewData) {
    return (
      <div className="p-6 space-y-6 w-full md:max-w-3xl min-h-[70vh] rounded-xl mx-auto shadow-lg"
        style={{ backgroundColor: pax26.card, color: pax26.textPrimary }}>
        <h1 className="text-2xl font-semibold" style={{ color: pax26.textPrimary }}>
          AI Preview
        </h1>
        <p className="text-sm" style={{ color: pax26.textSecondary }}>
          No preview available. Please complete all AI <span className="font-bold">Trainings</span> to see the preview and test your AI assistant's responses.
        </p>
      </div>
    );
  }

  return (
    <div
      className="p-6 space-y-6 w-full md:max-w-3xl min-h-[70vh] rounded-xl mx-auto shadow-lg"
      style={{ backgroundColor: pax26.card, color: pax26.textPrimary }}
    >
      {/* Header */}
      <div className="mb-6 border-b flex justify-between border-gray-300 pb-4">
        <div className="flex gap-2 items-center">
          <Image
            src={userData?.profileImage || "/profile-img.png"}
            alt="AI profile"
            width={25}
            height={25}
            style={{
              objectFit: "cover",
              borderRadius: "50%",
            }}
          />
          <h1 className="text-1xl font-semibold">{aiData?.aiName} Agent</h1>
        </div>
        <p onClick={clearChat} className="text-sm cursor-pointer text-muted-foreground">
          Clear
        </p>
      </div>

      <div className="rounded-2xl h-[70vh] flex flex-col">
        {/* Chat Area */}
        <CardContent className="flex-1 overflow-y-auto space-y-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[75%] px-4 py-2 rounded-xl text-sm leading-relaxed ${msg.role === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-white/5 border border-white/10"
                  }`}
              >
                {msg.role === "ai" && (
                  <div className="flex items-center gap-2 mb-1 text-xs text-gray-400">
                    <Bot size={14} /> {aiData?.aiName} AI
                  </div>
                )}
                {msg.text}
              </div>
            </div>
          ))}

          {loading && (
            <div className="text-xs text-gray-400">AI is typing…</div>
          )}
        </CardContent>

        {/* Input Area */}
        <div className="border-t border-gray-300 p-4 flex gap-3">
          <input
            type="text"
            placeholder="Type a customer message…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            className="flex-1 bg-transparent border border-gray-300 rounded-xl px-4 py-2 text-sm outline-none focus:border-blue-500"
          />
          <Button onClick={sendMessage} className="flex items-center gap-2">
            <Send size={16} /> Send
          </Button>
        </div>
      </div>

      {/* Info */}
      <p className="text-xs text-muted-foreground mt-3 text-center">
        This is a preview. Customers will see similar responses on connected channels.
      </p>
    </div>
  );
}
