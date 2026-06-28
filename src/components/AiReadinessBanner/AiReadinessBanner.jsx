"use client";

import React, { useState } from "react";
import { useGlobalContext } from "../Context";
import { useRouter } from "next/navigation";

/**
 * AiReadinessBanner
 *
 * Shows a pulsing warning banner when the user's WhatsApp is connected
 * but the AI has no training data (paxAI.trained === false AND knowledgeBase is empty).
 *
 * Customers can already message the user and appear in the inbox — but the AI
 * won't respond without knowledge. This banner prompts the user to fix that.
 *
 * Props:
 *   className — optional extra class for positioning
 */
export default function AiReadinessBanner({ className = "" }) {
  const { userData, pax26 } = useGlobalContext();
  const router = useRouter();
  const [dismissed, setDismissed] = useState(false);

  // Only show if:
  // 1. WhatsApp is connected
  // 2. AI is not trained AND has no knowledge base entries
  const isConnected = !!userData?.whatsapp?.connected;
  const isTrained   = !!userData?.paxAI?.trained;
  const hasKnowledge = Array.isArray(userData?.paxAI?.knowledgeBase) && userData.paxAI.knowledgeBase.length > 0;
  const needsAttention = isConnected && !isTrained && !hasKnowledge;

  if (!needsAttention || dismissed) return null;

  return (
    <>
      <style>{`
        @keyframes ai-banner-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.82; }
        }
        @keyframes ai-dot-blink {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.5); opacity: 0.6; }
        }
        .ai-banner-pulse { animation: ai-banner-pulse 2.5s ease-in-out infinite; }
        .ai-dot-blink { animation: ai-dot-blink 1.4s ease-in-out infinite; }
      `}</style>

      <div
        className={`ai-banner-pulse w-full rounded-2xl border relative overflow-hidden ${className}`}
        style={{
          background: "rgba(251,146,60,0.07)",
          borderColor: "rgba(251,146,60,0.35)",
        }}
      >
        {/* animated left accent bar */}
        <div
          className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl"
          style={{ background: "linear-gradient(180deg, #fb923c, #f59e0b)" }}
        />

        <div className="flex items-start gap-4 px-5 py-4 pl-6">
          {/* blinking dot */}
          <div className="flex-shrink-0 mt-0.5">
            <span
              className="ai-dot-blink block w-3 h-3 rounded-full"
              style={{ background: "#fb923c" }}
            />
          </div>

          {/* text content */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold mb-0.5" style={{ color: "#fb923c" }}>
              AI has no knowledge yet
            </p>
            <p className="text-xs leading-relaxed" style={{ color: pax26?.textSecondary, opacity: 0.8 }}>
              Your WhatsApp is connected and customers can message you — but the AI cannot reply without training data or products.
              Add your business knowledge or products now so the AI can start responding.
            </p>

            {/* CTA buttons */}
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <button
                onClick={() => router.push("/dashboard/automations/training")}
                className="text-xs font-bold px-3 py-1.5 rounded-xl transition-all hover:opacity-80"
                style={{
                  background: "rgba(251,146,60,0.15)",
                  color: "#fb923c",
                  border: "1px solid rgba(251,146,60,0.3)",
                }}
              >
                🧠 Train AI
              </button>
              <button
                onClick={() => router.push("/dashboard/automations/sales")}
                className="text-xs font-bold px-3 py-1.5 rounded-xl transition-all hover:opacity-80"
                style={{
                  background: "rgba(251,146,60,0.08)",
                  color: "#fb923c",
                  border: "1px solid rgba(251,146,60,0.2)",
                }}
              >
                🛒 Add Products
              </button>
            </div>
          </div>

          {/* dismiss */}
          <button
            onClick={() => setDismissed(true)}
            className="flex-shrink-0 text-[10px] opacity-40 hover:opacity-70 transition-opacity mt-0.5"
            style={{ color: pax26?.textSecondary }}
            aria-label="Dismiss"
          >
            ✕
          </button>
        </div>
      </div>
    </>
  );
}
