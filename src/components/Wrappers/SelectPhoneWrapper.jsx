"use client";

import React, { useState, useEffect, useRef } from "react"
import { useSearchParams, useRouter } from "next/navigation";
import { useGlobalContext } from "@/components/Context";

const qualityConfig = {
    GREEN: { label: "Excellent", color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/30", dot: "bg-emerald-400" },
    YELLOW: { label: "Fair", color: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-400/30", dot: "bg-amber-400" },
    RED: { label: "Poor", color: "text-rose-400", bg: "bg-rose-400/10", border: "border-rose-400/30", dot: "bg-rose-400" },
    UNKNOWN: { label: "Unrated", color: "text-slate-400", bg: "bg-slate-400/10", border: "border-slate-400/30", dot: "bg-slate-400" },
};

const WhatsAppIcon = ({ size = 20 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
);

const ShieldIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
);

const CheckIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
    </svg>
);

const PhoneCard = ({ phone, selected, onSelect, pax26 }) => {
    const q = qualityConfig[phone.quality] || qualityConfig.UNKNOWN;

    return (
        <div
            onClick={() => onSelect(phone.id)}
            className="relative cursor-pointer rounded-2xl border-2 p-5 transition-all duration-300"
            style={{
                borderColor: selected ? "#4ade80" : pax26?.border,
                background: selected ? "rgba(74,222,128,0.05)" : pax26?.secondaryBg,
                backdropFilter: "blur(12px)",
                boxShadow: selected ? "0 4px 24px rgba(74,222,128,0.08)" : "none",
            }}
        >
            {phone.quality === "GREEN" && (
                <div className="absolute -top-3 left-4">
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-400 text-black tracking-wider uppercase">
                        Recommended
                    </span>
                </div>
            )}

            <div className="flex items-start gap-4">
                {/* Radio */}
                <div
                    className="mt-1 flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200"
                    style={{
                        borderColor: selected ? "#4ade80" : pax26?.border,
                        background: selected ? "#4ade80" : "transparent",
                    }}
                >
                    {selected && <div className="w-2 h-2 rounded-full bg-black" />}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <span style={{ color: pax26?.textPrimary }} className="font-bold text-lg tracking-tight">
                        {phone.display}
                    </span>
                    <p style={{ color: pax26?.textSecondary }} className="text-sm mt-0.5 truncate opacity-70">
                        {phone.name}
                    </p>
                    <div className="flex items-center gap-3 mt-3">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${q.color} ${q.bg} ${q.border}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${q.dot} animate-pulse`} />
                            {q.label} Quality
                        </span>
                        <span style={{ color: pax26?.textSecondary }} className="text-xs truncate opacity-50">
                            {phone.wabaName}
                        </span>
                    </div>
                </div>

                {/* WA Icon */}
                <div
                    className="flex-shrink-0 p-2 rounded-xl transition-colors duration-200"
                    style={{
                        background: selected ? "rgba(74,222,128,0.15)" : pax26?.secondaryBg,
                        color: selected ? "#4ade80" : pax26?.textSecondary,
                    }}
                >
                    <WhatsAppIcon size={22} />
                </div>
            </div>
        </div>
    );
};

const OtpStep = ({ phone, sessionId, pax26, onVerified, onSkip }) => {
    const [method, setMethod]     = useState("SMS");
    const [otpSent, setOtpSent]   = useState(false);
    const [code, setCode]         = useState("");
    const [loading, setLoading]   = useState(false);
    const [error, setError]       = useState(null);
    const [success, setSuccess]   = useState(false);
    const inputRefs               = useRef([]);
    const digits                  = code.padEnd(6, " ").split("").slice(0, 6);

    const requestOtp = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch("/api/meta/verify-phone", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "request", sessionId, phoneId: phone.id, method }),
            });
            const data = await res.json();
            if (data.alreadyVerified) { onVerified(); return; }
            if (!data.success) { setError(data.message); return; }
            setOtpSent(true);
        } catch { setError("Network error. Please try again."); }
        finally { setLoading(false); }
    };

    const handleDigit = (val, idx) => {
        const digit = val.replace(/\D/g, "").slice(-1);
        const next  = code.split("");
        next[idx]   = digit;
        const newCode = next.join("").replace(/ /g, "").slice(0, 6);
        setCode(newCode);
        if (digit && idx < 5) inputRefs.current[idx + 1]?.focus();
    };

    const handleKeyDown = (e, idx) => {
        if (e.key === "Backspace" && !code[idx] && idx > 0) {
            inputRefs.current[idx - 1]?.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
        setCode(pasted);
        inputRefs.current[Math.min(pasted.length, 5)]?.focus();
    };

    const verifyOtp = async () => {
        if (code.length < 6) { setError("Please enter the full 6-digit code."); return; }
        setLoading(true);
        setError(null);
        try {
            const res = await fetch("/api/meta/verify-phone", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "verify", sessionId, phoneId: phone.id, code }),
            });
            const data = await res.json();
            if (!data.success) { setError(data.message); return; }
            setSuccess(true);
            setTimeout(onVerified, 1200);
        } catch { setError("Network error. Please try again."); }
        finally { setLoading(false); }
    };

    return (
        <div className="px-6 py-6 flex flex-col gap-5">
            {/* Header */}
            <div>
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 rounded-full bg-amber-400/15 flex items-center justify-center flex-shrink-0">
                        <span style={{ fontSize: 14 }}>🔐</span>
                    </div>
                    <p className="font-bold text-sm" style={{ color: pax26?.textPrimary }}>
                        Verify your number
                    </p>
                </div>
                <p className="text-xs leading-relaxed" style={{ color: pax26?.textSecondary, opacity: 0.65 }}>
                    <strong style={{ color: "#f59e0b" }}>{phone.display}</strong> is not yet verified with Meta.
                    We need to send an OTP to this number to activate it.
                </p>
            </div>

            {!otpSent ? (
                <>
                    {/* Method toggle */}
                    <div className="flex gap-2">
                        {["SMS", "VOICE"].map((m) => (
                            <button
                                key={m}
                                onClick={() => setMethod(m)}
                                className="flex-1 py-2.5 rounded-xl text-xs font-bold transition-all"
                                style={method === m
                                    ? { background: "#4ade80", color: "#000" }
                                    : { background: pax26?.secondaryBg, color: pax26?.textSecondary, border: `1px solid ${pax26?.border}` }
                                }
                            >
                                {m === "SMS" ? "📱 SMS" : "📞 Voice Call"}
                            </button>
                        ))}
                    </div>

                    {error && (
                        <p className="text-xs text-rose-400 px-1">{error}</p>
                    )}

                    <button
                        onClick={requestOtp}
                        disabled={loading}
                        className="w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2"
                        style={{ background: "#4ade80", color: "#000", opacity: loading ? 0.6 : 1 }}
                    >
                        {loading
                            ? <><div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />Sending OTP…</>
                            : `Send OTP via ${method}`
                        }
                    </button>

                    <button
                        onClick={onSkip}
                        className="text-xs text-center underline opacity-40 hover:opacity-60 transition-opacity"
                        style={{ color: pax26?.textSecondary }}
                    >
                        Skip for now (number may not send messages)
                    </button>
                </>
            ) : success ? (
                <div className="flex flex-col items-center gap-3 py-4">
                    <div className="w-14 h-14 rounded-full bg-green-400/15 flex items-center justify-center text-3xl">✅</div>
                    <p className="font-bold text-sm" style={{ color: "#4ade80" }}>Number verified!</p>
                    <p className="text-xs opacity-60" style={{ color: pax26?.textSecondary }}>Completing connection…</p>
                </div>
            ) : (
                <>
                    <p className="text-xs" style={{ color: pax26?.textSecondary, opacity: 0.7 }}>
                        OTP sent to <strong style={{ color: pax26?.textPrimary }}>{phone.display}</strong> via {method}.
                        Enter the code below.
                    </p>

                    {/* OTP boxes */}
                    <div className="flex gap-2 justify-center" onPaste={handlePaste}>
                        {Array.from({ length: 6 }).map((_, i) => (
                            <input
                                key={i}
                                ref={el => inputRefs.current[i] = el}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={code[i] || ""}
                                onChange={e => handleDigit(e.target.value, i)}
                                onKeyDown={e => handleKeyDown(e, i)}
                                className="w-11 h-12 rounded-xl text-center text-lg font-bold outline-none transition-all"
                                style={{
                                    background: code[i] ? "rgba(74,222,128,0.08)" : pax26?.secondaryBg,
                                    border: `2px solid ${code[i] ? "#4ade80" : pax26?.border}`,
                                    color: pax26?.textPrimary,
                                    boxShadow: code[i] ? "0 0 0 3px rgba(74,222,128,0.1)" : "none",
                                }}
                            />
                        ))}
                    </div>

                    {error && <p className="text-xs text-rose-400 text-center">{error}</p>}

                    <button
                        onClick={verifyOtp}
                        disabled={loading || code.length < 6}
                        className="w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2"
                        style={{
                            background: code.length === 6 && !loading ? "#4ade80" : pax26?.secondaryBg,
                            color: code.length === 6 && !loading ? "#000" : pax26?.textSecondary,
                            border: code.length < 6 ? `1px solid ${pax26?.border}` : "none",
                            opacity: loading ? 0.7 : 1,
                        }}
                    >
                        {loading
                            ? <><div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />Verifying…</>
                            : "Confirm Code"
                        }
                    </button>

                    <div className="flex justify-between items-center">
                        <button
                            onClick={() => { setOtpSent(false); setCode(""); setError(null); }}
                            className="text-xs underline opacity-40 hover:opacity-60 transition-opacity"
                            style={{ color: pax26?.textSecondary }}
                        >
                            ← Change method
                        </button>
                        <button
                            onClick={requestOtp}
                            disabled={loading}
                            className="text-xs underline opacity-40 hover:opacity-60 transition-opacity"
                            style={{ color: pax26?.textSecondary }}
                        >
                            Resend OTP
                        </button>
                    </div>

                    <button
                        onClick={onSkip}
                        className="text-xs text-center underline opacity-30 hover:opacity-50 transition-opacity"
                        style={{ color: pax26?.textSecondary }}
                    >
                        Skip verification (number may not send messages)
                    </button>
                </>
            )}
        </div>
    );
};

const SelectPhone = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { pax26 } = useGlobalContext();

    const [phones, setPhones] = useState([]);
    const [selectedId, setSelectedId] = useState(null);
    const [sessionId, setSessionId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [connecting, setConnecting] = useState(false);
    const [error, setError] = useState(null);
    // "select" | "otp" — otp step only shown for unverified numbers
    const [step, setStep] = useState("select");

    useEffect(() => {
        const session = searchParams.get("session");

        if (!session) {
            setError("Missing session. Please try connecting again.");
            setLoading(false);
            return;
        }

        setSessionId(session);

        const fetchPhones = async () => {
            try {
                const res = await fetch(`/api/meta/session-phones?session=${session}`);
                const data = await res.json();

                if (!data.success) {
                    setError(data.message || "Session expired. Please try again.");
                    setLoading(false);
                    return;
                }

                setPhones(data.phones);
                const recommended = data.phones.find((p) => p.quality === "GREEN");
                setSelectedId(recommended?.id || data.phones[0]?.id || null);
            } catch {
                setError("Failed to load phone numbers. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchPhones();
    }, [searchParams]);

    const handleConnect = async () => {
        if (!selectedId || !sessionId) return;

        const phone = phones.find((p) => p.id === selectedId);

        // Skip OTP for:
        // 1. Numbers already VERIFIED or REGISTERED by Meta
        // 2. Numbers with GREEN (Excellent) quality — fully approved by Meta, no OTP needed
        const isVerified = phone?.verificationStatus === "VERIFIED" || phone?.verificationStatus === "REGISTERED";
        const isExcellent = phone?.quality === "GREEN";

        if (isVerified || isExcellent) {
            await finishConnect();
            return;
        }

        // Show OTP step only for unverified, non-excellent numbers
        setStep("otp");
    };

    const finishConnect = async () => {
        setConnecting(true);
        setError(null);

        try {
            const res = await fetch("/api/meta/select-phone", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ sessionId, phoneId: selectedId }),
            });

            const data = await res.json();

            if (data.success) {
                router.push("/dashboard/automations/market-place?whatsapp=connected");
            } else {
                setError(data.message || "Something went wrong.");
                setConnecting(false);
                setStep("select");
            }
        } catch {
            setError("Network error. Please try again.");
            setConnecting(false);
            setStep("select");
        }
    };

    const selectedPhone = phones.find((p) => p.id === selectedId);

    return (
        <div
            className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
        >
            {/* ── Background FX — mirrors BackgroundFX component ── */}
            <div className="absolute inset-0 pointer-events-none">

                {/* Blob 1 */}
                <div style={{
                    position: "absolute", top: "-10%", left: "-5%",
                    width: "55vw", height: "55vw", maxWidth: 800, maxHeight: 800,
                    borderRadius: "50%", background: pax26?.fxBlob1,
                    filter: "blur(100px)", transition: "background 0.4s ease",
                }} />

                {/* Blob 2 */}
                <div style={{
                    position: "absolute", bottom: "-15%", right: "-10%",
                    width: "60vw", height: "60vw", maxWidth: 900, maxHeight: 900,
                    borderRadius: "50%", background: pax26?.fxBlob2,
                    filter: "blur(120px)", transition: "background 0.4s ease",
                }} />

                {/* Blob 3 */}
                <div style={{
                    position: "absolute", top: "35%", left: "40%",
                    width: "40vw", height: "40vw", maxWidth: 600, maxHeight: 600,
                    borderRadius: "50%", background: pax26?.fxBlob3,
                    filter: "blur(90px)", transition: "background 0.4s ease",
                }} />

                {/* Line grid */}
                <div style={{
                    position: "absolute", inset: 0,
                    backgroundImage: `
                        linear-gradient(${pax26?.fxGrid} 1px, transparent 1px),
                        linear-gradient(90deg, ${pax26?.fxGrid} 1px, transparent 1px)
                    `,
                    backgroundSize: "48px 48px",
                    opacity: 0.03,
                }} />
            </div>

            {/* ── Card ──────────────────────────────────────────── */}
            <div className="relative w-full max-w-md">
                <div
                    className="rounded-3xl overflow-hidden"
                    style={{
                        background: pax26?.card ? `${pax26.card}dd` : "rgba(255,255,255,0.04)",
                        backdropFilter: "blur(24px)",
                        border: `1px solid ${pax26?.border}`,
                        boxShadow: "0 32px 64px rgba(0,0,0,0.2)",
                    }}
                >
                    {/* Header */}
                    <div className="px-8 pt-8 pb-6" style={{ borderBottom: `1px solid ${pax26?.border}` }}>
                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-10 h-10 rounded-2xl bg-green-400/15 flex items-center justify-center text-green-400 border border-green-400/20">
                                <WhatsAppIcon size={20} />
                            </div>
                            <div>
                                <p style={{ color: pax26?.textSecondary }} className="text-xs font-medium uppercase tracking-widest">
                                    WhatsApp
                                </p>
                                <p style={{ color: pax26?.textPrimary }} className="font-bold text-sm">
                                    Business Connect
                                </p>
                            </div>
                        </div>

                        <h1 style={{ color: pax26?.textPrimary }} className="text-2xl font-black tracking-tight leading-tight">
                            Choose your<br />
                            <span className="text-green-400">phone number</span>
                        </h1>
                        <p style={{ color: pax26?.textSecondary }} className="text-sm mt-2 leading-relaxed opacity-70">
                            {phones.length > 0
                                ? `We found ${phones.length} number${phones.length !== 1 ? "s" : ""} on your account. Select one to connect.`
                                : "Loading your phone numbers..."}
                        </p>
                    </div>

                    {/* Phone list */}
                    <div className="px-6 py-6">
                        {step === "otp" ? (
                            <OtpStep
                                phone={phones.find(p => p.id === selectedId)}
                                sessionId={sessionId}
                                pax26={pax26}
                                onVerified={finishConnect}
                                onSkip={finishConnect}
                            />
                        ) : loading ? (
                            <div className="flex flex-col items-center py-12 gap-3">
                                <div className="w-8 h-8 border-2 border-green-400/30 border-t-green-400 rounded-full animate-spin" />
                                <p style={{ color: pax26?.textSecondary }} className="text-sm opacity-60">
                                    Loading numbers...
                                </p>
                            </div>
                        ) : error && phones.length === 0 ? (
                            <div className="text-center py-10">
                                <p className="text-rose-400 text-sm">{error}</p>
                                <button
                                    onClick={() => router.push("/dashboard/automations")}
                                    style={{ color: pax26?.textSecondary }}
                                    className="mt-4 text-sm underline hover:opacity-70 transition-opacity"
                                >
                                    Go back and try again
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-3">
                                {phones.map((phone) => (
                                    <PhoneCard
                                        key={phone.id}
                                        phone={phone}
                                        selected={selectedId === phone.id}
                                        onSelect={setSelectedId}
                                        pax26={pax26}
                                    />
                                ))}
                            </div>
                        )}

                        {error && phones.length > 0 && (
                            <div className="mt-4 px-4 py-3 rounded-xl bg-rose-400/10 border border-rose-400/20">
                                <p className="text-rose-400 text-sm">{error}</p>
                            </div>
                        )}

                        {/* Quality Rating Warning / Guidance Alert */}
                        {phones.length > 0 && selectedPhone && selectedPhone.quality !== "GREEN" && (
                            <div 
                                className="mt-4 p-4 rounded-2xl border flex flex-col gap-2.5 transition-all duration-300"
                                style={{
                                    background: selectedPhone.quality === "UNKNOWN" 
                                        ? "rgba(148,163,184,0.06)" 
                                        : "rgba(245,158,11,0.06)",
                                    borderColor: selectedPhone.quality === "UNKNOWN"
                                        ? "rgba(148,163,184,0.2)"
                                        : "rgba(245,158,11,0.2)"
                                }}
                            >
                                <div className="flex items-center gap-2">
                                    <div 
                                        className="w-2 h-2 rounded-full animate-ping"
                                        style={{
                                            background: selectedPhone.quality === "UNKNOWN" ? "#94a3b8" : "#f59e0b"
                                        }}
                                    />
                                    <p className="text-xs font-bold uppercase tracking-wider" style={{ color: selectedPhone.quality === "UNKNOWN" ? "#94a3b8" : "#f59e0b" }}>
                                        {selectedPhone.quality === "UNKNOWN" ? "Unrated Status Notice" : "Quality Status Notice"}
                                    </p>
                                </div>
                                <p style={{ color: pax26?.textSecondary }} className="text-xs leading-relaxed opacity-85">
                                    {selectedPhone.quality === "UNKNOWN" ? (
                                        <>
                                            This number's quality is <strong style={{ color: pax26?.textPrimary }}>Unrated</strong>. This is <strong>100% normal</strong> for newly registered WhatsApp Business numbers. It takes a few hours of active messaging for Meta to establish a rating. Your number is safe to connect!
                                        </>
                                    ) : (
                                        <>
                                            This number's quality is currently rated as <strong style={{ color: pax26?.textPrimary }}>{selectedPhone.quality === "YELLOW" ? "Fair" : "Poor"}</strong>. If you experience delay or error sending messages, please give it a few hours or contact Pax26 support.
                                        </>
                                    )}
                                </p>
                                <p style={{ color: pax26?.textSecondary }} className="text-[10px] leading-relaxed opacity-60 italic pt-1.5 border-t" style={{ borderColor: pax26?.border }}>
                                    Need help? Reach out to support at <span style={{ color: pax26?.textPrimary }}>support@pax26.com</span>
                                </p>
                            </div>
                        )}
                    </div>

                    {/* CTA — only shown on select step */}
                    {!loading && phones.length > 0 && step === "select" && (
                        <div className="px-6 pb-6">
                            {selectedPhone && (
                                <div
                                    className="mb-4 px-4 py-3 rounded-xl flex items-center gap-3"
                                    style={{ background: pax26?.secondaryBg, border: `1px solid ${pax26?.border}` }}
                                >
                                    <div className="w-7 h-7 rounded-lg bg-green-400/15 flex items-center justify-center text-green-400 flex-shrink-0">
                                        <CheckIcon />
                                    </div>
                                    <div className="min-w-0">
                                        <p style={{ color: pax26?.textSecondary }} className="text-xs opacity-60">Connecting</p>
                                        <p style={{ color: pax26?.textPrimary }} className="text-sm font-semibold truncate">
                                            {selectedPhone.display}
                                        </p>
                                    </div>
                                </div>
                            )}

                            <button
                                onClick={handleConnect}
                                disabled={!selectedId || connecting}
                                className="w-full py-4 rounded-2xl font-bold text-sm tracking-wide transition-all duration-300 flex items-center justify-center gap-2"
                                style={
                                    selectedId && !connecting
                                        ? { background: "#4ade80", color: "#000", boxShadow: "0 8px 24px rgba(74,222,128,0.25)" }
                                        : { background: pax26?.secondaryBg, color: pax26?.textSecondary, border: `1px solid ${pax26?.border}`, cursor: "not-allowed", opacity: 0.5 }
                                }
                            >
                                {connecting ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                        Connecting...
                                    </>
                                ) : (
                                    <>
                                        <WhatsAppIcon size={16} />
                                        Connect this number
                                    </>
                                )}
                            </button>

                            <div className="flex items-center justify-center gap-1.5 mt-4" style={{ color: pax26?.textSecondary, opacity: 0.4 }}>
                                <ShieldIcon />
                                <p className="text-xs">Encrypted & secure · You can change this later</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Cancel */}
                <div className="text-center mt-5">
                    <button
                        onClick={() => router.push("/dashboard/automations")}
                        style={{ color: pax26?.textSecondary }}
                        className="text-sm hover:opacity-70 transition-opacity duration-200 opacity-40"
                    >
                        Cancel and go back
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SelectPhone;