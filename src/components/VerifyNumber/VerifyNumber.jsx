"use client";

import React, { useState, useRef } from "react";
import { useGlobalContext } from "../Context";
import { Phone, ShieldCheck, CheckCircle2, AlertCircle, ArrowRight, RotateCcw, KeyRound } from "lucide-react";

/* ── Keyframes + font ─────────────────────────────────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Syne:wght@600;700;800&display=swap');

  .vn-root { font-family: 'Syne', sans-serif; }
  .vn-mono { font-family: 'DM Mono', monospace; }

  @keyframes vn-slide { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
  @keyframes vn-spin  { to{transform:rotate(360deg)} }
  @keyframes vn-glow  { 0%,100%{opacity:0.12} 50%{opacity:0.22} }
  @keyframes vn-fade  { from{opacity:0;transform:translateY(4px)} to{opacity:1;transform:translateY(0)} }
  @keyframes vn-step-in {
    from { opacity:0; transform:translateX(20px); }
    to   { opacity:1; transform:translateX(0); }
  }

  .vn-s1     { animation: vn-slide  0.4s ease both; }
  .vn-step   { animation: vn-step-in 0.35s cubic-bezier(0.22,1,0.36,1) both; }
  .vn-fade   { animation: vn-fade   0.25s ease both; }
  .vn-spin   { animation: vn-spin   0.75s linear infinite; }
  .vn-glow   { animation: vn-glow   5s ease-in-out infinite; }

  .vn-input  { transition: border-color 0.18s ease, box-shadow 0.18s ease; }
  .vn-input:focus { outline: none; }

  .vn-btn { transition: opacity 0.15s ease, transform 0.15s ease; }
  .vn-btn:hover:not(:disabled) { opacity: 0.87; transform: translateY(-1px); }
  .vn-btn:disabled { opacity: 0.45; cursor: not-allowed; }

  /* OTP digit boxes */
  .vn-otp-box {
    transition: border-color 0.18s ease, box-shadow 0.18s ease;
    text-align: center;
    caret-color: transparent;
  }
  .vn-otp-box:focus { outline: none; }
`;

const GREEN = "#22c55e";

export default function VerifyNumber() {
  const { pax26 } = useGlobalContext();
  const primary = pax26?.primary || "#3b82f6";

  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp]                 = useState(["", "", "", "", "", ""]);
  const [step, setStep]               = useState("enterNumber"); // enterNumber | enterOtp | success
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState("");
  const [focused, setFocused]         = useState(false);

  const otpRefs = useRef([]);

  /* ── OTP digit change ── */
  const handleOtpChange = (val, idx) => {
    const digits = val.replace(/\D/g, "").slice(0, 1);
    const next   = [...otp];
    next[idx]    = digits;
    setOtp(next);
    if (digits && idx < 5) otpRefs.current[idx + 1]?.focus();
  };

  const handleOtpKeyDown = (e, idx) => {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) {
      otpRefs.current[idx - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const next   = [...otp];
    pasted.split("").forEach((d, i) => { next[i] = d; });
    setOtp(next);
    otpRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const otpValue = otp.join("");

  /* ── Send OTP ── */
  const handleSendOtp = async () => {
    if (!phoneNumber) return setError("Please enter your phone number.");
    setLoading(true); setError("");
    try {
      const res  = await fetch("/api/auth/initiate-verify-number", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || "Failed to send OTP."); return; }
      setStep("enterOtp");
    } catch { setError("Something went wrong. Try again."); }
    finally { setLoading(false); }
  };

  /* ── Verify OTP ── */
  const handleVerifyOtp = async () => {
    if (otpValue.length < 6) return setError("Please enter the full 6-digit OTP.");
    setLoading(true); setError("");
    try {
      const res  = await fetch("/api/verify-phone/confirm", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otp: otpValue }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || "Invalid OTP. Try again."); return; }
      setStep("success");
    } catch { setError("Verification failed. Try again."); }
    finally { setLoading(false); }
  };

  return (
    <>
      <style>{CSS}</style>
      <section className="vn-root min-h-screen flex items-center justify-center px-5 py-16 relative overflow-hidden"
        style={{ background: pax26?.secondaryBg }}>

        {/* bg orbs */}
        <div className="vn-glow absolute -top-20 -left-20 w-72 h-72 rounded-full pointer-events-none"
          style={{ background: primary, filter: "blur(90px)" }} />
        <div className="vn-glow absolute -bottom-20 -right-20 w-64 h-64 rounded-full pointer-events-none"
          style={{ background: GREEN, filter: "blur(80px)", animationDelay: "2s" }} />

        <div className="vn-s1 relative w-full max-w-sm">

          {/* ── Step indicator ──────────────────────────── */}
          <div className="flex items-center gap-2 mb-6 justify-center">
            {["enterNumber", "enterOtp", "success"].map((s, i) => {
              const steps  = ["enterNumber", "enterOtp", "success"];
              const done   = steps.indexOf(step) > i;
              const active = step === s;
              return (
                <React.Fragment key={s}>
                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold"
                      style={{
                        background: done ? GREEN : active ? primary : `${pax26?.border}`,
                        color: done || active ? "#fff" : pax26?.textSecondary,
                      }}>
                      {done ? <CheckCircle2 size={12} /> : i + 1}
                    </div>
                    <span className="vn-mono text-[10px] hidden sm:block"
                      style={{ color: active ? primary : pax26?.textSecondary, opacity: active ? 1 : 0.45 }}>
                      {["Phone", "OTP", "Done"][i]}
                    </span>
                  </div>
                  {i < 2 && (
                    <div className="h-px flex-1 max-w-8"
                      style={{ background: steps.indexOf(step) > i ? GREEN : pax26?.border }} />
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* ── Card ────────────────────────────────────── */}
          <div className="rounded-2xl overflow-hidden shadow-2xl"
            style={{ background: pax26?.bg, border: `1px solid ${pax26?.border}` }}>

            {/* top strip */}
            <div className="h-1 w-full"
              style={{ background: `linear-gradient(90deg, ${primary}, ${primary}55, transparent)` }} />

            {/* card header */}
            <div className="flex items-center gap-3 px-6 py-5"
              style={{ borderBottom: `1px solid ${pax26?.border}` }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{
                  background: step === "success" ? "rgba(34,197,94,0.12)" : `${primary}15`,
                  color: step === "success" ? GREEN : primary,
                }}>
                {step === "success" ? <CheckCircle2 size={17} /> : step === "enterOtp" ? <KeyRound size={17} /> : <Phone size={17} />}
              </div>
              <div>
                <p className="text-sm font-bold" style={{ color: pax26?.textPrimary }}>
                  {step === "enterNumber" ? "Add Phone Number"
                    : step === "enterOtp" ? "Enter OTP"
                    : "Verified!"}
                </p>
                <p className="vn-mono text-[10px]" style={{ color: pax26?.textSecondary, opacity: 0.45 }}>
                  {step === "enterNumber" ? "We'll send a verification code"
                    : step === "enterOtp" ? `Code sent to ${phoneNumber}`
                    : "Phone number added successfully"}
                </p>
              </div>
            </div>

            <div className="p-6 space-y-4">

              {/* ── Step: Enter phone ─────────────────── */}
              {step === "enterNumber" && (
                <div className="vn-step space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-widest mb-2"
                      style={{ color: pax26?.textSecondary, opacity: 0.5 }}>
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                        style={{ color: pax26?.textSecondary, opacity: 0.35 }} />
                      <input
                        type="tel" value={phoneNumber}
                        onChange={e => setPhoneNumber(e.target.value)}
                        placeholder="e.g. 2348012345678"
                        className="vn-input vn-mono w-full pl-9 pr-4 py-3 rounded-xl text-sm"
                        style={{
                          background: pax26?.secondaryBg, color: pax26?.textPrimary,
                          border: `1px solid ${focused ? primary : pax26?.border}`,
                          boxShadow: focused ? `0 0 0 3px ${primary}15` : "none",
                        }}
                        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
                        onKeyDown={e => e.key === "Enter" && handleSendOtp()}
                      />
                    </div>
                    <p className="vn-mono text-[10px] mt-1.5" style={{ color: pax26?.textSecondary, opacity: 0.4 }}>
                      Include country code, e.g. 234 for Nigeria
                    </p>
                  </div>

                  {error && (
                    <div className="vn-fade flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold"
                      style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#ef4444" }}>
                      <AlertCircle size={12} /> {error}
                    </div>
                  )}

                  <button onClick={handleSendOtp} disabled={loading || !phoneNumber}
                    className="vn-btn w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold text-white"
                    style={{
                      background: loading || !phoneNumber ? `${primary}55` : primary,
                      boxShadow: loading || !phoneNumber ? "none" : `0 10px 28px ${primary}38`,
                    }}>
                    {loading
                      ? <><div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white vn-spin" />Sending OTP…</>
                      : <>Send OTP <ArrowRight size={15} /></>
                    }
                  </button>
                </div>
              )}

              {/* ── Step: Enter OTP ───────────────────── */}
              {step === "enterOtp" && (
                <div className="vn-step space-y-5">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-widest mb-3"
                      style={{ color: pax26?.textSecondary, opacity: 0.5 }}>
                      6-Digit Code
                    </label>

                    {/* OTP digit boxes */}
                    <div className="flex gap-2 justify-between" onPaste={handleOtpPaste}>
                      {otp.map((digit, i) => (
                        <input
                          key={i}
                          ref={el => otpRefs.current[i] = el}
                          type="text" inputMode="numeric" maxLength={1}
                          value={digit}
                          onChange={e => handleOtpChange(e.target.value, i)}
                          onKeyDown={e => handleOtpKeyDown(e, i)}
                          className="vn-otp-box vn-mono w-12 h-14 rounded-xl text-xl font-bold"
                          style={{
                            background: pax26?.secondaryBg,
                            color: pax26?.textPrimary,
                            border: `1.5px solid ${digit ? primary : pax26?.border}`,
                            boxShadow: digit ? `0 0 0 3px ${primary}15` : "none",
                          }}
                        />
                      ))}
                    </div>

                    <p className="vn-mono text-[10px] mt-2" style={{ color: pax26?.textSecondary, opacity: 0.4 }}>
                      Enter the 6-digit code sent to your phone
                    </p>
                  </div>

                  {error && (
                    <div className="vn-fade flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold"
                      style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#ef4444" }}>
                      <AlertCircle size={12} /> {error}
                    </div>
                  )}

                  <button onClick={handleVerifyOtp} disabled={loading || otpValue.length < 6}
                    className="vn-btn w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold text-white"
                    style={{
                      background: otpValue.length === 6 && !loading ? GREEN : `${GREEN}55`,
                      boxShadow: otpValue.length === 6 && !loading ? "0 10px 28px rgba(34,197,94,0.35)" : "none",
                    }}>
                    {loading
                      ? <><div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white vn-spin" />Verifying…</>
                      : <><ShieldCheck size={15} /> Verify Number</>
                    }
                  </button>

                  {/* resend link */}
                  <div className="flex items-center justify-center gap-2 pt-1">
                    <button
                      onClick={() => { setStep("enterNumber"); setOtp(["","","","","",""]); setError(""); }}
                      className="vn-btn flex items-center gap-1.5 text-xs font-semibold"
                      style={{ color: pax26?.textSecondary, opacity: 0.6 }}>
                      <RotateCcw size={11} /> Change number or resend
                    </button>
                  </div>
                </div>
              )}

              {/* ── Step: Success ─────────────────────── */}
              {step === "success" && (
                <div className="vn-step flex flex-col items-center text-center py-4 gap-4">
                  <div className="relative">
                    <div className="absolute inset-0 rounded-full"
                      style={{ background: "rgba(34,197,94,0.15)", animation: "vn-glow 2s ease-in-out infinite" }} />
                    <div className="relative w-16 h-16 rounded-full flex items-center justify-center"
                      style={{ background: "rgba(34,197,94,0.12)", border: "2px solid rgba(34,197,94,0.3)" }}>
                      <CheckCircle2 size={30} style={{ color: GREEN }} />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base font-extrabold mb-1" style={{ color: pax26?.textPrimary }}>
                      Number Verified!
                    </h3>
                    <p className="vn-mono text-xs font-medium" style={{ color: GREEN }}>
                      {phoneNumber}
                    </p>
                    <p className="text-xs mt-2" style={{ color: pax26?.textSecondary, opacity: 0.6 }}>
                      Your phone number has been added to your account.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* security note */}
          <div className="flex items-center justify-center gap-1.5 mt-5">
            <ShieldCheck size={11} style={{ color: pax26?.textSecondary, opacity: 0.35 }} />
            <p className="vn-mono text-[10px]" style={{ color: pax26?.textSecondary, opacity: 0.35 }}>
              Secured · We never share your number
            </p>
          </div>

        </div>
      </section>
    </>
  );
}