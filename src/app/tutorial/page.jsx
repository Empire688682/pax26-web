"use client";

import React from "react";
import MasterclassVideo from "@/components/MasterclassVideo/MasterclassVideo";
import { useGlobalContext } from "@/components/Context";

export default function TutorialPage() {
  const { pax26 } = useGlobalContext();

  return (
    <div style={{ background: pax26?.bg || "#0b0f17", minHeight: "100vh" }}>
      <div className="py-8">
        <MasterclassVideo />
      </div>
    </div>
  );
}
