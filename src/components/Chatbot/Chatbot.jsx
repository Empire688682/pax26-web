"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useGlobalContext } from "@/components/Context";
import ChatbotHeader from "../ChatbotHeader/ChatbotHeader";

/* ── Helpers ─────────────────────────────────────────────── */
const uid = () => crypto.randomUUID();
const CHAT_KEY        = "pax_chats";
const MESSAGE_KEY     = "pax_messages";
const ACTIVE_CHAT_KEY = "pax_active_chat";

const formatTime = (ts) =>
  new Date(ts).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

/* ── Icons ───────────────────────────────────────────────── */
const SendIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
);
const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);
const MenuIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
);
const ChatIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);
const BotIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" y1="16" x2="8" y2="16"/><line x1="16" y1="16" x2="16" y2="16"/>
  </svg>
);
const XIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
  </svg>
);

/* ── Typing indicator ────────────────────────────────────── */
const TypingDots = ({ color }) => (
  <div className="flex items-center gap-1 px-1 py-1">
    {[0, 1, 2].map(i => (
      <span
        key={i}
        className="w-2 h-2 rounded-full animate-bounce"
        style={{ background: color, animationDelay: `${i * 150}ms` }}
      />
    ))}
  </div>
);

/* ── Message bubble ──────────────────────────────────────── */
const MessageBubble = ({ msg, pax26 }) => {
  const isUser = msg.role === "user";
  return (
    <div className={`flex gap-2.5 ${isUser ? "flex-row-reverse" : "flex-row"} items-end`}>
      {/* Avatar */}
      <div
        className="w-7 h-7 rounded-xl flex-shrink-0 flex items-center justify-center text-xs font-bold"
        style={isUser
          ? { background: pax26?.primary, color: "#fff" }
          : { background: `${pax26?.primary}20`, color: pax26?.primary }
        }
      >
        {isUser ? "U" : <BotIcon />}
      </div>

      {/* Bubble */}
      <div className={`group max-w-[75%] sm:max-w-[65%]`}>
        <div
          className="px-4 py-3 rounded-2xl text-sm leading-relaxed"
          style={isUser
            ? { background: pax26?.primary, color: "#fff", borderBottomRightRadius: 4 }
            : { background: pax26?.secondaryBg, color: pax26?.textPrimary, border: `1px solid ${pax26?.border}`, borderBottomLeftRadius: 4 }
          }
        >
          {msg.text}
        </div>
        <p
          className={`text-xs mt-1 opacity-40 ${isUser ? "text-right" : "text-left"}`}
          style={{ color: pax26?.textSecondary }}
        >
          {formatTime(msg.createdAt)}
        </p>
      </div>
    </div>
  );
};

/* ── Sidebar chat item ───────────────────────────────────── */
const ChatItem = ({ chat, active, onClick, onDelete, pax26, collapsed }) => (
  <div
    onClick={onClick}
    className="group flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-150 relative"
    style={active
      ? { background: pax26?.primary, color: "#fff" }
      : { color: pax26?.textSecondary }
    }
    onMouseEnter={e => { if (!active) e.currentTarget.style.background = pax26?.secondaryBg; }}
    onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent"; }}
  >
    <div className="flex-shrink-0" style={{ color: active ? "#fff" : pax26?.textSecondary, opacity: active ? 1 : 0.6 }}>
      <ChatIcon />
    </div>
    {!collapsed && (
      <>
        <span className="text-xs font-medium truncate flex-1">{chat.title}</span>
        {/* Delete btn */}
        <button
          onClick={e => { e.stopPropagation(); onDelete(chat.id); }}
          className="opacity-0 group-hover:opacity-60 hover:!opacity-100 transition-opacity flex-shrink-0"
          style={{ color: active ? "#fff" : pax26?.textSecondary }}
        >
          <TrashIcon />
        </button>
      </>
    )}
  </div>
);

/* ── Main page ───────────────────────────────────────────── */
export default function PaxChatPage() {
  const { pax26 } = useGlobalContext();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [chats, setChats] = useState([]);
  const [chatMessages, setChatMessages] = useState({});
  const [activeChat, setActiveChat] = useState(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  /* ── Init ─────────────────────────────────────────────── */
  useEffect(() => {
    const storedChats    = JSON.parse(localStorage.getItem(CHAT_KEY) || "[]");
    const storedMessages = JSON.parse(localStorage.getItem(MESSAGE_KEY) || "{}");
    const storedActive   = localStorage.getItem(ACTIVE_CHAT_KEY);

    if (storedChats.length === 0) {
      const id = uid();
      const initialChats = [{ id, title: "Welcome to Pax" }];
      const initialMessages = { [id]: [{ id: uid(), role: "ai", text: "Hi 👋 I'm Pax. How can I help you today?", createdAt: Date.now() }] };
      setChats(initialChats);
      setChatMessages(initialMessages);
      setActiveChat(id);
      localStorage.setItem(CHAT_KEY, JSON.stringify(initialChats));
      localStorage.setItem(MESSAGE_KEY, JSON.stringify(initialMessages));
      localStorage.setItem(ACTIVE_CHAT_KEY, id);
    } else {
      setChats(storedChats);
      setChatMessages(storedMessages);
      setActiveChat(storedActive || storedChats[0]?.id);
    }
  }, []);

  /* ── Persist ──────────────────────────────────────────── */
  useEffect(() => { localStorage.setItem(CHAT_KEY, JSON.stringify(chats)); }, [chats]);
  useEffect(() => { localStorage.setItem(MESSAGE_KEY, JSON.stringify(chatMessages)); }, [chatMessages]);
  useEffect(() => { if (activeChat) localStorage.setItem(ACTIVE_CHAT_KEY, activeChat); }, [activeChat]);

  /* ── Auto scroll ─────────────────────────────────────── */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, activeChat, loading]);

  const messages = chatMessages[activeChat] || [];

  /* ── Actions ─────────────────────────────────────────── */
  const startNewChat = useCallback(() => {
    const id = uid();
    const newChat = { id, title: "New chat" };
    setChats(prev => [newChat, ...prev]);
    setChatMessages(prev => ({
      ...prev,
      [id]: [{ id: uid(), role: "ai", text: "Hello 👋 I'm Pax. Ask me anything.", createdAt: Date.now() }],
    }));
    setActiveChat(id);
    setMobileSidebarOpen(false);
    inputRef.current?.focus();
  }, []);

  const deleteChat = useCallback((chatId) => {
    setChats(prev => {
      const next = prev.filter(c => c.id !== chatId);
      if (activeChat === chatId && next.length > 0) setActiveChat(next[0].id);
      return next;
    });
    setChatMessages(prev => { const n = { ...prev }; delete n[chatId]; return n; });
  }, [activeChat]);

  const selectChat = useCallback((id) => {
    setActiveChat(id);
    setMobileSidebarOpen(false);
  }, []);

  const sendMessage = useCallback(() => {
    if (!input.trim() || !activeChat || loading) return;
    const text = input.trim();
    const userMsg = { id: uid(), role: "user", text, createdAt: Date.now() };

    // Update chat title after first user message
    setChats(prev => prev.map(c =>
      c.id === activeChat && c.title === "New chat"
        ? { ...c, title: text.slice(0, 28) + (text.length > 28 ? "…" : "") }
        : c
    ));

    setChatMessages(prev => ({ ...prev, [activeChat]: [...(prev[activeChat] || []), userMsg] }));
    setInput("");
    setLoading(true);

    setTimeout(() => {
      const aiMsg = {
        id: uid(),
        role: "ai",
        text: "This is a mock Pax response. When connected, I'll reply using real AI.",
        createdAt: Date.now(),
      };
      setChatMessages(prev => ({ ...prev, [activeChat]: [...(prev[activeChat] || []), aiMsg] }));
      setLoading(false);
    }, 1200);
  }, [input, activeChat, loading]);

  const clearChat = () => {
    localStorage.removeItem(MESSAGE_KEY);
    localStorage.removeItem(CHAT_KEY);
    localStorage.removeItem(ACTIVE_CHAT_KEY);
    window.location.reload();
  };

  /* ── Sidebar JSX ─────────────────────────────────────── */
  const SidebarContent = ({ collapsed = false }) => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-4 flex-shrink-0"
        style={{ borderBottom: `1px solid ${pax26?.border}` }}
      >
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: pax26?.primary, color: "#fff" }}>
              <BotIcon />
            </div>
            <span className="font-black text-sm" style={{ color: pax26?.textPrimary }}>Pax AI</span>
          </div>
        )}
        <button
          onClick={() => { setSidebarOpen(!sidebarOpen); }}
          className="w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200 flex-shrink-0"
          style={{ background: pax26?.secondaryBg, color: pax26?.textSecondary }}
        >
          <MenuIcon />
        </button>
      </div>

      {/* New chat btn */}
      <div className="px-3 py-3 flex-shrink-0">
        <button
          onClick={startNewChat}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all duration-200"
          style={{ background: `${pax26?.primary}18`, color: pax26?.primary, border: `1px dashed ${pax26?.primary}44` }}
          onMouseEnter={e => e.currentTarget.style.background = `${pax26?.primary}28`}
          onMouseLeave={e => e.currentTarget.style.background = `${pax26?.primary}18`}
        >
          <PlusIcon />
          {!collapsed && "New chat"}
        </button>
      </div>

      {/* Chat list */}
      {!collapsed && (
        <div className="flex-1 overflow-y-auto px-2 space-y-0.5 pb-3">
          {chats.length > 0 && (
            <p className="text-xs font-semibold uppercase tracking-widest px-3 py-2 opacity-30"
              style={{ color: pax26?.textSecondary }}>Recent</p>
          )}
          {chats.map(chat => (
            <ChatItem
              key={chat.id}
              chat={chat}
              active={activeChat === chat.id}
              onClick={() => selectChat(chat.id)}
              onDelete={deleteChat}
              pax26={pax26}
              collapsed={collapsed}
            />
          ))}
        </div>
      )}

      {/* Footer note */}
      {!collapsed && (
        <div className="px-4 py-3 flex-shrink-0" style={{ borderTop: `1px solid ${pax26?.border}` }}>
          <p className="text-xs opacity-30 text-center" style={{ color: pax26?.textSecondary }}>
            Messages stored locally
          </p>
        </div>
      )}
    </div>
  );

  return (
    <div
      className="flex rounded-2xl overflow-hidden shadow-2xl mx-auto max-w-6xl relative"
      style={{
        height: "calc(100vh - 100px)",
        border: `1px solid ${pax26?.border}`,
        background: pax26?.bg,
      }}
    >
      {/* ── Desktop sidebar ───────────────────────────── */}
      <div
        className={`hidden md:flex flex-col flex-shrink-0 transition-all duration-300 ${sidebarOpen ? "w-60" : "w-16"}`}
        style={{ background: pax26?.secondaryBg, borderRight: `1px solid ${pax26?.border}` }}
      >
        <SidebarContent collapsed={!sidebarOpen} />
      </div>

      {/* ── Mobile sidebar overlay ────────────────────── */}
      {mobileSidebarOpen && (
        <div
          className="md:hidden absolute inset-0 z-40 flex"
          style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
          onClick={() => setMobileSidebarOpen(false)}
        >
          <div
            className="w-72 h-full flex flex-col"
            style={{ background: pax26?.secondaryBg }}
            onClick={e => e.stopPropagation()}
          >
            {/* Mobile close button */}
            <div className="flex items-center justify-between px-4 pt-4 pb-2">
              <span className="font-black text-sm" style={{ color: pax26?.textPrimary }}>Pax AI</span>
              <button
                onClick={() => setMobileSidebarOpen(false)}
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: pax26?.bg, color: pax26?.textSecondary }}
              >
                <XIcon />
              </button>
            </div>
            {/* New chat */}
            <div className="px-3 py-2">
              <button
                onClick={startNewChat}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold"
                style={{ background: `${pax26?.primary}18`, color: pax26?.primary, border: `1px dashed ${pax26?.primary}44` }}
              >
                <PlusIcon />New chat
              </button>
            </div>
            {/* Chat list */}
            <div className="flex-1 overflow-y-auto px-2 space-y-0.5 pb-3">
              {chats.map(chat => (
                <ChatItem
                  key={chat.id}
                  chat={chat}
                  active={activeChat === chat.id}
                  onClick={() => selectChat(chat.id)}
                  onDelete={deleteChat}
                  pax26={pax26}
                  collapsed={false}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Chat area ─────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Top bar */}
        <div
          className="flex items-center gap-3 px-4 py-3 flex-shrink-0"
          style={{ borderBottom: `1px solid ${pax26?.border}`, background: pax26?.bg }}
        >
          {/* Mobile hamburger */}
          <button
            className="md:hidden w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: pax26?.secondaryBg, color: pax26?.textSecondary }}
            onClick={() => setMobileSidebarOpen(true)}
          >
            <MenuIcon />
          </button>

          {/* Active chat info */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold truncate" style={{ color: pax26?.textPrimary }}>
              {chats.find(c => c.id === activeChat)?.title || "Pax AI"}
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs opacity-50" style={{ color: pax26?.textSecondary }}>Online</span>
            </div>
          </div>

          <ChatbotHeader onClearChat={clearChat} />
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full gap-4 opacity-40">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ background: pax26?.secondaryBg, color: pax26?.textSecondary }}>
                <BotIcon />
              </div>
              <p className="text-sm" style={{ color: pax26?.textSecondary }}>Start a conversation</p>
            </div>
          )}

          {messages.map(msg => (
            <MessageBubble key={msg.id} msg={msg} pax26={pax26} />
          ))}

          {loading && (
            <div className="flex items-end gap-2.5">
              <div className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${pax26?.primary}20`, color: pax26?.primary }}>
                <BotIcon />
              </div>
              <div className="px-4 py-3 rounded-2xl" style={{ background: pax26?.secondaryBg, border: `1px solid ${pax26?.border}`, borderBottomLeftRadius: 4 }}>
                <TypingDots color={pax26?.primary} />
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input bar */}
        <div
          className="px-4 py-4 flex-shrink-0"
          style={{ borderTop: `1px solid ${pax26?.border}`, background: pax26?.bg }}
        >
          <div
            className="flex items-end gap-3 px-4 py-3 rounded-2xl transition-all duration-200"
            style={{ background: pax26?.secondaryBg, border: `1px solid ${pax26?.border}` }}
            onFocusCapture={e => e.currentTarget.style.borderColor = pax26?.primary + "66"}
            onBlurCapture={e => e.currentTarget.style.borderColor = pax26?.border}
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
              }}
              placeholder="Message Pax…"
              rows={1}
              className="flex-1 bg-transparent outline-none text-sm resize-none leading-relaxed"
              style={{
                color: pax26?.textPrimary,
                maxHeight: 120,
                overflowY: "auto",
              }}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || loading}
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200"
              style={input.trim() && !loading
                ? { background: pax26?.primary, color: "#fff", boxShadow: `0 4px 14px ${pax26?.primary}44` }
                : { background: pax26?.border, color: pax26?.textSecondary, opacity: 0.4, cursor: "not-allowed" }
              }
            >
              <SendIcon />
            </button>
          </div>
          <p className="text-xs text-center mt-2 opacity-30" style={{ color: pax26?.textSecondary }}>
            Enter to send · Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
}