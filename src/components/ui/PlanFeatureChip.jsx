"use client";

import React from "react";
import { useGlobalContext } from "@/components/Context";
import { usePlanLimits } from "@/app/hooks/usePlanLimits";
import { Lock, CheckCircle2 } from "lucide-react";

/**
 * PlanFeatureChip
 *
 * A small inline chip that shows whether a plan feature is active or locked.
 * Useful in settings panels, automation lists, and billing pages.
 *
 * Props:
 *   feature  - key from usePlanLimits (e.g. "leadFollowupEnabled")
 *   label    - display text (e.g. "Lead Follow-up")
 *   onClick  - optional click handler (defaults to /dashboard/billing if locked)
 */
export default function PlanFeatureChip({ feature, label, onClick }) {
  const { pax26, router } = useGlobalContext();
  const limits = usePlanLimits();

  const isEnabled = !!limits[feature];

  const GREEN = "#22c55e";
  const GRAY  = "#94a3b8";

  const handleClick = () => {
    if (onClick) { onClick(); return; }
    if (!isEnabled) router.push("/dashboard/billing");
  };

  return (
    <button
      onClick={handleClick}
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold transition-all hover:opacity-80"
      style={{
        background:   isEnabled ? `${GREEN}12`  : `${GRAY}10`,
        color:        isEnabled ? GREEN          : GRAY,
        border:       `1px solid ${isEnabled ? `${GREEN}30` : `${GRAY}22`}`,
        cursor:       isEnabled ? "default"      : "pointer",
      }}
      title={isEnabled ? `${label} is active on your plan` : `${label} requires an upgrade`}
    >
      {isEnabled
        ? <CheckCircle2 size={10} />
        : <Lock size={10} />
      }
      {label}
    </button>
  );
}
