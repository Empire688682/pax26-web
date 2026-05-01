"use client";

import React, { useEffect } from "react";
import { useGlobalContext } from "@/components/Context";
import Billing from "@/components/Billing/Billing";
import LoadingSpinner from "@/components/LoadingSpinner/LoadingSpinner";

export default function BillingPage() {
  const { userData, router } = useGlobalContext();

  useEffect(() => {
    if (userData === null) return;   // still loading
    if (!userData) router.push("/"); // not authenticated
  }, [userData]);

  if (!userData) return <LoadingSpinner />;

  return (
    <div className="min-h-screen px-4 py-6">
      <Billing />
    </div>
  );
}
