"use client";

import React, { useEffect, useState } from "react";
import { Bot, Phone, Wifi, Zap, Tv, ArrowRightLeft, Bell, ArrowRight, Eye, EyeOff, TrendingUp } from "lucide-react";
import { useGlobalContext } from "../Context";
import WalletBalance from "../WalletBalance/WalletBalance";
import CashBackBalance from "../CashBackBalance/CashBackBalance";

/* ── Keyframes + font only ───────────────────────────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Syne:wght@600;700;800&display=swap');

  .db-root { font-family: 'Syne', sans-serif; }
  .db-mono { font-family: 'DM Mono', monospace; }

  @keyframes db-slide {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes db-fade {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes db-pulse {
    0%,100% { opacity: 1; transform: scale(1); }
    50%     { opacity: 0.4; transform: scale(0.75); }
  }
  @keyframes db-orb {
    0%,100% { transform: translateY(0) scale(1); }
    50%     { transform: translateY(-10px) scale(1.04); }
  }
  @keyframes db-shimmer {
    0%   { background-position: -400px 0; }
    100% { background-position:  400px 0; }
  }
  @keyframes db-count {
    from { opacity: 0; transform: translateY(6px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .db-s1 { animation: db-slide 0.4s ease both; }
  .db-s2 { animation: db-slide 0.4s ease 0.06s both; }
  .db-s3 { animation: db-slide 0.4s ease 0.12s both; }
  .db-s4 { animation: db-slide 0.4s ease 0.18s both; }
  .db-s5 { animation: db-slide 0.4s ease 0.24s both; }
  .db-s6 { animation: db-slide 0.4s ease 0.30s both; }

  .db-fade   { animation: db-fade  0.3s ease both; }
  .db-pulse  { animation: db-pulse 2s ease-in-out infinite; }
  .db-orb    { animation: db-orb   6s ease-in-out infinite; }
  .db-count  { animation: db-count 0.4s ease both; }

  .db-shimmer {
    background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.05) 50%, transparent 100%);
    background-size: 400px 100%;
    animation: db-shimmer 1.4s ease-in-out infinite;
  }

  /* cards */
  .db-card { transition: transform 0.2s ease, box-shadow 0.2s ease; }
  .db-card:hover { transform: translateY(-2px); }

  /* quick link */
  .db-ql { transition: transform 0.18s ease, background 0.18s ease; }
  .db-ql:hover { transform: translateY(-3px); }

  /* buttons */
  .db-btn { transition: opacity 0.15s ease, transform 0.15s ease; }
  .db-btn:hover { opacity: 0.85; transform: translateY(-1px); }

  /* tx row */
  .db-tx { transition: background 0.15s ease; cursor: pointer; }
  .db-tx:hover { border-radius: 12px; }

  /* wallet toggle */
  .db-wallet-expand { animation: db-slide 0.35s ease both; }
`;

/* ── Stat mini card ───────────────────────────────────────────── */
function StatCard({ label, value, color, delay, pax26 }) {
  return (
    <div className="db-card rounded-2xl p-4 space-y-2"
      style={{ background: pax26?.bg, border: `1px solid ${pax26?.border}`, animationDelay: delay, animation: "db-slide 0.4s ease both" }}>
      <p className="text-xs font-semibold uppercase tracking-widest"
        style={{ color: pax26?.textSecondary, opacity: 0.5 }}>
        {label}
      </p>
      <p className="db-count text-2xl font-bold leading-none"
        style={{ color: color || pax26?.textPrimary }}>
        {value}
      </p>
    </div>
  );
}

/* ── Quick link card ──────────────────────────────────────────── */
function ServiceCard({ title, link, icon, color, pax26, router }) {
  return (
    <button
      onClick={() => router.push(link)}
      className="db-ql flex flex-col items-center justify-center gap-2.5 rounded-2xl py-5 px-3 w-full"
      style={{ background: pax26?.bg, border: `1px solid ${pax26?.border}` }}>
      <div className="w-11 h-11 rounded-xl flex items-center justify-center"
        style={{ background: `${color}14`, color }}>
        {icon}
      </div>
      <span className="text-xs font-semibold" style={{ color: pax26?.textPrimary }}>{title}</span>
    </button>
  );
}

/* ── Transaction row ──────────────────────────────────────────── */
function TxRow({ tx, onClick, pax26 }) {
  const isSuccess = tx.status;
  return (
    <div className="db-tx flex items-center justify-between gap-3 px-3 py-3.5 -mx-3"
      onClick={onClick}
      style={{ borderBottom: `1px solid ${pax26?.border}` }}>
      <div className="flex items-center gap-3 min-w-0">
        {/* type dot */}
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: isSuccess ? "rgba(34,197,94,0.1)" : "rgba(245,158,11,0.1)" }}>
          <TrendingUp size={14} style={{ color: isSuccess === "success" ? "#22c55e" : isSuccess === "pending" ? "#f59e0b" : "#f54d0b" }} />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium truncate" style={{ color: pax26?.textPrimary }}>{tx.description}</p>
          <p className="db-mono text-[10px]" style={{ color: pax26?.textSecondary, opacity: 0.6 }}>
            {new Date(tx.createdAt).toLocaleString()}
          </p>
        </div>
      </div>
      <div className="flex flex-col items-end flex-shrink-0">
        <p className="text-sm font-bold" style={{ color: isSuccess === "success" ? "#22c55e" : isSuccess === "pending" ? "#f59e0b" : "#f54d0b" }}>
          ₦{tx.amount}
        </p>
        <p className="db-mono text-[10px] capitalize" style={{ color: pax26?.textSecondary, opacity: 0.6 }}>
          {tx.type}
        </p>
      </div>
    </div>
  );
}

/* ── Main Dashboard ───────────────────────────────────────────── */
const Dashboard = () => {
  const { userData, pax26, router, transactionHistory, getUserRealTimeData } = useGlobalContext();
  const [showWallet, setShowWallet] = useState(false);
  const [showMore, setShowMore]     = useState(false);

  useEffect(() => { getUserRealTimeData(); }, []);

  const firstName = userData?.name?.split(" ")[0] || "User";
  const primary   = pax26?.primary || "#3B82F6";

  const GREEN  = "#22c55e";
  const TEAL   = "#06b6d4";
  const AMBER  = "#f59e0b";
  const CORAL  = "#f97316";
  const VIOLET = "#a78bfa";

  return (
    <>
      <style>{CSS}</style>
      <div className="db-root max-w-7xl mx-auto py-6 pb-24 space-y-5">

        {/* ── Top bar ────────────────────────────────────────── */}
        <div className="db-s1 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest mb-0.5"
              style={{ color: pax26?.textSecondary, opacity: 0.45 }}>
              Welcome back
            </p>
            <h2 className="text-2xl font-extrabold leading-tight" style={{ color: pax26?.textPrimary }}>
              {firstName} 👋
            </h2>
          </div>
          <button
            className="db-btn w-10 h-10 rounded-xl flex items-center justify-center"
            onClick={() => router.push("/notifications")}
            style={{ background: pax26?.bg, border: `1px solid ${pax26?.border}` }}>
            <Bell size={18} style={{ color: pax26?.textSecondary }} />
          </button>
        </div>

        {/* ── AI Automation hero card ─────────────────────────── */}
        <div className="db-card db-s2 relative rounded-2xl p-6 overflow-hidden"
          style={{ background: pax26?.bg, border: `1px solid ${primary}25` }}>
          {/* orbs */}
          <div className="db-orb absolute -top-10 -right-10 w-40 h-40 rounded-full pointer-events-none"
            style={{ background: `${primary}18`, filter: "blur(50px)" }} />
          <div className="db-orb absolute -bottom-8 left-6 w-28 h-28 rounded-full pointer-events-none"
            style={{ background: `${TEAL}0D`, filter: "blur(40px)", animationDelay: "-3s" }} />
          {/* top strip */}
          <div className="absolute top-0 left-0 right-0 h-0.5"
            style={{ background: `linear-gradient(to right, ${primary}, ${TEAL})` }} />

          <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ background: `${primary}18`, color: primary }}>
                  <Bot size={15} />
                </div>
                <span className="text-xs font-bold uppercase tracking-widest"
                  style={{ color: primary }}>
                  AI Automation
                </span>
                <span className="db-pulse w-1.5 h-1.5 rounded-full block" style={{ background: GREEN }} />
              </div>
              <h2 className="text-lg font-extrabold leading-snug mb-1.5" style={{ color: pax26?.textPrimary }}>
                Automate your WhatsApp business
              </h2>
              <p className="text-xs leading-relaxed" style={{ color: pax26?.textSecondary, opacity: 0.6 }}>
                Auto-reply, capture leads, and respond to customers 24/7 — hands-free.
              </p>
            </div>
            <button
              className="db-btn flex mr-4 items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white flex-shrink-0"
              onClick={() => router.push("dashboard/automations")}
              style={{ background: primary, boxShadow: `0 8px 24px ${primary}40` }}>
              Setup <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {/* ── Automation stats ────────────────────────────────── */}
        <div className="db-s3 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="Automations"  value="0"  color={TEAL}   delay="0s"     pax26={pax26} />
          <StatCard label="Msgs Handled" value="0"  color={GREEN}  delay="0.05s"  pax26={pax26} />
          <StatCard label="Leads"        value="0"  color={AMBER}  delay="0.10s"  pax26={pax26} />
          <StatCard label="Revenue"      value="₦0" color={VIOLET} delay="0.15s"  pax26={pax26} />
        </div>

        {/* ── Wallet card ─────────────────────────────────────── */}
        <div className="db-card db-s4 rounded-2xl p-5"
          style={{ background: pax26?.bg, border: `1px solid ${pax26?.border}` }}>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest mb-0.5"
                style={{ color: pax26?.textSecondary, opacity: 0.45 }}>
                Wallet
              </p>
              <p className="text-sm font-medium" style={{ color: pax26?.textPrimary }}>
                Manage balance & cashback
              </p>
            </div>
            <button
              className="db-btn flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold"
              onClick={() => setShowWallet(!showWallet)}
              style={{
                background: showWallet ? `${primary}15` : pax26?.secondaryBg,
                color: showWallet ? primary : pax26?.textSecondary,
                border: `1px solid ${showWallet ? primary + "30" : pax26?.border}`,
              }}>
              {showWallet ? <EyeOff size={13} /> : <Eye size={13} />}
              {showWallet ? "Hide" : "View"}
            </button>
          </div>

          {showWallet && (
            <div className="db-wallet-expand grid md:grid-cols-2 gap-4 mt-5 pt-5"
              style={{ borderTop: `1px solid ${pax26?.border}` }}>
              <WalletBalance showMore={showMore} setShowMore={setShowMore} />
              <div className="rounded-xl p-4" style={{ background: pax26?.secondaryBg }}>
                <p className="text-xs font-semibold uppercase tracking-widest mb-3"
                  style={{ color: pax26?.textSecondary, opacity: 0.5 }}>
                  Cashback Balance
                </p>
                <CashBackBalance />
              </div>
            </div>
          )}
        </div>

        {/* ── Services ────────────────────────────────────────── */}
        <div className="db-s5">
          <div className="flex items-center gap-3 mb-4">
            <p className="text-xs font-bold tracking-widest uppercase"
              style={{ color: pax26?.textSecondary, opacity: 0.4 }}>
              Services
            </p>
            <div className="h-px flex-1" style={{ background: pax26?.border }} />
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3" id="VTU">
            <ServiceCard title="Airtime"    link="/dashboard/services/buy-airtime"    icon={<Phone size={18} />}         color={GREEN}  pax26={pax26} router={router} />
            <ServiceCard title="Data"       link="/dashboard/services/buy-data"       icon={<Wifi size={18} />}          color={TEAL}   pax26={pax26} router={router} />
            <ServiceCard title="Electricity" link="/dashboard/services/buy-electricity" icon={<Zap size={18} />}         color={AMBER}  pax26={pax26} router={router} />
            <ServiceCard title="TV"         link="/dashboard/services/buy-tv"         icon={<Tv size={18} />}            color={VIOLET} pax26={pax26} router={router} />
            <ServiceCard title="Transfer"   link="/dashboard/services/transfer"       icon={<ArrowRightLeft size={18} />} color={CORAL}  pax26={pax26} router={router} />
          </div>
        </div>

        {/* ── Recent transactions ──────────────────────────────── */}
        <div className="db-s6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <p className="text-xs font-bold tracking-widest uppercase"
                style={{ color: pax26?.textSecondary, opacity: 0.6 }}>
                Recent Activity
              </p>
              <div className="h-px w-10" style={{ background: pax26?.border }} />
            </div>
            <button
              className="db-btn flex items-center gap-1 text-xs font-semibold"
              onClick={() => router.push("/transactions")}
              style={{ color: primary }}>
              View all <ArrowRight size={12} />
            </button>
          </div>

          <div className="rounded-2xl px-3 py-1" style={{ background: pax26?.bg, border: `1px solid ${pax26?.border}` }}>
            {transactionHistory?.length ? (
              [...transactionHistory].reverse().slice(0, 5).map((tx) => (
                <TxRow
                  key={tx._id}
                  tx={tx}
                  onClick={() => router.push(`transaction-receipt/?id=${tx._id}`)}
                  pax26={pax26}
                />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{ background: pax26?.secondaryBg }}>
                  <ArrowRightLeft size={20} style={{ color: pax26?.textSecondary, opacity: 0.3 }} />
                </div>
                <p className="text-sm" style={{ color: pax26?.textSecondary, opacity: 0.4 }}>
                  No recent activity
                </p>
              </div>
            )}
          </div>
        </div>

      </div>
    </>
  );
};

export default Dashboard;