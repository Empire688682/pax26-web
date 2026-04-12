"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGlobalContext } from "../Context";

/* ── Icons ───────────────────────────────────────────────── */
const BotIcon = () => (<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" y1="16" x2="8" y2="16"/><line x1="16" y1="16" x2="16" y2="16"/></svg>);
const UserIcon = () => (<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>);
const SendIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>);
const HandIcon = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0"/><path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0"/><path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0"/><path d="M18 11a2 2 0 1 1 4 0v3a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/></svg>);
const BotBackIcon = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.5"/></svg>);
const SearchIcon = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>);
const InboxIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>);
const CheckIcon = () => (<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>);
const DoubleCheckIcon = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/><polyline points="16 6 9 13"/></svg>);
const LeadIcon = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>);
const CalendarIcon = () => (<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>);
const NoteIcon = () => (<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>);

/* ── Lead stage config ───────────────────────────────────── */
const LEAD_STAGES = [
  { value: "new",       label: "New",       color: "#6366f1", bg: "rgba(99,102,241,0.12)"  },
  { value: "contacted", label: "Contacted", color: "#f59e0b", bg: "rgba(245,158,11,0.12)"  },
  { value: "qualified", label: "Qualified", color: "#3b82f6", bg: "rgba(59,130,246,0.12)"  },
  { value: "converted", label: "Converted", color: "#10b981", bg: "rgba(16,185,129,0.12)"  },
  { value: "lost",      label: "Lost",      color: "#ef4444", bg: "rgba(239,68,68,0.12)"   },
];
const getStage = (value) => LEAD_STAGES.find(s => s.value === value) || LEAD_STAGES[0];

/* ── Helpers ─────────────────────────────────────────────── */
const formatTime = (date) => {
  if (!date) return "";
  const diff = new Date() - new Date(date);
  if (diff < 60000) return "now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`;
  return new Date(date).toLocaleDateString(undefined, { month: "short", day: "numeric" });
};
const formatMessageTime = (date) => date ? new Date(date).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" }) : "";
const formatDate = (date) => date ? new Date(date).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : "";

const Spinner = ({ size = 16, color = "#fff" }) => (
  <div style={{ width: size, height: size, border: `2px solid ${color}22`, borderTopColor: color, borderRadius: "50%", animation: "spin 0.7s linear infinite", flexShrink: 0 }} />
);

/* ── Lead Panel ──────────────────────────────────────────── */
const LeadPanel = ({ contact, phone, pax26, onUpdate }) => {
  const [stage, setStage] = useState(contact?.leadStage || "new");
  const [notes, setNotes] = useState(contact?.notes || "");
  const [followUpAt, setFollowUpAt] = useState(contact?.followUpAt ? new Date(contact.followUpAt).toISOString().slice(0, 10) : "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setStage(contact?.leadStage || "new");
    setNotes(contact?.notes || "");
    setFollowUpAt(contact?.followUpAt ? new Date(contact.followUpAt).toISOString().slice(0, 10) : "");
  }, [contact, phone]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/automations/inbox/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, leadStage: stage, notes, followUpAt: followUpAt || null }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
        onUpdate?.({ leadStage: stage, notes, followUpAt });
      }
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  return (
    <div style={{ width: "250px", flexShrink: 0, borderLeft: `1px solid ${pax26?.border}`, display: "flex", flexDirection: "column", background: pax26?.card || pax26?.bg, overflowY: "auto" }}>
      {/* Header */}
      <div style={{ padding: "14px 14px 10px", borderBottom: `1px solid ${pax26?.border}`, display: "flex", alignItems: "center", gap: "8px" }}>
        <div style={{ width: "26px", height: "26px", borderRadius: "7px", background: `${pax26?.primary}18`, display: "flex", alignItems: "center", justifyContent: "center", color: pax26?.primary }}>
          <LeadIcon />
        </div>
        <span style={{ fontSize: "12px", fontWeight: 700, color: pax26?.textPrimary }}>Lead Info</span>
      </div>

      <div style={{ padding: "14px", display: "flex", flexDirection: "column", gap: "14px" }}>
        {/* Stage */}
        <div>
          <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: pax26?.textPrimary, opacity: 0.4, marginBottom: "7px" }}>Stage</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            {LEAD_STAGES.map(s => (
              <button key={s.value} onClick={() => setStage(s.value)}
                style={{ display: "flex", alignItems: "center", gap: "8px", padding: "7px 10px", borderRadius: "8px", cursor: "pointer", border: stage === s.value ? `1.5px solid ${s.color}55` : `1px solid ${pax26?.border}`, background: stage === s.value ? s.bg : "transparent", transition: "all 0.15s" }}>
                <div style={{ width: "7px", height: "7px", borderRadius: "50%", flexShrink: 0, background: s.color, boxShadow: stage === s.value ? `0 0 5px ${s.color}88` : "none" }} />
                <span style={{ fontSize: "12px", fontWeight: stage === s.value ? 700 : 500, color: stage === s.value ? s.color : pax26?.textPrimary, opacity: stage === s.value ? 1 : 0.55 }}>{s.label}</span>
                {stage === s.value && <div style={{ marginLeft: "auto", color: s.color }}><CheckIcon /></div>}
              </button>
            ))}
          </div>
        </div>

        {/* Follow-up date */}
        <div>
          <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: pax26?.textPrimary, opacity: 0.4, marginBottom: "6px", display: "flex", alignItems: "center", gap: "5px" }}>
            <CalendarIcon /> Follow-up
          </div>
          <input type="date" value={followUpAt} onChange={e => setFollowUpAt(e.target.value)} min={new Date().toISOString().slice(0, 10)}
            style={{ width: "100%", padding: "7px 10px", borderRadius: "8px", background: pax26?.secondaryBg, border: `1px solid ${pax26?.border}`, color: pax26?.textPrimary, fontSize: "12px", fontFamily: "inherit", outline: "none", boxSizing: "border-box" }}
          />
          {followUpAt && <div style={{ fontSize: "10px", color: pax26?.textPrimary, opacity: 0.35, marginTop: "4px" }}>{formatDate(followUpAt)}</div>}
        </div>

        {/* Notes */}
        <div>
          <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: pax26?.textPrimary, opacity: 0.4, marginBottom: "6px", display: "flex", alignItems: "center", gap: "5px" }}>
            <NoteIcon /> Notes
          </div>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Add a note..." rows={3}
            style={{ width: "100%", padding: "8px 10px", borderRadius: "8px", background: pax26?.secondaryBg, border: `1px solid ${pax26?.border}`, color: pax26?.textPrimary, fontSize: "12px", lineHeight: 1.5, fontFamily: "inherit", outline: "none", resize: "vertical", boxSizing: "border-box" }}
          />
        </div>

        {/* Source */}
        {contact?.leadSource && (
          <div>
            <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: pax26?.textPrimary, opacity: 0.4, marginBottom: "4px" }}>Source</div>
            <span style={{ fontSize: "11px", fontWeight: 600, padding: "2px 9px", borderRadius: "999px", background: `${pax26?.primary}15`, color: pax26?.primary, border: `1px solid ${pax26?.primary}25`, textTransform: "capitalize" }}>
              {contact.leadSource}
            </span>
          </div>
        )}

        {/* Stats */}
        {contact?.messageCount > 0 && (
          <div style={{ display: "flex", gap: "6px" }}>
            {[
              { label: "Total", value: contact.messageCount || 0, color: pax26?.textPrimary },
              { label: "Inbound", value: contact.inboundCount || 0, color: pax26?.primary },
            ].map(stat => (
              <div key={stat.label} style={{ flex: 1, padding: "8px", borderRadius: "8px", background: pax26?.secondaryBg, textAlign: "center" }}>
                <div style={{ fontSize: "16px", fontWeight: 900, color: stat.color }}>{stat.value}</div>
                <div style={{ fontSize: "9px", color: pax26?.textPrimary, opacity: 0.4, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>{stat.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Save */}
        <button onClick={handleSave} disabled={saving || saved}
          style={{ padding: "9px", borderRadius: "9px", fontSize: "12px", fontWeight: 700, cursor: saving || saved ? "default" : "pointer", background: saved ? "rgba(16,185,129,0.12)" : pax26?.primary, color: saved ? "#10b981" : "#fff", border: saved ? "1.5px solid rgba(16,185,129,0.3)" : "none", boxShadow: saved || saving ? "none" : `0 4px 12px ${pax26?.primary}30`, transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
          {saving ? <Spinner size={12} /> : saved ? <><CheckIcon /> Saved</> : "Save Lead Info"}
        </button>
      </div>
    </div>
  );
};

/* ── Main Component ──────────────────────────────────────── */
export default function WhatsAppInbox() {
  const { pax26 } = useGlobalContext();
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selected, setSelected] = useState(null);
  const [selectedContact, setSelectedContact] = useState(null);
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("all");
  const [replyText, setReplyText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [takingOver, setTakingOver] = useState(false);
  const messagesEndRef = useRef(null);
  const pollRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

  const fetchConversations = useCallback(async () => {
    try {
      const res = await fetch("/api/automations/inbox/conversations");
      if (res.ok) { const d = await res.json(); setConversations(d.data || []); }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  const fetchContact = useCallback(async (phone) => {
    try {
      const res = await fetch(`/api/automations/inbox/lead`);
      if (res.ok) {
        const d = await res.json();
        setSelectedContact(d.data?.find(c => c.phone === phone) || null);
      }
    } catch (e) { console.error(e); }
  }, []);

  const fetchMessages = useCallback(async (phone) => {
    if (!phone) return;
    try {
      const res = await fetch(`/api/automations/inbox/messages?phone=${encodeURIComponent(phone)}`);
      if (res.ok) {
        const d = await res.json();
        setMessages(d.data || []);
        setTimeout(scrollToBottom, 100);
        fetchConversations();
      }
    } catch (e) { console.error(e); }
  }, [fetchConversations]);

  useEffect(() => {
    fetchConversations();
    pollRef.current = setInterval(() => {
      fetchConversations();
      if (selected) fetchMessages(selected.phone);
    }, 8000);
    return () => clearInterval(pollRef.current);
  }, [fetchConversations, fetchMessages, selected]);

  useEffect(() => {
    if (selected) { fetchMessages(selected.phone); fetchContact(selected.phone); }
  }, [selected, fetchMessages, fetchContact]);

  useEffect(() => { scrollToBottom(); }, [messages]);

  const handleHandoff = async (action) => {
    if (!selected) return;
    setTakingOver(true);
    try {
      const res = await fetch("/api/automations/inbox/handoff", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, phone: selected.phone }),
      });
      if (res.ok) {
        setSelected(p => ({ ...p, isHandedOff: action === "takeover" }));
        setConversations(p => p.map(c => c.phone === selected.phone ? { ...c, isHandedOff: action === "takeover" } : c));
        // Auto-advance lead stage when taking over a new lead
        if (action === "takeover" && selectedContact?.leadStage === "new") {
          await fetch("/api/automations/inbox/lead", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ phone: selected.phone, leadStage: "contacted" }),
          });
          setSelectedContact(p => ({ ...p, leadStage: "contacted" }));
        }
      }
    } catch (e) { console.error(e); }
    finally { setTakingOver(false); }
  };

  const handleSend = async () => {
    if (!replyText.trim() || !selected || sending) return;
    setSending(true);
    const text = replyText.trim();
    setReplyText("");
    setMessages(p => [...p, { _id: `temp_${Date.now()}`, text, direction: "outbound", senderType: "human", createdAt: new Date().toISOString(), status: "sending" }]);
    setTimeout(scrollToBottom, 50);
    try {
      const res = await fetch("/api/automations/inbox/handoff", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reply", phone: selected.phone, message: text }),
      });
      if (res.ok) await fetchMessages(selected.phone);
    } catch (e) { console.error(e); }
    finally { setSending(false); inputRef.current?.focus(); }
  };

  const handleKeyDown = (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } };
  const selectedConv = selected ? conversations.find(c => c.phone === selected.phone) || selected : null;
  const filtered = conversations.filter(c => {
    const matchSearch = !search || c.phone.includes(search);
    const matchStage = stageFilter === "all" || c.leadStage === stageFilter;
    return matchSearch && matchStage;
  });

  return (
    <div style={{ display: "flex", height: "calc(100vh - 80px)", background: pax26?.bg, borderRadius: "16px", overflow: "hidden", border: `1px solid ${pax26?.border}` }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } } ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-thumb { background: ${pax26?.border}; border-radius: 99px; }`}</style>

      {/* ── Sidebar ── */}
      <div style={{ width: "295px", flexShrink: 0, borderRight: `1px solid ${pax26?.border}`, display: "flex", flexDirection: "column", background: pax26?.card || pax26?.bg }}>
        <div style={{ padding: "16px 14px 10px", borderBottom: `1px solid ${pax26?.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
            <div style={{ width: "30px", height: "30px", borderRadius: "9px", background: `${pax26?.primary}20`, display: "flex", alignItems: "center", justifyContent: "center", color: pax26?.primary }}><InboxIcon /></div>
            <div>
              <div style={{ fontSize: "14px", fontWeight: 800, color: pax26?.textPrimary, letterSpacing: "-0.02em" }}>Inbox</div>
              <div style={{ fontSize: "10px", color: pax26?.textPrimary, opacity: 0.35 }}>{conversations.length} conversations</div>
            </div>
          </div>
          <div style={{ position: "relative", marginBottom: "8px" }}>
            <div style={{ position: "absolute", left: "9px", top: "50%", transform: "translateY(-50%)", color: pax26?.textPrimary, opacity: 0.3 }}><SearchIcon /></div>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by phone..."
              style={{ width: "100%", padding: "7px 10px 7px 28px", borderRadius: "9px", background: pax26?.secondaryBg, border: `1px solid ${pax26?.border}`, color: pax26?.textPrimary, fontSize: "12px", outline: "none", fontFamily: "inherit", boxSizing: "border-box" }}
            />
          </div>
          {/* Stage filter */}
          <div style={{ display: "flex", gap: "3px", flexWrap: "wrap" }}>
            {[{ value: "all", label: "All", color: pax26?.primary, bg: `${pax26?.primary}15` }, ...LEAD_STAGES].map(s => (
              <button key={s.value} onClick={() => setStageFilter(s.value)}
                style={{ padding: "3px 9px", borderRadius: "999px", fontSize: "10px", fontWeight: 600, cursor: "pointer", border: stageFilter === s.value ? `1.5px solid ${s.color}55` : `1px solid ${pax26?.border}`, background: stageFilter === s.value ? s.bg : "transparent", color: stageFilter === s.value ? s.color : pax26?.textPrimary, opacity: stageFilter === s.value ? 1 : 0.45, transition: "all 0.15s" }}>
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto" }}>
          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "40px" }}><Spinner color={pax26?.primary} /></div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 16px", color: pax26?.textPrimary, opacity: 0.25, fontSize: "12px" }}>No conversations</div>
          ) : filtered.map(conv => {
            const isActive = selected?.phone === conv.phone;
            const stage = getStage(conv.leadStage || "new");
            return (
              <motion.div key={conv.phone} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                onClick={() => setSelected(conv)}
                style={{ padding: "10px 13px", cursor: "pointer", background: isActive ? `${pax26?.primary}10` : "transparent", borderLeft: isActive ? `3px solid ${pax26?.primary}` : "3px solid transparent", borderBottom: `1px solid ${pax26?.border}`, transition: "all 0.15s" }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = `${pax26?.primary}06`; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
              >
                <div style={{ display: "flex", gap: "9px" }}>
                  <div style={{ width: "35px", height: "35px", borderRadius: "50%", flexShrink: 0, background: conv.isHandedOff ? "rgba(245,158,11,0.12)" : `${pax26?.primary}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 700, color: conv.isHandedOff ? "#f59e0b" : pax26?.primary }}>
                    {conv.phone.slice(-2)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "2px" }}>
                      <span style={{ fontSize: "12px", fontWeight: 700, color: pax26?.textPrimary }}>{conv.phone}</span>
                      <span style={{ fontSize: "10px", color: pax26?.textPrimary, opacity: 0.3 }}>{formatTime(conv.lastMessageAt)}</span>
                    </div>
                    <div style={{ fontSize: "11px", color: pax26?.textPrimary, opacity: 0.4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginBottom: "5px" }}>
                      {conv.lastDirection === "outbound" ? "You: " : ""}{conv.lastMessage}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <span style={{ fontSize: "9px", fontWeight: 700, padding: "2px 7px", borderRadius: "999px", background: stage.bg, color: stage.color, textTransform: "uppercase", letterSpacing: "0.04em" }}>{stage.label}</span>
                      {conv.isHandedOff && <span style={{ fontSize: "9px", fontWeight: 700, padding: "2px 7px", borderRadius: "999px", background: "rgba(245,158,11,0.12)", color: "#f59e0b" }}>You</span>}
                      {conv.unreadCount > 0 && <span style={{ fontSize: "9px", fontWeight: 800, minWidth: "16px", height: "16px", borderRadius: "999px", background: pax26?.primary, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", padding: "0 4px", marginLeft: "auto" }}>{conv.unreadCount}</span>}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ── Chat Area ── */}
      {selected ? (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
          {/* Header */}
          <div style={{ padding: "11px 16px", borderBottom: `1px solid ${pax26?.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", background: pax26?.card || pax26?.bg }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ width: "37px", height: "37px", borderRadius: "50%", background: selectedConv?.isHandedOff ? "rgba(245,158,11,0.12)" : `${pax26?.primary}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 700, color: selectedConv?.isHandedOff ? "#f59e0b" : pax26?.primary }}>
                {selected.phone.slice(-2)}
              </div>
              <div>
                <div style={{ fontSize: "13px", fontWeight: 700, color: pax26?.textPrimary }}>{selected.phone}</div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: selectedConv?.isHandedOff ? "#f59e0b" : pax26?.primary }} />
                  <span style={{ fontSize: "11px", color: pax26?.textPrimary, opacity: 0.4 }}>{selectedConv?.isHandedOff ? "Managed by you" : "Managed by AI"}</span>
                  {selectedContact?.leadStage && (() => { const s = getStage(selectedContact.leadStage); return <span style={{ fontSize: "10px", fontWeight: 700, padding: "1px 8px", borderRadius: "999px", background: s.bg, color: s.color }}>{s.label}</span>; })()}
                </div>
              </div>
            </div>
            {selectedConv?.isHandedOff ? (
              <button onClick={() => handleHandoff("handback")} disabled={takingOver}
                style={{ display: "flex", alignItems: "center", gap: "6px", padding: "7px 14px", borderRadius: "9px", fontSize: "12px", fontWeight: 700, cursor: "pointer", border: `1px solid ${pax26?.primary}44`, background: `${pax26?.primary}12`, color: pax26?.primary }}>
                {takingOver ? <Spinner size={12} color={pax26?.primary} /> : <BotBackIcon />} Hand back to AI
              </button>
            ) : (
              <button onClick={() => handleHandoff("takeover")} disabled={takingOver}
                style={{ display: "flex", alignItems: "center", gap: "6px", padding: "7px 14px", borderRadius: "9px", fontSize: "12px", fontWeight: 700, cursor: "pointer", border: "1px solid rgba(245,158,11,0.35)", background: "rgba(245,158,11,0.1)", color: "#f59e0b" }}>
                {takingOver ? <Spinner size={12} color="#f59e0b" /> : <HandIcon />} Take over
              </button>
            )}
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: "auto", padding: "14px 18px", display: "flex", flexDirection: "column", gap: "3px", background: pax26?.bg }}>
            <AnimatePresence initial={false}>
              {messages.map((msg, i) => {
                const isOutbound = msg.direction === "outbound";
                const isAI = msg.senderType === "ai";
                const isHuman = msg.senderType === "human";
                const showLabel = i === 0 || messages[i - 1]?.senderType !== msg.senderType;
                return (
                  <motion.div key={msg._id} initial={{ opacity: 0, y: 8, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.18 }}
                    style={{ display: "flex", flexDirection: "column", alignItems: isOutbound ? "flex-end" : "flex-start", marginBottom: showLabel ? "4px" : "1px" }}>
                    {showLabel && (
                      <div style={{ display: "flex", alignItems: "center", gap: "4px", marginBottom: "4px", color: pax26?.textPrimary, opacity: 0.28, fontSize: "10px", fontWeight: 600, flexDirection: isOutbound ? "row-reverse" : "row" }}>
                        {isAI ? <BotIcon /> : <UserIcon />}
                        {isAI ? "AI" : isHuman ? "You" : "Customer"}
                      </div>
                    )}
                    <div style={{ maxWidth: "68%", padding: "9px 13px", borderRadius: isOutbound ? "16px 4px 16px 16px" : "4px 16px 16px 16px", background: isOutbound ? (isHuman ? "rgba(245,158,11,0.15)" : pax26?.primary) : pax26?.secondaryBg, border: isOutbound && isHuman ? "1px solid rgba(245,158,11,0.3)" : isOutbound ? "none" : `1px solid ${pax26?.border}`, color: isOutbound && !isHuman ? "#fff" : pax26?.textPrimary, fontSize: "13px", lineHeight: 1.55, wordBreak: "break-word", whiteSpace: "pre-wrap" }}>
                      {msg.text}
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "3px", marginTop: "4px", opacity: 0.45, fontSize: "10px", color: isOutbound && !isHuman ? "#fff" : pax26?.textPrimary }}>
                        {formatMessageTime(msg.createdAt)}
                        {isOutbound && (msg.status === "sending" ? <CheckIcon /> : <DoubleCheckIcon />)}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>

          {/* Reply bar */}
          <div style={{ padding: "10px 13px", borderTop: `1px solid ${pax26?.border}`, background: pax26?.card || pax26?.bg, display: "flex", gap: "8px", alignItems: "flex-end" }}>
            <textarea ref={inputRef} value={replyText} onChange={e => setReplyText(e.target.value)} onKeyDown={handleKeyDown}
              placeholder={selectedConv?.isHandedOff ? "Type a message... (Enter to send)" : "Take over to reply manually"}
              disabled={!selectedConv?.isHandedOff} rows={1}
              style={{ flex: 1, padding: "9px 12px", borderRadius: "10px", background: pax26?.secondaryBg, border: `1px solid ${selectedConv?.isHandedOff ? pax26?.primary + "44" : pax26?.border}`, color: pax26?.textPrimary, fontSize: "13px", fontFamily: "inherit", outline: "none", resize: "none", lineHeight: 1.5, maxHeight: "100px", overflowY: "auto", opacity: selectedConv?.isHandedOff ? 1 : 0.4, transition: "border-color 0.2s" }}
            />
            <button onClick={handleSend} disabled={!replyText.trim() || !selectedConv?.isHandedOff || sending}
              style={{ width: "37px", height: "37px", borderRadius: "10px", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: replyText.trim() && selectedConv?.isHandedOff ? pax26?.primary : pax26?.border, border: "none", cursor: replyText.trim() && selectedConv?.isHandedOff ? "pointer" : "not-allowed", color: "#fff", transition: "all 0.2s" }}>
              {sending ? <Spinner size={13} /> : <SendIcon />}
            </button>
          </div>
        </div>
      ) : (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: pax26?.textPrimary, opacity: 0.2, gap: "10px" }}>
          <InboxIcon />
          <div style={{ fontSize: "13px", fontWeight: 600 }}>Select a conversation</div>
        </div>
      )}

      {/* ── Lead Panel ── */}
      {selected && <LeadPanel contact={selectedContact} phone={selected.phone} pax26={pax26} onUpdate={u => setSelectedContact(p => ({ ...p, ...u }))} />}
    </div>
  );
}