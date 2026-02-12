"use client";

import { useEffect, useState } from "react";
import { Send, Plus, Menu, MessageSquare } from "lucide-react";
import { useGlobalContext } from "@/components/Context";
import ChatbotHeader from "../ChatbotHeader/ChatbotHeader";


/* ------------------ HELPERS ------------------ */
const uid = () => crypto.randomUUID();

/* ------------------ STORAGE KEYS ------------------ */
const CHAT_KEY = "pax_chats";
const MESSAGE_KEY = "pax_messages";
const ACTIVE_CHAT_KEY = "pax_active_chat";

/* ------------------ PAGE ------------------ */
export default function PaxChatPage() {
  const { pax26 } = useGlobalContext();

  /* ------------------ STATE ------------------ */
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [chats, setChats] = useState([]);
  const [chatMessages, setChatMessages] = useState({});
  const [activeChat, setActiveChat] = useState(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  /* ------------------ INIT FROM LOCALSTORAGE ------------------ */
  useEffect(() => {
    const storedChats = JSON.parse(localStorage.getItem(CHAT_KEY) || "[]");
    const storedMessages = JSON.parse(localStorage.getItem(MESSAGE_KEY) || "{}");
    const storedActiveChat = localStorage.getItem(ACTIVE_CHAT_KEY);

    if (storedChats.length === 0) {
      const firstChatId = uid();
      const initialChats = [{ id: firstChatId, title: "Welcome to Pax" }];
      const initialMessages = {
        [firstChatId]: [
          {
            id: uid(),
            role: "ai",
            text: "Hi 👋 I’m Pax. How can I help you today?",
            createdAt: Date.now(),
          },
        ],
      };

      setChats(initialChats);
      setChatMessages(initialMessages);
      setActiveChat(firstChatId);

      localStorage.setItem(CHAT_KEY, JSON.stringify(initialChats));
      localStorage.setItem(MESSAGE_KEY, JSON.stringify(initialMessages));
      localStorage.setItem(ACTIVE_CHAT_KEY, firstChatId);
    } else {
      setChats(storedChats);
      setChatMessages(storedMessages);
      setActiveChat(storedActiveChat || storedChats[0]?.id);
    }
  }, []);

  /* ------------------ PERSIST ------------------ */
  useEffect(() => {
    localStorage.setItem(CHAT_KEY, JSON.stringify(chats));
  }, [chats]);

  useEffect(() => {
    localStorage.setItem(MESSAGE_KEY, JSON.stringify(chatMessages));
  }, [chatMessages]);

  useEffect(() => {
    if (activeChat) {
      localStorage.setItem(ACTIVE_CHAT_KEY, activeChat);
    }
  }, [activeChat]);

  const messages = chatMessages[activeChat] || [];

  /* ------------------ ACTIONS ------------------ */
  const startNewChat = () => {
    const chatId = uid();

    const newChat = {
      id: chatId,
      title: "New chat",
    };

    setChats((prev) => [newChat, ...prev]);
    setChatMessages((prev) => ({
      ...prev,
      [chatId]: [
        {
          id: uid(),
          role: "ai",
          text: "Hello 👋 I’m Pax. Ask me anything.",
          createdAt: Date.now(),
        },
      ],
    }));
    setActiveChat(chatId);
  };

  const sendMessage = () => {
    if (!input.trim() || !activeChat) return;

    const userMessage = {
      id: uid(),
      role: "user",
      text: input,
      createdAt: Date.now(),
    };

    setChatMessages((prev) => ({
      ...prev,
      [activeChat]: [...(prev[activeChat] || []), userMessage],
    }));

    setInput("");
    setLoading(true);

    // 🔁 MOCK AI RESPONSE
    setTimeout(() => {
      const aiMessage = {
        id: uid(),
        role: "ai",
        text:
          "This is a mock Pax response. When connected, I’ll reply using real AI.",
        createdAt: Date.now(),
      };

      setChatMessages((prev) => ({
        ...prev,
        [activeChat]: [...(prev[activeChat] || []), aiMessage],
      }));

      setLoading(false);
    }, 1200);
  };

   const clearChat = () => {
    localStorage.removeItem("pax_chat_messages");
    window.location.reload();
  };

  /* ------------------ UI ------------------ */
  return (
    <div
      className="h-[90vh] flex rounded-xl overflow-hidden mx-auto max-w-7xl shadow-lg"
      style={{ backgroundColor: pax26.secondaryBg }}
    >
      {/* ============ SIDEBAR ============ */}
      <div
        className={`transition-all duration-300 border-r border-gray-300 ${
          sidebarOpen ? "w-64" : "w-16"
        }`}
        style={{ backgroundColor: pax26.card }}
      >
        {/* Header */}
        <div className="p-4 flex items-center justify-between">
          {sidebarOpen && (
            <h1
              className="text-lg font-semibold"
              style={{ color: pax26.textPrimary }}
            >
              Pax
            </h1>
          )}
          <Menu
            size={18}
            className="cursor-pointer"
            style={{ color: pax26.textPrimary }}
            onClick={() => setSidebarOpen(!sidebarOpen)}
          />
        </div>

        {/* New Chat */}
        <div
          onClick={startNewChat}
          className="mx-3 mb-4 flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer text-sm"
          style={{
            backgroundColor: pax26.secondaryBg,
            color: pax26.textPrimary,
          }}
        >
          <Plus size={16} />
          {sidebarOpen && "New chat"}
        </div>

        {/* Chat History */}
        <div className="px-2 space-y-1 overflow-y-auto max-h-[60vh]">
          {chats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => setActiveChat(chat.id)}
              className={`flex items-center text-gray-500 gap-2 px-3 py-2 rounded-lg cursor-pointer text-sm transition ${
                activeChat === chat.id
                  ? "bg-blue-600 text-white text-white"
                  : "hover:bg-white/10"
              }`}
            >
              <MessageSquare size={14} />
              {sidebarOpen && chat.title}
            </div>
          ))}
        </div>

        {sidebarOpen && (
          <div className="p-3 text-xs opacity-70 text-center">
            Messages reset daily
          </div>
        )}
      </div>

      {/* ============ CHAT ============ */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <ChatbotHeader onClearChat={clearChat}/>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[70%] px-4 py-3 rounded-2xl text-sm ${
                  msg.role === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-white/10"
                }`}
                style={{
                  color:
                    msg.role === "user"
                      ? "#fff"
                      : pax26.textPrimary,
                }}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {loading && (
            <p className="text-xs opacity-60">Pax is typing…</p>
          )}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-300 flex gap-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Message Pax…"
            className="flex-1 rounded-xl px-4 py-2 bg-transparent border border-gray-300 outline-none"
            style={{ color: pax26.textPrimary }}
          />
          <button
            onClick={sendMessage}
            className="bg-blue-600 text-white px-4 rounded-xl flex items-center gap-2"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
