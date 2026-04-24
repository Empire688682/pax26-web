"use client";

import React, { useEffect, useState } from "react";
import { Zap, MessageCircle, Bot, Edit, Wifi, WifiOff, RefreshCw } from "lucide-react";
import { useGlobalContext } from "../Context";

/* ── Keyframes only — Tailwind handles everything else ───────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Syne:wght@600;700;800&display=swap');

  .am-root { font-family: 'Syne', sans-serif; }
  .am-mono { font-family: 'DM Mono', monospace; }

  @keyframes am-slide {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes am-pulse-ring {
    0%   { box-shadow: 0 0 0 0 currentColor; opacity: 0.6; }
    70%  { box-shadow: 0 0 0 8px currentColor; opacity: 0; }
    100% { box-shadow: 0 0 0 0 currentColor; opacity: 0; }
  }
  @keyframes am-shimmer {
    0%   { background-position: -400px 0; }
    100% { background-position: 400px 0; }
  }
  @keyframes am-spin { to { transform: rotate(360deg); } }
  @keyframes am-blink {
    0%,100% { opacity: 1; }
    50%     { opacity: 0.3; }
  }

  .am-slide  { animation: am-slide 0.45s ease both; }
  .am-spin   { animation: am-spin 0.8s linear infinite; }
  .am-blink  { animation: am-blink 1.4s ease-in-out infinite; }

  .am-pulse-green { animation: am-pulse-ring 1.8s ease-out infinite; color: #22c55e; }
  .am-pulse-gray  { animation: am-pulse-ring 2.2s ease-out infinite; color: #6b7280; }

  .am-shimmer {
    background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.06) 50%, transparent 100%);
    background-size: 400px 100%;
    animation: am-shimmer 1.4s ease-in-out infinite;
  }

  .am-card { transition: transform 0.2s ease, box-shadow 0.2s ease; }
  .am-card:hover { transform: translateY(-2px); }

  .am-toggle { transition: background 0.25s ease; }

  .am-btn { transition: opacity 0.16s ease, transform 0.16s ease; }
  .am-btn:hover { opacity: 0.82; transform: translateY(-1px); }
  .am-btn:active { transform: translateY(0); }

  .am-row-btn { transition: opacity 0.15s ease, background 0.15s ease; }
  .am-row-btn:hover { opacity: 0.75; }
`;

/* ── Icons ────────────────────────────────────────────────────── */
const IcoArrow = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>;
const IcoBrain = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-1.96-3 2.5 2.5 0 0 1-1.32-4.24 3 3 0 0 1 .34-5.58 2.5 2.5 0 0 1 1.32-4.24A2.5 2.5 0 0 1 9.5 2" /><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 1.96-3 2.5 2.5 0 0 0 1.32-4.24 3 3 0 0 0-.34-5.58 2.5 2.5 0 0 0-1.32-4.24A2.5 2.5 0 0 0 14.5 2" /></svg>;
const IcoCheck = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>;

const TYPE_CONFIG = {
  whatsapp_auto_reply: { icon: <MessageCircle size={20} />, color: "#22c55e", label: "WhatsApp" },
  follow_up: { icon: <Zap size={20} />, color: "#f97316", label: "Follow-up" },
  business_ai_chatbox: { icon: <Bot size={20} />, color: "#38bdf8", label: "AI Bot" },
};

/* ── Toggle switch component ──────────────────────────────────── */
function Toggle({ enabled, loading, onClick }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="relative flex-shrink-0 focus:outline-none"
      aria-label="toggle automation"
    >
      {loading ? (
        <div className="w-12 h-6 rounded-full flex items-center justify-center"
          style={{ background: "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.3)" }}>
          <div className="w-4 h-4 rounded-full border-2 border-blue-400 border-t-transparent am-spin" />
        </div>
      ) : (
        <div className="relative">
          {/* pulse ring behind the dot */}
          {enabled && (
            <span className="absolute inset-0 rounded-full pointer-events-none"
              style={{ animation: "am-pulse-ring 1.8s ease-out infinite", color: "#22c55e" }} />
          )}
          <div
            className="am-toggle w-12 h-6 rounded-full flex items-center px-1 cursor-pointer"
            style={{
              background: enabled ? "#22c55e" : "rgba(107,114,128,0.25)",
              border: enabled ? "1px solid #16a34a" : "1px solid rgba(107,114,128,0.3)",
            }}
          >
            <div
              className="w-4 h-4 rounded-full bg-white shadow-sm"
              style={{
                transform: enabled ? "translateX(24px)" : "translateX(0)",
                transition: "transform 0.25s ease",
              }}
            />
          </div>
        </div>
      )}
    </button>
  );
}

/* ── Skeleton card ────────────────────────────────────────────── */
function SkeletonCard({ pax26 }) {
  return (
    <div className="rounded-2xl p-6 space-y-4 overflow-hidden relative"
      style={{ background: pax26?.bg, border: `1px solid ${pax26?.border}` }}>
      <div className="am-shimmer absolute inset-0 pointer-events-none" />
      <div className="flex items-center justify-between">
        <div className="w-11 h-11 rounded-xl" style={{ background: pax26?.secondaryBg }} />
        <div className="w-12 h-6 rounded-full" style={{ background: pax26?.secondaryBg }} />
      </div>
      <div className="h-4 rounded-lg w-2/3" style={{ background: pax26?.secondaryBg }} />
      <div className="space-y-2">
        <div className="h-3 rounded w-full" style={{ background: pax26?.secondaryBg }} />
        <div className="h-3 rounded w-4/5" style={{ background: pax26?.secondaryBg }} />
      </div>
      <div className="h-3 rounded w-3/4" style={{ background: pax26?.secondaryBg }} />
      <div className="flex gap-2 pt-1">
        <div className="h-9 flex-1 rounded-xl" style={{ background: pax26?.secondaryBg }} />
        <div className="h-9 flex-1 rounded-xl" style={{ background: pax26?.secondaryBg }} />
      </div>
    </div>
  );
}

/* ── Automation card ──────────────────────────────────────────── */
function AutoCard({ auto, toggling, onToggle, onView, onTrain, isPaxAiBusinessTrained, pax26 }) {
  const cfg = TYPE_CONFIG[auto.type] || { icon: <Bot size={20} />, color: pax26?.primary, label: "Automation" };
  const GREEN = "#22c55e";

  return (
    <div className="am-card am-slide rounded-2xl overflow-hidden flex flex-col"
      style={{ background: pax26?.bg, border: `1px solid ${pax26?.border}` }}>

      {/* colored top strip */}
      <div className="h-1 w-full" style={{ background: auto.enabled ? cfg.color : pax26?.border }} />

      <div className="p-5 flex flex-col gap-4 flex-1">
        {/* header row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: `${cfg.color}15`, color: cfg.color }}>
              {cfg.icon}
            </div>
            <div>
              <span className="am-mono text-[10px] font-medium px-2 py-0.5 rounded uppercase tracking-wider"
                style={{ background: `${cfg.color}12`, color: cfg.color }}>
                {cfg.label}
              </span>
            </div>
          </div>
          <Toggle enabled={auto.enabled} loading={toggling} onClick={() => onToggle(auto)} />
        </div>

        {/* title + desc */}
        <div className="flex-1">
          <h3 className="text-sm font-bold mb-1.5 leading-snug" style={{ color: pax26?.textPrimary }}>
            {auto.name}
          </h3>
          {auto.description && (
            <p className="text-xs leading-relaxed" style={{ color: pax26?.textSecondary, opacity: 0.65 }}>
              {auto.description}
            </p>
          )}
        </div>

        {/* trigger / action rows */}
        <div className="rounded-xl p-3 space-y-2" style={{ background: pax26?.secondaryBg }}>
          <div className="flex items-center gap-2">
            <MessageCircle size={11} style={{ color: pax26?.textSecondary, opacity: 0.5, flexShrink: 0 }} />
            <span className="am-mono text-[11px]" style={{ color: pax26?.textSecondary, opacity: 0.6 }}>
              <span className="font-medium" style={{ opacity: 0.9 }}>Trigger</span>
              {" · "}{auto.trigger}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Bot size={11} style={{ color: pax26?.textSecondary, opacity: 0.5, flexShrink: 0 }} />
            <span className="am-mono text-[11px]" style={{ color: pax26?.textSecondary, opacity: 0.6 }}>
              <span className="font-medium" style={{ opacity: 0.9 }}>Action</span>
              {" · "}{auto.action}
            </span>
          </div>
        </div>

        {/* requirements badge */}
        {auto.meta?.requiresTraining && (
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold uppercase tracking-wider"
              style={{ background: "rgba(234,179,8,0.1)", color: "#ca8a04", border: "1px solid rgba(234,179,8,0.2)" }}>
              <IcoBrain /> Needs AI training
              {auto.type !== "business_ai_chatbox" && " + WhatsApp"}
            </div>
            {isPaxAiBusinessTrained ? (
              <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg"
                style={{ background: "rgba(34,197,94,0.1)", color: GREEN, border: "1px solid rgba(34,197,94,0.2)" }}>
                <IcoCheck /> Trained
              </span>
            ) : (
              <button
                className="am-row-btn text-[10px] font-bold px-2.5 py-1 rounded-lg am-blink"
                onClick={onTrain}
                style={{ background: `${pax26?.primary}18`, color: pax26?.primary, border: `1px solid ${pax26?.primary}30` }}>
                Train AI →
              </button>
            )}
          </div>
        )}

        {/* divider */}
        <div className="h-px w-full" style={{ background: pax26?.border }} />

        {/* action buttons */}
        <div className="flex gap-2">
          <button
            className="am-btn am-row-btn flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold"
            onClick={onView}
            style={{ background: pax26?.secondaryBg, color: pax26?.textPrimary, border: `1px solid ${pax26?.border}` }}>
            View details <IcoArrow />
          </button>
          <button
            className="am-btn am-row-btn flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold"
            onClick={onTrain}
            style={{ background: `${cfg.color}10`, color: cfg.color, border: `1px solid ${cfg.color}22` }}>
            Improve AI <IcoBrain />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Main page ────────────────────────────────────────────────── */
export default function AutomationMarket() {
  const {
    pax26, router, userData,
    isPaxAiBusinessTrained, setAIsPaxAiBusinessTrained,
    isWhatsappNumberConnected, fetchUser,
  } = useGlobalContext();

  const [automations, setAutomations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toggling, setToggling] = useState(false);

  const firstName = userData?.name?.split(" ")[0] || "User";
  const GREEN = "#22c55e";
  const primary = pax26?.primary;

  useEffect(() => { fetchAutomations(); }, []);

  const fetchAutomations = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/automations/all");
      const data = await res.json();
      if (data.success) {
        setAutomations(
          data.automations
            .filter(a => a.active)
            .map(a => ({
              ...a,
              id: a.automationId,
              enabled: a.enabled ?? a.defaultEnabled,
              meta: a.meta || {},
            }))
        );
        await fetchUser();
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/automations/get-business-profile", { method: "GET", headers: { "Content-Type": "application/json" } });
        const data = await res.json();
        if (data.success) setAIsPaxAiBusinessTrained(data.profile?.aiTrained || false);
      } catch { }
    })();
  }, []);

  const toggleAutomationAPI = async (auto) => {
    if (!isPaxAiBusinessTrained) {
      alert("Please train PaxAI with your business information before enabling automations.");
      router.push("/dashboard/automations/ai-business-dashboard");
      return;
    }
    if (!isWhatsappNumberConnected && auto.type !== "business_ai_chatbox") {
      alert(`${firstName}, please connect your WhatsApp Business to activate ${auto.name}.`);
      router.push("/dashboard/automations/whatsapp");
      return;
    }
    try {
      setToggling(true);
      const res = await fetch(`/api/automations/${auto.id}/toggle`, { method: "PATCH" });
      const data = await res.json();
      if (data.success) await fetchAutomations();
      else alert(`Error: ${data.message}`);
    } catch (err) { console.error(err); }
    finally { setToggling(false); }
  };

  const enabledCount = automations.filter(a => a.enabled).length;

  return (
    <>
      <style>{CSS}</style>
      <div className="am-root max-w-7xl mx-auto py-10 pb-20 space-y-10">

        {/* ── Header ───────────────────────────────────────── */}
        <div className="am-slide space-y-5">
          {/* top row */}
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              {/* eyebrow */}
              <div className="flex items-center gap-2 mb-3">
                <span className="am-mono text-[10px] font-medium tracking-widest uppercase"
                  style={{ color: pax26?.textSecondary, opacity: 0.45 }}>
                  Automation Dashboard
                </span>
                <div className="h-px flex-1 w-12" style={{ background: pax26?.border }} />
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold leading-tight mb-1"
                style={{ color: pax26?.textPrimary }}>
                Hey, {firstName} 👋
              </h1>
              <p className="text-sm" style={{ color: pax26?.textSecondary, opacity: 0.6 }}>
                Manage your smart Agent workflows — toggle, configure, and improve from here.
              </p>
            </div>

            {/* live status chip + count */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl"
                style={{ background: pax26?.bg, border: `1px solid ${pax26?.border}` }}>
                <span className="am-blink w-2 h-2 rounded-full block" style={{ background: enabledCount > 0 ? GREEN : pax26?.border }} />
                <span className="am-mono text-xs font-medium" style={{ color: pax26?.textSecondary }}>
                  {enabledCount} running
                </span>
              </div>
              <button
                className="am-btn flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold"
                onClick={fetchAutomations}
                style={{ background: pax26?.secondaryBg, color: pax26?.textSecondary, border: `1px solid ${pax26?.border}` }}>
                <RefreshCw size={13} /> Refresh
              </button>
            </div>
          </div>

          {/* WhatsApp connection banner */}
          {!isWhatsappNumberConnected ? (
            <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-4 rounded-2xl"
              style={{ background: `${primary}0C`, border: `1px dashed ${primary}40` }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: `${primary}15`, color: primary }}>
                  <WifiOff size={16} />
                </div>
                <div>
                  <p className="text-sm font-bold" style={{ color: pax26?.textPrimary }}>WhatsApp not connected</p>
                  <p className="text-xs" style={{ color: pax26?.textSecondary, opacity: 0.6 }}>Connect your Business WhatsApp to activate automations</p>
                </div>
              </div>
              <button
                className="am-btn flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white"
                onClick={() => router.push("/dashboard/automations/whatsapp")}
                style={{ background: primary, boxShadow: `0 8px 24px ${primary}35` }}>
                Connect WhatsApp <IcoArrow />
              </button>
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-4 rounded-2xl"
              style={{ background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.2)" }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: "rgba(34,197,94,0.12)", color: GREEN }}>
                  <Wifi size={16} />
                </div>
                <div>
                  <p className="text-sm font-bold" style={{ color: pax26?.textPrimary }}>WhatsApp connected</p>
                  <p className="am-mono text-xs font-medium" style={{ color: GREEN }}>
                    {userData?.whatsappBusinessNo}
                  </p>
                </div>
              </div>
              <button
                className="am-btn am-row-btn flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold"
                onClick={() => router.push("/dashboard/automations/whatsapp")}
                style={{ background: "rgba(34,197,94,0.1)", color: GREEN, border: "1px solid rgba(34,197,94,0.25)" }}>
                <Edit size={12} /> Change number
              </button>
            </div>
          )}

          {/* Agent Training Status bar */}
          <div className="flex items-center justify-between gap-3 px-5 py-3.5 rounded-xl"
            style={{ background: pax26?.bg, border: `1px solid ${pax26?.border}` }}>
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: isPaxAiBusinessTrained ? "rgba(34,197,94,0.12)" : "rgba(234,179,8,0.1)", color: isPaxAiBusinessTrained ? GREEN : "#ca8a04" }}>
                <IcoBrain />
              </div>
              <div>
                <p className="text-xs font-semibold" style={{ color: pax26?.textPrimary }}>
                  Agent Training Status
                </p>
                <p className="am-mono text-[10px]" style={{ color: isPaxAiBusinessTrained ? GREEN : "#ca8a04" }}>
                  {isPaxAiBusinessTrained ? "✓ Business Agent is trained and ready" : "⚠ Not trained — automations won't respond correctly"}
                </p>
              </div>
            </div>
            <button
              className="am-btn flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold flex-shrink-0"
              onClick={() => router.push("/dashboard/automations/ai-business-dashboard")}
              style={{
                background: isPaxAiBusinessTrained ? pax26?.secondaryBg : `${primary}15`,
                color: isPaxAiBusinessTrained ? pax26?.textSecondary : primary,
                border: `1px solid ${isPaxAiBusinessTrained ? pax26?.border : primary + "35"}`,
              }}>
              {isPaxAiBusinessTrained ? "Retrain" : "Train now"} <IcoArrow />
            </button>
          </div>
        </div>

        {
          isWhatsappNumberConnected && automations.length > 0 && (
            <div className="flex items-center flex-wrap lg:flex-nowrap justify-between gap-2 px-3.5 py-2 rounded-xl"
              style={{ background: pax26?.bg }}>
              <p className="text-xs md:text-sm" style={{ color: pax26?.textSecondary }}>Control who your Agent responds to — whitelist customers, block personal contacts.</p>
              <button
                className="am-btn flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white"
                onClick={() => router.push("/dashboard/automations/whatsapp-contacts")}
                style={{ background: primary, boxShadow: `0 8px 24px ${primary}35` }}>
                Contacts Manager <IcoArrow />
              </button>
            </div>
          )
        }

        {/* ── Section label ─────────────────────────────────── */}
        <div className="flex items-center gap-3">
          <p className="am-mono text-[10px] font-medium tracking-widest uppercase whitespace-nowrap"
            style={{ color: pax26?.textSecondary, opacity: 0.4 }}>
            {loading ? "Loading automations…" : `${automations.length} automation${automations.length !== 1 ? "s" : ""} available`}
          </p>
          <div className="h-px flex-1" style={{ background: pax26?.border }} />
        </div>

        {/* ── Cards grid ────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} pax26={pax26} />)
            : automations.length === 0
              ? (
                <div className="col-span-full flex flex-col items-center justify-center py-20 gap-4"
                  style={{ color: pax26?.textSecondary }}>
                  <Bot size={40} style={{ opacity: 0.2 }} />
                  <p className="text-sm opacity-40">No automations available yet</p>
                </div>
              )
              : automations.map((auto, i) => (
                <div key={auto.automationId} style={{ animationDelay: `${i * 0.07}s` }}>
                  <AutoCard
                    auto={auto}
                    toggling={toggling}
                    onToggle={toggleAutomationAPI}
                    onView={() => router.push(`/dashboard/automations/${auto.automationId}`)}
                    onTrain={() => router.push("/dashboard/automations/ai-business-dashboard")}
                    isPaxAiBusinessTrained={isPaxAiBusinessTrained}
                    pax26={pax26}
                  />
                </div>
              ))
          }
        </div>

      </div>
    </>
  );
}