"use client";

import { useState } from "react";
import { useGlobalContext } from "@/components/Context";
import axios from "axios";

export default function DeleteAccountPage() {
  const { userData, pax26 } = useGlobalContext();

  const [reason, setReason]       = useState("");
  const [loading, setLoading]     = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError]         = useState("");

  const bg            = pax26?.bg            || "#01050f";
  const secondaryBg   = pax26?.secondaryBg   || "#0d1526";
  const textPrimary   = pax26?.textPrimary   || "#f1f5f9";
  const textSecondary = pax26?.textSecondary || "#94a3b8";
  const border        = pax26?.border        || "rgba(241,245,249,0.08)";
  const primary       = pax26?.primary       || "#3b82f6";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await axios.post(
        "/api/user/delete-account",
        { reason },
        { withCredentials: true }
      );
      if (res.data?.success) {
        setSubmitted(true);
      } else {
        setError(res.data?.message || "Something went wrong. Please try again.");
      }
    } catch (err) {
      setError(
        err?.response?.data?.message ||
        "Could not submit your request. Please email info@pax26.com directly."
      );
    } finally {
      setLoading(false);
    }
  };

  /* ── Not logged in ─────────────────────────────────────────── */
  if (!userData) {
    return (
      <main style={{ ...S.page, backgroundColor: bg }}>
        <div style={{ ...S.card, backgroundColor: secondaryBg, borderColor: border }}>
          <h1 style={{ ...S.title, color: "#ef4444" }}>Delete Account</h1>
          <p style={{ ...S.body, color: textSecondary }}>
            You must be logged in to submit an account deletion request.
          </p>
          <a href="/login" style={{ ...S.btn, backgroundColor: primary, marginTop: 24 }}>
            Log In
          </a>
        </div>
      </main>
    );
  }

  /* ── Success state ─────────────────────────────────────────── */
  if (submitted) {
    return (
      <main style={{ ...S.page, backgroundColor: bg }}>
        <div style={{ ...S.card, backgroundColor: secondaryBg, borderColor: border }}>
          <div style={S.successIcon}>✓</div>
          <h1 style={{ ...S.title, color: "#22c55e" }}>Request Submitted</h1>
          <p style={{ ...S.body, color: textSecondary }}>
            Your account deletion request has been received. We will process it
            within <strong style={{ color: textPrimary }}>30 days</strong> and send a confirmation to{" "}
            <strong style={{ color: textPrimary }}>{userData.email}</strong>.
          </p>
          <p style={{ ...S.body, color: textSecondary, marginTop: 12 }}>
            If you submitted this by mistake, contact us immediately at{" "}
            <a href="mailto:info@pax26.com" style={{ color: primary }}>
              info@pax26.com
            </a>.
          </p>
        </div>
      </main>
    );
  }

  /* ── Main form ─────────────────────────────────────────────── */
  return (
    <main style={{ ...S.page, backgroundColor: bg }}>
      <div style={{ ...S.card, backgroundColor: secondaryBg, borderColor: border }}>
        <div style={S.warningBadge}>⚠️ Permanent Action</div>
        <h1 style={{ ...S.title, color: "#ef4444" }}>Delete Your Account</h1>
        <p style={{ ...S.body, color: textSecondary }}>
          Submitting this form will send a deletion request for the account
          associated with <strong style={{ color: textPrimary }}>{userData.email}</strong>.
        </p>

        <div style={{ ...S.infoBox, backgroundColor: "rgba(239,68,68,0.06)", borderColor: "rgba(239,68,68,0.2)" }}>
          <p style={{ ...S.infoTitle, color: "#fca5a5" }}>What will be permanently deleted:</p>
          <ul style={{ ...S.list, color: textSecondary }}>
            <li>Your account and profile information</li>
            <li>Your store, products, and order history</li>
            <li>Your AI automations and WhatsApp connection</li>
            <li>All conversation history and contacts</li>
            <li>Any active subscription will be cancelled</li>
          </ul>
        </div>

        <form onSubmit={handleSubmit} style={S.form}>
          <label style={{ ...S.label, color: textSecondary }} htmlFor="reason">
            Reason for leaving{" "}
            <span style={{ color: "rgba(148,163,184,0.5)" }}>(optional)</span>
          </label>
          <textarea
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Tell us why you're leaving so we can improve..."
            rows={4}
            style={{ ...S.textarea, backgroundColor: bg, borderColor: border, color: textPrimary }}
            maxLength={500}
          />

          {error && <p style={S.errorText}>{error}</p>}

          <button
            type="submit"
            disabled={loading}
            style={{
              ...S.btn,
              backgroundColor: loading ? "#374151" : "#ef4444",
              cursor: loading ? "not-allowed" : "pointer",
              marginTop: 8,
            }}
          >
            {loading ? "Submitting…" : "Request Account Deletion"}
          </button>
        </form>

        <p style={{ ...S.footer, color: textSecondary }}>
          Changed your mind?{" "}
          <a href="/dashboard" style={{ color: primary }}>
            Go back to dashboard
          </a>
        </p>
      </div>
    </main>
  );
}

const S = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px 16px",
  },
  card: {
    width: "100%",
    maxWidth: 520,
    borderRadius: 16,
    border: "1px solid",
    padding: "32px 28px",
  },
  warningBadge: {
    display: "inline-block",
    backgroundColor: "rgba(239,68,68,0.1)",
    color: "#ef4444",
    border: "1px solid rgba(239,68,68,0.25)",
    borderRadius: 9999,
    padding: "4px 12px",
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: "0.04em",
    marginBottom: 12,
    fontFamily: "Arial, sans-serif",
  },
  title: {
    fontSize: 24,
    fontWeight: 800,
    margin: "0 0 10px",
    fontFamily: "Arial, sans-serif",
  },
  body: {
    fontSize: 14,
    lineHeight: 1.6,
    margin: 0,
    fontFamily: "Arial, sans-serif",
  },
  infoBox: {
    borderRadius: 10,
    border: "1px solid",
    padding: "14px 16px",
    marginTop: 20,
  },
  infoTitle: {
    fontSize: 13,
    fontWeight: 700,
    margin: "0 0 8px",
    fontFamily: "Arial, sans-serif",
  },
  list: {
    margin: 0,
    paddingLeft: 18,
    fontSize: 13,
    lineHeight: 1.8,
    fontFamily: "Arial, sans-serif",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
    marginTop: 24,
  },
  label: {
    fontSize: 13,
    fontWeight: 600,
    fontFamily: "Arial, sans-serif",
  },
  textarea: {
    width: "100%",
    border: "1px solid",
    borderRadius: 8,
    padding: "10px 12px",
    fontSize: 14,
    resize: "vertical",
    outline: "none",
    fontFamily: "Arial, sans-serif",
    boxSizing: "border-box",
  },
  errorText: {
    fontSize: 13,
    color: "#ef4444",
    margin: 0,
    fontFamily: "Arial, sans-serif",
  },
  btn: {
    display: "block",
    width: "100%",
    padding: "13px",
    borderRadius: 8,
    border: "none",
    color: "#ffffff",
    fontSize: 14,
    fontWeight: 700,
    textAlign: "center",
    textDecoration: "none",
    fontFamily: "Arial, sans-serif",
  },
  successIcon: {
    width: 52,
    height: 52,
    borderRadius: "50%",
    backgroundColor: "rgba(34,197,94,0.12)",
    color: "#22c55e",
    fontSize: 24,
    fontWeight: 800,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    border: "1px solid rgba(34,197,94,0.2)",
  },
  footer: {
    fontSize: 13,
    textAlign: "center",
    marginTop: 20,
    marginBottom: 0,
    fontFamily: "Arial, sans-serif",
  },
};
