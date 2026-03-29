'use client';

import React, { useState, useRef } from 'react';
import { useGlobalContext } from '../Context';
import { Lock, ShieldCheck, CheckCircle2, AlertCircle, X } from 'lucide-react';

/* ── Keyframes + font ─────────────────────────────────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Syne:wght@600;700;800&display=swap');

  .tp-root { font-family: 'Syne', sans-serif; }
  .tp-mono { font-family: 'DM Mono', monospace; }

  @keyframes tp-spin  { to{transform:rotate(360deg)} }
  @keyframes tp-glow  { 0%,100%{opacity:0.12} 50%{opacity:0.24} }
  @keyframes tp-fade  { from{opacity:0;transform:translateY(4px)} to{opacity:1;transform:translateY(0)} }
  @keyframes tp-check {
    0%   { transform:scale(0) rotate(-30deg); opacity:0; }
    60%  { transform:scale(1.2) rotate(5deg); opacity:1; }
    100% { transform:scale(1) rotate(0); }
  }
  @keyframes tp-shake {
    0%,100% { transform:translateX(0); }
    20%,60% { transform:translateX(-5px); }
    40%,80% { transform:translateX(5px); }
  }

  .tp-spin   { animation: tp-spin  0.75s linear infinite; }
  .tp-glow   { animation: tp-glow  4s ease-in-out infinite; }
  .tp-fade   { animation: tp-fade  0.25s ease both; }
  .tp-check  { animation: tp-check 0.4s cubic-bezier(0.22,1,0.36,1) both; }
  .tp-shake  { animation: tp-shake 0.35s ease both; }

  .tp-pin-box {
    transition: border-color 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
    text-align: center;
    caret-color: transparent;
    -webkit-text-security: disc;
    font-size: 20px;
  }
  .tp-pin-box:focus { outline: none; }

  .tp-btn { transition: opacity 0.15s ease, transform 0.15s ease; }
  .tp-btn:hover:not(:disabled) { opacity: 0.87; transform: translateY(-1px); }
  .tp-btn:disabled { opacity: 0.45; cursor: not-allowed; }
`;

const GREEN = "#22c55e";

const TransactionPin = () => {
  const { setPinModal, fetchUser, pax26 } = useGlobalContext();
  const primary = pax26?.primary || "#3b82f6";

  const [pin, setPin]         = useState(["", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [success, setSuccess] = useState(false);
  const [shaking, setShaking] = useState(false);
  const boxRefs               = useRef([]);

  /* ── PIN digit handlers ── */
  const handleDigit = (val, idx) => {
    const digit = val.replace(/\D/g, "").slice(-1);
    const next  = [...pin];
    next[idx]   = digit;
    setPin(next);
    if (digit && idx < 3) boxRefs.current[idx + 1]?.focus();
  };

  const handleKeyDown = (e, idx) => {
    if (e.key === "Backspace" && !pin[idx] && idx > 0) {
      boxRefs.current[idx - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4);
    const next   = ["", "", "", ""];
    pasted.split("").forEach((d, i) => { next[i] = d; });
    setPin(next);
    boxRefs.current[Math.min(pasted.length, 3)]?.focus();
  };

  const pinValue = pin.join("");

  /* ── Submit ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    if (pinValue === "1234") {
      setMessage({ type: "error", text: "1234 is not allowed as a PIN." });
      setShaking(true);
      setTimeout(() => setShaking(false), 400);
      return;
    }

    if (pinValue.length < 4) {
      setMessage({ type: "error", text: "Please enter all 4 digits." });
      return;
    }

    setLoading(true);
    try {
      const res  = await fetch("/api/auth/set-transaction-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin: pinValue }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
        setMessage({ type: "success", text: data.message || "PIN set successfully!" });
        await fetchUser();
        setTimeout(() => setPinModal(false), 1800);
      } else {
        setMessage({ type: "error", text: data.message || "Failed to set PIN." });
        setShaking(true);
        setTimeout(() => setShaking(false), 400);
      }
    } catch {
      setMessage({ type: "error", text: "Something went wrong. Try again." });
    } finally { setLoading(false); }
  };

  return (
    <>
      <style>{CSS}</style>
      <div className="tp-root max-w-sm mx-auto mt-20 px-4">
        <div className={`relative rounded-2xl overflow-hidden shadow-2xl ${shaking ? "tp-shake" : ""}`}
          style={{ background: pax26?.bg, border: `1px solid ${pax26?.border}` }}>

          {/* top gradient strip */}
          <div className="h-1 w-full"
            style={{ background: `linear-gradient(90deg, ${primary}, ${primary}55, transparent)` }} />

          {/* bg glow */}
          <div className="tp-glow absolute top-0 left-1/2 -translate-x-1/2 w-48 h-24 rounded-full pointer-events-none"
            style={{ background: primary, filter: "blur(50px)" }} />

          {/* close button */}
          <button
            onClick={() => setPinModal(false)}
            className="tp-btn cursor-pointer absolute top-4 right-4 w-7 h-7 rounded-xl flex items-center justify-center z-80"
            style={{ background: pax26?.secondaryBg, border: `1px solid ${pax26?.border}`, color: pax26?.textSecondary }}>
            <X size={13} />
          </button>

          <div className="relative z-10 px-7 pt-8 pb-8">

            {/* icon */}
            <div className="flex justify-center mb-5">
              <div className="relative">
                {success && (
                  <div className="absolute inset-0 rounded-full"
                    style={{ background: "rgba(34,197,94,0.2)", animation: "tp-glow 2s ease-in-out infinite" }} />
                )}
                <div className="relative w-14 h-14 rounded-2xl flex items-center justify-center"
                  style={{
                    background: success ? "rgba(34,197,94,0.12)" : `${primary}15`,
                    color: success ? GREEN : primary,
                  }}>
                  {success
                    ? <CheckCircle2 size={26} className="tp-check" />
                    : <Lock size={22} />
                  }
                </div>
              </div>
            </div>

            {/* heading */}
            <div className="text-center mb-6">
              <h2 className="text-lg font-extrabold mb-1" style={{ color: pax26?.textPrimary }}>
                {success ? "PIN Set!" : "Set Transaction PIN"}
              </h2>
              <p className="tp-mono text-[11px]" style={{ color: pax26?.textSecondary, opacity: 0.5 }}>
                {success
                  ? "Your PIN is active. Closing…"
                  : "Choose a 4-digit PIN to secure your transactions"
                }
              </p>
            </div>

            {!success && (
              <form onSubmit={handleSubmit} className="space-y-5">

                {/* PIN boxes */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-widest text-center mb-3"
                    style={{ color: pax26?.textSecondary, opacity: 0.45 }}>
                    Enter PIN
                  </label>
                  <div className="flex gap-3 justify-center" onPaste={handlePaste}>
                    {pin.map((digit, i) => (
                      <input
                        key={i}
                        ref={el => boxRefs.current[i] = el}
                        type="password"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={e => handleDigit(e.target.value, i)}
                        onKeyDown={e => handleKeyDown(e, i)}
                        className="tp-pin-box tp-mono w-14 h-16 rounded-xl text-xl font-bold"
                        style={{
                          background: digit ? `${primary}08` : pax26?.secondaryBg,
                          color: pax26?.textPrimary,
                          border: `2px solid ${digit ? primary : pax26?.border}`,
                          boxShadow: digit ? `0 0 0 3px ${primary}15` : "none",
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* message chip */}
                {message && (
                  <div className="tp-fade flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold"
                    style={{
                      background: message.type === "success" ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.08)",
                      border: `1px solid ${message.type === "success" ? "rgba(34,197,94,0.25)" : "rgba(239,68,68,0.25)"}`,
                      color: message.type === "success" ? GREEN : "#ef4444",
                    }}>
                    {message.type === "success"
                      ? <CheckCircle2 size={12} />
                      : <AlertCircle size={12} />
                    }
                    {message.text}
                  </div>
                )}

                {/* divider */}
                <div className="h-px" style={{ background: pax26?.border }} />

                {/* submit */}
                <button
                  type="submit"
                  disabled={loading || pinValue.length < 4}
                  className="tp-btn w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold text-white"
                  style={{
                    background: pinValue.length === 4 && !loading ? primary : `${primary}55`,
                    boxShadow: pinValue.length === 4 && !loading ? `0 10px 28px ${primary}38` : "none",
                  }}>
                  {loading
                    ? <><div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white tp-spin" />Saving…</>
                    : <><ShieldCheck size={15} /> Save PIN</>
                  }
                </button>

              </form>
            )}

          </div>
        </div>

        {/* security note */}
        <div className="flex items-center justify-center gap-1.5 mt-4">
          <ShieldCheck size={11} style={{ color: pax26?.textSecondary, opacity: 0.3 }} />
          <p className="tp-mono text-[10px]" style={{ color: pax26?.textSecondary, opacity: 0.3 }}>
            Your PIN is encrypted and never stored in plain text
          </p>
        </div>
      </div>
    </>
  );
};

export default TransactionPin;