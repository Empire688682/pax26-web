"use client";

import React from "react";
import MasterclassVideo from "@/components/MasterclassVideo/MasterclassVideo";
import { useGlobalContext } from "@/components/Context";
import { Youtube, ArrowLeft, ExternalLink, Play } from "lucide-react";

export default function DashboardTutorialPage() {
  const { pax26, router } = useGlobalContext();

  return (
    <div
      style={{
        background: pax26?.bg || "#0b0f17",
        minHeight: "100vh",
        padding: "24px 16px 60px",
      }}
    >
      <div style={{ maxWidth: "1080px", margin: "0 auto" }}>
        {/* Top Navigation Bar */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
            style={{
              background: pax26?.secondaryBg || "rgba(255,255,255,0.05)",
              color: pax26?.textSecondary || "#9ca3af",
              border: `1px solid ${pax26?.border || "rgba(255,255,255,0.1)"}`,
            }}
          >
            <ArrowLeft size={14} /> Back
          </button>

          <div className="flex items-center gap-2">
            <span
              className="px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider text-red-400 bg-red-500/10 border border-red-500/20"
            >
              Video Masterclass
            </span>
          </div>
        </div>

        {/* Masterclass Video Player Component */}
        <MasterclassVideo />
      </div>
    </div>
  );
}
