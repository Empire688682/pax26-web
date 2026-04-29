"use client";

import React, { useEffect, useState } from "react";
import { useGlobalContext } from "../Context";

/* ─── Minimal CSS — only keyframes & font import ─────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Geist:wght@300;400;500;600;700&display=swap');

  .aah-root  { font-family: 'Geist', sans-serif; }
  .aah-serif { font-family: 'Instrument Serif', serif; font-style: italic; }

  @keyframes aah-pulse {
    0%,100% { opacity: 1; transform: scale(1); }
    50%      { opacity: 0.5; transform: scale(0.7); }
  }
  @keyframes aah-count {
    from { opacity: 0; transform: translateY(6px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes aah-slide {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .aah-dot      { animation: aah-pulse 2s ease-in-out infinite; }
  .aah-stat-num { animation: aah-count 0.5s ease both; }
  .aah-slide    { animation: aah-slide 0.5s ease both; }

  .aah-card { transition: transform 0.22s ease; }
  .aah-card:hover { transform: translateY(-3px); }

  .aah-ghost-btn { transition: opacity 0.18s ease; }
  .aah-ghost-btn:hover { opacity: 0.75; }

  .aah-btn { transition: opacity 0.18s ease, transform 0.18s ease; white-space: nowrap; }
  .aah-btn:hover:not(:disabled) { opacity: 0.85; transform: translateY(-1px); }
  .aah-btn:disabled { opacity: 0.4; cursor: not-allowed; }
`;

/* ─── Icons ───────────────────────────────────────────────────── */
const IconBot = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="10" rx="2" /><circle cx="12" cy="5" r="2" /><path d="M12 7v4" /><line x1="8" y1="16" x2="8.01" y2="16" /><line x1="16" y1="16" x2="16.01" y2="16" /></svg>;
const IconSettings = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>;
const IconZap = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>;
const IconWorkflow = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="6" height="6" rx="1" /><rect x="15" y="15" width="6" height="6" rx="1" /><path d="M9 6h3a3 3 0 0 1 3 3v6" /><path d="M9 18h6" /></svg>;
const IconArrow = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>;
const IconCrown = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14" /></svg>;
const IconSpark = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" /></svg>;

/* ─── Stat card ───────────────────────────────────────────────── */
function StatCard({ label, value, accent, delay, pax26 }) {
  return (
    <div className="aah-card aah-slide rounded-2xl p-5"
      style={{ background: pax26?.bg, border: `1px solid ${pax26?.border}`, animationDelay: delay }}>
      <p className="text-xs font-semibold uppercase tracking-widest mb-1.5"
        style={{ color: pax26?.textSecondary, opacity: 0.55 }}>
        {label}
      </p>
      <p className="aah-stat-num text-3xl font-bold leading-none"
        style={{ color: accent || pax26?.textPrimary }}>
        {value}
      </p>
    </div>
  );
}

/* ─── Integration card ────────────────────────────────────────── */
function IntCard({ icon, iconColor, iconBg, title, description, tag, tagColor, cta, onClick, lastUpdated, delay, pax26 }) {
  return (
    <div className="aah-card aah-slide flex flex-col gap-4 rounded-2xl p-6"
      style={{ background: pax26?.bg, border: `1px solid ${pax26?.border}`, animationDelay: delay }}>

      {/* top row */}
      <div className="flex items-start justify-between gap-3">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: iconBg, color: iconColor }}>
          {icon}
        </div>
        <div className="flex flex-col items-end gap-1">
          {tag && (
            <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded"
              style={{ color: tagColor, background: `${tagColor}18`, border: `1px solid ${tagColor}30` }}>
              {tag}
            </span>
          )}
          {lastUpdated && (
            <span className="text-[10px]" style={{ color: pax26?.textSecondary, opacity: 0.5 }}>
              Updated {new Date(lastUpdated).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>

      {/* body text */}
      <div className="flex-1">
        <p className="text-sm font-bold mb-1.5 leading-snug" style={{ color: pax26?.textPrimary }}>{title}</p>
        <p className="text-xs leading-relaxed" style={{ color: pax26?.textSecondary, opacity: 0.7 }}>{description}</p>
      </div>

      {/* divider */}
      <div className="h-px w-full" style={{ background: pax26?.border }} />

      {/* cta button */}
      <button
        className="aah-ghost-btn w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold"
        onClick={onClick}
        style={{ background: `${iconColor}10`, color: iconColor, border: `1px solid ${iconColor}22` }}>
        <span>{cta}</span>
        <IconArrow />
      </button>
    </div>
  );
}

/* ─── Section divider with label ──────────────────────────────── */
function SectionLabel({ text, pax26 }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <p className="text-xs font-bold tracking-widest uppercase whitespace-nowrap"
        style={{ color: pax26?.textSecondary, opacity: 0.45 }}>
        {text}
      </p>
      <div className="h-px flex-1" style={{ background: pax26?.border }} />
    </div>
  );
}

/* ─── Main Page ───────────────────────────────────────────────── */
export default function AiAutomationHomePage() {
  const { pax26, router, fetchUser, userData } = useGlobalContext();
  const [enabledAi, setEnabledAi] = useState(false);
  const [businessProfile, setBusinessProfile] = useState(null);
  const [apiRun, setApiRun] = useState(false);

  useEffect(() => { setEnabledAi(userData?.paxAI?.enabled || false); }, [userData]);

  const fetchBusinessProfile = async () => {
    try {
      const res = await fetch("/api/automations/get-business-profile", { method: "GET", headers: { "Content-Type": "application/json" } });
      const data = await res.json();
      if (data.success) setBusinessProfile(data.profile);
    } catch (err) {
      console.log("fetchBusinessProfileErr: ", err);
    } finally {
      setApiRun(true);
    }
  };

  useEffect(() => {
    if (apiRun) return;
    fetchUser();
    fetchBusinessProfile();
  }, [userData]);

  const handleAlert = () => {
    alert("Please train PaxAI with your business information before enabling automations.");
    router.push("/dashboard/automations/ai-business-dashboard");
  };

  const GOLD = "#C9A84C";
  const TEAL = "#38BDF8";
  const VIOLET = "#A78BFA";
  const CORAL = "#FB923C";
  const GREEN = "#4CAF7D";

  const isTrained = !!businessProfile?.lastUpdated;

  return (
    <>
      <style>{CSS}</style>
      <div className="aah-root max-w-7xl mx-auto px-5 py-10 pb-20">

        {/* ── Header ─────────────────────────────────────────── */}
        <div className="mb-12">
          {/* eyebrow */}
          <div className="mb-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full"
              style={{ background: `${pax26?.primary}15`, border: `1px solid ${pax26?.primary}30` }}>
              <span className="aah-dot w-2 h-2 rounded-full block"
                style={{ background: enabledAi ? GREEN : pax26?.primary }} />
              <span className="text-xs font-bold tracking-widest uppercase"
                style={{ color: pax26?.primary }}>
                {enabledAi ? "AI Active" : "AI Automation Hub"}
              </span>
            </div>
          </div>

          {/* title + CTA row */}
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="font-extrabold leading-tight"
                style={{ fontSize: "clamp(26px, 5vw, 44px)", color: pax26?.textPrimary }}>
                Your AI{" "}
                <span className="aah-serif" style={{ color: pax26?.primary }}>Command</span>{" "}
                Centre
              </h1>
              <p className="text-sm mt-2 opacity-65" style={{ color: pax26?.textSecondary }}>
                Build, train, and deploy intelligent workflows that work around the clock
              </p>
            </div>

            <button
              className="aah-btn inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white"
              onClick={() => router.push("/dashboard/automations/market-place")}
              style={{ background: pax26?.primary, boxShadow: `0 8px 28px ${pax26?.primary}40` }}>
              <IconSpark /> Automation Library
            </button>
            {
              !userData?.whatsapp.connected &&
              <button
                className="aah-btn inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white"
                onClick={() => router.push("/dashboard/automations/whatsapp#connect")}
                style={{ background: pax26?.primary, boxShadow: `0 8px 28px ${pax26?.primary}40` }}>
                Connect Your Whatsapp
              </button>
            }
          </div>
        </div>

        {/* ── Stats row ──────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
          <StatCard label="Status" value={enabledAi ? "Live" : "Idle"} accent={enabledAi ? GREEN : pax26?.textSecondary} delay="0s" pax26={pax26} />
          <StatCard label="Training" value={isTrained ? "Done" : "Pending"} accent={isTrained ? GOLD : pax26?.textSecondary} delay="0.07s" pax26={pax26} />
          <StatCard label="Automations" value="3" accent={TEAL} delay="0.14s" pax26={pax26} />
          <StatCard label="AI Plan" value="Business" accent={VIOLET} delay="0.21s" pax26={pax26} />
        </div>

        {/* ── Integration cards ──────────────────────────────── */}
        <SectionLabel text="Integrations & Tools" pax26={pax26} />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <IntCard
            icon={<IconSettings />} iconColor={GOLD} iconBg={`${GOLD}18`}
            title="Brand Communication Setup"
            description="Define how your business speaks—voice, tone, services, and FAQs—for consistent customer interactions."
            tag={isTrained ? "Trained ✓" : "Setup needed"} tagColor={isTrained ? GREEN : CORAL}
            cta="Open Training"
            lastUpdated={businessProfile?.lastUpdated}
            onClick={() => router.push("/dashboard/automations/ai-business-dashboard")}
            delay="0s" pax26={pax26}
          />
          {/* <IntCard
            icon={<IconBot />}      iconColor={TEAL}   iconBg={`${TEAL}18`}
            title="AI Chatbot"
            description="Configure personality, fallback rules, and response behaviour for human-like conversations."
            tag={enabledAi ? "Active" : "Inactive"} tagColor={enabledAi ? GREEN : pax26?.textSecondary}
            cta="Configure Bot"
            onClick={() => enabledAi ? router.push("/dashboard/automations/pax") : handleAlert()}
            delay="0.08s" pax26={pax26}
          /> */}
          <IntCard
            icon={<IconZap />} iconColor={CORAL} iconBg={`${CORAL}18`}
            title="Lead Follow-up"
            description="Auto-follow up with new leads, send timed reminders, and re-engage cold prospects automatically."
            tag="Automation" tagColor={CORAL}
            cta="View Automations"
            onClick={() => router.push("/dashboard/automations/market-place")}
            delay="0.16s" pax26={pax26}
          />
          <IntCard
            icon={<IconWorkflow />} iconColor={VIOLET} iconBg={`${VIOLET}18`}
            title="AI Workflows"
            description="Browse and activate pre-built AI workflows for sales, support, and customer retention."
            tag="Marketplace" tagColor={VIOLET}
            cta="Browse Workflows"
            onClick={() => router.push("/dashboard/automations/market-place")}
            delay="0.24s" pax26={pax26}
          />
        </div>

        {/* ── Active automations (when AI enabled) ───────────── */}
        {enabledAi && (
          <>
            <SectionLabel text="Running Now" pax26={pax26} />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-5 rounded-2xl mb-10"
              style={{ background: pax26?.bg, border: `1px solid ${pax26?.border}` }}>
              {[
                { label: "Auto WhatsApp Replies", color: GREEN },
                { label: "AI Customer Support", color: TEAL },
                { label: "Lead Capture", color: CORAL },
              ].map(({ label, color }) => (
                <div key={label}
                  className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl"
                  style={{ background: `${color}0D`, border: `1px solid ${color}22` }}>
                  <span className="aah-dot w-2 h-2 rounded-full flex-shrink-0 block"
                    style={{ background: color }} />
                  <span className="text-sm font-medium" style={{ color: pax26?.textPrimary }}>{label}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── Plan banner ─────────────────────────────────────── */}
        <div className="aah-slide flex flex-wrap items-center justify-between gap-4 rounded-2xl px-6 py-5"
          style={{ background: pax26?.bg, border: `1px solid ${pax26?.border}`, animationDelay: "0.3s" }}>

          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: `${GOLD}18`, color: GOLD }}>
              <IconCrown />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <p className="text-sm font-bold" style={{ color: pax26?.textPrimary }}>Business Plan</p>
                <span className="inline-flex items-center text-[10px] font-bold tracking-widest uppercase px-2.5 py-0.5 rounded-full"
                  style={{ background: `${GOLD}15`, color: GOLD, border: `1px solid ${GOLD}30` }}>
                  Active
                </span>
              </div>
              <p className="text-xs" style={{ color: pax26?.textSecondary, opacity: 0.6 }}>
                ₦25,000 / month · Renews automatically
              </p>
            </div>
          </div>

          <button
            className="aah-btn inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold"
            onClick={() => router.push("/dashboard/billing")}
            style={{ background: `${GOLD}15`, color: GOLD, border: `1px solid ${GOLD}30` }}>
            <IconCrown /> Upgrade Plan
          </button>
        </div>

      </div>
    </>
  );
}