"use client";
import React, { useEffect, useState } from "react";
import {
  Bot, Wifi, Zap,
  Bell, ArrowRight, Eye, EyeOff, TrendingUp,
  MessageSquare, Users, Layers, Crown, Sparkles,
  MessageCircle, Brain, Repeat,
  Activity, ChevronRight, BarChart2, Shield,
  Radio, Send, Store, Package
} from "lucide-react";

import { useGlobalContext } from "../Context";
import WalletBalance from "../WalletBalance/WalletBalance";

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800;900&family=DM+Mono:wght@400;500&family=Outfit:wght@300;400;500;600;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; }

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
  @keyframes px-orbit {
    from { transform: rotate(0deg) translateX(90px) rotate(0deg); }
    to   { transform: rotate(360deg) translateX(90px) rotate(-360deg); }
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

  .px-s1 { animation: px-rise 0.6s cubic-bezier(0.16,1,0.3,1) 0.00s both; }
  .px-s2 { animation: px-rise 0.6s cubic-bezier(0.16,1,0.3,1) 0.08s both; }
  .px-s3 { animation: px-rise 0.6s cubic-bezier(0.16,1,0.3,1) 0.16s both; }
  .px-s4 { animation: px-rise 0.6s cubic-bezier(0.16,1,0.3,1) 0.24s both; }
  .px-s5 { animation: px-rise 0.6s cubic-bezier(0.16,1,0.3,1) 0.32s both; }
  .px-s6 { animation: px-rise 0.6s cubic-bezier(0.16,1,0.3,1) 0.40s both; }

  .px-breathe { animation: px-breathe 4s ease-in-out infinite; }
  .px-pulse   { animation: px-pulse-ring 2.5s ease-out infinite; }
  .px-glow    { animation: px-glow-pulse 3s ease-in-out infinite; }

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

  /* ── Tx row ── */
  .px-tx {
    display: flex; align-items: center; justify-content: space-between;
    gap: 14px; padding: 13px 18px; border-radius: 14px; cursor: pointer;
    transition: background 0.18s ease, transform 0.18s ease;
    border-bottom: 1px solid rgba(255,255,255,0.04);
  }
  .px-tx:last-child { border-bottom: none; }
  .px-tx:hover { background: rgba(255,255,255,0.04); transform: translateX(2px); }

  .px-tx-light {
    border-bottom-color: rgba(0,0,0,0.05);
  }
  .px-tx-light:hover { background: rgba(0,0,0,0.03); }

  /* ── Shimmer bar ── */
  .px-shimmer {
    background: linear-gradient(90deg, #34d399 0%, #22d3ee 40%, #818cf8 70%, #34d399 100%);
    background-size: 200% 100%;
    animation: px-shimmer 3s linear infinite, px-bar-grow 1s cubic-bezier(0.16,1,0.3,1) both;
  }

  /* ── Ticker ── */
  .px-ticker-wrap {
    overflow: hidden; white-space: nowrap;
    mask-image: linear-gradient(90deg, transparent, black 8%, black 92%, transparent);
  }
  .px-ticker-inner { display: inline-flex; animation: px-ticker 28s linear infinite; }

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
  @media (max-width: 500px) {
    .px-svc-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  }

  /* ── Stat strip — scrollable on very small screens ── */
  .px-stat-strip {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 14px;
  }
  @media (max-width: 380px) {
    .px-stat-strip {
      display: flex;
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
      scroll-snap-type: x mandatory;
      gap: 10px;
      padding-bottom: 4px;
    }
    .px-stat-strip > * {
      scroll-snap-align: start;
      flex-shrink: 0;
      min-width: 130px;
    }
  }

  /* ── Hero card inner padding responsive ── */
  .px-hero-inner {
    padding: clamp(20px, 5vw, 36px) clamp(18px, 5vw, 36px) clamp(24px, 5vw, 36px);
  }

  /* ── CTA button row — wraps on mobile ── */
  .px-cta-row {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
  }
  @media (max-width: 400px) {
    .px-cta-row { flex-direction: column; }
    .px-cta-row button { width: 100%; justify-content: center; }
  }

  /* ── Header — prevent icon buttons from wrapping ── */
  .px-header-row {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
  }
  .px-header-actions {
    display: flex;
    gap: 8px;
    flex-shrink: 0;
    margin-top: 4px;
  }

  /* ── Progress bar ── */
  .px-progress-track {
    height: 8px; border-radius: 999px; overflow: hidden;
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

/* ── Service card ── */
function SvcCard({ title, link, icon, color, isDark, router }) {
  return (
    <button type="button" className="px-svc px-btn" onClick={() => router.push(link)}
      style={{
        background: isDark ? `rgba(255,255,255,0.04)` : `rgba(0,0,0,0.04)`,
        border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)"}`,
      }}>
      <div style={{
        width: 46, height: 46, borderRadius: 14,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: `${color}18`, color,
        boxShadow: `0 0 20px ${color}20`,
      }}>
        {icon}
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

/* ── Transaction row ── */
function TxRow({ tx, onClick, isDark }) {
  const s = tx.status;
  const col = s === "success" ? C.emerald : s === "pending" ? C.amber : C.coral;
  return (
    <div className={`px-tx ${isDark ? "" : "px-tx-light"}`} onClick={onClick} role="button" tabIndex={0}
      onKeyDown={e => { if (e.key === "Enter") onClick(); }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 12, flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: `${col}15`, color: col,
        }}>
          <TrendingUp size={15} strokeWidth={2.25} />
        </div>
        <div style={{ minWidth: 0 }}>
          <p style={{
            fontSize: 13, fontWeight: 600, margin: "0 0 2px",
            color: isDark ? "rgba(226,232,240,0.9)" : "rgba(15,23,42,0.9)",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            {tx.description}
          </p>
          <p className="px-mono" style={{ fontSize: 10, margin: 0, color: isDark ? "rgba(148,163,184,0.6)" : "rgba(100,116,139,0.7)" }}>
            {new Date(tx.createdAt).toLocaleString()}
          </p>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", flexShrink: 0, gap: 3 }}>
        <p className="px-mono" style={{ fontSize: 13, fontWeight: 700, color: col, margin: 0 }}>
          ₦{tx.amount?.toLocaleString()}
        </p>
        <span style={{
          fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", textTransform: "capitalize",
          color: isDark ? "rgba(148,163,184,0.5)" : "rgba(100,116,139,0.6)",
        }}>
          {tx.type}
        </span>
      </div>
    </div>
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

/* ══════════════════════════════════════════
   MAIN DASHBOARD
══════════════════════════════════════════ */
export default function Dashboard() {
  const { userData, pax26, router, transactionHistory, getUserRealTimeData, fetchUser, aiPlans } = useGlobalContext();
  const [showWallet, setShowWallet] = useState(false);
  const [showMore, setShowMore] = useState(false);

  useEffect(() => {
    getUserRealTimeData();
    fetchUser();
  }, []);

  const firstName = userData?.name?.split(" ")[0] || "User";
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
  const used = userData?.paxAI?.messagesUsedThisMonth ?? 0;
  const currentPlanMeta = aiPlans?.find(p => p.key === plan);
  const quota = currentPlanMeta?.messagesLimit || userData?.paxAI?.maxMonthlyMessages ||
    ({ starter: 2000, business: 10000, enterprise: 50000 }[plan] ?? 200);
  const pct = Math.min((used / (quota || 1)) * 100, 100);
  const pctDisplay = pct === 0 ? "0%" : pct < 1 ? `${pct.toFixed(2)}%` : `${Math.round(pct)}%`;
  const planCol = { free: C.blue, starter: C.cyan, business: C.amber, enterprise: C.indigo }[plan] ?? C.blue;

  const lastUpd = userData?.paxAI?.planStartedAt;
  let remainingDays = null;
  if (plan !== "free" && lastUpd) {
    const diff = (new Date() - new Date(lastUpd)) / (1000 * 60 * 60 * 24);
    remainingDays = Math.max(0, 30 - Math.floor(diff));
  }

  /* ── Computed style helpers ── */
  const cardBg = isDark ? "rgba(12,20,40,0.72)" : "rgba(255,255,255,0.92)";
  const cardBdr = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)";
  const textPri = isDark ? "#f1f5f9" : "#0f172a";
  const textSec = isDark ? "rgba(148,163,184,0.85)" : "rgba(71,85,105,0.85)";
  const textMuted = isDark ? "rgba(148,163,184,0.45)" : "rgba(100,116,139,0.55)";
  const subBg = isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)";
  const subBdr = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";
  const pageBg = isDark ? "#060d1e" : "#f0f4f9";

  const ticker = ["AI Active • PaxAI", "WhatsApp Automation • Live", "Africa-ready Platform", "Official Meta API • Secure", "24/7 Auto-replies • Enabled"];

  return (
    <>
      <style>{CSS}</style>

      {/* ── Page bg ── */}
      <div style={{ minHeight: "100vh", background: pageBg, position: "relative", overflow: "hidden" }}>

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
        }}>

          {/* ── TICKER BAR (Desktop Only) ── */}
          <div className="px-s1 px-desktop-only" style={{
            borderRadius: 999, overflow: "hidden",
            background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)",
            border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)"}`,
            padding: "8px 0",
          }}>
            <div className="px-ticker-wrap">
              <div className="px-ticker-inner">
                {[...ticker, ...ticker].map((t, i) => (
                  <span key={i} className="px-mono" style={{
                    fontSize: 10, fontWeight: 500, letterSpacing: "0.1em",
                    color: isDark ? "rgba(52,211,153,0.7)" : "rgba(5,150,105,0.75)",
                    padding: "0 28px",
                  }}>
                    ◆ {t}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* ── HEADER ── */}
          <header className="px-s1 px-header-row">
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
              <p className="px-desktop-only" style={{
                fontSize: 13.5, color: textSec, margin: "8px 0 0",
                fontWeight: 400, maxWidth: 360, lineHeight: 1.6,
              }}>
                Your store, automations and sales — all in one place.
              </p>
            </div>
            <div className="px-header-actions">
              <button type="button" className="px-btn"
                onClick={() => router.push("/notifications")}
                style={{
                  width: 42, height: 42, borderRadius: 14,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: subBg, border: `1px solid ${subBdr}`, cursor: "pointer",
                }}>
                <Bell size={18} color={textSec} strokeWidth={2} />
              </button>
              <button type="button" className="px-btn"
                onClick={() => router.push("/profile")}
                style={{
                  width: 42, height: 42, borderRadius: 14,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: subBg, border: `1px solid ${subBdr}`, cursor: "pointer",
                }}>
                <Shield size={18} color={textSec} strokeWidth={2} />
              </button>
            </div>
          </header>

          {/* ── STAT STRIP ── */}
          <div className="px-s2 px-stat-strip">
            {[
              { label: "Automations", val: userData?.workflows || 0, icon: <Layers size={16} />, color: C.emerald },
              { label: "Msgs Handled", val: userData?.messagesHandled || 0, icon: <MessageSquare size={16} />, color: C.cyan },
              { label: "Contacts", val: userData?.contacts || 0, icon: <Users size={16} />, color: C.indigo },
            ].map(({ label, val, icon, color }) => (
              <div key={label} className={isDark ? "px-glass" : "px-glass-light"}
                style={{ padding: "clamp(14px,3vw,18px) clamp(12px,3vw,20px)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 11,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: `${color}18`, color,
                  }}>
                    {icon}
                  </div>
                  <Activity size={13} color={color} style={{ opacity: 0.5 }} />
                </div>
                <p className="px-display px-count" style={{
                  fontSize: "clamp(1.4rem,3vw,1.9rem)", fontWeight: 900,
                  color: textPri, margin: "0 0 4px", lineHeight: 1,
                  fontVariantNumeric: "tabular-nums",
                }}>
                  {typeof val === "number" ? val.toLocaleString() : val}
                </p>
                <p className="px-mono" style={{ fontSize: 10, color: textMuted, margin: 0, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  {label}
                </p>
              </div>
            ))}
          </div>

          {/* ── MAIN GRID ── */}
          <div className="px-grid">

            {/* ═══ LEFT COLUMN ═══ */}
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

              {/* ── LIVE AI & STORE PERFORMANCE COMMAND CENTER ── */}
              <div className={`px-s3 ${isDark ? "px-glass" : "px-glass-light"}`} style={{
                borderRadius: 24, overflow: "hidden", position: "relative",
                background: isDark
                  ? "linear-gradient(135deg, rgba(12,20,40,0.85) 0%, rgba(10,24,48,0.85) 100%)"
                  : "linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(240,244,249,0.95) 100%)",
                border: `1px solid ${isDark ? "rgba(52,211,153,0.25)" : "rgba(52,211,153,0.3)"}`,
              }}>

                {/* Geometric mesh background */}
                <div style={{
                  position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0,
                  backgroundImage: `radial-gradient(${isDark ? "rgba(52,211,153,0.06)" : "rgba(52,211,153,0.1)"} 1px, transparent 1px)`,
                  backgroundSize: "32px 32px",
                  maskImage: "linear-gradient(to bottom right, black 30%, transparent 80%)",
                }} />

                {/* Glow orb */}
                <div style={{
                  position: "absolute", top: -60, right: -60, width: 280, height: 280,
                  borderRadius: "50%", pointerEvents: "none", zIndex: 0,
                  background: isDark
                    ? "radial-gradient(circle, rgba(52,211,153,0.14) 0%, transparent 65%)"
                    : "radial-gradient(circle, rgba(52,211,153,0.18) 0%, transparent 65%)",
                }} />
                <div style={{
                  position: "absolute", bottom: -40, left: 40, width: 220, height: 220,
                  borderRadius: "50%", pointerEvents: "none", zIndex: 0,
                  background: isDark
                    ? "radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 65%)"
                    : "radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 65%)",
                }} />

                {/* Top accent line */}
                <div style={{
                  height: 2, width: "100%",
                  background: "linear-gradient(90deg, transparent, rgba(52,211,153,0.8) 30%, rgba(34,211,238,0.7) 70%, transparent)",
                  position: "relative", zIndex: 1,
                }} />

                <div className="px-hero-inner" style={{ position: "relative", zIndex: 1 }}>

                  {/* Header Row: Title + Live Status Pill */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: 12,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        background: "rgba(52,211,153,0.15)", color: C.emerald,
                        boxShadow: "0 0 20px rgba(52,211,153,0.2)",
                      }}>
                        <Zap size={18} strokeWidth={2.25} />
                      </div>
                      <div>
                        <span className="px-mono" style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: C.emerald }}>
                          Live Command Center
                        </span>
                        <h2 className="px-display" style={{ fontSize: "clamp(1.1rem, 2.5vw, 1.35rem)", fontWeight: 800, color: textPri, margin: "2px 0 0", letterSpacing: "-0.02em" }}>
                          AI Engine & Store Health
                        </h2>
                      </div>
                    </div>

                    <div style={{
                      display: "inline-flex", alignItems: "center", gap: 8,
                      padding: "6px 14px", borderRadius: 999,
                      background: isAiOn ? "rgba(52,211,153,0.12)" : "rgba(245,158,11,0.12)",
                      border: `1px solid ${isAiOn ? "rgba(52,211,153,0.3)" : "rgba(245,158,11,0.3)"}`,
                    }}>
                      <div className={isAiOn ? "px-pulse" : ""} style={{
                        width: 8, height: 8, borderRadius: "50%",
                        background: isAiOn ? C.emerald : C.amber,
                      }} />
                      <span className="px-mono" style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: isAiOn ? C.emerald : C.amber }}>
                        {isAiOn ? "AI Automation Live" : "AI Inactive"}
                      </span>
                    </div>
                  </div>

                  {/* System Status Indicators Grid */}
                  <div style={{
                    display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
                    gap: 10, marginBottom: 20,
                  }}>
                    {/* Status 1: WhatsApp Bot */}
                    <div style={{
                      padding: "10px 14px", borderRadius: 14,
                      background: subBg, border: `1px solid ${subBdr}`,
                      backdropFilter: "blur(12px)", display: "flex", alignItems: "center", gap: 10
                    }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: 10, flexShrink: 0,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        background: userData?.whatsapp?.connected ? "rgba(52,211,153,0.15)" : "rgba(251,113,133,0.15)",
                        color: userData?.whatsapp?.connected ? C.emerald : C.coral,
                      }}>
                        <Wifi size={15} strokeWidth={2.2} />
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <p style={{ fontSize: 11.5, fontWeight: 700, color: textPri, margin: "0 0 1px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          WhatsApp Bot
                        </p>
                        <p className="px-mono" style={{ fontSize: 9.5, color: userData?.whatsapp?.connected ? C.emerald : textMuted, margin: 0 }}>
                          {userData?.whatsapp?.connected ? "Connected" : "Disconnected"}
                        </p>
                      </div>
                    </div>

                    {/* Status 2: AI Knowledge Agent */}
                    <div style={{
                      padding: "10px 14px", borderRadius: 14,
                      background: subBg, border: `1px solid ${subBdr}`,
                      backdropFilter: "blur(12px)", display: "flex", alignItems: "center", gap: 10
                    }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: 10, flexShrink: 0,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        background: "rgba(34,211,238,0.15)", color: C.cyan,
                      }}>
                        <Brain size={15} strokeWidth={2.2} />
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <p style={{ fontSize: 11.5, fontWeight: 700, color: textPri, margin: "0 0 1px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          Agent Training
                        </p>
                        <p className="px-mono" style={{ fontSize: 9.5, color: C.cyan, margin: 0 }}>
                          {userData?.paxAI?.trained || userData?.paxAI?.businessDescription ? "Ready & Trained" : "Needs Training"}
                        </p>
                      </div>
                    </div>

                    {/* Status 3: Average Latency */}
                    <div style={{
                      padding: "10px 14px", borderRadius: 14,
                      background: subBg, border: `1px solid ${subBdr}`,
                      backdropFilter: "blur(12px)", display: "flex", alignItems: "center", gap: 10
                    }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: 10, flexShrink: 0,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        background: "rgba(129,140,248,0.15)", color: C.indigo,
                      }}>
                        <Activity size={15} strokeWidth={2.2} />
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <p style={{ fontSize: 11.5, fontWeight: 700, color: textPri, margin: "0 0 1px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          Response Latency
                        </p>
                        <p className="px-mono" style={{ fontSize: 9.5, color: C.indigo, margin: 0 }}>
                          ~1.8s (Instant)
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Live Activity & Performance Summary Bar */}
                  <div style={{
                    padding: "16px 20px", borderRadius: 18,
                    background: isDark ? "rgba(0,0,0,0.25)" : "rgba(0,0,0,0.03)", border: `1px solid ${subBdr}`,
                    marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      <div style={{
                        width: 38, height: 38, borderRadius: 12,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        background: "rgba(52,211,153,0.15)", color: C.emerald,
                      }}>
                        <Sparkles size={18} />
                      </div>
                      <div>
                        <span className="px-mono" style={{ fontSize: 9, color: textMuted, textTransform: "uppercase", letterSpacing: "0.1em" }}>Automated Conversations</span>
                        <p className="px-display" style={{ fontSize: 15, fontWeight: 800, color: textPri, margin: "2px 0 0" }}>
                          {userData?.messagesHandled ? `${userData.messagesHandled.toLocaleString()} Messages Handled` : "Auto-Reply Engine Active"}
                        </p>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <button type="button" className="px-btn"
                        onClick={() => router.push("/dashboard/automations/whatsapp-inbox")}
                        style={{
                          display: "inline-flex", alignItems: "center", gap: 6,
                          padding: "8px 14px", borderRadius: 11,
                          background: "rgba(52,211,153,0.15)", border: "1px solid rgba(52,211,153,0.25)",
                          color: C.emerald, fontSize: 12, fontWeight: 700,
                          fontFamily: "'Outfit', sans-serif",
                        }}>
                        <MessageCircle size={14} /> Live Inbox
                      </button>
                      <button type="button" className="px-btn"
                        onClick={() => router.push("/dashboard/automations/ai-business-dashboard")}
                        style={{
                          display: "inline-flex", alignItems: "center", gap: 6,
                          padding: "8px 14px", borderRadius: 11,
                          background: subBg, border: `1px solid ${subBdr}`,
                          color: textPri, fontSize: 12, fontWeight: 600,
                          fontFamily: "'Outfit', sans-serif",
                        }}>
                        <Bot size={14} /> Agent Setup
                      </button>
                    </div>
                  </div>

                  {/* CTA Buttons */}
                  <div className="px-cta-row">
                    <button type="button" className="px-btn"
                      onClick={() => router.push("/dashboard/automations/market-place")}
                      style={{
                        display: "inline-flex", alignItems: "center", gap: 10,
                        padding: "13px 24px", borderRadius: 14,
                        background: `linear-gradient(135deg, ${C.emerald} 0%, #059669 100%)`,
                        color: "#fff", fontWeight: 700, fontSize: 13.5,
                        letterSpacing: "-0.01em",
                        boxShadow: `0 16px 40px rgba(52,211,153,0.35), inset 0 1px 0 rgba(255,255,255,0.2)`,
                        fontFamily: "'Outfit', sans-serif",
                      }}>
                      <Sparkles size={16} strokeWidth={2.25} />
                      Open AI Marketplace
                      <ArrowRight size={15} strokeWidth={2.25} />
                    </button>
                  </div>
                </div>
              </div>

              {/* ── QUICK ACTIONS ── */}
              <div className={`px-s4 ${isDark ? "px-glass" : "px-glass-light"}`} style={{ padding: "24px" }}>
                <Label text="Quick Actions" isDark={isDark} />

                <div className="px-svc-grid">
                  <SvcCard title="My Store" link="/dashboard/my-store" icon={<Store size={19} strokeWidth={2.2} />} color={C.emerald} isDark={isDark} router={router} />
                  <SvcCard title="Products" link="/dashboard/automations/products" icon={<Package size={19} strokeWidth={2.2} />} color={C.cyan} isDark={isDark} router={router} />
                  <SvcCard title="AI Agent" link="/dashboard/automations/ai-business-dashboard" icon={<Bot size={19} strokeWidth={2.2} />} color={C.indigo} isDark={isDark} router={router} />
                  <SvcCard title="Inbox" link="/dashboard/automations/whatsapp-inbox" icon={<MessageSquare size={19} strokeWidth={2.2} />} color={C.amber} isDark={isDark} router={router} />
                  <SvcCard title="Analytics" link="/dashboard/automations/sales" icon={<BarChart2 size={19} strokeWidth={2.2} />} color={C.coral} isDark={isDark} router={router} />
                </div>
              </div>
            </div>

            {/* ═══ RIGHT SIDEBAR ═══ */}
            <aside style={{ display: "flex", flexDirection: "column", gap: 16 }}>

              {/* ── AI PLAN CARD ── */}
              <div className={`px-s3 ${isDark ? "px-glass" : "px-glass-light"}`}
                style={{ overflow: "hidden" }}>
                <div style={{
                  height: 3,
                  background: `linear-gradient(90deg, transparent, ${planCol}, transparent)`,
                }} />
                <div style={{ padding: "22px" }}>
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
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                      <span style={{ fontSize: 11, fontWeight: 500, color: textMuted }}>Messages used</span>
                      <span className="px-mono" style={{ fontSize: 11, fontWeight: 700, color: textPri }}>
                        {used.toLocaleString()}/{quota.toLocaleString()}
                      </span>
                    </div>
                    <div className="px-progress-track" style={{ background: subBg, border: `1px solid ${subBdr}` }}>
                      <div className="px-progress-fill px-shimmer"
                        style={{ width: `${pct}%`, minWidth: used > 0 ? 4 : 0 }} />
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
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "22px", gap: 12 }}>
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
                    padding: "0 22px 22px",
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
                      background: userData?.whatsapp?.connected ? `${C.emerald}18` : `${C.amber}12`,
                      color: userData?.whatsapp?.connected ? C.emerald : C.amber,
                    }}>
                      <Wifi size={18} strokeWidth={2} />
                    </div>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 700, color: textPri, margin: "0 0 3px" }}>
                        {userData?.whatsapp?.connected ? "WhatsApp Connected" : "Not Connected"}
                      </p>
                      <p className="px-mono" style={{ fontSize: 10, color: textMuted, margin: 0 }}>
                        {userData?.whatsapp?.connected
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
                    { label: "Broadcast Messaging", href: "/dashboard/automations/broadcast",           icon: <Radio size={15} />,   color: C.indigo  },
                    { label: "Marketing Campaigns", href: "/dashboard/automations/broadcast/campaigns", icon: <Send size={15} />,    color: C.orange  },
                    { label: "Prevent Ban Rules",   href: "/dashboard/prevent-ban",                     icon: <Shield size={15} />,  color: C.emerald },
                    { label: "Referral Earnings",   href: "/dashboard/referral",                        icon: <Users size={15} />,   color: C.cyan    },
                    { label: "Billing & Plans",     href: "/dashboard/billing",                         icon: <Crown size={15} />,   color: C.amber   },
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