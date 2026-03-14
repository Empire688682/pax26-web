'use client';

import { X, Mail, Lock, User, Phone, Eye, EyeOff, Zap, ArrowRight, ShieldCheck } from 'lucide-react';
import { useGlobalContext } from '../Context';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import GoogleLoginButton from '../GoogleSignUp/googleSignUp';

/* ── Keyframes + font ─────────────────────────────────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Syne:wght@600;700;800&display=swap');

  .am-root { font-family: 'Syne', sans-serif; }
  .am-mono { font-family: 'DM Mono', monospace; }

  @keyframes am-backdrop { from { opacity: 0; } to { opacity: 1; } }
  @keyframes am-modal-in {
    from { opacity: 0; transform: scale(0.95) translateY(16px); }
    to   { opacity: 1; transform: scale(1)    translateY(0); }
  }
  @keyframes am-shake {
    0%,100% { transform: translateX(0); }
    20%,60% { transform: translateX(-5px); }
    40%,80% { transform: translateX(5px); }
  }
  @keyframes am-spin { to { transform: rotate(360deg); } }
  @keyframes am-slide {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .am-backdrop { animation: am-backdrop 0.2s ease both; }
  .am-modal-in { animation: am-modal-in 0.3s cubic-bezier(0.22,1,0.36,1) both; }
  .am-shake    { animation: am-shake 0.35s ease both; }
  .am-spin     { animation: am-spin 0.75s linear infinite; }
  .am-slide    { animation: am-slide 0.25s ease both; }

  .am-input  { transition: border-color 0.18s ease, box-shadow 0.18s ease; }
  .am-input:focus { outline: none; }

  .am-btn { transition: opacity 0.15s ease, transform 0.15s ease; }
  .am-btn:hover:not(:disabled) { opacity: 0.87; transform: translateY(-1px); }
  .am-btn:disabled { opacity: 0.45; cursor: not-allowed; }

  .am-link { transition: color 0.15s ease; }

  /* hide number spinner */
  .am-input[type=number]::-webkit-outer-spin-button,
  .am-input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }
`;

/* ── Themed input with icon ───────────────────────────────────── */
function AuthInput({ icon: Icon, type = "text", name, value, onChange, placeholder, required, rightEl, isFocused, onFocus, onBlur, primary, bg, textPrimary, border }) {
  return (
    <div className="relative">
      <Icon size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
        style={{ color: isFocused ? primary : textPrimary, opacity: isFocused ? 0.8 : 0.3 }} />
      <input
        type={type} name={name} value={value}
        onChange={onChange} placeholder={placeholder} required={required}
        className="am-input w-full pl-9 pr-10 py-3 rounded-xl text-sm"
        style={{
          background: bg,
          color: textPrimary,
          border: `1px solid ${isFocused ? primary : border}`,
          boxShadow: isFocused ? `0 0 0 3px ${primary}15` : "none",
        }}
        onFocus={onFocus} onBlur={onBlur}
      />
      {rightEl && (
        <div className="absolute right-3.5 top-1/2 -translate-y-1/2">{rightEl}</div>
      )}
    </div>
  );
}

/* ── Main component ───────────────────────────────────────────── */
export default function SignupPage() {
  const {
    authModalOpen, setAuthModalOpen,
    authType, setAuthType, openModal,
    setUserData, setData, data, refHostCode,
    pax26,
  } = useGlobalContext();

  const [loading, setLoading]         = useState(false);
  const [awayLoading, setAwayLoading] = useState(false);
  const [error, setError]             = useState("");
  const [agreed, setAgreed]           = useState(false);
  const [focused, setFocused]         = useState("");
  const [showPwd, setShowPwd]         = useState(false);
  const [shaking, setShaking]         = useState(false);

  const primary     = pax26?.primary   || "#3b82f6";
  const bg          = pax26?.bg        || "#ffffff";
  const secondaryBg = pax26?.secondaryBg || "#f8fafc";
  const textPrimary = pax26?.textPrimary || "#111827";
  const textSecondary = pax26?.textSecondary || "#6b7280";
  const border      = pax26?.border    || "#e5e7eb";

  const handleOnchange = e => {
    const { name, value } = e.target;
    setData(p => ({ ...p, [name]: value }));
  };

  /* shake + clear error after 3s */
  useEffect(() => {
    if (!error) return;
    setShaking(true);
    const t1 = setTimeout(() => setShaking(false), 400);
    const t2 = setTimeout(() => setError(""), 3500);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [error]);

  const baseUrl = authType === "login" ? "/api/auth/login"
    : authType === "register"          ? "/api/auth/register"
    : "";

  const userAuthHandler = async () => {
    if (authType === "register" && !agreed) {
      toast.error("Please agree to the Terms & Conditions"); return;
    }
    if (authType === "reset password") { handlePasswordReset(); return; }

    setLoading(true);
    try {
      const res = await axios.post(baseUrl, { ...data, refHostCode });
      const { success, message, finalUserData } = res.data;
      if (!success) { setError(message || "Authentication failed"); return; }
      const now = new Date().getTime();
      const userDataWithTimestamp = { ...finalUserData, timestamp: now };
      localStorage.setItem("userData", JSON.stringify(userDataWithTimestamp));
      setUserData(userDataWithTimestamp);
      window.location.reload();
      setData({ name: "", email: "", number: "", password: "", provider: "credentials" });
      toast.success("Authentication successful");
    } catch (err) {
      setError(err?.response?.data?.message || "Something went wrong");
    } finally { setLoading(false); }
  };

  const handlePasswordReset = async () => {
    setLoading(true);
    try {
      const res = await axios.post("api/auth/forgottenPwd", { email: data.email });
      if (res.data.success) {
        toast.success("Password reset link sent to: " + data.email);
        window.location.reload();
      }
    } catch {
      toast.error("Error sending email to: " + data.email);
    } finally { setLoading(false); }
  };

  const handleFormSubmission = e => { e.preventDefault(); userAuthHandler(); };

  if (!authModalOpen) return null;

  /* ── Copy per auth type ── */
  const COPY = {
    register:        { title: "Create Account",  sub: "Join thousands of businesses on Pax26" },
    login:           { title: "Welcome Back",     sub: "Sign in to your Pax26 account" },
    "reset password":{ title: "Reset Password",  sub: "We'll send a link to your email" },
  };
  const { title, sub } = COPY[authType] || { title: "", sub: "" };

  const inputProps = { primary, bg: secondaryBg, textPrimary, border };

  return (
    <>
      <style>{CSS}</style>

      {/* backdrop */}
      <div className="am-backdrop overflow-y-auto pt-32 h-[100%] fixed inset-0 z-70 flex items-center justify-center px-4"
        style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)" }}>

        {/* modal */}
        <div className={`am-modal-in am-root w-full max-w-md rounded-2xl overflow-hidden shadow-2xl ${shaking ? "am-shake" : ""}`}
          style={{ background: bg, border: `1px solid ${border}` }}>

          {/* top gradient strip */}
          <div className="h-1 w-full"
            style={{ background: `linear-gradient(90deg, ${primary}, ${primary}66, transparent)` }} />

          {/* header */}
          <div className="px-7 pt-7 pb-5 flex items-start justify-between">
            <div>
              {/* brand mark */}
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-xl bg-blue-500 flex items-center justify-center">
                  <Zap size={15} className="text-white" />
                </div>
                <span className="font-black text-lg" style={{ color: textPrimary }}>Pax26</span>
              </div>
              <h2 className="text-2xl font-extrabold leading-tight" style={{ color: textPrimary }}>
                {title}
              </h2>
              <p className="text-sm mt-1" style={{ color: textSecondary, opacity: 0.65 }}>
                {sub}
              </p>
            </div>
            <button
              onClick={() => setAuthModalOpen(false)}
              className="am-btn w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-1"
              style={{ background: secondaryBg, border: `1px solid ${border}`, color: textSecondary }}>
              <X size={16} />
            </button>
          </div>

          {/* form body */}
          <div className="px-7 pb-7">
            <form onSubmit={handleFormSubmission} className="space-y-3">

              {/* name — register only */}
              {authType === "register" && (
                <AuthInput
                  icon={User} name="name" value={data.name}
                  onChange={handleOnchange} placeholder="Full Name" required
                  isFocused={focused === "name"}
                  onFocus={() => setFocused("name")} onBlur={() => setFocused("")}
                  {...inputProps}
                />
              )}

              {/* email */}
              <AuthInput
                icon={Mail} type="email" name="email" value={data.email}
                onChange={handleOnchange} placeholder="Email address" required
                isFocused={focused === "email"}
                onFocus={() => setFocused("email")} onBlur={() => setFocused("")}
                {...inputProps}
              />

              {/* phone — register only */}
              {authType === "register" && (
                <AuthInput
                  icon={Phone} type="tel" name="number" value={data.number}
                  onChange={handleOnchange} placeholder="Phone number" required
                  isFocused={focused === "number"}
                  onFocus={() => setFocused("number")} onBlur={() => setFocused("")}
                  {...inputProps}
                />
              )}

              {/* password */}
              {authType !== "reset password" && (
                <AuthInput
                  icon={Lock} type={showPwd ? "text" : "password"}
                  name="password" value={data.password}
                  onChange={handleOnchange} placeholder="Password" required
                  isFocused={focused === "password"}
                  onFocus={() => setFocused("password")} onBlur={() => setFocused("")}
                  rightEl={
                    <button type="button" onClick={() => setShowPwd(p => !p)}
                      style={{ color: textSecondary, opacity: 0.5 }}>
                      {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  }
                  {...inputProps}
                />
              )}

              {/* forgot password link */}
              {authType === "login" && (
                <div className="text-right">
                  <button type="button"
                    onClick={() => setAuthType("reset password")}
                    className="am-link text-xs font-semibold"
                    style={{ color: primary }}>
                    Forgot password?
                  </button>
                </div>
              )}

              {/* terms checkbox — register only */}
              {authType === "register" && (
                <label className="flex items-start gap-3 cursor-pointer pt-1">
                  <div className="relative flex-shrink-0 mt-0.5">
                    <input type="checkbox" className="sr-only"
                      checked={agreed} onChange={e => setAgreed(e.target.checked)} />
                    <div className="w-4 h-4 rounded flex items-center justify-center"
                      style={{
                        background: agreed ? primary : secondaryBg,
                        border: `1.5px solid ${agreed ? primary : border}`,
                        transition: "all 0.15s ease",
                      }}>
                      {agreed && <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                        <polyline points="2 6 5 9 10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>}
                    </div>
                  </div>
                  <span className="text-xs leading-relaxed" style={{ color: textSecondary }}>
                    I agree to the{" "}
                    <a href="/terms" target="_blank"
                      className="font-semibold underline" style={{ color: primary }}>
                      Terms & Conditions
                    </a>
                  </span>
                </label>
              )}

              {/* error message */}
              {error && (
                <div className="am-slide flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-semibold"
                  style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", color: "#ef4444" }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  {error}
                </div>
              )}

              {/* submit */}
              <button
                type="submit"
                disabled={loading || awayLoading || (authType === "register" && !agreed)}
                className="am-btn w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold text-white mt-1"
                style={{
                  background: primary,
                  boxShadow: (loading || awayLoading) ? "none" : `0 10px 28px ${primary}38`,
                }}>
                {loading
                  ? <><div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white am-spin" />Processing…</>
                  : <>
                    <span className="capitalize">{authType}</span>
                    <ArrowRight size={15} />
                  </>
                }
              </button>
            </form>

            {/* switch auth type */}
            <div className="mt-4 text-center text-xs" style={{ color: textSecondary }}>
              {authType === "register" && (
                <p>Already have an account?{" "}
                  <button onClick={() => openModal("login")}
                    className="am-link font-bold" style={{ color: primary }}>
                    Sign in
                  </button>
                </p>
              )}
              {authType === "login" && (
                <p>Don't have an account?{" "}
                  <button onClick={() => openModal("register")}
                    className="am-link font-bold" style={{ color: primary }}>
                    Create one
                  </button>
                </p>
              )}
              {authType === "reset password" && (
                <p>Remember your password?{" "}
                  <button onClick={() => openModal("login")}
                    className="am-link font-bold" style={{ color: primary }}>
                    Sign in
                  </button>
                </p>
              )}
            </div>

            {/* Google sign in divider */}
            {(authType === "register" || authType === "login") && (
              <>
                <div className="flex items-center gap-3 my-5">
                  <div className="flex-1 h-px" style={{ background: border }} />
                  <span className="am-mono text-[10px] uppercase tracking-widest"
                    style={{ color: "white", opacity: 0.4 }}>or continue with</span>
                  <div className="flex-1 h-px" style={{ background: border }} />
                </div>
                <GoogleLoginButton loading={loading} setAwayLoading={setAwayLoading} />
              </>
            )}

            {/* security note */}
            <div className="flex items-center justify-center gap-1.5 mt-5">
              <ShieldCheck size={11} style={{ color: textSecondary, opacity: 0.35 }} />
              <p className="am-mono text-[10px]" style={{ color: textSecondary, opacity: 0.35 }}>
                Secured with bank-grade encryption
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}