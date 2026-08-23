"use client";

import React from "react";

/**
 * BackgroundFX — Ambient visual layer.
 *
 * PERFORMANCE NOTE: Previously used CSS `filter: blur()` which forces the
 * browser to composite heavy blur operations on the GPU every frame during
 * scroll and paint, causing significant mobile rasterization cost.
 *
 * Now uses pure CSS `radial-gradient` which is rendered in a single GPU
 * texture upload at paint time — identical visual result, zero repaint cost.
 */
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
      {/* ── Blob 1 — top-left (radial gradient, zero blur repaint cost) ── */}
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
          background: pax26.fxBlob1
            ? `radial-gradient(circle at 40% 40%, ${pax26.fxBlob1}, transparent 70%)`
            : "radial-gradient(circle at 40% 40%, rgba(59,130,246,0.18), transparent 70%)",
          transform: "translateZ(0)",
          transition: "background 0.4s ease",
          willChange: "transform",
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
          background: pax26.fxBlob2
            ? `radial-gradient(circle at 60% 60%, ${pax26.fxBlob2}, transparent 70%)`
            : "radial-gradient(circle at 60% 60%, rgba(99,102,241,0.15), transparent 70%)",
          transform: "translateZ(0)",
          transition: "background 0.4s ease",
          willChange: "transform",
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
          background: pax26.fxBlob3
            ? `radial-gradient(circle at 50% 50%, ${pax26.fxBlob3}, transparent 70%)`
            : "radial-gradient(circle at 50% 50%, rgba(139,92,246,0.12), transparent 70%)",
          transform: "translateZ(0)",
          transition: "background 0.4s ease",
          willChange: "transform",
        }}
      />

      {/* ── Line grid ──────────────────────────────────────── */}
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