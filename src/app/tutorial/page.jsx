"use client";

import React from "react";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import MasterclassVideo from "@/components/MasterclassVideo/MasterclassVideo";
import { useGlobalContext } from "@/components/Context";

export default function TutorialPage() {
  const { pax26 } = useGlobalContext();

  return (
    <div style={{ background: pax26?.bg || "#0b0f17", minHeight: "100vh" }}>
      <Header />
      <div className="py-8">
        <MasterclassVideo />
      </div>
      <Footer />
    </div>
  );
}
