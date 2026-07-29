"use client";

import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../utils/firebase";
import { FcGoogle } from "react-icons/fc";
import axios from "axios";
import { useGlobalContext } from "../Context";
import { useState } from "react";
import { Globe, ArrowRight, MapPin, Zap, CheckCircle2 } from "lucide-react";

/* ── Country list ────────────────────────────────────────────── */
const COUNTRIES = [
  { label: "🇳🇬 Nigeria",       value: "Nigeria" },
  { label: "🇬🇭 Ghana",         value: "Ghana" },
  { label: "🇰🇪 Kenya",         value: "Kenya" },
  { label: "🇿🇦 South Africa",  value: "South Africa" },
  { label: "🇺🇬 Uganda",        value: "Uganda" },
  { label: "🇹🇿 Tanzania",      value: "Tanzania" },
  { label: "🇷🇼 Rwanda",        value: "Rwanda" },
  { label: "🇸🇳 Senegal",       value: "Senegal" },
  { label: "🇨🇲 Cameroon",      value: "Cameroon" },
  { label: "🇨🇮 Ivory Coast",   value: "Ivory Coast" },
  { label: "🇪🇹 Ethiopia",      value: "Ethiopia" },
  { label: "🇪🇬 Egypt",         value: "Egypt" },
  { label: "🌍 Other",          value: "Other" },
];

/* ── CSS for the full-page country picker ────────────────────── */
const COUNTRY_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Mono:wght@400;500&display=swap');

  @keyframes cp-backdrop-in {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes cp-card-in {
    from { opacity: 0; transform: translateY(32px) scale(0.96); }
    to   { opacity: 1; transform: translateY(0)    scale(1); }
  }
  @keyframes cp-spin {
    to { transform: rotate(360deg); }
  }
  @keyframes cp-float {
    0%, 100% { transform: translateY(0px); }
    50%       { transform: translateY(-8px); }
  }
  @keyframes cp-pulse-ring {
    0%   { transform: scale(0.85); opacity: 0.6; }
    70%  { transform: scale(1.15); opacity: 0; }
    100% { transform: scale(1.15); opacity: 0; }
  }
  @keyframes cp-shimmer {
    0%   { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
  @keyframes cp-tick-in {
    from { transform: scale(0) rotate(-45deg); opacity: 0; }
    to   { transform: scale(1) rotate(0deg);   opacity: 1; }
  }

  .cp-backdrop {
    position: fixed; inset: 0; z-index: 9999;
    display: flex; align-items: center; justify-content: center;
    padding: 16px;
    background: rgba(0, 0, 0, 0.82);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    animation: cp-backdrop-in 0.25s ease both;
  }

  .cp-card {
    width: 100%; max-width: 480px;
    border-radius: 28px;
    overflow: hidden;
    animation: cp-card-in 0.4s cubic-bezier(0.22, 1, 0.36, 1) both;
    box-shadow: 0 40px 100px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.06);
  }

  .cp-globe-icon {
    animation: cp-float 3s ease-in-out infinite;
  }
  .cp-pulse-ring {
    animation: cp-pulse-ring 2s ease-out infinite;
  }

  .cp-country-btn {
    width: 100%;
    padding: 14px 20px;
    border-radius: 14px;
    border: 2px solid transparent;
    display: flex; align-items: center; gap: 14px;
    cursor: pointer;
    font-size: 15px; font-weight: 600;
    text-align: left;
    transition: all 0.18s ease;
    position: relative;
    outline: none;
  }
  .cp-country-btn:hover {
    transform: translateX(4px);
  }

  .cp-tick {
    animation: cp-tick-in 0.25s cubic-bezier(0.22,1,0.36,1) both;
  }

  .cp-confirm-btn {
    width: 100%; padding: 16px;
    border-radius: 16px; border: none;
    display: flex; align-items: center; justify-content: center; gap: 10px;
    font-size: 15px; font-weight: 800;
    color: #fff; cursor: pointer;
    transition: all 0.18s ease;
    letter-spacing: 0.01em;
    font-family: 'Syne', sans-serif;
  }
  .cp-confirm-btn:hover:not(:disabled) {
    transform: translateY(-2px);
  }
  .cp-confirm-btn:disabled {
    cursor: not-allowed;
  }

  .cp-spinner {
    width: 18px; height: 18px; border-radius: 50%;
    border: 2.5px solid rgba(255,255,255,0.25);
    border-top-color: #fff;
    animation: cp-spin 0.7s linear infinite;
  }

  .cp-step-label {
    font-family: 'DM Mono', monospace;
    font-size: 10px; letter-spacing: 0.15em;
    text-transform: uppercase;
    opacity: 0.5;
  }
`;

/* ── Full-page Country Picker Overlay ───────────────────────── */
function CountryPickerStep({ googleData, pax26, googleName, onSuccess, onError }) {
  const [country, setCountry]       = useState("");
  const [submitting, setSubmitting] = useState(false);

  const primary       = pax26?.primary       || "#3b82f6";
  const bg            = pax26?.bg            || "#0f1117";
  const secondaryBg   = pax26?.secondaryBg   || "#1a1d27";
  const textPrimary   = pax26?.textPrimary   || "#f1f5f9";
  const textSecondary = pax26?.textSecondary || "#94a3b8";
  const border        = pax26?.border        || "#2d3148";

  const handleConfirm = async () => {
    if (!country || submitting) return;
    setSubmitting(true);
    try {
      const response = await axios.post("/api/auth/google", { ...googleData, country });
      const { success, message, finalUserData } = response.data;
      if (!success) {
        onError(message || "Authentication failed");
        return;
      }
      onSuccess(finalUserData);
    } catch (err) {
      onError(err.response?.data?.message || err.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  const firstName = (googleName || "there").split(" ")[0];

  return (
    <>
      <style>{COUNTRY_CSS}</style>

      <div className="cp-backdrop">
        <div
          className="cp-card"
          style={{ background: bg, border: `1px solid ${border}` }}
        >
          {/* gradient top strip */}
          <div style={{
            height: 4, width: "100%",
            background: `linear-gradient(90deg, ${primary}, ${primary}88, ${primary}22)`,
          }} />

          {/* hero section */}
          <div style={{
            padding: "36px 36px 28px",
            background: `linear-gradient(160deg, ${primary}14 0%, ${bg} 60%)`,
            borderBottom: `1px solid ${border}`,
            textAlign: "center",
          }}>
            {/* floating globe icon */}
            <div style={{ position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
              {/* pulse ring */}
              <div className="cp-pulse-ring" style={{
                position: "absolute", inset: -8,
                borderRadius: "50%",
                border: `2px solid ${primary}`,
              }} />
              <div className="cp-globe-icon" style={{
                width: 72, height: 72, borderRadius: "50%",
                background: `linear-gradient(135deg, ${primary}28, ${primary}10)`,
                border: `2px solid ${primary}40`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Globe size={32} style={{ color: primary }} strokeWidth={1.5} />
              </div>
            </div>

            {/* step label */}
            <p className="cp-step-label" style={{ color: textSecondary, marginBottom: 8 }}>
              Step 2 of 2 — Almost there!
            </p>

            <h2 style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: 26, fontWeight: 800,
              color: textPrimary, margin: "0 0 8px",
              lineHeight: 1.2,
            }}>
              Hi {firstName}, where are you based?
            </h2>
            <p style={{
              fontSize: 14, color: textSecondary,
              margin: 0, lineHeight: 1.6, opacity: 0.75,
            }}>
              Pick your country so we can tailor services &amp; local payment options for you.
            </p>
          </div>

          {/* country grid */}
          <div style={{ padding: "24px 28px 28px" }}>
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 10,
              maxHeight: 300,
              overflowY: "auto",
              paddingRight: 4,
              marginBottom: 20,
            }}>
              {COUNTRIES.map((c) => {
                const isSelected = country === c.value;
                return (
                  <button
                    key={c.value}
                    className="cp-country-btn"
                    onClick={() => setCountry(c.value)}
                    style={{
                      background: isSelected
                        ? `linear-gradient(135deg, ${primary}28, ${primary}12)`
                        : secondaryBg,
                      border: `2px solid ${isSelected ? primary : border}`,
                      color: isSelected ? textPrimary : textSecondary,
                      boxShadow: isSelected ? `0 0 0 3px ${primary}20, 0 4px 16px ${primary}22` : "none",
                    }}
                  >
                    <span style={{ fontSize: 20, lineHeight: 1, flexShrink: 0 }}>
                      {c.label.split(" ")[0]}
                    </span>
                    <span style={{
                      fontSize: 13, fontWeight: 600,
                      flex: 1, lineHeight: 1.3,
                    }}>
                      {c.label.replace(/^\S+\s*/, "")}
                    </span>
                    {isSelected && (
                      <CheckCircle2
                        className="cp-tick"
                        size={16}
                        style={{ color: primary, flexShrink: 0 }}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* selected pill */}
            {country && (
              <div style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "10px 14px", borderRadius: 12, marginBottom: 16,
                background: `${primary}14`, border: `1px solid ${primary}30`,
                fontSize: 13, color: primary, fontWeight: 600,
              }}>
                <MapPin size={13} />
                Selected: {COUNTRIES.find(c => c.value === country)?.label}
              </div>
            )}

            {/* confirm button */}
            <button
              className="cp-confirm-btn"
              disabled={!country || submitting}
              onClick={handleConfirm}
              style={{
                background: !country || submitting
                  ? `${primary}55`
                  : `linear-gradient(135deg, ${primary}, ${primary}cc)`,
                boxShadow: country && !submitting
                  ? `0 12px 32px ${primary}55`
                  : "none",
                opacity: !country || submitting ? 0.6 : 1,
              }}
            >
              {submitting ? (
                <>
                  <div className="cp-spinner" />
                  Setting up your account…
                </>
              ) : (
                <>
                  <Zap size={16} />
                  Complete Setup
                  <ArrowRight size={16} />
                </>
              )}
            </button>

            <p style={{
              textAlign: "center", marginTop: 14,
              fontSize: 11, color: textSecondary, opacity: 0.45,
              fontFamily: "'DM Mono', monospace",
            }}>
              Your data is protected with bank-grade encryption
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

/* ── Main component ───────────────────────────────────────────── */
export default function GoogleLoginButton({ loading, setAwayLoading }) {
  const { refHostCode, pax26, setAuthModalOpen, router, setUserData } = useGlobalContext();
  const [HomeLoading, setHomeLoading] = useState(false);
  const [error, setError]             = useState("");

  /* Holds the raw Google data while we wait for country selection */
  const [pendingGoogleData, setPendingGoogleData] = useState(null);
  const [googleName, setGoogleName]               = useState("");

  const apiUrl = `/api/auth/google`;

  const handleGoogleLogin = async () => {
    setHomeLoading(true);
    setAwayLoading(true);
    setError("");
    try {
      const result = await signInWithPopup(auth, provider);
      if (!result.user) {
        setError("No user data returned from Google.");
        return;
      }
      const resultData = result.user;

      const googlePayload = {
        name:         resultData.displayName,
        email:        resultData.email,
        providerId:   resultData.uid,
        number:       resultData.phoneNumber,
        profileImage: resultData.photoURL,
        refHostCode,
        provider:     resultData.providerData[0]?.providerId,
      };

      /* Check if user already exists with a country set (returning login) */
      const checkRes = await axios.post(apiUrl, googlePayload).catch(() => null);
      if (checkRes?.data?.success) {
        const finalUserData = checkRes.data.finalUserData;
        /* Existing user already has a country — go straight to dashboard */
        if (finalUserData?.country) {
          completeLogin(finalUserData);
          return;
        }
      }

      /* New user (or existing without country) — show full-page country picker */
      setGoogleName(resultData.displayName || "");
      setPendingGoogleData(googlePayload);

    } catch (err) {
      console.error("GoogleErr:", err);
      const innerMessage = err.response?.data?.message;
      setError(innerMessage || err.message || "Something went wrong with Google login.");
    } finally {
      setHomeLoading(false);
      setAwayLoading(false);
    }
  };

  const completeLogin = (finalUserData) => {
    const now = new Date().getTime();
    const userDataWithTimestamp = { ...finalUserData, authTimestamp: now };
    localStorage.setItem("userData", JSON.stringify(userDataWithTimestamp));
    setUserData(userDataWithTimestamp);
    router.push("/dashboard");
    setAuthModalOpen(false);
  };

  /* Render the full-screen country picker as a portal over everything */
  if (pendingGoogleData) {
    return (
      <CountryPickerStep
        googleData={pendingGoogleData}
        googleName={googleName}
        pax26={pax26}
        onSuccess={completeLogin}
        onError={(msg) => {
          setError(msg);
          setPendingGoogleData(null);
        }}
      />
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {error && (
        <p className="text-red-600 text-sm font-medium text-center mt-2">
          ⚠️ {error}
        </p>
      )}

      <button
        onClick={loading ? null : handleGoogleLogin}
        disabled={HomeLoading}
        className={`${loading ? "cursor-not-allowed opacity-50 pointer-events-none" : ""} w-full mt-4 flex items-center justify-center gap-3 border border-gray-400 py-2 rounded-lg hover:bg-gray-100 transition-colors shadow-sm disabled:opacity-50`}
      >
        {HomeLoading ? (
          <>
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-gray-400 text-sm">Signing in...</span>
          </>
        ) : (
          <>
            <FcGoogle size={22} />
            <span className="text-gray-400 text-sm">Continue with Google</span>
          </>
        )}
      </button>
    </div>
  );
}
