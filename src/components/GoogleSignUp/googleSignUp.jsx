"use client";

import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../utils/firebase";
import { FcGoogle } from "react-icons/fc";
import axios from "axios";
import { useGlobalContext } from "../Context";
import { useState } from "react";
import { Globe, ArrowRight } from "lucide-react";

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

/* ── Inline country-picker step ─────────────────────────────── */
function CountryPickerStep({ googleData, pax26, onSuccess, onError }) {
  const [country, setCountry]     = useState("");
  const [submitting, setSubmitting] = useState(false);

  const primary       = pax26?.primary       || "#3b82f6";
  const bg            = pax26?.bg            || "#ffffff";
  const secondaryBg   = pax26?.secondaryBg   || "#f8fafc";
  const textPrimary   = pax26?.textPrimary   || "#111827";
  const textSecondary = pax26?.textSecondary || "#6b7280";
  const border        = pax26?.border        || "#e5e7eb";

  const handleConfirm = async () => {
    if (!country) return;
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

  return (
    <div style={{ marginTop: 16 }}>
      {/* header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <div style={{
          width: 34, height: 34, borderRadius: 10, flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: `${primary}18`, color: primary,
        }}>
          <Globe size={16} strokeWidth={2.2} />
        </div>
        <div>
          <p style={{ fontSize: 13, fontWeight: 700, color: textPrimary, margin: 0 }}>
            One last step — where are you based?
          </p>
          <p style={{ fontSize: 11, color: textSecondary, margin: "2px 0 0", opacity: 0.7 }}>
            This helps us show you the right services.
          </p>
        </div>
      </div>

      {/* select */}
      <div style={{ position: "relative" }}>
        <Globe size={14} style={{
          position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
          color: country ? primary : textPrimary, opacity: country ? 0.8 : 0.3,
          pointerEvents: "none",
        }} />
        <select
          value={country}
          onChange={e => setCountry(e.target.value)}
          style={{
            width: "100%", paddingLeft: 34, paddingRight: 14,
            paddingTop: 11, paddingBottom: 11,
            borderRadius: 12, fontSize: 13.5, fontFamily: "inherit",
            background: secondaryBg,
            color: country ? textPrimary : `${textPrimary}55`,
            border: `1px solid ${country ? primary : border}`,
            boxShadow: country ? `0 0 0 3px ${primary}15` : "none",
            appearance: "none", cursor: "pointer",
            transition: "border-color 0.18s ease, box-shadow 0.18s ease",
            outline: "none",
          }}
        >
          <option value="" disabled>Select your country…</option>
          {COUNTRIES.map(c => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </div>

      {/* confirm button */}
      <button
        type="button"
        disabled={!country || submitting}
        onClick={handleConfirm}
        style={{
          marginTop: 12, width: "100%",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          padding: "12px 0", borderRadius: 12,
          background: !country || submitting ? `${primary}55` : primary,
          color: "#fff", fontWeight: 700, fontSize: 13,
          border: "none", cursor: !country || submitting ? "not-allowed" : "pointer",
          transition: "opacity 0.15s ease, transform 0.15s ease",
          boxShadow: country && !submitting ? `0 10px 28px ${primary}38` : "none",
        }}
      >
        {submitting ? (
          <>
            <div style={{
              width: 15, height: 15, borderRadius: "50%",
              border: "2px solid rgba(255,255,255,0.3)",
              borderTopColor: "#fff",
              animation: "spin 0.75s linear infinite",
            }} />
            Setting up…
          </>
        ) : (
          <>Continue <ArrowRight size={14} /></>
        )}
      </button>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

/* ── Main component ───────────────────────────────────────────── */
export default function GoogleLoginButton({ loading, setAwayLoading }) {
  const { refHostCode, pax26, setAuthModalOpen, router, setUserData } = useGlobalContext();
  const [HomeLoading, setHomeLoading] = useState(false);
  const [error, setError]             = useState("");

  /* Holds the raw Google data while we wait for country selection */
  const [pendingGoogleData, setPendingGoogleData] = useState(null);

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

      /* New user (or existing without country) — show country picker */
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

  /* If we're in the country-picker step, render that inline */
  if (pendingGoogleData) {
    return (
      <CountryPickerStep
        googleData={pendingGoogleData}
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
