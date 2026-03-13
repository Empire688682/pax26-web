"use client";

import { useGlobalContext } from "@/components/Context";
import React, { useEffect, useState, useMemo } from "react";

/* ── Icons ───────────────────────────────────────────────── */
const ArrowUpRight = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="7" y1="17" x2="17" y2="7" /><polyline points="7 7 17 7 17 17" />
  </svg>
);
const ArrowDownLeft = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="17" y1="7" x2="7" y2="17" /><polyline points="17 17 7 17 7 7" />
  </svg>
);
const SearchIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);
const FilterIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
);
const ReceiptIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
  </svg>
);
const EmptyIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
  </svg>
);

/* ── Helpers ─────────────────────────────────────────────── */
const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  return {
    date: d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
    time: d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
  };
};

const formatAmount = (tx) => {
  const isDebit = tx.type === "transfer" && tx?.metadata?.transferDetails?.direction === "debit";
  const sign = tx.type === "transfer" ? (isDebit ? "-" : "+") : "";
  return { sign, amount: `₦${Number(tx.amount).toLocaleString()}`, isDebit };
};

const getStatusConfig = (status) => ({
  success: { label: "Success", color: "#10b981", bg: "rgba(16,185,129,0.1)", border: "rgba(16,185,129,0.2)" },
  pending: { label: "Pending", color: "#f59e0b", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.2)" },
  failed:  { label: "Failed",  color: "#ef4444", bg: "rgba(239,68,68,0.1)",  border: "rgba(239,68,68,0.2)"  },
}[status] || { label: status, color: "#94a3b8", bg: "rgba(148,163,184,0.1)", border: "rgba(148,163,184,0.2)" });

const getTypeIcon = (type, isDebit) => {
  if (type === "transfer") return isDebit ? <ArrowUpRight /> : <ArrowDownLeft />;
  return <ReceiptIcon />;
};

const getTypeColor = (type, isDebit, pax26) => {
  if (type === "transfer") return isDebit ? "#ef4444" : "#10b981";
  return pax26?.primary || "#3b82f6";
};

const FILTERS = ["All", "Success", "Pending", "Failed"];

/* ── Skeleton loader ─────────────────────────────────────── */
const Skeleton = ({ pax26 }) => (
  <div className="space-y-3 pb-16">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="flex items-center gap-4 px-4 py-4 rounded-2xl animate-pulse"
        style={{ background: pax26?.secondaryBg }}>
        <div className="w-10 h-10 rounded-xl flex-shrink-0" style={{ background: pax26?.border }} />
        <div className="flex-1 space-y-2">
          <div className="h-3 rounded-full w-2/5" style={{ background: pax26?.border }} />
          <div className="h-3 rounded-full w-3/5" style={{ background: pax26?.border }} />
        </div>
        <div className="h-4 rounded-full w-16" style={{ background: pax26?.border }} />
      </div>
    ))}
  </div>
);

/* ── Summary card ────────────────────────────────────────── */
const SummaryCard = ({ label, value, color, bg, pax26 }) => (
  <div className="flex-1 rounded-2xl px-4 py-4 min-w-0"
    style={{ background: pax26?.secondaryBg, border: `1px solid ${pax26?.border}` }}>
    <p className="text-xs font-medium mb-1.5 opacity-60" style={{ color: pax26?.textSecondary }}>{label}</p>
    <p className="text-lg font-black tracking-tight" style={{ color }}>{value}</p>
  </div>
);

/* ── Transaction row ─────────────────────────────────────── */
const TxRow = ({ tx, pax26, router, index }) => {
  const { date, time } = formatDate(tx.createdAt);
  const { sign, amount, isDebit } = formatAmount(tx);
  const status = getStatusConfig(tx.status);
  const typeColor = getTypeColor(tx.type, isDebit, pax26);

  return (
    <div
      onClick={() => router.push(`transaction-receipt/?id=${tx._id}`)}
      className="flex items-center gap-4 px-4 py-4 rounded-2xl cursor-pointer transition-all duration-200 group"
      style={{
        background: pax26?.secondaryBg,
        border: `1px solid ${pax26?.border}`,
        animationDelay: `${index * 40}ms`,
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = pax26?.primary + "44";
        e.currentTarget.style.transform = "translateY(-1px)";
        e.currentTarget.style.boxShadow = `0 4px 20px rgba(0,0,0,0.08)`;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = pax26?.border;
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {/* Icon */}
      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: typeColor + "15", color: typeColor }}>
        {getTypeIcon(tx.type, isDebit)}
      </div>

      {/* Description + date */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate" style={{ color: pax26?.textPrimary }}>
          {tx.description}
        </p>
        <p className="text-xs mt-0.5 opacity-50" style={{ color: pax26?.textSecondary }}>
          {date} · {time}
        </p>
      </div>

      {/* Amount + status */}
      <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
        <p className="text-sm font-bold"
          style={{ color: tx.type === "transfer" ? (isDebit ? "#ef4444" : "#10b981") : pax26?.textPrimary }}>
          {sign}{amount}
        </p>
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
          style={{ background: status.bg, color: status.color, border: `1px solid ${status.border}` }}>
          {status.label}
        </span>
      </div>
    </div>
  );
};

/* ── Main page ───────────────────────────────────────────── */
const Page = () => {
  const { transactionHistory, pax26, getUserRealTimeData, router } = useGlobalContext();
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  useEffect(() => {
    getUserRealTimeData().then(() => setLoading(false));
  }, []);

  const reversed = useMemo(() => [...(transactionHistory || [])].reverse(), [transactionHistory]);

  const filtered = useMemo(() => reversed.filter(tx => {
    const matchesFilter = filter === "All" || tx.status.toLowerCase() === filter.toLowerCase();
    const matchesSearch = tx.description?.toLowerCase().includes(search.toLowerCase()) ||
      tx.type?.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  }), [reversed, filter, search]);

  // Summary stats
  const stats = useMemo(() => {
    const success = reversed.filter(t => t.status === "success").length;
    const pending = reversed.filter(t => t.status === "pending").length;
    const failed  = reversed.filter(t => t.status === "failed").length;
    const totalIn = reversed
      .filter(t => t.status === "success" && !(t.type === "transfer" && t?.metadata?.transferDetails?.direction === "debit"))
      .reduce((sum, t) => sum + Number(t.amount), 0);
    return { success, pending, failed, totalIn };
  }, [reversed]);

  return (
    <div className="min-h-screen px-4 pb-16 pt-6 max-w-2xl mx-auto">

      {/* ── Page header ─────────────────────────────────── */}
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-widest mb-1 opacity-50"
          style={{ color: pax26?.textSecondary }}>
          Finance
        </p>
        <h1 className="text-2xl font-black tracking-tight" style={{ color: pax26?.textPrimary }}>
          Transaction History
        </h1>
        <p className="text-sm mt-1 opacity-60" style={{ color: pax26?.textSecondary }}>
          {reversed.length} total transactions
        </p>
      </div>

      {/* ── Summary cards ───────────────────────────────── */}
      {!loading && (
        <div className="flex gap-3 mb-6 overflow-x-auto pb-1">
          <SummaryCard label="Total In" value={`₦${stats.totalIn.toLocaleString()}`} color="#10b981" pax26={pax26} />
          <SummaryCard label="Success" value={stats.success} color="#10b981" pax26={pax26} />
          <SummaryCard label="Pending" value={stats.pending} color="#f59e0b" pax26={pax26} />
          <SummaryCard label="Failed"  value={stats.failed}  color="#ef4444" pax26={pax26} />
        </div>
      )}

      {/* ── Search + filter ──────────────────────────────── */}
      <div className="flex gap-3 mb-5">
        {/* Search */}
        <div className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-xl"
          style={{ background: pax26?.secondaryBg, border: `1px solid ${pax26?.border}` }}>
          <span style={{ color: pax26?.textSecondary, opacity: 0.5 }}><SearchIcon /></span>
          <input
            type="text"
            placeholder="Search transactions..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-sm outline-none"
            style={{ color: pax26?.textPrimary }}
          />
        </div>

        {/* Filter toggle */}
        <div className="flex items-center gap-1 px-1 rounded-xl flex-wrap p-2 md:p-0"
          style={{ background: pax26?.secondaryBg, border: `1px solid ${pax26?.border}` }}>
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200"
              style={filter === f
                ? { background: pax26?.primary, color: "#fff" }
                : { color: pax26?.textSecondary, background: "transparent" }
              }
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* ── Transaction list ─────────────────────────────── */}
      {loading ? (
        <Skeleton pax26={pax26} />
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div style={{ color: pax26?.textSecondary, opacity: 0.3 }}><EmptyIcon /></div>
          <div className="text-center">
            <p className="font-semibold text-sm" style={{ color: pax26?.textPrimary }}>
              {search || filter !== "All" ? "No matching transactions" : "No transactions yet"}
            </p>
            <p className="text-xs mt-1 opacity-50" style={{ color: pax26?.textSecondary }}>
              {search || filter !== "All" ? "Try a different search or filter" : "Your transaction history will appear here"}
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map((tx, i) => (
            <TxRow key={tx._id} tx={tx} pax26={pax26} router={router} index={i} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Page;