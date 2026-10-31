"use client";
import React, { useEffect, useState } from "react";
import {
  Bot, Wifi, Zap,
  Bell, ArrowRight, Eye, EyeOff, TrendingUp,
  MessageSquare, Users, Layers, Crown, Sparkles,
  MessageCircle, Brain, Repeat,
  Activity, ChevronRight, BarChart2, Shield,
  Radio, Send, Store, Package,
  RefreshCw, ShoppingBag, AlertCircle,
} from "lucide-react";

import { useGlobalContext } from "../Context";
import WalletBalance from "../WalletBalance/WalletBalance";

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800;900&family=DM+Mono:wght@400;500&family=Outfit:wght@300;400;500;600;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; }

  /* Prevent horizontal overflow site-wide */
  html, body { overflow-x: hidden; max-width: 100%; }

  .px-root {
    font-family: 'Outfit', sans-serif;
    -webkit-font-smoothing: antialiased;
  }
  .px-display { font-family: 'Syne', sans-serif; }
  .px-mono    { font-family: 'DM Mono', monospace; }

  /* ── Animations ── */
  @keyframes px-rise {
    from { opacity: 0; transform: translateY(22px) scale(0.98); filter: blur(6px); }
    to   { opacity: 1; transform: translateY(0)   scale(1);    filter: blur(0);   }
  }
  @keyframes px-fade { from { opacity: 0; } to { opacity: 1; } }
  @keyframes px-shimmer {
    0%   { background-position: 200% center; }
    100% { background-position: -200% center; }
  }
  @keyframes px-breathe {
    0%, 100% { opacity: 0.55; transform: scale(1);    }
    50%       { opacity: 0.85; transform: scale(1.06); }
  }
  @keyframes px-pulse-ring {
    0%   { box-shadow: 0 0 0 0 rgba(52,211,153,0.55); }
    80%  { box-shadow: 0 0 0 10px rgba(52,211,153,0); }
    100% { box-shadow: 0 0 0 0 rgba(52,211,153,0);    }
  }
  @keyframes px-ticker {
    from { transform: translateX(0); }
    to   { transform: translateX(-50%); }
  }
  @keyframes px-bar-grow {
    from { width: 0; }
  }
  @keyframes px-count {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes px-glow-pulse {
    0%, 100% { box-shadow: 0 0 30px rgba(52,211,153,0.15), 0 0 60px rgba(59,130,246,0.08); }
    50%       { box-shadow: 0 0 50px rgba(52,211,153,0.28), 0 0 90px rgba(59,130,246,0.15); }
  }
  @keyframes px-spin {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }

  .px-s1 { animation: px-rise 0.6s cubic-bezier(0.16,1,0.3,1) 0.00s both; }
  .px-s2 { animation: px-rise 0.6s cubic-bezier(0.16,1,0.3,1) 0.08s both; }
  .px-s3 { animation: px-rise 0.6s cubic-bezier(0.16,1,0.3,1) 0.16s both; }
  .px-s4 { animation: px-rise 0.6s cubic-bezier(0.16,1,0.3,1) 0.24s both; }
  .px-s5 { animation: px-rise 0.6s cubic-bezier(0.16,1,0.3,1) 0.32s both; }
  .px-s6 { animation: px-rise 0.6s cubic-bezier(0.16,1,0.3,1) 0.40s both; }

  .px-breathe { animation: px-breathe 4s ease-in-out infinite; }
  .px-pulse   { animation: px-pulse-ring 2.5s ease-out infinite; }
  .px-glow    { animation: px-glow-pulse 3s ease-in-out infinite; }
  .px-spin    { animation: px-spin 1s linear infinite; }

  /* ── Cards ── */
  .px-glass {
    background: rgba(12, 20, 40, 0.72);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 20px;
    transition: border-color 0.25s ease, transform 0.25s cubic-bezier(0.16,1,0.3,1), box-shadow 0.25s ease;
  }
  .px-glass:hover {
    border-color: rgba(255,255,255,0.12);
    transform: translateY(-2px);
    box-shadow: 0 24px 60px rgba(0,0,0,0.45);
  }
  .px-glass-light {
    background: rgba(255,255,255,0.92);
    backdrop-filter: blur(24px);
    border: 1px solid rgba(0,0,0,0.06);
    border-radius: 20px;
    transition: border-color 0.25s ease, transform 0.25s cubic-bezier(0.16,1,0.3,1), box-shadow 0.25s ease;
  }
  .px-glass-light:hover {
    border-color: rgba(0,0,0,0.1);
    transform: translateY(-2px);
    box-shadow: 0 20px 50px rgba(0,0,0,0.1);
  }

  /* ── Buttons ── */
  .px-btn {
    transition: opacity 0.15s ease, transform 0.2s cubic-bezier(0.16,1,0.3,1), box-shadow 0.2s ease;
    cursor: pointer;
    border: none;
    outline: none;
  }
  .px-btn:hover  { opacity: 0.9; transform: translateY(-2px); }
  .px-btn:active { transform: translateY(0); }

  /* ── Service pill ── */
  .px-svc {
    display: flex; flex-direction: column; align-items: center;
    gap: 9px; padding: 16px 8px;
    border-radius: 16px; cursor: pointer; border: none;
    transition: transform 0.22s cubic-bezier(0.16,1,0.3,1), box-shadow 0.22s ease, background 0.22s ease;
    position: relative; overflow: hidden;
  }
  .px-svc::before {
    content: ""; position: absolute; inset: 0;
    background: radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.07), transparent 70%);
    opacity: 0; transition: opacity 0.25s ease;
  }
  .px-svc:hover { transform: translateY(-5px); }
  .px-svc:hover::before { opacity: 1; }
  .px-svc:active { transform: translateY(-1px); }

  /* ── Shimmer bar ── */
  .px-shimmer {
    background: linear-gradient(90deg, #34d399 0%, #22d3ee 40%, #818cf8 70%, #34d399 100%);
    background-size: 200% 100%;
    animation: px-shimmer 3s linear infinite, px-bar-grow 1s cubic-bezier(0.16,1,0.3,1) both;
  }

  /* ── Layout ── */
  .px-grid {
    display: grid;
    grid-template-columns: 1fr 330px;
    gap: 20px;
    align-items: start;
  }
  @media (max-width: 920px) {
    .px-grid { grid-template-columns: 1fr; }
    .px-desktop-only { display: none !important; }
  }

  /* ── Service grid — 5 col → 3 col on mobile ── */
  .px-svc-grid {
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: 10px;
  }
  @media (max-width: 640px) {
    .px-svc-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; }
  }

  /* ── Metrics row — 3 equal cols, compact on mobile ── */
  .px-metrics-row {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
  }
  @media (max-width: 480px) {
    .px-metrics-row { gap: 6px; }
    .px-metric-card { padding: 10px 6px !important; }
    .px-metric-value { font-size: 1rem !important; }
    .px-metric-label { font-size: 8px !important; }
  }

  /* ── Quota bar text — wrap gracefully on small screens ── */
  .px-quota-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }
  .px-quota-values {
    display: flex;
    align-items: center;
    gap: 7px;
    flex-wrap: wrap;
  }

  /* ── Hero card inner padding — responsive ── */
  .px-hero-inner {
    padding: clamp(14px, 4vw, 28px);
  }

  /* ── Card padding — responsive ── */
  .px-card-pad {
    padding: clamp(16px, 4vw, 22px);
  }

  /* ── Progress bar ── */
  .px-progress-track {
    height: 6px; border-radius: 999px; overflow: hidden;
    position: relative;
  }
  .px-progress-fill {
    height: 100%; border-radius: 999px;
    transition: width 0.8s cubic-bezier(0.16,1,0.3,1);
    position: relative;
  }
  .px-progress-fill::after {
    content: "";
    position: absolute; right: 0; top: 0; bottom: 0; width: 24px;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.35));
    border-radius: 999px;
  }

  /* ── Hero card ── */
  .px-hero-card {
    border-radius: 24px;
    overflow: hidden;
    border-width: 1.5px;
    border-style: solid;
    position: relative;
    transition: box-shadow 0.3s ease;
  }
  .px-hero-card:hover {
    box-shadow: 0 32px 80px rgba(52,211,153,0.15);
  }

  /* ── Stat strip in hero ── */
  .px-stat-strip {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
  }

  /* ── Tx row ── */
  .px-tx {
    display: flex; align-items: center; justify-content: space-between;
    gap: 14px; padding: 13px 18px; border-radius: 14px; cursor: pointer;
    transition: background 0.18s ease, transform 0.18s ease;
    border-bottom: 1px solid rgba(255,255,255,0.04);
  }
  .px-tx:last-child { border-bottom: none; }
  .px-tx:hover { background: rgba(255,255,255,0.04); transform: translateX(2px); }
  .px-tx-light { border-bottom-color: rgba(0,0,0,0.05); }
  .px-tx-light:hover { background: rgba(0,0,0,0.03); }

  /* ── WA Card hover ── */
  .px-wa-card {
    display: flex; align-items: center; gap: 14px;
    padding: 16px 20px; border-radius: 18px; cursor: pointer;
    border-width: 1px; border-style: solid;
    transition: transform 0.22s cubic-bezier(0.16,1,0.3,1), box-shadow 0.22s ease;
  }
  .px-wa-card:hover { transform: translateY(-2px); box-shadow: 0 12px 40px rgba(0,0,0,0.2); }

  /* ── Top product row ── */
  .px-top-row {
    display: flex; align-items: center; gap: 12px;
    padding: 12px 18px;
    transition: background 0.18s ease;
    border-bottom-width: 1px; border-bottom-style: solid;
  }
  .px-top-row:last-child { border-bottom: none; }
  .px-top-row:hover { background: rgba(255,255,255,0.03); }

  /* ── Stat count animation ── */
  .px-count { animation: px-count 0.5s cubic-bezier(0.16,1,0.3,1) both; }
`;

/* ── Colour tokens ── */
const C = {
  emerald: "#34d399",
  cyan: "#22d3ee",
  indigo: "#818cf8",
  amber: "#fbbf24",
  coral: "#fb7185",
  orange: "#fb923c",
  blue: "#60a5fa",
};

/* ── Helpers ── */
function badge(label, color) {
  return (
    <span style={{
      fontSize: 9, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase",
      padding: "3px 10px", borderRadius: 999,
      background: `${color}20`, color,
      border: `1px solid ${color}35`,
      fontFamily: "'DM Mono', monospace",
    }}>
      {label}
    </span>
  );
}

/* ── Section label ── */
function Label({ text, isDark }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
      <div style={{ height: 2, width: 18, borderRadius: 999, background: C.emerald, opacity: 0.7 }} />
      <span className="px-mono" style={{
        fontSize: 9, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase",
        color: isDark ? "rgba(148,163,184,0.5)" : "rgba(100,116,139,0.6)",
      }}>
        {text}
      </span>
    </div>
  );
}

/* ── Service card ── */
function SvcCard({ title, link, icon, color, isDark, router, badgeCount }) {
  return (
    <button type="button" className="px-svc px-btn" onClick={() => router.push(link)}
      style={{
        background: isDark ? `rgba(255,255,255,0.04)` : `rgba(0,0,0,0.04)`,
        border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)"}`,
      }}>
      <div style={{ position: "relative", display: "inline-flex" }}>
        <div style={{
          width: 46, height: 46, borderRadius: 14,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: `${color}18`, color,
          boxShadow: `0 0 20px ${color}20`,
        }}>
          {icon}
        </div>
        {badgeCount > 0 && (
          <span style={{
            position: "absolute", top: -6, right: -8,
            minWidth: 18, height: 18, borderRadius: 999,
            background: "#ef4444", color: "#fff",
            fontSize: 9.5, fontWeight: 800,
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "0 5px",
            boxShadow: "0 0 0 2px " + (isDark ? "rgba(12,20,40,0.9)" : "rgba(255,255,255,0.95)"),
            animation: "px-pulse-ring 2.5s ease-out infinite",
            fontFamily: "'DM Mono', monospace",
            lineHeight: 1,
          }}>
            {badgeCount > 99 ? "99+" : badgeCount}
          </span>
        )}
      </div>
      <span style={{
        fontSize: 10, fontWeight: 700, letterSpacing: "0.02em",
        color: isDark ? "rgba(226,232,240,0.8)" : "rgba(15,23,42,0.75)",
        fontFamily: "'Outfit', sans-serif",
      }}>
        {title}
      </span>
    </button>
  );
}

/* ── Metric card (Today's Sales) ── */
function MetricCard({ label, value, color, isDark, cardBg, cardBdr }) {
  return (
    <div className="px-metric-card" style={{
      borderRadius: 14, borderWidth: 1, borderStyle: "solid",
      padding: "12px 8px",
      display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
      background: cardBg, borderColor: cardBdr,
      transition: "transform 0.22s ease",
      minWidth: 0, overflow: "hidden",
    }}>
      <p className="px-display px-count px-metric-value" style={{
        fontSize: "clamp(0.85rem,3.5vw,1.25rem)", fontWeight: 900,
        color, margin: 0, lineHeight: 1,
        fontVariantNumeric: "tabular-nums",
        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        maxWidth: "100%",
      }}>{value}</p>
      <p className="px-mono px-metric-label" style={{
        fontSize: 8.5, fontWeight: 700, letterSpacing: "0.08em",
        textTransform: "uppercase",
        color: isDark ? "rgba(148,163,184,0.55)" : "rgba(100,116,139,0.65)",
        margin: 0, textAlign: "center",
      }}>{label}</p>
    </div>
  );
}

/* ══════════════════════════════════════════
   MAIN DASHBOARD
══════════════════════════════════════════ */
export default function Dashboard() {
  const { userData, pax26, router, transactionHistory, getUserRealTimeData, fetchUser, aiPlans } = useGlobalContext();
  const [showWallet, setShowWallet] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);
  const [analytics, setAnalytics] = useState(null);
  const [analyticsError, setAnalyticsError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchUnreadCount = () => {
    fetch("/api/seller/notifications", { credentials: "include" })
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d?.success) {
          setUnreadNotifCount(typeof d.pendingOrdersCount === "number" ? d.pendingOrdersCount : (d.unreadCount || 0));
        }
      })
      .catch(() => {});
  };

  const fetchAnalytics = async () => {
    try {
      const res = await fetch("/api/seller/analytics", { credentials: "include" });
      const data = await res.json();
      if (data?.success) {
        setAnalytics(data);
        setAnalyticsError(false);
      } else {
        setAnalyticsError(true);
      }
    } catch (_) {
      setAnalyticsError(true);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchUser(), fetchAnalytics(), fetchUnreadCount()]);
    setRefreshing(false);
  };

  useEffect(() => {
    getUserRealTimeData();
    fetchUser();
    fetchUnreadCount();
    fetchAnalytics();

    const interval = setInterval(fetchUnreadCount, 8000);
    window.addEventListener("focus", fetchUnreadCount);
    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", fetchUnreadCount);
    };
  }, []);

  const firstName = userData?.name?.split(" ")[0] || "User";
  const businessName = userData?.businessProfile?.businessName || userData?.name || "Your Store";
  const profileImage = userData?.profileImage ?? null;
  const initials = (userData?.name ?? "U").split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  /* ── Theme detection ── */
  const isLightTheme = String(pax26?.card || pax26?.bg || "").toLowerCase().includes("fff") ||
    String(pax26?.bg || "").toLowerCase() === "#ffffff" ||
    String(pax26?.bg || "").toLowerCase() === "#f8fafc";
  const isDark = !isLightTheme;

  /* ── AI plan data ── */
  const plan = userData?.paxAI?.plan || "free";
  const isAiOn = !!userData?.paxAI?.enabled;

  // ── MSGS HANDLED: same source as AI Messages ──────────────────────
  // Both the stat strip and the AI quota bar use paxAI.messagesUsedThisMonth
  const messagesUsed   = userData?.paxAI?.messagesUsedThisMonth ?? 0;

  const currentPlanMeta = aiPlans?.find(p => p.key === plan);
  const quota = currentPlanMeta?.messagesLimit ?? userData?.paxAI?.maxMonthlyMessages ?? 0;
  const pct = quota > 0 ? Math.min((messagesUsed / quota) * 100, 100) : 0;
  const pctDisplay = pct === 0 ? "0%" : pct < 1 ? `${pct.toFixed(2)}%` : `${Math.round(pct)}%`;

  const planColors = { free: C.blue, starter: C.cyan, business: C.amber, enterprise: C.indigo };
  const planCol = planColors[plan] ?? C.blue;
  const quotaColor = pct >= 90 ? C.coral : pct >= 70 ? C.orange : C.emerald;

  const contactCount = userData?.contacts ?? 0;
  const workflowCount = userData?.workflows ?? 0;

  // WhatsApp connection
  const waConnected = !!(
    userData?.whatsapp?.connected ||
    userData?.whatsapp?.phoneNumberId ||
    userData?.whatsappBusinessNo
  );
  const waPhone = userData?.whatsapp?.displayPhone ?? userData?.whatsappBusinessNo ?? "";

  // Plan expiry
  const planExpiresAt = userData?.paxAI?.planExpiresAt;
  const lastUpd = userData?.paxAI?.planStartedAt;
  let remainingDays = null;
  if (plan !== "free" && planExpiresAt) {
    const msDiff = new Date(planExpiresAt).getTime() - Date.now();
    remainingDays = Math.max(0, Math.ceil(msDiff / (1000 * 60 * 60 * 24)));
  } else if (plan !== "free" && lastUpd) {
    const diff = (Date.now() - new Date(lastUpd).getTime()) / (1000 * 60 * 60 * 24);
    remainingDays = Math.max(0, 30 - Math.floor(diff));
  }
  const daysLabel = remainingDays === null ? "" : remainingDays === 0 ? "Resets today" : remainingDays === 1 ? "1d left" : `${remainingDays}d left`;
  const daysUrgent = remainingDays !== null && remainingDays <= 3;

  /* ── Computed style helpers ── */
  const cardBg = isDark ? "rgba(12,20,40,0.72)" : "rgba(255,255,255,0.92)";
  const cardBdr = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)";
  const textPri = isDark ? "#f1f5f9" : "#0f172a";
  const textSec = isDark ? "rgba(148,163,184,0.85)" : "rgba(71,85,105,0.85)";
  const textMuted = isDark ? "rgba(148,163,184,0.45)" : "rgba(100,116,139,0.55)";
  const subBg = isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)";
  const subBdr = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";
  const pageBg = isDark ? "#060d1e" : "#f0f4f9";

  const heroBorderColor = isDark ? "rgba(52,211,153,0.25)" : "rgba(52,211,153,0.35)";
  const heroTextPrimary = isDark ? "#f1f5f9" : "#1e293b";
  const heroTextSecondary = isDark ? "rgba(241,245,249,0.6)" : "rgba(30,41,59,0.55)";
  const heroBg = isDark
    ? "linear-gradient(135deg, rgba(10,20,40,0.95) 0%, rgba(10,24,48,0.92) 100%)"
    : "linear-gradient(135deg, rgba(255,255,255,0.97) 0%, rgba(240,249,255,0.97) 100%)";

  return (
    <>
      <style>{CSS}</style>

      {/* ── Page bg ── */}
      <div style={{ minHeight: "100vh", background: pageBg, position: "relative", overflow: "hidden", overflowX: "hidden", maxWidth: "100vw" }}>

        {/* ── Ambient orbs ── */}
        {isDark && (
          <>
            <div className="px-breathe" style={{
              position: "fixed", top: -120, left: -80, width: 500, height: 500,
              borderRadius: "50%", background: "radial-gradient(circle, rgba(52,211,153,0.08) 0%, transparent 70%)",
              pointerEvents: "none", zIndex: 0,
            }} />
            <div className="px-breathe" style={{
              position: "fixed", bottom: -80, right: -100, width: 600, height: 600,
              borderRadius: "50%", background: "radial-gradient(circle, rgba(59,130,246,0.07) 0%, transparent 70%)",
              pointerEvents: "none", zIndex: 0, animationDelay: "2s",
            }} />
          </>
        )}

        <div className="px-root" style={{
          maxWidth: 1180, margin: "0 auto",
          padding: "clamp(16px,4vw,28px) clamp(12px,4vw,20px) 100px",
          position: "relative", zIndex: 1,
          display: "flex", flexDirection: "column", gap: 20,
          overflowX: "hidden",
        }}>

          {/* ── HEADER row ── */}
          <header className="px-s1" style={{
            display: "flex", alignItems: "flex-start",
            justifyContent: "space-between", gap: 12,
          }}>
            <div style={{ minWidth: 0, flex: 1 }}>
              <p className="px-mono" style={{
                fontSize: 10, fontWeight: 500, letterSpacing: "0.14em", textTransform: "uppercase",
                color: textMuted, margin: "0 0 6px",
              }}>
                {getGreeting()}
              </p>
              <h1 className="px-display" style={{
                fontSize: "clamp(1.7rem,4vw,2.2rem)", fontWeight: 900,
                letterSpacing: "-0.04em", color: textPri,
                margin: 0, lineHeight: 1.1,
              }}>
                {firstName} <span style={{ opacity: 0.85 }}>👋</span>
              </h1>
              <p style={{
                fontSize: 13.5, color: textSec, margin: "8px 0 0",
                fontWeight: 400, maxWidth: 360, lineHeight: 1.6,
              }}>
                Your store, automations and sales — all in one place.
              </p>
            </div>

            {/* Refresh button */}
            <button
              type="button"
              className="px-btn"
              onClick={handleRefresh}
              disabled={refreshing}
              style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "9px 14px", borderRadius: 12, marginTop: 4,
                background: subBg, border: `1px solid ${subBdr}`,
                color: textSec, fontSize: 12, fontWeight: 600,
                fontFamily: "'Outfit', sans-serif",
                opacity: refreshing ? 0.6 : 1,
              }}
            >
              <RefreshCw size={14} className={refreshing ? "px-spin" : ""} />
              <span className="px-desktop-only">Refresh</span>
            </button>
          </header>

          {/* ── MAIN GRID ── */}
          <div className="px-grid">

            {/* ═══ LEFT COLUMN ═══ */}
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

              {/* ── HERO CARD (mirrors mobile home.tsx exactly) ── */}
              <div
                className="px-s2 px-hero-card px-glow"
                style={{
                  background: heroBg,
                  borderColor: heroBorderColor,
                }}
              >
                {/* Top accent shimmer line */}
                <div style={{
                  height: 2,
                  background: "linear-gradient(90deg, transparent, rgba(52,211,153,0.8) 30%, rgba(34,211,238,0.7) 70%, transparent)",
                }} />

                {/* Geometric mesh overlay */}
                <div style={{
                  position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0,
                  backgroundImage: `radial-gradient(${isDark ? "rgba(52,211,153,0.05)" : "rgba(52,211,153,0.09)"} 1px, transparent 1px)`,
                  backgroundSize: "28px 28px",
                  maskImage: "linear-gradient(to bottom right, black 20%, transparent 75%)",
                }} />

                {/* Glow orb top-right */}
                <div style={{
                  position: "absolute", top: -50, right: -50, width: 260, height: 260,
                  borderRadius: "50%", pointerEvents: "none", zIndex: 0,
                  background: isDark
                    ? "radial-gradient(circle, rgba(52,211,153,0.12) 0%, transparent 65%)"
                    : "radial-gradient(circle, rgba(52,211,153,0.16) 0%, transparent 65%)",
                }} />

                <div className="px-hero-inner" style={{
                  position: "relative", zIndex: 1,
                  display: "flex", flexDirection: "column", gap: 16,
                }}>

                  {/* Row 1: Avatar + Greeting + Plan badge */}
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    {/* Avatar */}
                    <div style={{
                      width: 52, height: 52, borderRadius: 26, flexShrink: 0,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      overflow: "hidden",
                      background: "rgba(52,211,153,0.15)",
                      border: "1.5px solid rgba(52,211,153,0.35)",
                    }}>
                      {profileImage
                        ? <img src={profileImage} alt="avatar" style={{ width: 52, height: 52, borderRadius: 26, objectFit: "cover" }} />
                        : <span className="px-display" style={{ fontSize: 18, fontWeight: 900, color: C.emerald }}>{initials}</span>
                      }
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 11, color: heroTextSecondary, margin: "0 0 2px", fontWeight: 500 }}>
                        Welcome back
                      </p>
                      <p className="px-display" style={{
                        fontSize: "clamp(1.2rem,3vw,1.55rem)", fontWeight: 900,
                        color: heroTextPrimary, margin: 0, letterSpacing: "-0.03em",
                        lineHeight: 1.15,
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                      }}>
                        {firstName}
                      </p>
                    </div>

                    {/* Plan badge */}
                    <div style={{
                      padding: "5px 12px", borderRadius: 999,
                      background: `${planCol}20`, border: `1px solid ${planCol}50`,
                      flexShrink: 0,
                    }}>
                      <span className="px-mono" style={{
                        fontSize: 9, fontWeight: 800, letterSpacing: "0.12em",
                        color: planCol, textTransform: "uppercase",
                      }}>
                        {plan}
                      </span>
                    </div>
                  </div>

                  {/* Row 2: Business name */}
                  <div>
                    <p className="px-display" style={{
                      fontSize: "clamp(1.4rem,3.5vw,2rem)", fontWeight: 900,
                      color: heroTextPrimary, margin: 0, letterSpacing: "-0.04em",
                      lineHeight: 1.15,
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}>
                      {businessName}
                    </p>
                  </div>

                  {/* Divider */}
                  <div style={{ height: 1, background: heroBorderColor, marginLeft: "calc(-1 * clamp(14px, 4vw, 28px))", marginRight: "calc(-1 * clamp(14px, 4vw, 28px))" }} />

                  {/* Row 3: 3 key stats */}
                  <div className="px-stat-strip">
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "4px 0" }}>
                      <p className="px-display px-count" style={{
                        fontSize: "clamp(1.3rem,2.5vw,1.6rem)", fontWeight: 900,
                        color: heroTextPrimary, margin: "0 0 3px", lineHeight: 1,
                        fontVariantNumeric: "tabular-nums",
                      }}>
                        {messagesUsed.toLocaleString()}
                      </p>
                      <p className="px-mono" style={{ fontSize: 9, color: heroTextSecondary, margin: 0, letterSpacing: "0.1em", textTransform: "uppercase", textAlign: "center" }}>
                        Msg Handled
                      </p>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "4px 0", borderLeft: `1px solid ${heroBorderColor}`, borderRight: `1px solid ${heroBorderColor}` }}>
                      <p className="px-display px-count" style={{
                        fontSize: "clamp(1.3rem,2.5vw,1.6rem)", fontWeight: 900,
                        color: heroTextPrimary, margin: "0 0 3px", lineHeight: 1,
                        fontVariantNumeric: "tabular-nums",
                      }}>
                        {contactCount.toLocaleString()}
                      </p>
                      <p className="px-mono" style={{ fontSize: 9, color: heroTextSecondary, margin: 0, letterSpacing: "0.1em", textTransform: "uppercase", textAlign: "center" }}>
                        Contacts
                      </p>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "4px 0" }}>
                      <p className="px-display px-count" style={{
                        fontSize: "clamp(1.3rem,2.5vw,1.6rem)", fontWeight: 900,
                        color: heroTextPrimary, margin: "0 0 3px", lineHeight: 1,
                        fontVariantNumeric: "tabular-nums",
                      }}>
                        {workflowCount}
                      </p>
                      <p className="px-mono" style={{ fontSize: 9, color: heroTextSecondary, margin: 0, letterSpacing: "0.1em", textTransform: "uppercase", textAlign: "center" }}>
                        Automations
                      </p>
                    </div>
                  </div>

                  {/* Row 4: Monthly AI quota bar */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                    <div className="px-quota-row">
                      <span style={{ fontSize: 11, color: heroTextSecondary, fontWeight: 500, whiteSpace: "nowrap" }}>
                        Monthly AI replies
                      </span>
                      <div className="px-quota-values">
                        <span className="px-mono" style={{ fontSize: 11, fontWeight: 700, color: heroTextPrimary, whiteSpace: "nowrap" }}>
                          {messagesUsed.toLocaleString()} / {quota.toLocaleString()}
                        </span>
                        {!!daysLabel && (
                          <span style={{
                            padding: "2px 8px", borderRadius: 999, fontSize: 9.5, fontWeight: 700,
                            background: daysUrgent ? "rgba(239,68,68,0.18)" : "rgba(52,211,153,0.14)",
                            color: daysUrgent ? C.coral : C.emerald,
                            fontFamily: "'DM Mono', monospace",
                            whiteSpace: "nowrap",
                          }}>
                            {daysLabel}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="px-progress-track" style={{ background: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)" }}>
                      <div
                        className="px-progress-fill px-shimmer"
                        style={{ width: `${pct}%`, minWidth: messagesUsed > 0 ? 4 : 0, background: quotaColor }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* ── ANALYTICS ERROR ── */}
              {analyticsError && (
                <div className="px-s3" style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "12px 16px", borderRadius: 14,
                  background: `${C.amber}14`, border: `1px solid ${C.amber}35`,
                }}>
                  <AlertCircle size={16} color={C.amber} />
                  <p style={{ fontSize: 13, fontWeight: 500, color: C.amber, margin: 0 }}>
                    Couldn't load dashboard data. Pull down to retry.
                  </p>
                </div>
              )}

              {/* ── WHATSAPP STATUS ── */}
              <button
                type="button"
                className={`px-s3 px-wa-card px-btn`}
                onClick={() => router.push("/dashboard/automations/whatsapp#connect")}
                style={{
                  width: "100%",
                  background: waConnected
                    ? (isDark ? "rgba(52,211,153,0.07)" : "rgba(52,211,153,0.06)")
                    : (isDark ? "rgba(251,191,36,0.07)" : "rgba(251,191,36,0.06)"),
                  borderColor: waConnected
                    ? "rgba(52,211,153,0.3)"
                    : "rgba(251,191,36,0.3)",
                }}
              >
                {/* Pulse dot */}
                <div className={waConnected ? "px-pulse" : ""} style={{
                  width: 10, height: 10, borderRadius: "50%", flexShrink: 0,
                  background: waConnected ? C.emerald : C.amber,
                }} />
                <div style={{ flex: 1, textAlign: "left" }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: textPri, margin: "0 0 2px" }}>
                    WhatsApp {waConnected ? "Connected" : "Not Connected"}
                  </p>
                  <p className="px-mono" style={{ fontSize: 10, color: textMuted, margin: 0 }}>
                    {waConnected ? (waPhone || "Business number active") : "Tap to connect your number"}
                  </p>
                </div>
                <ChevronRight size={16} color={textMuted} />
              </button>

              {/* ── TODAY'S SALES ── */}
              {analytics?.metrics && (
                <div className="px-s4">
                  <Label text="Today's Sales" isDark={isDark} />
                  <div className="px-metrics-row">
                    <MetricCard
                      label="Revenue"
                      value={`₦${(analytics.metrics.todaySales ?? 0).toLocaleString()}`}
                      color={C.emerald}
                      isDark={isDark}
                      cardBg={cardBg}
                      cardBdr={cardBdr}
                    />
                    <MetricCard
                      label="Orders"
                      value={analytics.metrics.totalOrders ?? 0}
                      color={C.blue}
                      isDark={isDark}
                      cardBg={cardBg}
                      cardBdr={cardBdr}
                    />
                    <MetricCard
                      label="Pending"
                      value={analytics.metrics.pendingOrdersCount ?? 0}
                      color={C.amber}
                      isDark={isDark}
                      cardBg={cardBg}
                      cardBdr={cardBdr}
                    />
                  </div>
                </div>
              )}

              {/* ── QUICK ACTIONS ── */}
              <div className={`px-s5 ${isDark ? "px-glass" : "px-glass-light"}`} style={{ padding: "clamp(16px,4vw,24px)" }}>
                <Label text="Quick Actions" isDark={isDark} />
                <div className="px-svc-grid">
                  <SvcCard title="My Store"    link="/dashboard/my-store"                             icon={<Store       size={19} strokeWidth={2.2} />} color={C.emerald} isDark={isDark} router={router} />
                  <SvcCard title="Products"    link="/dashboard/automations/products"                 icon={<Package     size={19} strokeWidth={2.2} />} color={C.cyan}    isDark={isDark} router={router} />
                  <SvcCard title="Smart Agent" link="/dashboard/automations/ai-business-dashboard"   icon={<Bot         size={19} strokeWidth={2.2} />} color={C.indigo}  isDark={isDark} router={router} />
                  <SvcCard title="Inbox"       link="/dashboard/automations/whatsapp-inbox"          icon={<MessageSquare size={19} strokeWidth={2.2} />} color={C.amber} isDark={isDark} router={router} />
                  <SvcCard title="Analytics"   link="/dashboard/automations/sales"                   icon={<BarChart2   size={19} strokeWidth={2.2} />} color={C.coral}   isDark={isDark} router={router} badgeCount={unreadNotifCount} />
                </div>
              </div>

              {/* ── TOP PRODUCTS (if available) ── */}
              {(analytics?.topProducts ?? []).length > 0 && (
                <div className="px-s6">
                  <Label text="Top Products" isDark={isDark} />
                  <div className={isDark ? "px-glass" : "px-glass-light"} style={{ overflow: "hidden" }}>
                    {(analytics.topProducts).slice(0, 4).map((p, i, arr) => (
                      <div key={i} className="px-top-row"
                        style={{ borderBottomColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)" }}>
                        <span className="px-mono" style={{ fontSize: 11, fontWeight: 900, color: textMuted, width: 24 }}>#{i + 1}</span>
                        <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: textPri, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</span>
                        <span className="px-mono" style={{ fontSize: 13, fontWeight: 800, color: C.emerald, flexShrink: 0 }}>₦{(p.revenue ?? 0).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* ═══ RIGHT SIDEBAR (stacks below on mobile) ═══ */}
            <aside style={{ display: "flex", flexDirection: "column", gap: 16 }}>

              {/* ── AI PLAN CARD ── */}
              <div className={`px-s3 ${isDark ? "px-glass" : "px-glass-light"}`}
                style={{ overflow: "hidden" }}>
                <div style={{
                  height: 3,
                  background: `linear-gradient(90deg, transparent, ${planCol}, transparent)`,
                }} />
                <div className="px-card-pad">
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, gap: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{
                        width: 44, height: 44, borderRadius: 14,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        background: `${planCol}18`, color: planCol,
                        border: `1px solid ${planCol}28`,
                        boxShadow: `0 0 20px ${planCol}15`,
                      }}>
                        <Crown size={18} strokeWidth={2} />
                      </div>
                      <div>
                        <p className="px-mono" style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: textMuted, margin: "0 0 4px" }}>
                          AI Plan
                        </p>
                        <p className="px-display" style={{ fontSize: 16, fontWeight: 800, color: textPri, margin: 0, textTransform: "capitalize", letterSpacing: "-0.02em" }}>
                          {plan}
                        </p>
                        {remainingDays !== null && (
                          <p style={{ fontSize: 10, fontWeight: 600, color: remainingDays <= 5 ? C.coral : textMuted, margin: "2px 0 0" }}>
                            {remainingDays}d remaining
                          </p>
                        )}
                      </div>
                    </div>
                    {badge(isAiOn ? "Active" : "Inactive", isAiOn ? C.emerald : C.coral)}
                  </div>

                  {/* Usage bar */}
                  <div style={{ marginBottom: 18 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, gap: 8, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 11, fontWeight: 500, color: textMuted }}>Messages used</span>
                      <span className="px-mono" style={{ fontSize: 11, fontWeight: 700, color: textPri, whiteSpace: "nowrap" }}>
                        {messagesUsed.toLocaleString()}/{quota.toLocaleString()}
                      </span>
                    </div>
                    <div className="px-progress-track" style={{ background: subBg, border: `1px solid ${subBdr}` }}>
                      <div className="px-progress-fill px-shimmer"
                        style={{ width: `${pct}%`, minWidth: messagesUsed > 0 ? 4 : 0 }} />
                    </div>
                    <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 5 }}>
                      <span className="px-mono" style={{ fontSize: 9, color: pct >= 90 ? C.coral : textMuted }}>
                        {pctDisplay} used
                      </span>
                    </div>
                  </div>

                  <button type="button" className="px-btn"
                    onClick={() => router.push(isAiOn ? "/dashboard/billing" : "/dashboard/automations/ai-business-dashboard")}
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                      width: "100%", padding: "12px 0", borderRadius: 13,
                      fontSize: 13, fontWeight: 700,
                      background: `${planCol}14`,
                      color: planCol,
                      border: `1px solid ${planCol}28`,
                      fontFamily: "'Outfit', sans-serif",
                    }}>
                    <Crown size={13} />
                    {isAiOn ? "Manage Plan" : "Activate AI"}
                  </button>
                </div>
              </div>

              {/* ── WALLET CARD ── */}
              <div className={`px-s4 ${isDark ? "px-glass" : "px-glass-light"}`}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "clamp(14px,4vw,22px)", gap: 12 }}>
                  <div>
                    <p className="px-mono" style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: textMuted, margin: "0 0 5px" }}>
                      Wallet
                    </p>
                    <p className="px-display" style={{ fontSize: 16, fontWeight: 800, color: textPri, margin: 0, letterSpacing: "-0.02em" }}>
                      Wallet Balance
                    </p>
                  </div>
                  <button type="button" className="px-btn"
                    onClick={() => setShowWallet(!showWallet)}
                    style={{
                      display: "inline-flex", alignItems: "center", gap: 7,
                      padding: "9px 16px", borderRadius: 12, fontSize: 12, fontWeight: 600,
                      background: showWallet ? `${C.emerald}14` : subBg,
                      color: showWallet ? C.emerald : textSec,
                      border: `1px solid ${showWallet ? `${C.emerald}28` : subBdr}`,
                      cursor: "pointer", fontFamily: "'Outfit', sans-serif",
                    }}>
                    {showWallet ? <EyeOff size={14} /> : <Eye size={14} />}
                    {showWallet ? "Hide" : "View"}
                  </button>
                </div>
                {showWallet && (
                  <div style={{
                    padding: "0 clamp(14px,4vw,22px) clamp(14px,4vw,22px)",
                    borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`,
                    paddingTop: 18,
                  }}>
                    <WalletBalance showMore={showMore} setShowMore={setShowMore} />
                  </div>
                )}
              </div>

              {/* ── WHATSAPP STATUS CARD (Desktop Only) ── */}
              <div className={`px-s5 px-desktop-only ${isDark ? "px-glass" : "px-glass-light"}`}
                style={{ padding: "22px", cursor: "pointer" }}
                onClick={() => router.push("/dashboard/automations/whatsapp#connect")}>
                <Label text="WhatsApp Channel" isDark={isDark} />
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{
                      width: 42, height: 42, borderRadius: 13,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      background: waConnected ? `${C.emerald}18` : `${C.amber}12`,
                      color: waConnected ? C.emerald : C.amber,
                    }}>
                      <Wifi size={18} strokeWidth={2} />
                    </div>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 700, color: textPri, margin: "0 0 3px" }}>
                        {waConnected ? "WhatsApp Connected" : "Not Connected"}
                      </p>
                      <p className="px-mono" style={{ fontSize: 10, color: textMuted, margin: 0 }}>
                        {waConnected
                          ? userData?.whatsappBusinessNo || "Business number active"
                          : "Tap to configure channel"}
                      </p>
                    </div>
                  </div>
                  <ChevronRight size={16} color={textMuted} />
                </div>
              </div>

              {/* ── GROWTH & MANAGEMENT TOOLS (Desktop Only) ── */}
              <div className={`px-s6 px-desktop-only ${isDark ? "px-glass" : "px-glass-light"}`} style={{ padding: "22px" }}>
                <Label text="Growth & Tools" isDark={isDark} />
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {[
                    { label: "Prevent Ban Rules",   href: "/dashboard/prevent-ban",  icon: <Shield size={15} />, color: C.emerald },
                    { label: "Referral Earnings",   href: "/dashboard/referral",      icon: <Users  size={15} />, color: C.cyan    },
                    { label: "Billing & Plans",     href: "/dashboard/billing",       icon: <Crown  size={15} />, color: C.amber   },
                  ].map(({ label, href, icon, color }) => (
                    <button key={label} type="button" className="px-btn"
                      onClick={() => router.push(href)}
                      style={{
                        display: "flex", alignItems: "center", gap: 12,
                        padding: "11px 14px", borderRadius: 12,
                        background: subBg, border: `1px solid ${subBdr}`,
                        cursor: "pointer", textAlign: "left",
                        fontFamily: "'Outfit', sans-serif",
                      }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: 10, flexShrink: 0,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        background: `${color}15`, color,
                      }}>
                        {icon}
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 600, color: textPri, flex: 1 }}>
                        {label}
                      </span>
                      <ChevronRight size={14} color={textMuted} />
                    </button>
                  ))}
                </div>
              </div>

            </aside>
          </div>

        </div>
      </div>
    </>
  );
}