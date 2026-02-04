"use client";
import React, { useEffect } from "react";
import { useGlobalContext } from "../Context";
import { usePathname } from "next/navigation";
import { PiHandWithdraw } from "react-icons/pi";
import { Copy, Wallet, ArrowUpRight } from "lucide-react";

const WalletBalance = ({ setShowMore, showMore }) => {
  const { getUserRealTimeData, router, pax26, userWallet, userData } = useGlobalContext();
  const pathName = usePathname();
  const last10Digits = userData?.number ? userData.number.slice(-10) : "**********";

  useEffect(() => {
    const timeout = setTimeout(() => {
      getUserRealTimeData();
    }, 5000);
    return () => clearTimeout(timeout);
  }, []);

  const handleCopy = async () => {
    if (!userData?.number) return;
    await navigator.clipboard.writeText(last10Digits);
    alert("Account number copied to clipboard!");
  };

  return (
    <div
      style={{ backgroundColor: pax26.bg }}
      className="relative overflow-hidden rounded-2xl p-5 shadow-xl backdrop-blur-md border border-white/10"
    >
      {/* Decorative glow */}
      <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-blue-500/20 blur-2xl" />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-blue-600/20">
            <Wallet className="text-blue-400" size={20} />
          </div>
          <p className="text-sm font-medium text-gray-400" style={{ color: pax26.textPrimary }}>
            Wallet Balance
          </p>
        </div>
        <button
          onClick={() => router.push("/fund-wallet")}
          className="flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 transition"
        >
          Fund Wallet
          <ArrowUpRight size={14} />
        </button>
      </div>

      {/* Balance */}
      <div className="mt-4">
        <p
          className="text-3xl font-bold tracking-tight"
          style={{ color: pax26.textPrimary }}
        >
          ₦{userWallet?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00"}
        </p>
        <p className="text-xs text-gray-400 mt-1">Available balance</p>
      </div>

      {/* Account Number */}
      <div className="mt-4 flex items-center justify-between rounded-xl bg-black/20 px-3 py-2">
        <div>
          <p className="text-[11px] text-gray-400">Virtual Account Number</p>
          <p className="text-sm font-mono tracking-wider" style={{ color: pax26.textPrimary }}>
            {last10Digits}
          </p>
        </div>
        <button
          onClick={handleCopy}
          className="rounded-lg cursor-pointer p-2 hover:bg-white/10 transition"
          title="Copy account number"
        >
          <Copy size={16} className="text-blue-400" />
        </button>
      </div>

      {/* Mobile Show More */}
      {pathName === "/dashboard" && (
        <button
          onClick={() => setShowMore(!showMore)}
          className="md:hidden mt-4 flex items-center gap-1 text-xs text-blue-400"
        >
          <PiHandWithdraw size={18} />
          {showMore ? "Show Less" : "Show More"}
        </button>
      )}
    </div>
  );
};

export default WalletBalance;
