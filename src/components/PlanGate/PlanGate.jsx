"use client";

import React from "react";
import { useGlobalContext } from "@/components/Context";
import { usePlanLimits } from "@/app/hooks/usePlanLimits";
import { ShieldAlert, Sparkles, Crown, Lock, Store, BarChart2, Bot, Package } from "lucide-react";

/**
 * PlanGate
 *
 * Wraps any UI section and renders either:
 *   - children (user has access), or
 *   - a blurred paywall with an upgrade CTA
 *
 * feature prop  →  which PlanLimits flag to check
 * requiredPlan  →  lowest plan that grants access (used for messaging)
 */

const FEATURE_MAP = {
  // Broadcast
  broadcast:        { flag: "canBroadcast",             label: "Broadcast Campaigns",          plan: "starter",    icon: Sparkles },
  schedule:         { flag: "canSchedule",              label: "Scheduled Broadcasts",         plan: "business",   icon: Sparkles },
  sequence:         { flag: "canBulkSequence",          label: "Multi-step Bulk Sequences",    plan: "enterprise", icon: Crown    },
  segment:          { flag: "canSegment",               label: "Audience Tag Segmentation",    plan: "business",   icon: Sparkles },
  campaignReports:  { flag: "hasCampaignReports",       label: "Campaign Performance Reports", plan: "business",   icon: BarChart2},

  // Storefront & Commerce
  storefront:       { flag: "storefrontEnabled",        label: "Online Storefront",            plan: "free",       icon: Store    },
  salesAnalytics:   { flag: "salesAnalyticsEnabled",    label: "Sales Analytics",              plan: "starter",    icon: BarChart2},
  orderReceipts:    { flag: "orderReceiptsEnabled",     label: "Order Receipts",               plan: "free",       icon: Sparkles },
  salesAlerts:      { flag: "salesAlertsEnabled",       label: "Sales Alerts",                 plan: "free",       icon: Sparkles },
  customDomain:     { flag: "customStorefrontDomain",   label: "Custom Storefront Domain",     plan: "enterprise", icon: Crown    },

  // AI features
  leadFollowup:     { flag: "leadFollowupEnabled",      label: "Smart Lead Follow-up",         plan: "starter",    icon: Bot      },
  leadQualify:      { flag: "leadQualificationEnabled", label: "Lead Qualification AI",        plan: "business",   icon: Bot      },
  productRec:       { flag: "productRecommendations",   label: "AI Product Recommendations",   plan: "business",   icon: Package  },

  // Branding & Team
  removeBranding:   { flag: "removeBranding",           label: "Remove Pax26 Branding",        plan: "starter",    icon: Sparkles },
};

const PLAN_COLORS = {
  free:       "#22c55e",
  starter:    "#38BDF8",
  business:   "#C9A84C",
  enterprise: "#A78BFA",
};

export default function PlanGate({ children, feature, requiredPlan, title }) {
  const { pax26, router } = useGlobalContext();
  const limits = usePlanLimits();

  // ── Resolve feature config ─────────────────────────────────
  const featureConfig = FEATURE_MAP[feature];

  let hasAccess = false;
  let featureLabel = title || "Premium Feature";
  let targetPlan = requiredPlan || "starter";
  let IconComponent = Sparkles;

  if (featureConfig) {
    hasAccess    = !!limits[featureConfig.flag];
    featureLabel = title || featureConfig.label;
    targetPlan   = requiredPlan || featureConfig.plan;
    IconComponent = featureConfig.icon || Sparkles;
  } else {
    // Generic plan-weight comparison
    const weight = { free: 0, starter: 1, business: 2, enterprise: 3 };
    hasAccess = (weight[limits.plan] ?? 0) >= (weight[targetPlan] ?? 1);
    IconComponent = targetPlan === "enterprise" ? Crown : Sparkles;
  }

  if (hasAccess) return <>{children}</>;

  const planName   = targetPlan.charAt(0).toUpperCase() + targetPlan.slice(1);
  const accentColor = PLAN_COLORS[targetPlan] || pax26?.primary || "#3b82f6";

  return (
    <div
      className="relative w-full h-full min-h-[250px] rounded-2xl overflow-hidden border"
      style={{ borderColor: pax26?.border }}
    >
      {/* Blurred stub content */}
      <div className="absolute inset-0 select-none pointer-events-none filter blur-[5px] opacity-20 p-6">
        <div className="w-full h-6 rounded bg-gray-400 mb-4" />
        <div className="w-3/4 h-6 rounded bg-gray-400 mb-6" />
        <div className="grid grid-cols-2 gap-4">
          <div className="h-20 rounded-xl bg-gray-500" />
          <div className="h-20 rounded-xl bg-gray-500" />
        </div>
      </div>

      {/* Paywall overlay */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 backdrop-blur-md"
        style={{ background: `${pax26?.bg}c8` }}
      >
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
          style={{
            background: `${accentColor}15`,
            color: accentColor,
            border: `1px solid ${accentColor}28`,
          }}
        >
          <IconComponent size={26} />
        </div>

        <h3
          className="font-extrabold text-lg tracking-tight mb-2"
          style={{ color: pax26?.textPrimary }}
        >
          Unlock {featureLabel}
        </h3>

        <p
          className="text-xs max-w-sm mb-6 leading-relaxed"
          style={{ color: pax26?.textSecondary, opacity: 0.75 }}
        >
          This feature requires the{" "}
          <span className="font-bold" style={{ color: accentColor }}>
            {planName} Plan
          </span>{" "}
          or higher. Upgrade to unlock it.
        </p>

        <button
          onClick={() => router.push("/dashboard/billing")}
          className="px-6 py-2.5 rounded-xl text-xs font-bold text-white transition-all hover:scale-[1.02] active:scale-100"
          style={{
            background: `linear-gradient(135deg, ${accentColor}, ${accentColor}bb)`,
            boxShadow: `0 8px 20px ${accentColor}30`,
          }}
        >
          Upgrade to {planName}
        </button>
      </div>
    </div>
  );
}
