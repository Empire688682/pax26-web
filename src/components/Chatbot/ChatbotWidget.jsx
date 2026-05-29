"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useGlobalContext } from "@/components/Context";

/* ── Constants ───────────────────────────────────────────── */
const SESSION_KEY = "pax26_chat_session_id";

/* ── Helpers ─────────────────────────────────────────────── */
const formatTime = (ts) =>
  new Date(ts).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

const makeId = () => crypto.randomUUID();

/* ── SVG Icons ───────────────────────────────────────────── */
const ChatBubbleIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const CloseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const SendIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

const BotIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="10" rx="2" />
    <circle cx="12" cy="5" r="2" />
    <path d="M12 7v4" />
    <line x1="8" y1="16" x2="8" y2="16" />
    <line x1="16" y1="16" x2="16" y2="16" />
  </svg>
);

/* ── Typing indicator ────────────────────────────────────── */
const TypingDots = ({ color }) => (
  <div className="flex items-center gap-1 px-1 py-1">
    {[0, 1, 2].map((i) => (
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
        style={
          isUser
            ? { background: pax26?.primary, color: "#fff" }
            : { background: `${pax26?.primary}20`, color: pax26?.primary }
        }
      >
        {isUser ? "U" : <BotIcon />}
      </div>

      {/* Bubble */}
      <div className="max-w-[75%] sm:max-w-[70%]">
        <div
          className="px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap"
          style={
            isUser
              ? {
                  background: pax26?.primary,
                  color: "#fff",
                  borderBottomRightRadius: 4,
                }
              : {
                  background: pax26?.secondaryBg,
                  color: pax26?.textPrimary,
                  border: `1px solid ${pax26?.border}`,
                  borderBottomLeftRadius: 4,
                }
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

/* ── Main widget ─────────────────────────────────────────── */
export default function ChatbotWidget() {
  const { pax26 } = useGlobalContext();

  /* ── State ───────────────────────────────────────────── */
  const [isOpen, setIsOpen] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const [historyError, setHistoryError] = useState(null);
  const [rateLimitInfo, setRateLimitInfo] = useState({ count: 0, max: 20, windowExpiry: null });

  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  /* ── 7.2 Session ID management ───────────────────────── */
  useEffect(() => {
    let sid = null;
    try {
      sid = localStorage.getItem(SESSION_KEY);
      if (!sid) {
        sid = makeId();
        localStorage.setItem(SESSION_KEY, sid);
      }
    } catch {
      // localStorage unavailable (e.g. private browsing) — use in-memory ID
      sid = makeId();
    }
    setSessionId(sid);
  }, []);

  /* ── 7.3 Load history on mount ───────────────────────── */
  useEffect(() => {
    if (!sessionId) return;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const loadHistory = async () => {
      try {
        const res = await fetch(
          `/api/chatbot/history?sessionId=${encodeURIComponent(sessionId)}`,
          { signal: controller.signal }
        );
        if (!res.ok) throw new Error("History fetch failed");
        const data = await res.json();
        if (data.messages && data.messages.length > 0) {
          setMessages(
            data.messages.map((m) => ({
              id: makeId(),
              role: m.role,
              text: m.text,
              createdAt: m.createdAt ? new Date(m.createdAt).getTime() : Date.now(),
            }))
          );
        } else {
          // No history — show welcome message
          setMessages([
            {
              id: makeId(),
              role: "assistant",
              text: "👋 Hi! I'm the Pax26 assistant. Ask me anything about our services — airtime, data, electricity, TV subscriptions, AI automation, and more.",
              createdAt: Date.now(),
            },
          ]);
        }
      } catch (err) {
        if (err.name !== "AbortError") {
          setHistoryError("Couldn't load previous messages. You can still chat below.");
        } else {
          setHistoryError("History load timed out. You can still chat below.");
        }
        // Show welcome message even on error
        setMessages([
          {
            id: makeId(),
            role: "assistant",
            text: "👋 Hi! I'm the Pax26 assistant. Ask me anything about our services.",
            createdAt: Date.now(),
          },
        ]);
      } finally {
        clearTimeout(timeout);
      }
    };

    loadHistory();
    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [sessionId]);

  /* ── 7.12 Auto-scroll ────────────────────────────────── */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  /* ── 7.17 Clear unread badge when opened ─────────────── */
  useEffect(() => {
    if (isOpen) setHasUnread(false);
  }, [isOpen]);

  /* ── Textarea auto-resize ────────────────────────────── */
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  }, [input]);

  /* ── 7.16 Send message ───────────────────────────────── */
  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || text.length > 1000 || isLoading || !sessionId) return;

    // Optimistically append user message
    const userMsg = { id: makeId(), role: "user", text, createdAt: Date.now() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chatbot/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, message: text }),
      });

      const data = await res.json();

      if (res.status === 429) {
        const expiry = data.windowExpiry
          ? new Date(data.windowExpiry).toUTCString()
          : "later";
        setMessages((prev) => [
          ...prev,
          {
            id: makeId(),
            role: "assistant",
            text: `⚠️ Daily message limit reached. Your limit resets at ${expiry}.`,
            createdAt: Date.now(),
          },
        ]);
      } else if (!res.ok) {
        setMessages((prev) => [
          ...prev,
          {
            id: makeId(),
            role: "assistant",
            text: "Something went wrong. Please try again.",
            createdAt: Date.now(),
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: makeId(),
            role: "assistant",
            text: data.message,
            createdAt: Date.now(),
          },
        ]);
        if (data.rateLimitInfo) setRateLimitInfo(data.rateLimitInfo);
        // 7.16 — set unread badge if window is closed
        if (!isOpen) setHasUnread(true);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: makeId(),
          role: "assistant",
          text: "Something went wrong. Please try again.",
          createdAt: Date.now(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, sessionId, isOpen]);

  /* ── Responsive window style (7.7) ──────────────────── */
  const windowStyle =
    typeof window !== "undefined" && window.innerWidth < 640
      ? { position: "fixed", inset: 0, zIndex: 9999 }
      : {
          position: "fixed",
          bottom: 24,
          right: 24,
          width: 360,
          height: 520,
          zIndex: 9999,
        };

  const charCount = 1000 - input.length;
  const showCounter = input.length > 800;
  const showRateLimitWarning =
    rateLimitInfo.count >= rateLimitInfo.max - 2 && rateLimitInfo.max > 0;

  return (
    <>
      {/* ── 7.4 Floating Action Button ─────────────────── */}
      <motion.button
        onClick={() => setIsOpen(true)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          zIndex: 9998,
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: pax26?.primary,
          color: "#fff",
          border: "none",
          cursor: "pointer",
          display: isOpen ? "none" : "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: `0 8px 24px ${pax26?.primary}55`,
        }}
        aria-label="Open Pax26 chat assistant"
      >
        <ChatBubbleIcon />

        {/* ── 7.5 Unread badge ─────────────────────────── */}
        {hasUnread && (
          <span
            style={{
              position: "absolute",
              top: 4,
              right: 4,
              width: 12,
              height: 12,
              borderRadius: "50%",
              background: "#ef4444",
              border: "2px solid #fff",
            }}
          />
        )}
      </motion.button>

      {/* ── 7.6 Animated chat window ───────────────────── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="chat-window"
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            style={{
              ...windowStyle,
              background: pax26?.bg,
              border: `1px solid ${pax26?.border}`,
              borderRadius: typeof window !== "undefined" && window.innerWidth < 640 ? 0 : 16,
              boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            {/* ── 7.8 Header ─────────────────────────────── */}
            <div
              style={{
                background: pax26?.primary,
                padding: "14px 16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexShrink: 0,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 10,
                    background: "rgba(255,255,255,0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                  }}
                >
                  <BotIcon />
                </div>
                <div>
                  <p style={{ color: "#fff", fontWeight: 700, fontSize: 14, margin: 0 }}>
                    Pax26 Assistant
                  </p>
                  <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 2 }}>
                    <span
                      style={{
                        width: 7,
                        height: 7,
                        borderRadius: "50%",
                        background: "#4ade80",
                        display: "inline-block",
                      }}
                    />
                    <span style={{ color: "rgba(255,255,255,0.8)", fontSize: 11 }}>Online</span>
                  </div>
                </div>
              </div>

              {/* Close button */}
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  background: "rgba(255,255,255,0.15)",
                  border: "none",
                  borderRadius: 8,
                  width: 32,
                  height: 32,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  cursor: "pointer",
                }}
                aria-label="Close chat"
              >
                <CloseIcon />
              </button>
            </div>

            {/* ── 7.9 History error banner ────────────────── */}
            {historyError && (
              <div
                style={{
                  background: "#fef3c7",
                  borderBottom: "1px solid #fcd34d",
                  padding: "8px 16px",
                  fontSize: 12,
                  color: "#92400e",
                  flexShrink: 0,
                }}
              >
                ⚠️ {historyError}
              </div>
            )}

            {/* ── 7.15 Rate limit warning banner ─────────── */}
            {showRateLimitWarning && (
              <div
                style={{
                  background: "#fef3c7",
                  borderBottom: "1px solid #fcd34d",
                  padding: "8px 16px",
                  fontSize: 12,
                  color: "#92400e",
                  flexShrink: 0,
                }}
              >
                ⚠️ You have {rateLimitInfo.max - rateLimitInfo.count} message
                {rateLimitInfo.max - rateLimitInfo.count === 1 ? "" : "s"} remaining today.
              </div>
            )}

            {/* ── 7.10 Message thread ─────────────────────── */}
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "16px",
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              {messages.map((msg) => (
                <MessageBubble key={msg.id} msg={msg} pax26={pax26} />
              ))}

              {/* ── 7.11 Typing indicator ─────────────────── */}
              {isLoading && (
                <div className="flex items-end gap-2.5">
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 10,
                      background: `${pax26?.primary}20`,
                      color: pax26?.primary,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <BotIcon />
                  </div>
                  <div
                    style={{
                      padding: "10px 14px",
                      borderRadius: 16,
                      borderBottomLeftRadius: 4,
                      background: pax26?.secondaryBg,
                      border: `1px solid ${pax26?.border}`,
                    }}
                  >
                    <TypingDots color={pax26?.primary} />
                  </div>
                </div>
              )}

              {/* ── 7.12 Scroll sentinel ──────────────────── */}
              <div ref={bottomRef} />
            </div>

            {/* ── Input area ──────────────────────────────── */}
            <div
              style={{
                padding: "12px 16px",
                borderTop: `1px solid ${pax26?.border}`,
                background: pax26?.bg,
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-end",
                  gap: 10,
                  padding: "10px 14px",
                  borderRadius: 14,
                  background: pax26?.secondaryBg,
                  border: `1px solid ${pax26?.border}`,
                  transition: "border-color 0.2s",
                }}
                onFocusCapture={(e) =>
                  (e.currentTarget.style.borderColor = `${pax26?.primary}66`)
                }
                onBlurCapture={(e) =>
                  (e.currentTarget.style.borderColor = pax26?.border)
                }
              >
                {/* ── 7.13 Textarea ─────────────────────── */}
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  disabled={isLoading}
                  placeholder="Message Pax26…"
                  rows={1}
                  style={{
                    flex: 1,
                    background: "transparent",
                    border: "none",
                    outline: "none",
                    resize: "none",
                    fontSize: 14,
                    lineHeight: 1.5,
                    color: pax26?.textPrimary,
                    maxHeight: 120,
                    overflowY: "auto",
                    fontFamily: "inherit",
                  }}
                />

                {/* Send button */}
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || input.length > 1000 || isLoading}
                  style={
                    input.trim() && input.length <= 1000 && !isLoading
                      ? {
                          width: 36,
                          height: 36,
                          borderRadius: 10,
                          background: pax26?.primary,
                          color: "#fff",
                          border: "none",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          boxShadow: `0 4px 12px ${pax26?.primary}44`,
                        }
                      : {
                          width: 36,
                          height: 36,
                          borderRadius: 10,
                          background: pax26?.border,
                          color: pax26?.textSecondary,
                          border: "none",
                          cursor: "not-allowed",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          opacity: 0.4,
                        }
                  }
                  aria-label="Send message"
                >
                  <SendIcon />
                </button>
              </div>

              {/* ── 7.14 Character counter ─────────────────── */}
              {showCounter && (
                <p
                  style={{
                    fontSize: 11,
                    marginTop: 4,
                    textAlign: "right",
                    color: charCount < 0 ? "#ef4444" : pax26?.textSecondary,
                  }}
                >
                  {charCount} characters remaining
                </p>
              )}

              <p
                style={{
                  fontSize: 11,
                  textAlign: "center",
                  marginTop: 6,
                  opacity: 0.35,
                  color: pax26?.textSecondary,
                }}
              >
                Enter to send · Shift+Enter for new line
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
