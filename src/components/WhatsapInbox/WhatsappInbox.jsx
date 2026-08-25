"use client";

import {
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

import { useGlobalContext } from "../Context";
import AiReadinessBanner from "../AiReadinessBanner/AiReadinessBanner";

/* ─────────────────────────────────────────────
   AVATAR GRADIENT & INITIAL GENERATOR
───────────────────────────────────────────── */
const AVATAR_GRADIENTS = [
  "linear-gradient(135deg, #128c7e 0%, #075e54 100%)",
  "linear-gradient(135deg, #00a884 0%, #005c4b 100%)",
  "linear-gradient(135deg, #34b7f1 0%, #0b80b7 100%)",
  "linear-gradient(135deg, #7c3aed 0%, #4c1d95 100%)",
  "linear-gradient(135deg, #ec4899 0%, #be185d 100%)",
  "linear-gradient(135deg, #f59e0b 0%, #b45309 100%)",
  "linear-gradient(135deg, #10b981 0%, #047857 100%)",
  "linear-gradient(135deg, #6366f1 0%, #4338ca 100%)",
];

const getAvatarStyle = (phone = "", name = "") => {
  const str = (name || phone || "WA").trim();
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const bgIndex = Math.abs(hash) % AVATAR_GRADIENTS.length;

  let initials = "";
  if (name && name !== phone) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      initials = (parts[0][0] + parts[1][0]).toUpperCase();
    } else {
      initials = name.slice(0, 2).toUpperCase();
    }
  } else {
    const digitsOnly = phone.replace(/\D/g, "");
    if (digitsOnly.length >= 4) {
      initials = digitsOnly.slice(-2);
    } else {
      initials = (phone.slice(0, 2) || "WA").toUpperCase();
    }
  }

  return {
    background: AVATAR_GRADIENTS[bgIndex],
    initials,
  };
};

const UserAvatar = ({ phone, name, size = 40, fontSize = 14 }) => {
  const style = getAvatarStyle(phone, name);
  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: "50%",
        background: style.background,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#ffffff",
        fontWeight: 700,
        fontSize: `${fontSize}px`,
        flexShrink: 0,
        boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
        textTransform: "uppercase",
        letterSpacing: "0.03em",
      }}
    >
      {style.initials}
    </div>
  );
};

/* ─────────────────────────────────────────────
   TYPING INDICATOR
───────────────────────────────────────────── */
const TypingIndicator = () => (
  <div
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: "5px",
      padding: "8px 14px",
      borderRadius: "0 12px 12px 12px",
      background: "#202c33",
      width: "fit-content",
      marginBottom: "10px",
      boxShadow: "0 1px 2px rgba(0,0,0,0.15)",
    }}
  >
    <span style={{ fontSize: "11px", color: "#00a884", fontWeight: 700, marginRight: "4px" }}>
      Agent Typing
    </span>
    {[0, 1, 2].map((i) => (
      <span
        key={i}
        style={{
          width: "6px",
          height: "6px",
          borderRadius: "50%",
          background: "#00a884",
          animation: "inbox-bounce 1.4s infinite ease-in-out both",
          animationDelay: `${i * 0.16}s`,
        }}
      />
    ))}
  </div>
);

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
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

const DoubleCheckIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
    <polyline points="16 6 9 13" />
  </svg>
);

const MessageStatusIcon = ({ status }) => {
  if (status === "failed") {
    return (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="15" y1="9" x2="9" y2="15" />
        <line x1="9" y1="9" x2="15" y2="15" />
      </svg>
    );
  }
  if (status === "read") {
    return (
      <svg width="16" height="11" viewBox="0 0 16 11" fill="none">
        <polyline points="1,6 4,9 8,4" stroke="#53bdeb" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <polyline points="6,6 9,9 15,2" stroke="#53bdeb" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (status === "delivered") {
    return (
      <svg width="16" height="11" viewBox="0 0 16 11" fill="none">
        <polyline points="1,6 4,9 8,4" stroke="rgba(255,255,255,0.55)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <polyline points="6,6 9,9 15,2" stroke="rgba(255,255,255,0.55)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
      <polyline points="1,6 4,9 10,2" stroke="rgba(255,255,255,0.55)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

const InfoIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
);

const WhatsAppLogoIcon = ({ size = 56 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="11" fill="#00a884" />
    <path d="M17.5 14.38c-.3-.15-1.78-.88-2.06-.98-.28-.1-.48-.15-.68.15-.2.3-.77.98-.95 1.18-.18.2-.35.23-.65.08-.3-.15-1.27-.47-2.42-1.49-.9-.8-1.5-1.78-1.68-2.08-.18-.3-.02-.46.13-.61.14-.14.3-.35.45-.53.15-.18.2-.3.3-.5.1-.2.05-.38-.03-.53-.08-.15-.68-1.63-.93-2.24-.25-.6-.5-.52-.68-.53-.18-.01-.38-.01-.58-.01-.2 0-.53.08-.8.38-.28.3-1.06 1.04-1.06 2.53 0 1.5 1.09 2.94 1.24 3.14.15.2 2.14 3.27 5.19 4.59.73.31 1.3.5 1.74.64.73.23 1.39.2 1.92.12.59-.09 1.78-.73 2.03-1.44.25-.7.25-1.3.18-1.43-.07-.13-.27-.21-.57-.36z" fill="#ffffff" />
  </svg>
);

const LockIcon = ({ size = 12 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const UserPlusIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="8.5" cy="7" r="4" />
    <line x1="20" y1="8" x2="20" y2="14" />
    <line x1="17" y1="11" x2="23" y2="11" />
  </svg>
);

const MoreVerticalIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="1.5" />
    <circle cx="12" cy="5" r="1.5" />
    <circle cx="12" cy="19" r="1.5" />
  </svg>
);

const ChatBubbleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const UserGroupIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const BanIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
  </svg>
);

const ShieldCheckIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <polyline points="9 12 11 14 15 10" />
  </svg>
);

const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

const UserCheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <polyline points="16 11 18 13 22 9" />
  </svg>
);

const UserXIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <line x1="17" y1="11" x2="23" y2="17" />
    <line x1="23" y1="11" x2="17" y2="17" />
  </svg>
);

const XIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const CloseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
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
function LeadPanel({ contact, phone, onUpdate, onClose }) {
  const [stage, setStage] = useState(contact?.leadStage || "new");
  const [notes, setNotes] = useState(contact?.notes || "");
  const [tags, setTags] = useState(contact?.tags || []);
  const [assignedTo, setAssignedTo] = useState(contact?.assignedTo || "");
  const [staffList, setStaffList] = useState([]);
  const [savingLead, setSavingLead] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);

  useEffect(() => {
    setStage(contact?.leadStage || "new");
    setNotes(contact?.notes || "");
    setTags(contact?.tags || []);
    setAssignedTo(contact?.assignedTo || "");
  }, [contact]);

  useEffect(() => {
    fetch("/api/seller/staff")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setStaffList(data.data || []);
      })
      .catch(() => {});
  }, []);

  const saveLead = async () => {
    setSavingLead(true);
    try {
      await fetch("/api/automations/inbox/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone,
          leadStage: stage,
          notes,
          tags,
          assignedTo,
        }),
      });

      onUpdate?.({
        leadStage: stage,
        notes,
        tags,
        assignedTo,
      });

      setSavedNotice(true);
      setTimeout(() => setSavedNotice(false), 2200);
    } catch (error) {
      console.error(error);
    } finally {
      setSavingLead(false);
    }
  };

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "360px",
        height: "100%",
        background: "#111b21",
        borderLeft: "1px solid rgba(255,255,255,0.06)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          padding: "16px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          color: "#e9edef",
          fontWeight: 700,
          fontSize: "15px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span>Lead Details</span>
        {onClose && (
          <button
            onClick={onClose}
            title="Close"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "none",
              borderRadius: "50%",
              width: "28px",
              height: "28px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#8696a0",
              cursor: "pointer",
            }}
          >
            <XIcon />
          </button>
        )}
      </div>

      <div
        style={{
          padding: "16px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          overflowY: "auto",
          flex: 1,
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
                    background: stage === s ? item.bg : "transparent",
                    color: stage === s ? item.color : "#8696a0",
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
            Assigned Staff
          </div>

          <select
            value={assignedTo}
            onChange={(e) => setAssignedTo(e.target.value)}
            style={{
              width: "100%",
              padding: "8px 10px",
              borderRadius: "10px",
              background: "#202c33",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "#e9edef",
              fontSize: "12px",
              outline: "none",
              cursor: "pointer",
            }}
          >
            <option value="">Unassigned (Owner / All)</option>
            {staffList.map((s) => (
              <option key={s._id} value={s.name}>
                {s.name} ({s.role})
              </option>
            ))}
          </select>
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
            Tags
          </div>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "6px",
              alignItems: "center",
              padding: "8px 10px",
              borderRadius: "10px",
              background: "#202c33",
              border: "1px solid rgba(255,255,255,0.08)",
              minHeight: "40px",
              boxSizing: "border-box",
            }}
          >
            {tags.map((t) => (
              <span
                key={t}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "5px",
                  padding: "3px 8px",
                  borderRadius: "999px",
                  fontSize: "11px",
                  fontWeight: 600,
                  background: "rgba(0,168,132,0.15)",
                  color: "#00a884",
                  border: "1px solid rgba(0,168,132,0.25)",
                }}
              >
                {t}
                <span
                  onClick={() => setTags(tags.filter((x) => x !== t))}
                  style={{ cursor: "pointer", opacity: 0.7, lineHeight: 1 }}
                >
                  <XIcon />
                </span>
              </span>
            ))}
            <input
              placeholder={tags.length ? "" : "Add tags..."}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === ",") {
                  e.preventDefault();
                  const val = e.target.value.trim().replace(/,+$/, "");
                  if (val && !tags.includes(val)) {
                    setTags([...tags, val]);
                  }
                  e.target.value = "";
                }
              }}
              style={{
                flex: 1,
                minWidth: "80px",
                border: "none",
                outline: "none",
                background: "transparent",
                fontSize: "13px",
                color: "#e9edef",
              }}
            />
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
            onChange={(e) => setNotes(e.target.value)}
            rows={6}
            placeholder="Add note..."
            style={{
              width: "100%",
              borderRadius: "10px",
              border: "1px solid rgba(255,255,255,0.08)",
              background: "#202c33",
              color: "#e9edef",
              padding: "12px",
              outline: "none",
              fontSize: "13px",
            }}
          />
        </div>

        <button
          disabled={savingLead}
          onClick={saveLead}
          style={{
            height: "42px",
            borderRadius: "10px",
            border: "none",
            background: savedNotice ? "#10b981" : "#00a884",
            color: "white",
            fontWeight: 700,
            cursor: savingLead ? "not-allowed" : "pointer",
            flexShrink: 0,
            marginTop: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            opacity: savingLead ? 0.75 : 1,
            transition: "all 0.2s ease",
          }}
        >
          {savingLead ? (
            <>
              <span
                style={{
                  width: "14px",
                  height: "14px",
                  borderRadius: "50%",
                  border: "2px solid rgba(255,255,255,0.3)",
                  borderTopColor: "#ffffff",
                  animation: "inbox-spin 0.65s linear infinite",
                  display: "inline-block",
                }}
              />
              Saving Lead…
            </>
          ) : savedNotice ? (
            "✓ Lead Saved!"
          ) : (
            "Save Lead"
          )}
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */
export default function WhatsAppInbox() {
  const { userData, fetchUser } = useGlobalContext();
  const router = useRouter();

  const [conversations, setConversations] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [policy, setPolicy] = useState("allow");

  const [messages, setMessages] = useState([]);
  const [resolvedMediaUrls, setResolvedMediaUrls] = useState({});

  const [selected, setSelected] = useState(null);
  const [selectedContact, setSelectedContact] = useState(null);

  const [search, setSearch] = useState("");
  const [contactSearch, setContactSearch] = useState("");
  const [contactFilterTab, setContactFilterTab] = useState("all");

  const [replyText, setReplyText] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [sending, setSending] = useState(false);
  const [takingOver, setTakingOver] = useState(false);

  // Bottom Navigation Bar view: "chats" | "contacts" | "blocked" | "policy"
  const [sidebarView, setSidebarView] = useState("chats");

  // Top Three-Dot Menu state
  const [showMenu, setShowMenu] = useState(false);

  // Add Contact Modal State
  const [showAddContactModal, setShowAddContactModal] = useState(false);
  const [addPhone, setAddPhone] = useState("");
  const [addTags, setAddTags] = useState([]);
  const [addNotes, setAddNotes] = useState("");
  const [addStatus, setAddStatus] = useState("whitelist");
  const [addingContact, setAddingContact] = useState(false);
  const [loadingPhone, setLoadingPhone] = useState(null);
  const [savingPolicy, setSavingPolicy] = useState(false);
  const [savedPolicyNotice, setSavedPolicyNotice] = useState(false);

  // In-Chat Search state
  const [showChatSearch, setShowChatSearch] = useState(false);
  const [chatSearchQuery, setChatSearchQuery] = useState("");

  // Image send state
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageCaption, setImageCaption] = useState("");
  const [sendingImage, setSendingImage] = useState(false);
  const imageInputRef = useRef(null);

  const [isMobile, setIsMobile] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [showFlowInfo, setShowFlowInfo] = useState(false);
  const [showMobileLeadDetails, setShowMobileLeadDetails] = useState(false);
  const [isAlertVisible, setIsAlertVisible] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  const messagesContainerRef = useRef(null);
  const inputRef = useRef(null);
  const menuRef = useRef(null);

  /* ─────────────────────────────────────────────
     RESPONSIVE & CLICK OUTSIDE
  ───────────────────────────────────────────── */
  useEffect(() => {
    const check = () => {
      const mobile = window.innerWidth < 900;
      setIsMobile(mobile);
      if (!mobile) setShowSidebar(true);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* ─────────────────────────────────────────────
     SMART SCROLL
  ───────────────────────────────────────────── */
  const scrollToBottom = (force = false, instant = false) => {
    const container = messagesContainerRef.current;
    if (!container) return;
    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;
    const isNearBottom = distanceFromBottom < 120;

    if (force || isNearBottom) {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: instant ? "instant" : "smooth",
      });
    }
  };

  /* ─────────────────────────────────────────────
     FETCH CONVERSATIONS & CONTACTS
  ───────────────────────────────────────────── */
  const fetchConversations = useCallback(async () => {
    try {
      const res = await fetch("/api/automations/inbox/conversations");
      if (res.ok) {
        const data = await res.json();
        setConversations(data.data || []);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchContacts = useCallback(async () => {
    setLoadingContacts(true);
    try {
      const res = await fetch("/api/whatsapp/contacts");
      if (res.ok) {
        const data = await res.json();
        setContacts(data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch contacts:", error);
    } finally {
      setLoadingContacts(false);
    }
  }, []);

  /* ─────────────────────────────────────────────
     CONTACT MANAGEMENT HANDLERS
  ───────────────────────────────────────────── */
  const toggleContactStatus = async (contactPhone, status) => {
    if (!contactPhone || !status) return;
    setLoadingPhone(contactPhone);
    try {
      const cleaned = contactPhone.replace(/\D/g, "");
      const last10 = cleaned.slice(-10);
      const res = await fetch("/api/whatsapp/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: last10, status }),
      });
      if (res.ok) {
        await fetchContacts();
        await fetchConversations();
      }
    } catch (err) {
      console.error("Failed to toggle contact:", err);
    } finally {
      setLoadingPhone(null);
    }
  };

  const handleCreateContact = async (statusOverride) => {
    if (!addPhone.trim()) return;
    setAddingContact(true);
    try {
      const cleaned = addPhone.replace(/\D/g, "");
      const last10 = cleaned.slice(-10);
      const res = await fetch("/api/whatsapp/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: last10,
          status: statusOverride || addStatus,
          tags: addTags,
          notes: addNotes,
        }),
      });
      if (res.ok) {
        setAddPhone("");
        setAddTags([]);
        setAddNotes("");
        setShowAddContactModal(false);
        await fetchContacts();
        await fetchConversations();
      }
    } catch (err) {
      console.error("Failed to create contact:", err);
    } finally {
      setAddingContact(false);
    }
  };

  const handleDeleteContact = async (contactPhone) => {
    if (!contactPhone) return;
    setLoadingPhone(contactPhone);
    try {
      const res = await fetch("/api/whatsapp/delete-contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: contactPhone }),
      });
      if (res.ok) {
        await fetchContacts();
        await fetchConversations();
      }
    } catch (err) {
      console.error("Failed to delete contact:", err);
    } finally {
      setLoadingPhone(null);
    }
  };

  const handleSavePolicy = async (newPolicy) => {
    setPolicy(newPolicy);
    setSavingPolicy(true);
    try {
      const res = await fetch("/api/contact/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ policy: newPolicy }),
      });
      if (res.ok) {
        setSavedPolicyNotice(true);
        setTimeout(() => setSavedPolicyNotice(false), 2000);
        if (fetchUser) fetchUser();
      }
    } catch (err) {
      console.error("Failed to save policy:", err);
    } finally {
      setSavingPolicy(false);
    }
  };

  /* ─────────────────────────────────────────────
     FETCH CONTACT & MESSAGES FOR CHAT
  ───────────────────────────────────────────── */
  const fetchContact = useCallback(async (phone) => {
    try {
      const res = await fetch("/api/automations/inbox/lead");
      if (res.ok) {
        const data = await res.json();
        const found = data.data?.find((c) => c.phone === phone);
        setSelectedContact(found || null);
      }
    } catch (error) {
      console.error(error);
    }
  }, []);

  const fetchMessages = useCallback(async (phone) => {
    if (!phone) return;
    try {
      const res = await fetch(
        `/api/automations/inbox/messages?phone=${encodeURIComponent(phone)}`
      );
      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => {
          const incoming = data.data || [];
          if (JSON.stringify(prev) === JSON.stringify(incoming)) return prev;
          return incoming;
        });
      }
    } catch (error) {
      console.error(error);
    }
  }, []);

  /* ─────────────────────────────────────────────
     INITIAL LOAD
  ───────────────────────────────────────────── */
  useEffect(() => {
    fetchConversations();
    fetchContacts();

    if (userData?.whatsapp?.contacts?.unknownContactPolicy) {
      setPolicy(userData.whatsapp.contacts.unknownContactPolicy);
    }

    const interval = setInterval(() => {
      fetchConversations();
      if (selected?.phone) {
        fetchMessages(selected.phone);
      }
    }, 8000);

    return () => clearInterval(interval);
  }, [fetchConversations, fetchContacts, fetchMessages, selected, userData]);

  /* ─────────────────────────────────────────────
     SELECT CHAT
  ───────────────────────────────────────────── */
  useEffect(() => {
    if (selected?.phone) {
      fetchMessages(selected.phone);
      fetchContact(selected.phone);
      setIsAlertVisible(true);
      requestAnimationFrame(() => {
        const container = messagesContainerRef.current;
        if (container) container.scrollTop = container.scrollHeight;
      });
    }
  }, [selected, fetchMessages, fetchContact]);

  useEffect(() => {
    if (messages.length > 0) {
      requestAnimationFrame(() => {
        const container = messagesContainerRef.current;
        if (!container) return;
        const wasEmpty =
          container.scrollTop === 0 &&
          container.scrollHeight > container.clientHeight;
        scrollToBottom(wasEmpty, wasEmpty);
      });
    }
  }, [messages]);

  /* Resolve image media URLs */
  useEffect(() => {
    messages.forEach(async (msg) => {
      if (
        msg.mediaType !== "image" ||
        msg.mediaUrl ||
        !msg.mediaId ||
        resolvedMediaUrls[msg.messageId]
      ) {
        return;
      }
      try {
        const res = await fetch(
          `/api/automations/inbox/media?messageId=${encodeURIComponent(
            msg.messageId
          )}`
        );
        if (res.ok) {
          const data = await res.json();
          if (data.mediaUrl) {
            setResolvedMediaUrls((prev) => ({
              ...prev,
              [msg.messageId]: data.mediaUrl,
            }));
          }
        }
      } catch (err) {
        console.warn("Failed to resolve inbox image:", err);
      }
    });
  }, [messages, resolvedMediaUrls]);

  /* ─────────────────────────────────────────────
     SEND MESSAGE & IMAGES
  ───────────────────────────────────────────── */
  const handleSend = async () => {
    if (!replyText.trim() || sending || !selected) return;

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
        status: "sent",
        createdAt: new Date().toISOString(),
      },
    ]);

    scrollToBottom(true);

    try {
      const res = await fetch("/api/automations/inbox/handoff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reply",
          phone: selected.phone,
          message: text,
        }),
      });

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

  const handleImageFilePicked = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    e.target.value = "";
  };

  const cancelImagePreview = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImageFile(null);
    setImagePreview(null);
    setImageCaption("");
  };

  const handleSendImage = async () => {
    if (!imageFile || sendingImage || !selected) return;

    setSendingImage(true);
    const tempId = `temp_img_${Date.now()}`;
    const localPreview = imagePreview;

    setMessages((prev) => [
      ...prev,
      {
        _id: tempId,
        text: imageCaption.trim() || "📷 Image",
        mediaType: "image",
        mediaUrl: localPreview,
        direction: "outbound",
        senderType: "human",
        status: "sent",
        createdAt: new Date().toISOString(),
        _uploading: true,
      },
    ]);
    scrollToBottom(true);

    const captionToSend = imageCaption.trim();
    const fileToUpload = imageFile;
    cancelImagePreview();

    try {
      const formData = new FormData();
      formData.append("file", fileToUpload);
      formData.append("folder", "inbox-images");

      const uploadRes = await fetch("/api/upload/cloudinary", {
        method: "POST",
        body: formData,
      });

      const uploadData = await uploadRes.json();

      if (!uploadData.url) {
        setMessages((prev) =>
          prev.map((m) =>
            m._id === tempId ? { ...m, _uploading: false, status: "failed" } : m
          )
        );
        return;
      }

      await fetch("/api/automations/inbox/handoff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "sendImage",
          phone: selected.phone,
          imageUrl: uploadData.url,
          caption: captionToSend,
        }),
      });

      setMessages((prev) =>
        prev.map((m) =>
          m._id === tempId
            ? { ...m, mediaUrl: uploadData.url, _uploading: false, status: "delivered" }
            : m
        )
      );

      fetchMessages(selected.phone);
    } catch (error) {
      console.error("Image send error:", error);
      setMessages((prev) =>
        prev.map((m) =>
          m._id === tempId ? { ...m, _uploading: false, status: "failed" } : m
        )
      );
    } finally {
      setSendingImage(false);
    }
  };

  /* ─────────────────────────────────────────────
     TAKE OVER / HANDBACK
  ───────────────────────────────────────────── */
  const handleHandoff = async (action) => {
    if (!selected) return;

    setTakingOver(true);
    try {
      const res = await fetch("/api/automations/inbox/handoff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          phone: selected.phone,
        }),
      });

      if (res.ok) {
        setSelected((prev) => ({
          ...prev,
          isHandedOff: action === "takeover",
        }));

        setConversations((prev) =>
          prev.map((c) =>
            c.phone === selected.phone
              ? { ...c, isHandedOff: action === "takeover" }
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

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  /* ─────────────────────────────────────────────
     FILTERS
  ───────────────────────────────────────────── */
  const filteredConversations = conversations.filter((conv) => {
    let matchSearch = true;
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      matchSearch =
        conv.phone?.toLowerCase().includes(q) ||
        conv.notes?.toLowerCase().includes(q) ||
        conv.tags?.some((t) => t.toLowerCase().includes(q));
    }

    let matchTab = true;
    if (activeTab === "unread") matchTab = conv.unreadCount > 0;
    else if (activeTab === "whitelisted") matchTab = conv.status === "whitelist";
    else if (activeTab === "blocked") matchTab = conv.status === "blacklist";

    return matchSearch && matchTab;
  });

  const filteredContacts = contacts.filter((c) => {
    let matchTab = true;
    if (sidebarView === "blocked") {
      matchTab = c.status === "blacklist";
    } else if (contactFilterTab === "whitelist") {
      matchTab = c.status === "whitelist";
    } else if (contactFilterTab === "blacklist") {
      matchTab = c.status === "blacklist";
    } else if (contactFilterTab === "pending") {
      matchTab = c.status === "pending";
    }

    let matchQuery = true;
    if (contactSearch.trim()) {
      const q = contactSearch.trim().toLowerCase();
      matchQuery =
        c.phone?.toLowerCase().includes(q) ||
        c.notes?.toLowerCase().includes(q) ||
        c.tags?.some((t) => t.toLowerCase().includes(q));
    }

    return matchTab && matchQuery;
  });

  const filteredMessages = messages.filter((m) => {
    if (!chatSearchQuery.trim()) return true;
    return m.text?.toLowerCase().includes(chatSearchQuery.trim().toLowerCase());
  });

  const selectedConv = selected
    ? conversations.find((c) => c.phone === selected.phone)
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
        flexDirection: "column",
      }}
    >
      {/* GLOBAL CSS */}
      <style>{`
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.1);
          border-radius: 999px;
        }
        @keyframes inbox-spin { to { transform: rotate(360deg); } }
        @keyframes inbox-bounce {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}</style>

      {/* AI Readiness Banner */}
      <AiReadinessBanner className="mx-3 mt-3" />

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* ─────────────────────────────────────────────
           SIDEBAR
        ───────────────────────────────────────────── */}
        <div
          style={{
            width: isMobile ? "100%" : "380px",
            background: "#111b21",
            borderRight: "1px solid rgba(255,255,255,0.06)",
            display: "flex",
            flexDirection: "column",
            position: isMobile ? "absolute" : "relative",
            top: 0,
            left: 0,
            zIndex: 20,
            height: "100%",
            transform: isMobile && !showSidebar ? "translateX(-100%)" : "translateX(0)",
            transition: "transform 0.25s ease",
          }}
          className="rounded-sm"
        >
          {/* TOP UNTOUCHED HEADER */}
          <div
            style={{
              height: "60px",
              background: "#202c33",
              padding: "0 16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              color: "#e9edef",
              borderBottom: "1px solid rgba(255,255,255,0.05)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <button
                onClick={() => router.push("/dashboard")}
                title="Back to Dashboard"
                style={{
                  background: "none",
                  border: "none",
                  padding: "8px",
                  margin: "-8px",
                  cursor: "pointer",
                  color: "#8696a0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "50%",
                  transition: "background 0.2s, color 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                  e.currentTarget.style.color = "#e9edef";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "none";
                  e.currentTarget.style.color = "#8696a0";
                }}
              >
                <BackIcon />
              </button>
              <span style={{ fontWeight: 700, fontSize: "15px" }}>
                {sidebarView === "chats"
                  ? "Chats"
                  : sidebarView === "contacts"
                  ? "Contacts"
                  : sidebarView === "blocked"
                  ? "Blocked Numbers"
                  : "Contact Policy"}
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "10px", position: "relative" }} ref={menuRef}>
              <button
                onClick={() => setShowAddContactModal(true)}
                title="Add Contact"
                style={{
                  background: "rgba(0,168,132,0.15)",
                  border: "1px solid rgba(0,168,132,0.3)",
                  color: "#00a884",
                  padding: "6px 10px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                  fontSize: "12px",
                  fontWeight: 700,
                }}
              >
                <UserPlusIcon size={14} /> Add Contact
              </button>

              {/* THREE-DOT VERTICAL OVERFLOW MENU */}
              <button
                onClick={() => setShowMenu((v) => !v)}
                title="Inbox Menu"
                style={{
                  background: showMenu ? "rgba(255,255,255,0.1)" : "none",
                  border: "none",
                  color: "#8696a0",
                  padding: "6px",
                  borderRadius: "50%",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <MoreVerticalIcon />
              </button>

              {/* DROPDOWN MENU */}
              <AnimatePresence>
                {showMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 5 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 5 }}
                    style={{
                      position: "absolute",
                      top: "45px",
                      right: 0,
                      width: "210px",
                      background: "#233138",
                      borderRadius: "10px",
                      border: "1px solid rgba(255,255,255,0.08)",
                      boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
                      zIndex: 100,
                      padding: "6px 0",
                    }}
                  >
                    {[
                      {
                        label: "Add New Contact",
                        action: () => {
                          setShowAddContactModal(true);
                          setShowMenu(false);
                        },
                      },
                      {
                        label: "All Contacts",
                        action: () => {
                          setSidebarView("contacts");
                          setShowMenu(false);
                        },
                      },
                      {
                        label: "Blocked Numbers",
                        action: () => {
                          setSidebarView("blocked");
                          setShowMenu(false);
                        },
                      },
                      {
                        label: "Unknown Sender Policy",
                        action: () => {
                          setSidebarView("policy");
                          setShowMenu(false);
                        },
                      },
                      {
                        label: "View All Chats",
                        action: () => {
                          setSidebarView("chats");
                          setShowMenu(false);
                        },
                      },
                    ].map((item, idx) => (
                      <button
                        key={idx}
                        onClick={item.action}
                        style={{
                          width: "100%",
                          textAlign: "left",
                          padding: "10px 16px",
                          background: "none",
                          border: "none",
                          color: "#e9edef",
                          fontSize: "13px",
                          fontWeight: 500,
                          cursor: "pointer",
                          transition: "background 0.15s ease",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background = "rgba(255,255,255,0.05)")
                        }
                        onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
                      >
                        {item.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* ─────────────────────────────────────────────
             SIDEBAR CONTENT SWITCHER (CHATS / CONTACTS / BLOCKED / POLICY)
          ───────────────────────────────────────────── */}
          {sidebarView === "chats" && (
            <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
              {/* SEARCH */}
              <div style={{ padding: "10px 10px 6px 10px" }}>
                <div style={{ position: "relative" }}>
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
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search phone, tags, notes…"
                    style={{
                      width: "100%",
                      height: "38px",
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

              {/* FILTER PILLS */}
              <div style={{ display: "flex", gap: "6px", padding: "4px 10px 10px", flexWrap: "wrap" }}>
                {[
                  { id: "all", label: "All" },
                  { id: "unread", label: "Unread" },
                  { id: "whitelisted", label: "Whitelisted" },
                  { id: "blocked", label: "Blocked" },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id)}
                    style={{
                      padding: "4px 12px",
                      borderRadius: "999px",
                      fontSize: "11px",
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                      border:
                        activeTab === t.id
                          ? "1px solid rgba(0,168,132,0.4)"
                          : "1px solid rgba(255,255,255,0.06)",
                      background: activeTab === t.id ? "rgba(0,168,132,0.2)" : "#202c33",
                      color: activeTab === t.id ? "#00a884" : "#8696a0",
                    }}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* CONVERSATION LIST */}
              <div style={{ flex: 1, overflowY: "auto" }}>
                {loading ? (
                  <div style={{ padding: "30px", textAlign: "center", color: "#8696a0" }}>
                    Loading chats...
                  </div>
                ) : filteredConversations.length === 0 ? (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "40px 24px",
                      gap: "16px",
                      flex: 1,
                      height: "100%",
                    }}
                  >
                    <div
                      style={{
                        width: "72px",
                        height: "72px",
                        borderRadius: "50%",
                        background: "rgba(0,168,132,0.1)",
                        border: "1.5px solid rgba(0,168,132,0.2)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <WhatsAppLogoIcon size={36} />
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <p style={{ color: "#e9edef", fontSize: "14px", fontWeight: 700, margin: "0 0 6px 0" }}>
                        No messages yet
                      </p>
                      <p style={{ color: "#8696a0", fontSize: "12px", margin: 0, lineHeight: 1.6, maxWidth: "220px" }}>
                        When customers message your WhatsApp number, their conversations will appear here.
                      </p>
                    </div>
                  </div>
                ) : (
                  filteredConversations.map((conv) => {
                    const isActive = selected?.phone === conv.phone;
                    const leadStyle = LEAD_STAGES[conv.leadStage || "new"];

                    return (
                      <div
                        key={conv.phone}
                        onClick={() => {
                          setSelected(conv);
                          if (isMobile) setShowSidebar(false);
                        }}
                        style={{
                          padding: "12px 14px",
                          display: "flex",
                          gap: "12px",
                          cursor: "pointer",
                          background: isActive ? "#202c33" : "transparent",
                          borderBottom: "1px solid rgba(255,255,255,0.04)",
                        }}
                      >
                        {/* COLORFUL INITIAL AVATAR */}
                        <UserAvatar phone={conv.phone} name={conv.notes} size={46} fontSize={15} />

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                            <div style={{ display: "flex", flexDirection: "column", minWidth: 0, flex: 1 }}>
                              <div
                                style={{
                                  color: "#e9edef",
                                  fontSize: "14px",
                                  fontWeight: 600,
                                  textTransform: "capitalize",
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                }}
                              >
                                {conv.notes || conv.phone}
                              </div>
                              {conv.notes && (
                                <div style={{ color: "#00a884", fontSize: "11px", fontWeight: 600, marginTop: "1px" }}>
                                  {conv.phone}
                                </div>
                              )}
                            </div>

                            <div style={{ color: "#8696a0", fontSize: "11px", flexShrink: 0, marginLeft: "8px" }}>
                              {formatConversationTime(conv.lastMessageAt)}
                            </div>
                          </div>

                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px" }}>
                            <div style={{ color: "#8696a0", fontSize: "12px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
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

                          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "8px", flexWrap: "wrap" }}>
                            <span
                              style={{
                                padding: "3px 8px",
                                borderRadius: "999px",
                                background: leadStyle.bg,
                                color: leadStyle.color,
                                fontSize: "10px",
                                fontWeight: 700,
                                textTransform: "capitalize",
                              }}
                            >
                              {conv.leadStage || "new"}
                            </span>

                            {conv.tags?.map((t) => (
                              <span
                                key={t}
                                style={{
                                  padding: "2px 7px",
                                  borderRadius: "999px",
                                  background: "rgba(0,168,132,0.12)",
                                  color: "#00a884",
                                  border: "1px solid rgba(0,168,132,0.25)",
                                  fontSize: "10px",
                                  fontWeight: 600,
                                }}
                              >
                                {t}
                              </span>
                            ))}

                            {conv.isHandedOff && (
                              <span
                                style={{
                                  padding: "3px 8px",
                                  borderRadius: "999px",
                                  background: "rgba(245,158,11,0.15)",
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
          )}

          {/* CONTACTS OR BLOCKED VIEW IN SIDEBAR */}
          {(sidebarView === "contacts" || sidebarView === "blocked") && (
            <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden", padding: "12px" }}>
              {/* CONTACT SEARCH */}
              <div style={{ marginBottom: "10px" }}>
                <div style={{ position: "relative" }}>
                  <div style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#8696a0" }}>
                    <SearchIcon />
                  </div>
                  <input
                    value={contactSearch}
                    onChange={(e) => setContactSearch(e.target.value)}
                    placeholder="Search contact, phone, tags…"
                    style={{
                      width: "100%",
                      height: "38px",
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

              {/* TABS (ONLY IN ALL CONTACTS VIEW) */}
              {sidebarView === "contacts" && (
                <div style={{ display: "flex", gap: "4px", marginBottom: "10px", flexWrap: "wrap" }}>
                  {[
                    { id: "all", label: "All" },
                    { id: "whitelist", label: "Allowed" },
                    { id: "blacklist", label: "Blocked" },
                    { id: "pending", label: "Pending" },
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setContactFilterTab(t.id)}
                      style={{
                        padding: "4px 10px",
                        borderRadius: "999px",
                        fontSize: "11px",
                        fontWeight: 600,
                        cursor: "pointer",
                        border: contactFilterTab === t.id ? "1px solid rgba(0,168,132,0.4)" : "1px solid rgba(255,255,255,0.06)",
                        background: contactFilterTab === t.id ? "rgba(0,168,132,0.2)" : "#202c33",
                        color: contactFilterTab === t.id ? "#00a884" : "#8696a0",
                      }}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              )}

              {/* CONTACTS LIST */}
              <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "8px" }}>
                {loadingContacts ? (
                  <div style={{ padding: "20px", textAlign: "center", color: "#8696a0" }}>Loading contacts…</div>
                ) : filteredContacts.length === 0 ? (
                  <div style={{ padding: "30px 10px", textAlign: "center", color: "#8696a0", fontSize: "13px" }}>
                    No contacts found
                  </div>
                ) : (
                  filteredContacts.map((c) => {
                    const isBlocked = c.status === "blacklist";
                    const isWhitelisted = c.status === "whitelist";
                    const isBusy = loadingPhone === c.phone;

                    return (
                      <div
                        key={c.phone}
                        style={{
                          background: "#202c33",
                          borderRadius: "10px",
                          padding: "10px 12px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: "10px",
                          border: "1px solid rgba(255,255,255,0.04)",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0, flex: 1 }}>
                          <UserAvatar phone={c.phone} name={c.notes} size={36} fontSize={13} />
                          <div style={{ minWidth: 0 }}>
                            <div style={{ color: "#e9edef", fontSize: "13px", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {c.notes || c.phone}
                            </div>
                            <div style={{ color: isWhitelisted ? "#00a884" : isBlocked ? "#ef4444" : "#f59e0b", fontSize: "11px", fontWeight: 600 }}>
                              {isWhitelisted ? "AI Allowed" : isBlocked ? "Blocked" : "Pending"}
                            </div>
                          </div>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
                          {isBlocked ? (
                            <button
                              disabled={isBusy}
                              onClick={() => toggleContactStatus(c.phone, "whitelist")}
                              style={{
                                padding: "4px 10px",
                                borderRadius: "6px",
                                border: "1px solid rgba(0,168,132,0.4)",
                                background: "rgba(0,168,132,0.15)",
                                color: "#00a884",
                                fontSize: "11px",
                                fontWeight: 700,
                                cursor: "pointer",
                              }}
                            >
                              {isBusy ? "Unblocking..." : "Unblock"}
                            </button>
                          ) : (
                            <button
                              disabled={isBusy}
                              onClick={() => toggleContactStatus(c.phone, "blacklist")}
                              style={{
                                padding: "4px 10px",
                                borderRadius: "6px",
                                border: "1px solid rgba(239,68,68,0.4)",
                                background: "rgba(239,68,68,0.15)",
                                color: "#ef4444",
                                fontSize: "11px",
                                fontWeight: 700,
                                cursor: "pointer",
                              }}
                            >
                              {isBusy ? "Blocking..." : "Block"}
                            </button>
                          )}

                          <button
                            onClick={() => handleDeleteContact(c.phone)}
                            title="Delete Contact"
                            style={{
                              background: "none",
                              border: "none",
                              color: "#8696a0",
                              cursor: "pointer",
                              padding: "4px",
                            }}
                          >
                            <TrashIcon />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* POLICY VIEW IN SIDEBAR */}
          {sidebarView === "policy" && (
            <div style={{ padding: "16px", overflowY: "auto", flex: 1 }}>
              <h3 style={{ color: "#e9edef", fontSize: "15px", fontWeight: 700, margin: "0 0 4px 0" }}>
                Unknown Contact Policy
              </h3>
              <p style={{ color: "#8696a0", fontSize: "12px", margin: "0 0 16px 0", lineHeight: 1.5 }}>
                Configure how your AI Agent responds when a new, unlisted contact messages your WhatsApp line.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {[
                  { id: "allow", title: "Allow All", desc: "AI automatically responds to all new numbers." },
                  { id: "ask", title: "Ask First", desc: "Sends an opt-in confirmation message before engaging." },
                  { id: "block", title: "Block All", desc: "Ignores unknown numbers and leaves them for manual reply." },
                ].map((p) => {
                  const isSelected = policy === p.id;
                  return (
                    <div
                      key={p.id}
                      onClick={() => handleSavePolicy(p.id)}
                      style={{
                        padding: "12px 14px",
                        borderRadius: "10px",
                        background: isSelected ? "rgba(0,168,132,0.12)" : "#202c33",
                        border: isSelected ? "1.5px solid #00a884" : "1px solid rgba(255,255,255,0.06)",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                      }}
                    >
                      <div style={{ color: isSelected ? "#00a884" : "#e9edef", fontWeight: 700, fontSize: "13px", marginBottom: "3px" }}>
                        {p.title}
                      </div>
                      <div style={{ color: "#8696a0", fontSize: "11px", lineHeight: 1.4 }}>
                        {p.desc}
                      </div>
                    </div>
                  );
                })}
              </div>

              {savedPolicyNotice && (
                <div style={{ marginTop: "16px", color: "#00a884", fontSize: "12px", fontWeight: 700, textAlign: "center" }}>
                  ✅ Policy saved successfully!
                </div>
              )}
            </div>
          )}

          {/* ─────────────────────────────────────────────
             BOTTOM FIXED NAVIGATION BAR
          ───────────────────────────────────────────── */}
          <div
            style={{
              height: "56px",
              background: "#202c33",
              borderTop: "1px solid rgba(255,255,255,0.06)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-around",
              padding: "0 6px",
              flexShrink: 0,
            }}
          >
            {[
              {
                id: "chats",
                label: "Chats",
                icon: <ChatBubbleIcon />,
                badge: conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0),
              },
              {
                id: "contacts",
                label: "Contacts",
                icon: <UserGroupIcon />,
                badge: contacts.length,
              },
              {
                id: "blocked",
                label: "Blocked",
                icon: <BanIcon />,
                badge: contacts.filter((c) => c.status === "blacklist").length,
              },
              {
                id: "policy",
                label: "Policy",
                icon: <ShieldCheckIcon />,
                badge: null,
              },
            ].map((tab) => {
              const isActive = sidebarView === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setSidebarView(tab.id);
                    if (isMobile && tab.id !== "chats") setShowSidebar(true);
                  }}
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "3px",
                    background: "none",
                    border: "none",
                    color: isActive ? "#00a884" : "#8696a0",
                    fontSize: "11px",
                    fontWeight: isActive ? 700 : 500,
                    cursor: "pointer",
                    padding: "6px 0",
                    position: "relative",
                    transition: "color 0.15s ease",
                  }}
                >
                  <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {tab.icon}
                    {tab.badge > 0 && (
                      <span
                        style={{
                          position: "absolute",
                          top: "-4px",
                          right: "-8px",
                          minWidth: "16px",
                          height: "16px",
                          borderRadius: "999px",
                          background: tab.id === "blocked" ? "#ef4444" : "#00a884",
                          color: "#ffffff",
                          fontSize: "9px",
                          fontWeight: 800,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          padding: "0 4px",
                        }}
                      >
                        {tab.badge}
                      </span>
                    )}
                  </div>
                  <span>{tab.label}</span>
                  {isActive && (
                    <div
                      style={{
                        position: "absolute",
                        bottom: 0,
                        width: "24px",
                        height: "3px",
                        borderRadius: "999px",
                        background: "#00a884",
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ─────────────────────────────────────────────
           MAIN CHAT AREA WITH TILE WALLPAPER
        ───────────────────────────────────────────── */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            background: "#0b141a",
            position: "relative",
          }}
        >
          {!selected ? (
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "20px",
                padding: "40px 24px",
                background: "#111b21",
                borderBottom: "6px solid #00a884",
                position: "relative",
              }}
            >
              <div
                style={{
                  width: "88px",
                  height: "88px",
                  borderRadius: "50%",
                  background: "rgba(0,168,132,0.12)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <WhatsAppLogoIcon size={56} />
              </div>

              <div style={{ textAlign: "center", maxWidth: "420px" }}>
                <h2
                  style={{
                    color: "#e9edef",
                    fontSize: "22px",
                    fontWeight: 300,
                    margin: "0 0 10px 0",
                  }}
                >
                  Pax26 WhatsApp Web
                </h2>
                <p
                  style={{
                    color: "#8696a0",
                    fontSize: "13.5px",
                    margin: 0,
                    lineHeight: 1.6,
                  }}
                >
                  Send and receive messages seamlessly without keeping your phone online. Use AI automations to handle customer chats or take over manually anytime.
                </p>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  color: "#667781",
                  fontSize: "13px",
                  marginTop: "24px",
                }}
              >
                <LockIcon size={13} />
                <span>End-to-end encrypted</span>
              </div>
            </div>
          ) : (
            <>
              {/* CHAT HEADER */}
              <div
                style={{
                  height: "60px",
                  background: "#202c33",
                  borderBottom: "1px solid rgba(255,255,255,0.05)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 14px",
                  position: "sticky",
                  top: 0,
                  zIndex: 10,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  {isMobile && (
                    <button
                      onClick={() => setShowSidebar(true)}
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

                  {/* INITIAL AVATAR & CONTACT INFO IN HEADER */}
                  <div
                    onClick={() => setShowMobileLeadDetails((v) => !v)}
                    style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer" }}
                    title="Click to view Lead Details"
                  >
                    <UserAvatar
                      phone={selected.phone}
                      name={selectedContact?.notes || selectedConv?.notes}
                      size={40}
                      fontSize={14}
                    />

                    <div>
                      <div
                        style={{
                          color: "#e9edef",
                          fontSize: "14px",
                          fontWeight: 600,
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        {selectedContact?.notes || selectedConv?.notes ? (
                          <>
                            <span>{selectedContact?.notes || selectedConv?.notes}</span>
                            <span style={{ color: "#00a884", fontSize: "12px", fontWeight: 600 }}>
                              ({selected.phone})
                            </span>
                          </>
                        ) : (
                          selected.phone
                        )}
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
                            background: selectedConv?.isHandedOff ? "#f59e0b" : "#00a884",
                          }}
                        />

                        <span style={{ color: "#8696a0", fontSize: "11px" }}>
                          {selectedConv?.isHandedOff ? "Managed by you" : "Agent Active"}
                        </span>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowFlowInfo(!showFlowInfo);
                          }}
                          style={{
                            background: "transparent",
                            border: "none",
                            color: "#8696a0",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            padding: "2px",
                          }}
                          title="How it works"
                        >
                          <InfoIcon />
                        </button>

                        {selectedContact?.leadStage && (
                          <span
                            style={{
                              padding: "2px 8px",
                              borderRadius: "999px",
                              background: LEAD_STAGES[selectedContact.leadStage]?.bg,
                              color: LEAD_STAGES[selectedContact.leadStage]?.color,
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
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  {/* LEAD DETAILS TOGGLE BUTTON */}
                  <button
                    onClick={() => setShowMobileLeadDetails((v) => !v)}
                    title="Lead Details"
                    style={{
                      background: showMobileLeadDetails ? "rgba(0,168,132,0.2)" : "none",
                      border: "none",
                      color: showMobileLeadDetails ? "#00a884" : "#8696a0",
                      padding: "8px",
                      borderRadius: "50%",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <UserPlusIcon size={18} />
                  </button>

                  {/* IN-CHAT SEARCH TOGGLE */}
                  <button
                    onClick={() => setShowChatSearch((v) => !v)}
                    title="Search in conversation"
                    style={{
                      background: showChatSearch ? "rgba(0,168,132,0.2)" : "none",
                      border: "none",
                      color: showChatSearch ? "#00a884" : "#8696a0",
                      padding: "8px",
                      borderRadius: "50%",
                      cursor: "pointer",
                    }}
                  >
                    <SearchIcon />
                  </button>

                  {selectedConv?.isHandedOff ? (
                    <button
                      disabled={takingOver}
                      onClick={() => handleHandoff("handback")}
                      style={{
                        padding: "8px 14px",
                        borderRadius: "8px",
                        border: "none",
                        background: "#005c4b",
                        color: "white",
                        fontSize: "12px",
                        fontWeight: 700,
                        cursor: takingOver ? "not-allowed" : "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        opacity: takingOver ? 0.7 : 1,
                      }}
                    >
                      {takingOver ? (
                        <>
                          <span
                            style={{
                              width: "12px",
                              height: "12px",
                              borderRadius: "50%",
                              border: "2px solid rgba(255,255,255,0.3)",
                              borderTopColor: "#fff",
                              animation: "inbox-spin 0.65s linear infinite",
                              display: "inline-block",
                              flexShrink: 0,
                            }}
                          />
                          Handing Back…
                        </>
                      ) : (
                        "Hand Back"
                      )}
                    </button>
                  ) : (
                    <button
                      disabled={takingOver}
                      onClick={() => handleHandoff("takeover")}
                      style={{
                        padding: "8px 14px",
                        borderRadius: "8px",
                        border: "none",
                        background: "#f59e0b",
                        color: "white",
                        fontSize: "12px",
                        fontWeight: 700,
                        cursor: takingOver ? "not-allowed" : "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        opacity: takingOver ? 0.7 : 1,
                      }}
                    >
                      {takingOver ? (
                        <>
                          <span
                            style={{
                              width: "12px",
                              height: "12px",
                              borderRadius: "50%",
                              border: "2px solid rgba(255,255,255,0.3)",
                              borderTopColor: "#fff",
                              animation: "inbox-spin 0.65s linear infinite",
                              display: "inline-block",
                              flexShrink: 0,
                            }}
                          />
                          Taking Over…
                        </>
                      ) : (
                        "Take Over"
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* IN-CHAT SEARCH INPUT BAR */}
              <AnimatePresence>
                {showChatSearch && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    style={{
                      background: "#111b21",
                      padding: "8px 14px",
                      borderBottom: "1px solid rgba(255,255,255,0.06)",
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <SearchIcon />
                    <input
                      type="text"
                      value={chatSearchQuery}
                      onChange={(e) => setChatSearchQuery(e.target.value)}
                      placeholder="Search messages in this chat…"
                      style={{
                        flex: 1,
                        background: "none",
                        border: "none",
                        outline: "none",
                        color: "#e9edef",
                        fontSize: "13px",
                      }}
                    />
                    {chatSearchQuery && (
                      <button
                        onClick={() => setChatSearchQuery("")}
                        style={{ background: "none", border: "none", color: "#8696a0", cursor: "pointer" }}
                      >
                        <XIcon />
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* MESSAGES AREA WITH CLASSIC WHATSAPP TILE WALLPAPER */}
              <div
                ref={messagesContainerRef}
                style={{
                  flex: 1,
                  overflowY: "auto",
                  padding: isMobile ? "16px 16px 140px 16px" : "16px",
                  backgroundColor: "#0b141a",
                  backgroundImage: `
                    radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.02) 1px, transparent 1px),
                    url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M10 10h10v10H10zM50 50h10v10H50zM30 10a5 5 0 1 0 0 10 5 5 0 0 0 0-10zM70 30a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM20 60l5-8 5 8zM60 10l5 8-8-3z'/%3E%3C/g%3E%3C/svg%3E")
                  `,
                  backgroundSize: "100px 100px",
                  position: "relative",
                }}
              >
                <AnimatePresence>
                  {filteredMessages.map((msg) => {
                    const isOutbound = msg.direction === "outbound";
                    const isHuman = msg.senderType === "human";
                    const imageUrls = msg.mediaUrl
                      ? [msg.mediaUrl]
                      : resolvedMediaUrls[msg.messageId]
                      ? [resolvedMediaUrls[msg.messageId]]
                      : msg.aiMeta?.imageUrls || [];

                    return (
                      <motion.div
                        key={msg._id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.18 }}
                        style={{
                          display: "flex",
                          justifyContent: isOutbound ? "flex-end" : "flex-start",
                          marginBottom: "10px",
                        }}
                      >
                        {msg.aiMeta?.isReceipt ? (
                          /* RECEIPT CARD */
                          <div
                            style={{
                              maxWidth: isMobile ? "88%" : "70%",
                              borderRadius: "12px",
                              overflow: "hidden",
                              boxShadow: "0 4px 16px rgba(0,0,0,0.35)",
                              border: "1px solid rgba(16,185,129,0.3)",
                            }}
                          >
                            <div
                              style={{
                                background: "linear-gradient(135deg, #005c4b 0%, #065f46 100%)",
                                padding: "10px 14px",
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                              }}
                            >
                              <span style={{ fontSize: "18px" }}>🧾</span>
                              <div>
                                <div style={{ color: "#10b981", fontSize: "10px", fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                                  Order Receipt Sent
                                </div>
                                <div style={{ color: "#e9edef", fontSize: "12px", fontWeight: 700 }}>
                                  Payment Confirmed ✅
                                </div>
                              </div>
                              {msg.aiMeta?.receiptProofCode && (
                                <div
                                  style={{
                                    marginLeft: "auto",
                                    background: "rgba(16,185,129,0.2)",
                                    border: "1px solid rgba(16,185,129,0.4)",
                                    borderRadius: "6px",
                                    padding: "3px 8px",
                                    color: "#10b981",
                                    fontSize: "11px",
                                    fontWeight: 800,
                                    letterSpacing: "0.05em",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  #{msg.aiMeta.receiptProofCode}
                                </div>
                              )}
                            </div>
                            <div
                              style={{
                                background: "#1a2e27",
                                padding: "10px 14px",
                                color: "#b2ccc7",
                                fontSize: "11.5px",
                                lineHeight: 1.65,
                                whiteSpace: "pre-wrap",
                                wordBreak: "break-word",
                                maxHeight: "180px",
                                overflowY: "auto",
                              }}
                            >
                              {msg.text}
                            </div>
                            <div
                              style={{
                                background: "#1a2e27",
                                padding: "4px 14px 8px",
                                display: "flex",
                                justifyContent: "flex-end",
                                alignItems: "center",
                                gap: "4px",
                                fontSize: "10px",
                                color: "rgba(255,255,255,0.4)",
                                borderTop: "1px solid rgba(255,255,255,0.04)",
                              }}
                            >
                              {formatMessageTime(msg.createdAt)}
                              <MessageStatusIcon status={msg.status || "read"} />
                            </div>
                          </div>
                        ) : (
                          /* STANDARD BUBBLE */
                          <div
                            style={{
                              maxWidth: isMobile ? "88%" : "70%",
                              padding: "8px 12px",
                              borderRadius: isOutbound ? "8px 0 8px 8px" : "0 8px 8px 8px",
                              background: isOutbound
                                ? isHuman
                                  ? "#f59e0b"
                                  : "#005c4b"
                                : "#202c33",
                              color: "#e9edef",
                              fontSize: "13px",
                              lineHeight: 1.5,
                              boxShadow: "0 1px 1px rgba(0,0,0,0.08)",
                              border: isOutbound ? "none" : "1px solid rgba(255,255,255,0.04)",
                              wordBreak: "break-word",
                            }}
                          >
                            {isOutbound && isHuman && (
                              <div
                                style={{
                                  fontSize: "10px",
                                  fontWeight: 800,
                                  letterSpacing: "0.06em",
                                  textTransform: "uppercase",
                                  color: "rgba(255,255,255,0.75)",
                                  marginBottom: "4px",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "4px",
                                }}
                              >
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                                </svg>
                                You
                              </div>
                            )}

                            {imageUrls.length > 0 && (
                              <div
                                style={{
                                  marginBottom:
                                    msg.text &&
                                    msg.text !== "📷 Image" &&
                                    msg.text !== "[Customer sent an image]"
                                      ? "6px"
                                      : 0,
                                }}
                              >
                                {imageUrls.map((url, i) => (
                                  <div key={i} style={{ position: "relative", display: "block" }}>
                                    <a
                                      href={msg._uploading ? undefined : url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      style={{ display: "block" }}
                                    >
                                      <img
                                        src={url}
                                        alt="WhatsApp attachment"
                                        style={{
                                          maxWidth: "100%",
                                          maxHeight: "280px",
                                          borderRadius: "6px",
                                          objectFit: "cover",
                                          cursor: msg._uploading ? "default" : "pointer",
                                          opacity: msg._uploading ? 0.55 : 1,
                                          transition: "opacity 0.2s ease",
                                        }}
                                      />
                                    </a>
                                  </div>
                                ))}
                              </div>
                            )}

                            {msg.text &&
                              msg.text !== "📷 Image" &&
                              msg.text !== "[Customer sent an image]" && <div>{msg.text}</div>}

                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "flex-end",
                                gap: "4px",
                                marginTop: "4px",
                                fontSize: "10px",
                                color: "rgba(255,255,255,0.6)",
                              }}
                            >
                              {formatMessageTime(msg.createdAt)}
                              {isOutbound && <MessageStatusIcon status={msg.status || "read"} />}
                            </div>
                          </div>
                        )}
                      </motion.div>
                    );
                  })}

                  {/* AGENT TYPING INDICATOR */}
                  {sending && <TypingIndicator />}
                </AnimatePresence>
              </div>

              {/* IMAGE PREVIEW PANEL */}
              {imagePreview && selectedConv?.isHandedOff && (
                <div style={{ padding: "12px", background: "#1a2730", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                  <div style={{ display: "flex", gap: "12px", alignItems: "flex-end" }}>
                    <div style={{ position: "relative", flexShrink: 0 }}>
                      <img
                        src={imagePreview}
                        alt="preview"
                        style={{
                          width: "64px",
                          height: "64px",
                          objectFit: "cover",
                          borderRadius: "10px",
                          border: "2px solid rgba(255,255,255,0.1)",
                        }}
                      />
                      <button
                        onClick={cancelImagePreview}
                        style={{
                          position: "absolute",
                          top: "-6px",
                          right: "-6px",
                          width: "18px",
                          height: "18px",
                          borderRadius: "50%",
                          background: "#ef4444",
                          border: "none",
                          color: "white",
                          fontSize: "10px",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        ✕
                      </button>
                    </div>

                    <input
                      type="text"
                      placeholder="Add a caption…"
                      value={imageCaption}
                      onChange={(e) => setImageCaption(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSendImage();
                      }}
                      style={{
                        flex: 1,
                        height: "42px",
                        borderRadius: "12px",
                        border: "none",
                        outline: "none",
                        padding: "0 14px",
                        background: "#2a3942",
                        color: "#e9edef",
                        fontSize: "13px",
                      }}
                    />

                    <button
                      onClick={handleSendImage}
                      disabled={sendingImage}
                      style={{
                        width: "46px",
                        height: "46px",
                        borderRadius: "50%",
                        border: "none",
                        background: sendingImage ? "#2a3942" : "#00a884",
                        color: "white",
                        cursor: sendingImage ? "not-allowed" : "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      {sendingImage ? (
                        <div
                          style={{
                            width: "16px",
                            height: "16px",
                            borderRadius: "50%",
                            border: "2px solid rgba(255,255,255,0.2)",
                            borderTopColor: "#fff",
                            animation: "inbox-spin 0.65s linear infinite",
                          }}
                        />
                      ) : (
                        <SendIcon />
                      )}
                    </button>
                  </div>
                </div>
              )}

              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleImageFilePicked}
              />

              {/* REPLY BAR */}
              <div
                style={{
                  padding: isMobile ? "8px 10px 10px 10px" : "10px 14px",
                  background: "#202c33",
                  borderTop: "1px solid rgba(255,255,255,0.08)",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  position: "sticky",
                  bottom: 0,
                  zIndex: 10,
                }}
              >
                {selectedConv?.isHandedOff && (
                  <button
                    onClick={() => imageInputRef.current?.click()}
                    title="Send image"
                    disabled={sendingImage}
                    style={{
                      width: "42px",
                      height: "42px",
                      borderRadius: "50%",
                      border: "none",
                      background: "#2a3942",
                      color: sendingImage ? "#444" : "#8696a0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: sendingImage ? "not-allowed" : "pointer",
                      flexShrink: 0,
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                  </button>
                )}

                <textarea
                  ref={inputRef}
                  value={replyText}
                  readOnly={!selectedConv?.isHandedOff}
                  onClick={() => {
                    if (!selectedConv?.isHandedOff) {
                      setIsAlertVisible(true);
                    }
                  }}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  rows={1}
                  placeholder={selectedConv?.isHandedOff ? "Type a message" : "Take over to reply"}
                  onInput={(e) => {
                    e.target.style.height = "auto";
                    e.target.style.height = `${e.target.scrollHeight}px`;
                  }}
                  style={{
                    flex: 1,
                    minHeight: "42px",
                    maxHeight: "120px",
                    borderRadius: "20px",
                    border: "1px solid rgba(255,255,255,0.08)",
                    outline: "none",
                    padding: "10px 16px",
                    background: "#2a3942",
                    color: "#e9edef",
                    fontSize: "14px",
                    lineHeight: 1.4,
                    overflowY: "auto",
                    resize: "none",
                    opacity: selectedConv?.isHandedOff ? 1 : 0.65,
                  }}
                />

                <button
                  onClick={handleSend}
                  disabled={sending || !replyText.trim() || !selectedConv?.isHandedOff}
                  style={{
                    width: "42px",
                    height: "42px",
                    borderRadius: "50%",
                    border: "none",
                    background: replyText.trim() && selectedConv?.isHandedOff ? "#00a884" : "#2a3942",
                    color: replyText.trim() && selectedConv?.isHandedOff ? "#ffffff" : "#8696a0",
                    cursor: replyText.trim() && selectedConv?.isHandedOff ? "pointer" : "not-allowed",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    transition: "all 0.2s ease",
                  }}
                >
                  <SendIcon />
                </button>
              </div>

              {/* Takeover Notice Overlay */}
              <AnimatePresence>
                {!selectedConv?.isHandedOff && isAlertVisible && (
                  <motion.div
                    initial={{ opacity: 0, y: 20, x: "-50%" }}
                    animate={{ opacity: 1, y: 0, x: "-50%" }}
                    exit={{ opacity: 0, y: 20, x: "-50%" }}
                    style={{
                      position: "absolute",
                      bottom: "80px",
                      left: "50%",
                      width: "90%",
                      maxWidth: "380px",
                      background: "rgba(17, 27, 33, 0.75)",
                      backdropFilter: "blur(20px)",
                      border: "1px solid rgba(245, 158, 11, 0.4)",
                      padding: "24px",
                      borderRadius: "28px",
                      boxShadow: "0 25px 50px rgba(0,0,0,0.6)",
                      zIndex: 50,
                      color: "#fff",
                      textAlign: "center",
                    }}
                  >
                    <button
                      onClick={() => setIsAlertVisible(false)}
                      style={{
                        position: "absolute",
                        top: "16px",
                        right: "16px",
                        width: "28px",
                        height: "28px",
                        borderRadius: "50%",
                        background: "rgba(255,255,255,0.05)",
                        border: "none",
                        color: "#8696a0",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                      }}
                    >
                      <CloseIcon />
                    </button>

                    <div
                      style={{
                        width: "48px",
                        height: "48px",
                        background: "#f59e0b",
                        borderRadius: "16px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 16px",
                        boxShadow: "0 0 25px rgba(245, 158, 11, 0.4)",
                      }}
                    >
                      <LockIcon size={24} />
                    </div>
                    <div style={{ fontWeight: 800, fontSize: "18px", marginBottom: "8px" }}>
                      Smart Agent Active
                    </div>
                    <p style={{ fontSize: "14px", opacity: 0.9, marginBottom: "24px", lineHeight: 1.6 }}>
                      Our Smart Agent is currently managing this conversation. To send a manual message, please take over first.
                    </p>
                    <button
                      disabled={takingOver}
                      onClick={() => handleHandoff("takeover")}
                      style={{
                        width: "100%",
                        background: "#f59e0b",
                        color: "#fff",
                        border: "none",
                        padding: "14px",
                        borderRadius: "16px",
                        fontWeight: 800,
                        fontSize: "14px",
                        cursor: takingOver ? "not-allowed" : "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px",
                      }}
                    >
                      {takingOver ? "Taking Over…" : "Take Over Now"}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
        </div>

        {/* LEAD PANEL (DESKTOP) */}
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

        {/* MOBILE & SMALL SCREEN LEAD DETAILS POPUP MODAL */}
        <AnimatePresence>
          {showMobileLeadDetails && selected && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMobileLeadDetails(false)}
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.75)",
                backdropFilter: "blur(6px)",
                zIndex: 200,
                display: "flex",
                alignItems: isMobile ? "flex-end" : "center",
                justifyContent: "center",
                padding: isMobile ? 0 : "20px",
              }}
            >
              <motion.div
                initial={{ y: isMobile ? "100%" : 20, scale: isMobile ? 1 : 0.95 }}
                animate={{ y: 0, scale: 1 }}
                exit={{ y: isMobile ? "100%" : 20, scale: isMobile ? 1 : 0.95 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                onClick={(e) => e.stopPropagation()}
                style={{
                  width: "100%",
                  maxWidth: "420px",
                  maxHeight: "85vh",
                  background: "#111b21",
                  borderRadius: isMobile ? "24px 24px 0 0" : "20px",
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  boxShadow: "0 -10px 40px rgba(0,0,0,0.6)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <LeadPanel
                  contact={selectedContact}
                  phone={selected.phone}
                  onClose={() => setShowMobileLeadDetails(false)}
                  onUpdate={(u) =>
                    setSelectedContact((p) => ({
                      ...p,
                      ...u,
                    }))
                  }
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ─────────────────────────────────────────────
         ADD CONTACT MODAL
      ───────────────────────────────────────────── */}
      <AnimatePresence>
        {showAddContactModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.7)",
              backdropFilter: "blur(4px)",
              zIndex: 150,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "16px",
            }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 10 }}
              style={{
                width: "100%",
                maxWidth: "440px",
                background: "#111b21",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "16px",
                padding: "24px",
                color: "#e9edef",
                boxShadow: "0 20px 40px rgba(0,0,0,0.6)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 700 }}>Add New Contact</h3>
                <button
                  onClick={() => setShowAddContactModal(false)}
                  style={{ background: "none", border: "none", color: "#8696a0", cursor: "pointer" }}
                >
                  <CloseIcon />
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "#8696a0", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>
                    Phone Number
                  </label>
                  <input
                    type="text"
                    placeholder="+2348012345678"
                    value={addPhone}
                    onChange={(e) => setAddPhone(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: "10px",
                      background: "#202c33",
                      border: "1px solid rgba(255,255,255,0.08)",
                      color: "#e9edef",
                      fontSize: "14px",
                      outline: "none",
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "#8696a0", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>
                    Notes / Name (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={addNotes}
                    onChange={(e) => setAddNotes(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: "10px",
                      background: "#202c33",
                      border: "1px solid rgba(255,255,255,0.08)",
                      color: "#e9edef",
                      fontSize: "14px",
                      outline: "none",
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "#8696a0", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>
                    AI Handling Rule
                  </label>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <button
                      onClick={() => setAddStatus("whitelist")}
                      style={{
                        flex: 1,
                        padding: "10px",
                        borderRadius: "8px",
                        border: addStatus === "whitelist" ? "1.5px solid #00a884" : "1px solid rgba(255,255,255,0.08)",
                        background: addStatus === "whitelist" ? "rgba(0,168,132,0.15)" : "#202c33",
                        color: addStatus === "whitelist" ? "#00a884" : "#8696a0",
                        fontSize: "12px",
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      ✓ Whitelist (AI On)
                    </button>
                    <button
                      onClick={() => setAddStatus("blacklist")}
                      style={{
                        flex: 1,
                        padding: "10px",
                        borderRadius: "8px",
                        border: addStatus === "blacklist" ? "1.5px solid #ef4444" : "1px solid rgba(255,255,255,0.08)",
                        background: addStatus === "blacklist" ? "rgba(239,68,68,0.15)" : "#202c33",
                        color: addStatus === "blacklist" ? "#ef4444" : "#8696a0",
                        fontSize: "12px",
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      ✕ Blacklist (Block AI)
                    </button>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                  <button
                    onClick={() => setShowAddContactModal(false)}
                    style={{
                      flex: 1,
                      padding: "12px",
                      borderRadius: "10px",
                      border: "none",
                      background: "#202c33",
                      color: "#8696a0",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    disabled={!addPhone.trim() || addingContact}
                    onClick={() => handleCreateContact()}
                    style={{
                      flex: 1,
                      padding: "12px",
                      borderRadius: "10px",
                      border: "none",
                      background: "#00a884",
                      color: "white",
                      fontWeight: 700,
                      cursor: addPhone.trim() ? "pointer" : "not-allowed",
                      opacity: addPhone.trim() ? 1 : 0.6,
                    }}
                  >
                    {addingContact ? "Adding..." : "Save Contact"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
