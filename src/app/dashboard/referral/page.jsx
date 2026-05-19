"use client";

import React, { useEffect } from "react";
import { useGlobalContext } from "@/components/Context";
import LoadingSpinner from "@/components/LoadingSpinner/LoadingSpinner";
import ReferralDashboard from "@/components/ReferralDashboard/ReferralDashboard";

export default function ReferralPage() {
  const { userData, router, pax26 } = useGlobalContext();

  useEffect(() => {
    if (userData === null) return;   // still loading
    if (!userData) router.push("/"); // not authenticated
  }, [userData]);

  if (!userData) return <LoadingSpinner />;

  return (
    <div
      className="min-h-screen px-4 py-6 max-w-3xl mx-auto"
      style={{ color: pax26?.textPrimary }}
    >
      <ReferralDashboard />
    </div>
  );
}
