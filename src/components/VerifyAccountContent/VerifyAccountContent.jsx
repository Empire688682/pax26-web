"use client";

import { useState, useEffect, useRef } from "react";
import { useGlobalContext } from "../Context";
import { Mail, CheckCircle2, AlertCircle, RefreshCw, ArrowRight, ShieldCheck } from "lucide-react";

/* ── CSS ─────────────────────────────────────────────────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Syne:wght@600;700;800&display=swap');

  .va-root { font-family: 'Syne', sans-serif; }
  .va-mono { font-family: 'DM Mono', monospace; }

  @keyframes va-slide  { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
  @keyframes va-glow   { 0%,100%{opacity:0.12} 50%{opacity:0.24} }
  @keyframes va-spin   { to{transform:rotate(360deg)} }
  @keyframes va-shake  {
    0%,100%{transform:translateX(0)}
    20%{transform:translateX(-6px)}
    40%{transform:translateX(6px)}
    60%{transform:translateX(-4px)}
    80%{transform:translateX(4px)}
  }
  @keyframes va-success {
    0%  { transform:scale(0) rotate(-20deg); opacity:0; }
    60% { transform:scale(1.15) rotate(3deg); opacity:1; }
    100%{ transform:scale(1) rotate(0); opacity:1; }
  }
  @keyframes va-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
  @keyframes va-pulse-ring {
    0%   { box-shadow: 0 0 0 0 rgba(59,130,246,0.4); }
    70%  { box-shadow: 0 0 0 12px rgba(59,130,246,0); }
    100% { box-shadow: 0 0 0 0 rgba(59,130,246,0); }
  }
  @keyframes va-countdown { from{width:100%} to{width:0%} }

  .va-s1 { animation: va-slide 0.4s ease both; }
  .va-s2 { animation: va-slide 0.4s ease 0.08s both; }
  .va-s3 { animation: va-slide 0.4s ease 0.16s both; }
  .va-s4 { animation: va-slide 0.4s ease 0.24s both; }

  .va-glow    { animation: va-glow    4s ease-in-out infinite; }
  .va-float   { animation: va-float   3s ease-in-out infinite; }
  .va-spin    { animation: va-spin    0.75s linear   infinite; }
  .va-shake   { animation: va-shake   0.4s ease; }
  .va-success-icon { animation: va-success 0.45s cubic-bezier(0.22,1,0.36,1) both; }
  .va-pulse-ring { animation: va-pulse-ring 1.5s ease-out infinite; }

  /* OTP box */
  .va-otp-box {
    width: 52px; height: 60px;
    border-radius: 14px;
    border: 1.5px solid rgba(0,0,0,0.1);
    background: #f8fafc;
    font-family: 'DM Mono', monospace;
    font-size: 1.5rem; font-weight: 700;
    text-align: center;
    color: #111827;
    caret-color: #3b82f6;
    transition: border-color 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
    outline: none;
  }
  .va-otp-box:focus {
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59,130,246,0.15);
    background: #fff;
  }
  .va-otp-box.filled {
    border-color: #3b82f6;
    background: rgba(59,130,246,0.05);
  }
  .va-otp-box.error {
    border-color: #ef4444;
    box-shadow: 0 0 0 3px rgba(239,68,68,0.12);
    background: rgba(239,68,68,0.04);
  }

  .va-btn-primary {
    transition: opacity 0.15s ease, transform 0.15s ease, box-shadow 0.15s ease;
    cursor: pointer;
  }
  .va-btn-primary:hover:not(:disabled) {
    opacity: 0.9; transform: translateY(-2px);
    box-shadow: 0 16px 40px rgba(59,130,246,0.4) !important;
  }
  .va-btn-primary:disabled { opacity: 0.45; cursor: not-allowed; transform: none !important; }

  .va-btn-ghost {
    transition: all 0.15s ease; cursor: pointer;
  }
  .va-btn-ghost:hover:not(:disabled) {
    background: rgba(59,130,246,0.07) !important;
    color: #3b82f6 !important;
    border-color: rgba(59,130,246,0.25) !important;
  }
  .va-btn-ghost:disabled { opacity: 0.4; cursor: not-allowed; }

  .va-countdown-bar {
    animation: va-countdown 60s linear forwards;
  }
`;

export default function VerifyAccountContent() {
  const { router, pax26, userData, fetchUser } = useGlobalContext();

  const [digits, setDigits]   = useState(["", "", "", "", "", ""]);
  const [action, setAction]   = useState(""); // "verify" | "resend" | ""
  const [status, setStatus]   = useState(""); // "success" | "error" | ""
  const [message, setMessage] = useState("");
  const [shake, setShake]     = useState(false);
  const [cooldown, setCooldown] = useState(false); // resend cooldown
  const [cooldownSecs, setCooldownSecs] = useState(0);

  const inputRefs = useRef([]);

  /* ── redirect if already verified ──────────────────────────────── */
  useEffect(() => {
    if (userData?.userVerify) router.push("/dashboard");
  }, [userData]);

  /* ── auto-focus first box on mount ─────────────────────────────── */
  useEffect(() => { inputRefs.current[0]?.focus(); }, []);

  /* ── cooldown timer ─────────────────────────────────────────────── */
  useEffect(() => {
    if (!cooldown) return;
    setCooldownSecs(60);
    const interval = setInterval(() => {
      setCooldownSecs(s => {
        if (s <= 1) { clearInterval(interval); setCooldown(false); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldown]);

  /* ── handle digit input ─────────────────────────────────────────── */
  const handleDigitChange = (idx, val) => {
    const char = val.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[idx]  = char;
    setDigits(next);
    setStatus(""); setMessage("");
    if (char && idx < 5) inputRefs.current[idx + 1]?.focus();
    // auto-submit when all 6 filled
    if (char && idx === 5 && next.every(d => d)) {
      verifyCode(next.join(""));
    }
  };

  const handleKeyDown = (idx, e) => {
    if (e.key === "Backspace") {
      if (digits[idx]) {
        const next = [...digits]; next[idx] = ""; setDigits(next);
      } else if (idx > 0) {
        inputRefs.current[idx - 1]?.focus();
      }
    }
    if (e.key === "ArrowLeft"  && idx > 0) inputRefs.current[idx - 1]?.focus();
    if (e.key === "ArrowRight" && idx < 5) inputRefs.current[idx + 1]?.focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const next = [...digits];
    pasted.split("").forEach((c, i) => { if (i < 6) next[i] = c; });
    setDigits(next);
    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
    if (pasted.length === 6) verifyCode(pasted);
  };

  /* ── verify code ────────────────────────────────────────────────── */
  const verifyCode = async (code) => {
    if (code.length !== 6) {
      triggerShake(); setMessage("Please enter all 6 digits."); setStatus("error");
      return;
    }
    try {
      setAction("verify"); setMessage(""); setStatus("");
      const res  = await fetch("/api/auth/email-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (!res.ok) {
        triggerShake();
        setMessage(data.message || "Invalid or expired code. Please try again.");
        setStatus("error");
        setDigits(["", "", "", "", "", ""]);
        setTimeout(() => inputRefs.current[0]?.focus(), 50);
        return;
      }
      setStatus("success");
      setMessage("Email verified! Redirecting…");
      await fetchUser();
      setTimeout(() => router.push("/dashboard"), 1200);
    } catch {
      triggerShake();
      setMessage("Something went wrong. Please try again.");
      setStatus("error");
    } finally {
      setAction("");
    }
  };

  /* ── resend code ────────────────────────────────────────────────── */
  const sendVerificationCode = async () => {
    if (cooldown) return;
    try {
      setAction("resend"); setMessage(""); setStatus("");
      const res  = await fetch("/api/auth/send-email-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      router.replace("/verify-user");
      if (!res.ok) {
        setMessage(data.message || "Unable to resend. Please try again.");
        setStatus("error");
        return;
      }
      setMessage(`Code sent to ${userData?.email || "your email"}.`);
      setStatus("success");
      setCooldown(true);
      setDigits(["", "", "", "", "", ""]);
      setTimeout(() => inputRefs.current[0]?.focus(), 50);
    } catch {
      setMessage("Something went wrong. Please try again.");
      setStatus("error");
    } finally {
      setAction("");
    }
  };

  const triggerShake = () => {
    setShake(true); setTimeout(() => setShake(false), 500);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    verifyCode(digits.join(""));
  };

  const isVerifying = action === "verify";
  const isResending = action === "resend";
  const allFilled   = digits.every(d => d);

  return (
    <>
      <style>{CSS}</style>
      <div className="va-root" style={{
        minHeight: "100vh",
        background: pax26?.secondaryBg || "#f8fafc",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "24px 16px",
        position: "relative", overflow: "hidden",
      }}>

        {/* bg glow orbs */}
        <div className="va-glow" style={{
          position: "absolute", top: "-80px", left: "50%",
          transform: "translateX(-50%)",
          width: "400px", height: "400px", borderRadius: "50%",
          background: "#3b82f6", filter: "blur(100px)",
          pointerEvents: "none", zIndex: 0,
        }} />

        <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: "420px" }}>

          {/* ── Card ──────────────────────────────────── */}
          <div style={{
            background: pax26?.card || "#fff",
            border: "1px solid rgba(0,0,0,0.07)",
            borderRadius: "24px",
            overflow: "hidden",
            boxShadow: "0 24px 64px rgba(0,0,0,0.1)",
          }}>

            {/* blue top strip */}
            <div style={{
              height: "3px",
              background: status === "success"
                ? "linear-gradient(90deg,#22c55e,rgba(34,197,94,0.3),transparent)"
                : "linear-gradient(90deg,#3b82f6,rgba(59,130,246,0.3),transparent)",
              transition: "background 0.4s ease",
            }} />

            <div style={{ padding: "36px 32px 32px" }}>

              {/* icon */}
              <div className="va-s1" style={{ display: "flex", justifyContent: "center", marginBottom: "24px" }}>
                <div className={`${status === "success" ? "va-success-icon" : "va-float va-pulse-ring"}`}
                  style={{
                    width: "64px", height: "64px", borderRadius: "20px",
                    background: status === "success" ? "rgba(34,197,94,0.12)" : "rgba(59,130,246,0.1)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "background 0.3s ease",
                  }}>
                  {status === "success"
                    ? <CheckCircle2 size={30} style={{ color: "#22c55e" }} />
                    : <Mail size={28} style={{ color: "#3b82f6" }} />
                  }
                </div>
              </div>

              {/* headline */}
              <div className="va-s1" style={{ textAlign: "center", marginBottom: "8px" }}>
                <h1 style={{
                  fontFamily: "'Syne',sans-serif",
                  fontSize: "1.5rem", fontWeight: 800,
                  color: pax26?.textPrimary || "#111827",
                  lineHeight: 1.15, marginBottom: "10px",
                }}>
                  {status === "success" && action === "" ? "Email Verified!" : "Verify Your Email"}
                </h1>
                <p style={{
                  fontSize: "0.875rem", lineHeight: 1.7,
                  color: pax26?.textSecondary || "rgba(0,0,0,0.5)",
                }}>
                  Enter the <strong style={{ color: pax26?.textPrimary || "#111827" }}>6-digit code</strong> sent to{" "}
                  <span style={{ color: "#3b82f6", fontWeight: 600 }}>
                    {userData?.email || "your email address"}
                  </span>
                </p>
              </div>

              {/* spam hint */}
              <div className="va-s2" style={{
                display: "flex", alignItems: "center", gap: "7px",
                padding: "8px 14px", borderRadius: "10px", marginBottom: "28px",
                background: "rgba(245,158,11,0.07)", border: "1px solid rgba(245,158,11,0.2)",
                justifyContent: "center",
              }}>
                <ShieldCheck size={12} style={{ color: "#f59e0b", flexShrink: 0 }} />
                <p className="va-mono" style={{ fontSize: "10px", color: "#d97706", letterSpacing: "0.03em" }}>
                  Can't find it? Check your spam folder.
                </p>
              </div>

              {/* OTP inputs */}
              <form onSubmit={handleSubmit}>
                <div className={`va-s2 ${shake ? "va-shake" : ""}`}
                  style={{ display: "flex", justifyContent: "center", gap: "10px", marginBottom: "24px" }}>
                  {digits.map((d, i) => (
                    <input
                      key={i}
                      ref={el => inputRefs.current[i] = el}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={d}
                      className={`va-otp-box ${d ? "filled" : ""} ${status === "error" ? "error" : ""}`}
                      onChange={e => handleDigitChange(i, e.target.value)}
                      onKeyDown={e => handleKeyDown(i, e)}
                      onPaste={i === 0 ? handlePaste : undefined}
                      disabled={isVerifying}
                      style={{ opacity: isVerifying ? 0.7 : 1, color: isVerifying ? "rgba(54, 51, 51, 0.3)" : pax26?.textPrimary || "#111827" }}
                    />
                  ))}
                </div>

                {/* feedback message */}
                {message && (
                  <div className="va-s3" style={{
                    display: "flex", alignItems: "flex-start", gap: "8px",
                    padding: "10px 14px", borderRadius: "12px", marginBottom: "16px",
                    background: status === "success" ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.08)",
                    border: `1px solid ${status === "success" ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)"}`,
                  }}>
                    {status === "success"
                      ? <CheckCircle2 size={14} style={{ color: "#22c55e", flexShrink: 0, marginTop: "1px" }} />
                      : <AlertCircle  size={14} style={{ color: "#ef4444", flexShrink: 0, marginTop: "1px" }} />
                    }
                    <p style={{
                      fontSize: "0.83rem", lineHeight: 1.55,
                      color: status === "success" ? "#22c55e" : "#ef4444",
                    }}>
                      {message}
                    </p>
                  </div>
                )}

                {/* verify button */}
                <button
                  type="submit"
                  disabled={isVerifying || isResending || status === "success"}
                  className="va-btn-primary va-s3"
                  style={{
                    width: "100%", padding: "15px 24px",
                    borderRadius: "14px", border: "none",
                    background: status === "success" ? "#22c55e" : "#3b82f6",
                    color: "#fff",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                    fontFamily: "'Syne',sans-serif", fontSize: "15px", fontWeight: 700,
                    boxShadow: status === "success"
                      ? "0 10px 32px rgba(34,197,94,0.35)"
                      : "0 10px 32px rgba(59,130,246,0.35)",
                    marginBottom: "12px",
                    transition: "background 0.3s ease, box-shadow 0.3s ease",
                  }}>
                  {isVerifying ? (
                    <>
                      <div className="va-spin" style={{
                        width: "18px", height: "18px", borderRadius: "50%",
                        border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff",
                      }} />
                      Verifying…
                    </>
                  ) : status === "success" ? (
                    <><CheckCircle2 size={17} /> Verified!</>
                  ) : (
                    <>Verify Code <ArrowRight size={16} /></>
                  )}
                </button>
              </form>

              {/* divider */}
              <div className="va-s4" style={{
                display: "flex", alignItems: "center", gap: "12px", margin: "4px 0 12px",
              }}>
                <div style={{ flex: 1, height: "1px", background: "rgba(0,0,0,0.07)" }} />
                <span className="va-mono" style={{ fontSize: "10px", color: pax26.textPrimary, letterSpacing: "0.08em" }}>OR</span>
                <div style={{ flex: 1, height: "1px", background: "rgba(0,0,0,0.07)" }} />
              </div>

              {/* resend button */}
              <button
                onClick={sendVerificationCode}
                disabled={isVerifying || isResending || cooldown}
                className="va-btn-ghost va-s4"
                style={{
                  width: "100%", padding: "13px 24px",
                  borderRadius: "14px", border: `1px solid ${pax26?.border || "rgba(0,0,0,0.09)"}`,
                  background: "transparent",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                  fontFamily: "'Syne',sans-serif", fontSize: "13px", fontWeight: 600,
                  color: pax26?.textSecondary || "rgba(0,0,0,0.5)",
                  cursor: cooldown ? "not-allowed" : "pointer",
                  position: "relative", overflow: "hidden",
                }}>

                {/* cooldown progress bar */}
                {cooldown && (
                  <div className="va-countdown-bar" style={{
                    position: "absolute", bottom: 0, left: 0,
                    height: "2px", background: "rgba(59,130,246,0.3)",
                  }} />
                )}

                {isResending ? (
                  <>
                    <div className="va-spin" style={{
                      width: "14px", height: "14px", borderRadius: "50%",
                      border: "2px solid rgba(0,0,0,0.15)", borderTopColor: "#3b82f6",
                    }} />
                    Sending code…
                  </>
                ) : cooldown ? (
                  <><RefreshCw size={14} /> Resend in {cooldownSecs}s</>
                ) : (
                  <><RefreshCw size={14} /> Resend Verification Code</>
                )}
              </button>

            </div>
          </div>

          {/* footer */}
          <p className="va-mono va-s4" style={{
            textAlign: "center", marginTop: "16px",
            fontSize: "10px", color: "rgba(0,0,0,0.3)",
            letterSpacing: "0.06em",
          }}>
            © 2025 PAX26 TECHNOLOGIES · Secure Verification
          </p>

        </div>
      </div>
    </>
  );
}