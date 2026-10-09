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

  const primary = pax26?.primary || "#3b82f6";

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
      <main style={styles.page}>
        <div style={styles.card}>
          <h1 style={{ ...styles.title, color: "#ef4444" }}>Delete Account</h1>
          <p style={styles.body}>
            You must be logged in to submit an account deletion request.
          </p>
          <a href="/login" style={{ ...styles.btn, backgroundColor: primary, marginTop: 24 }}>
            Log In
          </a>
        </div>
      </main>
    );
  }

  /* ── Success state ─────────────────────────────────────────── */
  if (submitted) {
    return (
      <main style={styles.page}>
        <div style={styles.card}>
          <div style={styles.successIcon}>✓</div>
          <h1 style={{ ...styles.title, color: "#22c55e" }}>Request Submitted</h1>
          <p style={styles.body}>
            Your account deletion request has been received. We will process it
            within <strong>30 days</strong> and send a confirmation to{" "}
            <strong>{userData.email}</strong>.
          </p>
          <p style={{ ...styles.body, marginTop: 12 }}>
            If you submitted this by mistake, contact us immediately at{" "}
            <a href="mailto:info@pax26.com" style={{ color: primary }}>
              info@pax26.com
            </a>
            .
          </p>
        </div>
      </main>
    );
  }

  /* ── Main form ─────────────────────────────────────────────── */
  return (
    <main style={styles.page}>
      <div style={styles.card}>
        {/* Header */}
        <div style={styles.warningBadge}>⚠️ Permanent Action</div>
        <h1 style={{ ...styles.title, color: "#ef4444" }}>Delete Your Account</h1>
        <p style={styles.body}>
          Submitting this form will send a deletion request for the account
          associated with <strong>{userData.email}</strong>.
        </p>

        {/* What gets deleted */}
        <div style={styles.infoBox}>
          <p style={styles.infoTitle}>What will be permanently deleted:</p>
          <ul style={styles.list}>
            <li>Your account and profile information</li>
            <li>Your store, products, and order history</li>
            <li>Your AI automations and WhatsApp connection</li>
            <li>All conversation history and contacts</li>
            <li>Any active subscription will be cancelled</li>
          </ul>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label} htmlFor="reason">
            Reason for leaving <span style={{ color: "#9ca3af" }}>(optional)</span>
          </label>
          <textarea
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Tell us why you're leaving so we can improve..."
            rows={4}
            style={styles.textarea}
            maxLength={500}
          />

          {error && <p style={styles.errorText}>{error}</p>}

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.btn,
              backgroundColor: loading ? "#9ca3af" : "#ef4444",
              cursor: loading ? "not-allowed" : "pointer",
              marginTop: 8,
            }}
          >
            {loading ? "Submitting…" : "Request Account Deletion"}
          </button>
        </form>

        <p style={styles.footer}>
          Changed your mind?{" "}
          <a href="/dashboard" style={{ color: primary }}>
            Go back to dashboard
          </a>
        </p>
      </div>
    </main>
  );
}

/* ── Inline styles (no Tailwind dependency for a standalone page) ── */
const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px 16px",
    backgroundColor: "#f9fafb",
  },
  card: {
    width: "100%",
    maxWidth: 520,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    border: "1px solid #e5e7eb",
    padding: "32px 28px",
    boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
  },
  warningBadge: {
    display: "inline-block",
    backgroundColor: "#fef2f2",
    color: "#ef4444",
    border: "1px solid #fecaca",
    borderRadius: 9999,
    padding: "4px 12px",
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: "0.04em",
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 800,
    margin: "0 0 10px",
    fontFamily: "Arial, sans-serif",
  },
  body: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 1.6,
    margin: 0,
    fontFamily: "Arial, sans-serif",
  },
  infoBox: {
    backgroundColor: "#fef9c3",
    border: "1px solid #fde047",
    borderRadius: 10,
    padding: "14px 16px",
    marginTop: 20,
  },
  infoTitle: {
    fontSize: 13,
    fontWeight: 700,
    color: "#713f12",
    margin: "0 0 8px",
    fontFamily: "Arial, sans-serif",
  },
  list: {
    margin: 0,
    paddingLeft: 18,
    fontSize: 13,
    color: "#713f12",
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
    color: "#374151",
    fontFamily: "Arial, sans-serif",
  },
  textarea: {
    width: "100%",
    border: "1px solid #d1d5db",
    borderRadius: 8,
    padding: "10px 12px",
    fontSize: 14,
    color: "#111827",
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
    backgroundColor: "#dcfce7",
    color: "#16a34a",
    fontSize: 24,
    fontWeight: 800,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  footer: {
    fontSize: 13,
    color: "#6b7280",
    textAlign: "center",
    marginTop: 20,
    marginBottom: 0,
    fontFamily: "Arial, sans-serif",
  },
};
