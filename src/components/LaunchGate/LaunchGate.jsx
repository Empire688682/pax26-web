"use client";

import { useState, useEffect } from "react";

/* ─────────────────────────────────────────────────────────
   CHANGE THIS to whatever key you want to share with testers.
   Change LAUNCH_DATE to your actual launch date.
───────────────────────────────────────────────────────── */
const ACCESS_KEY   = "pax26launch2026";
const LAUNCH_DATE  = new Date("2026-08-13T00:00:00.000Z");
const STORAGE_KEY  = "pax26_beta_access";

/* ── Countdown ────────────────────────────────────────── */
function useCountdown() {
  const calc = () => {
    const diff = Math.max(0, LAUNCH_DATE.getTime() - Date.now());
    return {
      days:    Math.floor(diff / 86400000),
      hours:   Math.floor((diff / 3600000) % 24),
      minutes: Math.floor((diff / 60000) % 60),
      seconds: Math.floor((diff / 1000) % 60),
    };
  };
  const [t, setT] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  useEffect(() => {
    setT(calc());
    const id = setInterval(() => setT(calc()), 1000);
    return () => clearInterval(id);
  }, []);
  return t;
}

const pad = (n) => String(n).padStart(2, "0");

function Unit({ value, label }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
      <div style={{
        width: "80px", height: "80px",
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "rgba(255,255,255,0.07)",
        border: "1px solid rgba(255,255,255,0.15)",
        borderRadius: "18px",
        fontSize: "clamp(28px, 5vw, 38px)",
        fontWeight: 900,
        color: "#fff",
        letterSpacing: "-0.04em",
        fontVariantNumeric: "tabular-nums",
        boxShadow: "0 4px 24px rgba(99,102,241,0.2)",
      }}>
        {pad(value)}
      </div>
      <span style={{
        fontSize: "10px", fontWeight: 700,
        color: "rgba(255,255,255,0.4)",
        textTransform: "uppercase", letterSpacing: "0.14em",
      }}>
        {label}
      </span>
    </div>
  );
}

/* ── Main Gate ────────────────────────────────────────── */
export default function LaunchGate({ children }) {
  const [unlocked, setUnlocked] = useState(null); // null = checking
  const [fading,   setFading]   = useState(false);
  const [key,      setKey]      = useState("");
  const [shake,    setShake]    = useState(false);
  const [hint,     setHint]     = useState("");
  const { days, hours, minutes, seconds } = useCountdown();

  // Check localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    setUnlocked(stored === "true");
  }, []);

  const tryUnlock = () => {
    if (key.trim() === ACCESS_KEY) {
      localStorage.setItem(STORAGE_KEY, "true");
      setFading(true);
      setTimeout(() => setUnlocked(true), 700);
    } else {
      setShake(true);
      setHint("Incorrect key — try again.");
      setTimeout(() => setShake(false), 500);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") tryUnlock();
  };

  // Still checking localStorage
  if (unlocked === null) return null;

  // Already unlocked — render app normally
  if (unlocked) return children;

  // Show gate
  return (
    <>
      {/* Gate overlay */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 99999,
        background: "linear-gradient(145deg, #06060f 0%, #10102a 40%, #0d1520 100%)",
        display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", padding: "32px 20px",
        fontFamily: "system-ui, -apple-system, sans-serif",
        opacity: fading ? 0 : 1,
        transition: "opacity 0.7s ease",
        pointerEvents: fading ? "none" : "auto",
        overflow: "hidden",
      }}>

        {/* Ambient glows */}
        <div style={{ position: "absolute", top: "-10%", left: "30%", width: "500px", height: "400px", background: "radial-gradient(ellipse, #6366f130 0%, transparent 65%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "-5%", right: "20%", width: "400px", height: "350px", background: "radial-gradient(ellipse, #8b5cf622 0%, transparent 65%)", pointerEvents: "none" }} />

        <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: "520px", textAlign: "center" }}>

          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", marginBottom: "40px" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 24px #6366f150" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
            </div>
            <span style={{ fontSize: "22px", fontWeight: 900, color: "#fff", letterSpacing: "-0.03em" }}>Pax26</span>
          </div>

          {/* Access key input — ABOVE the countdown */}
          <div style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "20px",
            padding: "24px 22px",
            marginBottom: "40px",
            animation: shake ? "gate-shake 0.4s ease" : "none",
          }}>
            <p style={{ margin: "0 0 5px", fontSize: "15px", fontWeight: 800, color: "#fff" }}>🔐 Enter your access key</p>
            <p style={{ margin: "0 0 18px", fontSize: "13px", color: "rgba(255,255,255,0.4)" }}>This app is in private beta. Ask the team for your key.</p>
            <div style={{ display: "flex", gap: "8px" }}>
              <input
                type="text"
                value={key}
                onChange={e => { setKey(e.target.value); setHint(""); }}
                onKeyDown={handleKeyDown}
                placeholder="Enter access key…"
                autoComplete="off"
                autoFocus
                style={{
                  flex: 1,
                  padding: "12px 16px",
                  borderRadius: "12px",
                  border: hint ? "1.5px solid #ef4444" : "1.5px solid rgba(255,255,255,0.15)",
                  background: "rgba(255,255,255,0.06)",
                  color: "#fff",
                  fontSize: "14px",
                  fontFamily: "inherit",
                  outline: "none",
                  transition: "border-color 0.2s",
                }}
              />
              <button
                onClick={tryUnlock}
                style={{
                  padding: "12px 20px",
                  borderRadius: "12px",
                  border: "none",
                  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                  color: "#fff",
                  fontWeight: 800,
                  fontSize: "14px",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  boxShadow: "0 4px 14px #6366f140",
                  transition: "opacity 0.15s",
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
                onMouseLeave={e => e.currentTarget.style.opacity = "1"}
              >
                Unlock →
              </button>
            </div>
            {hint && <p style={{ margin: "10px 0 0", fontSize: "12px", color: "#ef4444", textAlign: "left" }}>{hint}</p>}
          </div>

          {/* Divider */}
          <p style={{ margin: "0 0 28px", fontSize: "12px", color: "rgba(255,255,255,0.25)", textTransform: "uppercase", letterSpacing: "0.12em" }}>
            — Launching in —
          </p>

          {/* Countdown */}
          <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap", marginBottom: "40px" }}>
            <Unit value={days}    label="Days"    />
            <Unit value={hours}   label="Hours"   />
            <Unit value={minutes} label="Minutes" />
            <Unit value={seconds} label="Seconds" />
          </div>

          {/* Tagline */}
          <p style={{ margin: 0, fontSize: "14px", color: "rgba(255,255,255,0.35)", lineHeight: 1.6 }}>
            AI-powered WhatsApp automation for businesses.<br />Something big is coming.
          </p>

        </div>
      </div>

      {/* Keyframe for shake animation */}
      <style>{`
        @keyframes gate-shake {
          0%,100% { transform: translateX(0); }
          20%      { transform: translateX(-8px); }
          40%      { transform: translateX(8px); }
          60%      { transform: translateX(-6px); }
          80%      { transform: translateX(6px); }
        }
      `}</style>
    </>
  );
}
