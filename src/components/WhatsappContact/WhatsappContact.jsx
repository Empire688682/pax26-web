"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGlobalContext } from "../Context";

/* ── Icons ───────────────────────────────────────────────── */
const ShieldIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);
const UserCheckIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
    <polyline points="16 11 18 13 22 9" />
  </svg>
);
const UserXIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
    <line x1="17" y1="11" x2="23" y2="17" /><line x1="23" y1="11" x2="17" y2="17" />
  </svg>
);
const UsersIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
const MessageIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);
const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
const ArrowRightIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
  </svg>
);
const CheckIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const SearchIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);
const InfoIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);
const TagIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
    <line x1="7" y1="7" x2="7.01" y2="7" />
  </svg>
);
const ClockIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
  </svg>
);
const NoteIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
  </svg>
);
const ChevronDownIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);
const XIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

/* ── Spinner ─────────────────────────────────────────────── */
const Spinner = () => (
  <div style={{
    width: "14px", height: "14px",
    border: "2px solid rgba(255,255,255,0.3)",
    borderTopColor: "#fff",
    borderRadius: "50%",
    animation: "spin 0.7s linear infinite",
  }} />
);

/* ── Helpers ─────────────────────────────────────────────── */
const formatRelativeTime = (date) => {
  if (!date) return null;
  const d = new Date(date);
  const now = new Date();
  const diff = Math.floor((now - d) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
};

const formatDate = (date) => {
  if (!date) return "—";
  return new Date(date).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
};

/* ── Themed primitives ───────────────────────────────────── */
const fieldBase = (pax26) => ({
  width: "100%",
  background: pax26?.secondaryBg,
  color: pax26?.textPrimary,
  border: `1px solid ${pax26?.border}`,
  borderRadius: "10px",
  padding: "10px 14px",
  fontSize: "14px",
  fontFamily: "inherit",
  outline: "none",
  transition: "border-color 0.2s, box-shadow 0.2s",
  boxSizing: "border-box",
});

const FieldLabel = ({ children, pax26 }) => (
  <label style={{
    display: "block",
    fontSize: "11px",
    fontWeight: 600,
    letterSpacing: "0.07em",
    textTransform: "uppercase",
    color: pax26?.textPrimary,
    opacity: 0.7,
    marginBottom: "6px",
  }}>
    {children}
  </label>
);

const ThemedInput = ({ label, pax26, style, icon, ...props }) => {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom: "4px" }}>
      {label && <FieldLabel pax26={pax26}>{label}</FieldLabel>}
      <div style={{ position: "relative" }}>
        {icon && (
          <div style={{
            position: "absolute", left: "12px", top: "50%",
            transform: "translateY(-50%)", color: pax26?.textPrimary, opacity: 0.4,
            pointerEvents: "none",
          }}>
            {icon}
          </div>
        )}
        <input
          {...props}
          style={{
            ...fieldBase(pax26),
            paddingLeft: icon ? "36px" : "14px",
            borderColor: focused ? pax26?.primary : pax26?.border,
            boxShadow: focused ? `0 0 0 3px ${pax26?.primary}18` : "none",
            ...style,
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
      </div>
    </div>
  );
};

const ThemedTextarea = ({ label, pax26, style, ...props }) => {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom: "4px" }}>
      {label && <FieldLabel pax26={pax26}>{label}</FieldLabel>}
      <textarea
        {...props}
        style={{
          ...fieldBase(pax26),
          resize: "vertical",
          minHeight: "72px",
          borderColor: focused ? pax26?.primary : pax26?.border,
          boxShadow: focused ? `0 0 0 3px ${pax26?.primary}18` : "none",
          ...style,
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
    </div>
  );
};

/* ── Tag Input ───────────────────────────────────────────── */
const TagInput = ({ tags, onChange, pax26 }) => {
  const [input, setInput] = useState("");
  const [focused, setFocused] = useState(false);

  const addTag = (val) => {
    const trimmed = val.trim().replace(/,+$/, "");
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
    }
    setInput("");
  };

  const handleKey = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(input);
    } else if (e.key === "Backspace" && !input && tags.length) {
      onChange(tags.slice(0, -1));
    }
  };

  const removeTag = (t) => onChange(tags.filter(x => x !== t));

  return (
    <div>
      <FieldLabel pax26={pax26}>Tags</FieldLabel>
      <div style={{
        display: "flex", flexWrap: "wrap", gap: "6px", alignItems: "center",
        padding: "8px 10px", borderRadius: "10px",
        background: pax26?.secondaryBg,
        border: `1px solid ${focused ? pax26?.primary : pax26?.border}`,
        boxShadow: focused ? `0 0 0 3px ${pax26?.primary}18` : "none",
        transition: "border-color 0.2s, box-shadow 0.2s",
        minHeight: "40px",
      }}>
        {tags.map(t => (
          <span key={t} style={{
            display: "inline-flex", alignItems: "center", gap: "5px",
            padding: "3px 8px", borderRadius: "999px", fontSize: "11px", fontWeight: 600,
            background: `${pax26?.primary}18`, color: pax26?.primary,
            border: `1px solid ${pax26?.primary}33`,
          }}>
            {t}
            <span onClick={() => removeTag(t)} style={{ cursor: "pointer", opacity: 0.7, lineHeight: 1 }}>
              <XIcon />
            </span>
          </span>
        ))}
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          onFocus={() => setFocused(true)}
          onBlur={() => { setFocused(false); if (input.trim()) addTag(input); }}
          placeholder={tags.length ? "" : "Add tags (press Enter)…"}
          style={{
            flex: 1, minWidth: "100px", border: "none", outline: "none",
            background: "transparent", fontSize: "13px", color: pax26?.textPrimary,
            fontFamily: "inherit",
          }}
        />
      </div>
    </div>
  );
};

/* ── Toggle Switch ───────────────────────────────────────── */
const Toggle = ({ checked, onChange, pax26 }) => (
  <div
    onClick={() => onChange(!checked)}
    style={{
      width: "40px", height: "22px", borderRadius: "999px",
      background: checked ? pax26?.primary : pax26?.border,
      position: "relative", cursor: "pointer",
      transition: "background 0.2s",
      flexShrink: 0,
    }}
  >
    <div style={{
      position: "absolute", top: "3px",
      left: checked ? "21px" : "3px",
      width: "16px", height: "16px",
      borderRadius: "50%", background: "#fff",
      transition: "left 0.2s",
      boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
    }} />
  </div>
);

/* ── Stat Card ───────────────────────────────────────────── */
const StatCard = ({ label, value, color, pax26 }) => (
  <div style={{
    background: pax26?.secondaryBg,
    borderRadius: "8px",
    padding: "8px",
    flex: 1,
    minWidth: 0,
  }}>
    <div
    className="text-xs md:sm" 
    style={{  color: pax26?.textPrimary, opacity: 0.5, marginBottom: "6px", fontWeight: 600, letterSpacing: "0.04em", textTransform: "capitalize" }}>
      {label}
    </div>
    <div style={{ fontSize: "25px", fontWeight: 900, color: color || pax26?.textPrimary, letterSpacing: "-0.02em" }}>
      {value}
    </div>
  </div>
);

/* ── Contact Card ────────────────────────────────────────── */
const ContactCard = ({ contact, toggleContact, pax26 }) => {
  const [expanded, setExpanded] = useState(false);
  const isWhitelist = contact.status === "whitelist";
  const isBlacklist = contact.status === "blacklist";

  const badgeStyle = isWhitelist
    ? { background: `${pax26?.primary}18`, color: pax26?.primary }
    : { background: "rgba(220,53,53,0.12)", color: "#dc3535" };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
      style={{
        background: pax26?.card || pax26?.bg,
        border: `1px solid ${pax26?.border}`,
        borderRadius: "12px",
        overflow: "hidden",
        transition: "border-color 0.2s",
      }}
      onMouseEnter={e => e.currentTarget.style.borderColor = pax26?.primary + "33"}
      onMouseLeave={e => e.currentTarget.style.borderColor = pax26?.border}
    >
      {/* ── Main row ── */}
      <div className="text-sm" style={{fontSize: "11px", display: "flex", alignItems: "center", gap: "12px", padding: "12px 14px" }}>
        {/* Phone */}
        <div style={{ display: "flex", flexDirection: "column", gap: "4px", flex: 1 }}>
          <div style={{fontWeight: 600, color: pax26?.textPrimary, marginBottom: "2px" }}>
            {contact.phone}
          </div>
          {/* Meta row */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            {contact.lastMessageAt && (
              <span style={{ display: "flex", alignItems: "center", gap: "3px", color: pax26?.textPrimary, opacity: 0.45 }}>
                <ClockIcon />{formatRelativeTime(contact.lastMessageAt)}
              </span>
            )}
            {contact.tags?.length > 0 && (
              <span style={{ display: "flex", alignItems: "center", gap: "3px", color: pax26?.textPrimary, opacity: 0.45 }}>
                <TagIcon />{contact.tags.slice(0, 2).join(", ")}{contact.tags.length > 2 ? ` +${contact.tags.length - 2}` : ""}
              </span>
            )}
          </div>
        </div>

        {/* Message count badge */}
        {contact.messageCount > 0 && (
          <div style={{
            display: "flex", alignItems: "center", gap: "4px",
            padding: "3px 9px", borderRadius: "999px", flexShrink: 0,
            fontWeight: 700,
            background: pax26?.secondaryBg,
            border: `1px solid ${pax26?.border}`,
            color: pax26?.textPrimary, opacity: 0.7,
          }}>
            <MessageIcon />
            {contact.messageCount}
          </div>
        )}

        {/* Status badge */}
        <div 
        className="md:flex hidden"
        style={{
          fontWeight: 700, padding: "3px 10px",
          borderRadius: "999px", flexShrink: 0,
          letterSpacing: "0.04em", textTransform: "capitalize",
          ...badgeStyle,
        }}>
          {isWhitelist ? "AI on" : "AI off"}
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
          {isWhitelist && (
            <button
              onClick={() => toggleContact(contact?.phone, "blacklist")}
              style={{
                padding: "5px 10px", borderRadius: "8px", fontWeight: 600,
                border: "1px solid rgba(220,53,53,0.25)",
                background: "rgba(220,53,53,0.06)",
                color: "#dc3535", cursor: "pointer",
              }}
            >
              Blacklist
            </button>
          )}
          {isBlacklist && (
            <button
              onClick={() => toggleContact(contact?.phone, "whitelist")}
              style={{
                padding: "5px 10px", borderRadius: "8px", fontWeight: 600,
                border: `1px solid ${pax26?.primary}44`,
                background: `${pax26?.primary}12`,
                color: pax26?.primary, cursor: "pointer",
              }}
            >
              Whitelist
            </button>
          )}
        </div>

        {/* Expand toggle */}
        {(contact.notes || contact.tags?.length > 0 || contact.createdAt) && (
          <button
            onClick={() => setExpanded(v => !v)}
            style={{
              background: "none", border: "none", cursor: "pointer",
              color: pax26?.textPrimary, opacity: 0.4, padding: "4px",
              display: "flex", alignItems: "center",
              transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.2s, opacity 0.2s",
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = "0.8"}
            onMouseLeave={e => e.currentTarget.style.opacity = "0.4"}
          >
            <ChevronDownIcon />
          </button>
        )}
      </div>

      {/* ── Expanded details ── */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: "hidden" }}
          >
            <div style={{
              padding: "12px 14px 14px",
              borderTop: `1px solid ${pax26?.border}`,
              background: pax26?.secondaryBg,
              display: "flex", flexDirection: "column", gap: "10px",
            }}>
              {/* Tags */}
              {contact.tags?.length > 0 && (
                <div>
                  <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: pax26?.textPrimary, opacity: 0.45, marginBottom: "6px" }}>
                    Tags
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                    {contact.tags.map(t => (
                      <span key={t} style={{
                        padding: "3px 9px", borderRadius: "999px", fontSize: "11px", fontWeight: 600,
                        background: `${pax26?.primary}18`, color: pax26?.primary,
                        border: `1px solid ${pax26?.primary}30`,
                      }}>
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              {contact.notes && (
                <div>
                  <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: pax26?.textPrimary, opacity: 0.45, marginBottom: "4px" }}>
                    Notes
                  </div>
                  <p style={{ fontSize: "12px", color: pax26?.textPrimary, opacity: 0.65, margin: 0, lineHeight: 1.6 }}>
                    {contact.notes}
                  </p>
                </div>
              )}

              {/* Dates */}
              <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
                {contact.createdAt && (
                  <div>
                    <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: pax26?.textPrimary, opacity: 0.4, marginBottom: "2px" }}>
                      Added
                    </div>
                    <div style={{ fontSize: "12px", color: pax26?.textPrimary, opacity: 0.6 }}>
                      {formatDate(contact.createdAt)}
                    </div>
                  </div>
                )}
                {contact.updatedAt && (
                  <div>
                    <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: pax26?.textPrimary, opacity: 0.4, marginBottom: "2px" }}>
                      Updated
                    </div>
                    <div style={{ fontSize: "12px", color: pax26?.textPrimary, opacity: 0.6 }}>
                      {formatDate(contact.updatedAt)}
                    </div>
                  </div>
                )}
                {contact.lastMessageAt && (
                  <div>
                    <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: pax26?.textPrimary, opacity: 0.4, marginBottom: "2px" }}>
                      Last message
                    </div>
                    <div style={{ fontSize: "12px", color: pax26?.textPrimary, opacity: 0.6 }}>
                      {formatDate(contact.lastMessageAt)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

/* ── Policy Pill ─────────────────────────────────────────── */
const PolicyPill = ({ label, description, value, current, onClick, pax26 }) => {
  const isActive = current === value;
  const colors = {
    allow: { bg: `${pax26?.primary}18`, color: pax26?.primary, border: `${pax26?.primary}44` },
    ask: { bg: "rgba(245,158,11,0.12)", color: "#f59e0b", border: "rgba(245,158,11,0.4)" },
    block: { bg: "rgba(220,53,53,0.1)", color: "#dc3535", border: "rgba(220,53,53,0.35)" },
  };
  const c = colors[value];
  return (
    <button
      onClick={() => onClick(value)}
      style={{
        flex: 1, padding: "14px", borderRadius: "12px", textAlign: "left",
        border: isActive ? `1.5px solid ${c.border}` : `1px solid ${pax26?.border}`,
        background: isActive ? c.bg : pax26?.secondaryBg,
        cursor: "pointer", transition: "all 0.2s",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
        <span style={{ fontSize: "13px", fontWeight: 700, color: isActive ? c.color : pax26?.textPrimary }}>
          {label}
        </span>
        {isActive && (
          <div style={{
            width: "18px", height: "18px", borderRadius: "50%",
            background: c.color, display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <CheckIcon />
          </div>
        )}
      </div>
      <p style={{ fontSize: "11px", color: pax26?.textPrimary, opacity: 0.5, lineHeight: 1.5, margin: 0 }}>
        {description}
      </p>
    </button>
  );
};

/* ── Main Component ──────────────────────────────────────── */
export default function WhatsappContact() {
  const { pax26, userData } = useGlobalContext();

  const [contacts, setContacts] = useState([]);
  const [policy, setPolicy] = useState("allow");
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [phone, setPhone] = useState("");
  const [newTags, setNewTags] = useState([]);
  const [newNotes, setNewNotes] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [addingContact, setAddingContact] = useState(false);
  const [saved, setSaved] = useState(false);

  const tabs = [
    { key: "all", label: "All" },
    { key: "whitelist", label: "Whitelist" },
    { key: "blacklist", label: "Blacklist" },
  ];

  const filtered = contacts.filter(c => {
    const matchTab = activeTab === "all" || c.status === activeTab;
    const matchSearch = !search
      || c.phone.includes(search)
      || c.tags?.some(t => t.toLowerCase().includes(search.toLowerCase()))
      || c.notes?.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  const stats = {
    total: contacts.length,
    whitelist: contacts.filter(c => c.status === "whitelist").length,
    blacklist: contacts.filter(c => c.status === "blacklist").length,
    totalMessages: contacts.reduce((s, c) => s + (c.messageCount || 0), 0),
  };

  const fetchContacts = async () => {
    try {
      const response = await fetch("/api/whatsapp/contacts");
      if (response.ok) {
        const data = await response.json();
        setContacts(data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch contacts:", error);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, [userData]);

  const toggleContact = async (phone, status) => {
    if (!phone || !status) return;
    setAddingContact(true);
    try {
      const cleanedPhone = phone.replace(/\D/g, "");
      const last10 = cleanedPhone.slice(-10);
      const response = await fetch("/api/whatsapp/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: last10, status }),
      });
      if (response.ok) {
        setPhone("");
        await fetchContacts();
      } else {
        console.error("Failed to add contact:", await response.text());
      }
    } catch (error) {
      console.error("Failed to toggle contact:", error);
    } finally {
      setAddingContact(false);
    }
  };

  const handleAddContact = async (status) => {
    if (!phone.trim()) return;
    setAddingContact(true);
    try {
      const cleanedPhone = phone.replace(/\D/g, "");
      const last10 = cleanedPhone.slice(-10);
      const response = await fetch("/api/whatsapp/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: last10,
          status,
          tags: newTags,
          notes: newNotes,
        }),
      });
      if (response.ok) {
        setPhone("");
        setNewTags([]);
        setNewNotes("");
        setShowAddForm(false);
        await fetchContacts();
      } else {
        console.error("Failed to add contact:", await response.text());
      }
    } catch (error) {
      console.error("Failed to add contact:", error);
    } finally {
      setAddingContact(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await fetch("/api/contact/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ policy, contacts }),
      });
      if (response.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch (error) {
      console.error("Failed to save contact settings:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", paddingBottom: "80px", paddingTop: "24px", maxWidth: "720px", margin: "0 auto" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* ── Page header ── */}
      <div style={{ marginBottom: "32px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
          <div style={{
            width: "32px", height: "32px", borderRadius: "10px",
            display: "flex", alignItems: "center", justifyContent: "center",
            background: `${pax26?.primary}22`, color: pax26?.textPrimary,
          }}>
            <ShieldIcon />
          </div>
          <p style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: pax26?.textPrimary, opacity: 0.5 }}>
            Contact Policy
          </p>
        </div>
        <h1 style={{ fontSize: "26px", fontWeight: 900, letterSpacing: "-0.02em", color: pax26?.textPrimary, marginBottom: "4px" }}>
          Manage AI contacts
        </h1>
        <p style={{ fontSize: "14px", color: pax26?.textPrimary, opacity: 0.5, lineHeight: 1.5 }}>
          Control who your AI responds to — whitelist customers, block personal contacts.
        </p>
      </div>

      {/* ── Stats ── */}
      <div style={{ display: "flex", gap: "5px", marginBottom: "24px" }}>
        <StatCard label="Total" value={stats.total} pax26={pax26} />
        <StatCard label="Whitelisted" value={stats.whitelist} color={pax26?.primary} pax26={pax26} />
        <StatCard label="Blocked" value={stats.blacklist} color="#dc3535" pax26={pax26} />
        <StatCard label="Messages" value={stats.totalMessages} pax26={pax26} />
      </div>

      {/* ── Unknown contact policy ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        style={{
          background: pax26?.card || pax26?.bg,
          border: `1px solid ${pax26?.border}`,
          borderRadius: "16px",
          padding: "20px",
          marginBottom: "16px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px", paddingBottom: "16px", borderBottom: `1px solid ${pax26?.border}` }}>
          <div style={{
            width: "38px", height: "38px", borderRadius: "10px", flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: pax26?.primary, color: "#fff",
          }}>
            <UsersIcon />
          </div>
          <div>
            <h2 style={{ fontSize: "15px", fontWeight: 700, color: pax26?.textPrimary, marginBottom: "2px" }}>
              Unknown contact policy
            </h2>
            <p style={{ fontSize: "12px", color: pax26?.textPrimary, opacity: 0.5 }}>
              How should AI handle first-time messages?
            </p>
          </div>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <PolicyPill value="allow" current={policy} onClick={setPolicy} pax26={pax26} label="Allow all" description="AI replies to every new contact automatically" />
          <PolicyPill value="ask" current={policy} onClick={setPolicy} pax26={pax26} label="Ask first" description="Send opt-in prompt before AI engages" />
          <PolicyPill value="block" current={policy} onClick={setPolicy} pax26={pax26} label="Block all" description="AI ignores all unknown numbers silently" />
        </div>
      </motion.div>

      {/* ── Contact Manager ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.08 }}
        style={{
          background: pax26?.card || pax26?.bg,
          border: `1px solid ${pax26?.border}`,
          borderRadius: "16px",
          padding: "20px",
          marginBottom: "16px",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px", paddingBottom: "16px", borderBottom: `1px solid ${pax26?.border}` }}>
          <div style={{
            width: "38px", height: "38px", borderRadius: "10px", flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: `${pax26?.primary}18`, color: pax26?.textPrimary,
          }}>
            <UserCheckIcon className="md:flex hidden" />
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: "15px", fontWeight: 700, color: pax26?.textPrimary, marginBottom: "2px" }}>
              Contact manager
            </h2>
            <p style={{ fontSize: "12px", color: pax26?.textPrimary, opacity: 0.5 }}>
              Add, remove and manage individual contact rules
            </p>
          </div>
          <button
            onClick={() => setShowAddForm(v => !v)}
            style={{
              display: "flex", alignItems: "center", gap: "6px",
              padding: "8px 14px", borderRadius: "10px",
              fontSize: "12px", fontWeight: 700, cursor: "pointer",
              border: `1px solid ${pax26?.primary}44`,
              background: showAddForm ? `${pax26?.primary}20` : `${pax26?.primary}10`,
              color: pax26?.primary, transition: "all 0.2s",
            }}
          >
            <PlusIcon /> Add contact
          </button>
        </div>

        {/* ── Add contact form (expandable) ── */}
        <AnimatePresence>
          {showAddForm && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22 }}
              style={{ overflow: "hidden" }}
            >
              <div style={{
                padding: "16px",
                marginBottom: "16px",
                borderRadius: "12px",
                background: pax26?.secondaryBg,
                border: `1px solid ${pax26?.border}`,
                display: "flex", flexDirection: "column", gap: "12px",
              }}>
                <ThemedInput
                  pax26={pax26}
                  label="Phone number"
                  placeholder="+2349154358139"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.15 12 19.79 19.79 0 0 1 1.08 3.4 2 2 0 0 1 3.05 1.19h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 8.11a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 15.1v1.82z" /></svg>}
                />
                <TagInput tags={newTags} onChange={setNewTags} pax26={pax26} />
                <ThemedTextarea
                  pax26={pax26}
                  label="Notes (optional)"
                  placeholder="Add a note about this contact…"
                  value={newNotes}
                  onChange={e => setNewNotes(e.target.value)}
                />
                <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                  <button
                    onClick={() => { setShowAddForm(false); setPhone(""); setNewTags([]); setNewNotes(""); }}
                    style={{
                      padding: "9px 16px", borderRadius: "10px", fontSize: "13px", fontWeight: 600,
                      border: `1px solid ${pax26?.border}`, background: "transparent",
                      color: pax26?.textPrimary, cursor: "pointer", opacity: 0.6,
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleAddContact("blacklist")}
                    disabled={!phone.trim() || addingContact}
                    style={{
                      display: "flex", alignItems: "center", gap: "6px",
                      padding: "9px 16px", borderRadius: "10px",
                      fontSize: "13px", fontWeight: 700, cursor: phone.trim() ? "pointer" : "not-allowed",
                      border: "1px solid rgba(220,53,53,0.3)",
                      background: "rgba(220,53,53,0.08)", color: "#dc3535",
                      opacity: phone.trim() ? 1 : 0.5,
                    }}
                  >
                    {addingContact ? <Spinner /> : <><UserXIcon /> Block</>}
                  </button>
                  <button
                    onClick={() => handleAddContact("whitelist")}
                    disabled={!phone.trim() || addingContact}
                    style={{
                      display: "flex", alignItems: "center", gap: "6px",
                      padding: "9px 16px", borderRadius: "10px",
                      fontSize: "13px", fontWeight: 700, cursor: phone.trim() ? "pointer" : "not-allowed",
                      border: `1px solid ${pax26?.primary}44`,
                      background: `${pax26?.primary}15`, color: pax26?.primary,
                      opacity: phone.trim() ? 1 : 0.5,
                    }}
                  >
                    {addingContact ? <Spinner /> : <><UserCheckIcon /> Allow</>}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tabs + Search */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "14px", flexWrap: "wrap" }}>
          <div style={{ display: "flex", gap: "4px" }}>
            {tabs.map(t => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                style={{
                  padding: "6px 14px", borderRadius: "999px", fontSize: "12px", fontWeight: 600,
                  cursor: "pointer", transition: "all 0.15s",
                  border: activeTab === t.key ? `1.5px solid ${pax26?.primary}55` : `1px solid ${pax26?.border}`,
                  background: activeTab === t.key ? `${pax26?.primary}15` : "transparent",
                  color: activeTab === t.key ? pax26?.primary : pax26?.textPrimary,
                  opacity: activeTab === t.key ? 1 : 0.6,
                }}
              >
                {t.label}
                {t.key !== "all" && (
                  <span style={{ marginLeft: "4px", opacity: 0.7 }}>
                    ({stats[t.key] || 0})
                  </span>
                )}
              </button>
            ))}
          </div>
          <div style={{ flex: 1, minWidth: "160px" }}>
            <ThemedInput
              pax26={pax26}
              placeholder="Search phone, tags, notes…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              icon={<SearchIcon />}
              style={{ padding: "8px 12px 8px 34px" }}
            />
          </div>
        </div>

        {/* Contact list */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px", minHeight: "80px" }}>
          <AnimatePresence>
            {filtered.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{ textAlign: "center", padding: "32px 16px", color: pax26?.textPrimary, opacity: 0.35, fontSize: "13px" }}
              >
                No contacts found
              </motion.div>
            ) : (
              filtered.map((contact) => (
                <ContactCard
                  key={contact.phone}
                  contact={contact}
                  toggleContact={toggleContact}
                  pax26={pax26}
                />
              ))
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* ── Info Banner ── */}
      <div style={{
        display: "flex", alignItems: "flex-start", gap: "10px",
        padding: "14px 16px", borderRadius: "12px",
        background: `${pax26?.primary}10`,
        border: `1px solid ${pax26?.primary}22`,
        marginBottom: "24px",
      }}>
        <div style={{ color: pax26?.primary, marginTop: "1px", flexShrink: 0 }}>
          <InfoIcon className="md:flex hidden"/>
        </div>
        <p style={{ fontSize: "12px", color: pax26?.textPrimary, opacity: 0.6, lineHeight: 1.6, margin: 0 }}>
          Blacklisted contacts will never receive AI replies. When a new unknown contact messages you, the policy above determines how the AI handles them. Changes take effect immediately on your next incoming message.
        </p>
      </div>

      {/* ── Save Button ── */}
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button
          onClick={handleSave}
          disabled={saving || saved}
          style={{
            display: "flex", alignItems: "center", gap: "8px",
            padding: "12px 28px", borderRadius: "12px",
            fontSize: "14px", fontWeight: 700, cursor: saving || saved ? "default" : "pointer",
            background: saved ? "rgba(29,158,117,0.15)" : pax26?.primary,
            color: saved ? "#1D9E75" : "#fff",
            border: saved ? "1.5px solid rgba(29,158,117,0.4)" : "none",
            boxShadow: saved || saving ? "none" : `0 8px 24px ${pax26?.primary}40`,
            transition: "all 0.2s",
            opacity: saving ? 0.8 : 1,
          }}
        >
          {saving ? <><Spinner />Saving...</> : saved ? <><CheckIcon />Saved</> : <>Save policy<ArrowRightIcon /></>}
        </button>
      </div>
    </div>
  );
}