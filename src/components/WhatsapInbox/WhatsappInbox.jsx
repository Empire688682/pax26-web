"use client";

import {
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";

import {
  motion,
  AnimatePresence,
} from "framer-motion";

import { useGlobalContext } from "../Context";

/* ─────────────────────────────────────────────
   ICONS
───────────────────────────────────────────── */
const SendIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

const SearchIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const BackIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const DoubleCheckIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
    <polyline points="16 6 9 13" />
  </svg>
);

/* ─────────────────────────────────────────────
   LEAD STAGES
───────────────────────────────────────────── */
const LEAD_STAGES = {
  new: {
    color: "#6366f1",
    bg: "rgba(99,102,241,0.15)",
  },
  contacted: {
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.15)",
  },
  qualified: {
    color: "#3b82f6",
    bg: "rgba(59,130,246,0.15)",
  },
  converted: {
    color: "#10b981",
    bg: "rgba(16,185,129,0.15)",
  },
  lost: {
    color: "#ef4444",
    bg: "rgba(239,68,68,0.15)",
  },
};

/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */
const formatMessageTime = (date) => {
  if (!date) return "";

  return new Date(date).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatConversationTime = (date) => {
  if (!date) return "";

  const now = new Date();
  const msgDate = new Date(date);

  const diff = now - msgDate;

  if (diff < 86400000) {
    return msgDate.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return msgDate.toLocaleDateString([], {
    month: "short",
    day: "numeric",
  });
};

/* ─────────────────────────────────────────────
   LEAD PANEL
───────────────────────────────────────────── */
function LeadPanel({
  contact,
  phone,
  onUpdate,
}) {
  const [stage, setStage] = useState(
    contact?.leadStage || "new"
  );

  const [notes, setNotes] = useState(
    contact?.notes || ""
  );

  useEffect(() => {
    setStage(contact?.leadStage || "new");
    setNotes(contact?.notes || "");
  }, [contact]);

  const saveLead = async () => {
    try {
      await fetch("/api/automations/inbox/lead", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone,
          leadStage: stage,
          notes,
        }),
      });

      onUpdate?.({
        leadStage: stage,
        notes,
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div
      style={{
        width: "320px",
        background: "#111b21",
        borderLeft:
          "1px solid rgba(255,255,255,0.06)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          padding: "16px",
          borderBottom:
            "1px solid rgba(255,255,255,0.06)",
          color: "#e9edef",
          fontWeight: 700,
          fontSize: "15px",
        }}
      >
        Lead Details
      </div>

      <div
        style={{
          padding: "16px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        <div>
          <div
            style={{
              color: "#8696a0",
              fontSize: "11px",
              marginBottom: "8px",
              textTransform: "uppercase",
            }}
          >
            Stage
          </div>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "8px",
            }}
          >
            {Object.keys(LEAD_STAGES).map((s) => {
              const item = LEAD_STAGES[s];

              return (
                <button
                  key={s}
                  onClick={() => setStage(s)}
                  style={{
                    padding: "6px 10px",
                    borderRadius: "999px",
                    border:
                      stage === s
                        ? `1px solid ${item.color}`
                        : "1px solid rgba(255,255,255,0.08)",
                    background:
                      stage === s
                        ? item.bg
                        : "transparent",
                    color:
                      stage === s
                        ? item.color
                        : "#8696a0",
                    fontSize: "11px",
                    cursor: "pointer",
                    fontWeight: 700,
                    textTransform: "capitalize",
                  }}
                >
                  {s}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <div
            style={{
              color: "#8696a0",
              fontSize: "11px",
              marginBottom: "8px",
              textTransform: "uppercase",
            }}
          >
            Notes
          </div>

          <textarea
            value={notes}
            onChange={(e) =>
              setNotes(e.target.value)
            }
            rows={6}
            placeholder="Add note..."
            style={{
              width: "100%",
              borderRadius: "10px",
              border:
                "1px solid rgba(255,255,255,0.08)",
              background: "#202c33",
              color: "#e9edef",
              padding: "12px",
              outline: "none",
              fontSize: "13px",
            }}
          />
        </div>

        <button
          onClick={saveLead}
          style={{
            height: "42px",
            borderRadius: "10px",
            border: "none",
            background: "#00a884",
            color: "white",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Save Lead
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */
export default function WhatsAppInbox() {
  const { pax26 } = useGlobalContext();

  const [conversations, setConversations] =
    useState([]);

  const [messages, setMessages] = useState([]);

  const [selected, setSelected] =
    useState(null);

  const [selectedContact, setSelectedContact] =
    useState(null);

  const [search, setSearch] = useState("");

  const [replyText, setReplyText] =
    useState("");

  const [loading, setLoading] = useState(true);

  const [sending, setSending] = useState(false);

  const [takingOver, setTakingOver] =
    useState(false);

  const [isMobile, setIsMobile] =
    useState(false);

  const [showSidebar, setShowSidebar] =
    useState(true);

  const messagesContainerRef = useRef(null);

  const inputRef = useRef(null);

  /* ─────────────────────────────────────────────
     RESPONSIVE
  ───────────────────────────────────────────── */
  useEffect(() => {
    const check = () => {
      const mobile = window.innerWidth < 900;

      setIsMobile(mobile);

      if (!mobile) {
        setShowSidebar(true);
      }
    };

    check();

    window.addEventListener("resize", check);

    return () =>
      window.removeEventListener("resize", check);
  }, []);

  /* ─────────────────────────────────────────────
     SMART SCROLL
  ───────────────────────────────────────────── */
  const scrollToBottom = (force = false) => {
    const container = messagesContainerRef.current;

    if (!container) return;

    const distanceFromBottom =
      container.scrollHeight -
      container.scrollTop -
      container.clientHeight;

    const isNearBottom =
      distanceFromBottom < 120;

    if (force || isNearBottom) {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  /* ─────────────────────────────────────────────
     FETCH CONVERSATIONS
  ───────────────────────────────────────────── */
  const fetchConversations = useCallback(
    async () => {
      try {
        const res = await fetch(
          "/api/automations/inbox/conversations"
        );

        if (res.ok) {
          const data = await res.json();

          setConversations(data.data || []);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /* ─────────────────────────────────────────────
     FETCH CONTACT
  ───────────────────────────────────────────── */
  const fetchContact = useCallback(
    async (phone) => {
      try {
        const res = await fetch(
          "/api/automations/inbox/lead"
        );

        if (res.ok) {
          const data = await res.json();

          const found = data.data?.find(
            (c) => c.phone === phone
          );

          setSelectedContact(found || null);
        }
      } catch (error) {
        console.error(error);
      }
    },
    []
  );

  /* ─────────────────────────────────────────────
     FETCH MESSAGES
  ───────────────────────────────────────────── */
  const fetchMessages = useCallback(
    async (phone) => {
      if (!phone) return;

      try {
        const res = await fetch(
          `/api/automations/inbox/messages?phone=${encodeURIComponent(
            phone
          )}`
        );

        if (res.ok) {
          const data = await res.json();

          setMessages((prev) => {
            const incoming = data.data || [];

            if (
              JSON.stringify(prev) ===
              JSON.stringify(incoming)
            ) {
              return prev;
            }

            return incoming;
          });
        }
      } catch (error) {
        console.error(error);
      }
    },
    []
  );

  /* ─────────────────────────────────────────────
     INITIAL LOAD
  ───────────────────────────────────────────── */
  useEffect(() => {
    fetchConversations();

    const interval = setInterval(() => {
      fetchConversations();

      if (selected?.phone) {
        fetchMessages(selected.phone);
      }
    }, 8000);

    return () => clearInterval(interval);
  }, [
    fetchConversations,
    fetchMessages,
    selected,
  ]);

  /* ─────────────────────────────────────────────
     SELECT CHAT
  ───────────────────────────────────────────── */
  useEffect(() => {
    if (selected?.phone) {
      fetchMessages(selected.phone);
      fetchContact(selected.phone);
    }
  }, [selected]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  /* ─────────────────────────────────────────────
     SEND MESSAGE
  ───────────────────────────────────────────── */
  const handleSend = async () => {
    if (
      !replyText.trim() ||
      sending ||
      !selected
    ) {
      return;
    }

    const text = replyText.trim();

    setSending(true);

    setReplyText("");

    setMessages((prev) => [
      ...prev,
      {
        _id: `temp_${Date.now()}`,
        text,
        direction: "outbound",
        senderType: "human",
        createdAt: new Date().toISOString(),
      },
    ]);

    scrollToBottom(true);

    try {
      const res = await fetch(
        "/api/automations/inbox/handoff",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "reply",
            phone: selected.phone,
            message: text,
          }),
        }
      );

      if (res.ok) {
        fetchMessages(selected.phone);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  /* ─────────────────────────────────────────────
     TAKE OVER / HANDBACK
  ───────────────────────────────────────────── */
  const handleHandoff = async (action) => {
    if (!selected) return;

    setTakingOver(true);

    try {
      const res = await fetch(
        "/api/automations/inbox/handoff",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action,
            phone: selected.phone,
          }),
        }
      );

      if (res.ok) {
        setSelected((prev) => ({
          ...prev,
          isHandedOff:
            action === "takeover",
        }));

        setConversations((prev) =>
          prev.map((c) =>
            c.phone === selected.phone
              ? {
                  ...c,
                  isHandedOff:
                    action === "takeover",
                }
              : c
          )
        );
      }
    } catch (error) {
      console.error(error);
    } finally {
      setTakingOver(false);
    }
  };

  /* ─────────────────────────────────────────────
     ENTER SEND
  ───────────────────────────────────────────── */
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  /* ─────────────────────────────────────────────
     FILTER
  ───────────────────────────────────────────── */
  const filteredConversations =
    conversations.filter((conv) => {
      if (!search) return true;

      return conv.phone
        .toLowerCase()
        .includes(search.toLowerCase());
    });

  const selectedConv = selected
    ? conversations.find(
        (c) => c.phone === selected.phone
      )
    : null;

  return (
    <div
      style={{
        width: "100%",
        height: "100dvh",
        display: "flex",
        overflow: "hidden",
        background: "#0b141a",
        position: "relative",
      }}
      className="rounded-lg"
    >
      {/* GLOBAL CSS */}
      <style>{`
        * {
          box-sizing: border-box;
        }

        ::-webkit-scrollbar {
          width: 6px;
        }

        ::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.08);
          border-radius: 999px;
        }
      `}</style>

      {/* SIDEBAR */}
      <div
        style={{
          width: isMobile ? "100%" : "360px",
          background: "#111b21",
          borderRight:
            "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          flexDirection: "column",
          position: isMobile
            ? "absolute"
            : "relative",
          top: 0,
          left: 0,
          zIndex: 20,
          height: "100%",
          transform:
            isMobile && !showSidebar
              ? "translateX(-100%)"
              : "translateX(0)",
          transition: "transform 0.25s ease",
        }}
        className="rounded-sm"
      >
        {/* HEADER */}
        <div
          style={{
            height: "60px",
            background: "#202c33",
            padding: "0 16px",
            display: "flex",
            alignItems: "center",
            color: "#e9edef",
            fontWeight: 700,
            fontSize: "15px",
          }}
        >
          WhatsApp Inbox
        </div>

        {/* SEARCH */}
        <div
          style={{
            padding: "10px",
          }}
        >
          <div
            style={{
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#8696a0",
              }}
            >
              <SearchIcon />
            </div>

            <input
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search chat"
              style={{
                width: "100%",
                height: "42px",
                borderRadius: "8px",
                border: "none",
                outline: "none",
                background: "#202c33",
                color: "#e9edef",
                padding: "0 14px 0 38px",
                fontSize: "13px",
              }}
            />
          </div>
        </div>

        {/* CONVERSATIONS */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
          }}
        >
          {loading ? (
            <div
              style={{
                padding: "30px",
                textAlign: "center",
                color: "#8696a0",
              }}
            >
              Loading...
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const isActive =
                selected?.phone === conv.phone;

              const leadStyle =
                LEAD_STAGES[
                  conv.leadStage || "new"
                ];

              return (
                <div
                  key={conv.phone}
                  onClick={() => {
                    setSelected(conv);

                    if (isMobile) {
                      setShowSidebar(false);
                    }
                  }}
                  style={{
                    padding: "12px 14px",
                    display: "flex",
                    gap: "12px",
                    cursor: "pointer",
                    background: isActive
                      ? "#202c33"
                      : "transparent",
                    borderBottom:
                      "1px solid rgba(255,255,255,0.04)",
                  }}
                >
                  <div
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "50%",
                      background: conv.isHandedOff
                        ? "rgba(245,158,11,0.15)"
                        : "#2a3942",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: conv.isHandedOff
                        ? "#f59e0b"
                        : "#e9edef",
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    {conv.phone.slice(-2)}
                  </div>

                  <div
                    style={{
                      flex: 1,
                      minWidth: 0,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent:
                          "space-between",
                        marginBottom: "4px",
                      }}
                    >
                      <div
                        style={{
                          color: "#e9edef",
                          fontSize: "14px",
                          fontWeight: 600,
                        }}
                      >
                        {conv.phone}
                      </div>

                      <div
                        style={{
                          color: "#8696a0",
                          fontSize: "11px",
                        }}
                      >
                        {formatConversationTime(
                          conv.lastMessageAt
                        )}
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent:
                          "space-between",
                        gap: "10px",
                      }}
                    >
                      <div
                        style={{
                          color: "#8696a0",
                          fontSize: "12px",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {conv.lastMessage}
                      </div>

                      {conv.unreadCount > 0 && (
                        <div
                          style={{
                            minWidth: "20px",
                            height: "20px",
                            borderRadius: "999px",
                            background: "#00a884",
                            color: "white",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "11px",
                            fontWeight: 700,
                            padding: "0 6px",
                            flexShrink: 0,
                          }}
                        >
                          {conv.unreadCount}
                        </div>
                      )}
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        marginTop: "8px",
                      }}
                    >
                      <span
                        style={{
                          padding: "3px 8px",
                          borderRadius: "999px",
                          background: leadStyle.bg,
                          color: leadStyle.color,
                          fontSize: "10px",
                          fontWeight: 700,
                          textTransform:
                            "capitalize",
                        }}
                      >
                        {conv.leadStage || "new"}
                      </span>

                      {conv.isHandedOff && (
                        <span
                          style={{
                            padding: "3px 8px",
                            borderRadius: "999px",
                            background:
                              "rgba(245,158,11,0.15)",
                            color: "#f59e0b",
                            fontSize: "10px",
                            fontWeight: 700,
                          }}
                        >
                          You
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* CHAT AREA */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          background: "#0b141a",
        }}
      >
        {!selected ? (
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#8696a0",
            }}
          >
            Select a conversation
          </div>
        ) : (
          <>
            {/* CHAT HEADER */}
            <div
              style={{
                height: "60px",
                background: "#202c33",
                borderBottom:
                  "1px solid rgba(255,255,255,0.05)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0 14px",
                position: "sticky",
                top: 0,
                zIndex: 10,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                {isMobile && (
                  <button
                    onClick={() =>
                      setShowSidebar(true)
                    }
                    style={{
                      width: "34px",
                      height: "34px",
                      borderRadius: "50%",
                      border: "none",
                      background: "transparent",
                      color: "#e9edef",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <BackIcon />
                  </button>
                )}

                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    background:
                      selectedConv?.isHandedOff
                        ? "rgba(245,158,11,0.15)"
                        : "#2a3942",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: selectedConv?.isHandedOff
                      ? "#f59e0b"
                      : "#e9edef",
                    fontWeight: 700,
                  }}
                >
                  {selected.phone.slice(-2)}
                </div>

                <div>
                  <div
                    style={{
                      color: "#e9edef",
                      fontSize: "14px",
                      fontWeight: 600,
                    }}
                  >
                    {selected.phone}
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      marginTop: "2px",
                    }}
                  >
                    <div
                      style={{
                        width: "6px",
                        height: "6px",
                        borderRadius: "50%",
                        background:
                          selectedConv?.isHandedOff
                            ? "#f59e0b"
                            : "#00a884",
                      }}
                    />

                    <span
                      style={{
                        color: "#8696a0",
                        fontSize: "11px",
                      }}
                    >
                      {selectedConv?.isHandedOff
                        ? "Managed by you"
                        : "Managed by AI"}
                    </span>

                    {selectedContact?.leadStage && (
                      <span
                        style={{
                          padding: "2px 8px",
                          borderRadius: "999px",
                          background:
                            LEAD_STAGES[
                              selectedContact
                                .leadStage
                            ]?.bg,
                          color:
                            LEAD_STAGES[
                              selectedContact
                                .leadStage
                            ]?.color,
                          fontSize: "10px",
                          fontWeight: 700,
                        }}
                      >
                        {selectedContact.leadStage}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {selectedConv?.isHandedOff ? (
                <button
                  disabled={takingOver}
                  onClick={() =>
                    handleHandoff("handback")
                  }
                  style={{
                    padding: "8px 14px",
                    borderRadius: "8px",
                    border: "none",
                    background: "#005c4b",
                    color: "white",
                    fontSize: "12px",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Hand Back
                </button>
              ) : (
                <button
                  disabled={takingOver}
                  onClick={() =>
                    handleHandoff("takeover")
                  }
                  style={{
                    padding: "8px 14px",
                    borderRadius: "8px",
                    border: "none",
                    background: "#f59e0b",
                    color: "white",
                    fontSize: "12px",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Take Over
                </button>
              )}
            </div>

            {/* MESSAGES */}
            <div
              ref={messagesContainerRef}
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "16px",
                backgroundImage: `
                  radial-gradient(circle at 25px 25px, rgba(255,255,255,0.03) 2%, transparent 0%),
                  radial-gradient(circle at 75px 75px, rgba(255,255,255,0.02) 2%, transparent 0%)
                `,
                backgroundSize: "100px 100px",
                backgroundColor: "#0b141a",
                position: "relative"
              }}
            >
              <AnimatePresence>
                {/* Takeover Notice Overlay */}
                {!selectedConv?.isHandedOff && (
                  <motion.div
                    initial={{ opacity: 0, y: 20, x: "-50%" }}
                    animate={{ opacity: 1, y: 0, x: "-50%" }}
                    exit={{ opacity: 0, y: 20, x: "-50%" }}
                    style={{
                      position: "absolute",
                      bottom: "20px",
                      left: "50%",
                      width: "90%",
                      maxWidth: "380px",
                      background: "rgba(245, 158, 11, 0.1)",
                      backdropFilter: "blur(12px)",
                      border: "1px solid rgba(245, 158, 11, 0.3)",
                      padding: "20px",
                      borderRadius: "20px",
                      boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
                      zIndex: 30,
                      color: "#fff",
                      textAlign: "center",
                    }}
                  >
                    <div style={{ 
                      width: "40px", 
                      height: "40px", 
                      background: "#f59e0b", 
                      borderRadius: "12px", 
                      display: "flex", 
                      alignItems: "center", 
                      justifyContent: "center",
                      margin: "0 auto 12px"
                    }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                        <line x1="12" y1="9" x2="12" y2="13"/>
                        <line x1="12" y1="17" x2="12.01" y2="17"/>
                      </svg>
                    </div>
                    <div style={{ fontWeight: 800, fontSize: "16px", marginBottom: "6px" }}>
                      AI is Managing this Chat
                    </div>
                    <p style={{ fontSize: "13px", opacity: 0.8, marginBottom: "20px", lineHeight: 1.5 }}>
                      The AI agent is currently handling this conversation. To send a manual message or take full control, click the Take Over button.
                    </p>
                    <button
                      disabled={takingOver}
                      onClick={() => handleHandoff("takeover")}
                      style={{
                        width: "100%",
                        background: "#f59e0b",
                        color: "#fff",
                        border: "none",
                        padding: "12px",
                        borderRadius: "12px",
                        fontWeight: 800,
                        fontSize: "14px",
                        cursor: "pointer",
                        transition: "all 0.2s"
                      }}
                      onMouseEnter={e => e.currentTarget.style.transform = "scale(1.02)"}
                      onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                    >
                      {takingOver ? "Taking Over..." : "Take Over Now"}
                    </button>
                  </motion.div>
                )}

                {messages.map((msg) => {
                  const isOutbound =
                    msg.direction === "outbound";

                  const isHuman =
                    msg.senderType === "human";

                  return (
                    <motion.div
                      key={msg._id}
                      initial={{
                        opacity: 0,
                        y: 8,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      transition={{
                        duration: 0.18,
                      }}
                      style={{
                        display: "flex",
                        justifyContent: isOutbound
                          ? "flex-end"
                          : "flex-start",
                        marginBottom: "10px",
                      }}
                    >
                      <div
                        style={{
                          maxWidth: isMobile
                            ? "88%"
                            : "70%",
                          padding: "8px 12px",
                          borderRadius: isOutbound
                            ? "8px 0 8px 8px"
                            : "0 8px 8px 8px",
                          background: isOutbound
                            ? isHuman
                              ? "#f59e0b"
                              : "#005c4b"
                            : "#202c33",
                          color: "#e9edef",
                          fontSize: "13px",
                          lineHeight: 1.5,
                          boxShadow:
                            "0 1px 1px rgba(0,0,0,0.08)",
                          border: isOutbound
                            ? "none"
                            : "1px solid rgba(255,255,255,0.04)",
                          wordBreak: "break-word",
                        }}
                      >
                        <div>{msg.text}</div>

                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent:
                              "flex-end",
                            gap: "4px",
                            marginTop: "4px",
                            fontSize: "10px",
                            color:
                              "rgba(255,255,255,0.6)",
                          }}
                        >
                          {formatMessageTime(
                            msg.createdAt
                          )}

                          {isOutbound && (
                            <DoubleCheckIcon />
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* REPLY BAR */}
            <div
              style={{
                padding: "10px",
                background: "#202c33",
                borderTop:
                  "1px solid rgba(255,255,255,0.05)",
                display: "flex",
                alignItems: "flex-end",
                gap: "10px",
                position: "sticky",
                bottom: 0,
                zIndex: 10,
              }}
            >
              <textarea
                ref={inputRef}
                value={replyText}
                disabled={
                  !selectedConv?.isHandedOff
                }
                onChange={(e) =>
                  setReplyText(e.target.value)
                }
                onKeyDown={handleKeyDown}
                rows={1}
                placeholder={
                  selectedConv?.isHandedOff
                    ? "Type a message"
                    : "Take over to reply"
                }
                onInput={(e) => {
                  e.target.style.height = "auto";
                  e.target.style.height = `${e.target.scrollHeight}px`;
                }}
                style={{
                  flex: 1,
                  minHeight: "42px",
                  maxHeight: "120px",
                  borderRadius: "12px",
                  border: "none",
                  outline: "none",
                  padding: "10px 14px",
                  background: "#2a3942",
                  color: "#e9edef",
                  fontSize: "14px",
                  lineHeight: 1.5,
                  overflowY: "auto",
                  opacity:
                    selectedConv?.isHandedOff
                      ? 1
                      : 0.5,
                }}
              />

              <button
                onClick={handleSend}
                disabled={
                  sending ||
                  !replyText.trim() ||
                  !selectedConv?.isHandedOff
                }
                style={{
                  width: "46px",
                  height: "46px",
                  borderRadius: "50%",
                  border: "none",
                  background: replyText.trim() &&
                    selectedConv?.isHandedOff
                    ? "#00a884"
                    : "#2a3942",
                  color: "white",
                  cursor: replyText.trim() &&
                    selectedConv?.isHandedOff
                    ? "pointer"
                    : "not-allowed",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <SendIcon />
              </button>
            </div>
          </>
        )}
      </div>

      {/* LEAD PANEL */}
      {selected && !isMobile && (
        <LeadPanel
          contact={selectedContact}
          phone={selected.phone}
          onUpdate={(u) =>
            setSelectedContact((p) => ({
              ...p,
              ...u,
            }))
          }
        />
      )}
    </div>
  );
}
