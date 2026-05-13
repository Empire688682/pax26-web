"use client";
import React, { useEffect, useState } from "react";
import {
  Bot, Phone, Wifi, Zap, Tv, ArrowRightLeft,
  Bell, ArrowRight, Eye, EyeOff, TrendingUp,
  MessageSquare, Users, Layers, ChevronRight, Crown, Sparkles,
  Database, BookOpen, Gift, MessageCircle, Brain, Repeat
} from "lucide-react";

const ICON_MAP = {
  Phone, Database, Zap, Tv, BookOpen, Gift,
  MessageCircle, Brain, Repeat, ArrowRightLeft, Wifi
};
import { useGlobalContext } from "../Context";
import WalletBalance from "../WalletBalance/WalletBalance";
import CashBackBalance from "../CashBackBalance/CashBackBalance";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,600&display=swap');

.db {
  font-family: 'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

@keyframes db-in {
  from { opacity: 0; transform: translateY(14px) scale(0.992); filter: blur(4px); }
  to { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
}
@keyframes db-exp {
  from { opacity: 0; transform: translateY(-6px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes db-shimmer {
  0% { background-position: 200% center; }
  100% { background-position: -200% center; }
}
@keyframes db-pulse-dot {
  0%, 100% { opacity: 1; box-shadow: 0 0 0 0 currentColor; }
  70% { opacity: 0.85; box-shadow: 0 0 0 6px transparent; }
}

.db-s1 { animation: db-in 0.55s cubic-bezier(0.16, 1, 0.3, 1) both; }
.db-s2 { animation: db-in 0.55s cubic-bezier(0.16, 1, 0.3, 1) 0.07s both; }
.db-s3 { animation: db-in 0.55s cubic-bezier(0.16, 1, 0.3, 1) 0.14s both; }
.db-s4 { animation: db-in 0.55s cubic-bezier(0.16, 1, 0.3, 1) 0.21s both; }
.db-s5 { animation: db-in 0.55s cubic-bezier(0.16, 1, 0.3, 1) 0.28s both; }
.db-s6 { animation: db-in 0.55s cubic-bezier(0.16, 1, 0.3, 1) 0.35s both; }
.db-exp { animation: db-exp 0.32s cubic-bezier(0.16, 1, 0.3, 1) both; }

.db-card {
  border-radius: 18px;
  transition: transform 0.22s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.22s ease, border-color 0.22s ease;
}
.db-card:hover { transform: translateY(-1px); }

.db-surface {
  box-shadow:
    0 0 0 1px var(--db-surface-ring, rgba(255,255,255,0.06)),
    0 10px 40px -18px rgba(0, 0, 0, 0.65),
    inset 0 1px 0 rgba(255,255,255,0.06);
}
.db-surface:hover {
  box-shadow:
    0 0 0 1px var(--db-surface-ring-hover, rgba(255,255,255,0.1)),
    0 20px 50px -20px rgba(0, 0, 0, 0.55),
    inset 0 1px 0 rgba(255,255,255,0.08);
}

.db-hero-shell {
  position: relative;
  border-radius: 22px;
  padding: 1px;
  overflow: visible;
}
.db-hero-inner {
  border-radius: 21px;
  overflow: hidden;
  position: relative;
  isolation: isolate;
}
.db-hero-grid {
  position: absolute;
  inset: 0;
  z-index: 1;
  background-size: 56px 56px;
  mask-image: linear-gradient(to bottom, black 55%, transparent 100%);
  -webkit-mask-image: linear-gradient(to bottom, black 55%, transparent 100%);
  pointer-events: none;
}
.db-hero-noise {
  position: absolute;
  inset: 0;
  z-index: 1;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  pointer-events: none;
}
.db-hero-beam {
  height: 2px;
  background: linear-gradient(90deg, transparent, rgba(59,130,246,0.9) 35%, rgba(34,211,238,0.85) 65%, transparent);
  background-size: 220% 100%;
  animation: db-shimmer 8s linear infinite;
  position: relative;
  z-index: 2;
}

.db-svc {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 16px 6px;
  border: none;
  background: none;
  border-radius: 14px;
  cursor: pointer;
  width: 100%;
  position: relative;
  overflow: hidden;
  transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s ease;
}
.db-svc::after {
  content: "";
  position: absolute;
  inset: -40%;
  background: radial-gradient(circle at 50% 100%, rgba(255,255,255,0.08), transparent 55%);
  opacity: 0;
  transition: opacity 0.25s ease;
  pointer-events: none;
}
.db-svc:hover { transform: translateY(-4px); }
.db-svc:hover::after { opacity: 1; }
.db-svc:active { transform: translateY(-1px); }

.db-tx {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 14px 16px;
  margin: 0 4px;
  border-radius: 12px;
  cursor: pointer;
  transition: background 0.18s ease;
  border-bottom: 1px solid rgba(148,163,184,0.06);
}
.db-tx:last-child { border-bottom: none; }
.db-tx:hover { background: rgba(148,163,184,0.06); }

.db-btn {
  transition: opacity 0.15s ease, transform 0.18s cubic-bezier(0.16, 1, 0.3, 1);
  cursor: pointer;
}
.db-btn:hover { opacity: 0.92; transform: translateY(-1px); }
.db-btn:active { transform: translateY(0); }

.db-grid {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 22px;
  align-items: start;
}
@media (max-width: 900px) {
  .db-grid { grid-template-columns: 1fr; gap: 20px; }
}
@media (max-width: 520px) {
  #VTU.db-svc-grid { grid-template-columns: repeat(3, minmax(0, 1fr)) !important; }
}

.db-stat-mini {
  transition: transform 0.22s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.22s ease, background 0.22s ease;
}
.db-stat-mini:hover { transform: translateY(-2px); }

.db-ai-dot { animation: db-pulse-dot 2.2s ease-in-out infinite; }
`;

function SvcCard({ title, link, icon, color, pax26, router }) {
  return (
    <button
      type="button"
      className="db-svc"
      onClick={() => router.push(link)}
      style={{ background: pax26?.secondaryBg ?? "transparent", border: `1px solid ${pax26?.border}` }}
      aria-label={title}
    >
      <div style={{
        width: 44, height: 44, borderRadius: 13,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: `${color}18`, color,
        boxShadow: `0 8px 24px ${color}12`,
      }}>
        {icon}
      </div>
      <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.02, color: pax26?.textPrimary }}>
        {title}
      </span>
    </button>
  );
}

function TxRow({ tx, onClick, pax26 }) {
  const s = tx.status;
  const col = s === "success" ? "#22c55e" : s === "pending" ? "#fbbf24" : "#fb7185";
  return (
    <div className="db-tx" onClick={onClick} role="button" tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(); } }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, minWidth: 0 }}>
        <div style={{
          width: 38, height: 38, borderRadius: 11, flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: `${col}14`, color: col, boxShadow: `inset 0 1px 0 ${col}22`,
        }}>
          <TrendingUp size={15} strokeWidth={2.25} />
        </div>
        <div style={{ minWidth: 0 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: pax26?.textPrimary, margin: "0 0 3px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {tx.description}
          </p>
          <p style={{ fontSize: 10, color: pax26?.textSecondary, opacity: 0.65, margin: 0, fontVariantNumeric: "tabular-nums" }}>
            {new Date(tx.createdAt).toLocaleString()}
          </p>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", flexShrink: 0 }}>
        <p style={{ fontSize: 14, fontWeight: 800, color: col, margin: "0 0 2px", fontVariantNumeric: "tabular-nums" }}>
          ₦{tx.amount?.toLocaleString()}
        </p>
        <p style={{ fontSize: 10, fontWeight: 600, color: pax26?.textSecondary, opacity: 0.55, margin: 0, textTransform: "capitalize", letterSpacing: 0.04 }}>
          {tx.type}
        </p>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { userData, pax26, router, transactionHistory, getUserRealTimeData, fetchUser } = useGlobalContext();
  const [showWallet, setShowWallet] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [vtuServices, setVtuServices] = useState([]);

  useEffect(() => {
    getUserRealTimeData();
    fetchUser();

    // Fetch VTU services from Admin Backend
    const fetchServices = async () => {
      try {
        const adminUrl = process.env.NEXT_PUBLIC_ADMIN_URL;
        if (!adminUrl) return;

        // Robustly construct the URL as requested: env url + /api/misc/services
        const fetchUrl = `${adminUrl}/misc/services`;

        const res = await fetch(fetchUrl);
        if (!res.ok) {
          console.error("VTU services fetch failed:", res.status);
          return;
        }
        const data = await res.json();

        if (data.success && data.data) {
          // Filter out active VTU services
          const vtu = data.data.filter(s => s.category === "vtu" && s.active !== false);
          setVtuServices(vtu);
        }
      } catch (err) {
        console.error("Error fetching services:", err);
      }
    };
    fetchServices();
  }, []);

  const firstName = userData?.name?.split(" ")[0] || "User";
  const P = pax26?.primary || "#3b82f6";
  const G = "#34d399";
  const T = "#22d3ee";
  const Am = "#fbbf24";
  const Co = "#fb923c";
  const Vi = "#c4b5fd";

  const plan = userData?.paxAI?.plan || "free";
  const isAiOn = !!userData?.paxAI?.enabled;
  const used = userData?.paxAI?.messagesUsedThisMonth ?? 0;
  const quota = userData?.paxAI?.maxMonthlyMessages ?? 50;
  const pct = Math.min((used / (quota || 1)) * 100, 100);
  const planCol = { free: pax26?.textSecondary, starter: T, business: Am, enterprise: Vi }[plan] ?? pax26?.textSecondary;

  const surfaceRing = typeof pax26?.border === "string" ? pax26.border : "rgba(241,245,249,0.08)";
  const isLightTheme = String(pax26?.card || "").toLowerCase() === "#ffffff";

  // ── Hero theme tokens that mirror the AI plan card exactly ──
  // Text always uses pax26 tokens, never hardcoded dark values
  const heroTextPrimary = pax26?.textPrimary;   // same as AI plan card title "free"
  const heroTextSecondary = pax26?.textSecondary; // same as AI plan card "Messages used"
  const heroTextMuted = isLightTheme
    ? `color-mix(in srgb, ${pax26?.textSecondary} 70%, transparent)`
    : "rgba(226,232,240,0.52)";

  // Pill backgrounds mirror the AI plan card's badge style
  const heroPillBg = isLightTheme ? pax26?.secondaryBg : "rgba(255,255,255,0.05)";
  const heroPillBorder = isLightTheme ? pax26?.border : "rgba(255,255,255,0.1)";

  // Stat mini cards mirror the AI plan card's inner container
  const heroStatBg = isLightTheme ? pax26?.secondaryBg : "rgba(255,255,255,0.04)";
  const heroStatBorder = isLightTheme ? pax26?.border : "rgba(255,255,255,0.085)";

  // Ghost CTA button mirrors the AI plan "Manage plan" button
  const heroGhostBg = isLightTheme ? pax26?.secondaryBg : "rgba(255,255,255,0.06)";
  const heroGhostBorder = isLightTheme ? pax26?.border : "rgba(255,255,255,0.12)";
  const heroGhostColor = isLightTheme ? pax26?.textPrimary : "rgba(248,250,252,0.72)";

  // Noise opacity lighter on light theme (same as the card's surface feel)
  const heroNoiseOpacity = isLightTheme ? 0.012 : 0.035;

  // Shell gradient border — subtler on light, richer on dark
  const heroShellGrad = isLightTheme
    ? `linear-gradient(135deg, rgba(37,99,235,0.38), rgba(6,182,212,0.18) 45%, rgba(99,102,241,0.28))`
    : `linear-gradient(135deg, rgba(59,130,246,0.55), rgba(6,182,212,0.25) 45%, rgba(99,102,241,0.35))`;

  const heroInnerShadow = isLightTheme
    ? `0 20px 50px -24px rgba(15,23,42,0.14), 0 0 64px ${P}0f`
    : `0 24px 70px -30px rgba(15,23,42,0.85), 0 0 80px ${P}10`;

  // Orb tints — use primary + teal, lighter on light theme so they don't overpower the card bg
  const orb1Bg = isLightTheme ? `${P}14` : `${P}10`;
  const orb2Bg = isLightTheme ? `${T}0e` : `${T}08`;

  return (
    <>
      <style>{CSS}</style>
      <div
        className="db"
        style={{
          maxWidth: 1180, margin: "0 auto",
          padding: "8px 0 96px",
          display: "flex", flexDirection: "column", gap: 22,
          ["--db-surface-ring"]: surfaceRing,
          ["--db-surface-ring-hover"]: surfaceRing,
        }}
      >

        {/* ── HEADER ── */}
        <header className="db-s1" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, minWidth: 0 }}>
            <div style={{
              width: 52, height: 52, borderRadius: 16, flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              background: `linear-gradient(145deg, ${P}22, transparent)`,
              border: `1px solid ${surfaceRing}`,
              boxShadow: `inset 0 1px 0 rgba(255,255,255,0.06), 0 12px 32px ${P}12`,
            }}>
              <span style={{ fontSize: 22 }} aria-hidden>✦</span>
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: pax26?.textSecondary, opacity: 0.45, margin: "0 0 6px" }}>
                Welcome back
              </p>
              <h1 style={{ fontSize: "clamp(1.55rem, 4vw, 1.95rem)", fontWeight: 800, letterSpacing: "-0.03em", color: pax26?.textPrimary, margin: 0, lineHeight: 1.15 }}>
                {firstName}<span style={{ opacity: 0.9 }}> 👋</span>
              </h1>
              <p style={{ fontSize: 13, color: pax26?.textSecondary, opacity: 0.8, margin: "8px 0 0", fontWeight: 500 }}>
                Your wallet, PaxAI automations, and utility tools in one place.
              </p>
            </div>
          </div>
          <button type="button" className="db-btn db-surface"
            onClick={() => router.push("/notifications")}
            style={{
              width: 46, height: 46, borderRadius: 14, flexShrink: 0,
              border: `1px solid ${pax26?.border}`,
              background: `linear-gradient(180deg, ${pax26?.secondaryBg ?? "#0d1526"} 0%, ${pax26?.bg ?? "#01050f"} 100%)`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
            aria-label="Notifications"
          >
            <Bell size={19} color={pax26?.textSecondary} strokeWidth={2} />
          </button>
        </header>

        {/* ── MAIN GRID ── */}
        <div className="db-grid db-s2">

          {/* ══ HERO — all colors now inherit from pax26 tokens ══ */}
          <div className="db-hero-shell" style={{ background: heroShellGrad }}>
            <div
              role="button" tabIndex={0}
              className="db-hero-inner"
              style={{ cursor: "pointer", background: pax26?.card ?? pax26?.bg, boxShadow: heroInnerShadow }}
            >


              <div style={{ position: "relative", zIndex: 3, padding: "clamp(24px,5vw,40px)" }}>

                {/* ── Pill row — styled like the AI plan card's status badge ── */}
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10, marginBottom: 22 }}>
                  {/* PaxAI label pill */}
                  <div style={{
                    display: "inline-flex", alignItems: "center", gap: 8,
                    padding: "6px 14px 6px 10px", borderRadius: 999,
                    background: heroPillBg,
                    border: `1px solid ${heroPillBorder}`,
                    backdropFilter: isLightTheme ? "none" : "blur(8px)",
                  }}>
                    <Bot size={13} color={P} strokeWidth={2.25} />
                    <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: heroTextSecondary }}>
                      PaxAI Automation
                    </span>
                  </div>

                  {/* AI status pill — identical logic to the AI plan "Active/Inactive" badge */}
                  <div style={{
                    display: "inline-flex", alignItems: "center", gap: 8,
                    padding: "6px 14px 6px 10px", borderRadius: 999,
                    background: isAiOn ? `${G}18` : (isLightTheme ? pax26?.secondaryBg : "rgba(148,163,184,0.1)"),
                    border: `1px solid ${isAiOn ? `${G}35` : (isLightTheme ? pax26?.border : "rgba(148,163,184,0.25)")}`,
                  }}>
                    <div
                      className={isAiOn ? "db-ai-dot" : ""}
                      style={{
                        width: 7, height: 7, borderRadius: "50%",
                        background: isAiOn ? G : (isLightTheme ? pax26?.textSecondary : "#64748b"),
                        color: isAiOn ? G : "transparent",
                      }}
                    />
                    <span style={{
                      fontSize: 10, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase",
                      color: isAiOn ? G : heroTextSecondary,
                    }}>
                      {isAiOn ? "AI Active" : "Ready to Launch"}
                    </span>
                  </div>
                </div>

                {/* ── Headline — uses pax26.textPrimary like "Free" title in AI plan card ── */}
                <h2 style={{
                  fontSize: "clamp(1.75rem, 4vw, 2.35rem)",
                  fontWeight: 800, lineHeight: 1.08, letterSpacing: "-0.03em",
                  color: heroTextPrimary,
                  margin: "0 0 14px", maxWidth: 480,
                }}>
                  Your business,<br />
                  <span style={{
                    WebkitBackgroundClip: "text", backgroundClip: "text", color: "blue",
                  }}>
                    on autopilot.
                  </span>
                </h2>

                {/* ── Body copy — uses pax26.textSecondary like "Messages used" label ── */}
                <p style={{
                  fontSize: 14, lineHeight: 1.75,
                  color: heroTextSecondary,
                  opacity: isLightTheme ? 0.75 : 0.62,
                  margin: "0 0 28px", maxWidth: 420, fontWeight: 400,
                }}>
                  Auto-reply WhatsApp messages, capture leads and serve customers 24/7 — hands-free with PaxAI.
                </p>

                {/* ── Stat tiles — styled like the AI plan card's inner containers ── */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 11, marginBottom: 28 }}>
                  {[
                    { label: "Automations", val: userData?.workflows || 0, icon: <Layers size={15} />, color: P },
                    { label: "Msgs handled", val: userData?.messagesHandled || 0, icon: <MessageSquare size={15} />, color: T },
                    { label: "Contacts", val: userData?.contacts || 0, icon: <Users size={15} />, color: G },
                  ].map((c) => (
                    <div key={c.label} className="db-stat-mini" style={{
                      borderRadius: 15, padding: "14px 16px",
                      background: heroStatBg,
                      border: `1px solid ${heroStatBorder}`,
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, color: c.color }}>
                        {c.icon}
                        {/* Label uses textSecondary opacity — same as "Messages used" in AI plan card */}
                        <span style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.09em", color: heroTextSecondary, opacity: 0.6 }}>
                          {c.label}
                        </span>
                      </div>
                      {/* Value uses textPrimary — same as "22 / 50" count in AI plan card */}
                      <p style={{ fontSize: "clamp(1.35rem, 3.5vw, 1.75rem)", fontWeight: 800, color: heroTextPrimary, margin: 0, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
                        {typeof c.val === "number" ? c.val.toLocaleString() : c.val}
                      </p>
                    </div>
                  ))}
                </div>

                {/* ── CTAs ── */}
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 11 }}>
                  {/* Primary — same gradient as the progress bar fill */}
                  <button type="button" className="db-btn"
                    onClick={(e) => { e.stopPropagation(); router.push("dashboard/automations"); }}
                    style={{
                      display: "inline-flex", alignItems: "center", gap: 9,
                      padding: "13px 22px", borderRadius: 13, border: "none",
                      background: `linear-gradient(135deg, ${P} 0%, #2563eb 100%)`,
                      color: "#fff", fontWeight: 700, fontSize: 14, letterSpacing: "-0.01em",
                      boxShadow: `0 14px 36px ${P}40, inset 0 1px 0 rgba(255,255,255,0.22)`,
                    }}
                  >
                    <Sparkles size={16} strokeWidth={2.25} /> Open automations <ArrowRight size={16} strokeWidth={2.25} />
                  </button>

                  {/* Ghost — mirrors the "Manage plan" button in AI plan card */}
                  <button type="button" className="db-btn"
                    onClick={(e) => { e.stopPropagation(); router.push("dashboard/automations/ai-business-dashboard"); }}
                    style={{
                      display: "inline-flex", alignItems: "center", gap: 8,
                      padding: "13px 20px", borderRadius: 13,
                      background: heroGhostBg,
                      border: `1px solid ${heroGhostBorder}`,
                      color: heroGhostColor,
                      fontWeight: 600, fontSize: 14,
                      backdropFilter: isLightTheme ? "none" : "blur(8px)",
                    }}
                  >
                    View analytics
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ══ SIDEBAR ══ */}
          <aside style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* AI Plan card */}
            <div className="db-card db-surface db-s3" style={{ background: pax26?.card ?? pax26?.bg, border: `1px solid ${pax26?.border}`, overflow: "hidden" }}>
              <div style={{ height: 3, background: `linear-gradient(90deg, transparent, ${planCol}, transparent)` }} />
              <div style={{ padding: "20px 22px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18, gap: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{
                      width: 42, height: 42, borderRadius: 13,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      background: `${planCol}18`, color: planCol, border: `1px solid ${planCol}30`,
                    }}>
                      <Crown size={17} strokeWidth={2} />
                    </div>
                    <div>
                      <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: pax26?.textSecondary, opacity: 0.42, margin: "0 0 4px" }}>
                        AI plan
                      </p>
                      <p style={{ fontSize: 15, fontWeight: 800, color: pax26?.textPrimary, margin: 0, textTransform: "capitalize", letterSpacing: "-0.02em" }}>
                        {plan}
                      </p>
                    </div>
                  </div>
                  <span style={{
                    fontSize: 9, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase",
                    padding: "4px 11px", borderRadius: 999,
                    background: isAiOn ? `${G}18` : "rgba(251,113,133,0.12)",
                    color: isAiOn ? G : "#fb7185",
                    border: `1px solid ${isAiOn ? `${G}30` : "rgba(251,113,133,0.28)"}`,
                  }}>
                    {isAiOn ? "Active" : "Inactive"}
                  </span>
                </div>
                <div style={{ marginBottom: 6 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: pax26?.textSecondary, opacity: 0.55 }}>Messages used</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: pax26?.textPrimary, fontVariantNumeric: "tabular-nums" }}>
                      {used.toLocaleString()} / {quota.toLocaleString()}
                    </span>
                  </div>
                  <div style={{ height: 7, borderRadius: 999, background: pax26?.secondaryBg ?? "rgba(148,163,184,0.12)", overflow: "hidden", border: `1px solid ${pax26?.border}` }}>
                    <div style={{
                      height: "100%", borderRadius: 999, width: `${pct}%`,
                      background: pct >= 90 ? "linear-gradient(90deg,#fb7185,#f97316)" : pct >= 60 ? `linear-gradient(90deg, ${Am}, #fbbf24)` : `linear-gradient(90deg, ${planCol === pax26?.textSecondary ? P : planCol}, ${P})`,
                      transition: "width 0.65s cubic-bezier(0.16, 1, 0.3, 1)",
                      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.25)",
                    }} />
                  </div>
                </div>
                <button type="button" className="db-btn"
                  onClick={() => router.push(isAiOn ? "/dashboard/billing" : "/dashboard/automations/ai-business-dashboard")}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    width: "100%", padding: "11px 0", marginTop: 18,
                    borderRadius: 12, fontSize: 13, fontWeight: 700,
                    background: `${planCol}12`,
                    color: planCol === pax26?.textSecondary ? pax26?.textPrimary : planCol,
                    border: `1px solid ${planCol === pax26?.textSecondary ? pax26?.border : `${planCol}28`}`,
                  }}
                >
                  <Crown size={13} /> {isAiOn ? "Manage plan" : "Activate AI"}
                </button>
              </div>
            </div>

            {/* Wallet card */}
            <div className="db-card db-surface db-s4" style={{ background: pax26?.card ?? pax26?.bg, border: `1px solid ${pax26?.border}` }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 22px", gap: 12 }}>
                <div>
                  <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.13em", textTransform: "uppercase", color: pax26?.textSecondary, opacity: 0.42, margin: "0 0 6px" }}>
                    Wallet
                  </p>
                  <p style={{ fontSize: 15, fontWeight: 800, color: pax26?.textPrimary, margin: 0, letterSpacing: "-0.02em" }}>Balance &amp; cashback</p>
                </div>
                <button type="button" className="db-btn"
                  onClick={() => setShowWallet(!showWallet)}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 7,
                    padding: "9px 15px", borderRadius: 11, fontSize: 12, fontWeight: 700,
                    background: showWallet ? `${P}14` : pax26?.secondaryBg,
                    color: showWallet ? P : pax26?.textSecondary,
                    border: `1px solid ${showWallet ? `${P}2a` : pax26?.border}`,
                  }}
                >
                  {showWallet ? <EyeOff size={14} /> : <Eye size={14} />}
                  {showWallet ? "Hide" : "View"}
                </button>
              </div>
              {showWallet && (
                <div className="db-exp" style={{ padding: "0 22px 22px", borderTop: `1px solid ${pax26?.border}`, paddingTop: 18 }}>
                  <WalletBalance showMore={showMore} setShowMore={setShowMore} />
                  <div style={{ borderRadius: 14, padding: 16, background: pax26?.secondaryBg, marginTop: 14, border: `1px solid ${pax26?.border}` }}>
                    <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: pax26?.textSecondary, opacity: 0.42, margin: "0 0 10px" }}>
                      Cashback
                    </p>
                    <CashBackBalance />
                  </div>
                </div>
              )}
            </div>

            {/* Quick services */}
            <div className="db-card db-surface db-s5" style={{ background: pax26?.card ?? pax26?.bg, border: `1px solid ${pax26?.border}`, padding: "20px 22px" }}>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: pax26?.textSecondary, opacity: 0.42, margin: "0 0 16px" }}>
                Quick services
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(5, minmax(0, 1fr))", gap: 9 }} className="db-svc-grid" id="VTU">
                {vtuServices.length > 0 ? (
                  vtuServices.map((svc) => {
                    const IconComponent = ICON_MAP[svc.iconName] || Zap;
                    // For standard VTU, usually routing to 'buy-key'
                    const linkUrl = svc.key === "transfer" ? "/dashboard/services/transfer" : `/dashboard/services/buy-${svc.key.replace("buy-", "")}`;

                    return (
                      <SvcCard
                        key={svc.key}
                        title={svc.name.replace(" Bundles", "").replace(" Pins", "").replace(" Cards", "")}
                        link={linkUrl}
                        icon={<IconComponent size={18} strokeWidth={2.2} />}
                        color={svc.color || P}
                        pax26={pax26}
                        router={router}
                      />
                    );
                  })
                ) : (
                  <>
                    <SvcCard title="Airtime" link="/dashboard/services/buy-airtime" icon={<Phone size={18} strokeWidth={2.2} />} color={G} pax26={pax26} router={router} />
                    <SvcCard title="Data" link="/dashboard/services/buy-data" icon={<Wifi size={18} strokeWidth={2.2} />} color={T} pax26={pax26} router={router} />
                    <SvcCard title="Electricity" link="/dashboard/services/buy-electricity" icon={<Zap size={18} strokeWidth={2.2} />} color={Am} pax26={pax26} router={router} />
                    <SvcCard title="TV" link="/dashboard/services/buy-tv-subscription" icon={<Tv size={18} strokeWidth={2.2} />} color={Vi} pax26={pax26} router={router} />
                    <SvcCard title="Transfer" link="/dashboard/services/transfer" icon={<ArrowRightLeft size={18} strokeWidth={2.2} />} color={Co} pax26={pax26} router={router} />
                  </>
                )}
              </div>
            </div>
          </aside>
        </div>

      </div>
    </>
  );
}