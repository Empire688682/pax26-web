"use client";
import React, { useEffect, useState } from "react";
import {
  Bot, Phone, Wifi, Zap, Tv, ArrowRightLeft,
  Bell, ArrowRight, Eye, EyeOff, TrendingUp,
  MessageSquare, Users, Layers, Crown, Sparkles,
  Database, BookOpen, Gift, MessageCircle, Brain, Repeat,
  Activity, ChevronRight, BarChart2, Shield, MapPin,
  Radio, Send
} from "lucide-react";

const ICON_MAP = {
  Phone, Database, Zap, Tv, BookOpen, Gift,
  MessageCircle, Brain, Repeat, ArrowRightLeft, Wifi
};

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
  }
  .px-svc-grid {
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: 10px;
  }
  @media (max-width: 500px) {
    .px-svc-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
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
  const [vtuServices, setVtuServices] = useState([]);

  useEffect(() => {
    getUserRealTimeData();
    fetchUser();
    const fetchServices = async () => {
      try {
        const adminUrl = process.env.NEXT_PUBLIC_ADMIN_URL;
        if (!adminUrl) return;
        const res = await fetch(`${adminUrl}/misc/services`);
        if (!res.ok) return;
        const data = await res.json();
        if (data.success && data.data) {
          setVtuServices(data.data.filter(s => s.category === "vtu" && s.active !== false));
        }
      } catch (err) { console.error(err); }
    };
    fetchServices();
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
    ({ starter: 500, business: 2000, enterprise: 10000 }[plan] ?? 200);
  const pct = Math.min((used / (quota || 1)) * 100, 100);
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
          padding: "28px 20px 100px",
          position: "relative", zIndex: 1,
          display: "flex", flexDirection: "column", gap: 20,
        }}>

          {/* ── TICKER BAR ── */}
          <div className="px-s1" style={{
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
          <header className="px-s1" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
            <div>
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
                Your automations, wallet & services — all in one place.
              </p>
            </div>
            <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>
              <button type="button" className="px-btn"
                onClick={() => router.push("/notifications")}
                style={{
                  width: 46, height: 46, borderRadius: 14,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: subBg, border: `1px solid ${subBdr}`, cursor: "pointer",
                }}>
                <Bell size={18} color={textSec} strokeWidth={2} />
              </button>
              <button type="button" className="px-btn"
                onClick={() => router.push("/dashboard/settings")}
                style={{
                  width: 46, height: 46, borderRadius: 14,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: subBg, border: `1px solid ${subBdr}`, cursor: "pointer",
                }}>
                <Shield size={18} color={textSec} strokeWidth={2} />
              </button>
            </div>
          </header>

          {/* ── STAT STRIP ── */}
          <div className="px-s2" style={{
            display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14,
          }}>
            {[
              { label: "Automations", val: userData?.workflows || 0, icon: <Layers size={16} />, color: C.emerald },
              { label: "Msgs Handled", val: userData?.messagesHandled || 0, icon: <MessageSquare size={16} />, color: C.cyan },
              { label: "Contacts", val: userData?.contacts || 0, icon: <Users size={16} />, color: C.indigo },
            ].map(({ label, val, icon, color }) => (
              <div key={label} className={isDark ? "px-glass" : "px-glass-light"}
                style={{ padding: "18px 20px" }}>
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

              {/* ── HERO AUTOMATION CARD ── */}
              <div className="px-s3 px-glow" style={{
                borderRadius: 24, overflow: "hidden", position: "relative",
                background: isDark
                  ? "linear-gradient(135deg, #0c1428 0%, #0a1830 50%, #071220 100%)"
                  : "linear-gradient(135deg, #1e3a5f 0%, #0f2d55 50%, #0a2040 100%)",
                border: `1px solid ${isDark ? "rgba(52,211,153,0.2)" : "rgba(52,211,153,0.3)"}`,
              }}>

                {/* Geometric mesh background */}
                <div style={{
                  position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0,
                  backgroundImage: `radial-gradient(rgba(52,211,153,0.06) 1px, transparent 1px)`,
                  backgroundSize: "32px 32px",
                  maskImage: "linear-gradient(to bottom right, black 30%, transparent 80%)",
                }} />

                {/* Glow orb */}
                <div style={{
                  position: "absolute", top: -60, right: -60, width: 280, height: 280,
                  borderRadius: "50%", pointerEvents: "none", zIndex: 0,
                  background: "radial-gradient(circle, rgba(52,211,153,0.12) 0%, transparent 65%)",
                }} />
                <div style={{
                  position: "absolute", bottom: -40, left: 40, width: 200, height: 200,
                  borderRadius: "50%", pointerEvents: "none", zIndex: 0,
                  background: "radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 65%)",
                }} />

                {/* Top accent line */}
                <div style={{
                  height: 2, width: "100%",
                  background: "linear-gradient(90deg, transparent, rgba(52,211,153,0.8) 30%, rgba(34,211,238,0.7) 70%, transparent)",
                  position: "relative", zIndex: 1,
                }} />

                <div style={{ padding: "32px 36px 36px", position: "relative", zIndex: 1 }}>
                  {/* Pills */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 24 }}>
                    <div style={{
                      display: "inline-flex", alignItems: "center", gap: 8,
                      padding: "6px 14px 6px 10px", borderRadius: 999,
                      background: "rgba(52,211,153,0.1)",
                      border: "1px solid rgba(52,211,153,0.25)",
                    }}>
                      <Bot size={13} color={C.emerald} />
                      <span className="px-mono" style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: C.emerald }}>
                        PaxAI Automation
                      </span>
                    </div>
                    <div style={{
                      display: "inline-flex", alignItems: "center", gap: 8,
                      padding: "6px 14px 6px 10px", borderRadius: 999,
                      background: isAiOn ? "rgba(52,211,153,0.1)" : "rgba(148,163,184,0.08)",
                      border: `1px solid ${isAiOn ? "rgba(52,211,153,0.3)" : "rgba(148,163,184,0.2)"}`,
                    }}>
                      <div className={isAiOn ? "px-pulse" : ""}
                        style={{
                          width: 7, height: 7, borderRadius: "50%",
                          background: isAiOn ? C.emerald : "#64748b",
                          color: isAiOn ? C.emerald : "transparent",
                        }} />
                      <span className="px-mono" style={{
                        fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
                        color: isAiOn ? C.emerald : "rgba(148,163,184,0.6)",
                      }}>
                        {isAiOn ? "AI Active" : "Ready to Launch"}
                      </span>
                    </div>
                  </div>

                  {/* Headline */}
                  <h2 className="px-display" style={{
                    fontSize: "clamp(1.9rem,4.5vw,2.7rem)",
                    fontWeight: 900, lineHeight: 1.05, letterSpacing: "-0.04em",
                    color: "#f1f5f9", margin: "0 0 16px", maxWidth: 500,
                  }}>
                    Your business,<br />
                    <span style={{
                      background: `linear-gradient(90deg, ${C.emerald}, ${C.cyan})`,
                      WebkitBackgroundClip: "text", backgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}>
                      on autopilot.
                    </span>
                  </h2>

                  <p style={{
                    fontSize: 14.5, lineHeight: 1.7,
                    color: "rgba(148,163,184,0.85)",
                    margin: "0 0 32px", maxWidth: 420, fontWeight: 400,
                  }}>
                    Auto-reply WhatsApp messages, capture leads and serve customers 24/7 — hands-free with PaxAI.
                  </p>

                  {/* CTA buttons */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                    <button type="button" className="px-btn"
                      onClick={() => router.push("dashboard/automations")}
                      style={{
                        display: "inline-flex", alignItems: "center", gap: 10,
                        padding: "14px 26px", borderRadius: 14,
                        background: `linear-gradient(135deg, ${C.emerald} 0%, #059669 100%)`,
                        color: "#fff", fontWeight: 700, fontSize: 14,
                        letterSpacing: "-0.01em",
                        boxShadow: `0 16px 40px rgba(52,211,153,0.35), inset 0 1px 0 rgba(255,255,255,0.2)`,
                        fontFamily: "'Outfit', sans-serif",
                      }}>
                      <Sparkles size={16} strokeWidth={2.25} />
                      Open Automations
                      <ArrowRight size={15} strokeWidth={2.25} />
                    </button>
                    <button type="button" className="px-btn"
                      onClick={() => router.push("dashboard/automations/ai-business-dashboard")}
                      style={{
                        display: "inline-flex", alignItems: "center", gap: 8,
                        padding: "14px 22px", borderRadius: 14,
                        background: "rgba(255,255,255,0.06)",
                        border: "1px solid rgba(255,255,255,0.12)",
                        color: "rgba(226,232,240,0.85)", fontWeight: 600, fontSize: 14,
                        backdropFilter: "blur(8px)",
                        fontFamily: "'Outfit', sans-serif",
                      }}>
                      <BarChart2 size={15} />
                      View Analytics
                    </button>
                  </div>
                </div>
              </div>

              {/* ── QUICK SERVICES ── */}
              <div className={`px-s4 ${isDark ? "px-glass" : "px-glass-light"}`} style={{ padding: "24px" }}>
                <Label text="Quick Services" isDark={isDark} />

                {userData?.country === "Nigeria" ? (
                  /* ── Nigeria: show VTU grid ── */
                  <div className="px-svc-grid">
                    {vtuServices.length > 0 ? vtuServices.map((svc) => {
                      const IconComponent = ICON_MAP[svc.iconName] || Zap;
                      const linkUrl = svc.key === "transfer"
                        ? "/dashboard/services/transfer"
                        : `/dashboard/services/buy-${svc.key.replace("buy-", "")}`;
                      return (
                        <SvcCard key={svc.key}
                          title={svc.name.replace(" Bundles", "").replace(" Pins", "").replace(" Cards", "")}
                          link={linkUrl}
                          icon={<IconComponent size={19} strokeWidth={2.2} />}
                          color={svc.color || C.emerald}
                          isDark={isDark} router={router}
                        />
                      );
                    }) : (
                      <>
                        <SvcCard title="Airtime" link="/dashboard/services/buy-airtime" icon={<Phone size={19} strokeWidth={2.2} />} color={C.emerald} isDark={isDark} router={router} />
                        <SvcCard title="Data" link="/dashboard/services/buy-data" icon={<Wifi size={19} strokeWidth={2.2} />} color={C.cyan} isDark={isDark} router={router} />
                        <SvcCard title="Electricity" link="/dashboard/services/buy-electricity" icon={<Zap size={19} strokeWidth={2.2} />} color={C.amber} isDark={isDark} router={router} />
                        <SvcCard title="TV" link="/dashboard/services/buy-tv-subscription" icon={<Tv size={19} strokeWidth={2.2} />} color={C.indigo} isDark={isDark} router={router} />
                        <SvcCard title="Transfer" link="/dashboard/services/transfer" icon={<ArrowRightLeft size={19} strokeWidth={2.2} />} color={C.orange} isDark={isDark} router={router} />
                      </>
                    )}
                  </div>
                ) : (
                  /* ── Non-Nigerian: friendly notice card ── */
                  <div style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 16,
                    padding: "20px 22px",
                    borderRadius: 18,
                    background: isDark ? "rgba(251,191,36,0.05)" : "rgba(251,191,36,0.06)",
                    border: `1px solid ${isDark ? "rgba(251,191,36,0.18)" : "rgba(251,191,36,0.25)"}`,
                  }}>
                    {/* globe icon badge */}
                    <div style={{
                      flexShrink: 0,
                      width: 44, height: 44, borderRadius: 13,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      background: "rgba(251,191,36,0.12)",
                      border: "1px solid rgba(251,191,36,0.22)",
                      color: C.amber,
                    }}>
                      <MapPin size={19} strokeWidth={2.2} />
                    </div>

                    {/* text content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 10, marginBottom: 6 }}>
                        <span style={{
                          fontSize: 13.5, fontWeight: 700,
                          color: isDark ? "rgba(226,232,240,0.92)" : "rgba(15,23,42,0.9)",
                          fontFamily: "'Outfit', sans-serif",
                        }}>
                          🌍 Utility Services
                        </span>
                        {/* Coming Soon badge */}
                        <span style={{
                          fontSize: 9, fontWeight: 800, letterSpacing: "0.1em",
                          textTransform: "uppercase", padding: "3px 10px", borderRadius: 999,
                          background: "rgba(251,191,36,0.15)",
                          color: C.amber,
                          border: "1px solid rgba(251,191,36,0.3)",
                          fontFamily: "'DM Mono', monospace",
                        }}>
                          Coming Soon
                        </span>
                      </div>
                      <p style={{
                        fontSize: 12.5, lineHeight: 1.65, margin: 0, fontWeight: 400,
                        color: isDark ? "rgba(148,163,184,0.75)" : "rgba(71,85,105,0.8)",
                        fontFamily: "'Outfit', sans-serif",
                      }}>
                        Utility services (Airtime, Data, Electricity, TV &amp; Transfers) are currently available in{" "}
                        <strong style={{ color: C.amber, fontWeight: 700 }}>Nigeria</strong>{" "}only — more countries coming soon.
                      </p>
                    </div>
                  </div>
                )}
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
                        style={{ width: `${pct}%` }} />
                    </div>
                    <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 5 }}>
                      <span className="px-mono" style={{ fontSize: 9, color: pct >= 90 ? C.coral : textMuted }}>
                        {Math.round(pct)}% used
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

              {/* ── WHATSAPP STATUS CARD ── */}
              <div className={`px-s5 ${isDark ? "px-glass" : "px-glass-light"}`}
                style={{ padding: "22px", cursor: "pointer" }}
                onClick={() => router.push("/dashboard/automations/whatsapp-connect")}>
                <Label text="WhatsApp" isDark={isDark} />
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
                        {userData?.whatsapp?.connected ? "Connected" : "Not Connected"}
                      </p>
                      <p className="px-mono" style={{ fontSize: 10, color: textMuted, margin: 0 }}>
                        {userData?.whatsapp?.connected
                          ? userData?.whatsappBusinessNo || "Business number active"
                          : "Tap to connect"}
                      </p>
                    </div>
                  </div>
                  <ChevronRight size={16} color={textMuted} />
                </div>
              </div>

              {/* ── QUICK LINKS ── */}
              <div className={`px-s6 ${isDark ? "px-glass" : "px-glass-light"}`} style={{ padding: "22px" }}>
                <Label text="Quick Links" isDark={isDark} />
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {[
                    { label: "AI Automations",  href: "/dashboard/automations",                    icon: <Bot size={15} />,     color: C.emerald },
                    { label: "Analytics",        href: "/dashboard/automations/ai-business-dashboard", icon: <BarChart2 size={15} />, color: C.cyan    },
                    { label: "Broadcast",        href: "/dashboard/automations/broadcast",           icon: <Radio size={15} />,   color: C.indigo  },
                    { label: "Campaigns",         href: "/dashboard/automations/broadcast/campaigns", icon: <Send size={15} />,    color: C.orange  },
                    { label: "Billing & Plans",   href: "/dashboard/billing",                         icon: <Crown size={15} />,   color: C.amber   },
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