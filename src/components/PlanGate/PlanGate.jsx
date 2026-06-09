"use client";

import React from "react";
import { useGlobalContext } from "@/components/Context";
import { usePlanLimits } from "@/app/hooks/usePlanLimits";
import { ShieldAlert, Sparkles, Crown } from "lucide-react";

export default function PlanGate({ children, feature, requiredPlan = "starter", title }) {
  const { pax26, router } = useGlobalContext();
  const limits = usePlanLimits();

  // Evaluate if the user has access to the feature
  let hasAccess = false;
  let featureLabel = "";
  let requiredPlanName = "Starter";

  if (feature === "broadcast") {
    hasAccess = limits.canBroadcast;
    featureLabel = "Broadcast Campaigns";
    requiredPlanName = "Starter";
  } else if (feature === "schedule") {
    hasAccess = limits.canSchedule;
    featureLabel = "Scheduled Broadcasts";
    requiredPlanName = "Business";
  } else if (feature === "sequence") {
    hasAccess = limits.canBulkSequence;
    featureLabel = "Multi-step Bulk Sequences";
    requiredPlanName = "Enterprise";
  } else if (feature === "segment") {
    hasAccess = limits.canSegment;
    featureLabel = "Audience Tag Segmentation";
    requiredPlanName = "Business";
  } else {
    // Fallback comparison by plan index
    const planWeights = { free: 0, starter: 1, business: 2, enterprise: 3 };
    const userWeight = planWeights[limits.plan] || 0;
    const requiredWeight = planWeights[requiredPlan] || 1;
    hasAccess = userWeight >= requiredWeight;
    featureLabel = title || "Premium Feature";
    requiredPlanName = requiredPlan.charAt(0).toUpperCase() + requiredPlan.slice(1);
  }

  if (hasAccess) {
    return <>{children}</>;
  }

  // Accent color mapping based on required plan
  const planColorMap = {
    starter: "#38BDF8",
    business: "#C9A84C",
    enterprise: "#A78BFA"
  };
  const accentColor = planColorMap[requiredPlan.toLowerCase()] || pax26?.primary || "#3b82f6";

  return (
    <div className="relative w-full h-full min-h-[250px] rounded-2xl overflow-hidden border"
      style={{ borderColor: pax26?.border }}>
      
      {/* Blurred background content stub */}
      <div className="absolute inset-0 select-none pointer-events-none filter blur-[5px] opacity-25 p-6">
        <div className="w-full h-6 rounded bg-gray-700 mb-4 animate-pulse" />
        <div className="w-3/4 h-6 rounded bg-gray-700 mb-6 animate-pulse" />
        <div className="grid grid-cols-2 gap-4">
          <div className="h-20 rounded-xl bg-gray-800 animate-pulse" />
          <div className="h-20 rounded-xl bg-gray-800 animate-pulse" />
        </div>
      </div>

      {/* Blurred Overlay + CTA */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 backdrop-blur-md"
        style={{ background: `${pax26?.bg}c0` }}>
        
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
          style={{ background: `${accentColor}15`, color: accentColor, border: `1px solid ${accentColor}28` }}>
          {requiredPlan.toLowerCase() === "enterprise" ? (
            <Crown size={26} />
          ) : (
            <Sparkles size={26} />
          )}
        </div>

        <h3 className="font-extrabold text-lg tracking-tight mb-2" style={{ color: pax26?.textPrimary }}>
          Unlock {featureLabel}
        </h3>
        
        <p className="text-xs max-w-sm mb-6 leading-relaxed" style={{ color: pax26?.textSecondary, opacity: 0.75 }}>
          This feature is exclusive to the <span className="font-bold" style={{ color: accentColor }}>{requiredPlanName} Plan</span> and above. Upgrade your workspace to unlock advanced WhatsApp capabilities.
        </p>

        <button
          onClick={() => router.push("/dashboard/billing")}
          className="px-6 py-2.5 rounded-xl text-xs font-bold text-white transition-all hover:scale-[1.02] active:scale-100"
          style={{
            background: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)`,
            boxShadow: `0 8px 20px ${accentColor}30`
          }}
        >
          Upgrade to {requiredPlanName}
        </button>
      </div>
    </div>
  );
}
