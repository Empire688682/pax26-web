"use client";

import React, { useEffect, useState } from "react";
import { useGlobalContext } from "../Context";

/* ─── Icons ──────────────────────────────────────────────────── */
const IconBot = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" y1="16" x2="8.01" y2="16"/><line x1="16" y1="16" x2="16.01" y2="16"/>
  </svg>
);
const IconSettings = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
  </svg>
);
const IconZap = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
);
const IconWorkflow = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="6" height="6" rx="1"/><rect x="15" y="15" width="6" height="6" rx="1"/><path d="M9 6h3a3 3 0 0 1 3 3v6"/><path d="M9 18h6"/>
  </svg>
);
const IconArrow = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
);
const IconCheck = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const IconCrown = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"/>
  </svg>
);
const IconSpark = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
  </svg>
);

/* ─── Inline CSS ────────────────────────────────────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Geist:wght@300;400;500;600;700&display=swap');

  .aah-root { font-family: 'Geist', sans-serif; }

  /* pulse dot */
  @keyframes aah-pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50%       { opacity: 0.5; transform: scale(0.7); }
  }
  .aah-dot { animation: aah-pulse 2s ease-in-out infinite; }

  /* shimmer on stat numbers */
  @keyframes aah-count {
    from { opacity: 0; transform: translateY(6px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .aah-stat-num { animation: aah-count 0.5s ease both; }

  /* card hover lift */
  .aah-card {
    transition: transform 0.22s ease, box-shadow 0.22s ease;
  }
  .aah-card:hover {
    transform: translateY(-3px);
  }

  /* action button */
  .aah-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 9px 18px;
    border-radius: 10px;
    font-size: 13px;
    font-weight: 600;
    font-family: 'Geist', sans-serif;
    cursor: pointer;
    border: none;
    transition: opacity 0.18s, transform 0.18s;
    letter-spacing: 0.01em;
    white-space: nowrap;
  }
  .aah-btn:hover:not(:disabled) { opacity: 0.85; transform: translateY(-1px); }
  .aah-btn:disabled { opacity: 0.4; cursor: not-allowed; }

  .aah-btn-ghost {
    width: 100%;
    justify-content: space-between;
    padding: 10px 14px;
    border-radius: 10px;
    font-size: 13px;
    font-weight: 500;
    font-family: 'Geist', sans-serif;
    cursor: pointer;
    transition: opacity 0.18s, background 0.18s;
    letter-spacing: 0.01em;
  }
  .aah-btn-ghost:hover { opacity: 0.8; }

  /* integration card icon bg */
  .aah-icon-wrap {
    width: 44px; height: 44px;
    border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }

  /* active automation pill */
  .aah-pill {
    display: flex; align-items: center; gap: 8px;
    padding: 10px 14px;
    border-radius: 10px;
    font-size: 13px;
    font-weight: 500;
    transition: background 0.18s;
  }

  /* plan badge */
  .aah-badge {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 3px 10px; border-radius: 20px;
    font-size: 11px; font-weight: 700; letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  /* divider line */
  .aah-divider { height: 1px; width: 100%; }

  /* italic serif accent */
  .aah-serif {
    font-family: 'Instrument Serif', serif;
    font-style: italic;
  }

  /* fade-slide stagger */
  @keyframes aah-slide {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
`;

/* ─── Stat mini-card ────────────────────────────────────────── */
function StatCard({ label, value, accent, delay, pax26 }) {
  return (
    <div
      className="aah-card"
      style={{
        background: pax26?.bg,
        border: `1px solid ${pax26?.border}`,
        borderRadius: "16px",
        padding: "18px 20px",
        animationDelay: delay,
        animation: "aah-slide 0.5s ease both",
        animationDelay: delay,
      }}
    >
      <p style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: pax26?.textSecondary, opacity: 0.55, marginBottom: "6px" }}>
        {label}
      </p>
      <p className="aah-stat-num" style={{ fontSize: "28px", fontWeight: 700, color: accent || pax26?.textPrimary, lineHeight: 1 }}>
        {value}
      </p>
    </div>
  );
}

/* ─── Integration card ──────────────────────────────────────── */
function IntCard({ icon, iconColor, iconBg, title, description, tag, tagColor, cta, onClick, lastUpdated, delay, pax26 }) {
  return (
    <div
      className="aah-card"
      style={{
        background: pax26?.bg,
        border: `1px solid ${pax26?.border}`,
        borderRadius: "20px",
        padding: "24px",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        animation: "aah-slide 0.5s ease both",
        animationDelay: delay,
      }}
    >
      {/* top row */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
        <div className="aah-icon-wrap" style={{ background: iconBg, color: iconColor }}>
          {icon}
        </div>
        {tag && (
          <span style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: tagColor, background: `${tagColor}18`, border: `1px solid ${tagColor}30`, borderRadius: "6px", padding: "3px 8px" }}>
            {tag}
          </span>
        )}
        {lastUpdated && (
          <span style={{ fontSize: "10px", color: pax26?.textSecondary, opacity: 0.5 }}>
            Updated {new Date(lastUpdated).toLocaleDateString()}
          </span>
        )}
      </div>

      {/* text */}
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: "15px", fontWeight: 700, color: pax26?.textPrimary, marginBottom: "6px", lineHeight: 1.3 }}>{title}</p>
        <p style={{ fontSize: "13px", color: pax26?.textSecondary, opacity: 0.7, lineHeight: 1.6 }}>{description}</p>
      </div>

      {/* divider */}
      <div className="aah-divider" style={{ background: pax26?.border }} />

      {/* cta */}
      <button
        className="aah-btn-ghost"
        onClick={onClick}
        style={{
          background: `${iconColor}10`,
          color: iconColor,
          border: `1px solid ${iconColor}22`,
        }}
      >
        <span>{cta}</span>
        <IconArrow />
      </button>
    </div>
  );
}

/* ─── Main Page ─────────────────────────────────────────────── */
export default function AiAutomationHomePage() {
  const { pax26, router, fetchUser, userData } = useGlobalContext();
  const [enabledAi, setEnabledAi] = useState(false);
  const [businessProfile, setBusinessProfile] = useState(null);

  useEffect(() => { fetchUser(); }, [userData]);
  useEffect(() => { setEnabledAi(userData?.paxAI?.enabled || false); }, [userData]);

  const fetchBusinessProfile = async () => {
    try {
      const res = await fetch("/api/automations/get-business-profile", { method: "GET", headers: { "Content-Type": "application/json" } });
      const data = await res.json();
      if (data.success) setBusinessProfile(data.profile);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchBusinessProfile(); }, []);

  const handleAlert = () => {
    alert("Please train PaxAI with your business information before enabling automations.");
    router.push("/dashboard/automations/training");
  };

  /* accent colors per card */
  const GOLD   = "#C9A84C";
  const TEAL   = "#38BDF8";
  const VIOLET = "#A78BFA";
  const CORAL  = "#FB923C";

  const isTrained = !!businessProfile?.lastUpdated;

  return (
    <>
      <style>{CSS}</style>
      <div className="aah-root" style={{ maxWidth: "1100px", margin: "0 auto", padding: "40px 20px 80px" }}>

        {/* ── Hero header ───────────────────────────────────── */}
        <div style={{ marginBottom: "48px" }}>

          {/* eyebrow */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
            <div style={{
              display: "flex", alignItems: "center", gap: "6px",
              padding: "4px 12px", borderRadius: "20px",
              background: `${pax26?.primary}15`, border: `1px solid ${pax26?.primary}30`,
            }}>
              <span className="aah-dot" style={{ width: "7px", height: "7px", borderRadius: "50%", background: enabledAi ? "#4CAF7D" : pax26?.primary, display: "block" }} />
              <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: pax26?.primary }}>
                {enabledAi ? "AI Active" : "AI Automation Hub"}
              </span>
            </div>
          </div>

          {/* title */}
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: "16px" }}>
            <div>
              <h1 style={{ fontSize: "clamp(28px, 5vw, 46px)", fontWeight: 800, color: pax26?.textPrimary, lineHeight: 1.1, margin: 0 }}>
                Your AI <span className="aah-serif" style={{ color: pax26?.primary }}>Command</span> Centre
              </h1>
              <p style={{ fontSize: "15px", color: pax26?.textSecondary, opacity: 0.65, marginTop: "10px" }}>
                Build, train, and deploy intelligent workflows that work around the clock
              </p>
            </div>

            {/* quick-action primary btn */}
            <button
              className="aah-btn"
              onClick={() => router.push("/market-place")}
              style={{ background: pax26?.primary, color: "#fff", boxShadow: `0 8px 28px ${pax26?.primary}40` }}
            >
              <IconSpark /> New Workflow
            </button>
          </div>
        </div>

        {/* ── Stat bar ──────────────────────────────────────── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "12px", marginBottom: "40px" }}>
          <StatCard label="Status"      value={enabledAi ? "Live" : "Idle"}   accent={enabledAi ? "#4CAF7D" : pax26?.textSecondary} delay="0s"    pax26={pax26} />
          <StatCard label="Training"    value={isTrained ? "Done" : "Pending"} accent={isTrained ? GOLD : pax26?.textSecondary}       delay="0.07s" pax26={pax26} />
          <StatCard label="Automations" value="3"                               accent={TEAL}                                          delay="0.14s" pax26={pax26} />
          <StatCard label="AI Plan"     value="Business"                        accent={VIOLET}                                        delay="0.21s" pax26={pax26} />
        </div>

        {/* ── Section label ──────────────────────────────────── */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
          <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: pax26?.textSecondary, opacity: 0.45, whiteSpace: "nowrap" }}>
            Integrations & Tools
          </p>
          <div className="aah-divider" style={{ background: pax26?.border }} />
        </div>

        {/* ── Cards grid ────────────────────────────────────── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))", gap: "16px", marginBottom: "40px" }}>

          <IntCard
            icon={<IconSettings />}
            iconColor={GOLD}
            iconBg={`${GOLD}18`}
            title="AI Business Training"
            description="Teach the AI your brand voice, services, tone, and FAQs for perfectly on-brand responses."
            tag={isTrained ? "Trained ✓" : "Setup needed"}
            tagColor={isTrained ? "#4CAF7D" : CORAL}
            cta="Open Training"
            lastUpdated={businessProfile?.lastUpdated}
            onClick={() => router.push("/dashboard/automations/training")}
            delay="0s"
            pax26={pax26}
          />

          <IntCard
            icon={<IconBot />}
            iconColor={TEAL}
            iconBg={`${TEAL}18`}
            title="AI Chatbot"
            description="Configure personality, fallback rules, and response behaviour for human-like conversations."
            tag={enabledAi ? "Active" : "Inactive"}
            tagColor={enabledAi ? "#4CAF7D" : pax26?.textSecondary}
            cta="Configure Bot"
            onClick={() => enabledAi ? router.push("/dashboard/automations/pax") : handleAlert()}
            delay="0.08s"
            pax26={pax26}
          />

          <IntCard
            icon={<IconZap />}
            iconColor={CORAL}
            iconBg={`${CORAL}18`}
            title="Lead Follow-up"
            description="Auto-follow up with new leads, send timed reminders, and re-engage cold prospects automatically."
            tag="Automation"
            tagColor={CORAL}
            cta="View Automations"
            onClick={() => router.push("/dashboard/automations/market-place")}
            delay="0.16s"
            pax26={pax26}
          />

          <IntCard
            icon={<IconWorkflow />}
            iconColor={VIOLET}
            iconBg={`${VIOLET}18`}
            title="AI Workflows"
            description="Browse and activate pre-built AI workflows tailored for sales, support, and customer retention."
            tag="Marketplace"
            tagColor={VIOLET}
            cta="Browse Workflows"
            onClick={() => router.push("/market-place")}
            delay="0.24s"
            pax26={pax26}
          />
        </div>

        {/* ── Active automations ─────────────────────────────── */}
        {enabledAi && (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
              <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: pax26?.textSecondary, opacity: 0.45, whiteSpace: "nowrap" }}>
                Running Now
              </p>
              <div className="aah-divider" style={{ background: pax26?.border }} />
            </div>

            <div style={{
              background: pax26?.bg,
              border: `1px solid ${pax26?.border}`,
              borderRadius: "20px",
              padding: "20px",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
              gap: "10px",
              marginBottom: "40px",
            }}>
              {[
                { label: "Auto WhatsApp Replies", color: "#4CAF7D" },
                { label: "AI Customer Support",   color: TEAL },
                { label: "Lead Capture",           color: CORAL },
              ].map(({ label, color }) => (
                <div key={label} className="aah-pill" style={{ background: `${color}0D`, border: `1px solid ${color}22` }}>
                  <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: color, display: "block", flexShrink: 0 }} className="aah-dot" />
                  <span style={{ fontSize: "13px", fontWeight: 500, color: pax26?.textPrimary }}>{label}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── Plan banner ─────────────────────────────────────── */}
        <div style={{
          background: pax26?.bg,
          border: `1px solid ${pax26?.border}`,
          borderRadius: "20px",
          padding: "20px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "16px",
          animation: "aah-slide 0.5s ease 0.3s both",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: `${GOLD}18`, display: "flex", alignItems: "center", justifyContent: "center", color: GOLD }}>
              <IconCrown />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "2px" }}>
                <p style={{ fontSize: "15px", fontWeight: 700, color: pax26?.textPrimary }}>Business Plan</p>
                <span className="aah-badge" style={{ background: `${GOLD}15`, color: GOLD, border: `1px solid ${GOLD}30` }}>
                  Active
                </span>
              </div>
              <p style={{ fontSize: "13px", color: pax26?.textSecondary, opacity: 0.6 }}>₦25,000 / month · Renews automatically</p>
            </div>
          </div>
          <button
            className="aah-btn"
            onClick={() => router.push("/dashboard/billing")}
            style={{
              background: `${GOLD}15`,
              color: GOLD,
              border: `1px solid ${GOLD}30`,
            }}
          >
            <IconCrown /> Upgrade Plan
          </button>
        </div>

      </div>
    </>
  );
}