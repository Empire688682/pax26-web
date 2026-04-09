"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Bot, Zap, MessageCircle, Activity, Clock, CheckCircle2, XCircle, TrendingUp, Layers, ArrowLeft } from "lucide-react";
import { useGlobalContext } from "@/components/Context";
import LoadingSpinner from "@/components/LoadingSpinner/LoadingSpinner";

/* ── Keyframes + font only ───────────────────────────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Syne:wght@600;700;800&display=swap');

  .av-root { font-family: 'Syne', sans-serif; }
  .av-mono { font-family: 'DM Mono', monospace; }

  @keyframes av-slide {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes av-bar {
    from { width: 0%; }
    to   { width: var(--bar-w); }
  }
  @keyframes av-blink {
    0%,100% { opacity: 1; }
    50%     { opacity: 0.3; }
  }
  @keyframes av-spin { to { transform: rotate(360deg); } }
  @keyframes av-pulse-ring {
    0%  { box-shadow: 0 0 0 0 rgba(34,197,94,0.45); }
    70% { box-shadow: 0 0 0 8px rgba(34,197,94,0); }
    100%{ box-shadow: 0 0 0 0 rgba(34,197,94,0); }
  }

  .av-s1 { animation: av-slide 0.4s ease both; }
  .av-s2 { animation: av-slide 0.4s ease 0.07s both; }
  .av-s3 { animation: av-slide 0.4s ease 0.14s both; }
  .av-s4 { animation: av-slide 0.4s ease 0.21s both; }

  .av-bar { animation: av-bar 1s cubic-bezier(0.22,1,0.36,1) 0.4s both; }
  .av-blink { animation: av-blink 1.6s ease-in-out infinite; }
  .av-spin  { animation: av-spin 0.8s linear infinite; }
  .av-pulse { animation: av-pulse-ring 2s ease-out infinite; }

  .av-card { transition: box-shadow 0.2s ease; }

  .av-exec-row { transition: background 0.15s ease; }
  .av-exec-row:hover { background: var(--av-hover) !important; }

  .av-btn { transition: opacity 0.15s ease, transform 0.15s ease; }
  .av-btn:hover { opacity: 0.8; transform: translateY(-1px); }
`;

/* ── Stat card ────────────────────────────────────────────────── */
function StatCard({ label, value, sub, icon, accent, pax26, delay }) {
  return (
    <div className={`av-card rounded-2xl p-5 ${delay}`}
      style={{ background: pax26?.bg, border: `1px solid ${pax26?.border}` }}>
      <div className="flex items-start justify-between mb-3">
        <p className="av-mono text-[10px] font-medium uppercase tracking-widest"
          style={{ color: pax26?.textSecondary, opacity: 0.45 }}>
          {label}
        </p>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: `${accent}15`, color: accent }}>
          {icon}
        </div>
      </div>
      <p className="text-2xl font-extrabold leading-none mb-1" style={{ color: accent }}>
        {value}
      </p>
      {sub && <p className="av-mono text-[11px]" style={{ color: pax26?.textSecondary, opacity: 0.5 }}>{sub}</p>}
    </div>
  );
}

/* ── Progress bar ─────────────────────────────────────────────── */
function ProgressBar({ value, color, pax26 }) {
  return (
    <div className="h-2 w-full rounded-full overflow-hidden" style={{ background: pax26?.secondaryBg }}>
      <div
        className="h-full rounded-full av-bar"
        style={{ "--bar-w": `${Math.min(value, 100)}%`, width: `${Math.min(value, 100)}%`, background: color }}
      />
    </div>
  );
}

/* ── Execution row ────────────────────────────────────────────── */
function ExecRow({ exec, pax26 }) {
  const ok      = exec.status?.toLowerCase() === "success";
  const GREEN   = "#22c55e";
  const RED     = "#ef4444";

  return (
    <div className="av-exec-row flex items-center gap-3 px-4 py-3 rounded-xl"
      style={{ "--av-hover": pax26?.secondaryBg }}>
      <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ background: ok ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.1)", color: ok ? GREEN : RED }}>
        {ok ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="av-mono text-xs font-medium truncate" style={{ color: ok ? GREEN : RED }}>
          {exec.status}
        </p>
        <p className="av-mono text-[10px]" style={{ color: pax26?.textSecondary, opacity: 0.5 }}>
          {new Date(exec.executedAt).toLocaleString()}
        </p>
      </div>
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg flex-shrink-0"
        style={{ background: pax26?.secondaryBg }}>
        <Clock size={10} style={{ color: pax26?.textSecondary, opacity: 0.5 }} />
        <span className="av-mono text-[10px] font-medium" style={{ color: pax26?.textSecondary }}>
          {exec.responseTime}ms
        </span>
      </div>
    </div>
  );
}

/* ── Loading state ────────────────────────────────────────────── */
function PageLoading({ pax26 }) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
      <div className="w-10 h-10 rounded-full border-2 border-t-transparent av-spin"
        style={{ borderColor: `${pax26?.primary}40`, borderTopColor: pax26?.primary }} />
      <p className="av-mono text-xs" style={{ color: pax26?.textSecondary, opacity: 0.4 }}>
        Loading automation…
      </p>
    </div>
  );
}

/* ── Main page ────────────────────────────────────────────────── */
export default function AutomationViewPage() {
  const { pax26, router }      = useGlobalContext();
  const { id }                 = useParams();
  const [automation, setAuto]  = useState(null);
  const [analytics, setStats]  = useState(null);
  const [loading, setLoading]  = useState(true);

  const GREEN  = "#22c55e";
  const AMBER  = "#f59e0b";
  const TEAL   = "#38bdf8";
  const VIOLET = "#a78bfa";
  const primary = pax26?.primary;

  useEffect(() => {
    (async () => {
      try {
        const res  = await fetch(`/api/automations/single?id=${id}`, { credentials: "include" });
        const data = await res.json();
        if (data.success) { setAuto(data.automation); setStats(data.analytics); }
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    })();
  }, [id]);

  if (loading) return <PageLoading pax26={pax26} />;

  if (!automation) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
          style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444" }}>
          <XCircle size={24} />
        </div>
        <p className="text-sm font-semibold" style={{ color: "#ef4444" }}>Automation not found</p>
        <button className="av-btn av-mono text-xs px-4 py-2 rounded-xl mt-1"
          onClick={() => router?.back()}
          style={{ background: pax26?.secondaryBg, color: pax26?.textSecondary, border: `1px solid ${pax26?.border}` }}>
          ← Go back
        </button>
      </div>
    </div>
  );

  const successRate  = analytics?.successRate ?? 0;
  const isEnabled    = automation.enabled;

  return (
    <>
      <style>{CSS}</style>
      <div className="av-root max-w-3xl mx-auto px-5 py-10 pb-20 space-y-5">

        {/* ── Back + breadcrumb ─────────────────────────────── */}
        <div className="av-s1 flex items-center gap-2 mb-2">
          <button className="av-btn flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl"
            onClick={() => router?.back()}
            style={{ background: pax26?.secondaryBg, color: pax26?.textSecondary, border: `1px solid ${pax26?.border}` }}>
            <ArrowLeft size={12} /> Back
          </button>
          <span className="av-mono text-[10px]" style={{ color: pax26?.textSecondary, opacity: 0.35 }}>
            / automations / {automation.name}
          </span>
        </div>

        {/* ── Hero card ─────────────────────────────────────── */}
        <div className="av-card av-s1 rounded-2xl overflow-hidden"
          style={{ background: pax26?.bg, border: `1px solid ${pax26?.border}` }}>
          {/* top colour strip */}
          <div className="h-1 w-full" style={{ background: isEnabled ? GREEN : pax26?.border }} />

          <div className="p-6">
            {/* title row */}
            <div className="flex items-start justify-between gap-4 flex-wrap mb-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${primary}15`, color: primary }}>
                  <Bot size={22} />
                </div>
                <div>
                  <h1 className="text-xl font-extrabold leading-tight" style={{ color: pax26?.textPrimary }}>
                    {automation.name}
                  </h1>
                  <p className="av-mono text-[10px] mt-0.5 uppercase tracking-widest"
                    style={{ color: pax26?.textSecondary, opacity: 0.45 }}>
                    ID: {id}
                  </p>
                </div>
              </div>

              {/* status badge */}
              <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl"
                style={{
                  background: isEnabled ? "rgba(34,197,94,0.08)" : `${pax26?.secondaryBg}`,
                  border: `1px solid ${isEnabled ? "rgba(34,197,94,0.25)" : pax26?.border}`,
                }}>
                <span className={`w-2 h-2 rounded-full block ${isEnabled ? "av-blink" : ""}`}
                  style={{ background: isEnabled ? GREEN : pax26?.border }} />
                <span className="av-mono text-xs font-medium"
                  style={{ color: isEnabled ? GREEN : pax26?.textSecondary }}>
                  {isEnabled ? "Enabled" : "Disabled"}
                </span>
              </div>
            </div>

            {/* trigger / action inset */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { label: "Trigger", value: automation.trigger, icon: <MessageCircle size={13} />, color: TEAL },
                { label: "Action",  value: automation.action,  icon: <Zap size={13} />,            color: AMBER },
              ].map(({ label, value, icon, color }) => (
                <div key={label} className="rounded-xl p-3.5"
                  style={{ background: pax26?.secondaryBg }}>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span style={{ color, opacity: 0.8 }}>{icon}</span>
                    <span className="av-mono text-[10px] uppercase tracking-widest font-medium"
                      style={{ color: pax26?.textSecondary, opacity: 0.45 }}>
                      {label}
                    </span>
                  </div>
                  <p className="text-sm font-semibold leading-snug" style={{ color: pax26?.textPrimary }}>
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Analytis ─────────────────────────────────────── */}
        {analytics && (
          <>
            {/* stat cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 av-s2">
              <StatCard label="Total Runs"    value={analytics.totalRuns}         icon={<Activity size={14} />}    accent={VIOLET} pax26={pax26} delay="av-s2" />
              <StatCard label="Successful"    value={analytics.successRuns}       icon={<CheckCircle2 size={14} />} accent={GREEN}  pax26={pax26} delay="av-s2" />
              <StatCard label="Success Rate"  value={`${analytics.successRate}%`} icon={<TrendingUp size={14} />}   accent={TEAL}   pax26={pax26} delay="av-s3" sub={`${analytics.totalRuns - analytics.successRuns} failed`} />
              <StatCard label="Avg Response"  value={`${analytics.avgResponseTime}`} sub="milliseconds" icon={<Clock size={14} />} accent={AMBER} pax26={pax26} delay="av-s3" />
            </div>

            {/* success rate bar */}
            <div className="av-card av-s3 rounded-2xl p-5 space-y-3"
              style={{ background: pax26?.bg, border: `1px solid ${pax26?.border}` }}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <TrendingUp size={14} style={{ color: TEAL }} />
                  <span className="text-sm font-bold" style={{ color: pax26?.textPrimary }}>Success Rate</span>
                </div>
                <span className="av-mono text-sm font-bold" style={{ color: successRate >= 80 ? GREEN : successRate >= 50 ? AMBER : "#ef4444" }}>
                  {successRate}%
                </span>
              </div>
              <ProgressBar value={successRate} color={successRate >= 80 ? GREEN : successRate >= 50 ? AMBER : "#ef4444"} pax26={pax26} />
              <p className="av-mono text-[10px]" style={{ color: pax26?.textSecondary, opacity: 0.4 }}>
                {analytics.successRuns} of {analytics.totalRuns} executions succeeded
              </p>
            </div>

            {/* recent executions */}
            <div className="av-card av-s4 rounded-2xl overflow-hidden"
              style={{ background: pax26?.bg, border: `1px solid ${pax26?.border}` }}>
              <div className="flex items-center justify-between px-5 py-4"
                style={{ borderBottom: `1px solid ${pax26?.border}` }}>
                <div className="flex items-center gap-2">
                  <Activity size={15} style={{ color: pax26?.textSecondary, opacity: 0.5 }} />
                  <span className="text-sm font-bold" style={{ color: pax26?.textPrimary }}>Recent Executions</span>
                </div>
                <span className="av-mono text-[10px] px-2 py-1 rounded-lg"
                  style={{ background: pax26?.secondaryBg, color: pax26?.textSecondary, opacity: 0.6 }}>
                  {analytics.recentExecutions.length} entries
                </span>
              </div>

              <div className="p-3 space-y-1">
                {analytics.recentExecutions.length > 0
                  ? analytics.recentExecutions.map((exec) => (
                    <ExecRow key={exec._id} exec={exec} pax26={pax26} />
                  ))
                  : (
                    <div className="flex flex-col items-center justify-center py-10 gap-2">
                      <Activity size={28} style={{ color: pax26?.textSecondary, opacity: 0.15 }} />
                      <p className="av-mono text-xs" style={{ color: pax26?.textSecondary, opacity: 0.35 }}>
                        No executions recorded yet
                      </p>
                    </div>
                  )
                }
              </div>
            </div>
          </>
        )}

        {/* ── Roadmap card ──────────────────────────────────── */}
        <div className="av-card av-s4 rounded-2xl p-5"
          style={{ background: pax26?.bg, border: `1px dashed ${pax26?.border}` }}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: `${VIOLET}15`, color: VIOLET }}>
              <Layers size={14} />
            </div>
            <span className="text-sm font-bold" style={{ color: pax26?.textPrimary }}>Coming Soon</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {[
              "Conditions & smart filters",
              "Full execution logs",
              "Advanced performance analytics",
              "Multi-channel triggers (WhatsApp, Web, API)",
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl"
                style={{ background: pax26?.secondaryBg }}>
                <div className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ background: VIOLET, opacity: 0.5 }} />
                <span className="text-xs" style={{ color: pax26?.textSecondary, opacity: 0.65 }}>
                  {item}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </>
  );
}