"use client";

import { useEffect, useState } from "react";
import { useGlobalContext } from "../Context";
import { Bell, CheckCheck, Check, RefreshCw, Inbox } from "lucide-react";

/* ── Keyframes + font ─────────────────────────────────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Syne:wght@600;700;800&display=swap');

  .nt-root { font-family: 'Syne', sans-serif; }
  .nt-mono { font-family: 'DM Mono', monospace; }

  @keyframes nt-slide   { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
  @keyframes nt-shimmer { 0%{background-position:-400px 0} 100%{background-position:400px 0} }
  @keyframes nt-spin    { to{transform:rotate(360deg)} }

  .nt-slide   { animation: nt-slide  0.4s ease both; }
  .nt-spin    { animation: nt-spin   0.75s linear infinite; }

  .nt-shimmer {
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent);
    background-size: 400px 100%;
    animation: nt-shimmer 1.4s ease-in-out infinite;
  }

  .nt-card { transition: transform 0.2s ease; }
  .nt-card:hover { transform: translateX(3px); }

  .nt-mark-btn { transition: opacity 0.15s ease, color 0.15s ease; }
  .nt-mark-btn:hover { opacity: 0.75; }

  .nt-refresh { transition: opacity 0.15s ease, transform 0.15s ease; }
  .nt-refresh:hover { opacity: 0.75; transform: rotate(-20deg); }
`;

/* ── Notification type config ─────────────────────────────────── */
function getTypeStyle(type) {
  const map = {
    success:  { color: "#22c55e", bg: "rgba(34,197,94,0.08)",  border: "rgba(34,197,94,0.2)"  },
    error:    { color: "#ef4444", bg: "rgba(239,68,68,0.08)",  border: "rgba(239,68,68,0.2)"  },
    warning:  { color: "#f59e0b", bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.2)" },
    info:     { color: "#38bdf8", bg: "rgba(56,189,248,0.08)", border: "rgba(56,189,248,0.2)" },
  };
  return map[type] || map.info;
}

/* ── Skeleton card ────────────────────────────────────────────── */
function SkeletonCard({ pax26 }) {
  return (
    <div className="relative rounded-2xl p-5 overflow-hidden"
      style={{ background: pax26?.bg, border: `1px solid ${pax26?.border}` }}>
      <div className="nt-shimmer absolute inset-0 pointer-events-none" />
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex-shrink-0" style={{ background: pax26?.secondaryBg }} />
          <div className="h-4 w-36 rounded-lg" style={{ background: pax26?.secondaryBg }} />
        </div>
        <div className="h-3 w-24 rounded-lg" style={{ background: pax26?.secondaryBg }} />
      </div>
      <div className="space-y-2 pl-12">
        <div className="h-3 w-full rounded" style={{ background: pax26?.secondaryBg }} />
        <div className="h-3 w-4/5 rounded" style={{ background: pax26?.secondaryBg }} />
      </div>
    </div>
  );
}

/* ── Notification card ────────────────────────────────────────── */
function NotifCard({ note, onMarkRead, pax26, style }) {
  const ts   = getTypeStyle(note.type);
  const unread = !note.isRead;

  return (
    <div className="nt-card relative rounded-2xl overflow-hidden"
      style={{
        background: pax26?.bg,
        border: `1px solid ${unread ? ts.border : pax26?.border}`,
        boxShadow: unread ? `0 0 0 1px ${ts.color}15` : "none",
        ...style,
      }}>

      {/* unread left accent */}
      {unread && (
        <div className="absolute top-0 left-0 bottom-0 w-0.5"
          style={{ background: ts.color }} />
      )}

      <div className="px-5 py-4">
        <div className="flex items-start gap-3">

          {/* icon dot */}
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
            style={{ background: ts.bg, color: ts.color }}>
            <Bell size={15} />
          </div>

          <div className="flex-1 min-w-0">
            {/* title + time row */}
            <div className="flex items-start justify-between gap-3 mb-1.5 flex-wrap">
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold leading-snug" style={{ color: pax26?.textPrimary }}>
                  {note.title}
                </p>
                {unread && (
                  <span className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: ts.color }} />
                )}
              </div>
              <span className="nt-mono text-[10px] flex-shrink-0"
                style={{ color: pax26?.textSecondary, opacity: 0.45 }}>
                {new Date(note.date).toLocaleString("en-NG", {
                  day: "2-digit", month: "short",
                  hour: "2-digit", minute: "2-digit", hour12: true,
                })}
              </span>
            </div>

            {/* message */}
            <p className="text-xs leading-relaxed" style={{ color: pax26?.textSecondary, opacity: 0.7 }}>
              {note.message}
            </p>

            {/* mark as read */}
            {unread && (
              <button
                onClick={() => onMarkRead(note._id)}
                className="nt-mark-btn flex items-center gap-1.5 mt-2.5 text-[11px] font-semibold"
                style={{ color: ts.color }}>
                <Check size={11} /> Mark as read
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Main page ────────────────────────────────────────────────── */
export default function Notification() {
  const { pax26 } = useGlobalContext();
  const [notifications, setNotifications]     = useState([]);
  const [loading, setLoading]                 = useState(false);
  const [spinning, setSpinning]               = useState(false);
  const apiUrl = process.env.NEXT_PUBLIC_ADMIN_URL;

  const primary  = pax26?.primary || "#3b82f6";
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${apiUrl}/notifications/all`, {
        method: "GET", credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
      }
    } catch (err) { console.error("Error fetching notifications:", err); }
    finally { setLoading(false); }
  };

  const handleRefresh = async () => {
    setSpinning(true);
    await fetchNotifications();
    setSpinning(false);
  };

  useEffect(() => { fetchNotifications(); }, []);

  const markAsRead = (id) =>
    setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));

  const markAllRead = () =>
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));

  return (
    <>
      <style>{CSS}</style>
      <div className="nt-root min-h-screen px-5 py-10" style={{ background: pax26?.secondaryBg }}>
        <div className="max-w-2xl mx-auto">

          {/* ── Header ──────────────────────────────────── */}
          <div className="nt-slide flex items-start justify-between gap-4 flex-wrap mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="nt-mono text-[10px] font-medium uppercase tracking-widest"
                  style={{ color: pax26?.textSecondary, opacity: 0.4 }}>
                  Account
                </span>
                <div className="h-px w-8" style={{ background: pax26?.border }} />
              </div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-extrabold" style={{ color: pax26?.textPrimary }}>
                  Notifications
                </h1>
                {unreadCount > 0 && (
                  <span className="nt-mono text-[11px] font-bold px-2.5 py-1 rounded-full text-white"
                    style={{ background: primary }}>
                    {unreadCount}
                  </span>
                )}
              </div>
              <p className="text-sm mt-1" style={{ color: pax26?.textSecondary, opacity: 0.55 }}>
                {unreadCount > 0
                  ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`
                  : "You're all caught up"}
              </p>
            </div>

            {/* actions */}
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="nt-mark-btn flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold"
                  style={{ background: pax26?.bg, color: pax26?.textSecondary, border: `1px solid ${pax26?.border}` }}>
                  <CheckCheck size={13} /> Mark all read
                </button>
              )}
              <button
                onClick={handleRefresh}
                className="nt-refresh w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: pax26?.bg, border: `1px solid ${pax26?.border}`, color: pax26?.textSecondary }}>
                <RefreshCw size={14} className={spinning ? "nt-spin" : ""} />
              </button>
            </div>
          </div>

          {/* ── Content ─────────────────────────────────── */}
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <SkeletonCard key={i} pax26={pax26} />
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4"
              style={{ color: pax26?.textSecondary }}>
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{ background: pax26?.bg, border: `1px solid ${pax26?.border}` }}>
                <Inbox size={28} style={{ opacity: 0.25 }} />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold mb-1" style={{ color: pax26?.textPrimary }}>
                  No notifications yet
                </p>
                <p className="text-xs" style={{ opacity: 0.45 }}>
                  You'll see updates and alerts here
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* unread section */}
              {notifications.filter(n => !n.isRead).length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-3">
                    <p className="nt-mono text-[10px] font-bold uppercase tracking-widest"
                      style={{ color: pax26?.textSecondary, opacity: 0.4 }}>
                      Unread
                    </p>
                    <div className="h-px flex-1" style={{ background: pax26?.border }} />
                  </div>
                  <div className="space-y-3">
                    {notifications.filter(n => !n.isRead).map((note, i) => (
                      <div key={note._id} className="nt-slide" style={{ animationDelay: `${i * 0.06}s` }}>
                        <NotifCard note={note} onMarkRead={markAsRead} pax26={pax26} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* read section */}
              {notifications.filter(n => n.isRead).length > 0 && (
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <p className="nt-mono text-[10px] font-bold uppercase tracking-widest"
                      style={{ color: pax26?.textSecondary, opacity: 0.4 }}>
                      Earlier
                    </p>
                    <div className="h-px flex-1" style={{ background: pax26?.border }} />
                  </div>
                  <div className="space-y-3">
                    {notifications.filter(n => n.isRead).map((note, i) => (
                      <div key={note._id} className="nt-slide" style={{ animationDelay: `${i * 0.05}s`, opacity: 0.75 }}>
                        <NotifCard note={note} onMarkRead={markAsRead} pax26={pax26} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

        </div>
      </div>
    </>
  );
}