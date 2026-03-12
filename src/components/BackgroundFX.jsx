"use client";

import React from "react";

const BackgroundFX = ({ pax26 }) => {
  if (!pax26) return null;

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        overflow: "hidden",
        background: pax26.bg,
        transition: "background 0.4s ease",
      }}
    >
      {/* ── Blob 1 — top-left ─────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          top: "-10%",
          left: "-5%",
          width: "55vw",
          height: "55vw",
          maxWidth: 800,
          maxHeight: 800,
          borderRadius: "50%",
          background: pax26.fxBlob1,
          filter: "blur(100px)",
          transform: "translateZ(0)",
          transition: "background 0.4s ease",
        }}
      />

      {/* ── Blob 2 — bottom-right ─────────────────────────── */}
      <div
        style={{
          position: "absolute",
          bottom: "-15%",
          right: "-10%",
          width: "60vw",
          height: "60vw",
          maxWidth: 900,
          maxHeight: 900,
          borderRadius: "50%",
          background: pax26.fxBlob2,
          filter: "blur(120px)",
          transform: "translateZ(0)",
          transition: "background 0.4s ease",
        }}
      />

      {/* ── Blob 3 — centre ───────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          top: "35%",
          left: "40%",
          width: "40vw",
          height: "40vw",
          maxWidth: 600,
          maxHeight: 600,
          borderRadius: "50%",
          background: pax26.fxBlob3,
          filter: "blur(90px)",
          transform: "translateZ(0)",
          transition: "background 0.4s ease",
        }}
      />

      {/* ── Line grid (same as SelectPhone) ───────────────── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            linear-gradient(${pax26.fxGrid} 1px, transparent 1px),
            linear-gradient(90deg, ${pax26.fxGrid} 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
          transition: "background-image 0.4s ease",
        }}
      />
    </div>
  );
};

export default BackgroundFX;