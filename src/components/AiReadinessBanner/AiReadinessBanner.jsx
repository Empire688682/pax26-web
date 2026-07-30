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
 * Copy and CTAs adapt to businessType: seller | service | unset.
 */
export default function AiReadinessBanner({ className = "" }) {
  const { userData, pax26 } = useGlobalContext();
  const router = useRouter();
  const [dismissed, setDismissed] = useState(false);

  const isConnected = !!userData?.whatsapp?.connected;
  const isTrained = !!userData?.paxAI?.trained;
  const hasKnowledge =
    Array.isArray(userData?.paxAI?.knowledgeBase) &&
    userData.paxAI.knowledgeBase.length > 0;
  const needsAttention = isConnected && !isTrained && !hasKnowledge;

  const businessType = userData?.paxAI?.businessType ?? null; // null | "seller" | "service"

  if (!needsAttention || dismissed) return null;

  const contentByType = {
    seller: {
      title: "Your seller AI needs products",
      body: "WhatsApp is connected and customers can message you — but your seller agent cannot reply without products and store details. Add products or finish training so it can start selling.",
      primary: {
        label: "Train Seller AI",
        href: "/dashboard/automations/training",
      },
      secondary: {
        label: "Add Products",
        href: "/dashboard/automations/ai-business-dashboard",
      },
    },
    service: {
      title: "Your service AI needs setup",
      body: "WhatsApp is connected and customers can message you — but your service agent cannot reply without services, FAQs, or business details. Complete training so it can start responding.",
      primary: {
        label: "Train Service AI",
        href: "/dashboard/automations/training",
      },
      secondary: {
        label: "Add Services & FAQs",
        href: "/dashboard/automations/ai-business-dashboard",
      },
    },
    unset: {
      title: "AI has no knowledge yet",
      body: "WhatsApp is connected and customers can message you — but the AI cannot reply until you choose a business type and complete training.",
      primary: {
        label: "Train AI",
        href: "/dashboard/automations/training",
      },
      secondary: {
        label: "Open Business Dashboard",
        href: "/dashboard/automations/ai-business-dashboard",
      },
    },
  };

  const content =
    businessType === "seller"
      ? contentByType.seller
      : businessType === "service"
        ? contentByType.service
        : contentByType.unset;

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
        <div
          className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl"
          style={{ background: "linear-gradient(180deg, #fb923c, #f59e0b)" }}
        />

        <div className="flex items-start gap-4 px-5 py-4 pl-6">
          <div className="flex-shrink-0 mt-0.5">
            <span
              className="ai-dot-blink block w-3 h-3 rounded-full"
              style={{ background: "#fb923c" }}
            />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold mb-0.5" style={{ color: "#fb923c" }}>
              {content.title}
            </p>
            <p
              className="text-xs leading-relaxed"
              style={{ color: pax26?.textSecondary, opacity: 0.8 }}
            >
              {content.body}
            </p>

            <div className="flex flex-wrap items-center gap-2 mt-3">
              <button
                onClick={() => router.push(content.primary.href)}
                className="text-xs font-bold px-3 py-1.5 rounded-xl transition-all hover:opacity-80"
                style={{
                  background: "rgba(251,146,60,0.15)",
                  color: "#fb923c",
                  border: "1px solid rgba(251,146,60,0.3)",
                }}
              >
                {content.primary.label}
              </button>
              <button
                onClick={() => router.push(content.secondary.href)}
                className="text-xs font-bold px-3 py-1.5 rounded-xl transition-all hover:opacity-80"
                style={{
                  background: "rgba(251,146,60,0.08)",
                  color: "#fb923c",
                  border: "1px solid rgba(251,146,60,0.2)",
                }}
              >
                {content.secondary.label}
              </button>
            </div>
          </div>

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
