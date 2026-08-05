"use client";

import React from "react";
import { useGlobalContext } from "@/components/Context";
import { usePlanLimits } from "@/app/hooks/usePlanLimits";
import { MessageSquare, AlertTriangle, ArrowUpRight } from "lucide-react";

/**
 * MessageQuotaBar
 *
 * Shows the user's monthly AI message usage vs their plan limit.
 * Displayed on the Dashboard and AI automation pages.
 */
export default function MessageQuotaBar({ compact = false }) {
  const { pax26, router } = useGlobalContext();
  const { plan, messagesLimit, messagesUsed, messagesRemaining, messagesPct, isEnterprise } = usePlanLimits();

  // Colour reflects urgency
  let barColor = pax26?.primary || "#3b82f6";
  if (messagesPct >= 90) barColor = "#ef4444";
  else if (messagesPct >= 70) barColor = "#f97316";

  return (
    <>
      <style>{`
        @keyframes mq-shimmer {
          0%   { background-position: -200% 0; }
          100% { background-position:  200% 0; }
        }
        .mq-bar-shimmer {
          background: linear-gradient(90deg, ${barColor} 0%, rgba(255,255,255,0.3) 50%, ${barColor} 100%);
          background-size: 200% 100%;
          animation: mq-shimmer 2.2s infinite linear;
        }
      `}</style>

      <div
        className="w-full rounded-2xl border relative overflow-hidden"
        style={{
          background: pax26?.bg,
          borderColor: messagesPct >= 90 ? "rgba(239,68,68,0.3)" : pax26?.border,
          padding: compact ? "12px 16px" : "20px",
        }}
      >
        {/* Ambient glow */}
        <div
          className="absolute -top-8 -right-8 w-20 h-20 rounded-full pointer-events-none opacity-20 blur-xl"
          style={{ background: barColor }}
        />

        <div className={`flex ${compact ? "items-center" : "flex-col md:flex-row md:items-center"} justify-between gap-3 mb-3`}>
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: `${barColor}15`, color: barColor }}
            >
              <MessageSquare size={17} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider" style={{ color: pax26?.textSecondary, opacity: 0.6 }}>
                Monthly AI Replies
              </p>
              <h4 className="text-lg font-black flex items-baseline gap-1" style={{ color: pax26?.textPrimary }}>
                <span className="text-xl font-bold">{messagesUsed.toLocaleString()}</span>
                <span className="text-xs font-medium opacity-40">/ {messagesLimit.toLocaleString()} used</span>
              </h4>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {messagesPct >= 75 && (
              <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded"
                style={{ background: "rgba(249,115,22,0.1)", color: "#f97316", border: "1px solid rgba(249,115,22,0.25)" }}>
                <AlertTriangle size={10} /> Approaching Limit
              </span>
            )}
            {!isEnterprise && (
              <button
                onClick={() => router.push("/dashboard/billing")}
                className="flex items-center gap-1 text-[11px] font-bold transition-opacity hover:opacity-80"
                style={{ color: barColor }}
              >
                Upgrade <ArrowUpRight size={12} />
              </button>
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div
          className="w-full rounded-full overflow-hidden"
          style={{ height: "8px", background: pax26?.border }}
        >
          <div
            className="h-full rounded-full transition-all duration-500 mq-bar-shimmer"
            style={{
              width: `${messagesPct}%`,
              background: barColor,
            }}
          />
        </div>

        {/* Footer text */}
        <div className="flex justify-between items-center mt-2 text-[10px]" style={{ color: pax26?.textSecondary, opacity: 0.55 }}>
          <span>
            {`${messagesRemaining.toLocaleString()} replies remaining this cycle`}
          </span>
          <span className="uppercase tracking-wide">Plan: {plan}</span>
        </div>
      </div>
    </>
  );
}
