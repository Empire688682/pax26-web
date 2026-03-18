"use client";

import React, { useEffect, useState } from "react";
import { useGlobalContext } from "../Context";
import { usePathname } from "next/navigation";
import { PiHandWithdraw } from "react-icons/pi";
import { Copy, Wallet, ArrowUpRight, CheckCircle2, RefreshCw } from "lucide-react";

/* ── Keyframes + font only ───────────────────────────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Syne:wght@600;700;800&display=swap');

  .wb-root { font-family: 'Syne', sans-serif; }
  .wb-mono { font-family: 'DM Mono', monospace; }

  @keyframes wb-float {
    0%,100% { transform: translateY(0) scale(1); }
    50%      { transform: translateY(-8px) scale(1.04); }
  }
  @keyframes wb-spin { to { transform: rotate(360deg); } }
  @keyframes wb-shimmer {
    0%   { background-position: -300px 0; }
    100% { background-position: 300px 0; }
  }
  @keyframes wb-count {
    from { opacity: 0; transform: translateY(6px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes wb-pulse {
    0%,100% { opacity: 1; }
    50%     { opacity: 0.4; }
  }

  .wb-orb    { animation: wb-float 6s ease-in-out infinite; }
  .wb-orb-2  { animation: wb-float 6s ease-in-out -3s infinite; }
  .wb-spin   { animation: wb-spin 0.8s linear infinite; }
  .wb-pulse  { animation: wb-pulse 1.8s ease-in-out infinite; }
  .wb-count  { animation: wb-count 0.4s ease both; }

  .wb-shimmer {
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent);
    background-size: 300px 100%;
    animation: wb-shimmer 1.4s ease-in-out infinite;
  }

  .wb-fund-btn { transition: opacity 0.15s ease, transform 0.15s ease, box-shadow 0.15s ease; }
  .wb-fund-btn:hover { opacity: 0.88; transform: translateY(-1px); }
  .wb-fund-btn:active { transform: translateY(0); }

  .wb-copy-btn { transition: background 0.15s ease, transform 0.15s ease; }
  .wb-copy-btn:hover { transform: scale(1.08); }

  .wb-more-btn { transition: color 0.15s ease; }
  .wb-more-btn:hover { opacity: 0.75; }
`;

const WalletBalance = ({ setShowMore, showMore }) => {
  const { getUserRealTimeData, router, pax26, userWallet, userData, checkIsTransactionPinSet } = useGlobalContext();
  const pathName = usePathname();

  const [loading, setLoading] = useState(false);
  const [copied, setCopied]   = useState(false);
  const [spinning, setSpinning] = useState(false);

  const primary = pax26?.primary;
  const GREEN   = "#22c55e";
  const accNum  = userData?.number ? userData.number.slice(-10) : "**********";

  useEffect(()=>{
    checkIsTransactionPinSet();
  },[userData])
  /* initial fetch + 30s polling */
  useEffect(() => {
    const fetch = async () => { setLoading(true); await getUserRealTimeData(); setLoading(false); };
    fetch();
    const iv = setInterval(getUserRealTimeData, 30000);
    return () => clearInterval(iv);
  }, []);

  const handleRefresh = async () => {
    setSpinning(true);
    await getUserRealTimeData();
    setSpinning(false);
  };

  const handleCopy = async () => {
    if (!userData?.number) return;
    await navigator.clipboard.writeText(accNum);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formattedBalance = userWallet?.toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }) || "0.00";

  return (
    <>
      <style>{CSS}</style>
      <div className="wb-root relative overflow-hidden rounded-2xl p-5 shadow-xl"
        style={{ background: pax26?.bg, border: `1px solid ${pax26?.border}` }}>

        {/* ── Decorative orbs ──────────────────────────── */}
        <div className="wb-orb absolute -top-8 -right-8 w-28 h-28 rounded-full pointer-events-none"
          style={{ background: `${primary}18`, filter: "blur(28px)" }} />
        <div className="wb-orb-2 absolute -bottom-6 -left-6 w-20 h-20 rounded-full pointer-events-none"
          style={{ background: `${primary}10`, filter: "blur(20px)" }} />

        {/* ── Top accent strip ─────────────────────────── */}
        <div className="absolute top-0 left-0 right-0 h-0.5"
          style={{ background: `linear-gradient(90deg, ${primary}80, ${primary}22, transparent)` }} />

        <div className="relative z-10 space-y-4">

          {/* ── Header row ──────────────────────────────── */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: `${primary}15`, color: primary }}>
                <Wallet size={17} />
              </div>
              <div>
                <p className="wb-mono text-[10px] uppercase tracking-widest"
                  style={{ color: pax26?.textSecondary, opacity: 0.45 }}>
                  Wallet Balance
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* refresh icon */}
              <button
                onClick={handleRefresh}
                className="wb-copy-btn w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: pax26?.secondaryBg, border: `1px solid ${pax26?.border}` }}
                title="Refresh balance"
              >
                <RefreshCw size={13} className={spinning ? "wb-spin" : ""}
                  style={{ color: pax26?.textSecondary, opacity: 0.5 }} />
              </button>

              {/* fund button */}
              <button
                onClick={() => router.push("/fund-wallet")}
                className={` ${pathName != "/dashboard"? "hidden":"flex"} wb-fund-btn items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white`}
                style={{
                  background: primary,
                  boxShadow: `0 6px 18px ${primary}38`,
                }}
              >
                Fund <ArrowUpRight size={13} />
              </button>
            </div>
          </div>

          {/* ── Balance display ─────────────────────────── */}
          {loading ? (
            /* skeleton */
            <div className="space-y-2">
              <div className="relative overflow-hidden h-8 w-40 rounded-xl"
                style={{ background: pax26?.secondaryBg }}>
                <div className="wb-shimmer absolute inset-0" />
              </div>
              <div className="relative overflow-hidden h-3 w-24 rounded-lg"
                style={{ background: pax26?.secondaryBg }}>
                <div className="wb-shimmer absolute inset-0" />
              </div>
            </div>
          ) : (
            <div className="wb-count">
              <p className="wb-mono text-2xl font-bold tracking-tight leading-none"
                style={{ color: pax26?.textPrimary }}>
                <span style={{ color: primary, opacity: 0.7 }}>₦</span>
                {formattedBalance}
              </p>
              <div className="flex items-center gap-1.5 mt-1.5">
                <span className="wb-pulse w-1.5 h-1.5 rounded-full block" style={{ background: GREEN }} />
                <p className="wb-mono text-[10px]" style={{ color: pax26?.textSecondary, opacity: 0.45 }}>
                  Available balance · live
                </p>
              </div>
            </div>
          )}

          {/* ── Virtual account chip ─────────────────────── */}
          {
            pathName === "/dashboard" && (
              <div className="flex items-center justify-between gap-3 rounded-xl px-4 py-3"
            style={{ background: pax26?.secondaryBg, border: `1px solid ${pax26?.border}` }}>
            <div className="min-w-0">
              <p className="wb-mono text-[10px] uppercase tracking-widest mb-0.5"
                style={{ color: pax26?.textSecondary, opacity: 0.4 }}>
                Virtual Account
              </p>
              <p className="wb-mono text-sm font-medium tracking-wider truncate"
                style={{ color: pax26?.textPrimary }}>
                {accNum}
              </p>
            </div> 

            <button
              onClick={handleCopy}
              className="wb-copy-btn flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg flex-shrink-0 text-[10px] font-semibold"
              style={{
                background: copied ? "rgba(34,197,94,0.1)" : `${primary}10`,
                color: copied ? GREEN : primary,
                border: `1px solid ${copied ? "rgba(34,197,94,0.25)" : primary + "28"}`,
              }}
              title="Copy account number"
            >
              {copied
                ? <><CheckCircle2 size={11} /> Copied</>
                : <><Copy size={11} /> Copy</>
              }
            </button>
          </div>
            )

          }
          

          {/* ── Show more toggle (mobile only) ──────────── */}
          {pathName === "/dashboard" && (
            <button
              onClick={() => setShowMore(!showMore)}
              className="wb-more-btn wb-mono md:hidden flex items-center gap-1.5 text-xs font-medium"
              style={{ color: primary }}
            >
              <PiHandWithdraw size={16} />
              {showMore ? "Show Less" : "Show More"}
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default WalletBalance;