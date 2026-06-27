"use client";

import React from "react";
import { useGlobalContext } from "@/components/Context";
import { usePlanLimits } from "@/app/hooks/usePlanLimits";
import { Users, AlertTriangle, ArrowUpRight } from "lucide-react";

export default function BroadcastLimitBar() {
  const { pax26, router } = useGlobalContext();
  const { plan, broadcastLimit, broadcastUsed, broadcastRemaining } = usePlanLimits();

  const isFree = plan === "free";
  const isEnterprise = plan === "enterprise";

  // Calculate percentage
  let percentage = 0;
  if (broadcastLimit > 0 && !isEnterprise) {
    percentage = Math.min(100, (broadcastUsed / broadcastLimit) * 100);
  }

  // Bar color based on usage percentage — never red/orange for enterprise
  let barColor = pax26?.primary || "#3b82f6";
  if (!isEnterprise) {
    if (percentage >= 90) {
      barColor = "#ef4444"; // Red for danger
    } else if (percentage >= 70) {
      barColor = "#f97316"; // Orange for warning
    }
  }

  return (
    <>
      <style>{`
        @keyframes limit-shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .limit-bar-shimmer {
          background: linear-gradient(90deg, ${barColor} 0%, rgba(255, 255, 255, 0.35) 50%, ${barColor} 100%);
          background-size: 200% 100%;
          animation: limit-shimmer 2.2s infinite linear;
        }
      `}</style>

      <div className="w-full rounded-2xl p-5 border relative overflow-hidden backdrop-blur-md"
        style={{
          background: pax26?.bg || "rgba(12, 20, 40, 0.72)",
          borderColor: pax26?.border || "rgba(255, 255, 255, 0.08)"
        }}>
        
        {/* Ambient glow in corner */}
        <div className="absolute -top-10 -right-10 w-24 h-24 rounded-full pointer-events-none opacity-20 blur-xl"
          style={{ background: barColor }} />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-3">
          
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: `${barColor}15`, color: barColor }}>
              <Users size={18} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider px-display" style={{ color: pax26?.textSecondary, opacity: 0.6 }}>
                Monthly Broadcast Contacts
              </p>
              <h4 className="text-lg font-black px-display flex items-baseline gap-1" style={{ color: pax26?.textPrimary }}>
                {isEnterprise ? (
                  <span>Unlimited</span>
                ) : (
                  <>
                    <span className="text-xl font-bold">{broadcastUsed.toLocaleString()}</span>
                    <span className="text-xs font-medium opacity-40">/ {broadcastLimit.toLocaleString()} used</span>
                  </>
                )}
              </h4>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isEnterprise && percentage >= 75 && (
              <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/25">
                <AlertTriangle size={10} /> Approaching Limit
              </span>
            )}
            {/* Only show upgrade button if not already on enterprise */}
            {!isEnterprise && (
              <button
                onClick={() => router.push("/dashboard/billing")}
                className="flex items-center gap-1 text-[11px] font-bold transition-opacity hover:opacity-80"
                style={{ color: barColor }}
              >
                Upgrade Plan <ArrowUpRight size={12} />
              </button>
            )}
          </div>

        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 rounded-full overflow-hidden" 
          style={{ background: pax26?.border || "rgba(255, 255, 255, 0.08)" }}>
          <div 
            className={`h-full rounded-full transition-all duration-500 ${isEnterprise ? "" : "limit-bar-shimmer"}`}
            style={{ 
              width: isEnterprise ? "100%" : `${percentage}%`,
              background: isEnterprise ? barColor : undefined,
            }} 
          />
        </div>

        {/* Detail text */}
        <div className="flex justify-between items-center mt-2 text-[10px]" style={{ color: pax26?.textSecondary, opacity: 0.55 }}>
          <span>
            {isEnterprise 
              ? "Enterprise active - no limit restrictions." 
              : `${broadcastRemaining === Infinity ? "Unlimited" : broadcastRemaining.toLocaleString()} contact replies remaining this cycle`}
          </span>
          <span className="px-mono uppercase">
            Plan: {plan}
          </span>
        </div>

      </div>
    </>
  );
}
