"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

const PLAY_STORE_URL =
  "https://play.google.com/store/apps/details?id=com.jayempire.pax26mobile";

export default function FloatingAppBadge() {
  const [visible, setVisible] = useState(false);

  // Show after user scrolls 200px so it doesn't clash with the hero
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 200);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <Link
      href={PLAY_STORE_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Download Pax26 on Google Play"
      style={{
        position: "fixed",
        bottom: 88,          /* sits above MobileBottomNav on mobile */
        right: 16,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "8px 14px 8px 10px",
        borderRadius: 14,
        background: "rgba(10,20,40,0.88)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        border: "1px solid rgba(52,211,153,0.28)",
        boxShadow: "0 8px 28px rgba(0,0,0,0.35), 0 0 0 1px rgba(52,211,153,0.12)",
        textDecoration: "none",
        cursor: "pointer",
        transition: "opacity 0.3s ease, transform 0.3s ease",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(12px)",
        pointerEvents: visible ? "auto" : "none",
      }}
    >
      {/* Play Store badge image */}
      <Image
        src="/playstore.webp"
        alt="Google Play"
        width={20}
        height={20}
        style={{ width: 20, height: 20, objectFit: "contain", flexShrink: 0 }}
      />
      <div style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
        <span style={{
          fontSize: 8,
          fontWeight: 600,
          color: "rgba(255,255,255,0.55)",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
        }}>
          Get it on
        </span>
        <span style={{
          fontSize: 12,
          fontWeight: 800,
          color: "#fff",
          letterSpacing: "-0.01em",
          whiteSpace: "nowrap",
        }}>
          Google Play
        </span>
      </div>
    </Link>
  );
}
