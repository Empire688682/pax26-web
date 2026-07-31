"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import { useGlobalContext } from "../Context";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Lock, Eye, EyeOff, Zap, ArrowRight, ShieldCheck, CheckCircle2, LogIn } from "lucide-react";

/* ── Keyframes + font ─────────────────────────────────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Syne:wght@600;700;800&display=swap');

  .am-root { font-family: 'Syne', sans-serif; }
  .am-mono { font-family: 'DM Mono', monospace; }

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

  .am-modal-in { animation: am-modal-in 0.3s cubic-bezier(0.22,1,0.36,1) both; }
  .am-shake    { animation: am-shake 0.35s ease both; }
  .am-spin     { animation: am-spin 0.75s linear infinite; }
  .am-slide    { animation: am-slide 0.25s ease both; }

  .am-input  { transition: border-color 0.18s ease, box-shadow 0.18s ease; font-size: 16px; }
  .am-input:focus { outline: none; }
  
  .am-btn { transition: opacity 0.15s ease, transform 0.15s ease; }
  .am-btn:hover:not(:disabled) { opacity: 0.87; transform: translateY(-1px); }
  .am-btn:disabled { opacity: 0.45; cursor: not-allowed; }

  .am-link { transition: color 0.15s ease; }
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
        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center">{rightEl}</div>
      )}
    </div>
  );
}

const ResetPasswordPage = () => {
  const { router, openModal, pax26 } = useGlobalContext();
  const searchParams = useSearchParams();
  const token = searchParams.get("Emailtoken");

  const [loading, setLoading] = useState(false);
  const [successState, setSuccessState] = useState(false);
  const [data, setData] = useState({
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [focused, setFocused] = useState("");
  const [error, setError] = useState("");
  const [shaking, setShaking] = useState(false);

  const primary       = pax26?.primary       || "#3b82f6";
  const bg            = pax26?.bg            || "#ffffff";
  const secondaryBg   = pax26?.secondaryBg   || "#f8fafc";
  const textPrimary   = pax26?.textPrimary   || "#111827";
  const textSecondary = pax26?.textSecondary || "#6b7280";
  const border        = pax26?.border        || "#e5e7eb";

  const handleOnchange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  /* shake + clear error after 3.5s */
  useEffect(() => {
    if (!error) return;
    setShaking(true);
    const t1 = setTimeout(() => setShaking(false), 400);
    const t2 = setTimeout(() => setError(""), 3500);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [error]);

  useEffect(() => {
    if (!token) {
      router.push("/dashboard");
    }
  }, [token, router]);

  const resetPassword = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await axios.post("/api/auth/resetForgottenPassword", {
        password: data.password,
        confirmPassword: data.confirmPassword,
        token: token,
      });

      if (response.data.success) {
        toast.success("Password changed successfully! Please log in.");
        setSuccessState(true);
        setData({ password: "", confirmPassword: "" });
      }
    } catch (err) {
      console.log("Error resetting pwd:", err);
      const errMsg = err.response?.data?.message || "Something went wrong resetting password";
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmission = (e) => {
    e.preventDefault();
    if (data.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (data.password !== data.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    resetPassword();
  };

  const handleLoginClick = () => {
    if (openModal) {
      openModal("login");
    }
    router.push("/?auth=login");
  };

  const inputProps = { primary, bg: secondaryBg, textPrimary, border };

  return (
    <>
      <style>{CSS}</style>
      <div className="min-h-[calc(100vh-70px)] flex items-center justify-center px-4 py-12">
        <div
          className={`am-modal-in am-root w-full max-w-md rounded-2xl overflow-hidden shadow-2xl ${shaking ? "am-shake" : ""}`}
          style={{ background: bg, border: `1px solid ${border}` }}
        >
          {/* Top gradient strip */}
          <div
            className="h-1 w-full"
            style={{ background: `linear-gradient(90deg, ${primary}, ${primary}66, transparent)` }}
          />

          {/* Header */}
          <div className="px-7 pt-7 pb-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-blue-500 flex items-center justify-center">
                <Zap size={15} className="text-white" />
              </div>
              <span className="font-black text-lg" style={{ color: textPrimary }}>
                Pax26
              </span>
            </div>
            <h2 className="text-2xl font-extrabold leading-tight" style={{ color: textPrimary }}>
              {successState ? "Password Reset Complete" : "Reset Your Password"}
            </h2>
            <p className="text-sm mt-1" style={{ color: textSecondary, opacity: 0.7 }}>
              {successState
                ? "Your password has been updated. You can now log in to your account."
                : "Please enter and confirm your new password below."}
            </p>
          </div>

          {/* Body */}
          <div className="px-7 pb-7">
            {successState ? (
              <div className="am-slide space-y-4 pt-2 text-center">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mx-auto"
                  style={{ background: `${primary}15`, color: primary }}
                >
                  <CheckCircle2 size={36} />
                </div>
                <button
                  type="button"
                  onClick={handleLoginClick}
                  className="am-btn w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold text-white mt-4"
                  style={{
                    background: primary,
                    boxShadow: `0 10px 28px ${primary}38`,
                  }}
                >
                  <LogIn size={16} />
                  <span>Log In to Account</span>
                </button>
              </div>
            ) : (
              <form onSubmit={handleFormSubmission} className="space-y-4">
                {/* New Password */}
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: textSecondary }}>
                    New Password
                  </label>
                  <AuthInput
                    icon={Lock}
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={data.password}
                    onChange={handleOnchange}
                    placeholder="Enter new password (min 8 chars)"
                    required
                    isFocused={focused === "password"}
                    onFocus={() => setFocused("password")}
                    onBlur={() => setFocused("")}
                    rightEl={
                      <button
                        type="button"
                        onClick={() => setShowPassword((p) => !p)}
                        style={{ color: textSecondary, opacity: 0.6 }}
                        className="hover:opacity-100 transition-opacity cursor-pointer"
                        aria-label="Toggle password visibility"
                      >
                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    }
                    {...inputProps}
                  />
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: textSecondary }}>
                    Confirm New Password
                  </label>
                  <AuthInput
                    icon={Lock}
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={data.confirmPassword}
                    onChange={handleOnchange}
                    placeholder="Re-enter new password"
                    required
                    isFocused={focused === "confirmPassword"}
                    onFocus={() => setFocused("confirmPassword")}
                    onBlur={() => setFocused("")}
                    rightEl={
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword((p) => !p)}
                        style={{ color: textSecondary, opacity: 0.6 }}
                        className="hover:opacity-100 transition-opacity cursor-pointer"
                        aria-label="Toggle confirm password visibility"
                      >
                        {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    }
                    {...inputProps}
                  />
                </div>

                {/* Error Banner */}
                {error && (
                  <div
                    className="am-slide flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-semibold"
                    style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", color: "#ef4444" }}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    {error}
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="am-btn w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold text-white mt-2"
                  style={{
                    background: primary,
                    boxShadow: loading ? "none" : `0 10px 28px ${primary}38`,
                  }}
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white am-spin" />
                      Updating Password…
                    </>
                  ) : (
                    <>
                      <span>Reset Password</span>
                      <ArrowRight size={15} />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Back to Login Link */}
            <div className="mt-5 text-center text-xs" style={{ color: textSecondary }}>
              Remember your password?{" "}
              <button
                type="button"
                onClick={handleLoginClick}
                className="am-link font-bold cursor-pointer"
                style={{ color: primary }}
              >
                Sign in
              </button>
            </div>

            {/* Security note */}
            <div className="flex items-center justify-center gap-1.5 mt-6">
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
};

export default ResetPasswordPage;

