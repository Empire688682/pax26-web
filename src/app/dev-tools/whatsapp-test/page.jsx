"use client";

/**
 * DEV-ONLY PAGE — /dev-tools/whatsapp-test
 *
 * Lets you send a WhatsApp message on behalf of any connected user
 * by supplying their credentials manually. Nothing is saved to the DB.
 *
 * ⚠️  REMOVE THIS PAGE AND /api/dev/whatsapp-send BEFORE GOING TO PRODUCTION.
 */

import React, { useState } from "react";

const FIELD_STYLE = {
    width: "100%",
    padding: "10px 14px",
    borderRadius: 10,
    border: "1px solid #333",
    background: "#111",
    color: "#f1f1f1",
    fontSize: 13,
    fontFamily: "'DM Mono', monospace",
    outline: "none",
    boxSizing: "border-box",
};

const LABEL_STYLE = {
    display: "block",
    fontSize: 11,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: "#888",
    marginBottom: 6,
};

const INITIAL = {
    phoneNumberId: "",
    accessToken: "",
    to: "",
    message: "",
};

export default function WhatsAppTestPage() {
    const [form, setForm]       = useState(INITIAL);
    const [loading, setLoading] = useState(false);
    const [result, setResult]   = useState(null); // { success, messageId, error, details }
    const [showToken, setShowToken] = useState(false);

    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        setResult(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setResult(null);

        try {
            const res = await fetch("/api/dev/whatsapp-send", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });

            const data = await res.json();
            setResult(data);
        } catch (err) {
            setResult({ success: false, error: err.message });
        } finally {
            setLoading(false);
        }
    };

    const isValid =
        form.phoneNumberId.trim() &&
        form.accessToken.trim() &&
        form.to.trim() &&
        form.message.trim();

    return (
        <div style={{
            minHeight: "100vh",
            background: "#0a0a0a",
            color: "#f1f1f1",
            fontFamily: "'Inter', sans-serif",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
            padding: "48px 16px",
        }}>
            <div style={{ width: "100%", maxWidth: 560 }}>

                {/* Header */}
                <div style={{ marginBottom: 32 }}>
                    <div style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "4px 12px",
                        borderRadius: 999,
                        background: "rgba(245,158,11,0.1)",
                        border: "1px solid rgba(245,158,11,0.3)",
                        marginBottom: 16,
                    }}>
                        <span style={{ color: "#f59e0b", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                            ⚠ Dev Tool — Not for Production
                        </span>
                    </div>
                    <h1 style={{ fontSize: 26, fontWeight: 800, margin: 0, marginBottom: 6 }}>
                        WhatsApp Send Test
                    </h1>
                    <p style={{ color: "#666", fontSize: 13, margin: 0, lineHeight: 1.6 }}>
                        Send a message on behalf of a connected user using their credentials.
                        Nothing is saved to the database — this calls Meta's API directly.
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>

                    {/* Phone Number ID */}
                    <div>
                        <label style={LABEL_STYLE} htmlFor="phoneNumberId">
                            Phone Number ID
                        </label>
                        <input
                            id="phoneNumberId"
                            name="phoneNumberId"
                            type="text"
                            placeholder="e.g. 1038801912645044"
                            value={form.phoneNumberId}
                            onChange={handleChange}
                            style={FIELD_STYLE}
                            autoComplete="off"
                        />
                        <p style={{ color: "#555", fontSize: 11, marginTop: 4 }}>
                            Found in user's DB record → <code style={{ color: "#888" }}>whatsapp.phoneNumberId</code>
                        </p>
                    </div>

                    {/* Access Token */}
                    <div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                            <label style={{ ...LABEL_STYLE, marginBottom: 0 }} htmlFor="accessToken">
                                Access Token
                            </label>
                            <button
                                type="button"
                                onClick={() => setShowToken((v) => !v)}
                                style={{
                                    background: "none",
                                    border: "none",
                                    color: "#555",
                                    fontSize: 11,
                                    cursor: "pointer",
                                    padding: 0,
                                }}
                            >
                                {showToken ? "Hide" : "Show"}
                            </button>
                        </div>
                        <input
                            id="accessToken"
                            name="accessToken"
                            type={showToken ? "text" : "password"}
                            placeholder="User's whatsapp.accessToken from DB"
                            value={form.accessToken}
                            onChange={handleChange}
                            style={{ ...FIELD_STYLE, fontFamily: showToken ? "'DM Mono', monospace" : "sans-serif" }}
                            autoComplete="off"
                        />
                        <p style={{ color: "#555", fontSize: 11, marginTop: 4 }}>
                            Found in user's DB record → <code style={{ color: "#888" }}>whatsapp.accessToken</code>
                        </p>
                    </div>

                    {/* Recipient */}
                    <div>
                        <label style={LABEL_STYLE} htmlFor="to">
                            Recipient Phone Number
                        </label>
                        <input
                            id="to"
                            name="to"
                            type="text"
                            placeholder="+2348012345678"
                            value={form.to}
                            onChange={handleChange}
                            style={FIELD_STYLE}
                            autoComplete="off"
                        />
                        <p style={{ color: "#555", fontSize: 11, marginTop: 4 }}>
                            International format with country code, e.g. <code style={{ color: "#888" }}>+234...</code>
                        </p>
                    </div>

                    {/* Message */}
                    <div>
                        <label style={LABEL_STYLE} htmlFor="message">
                            Message
                        </label>
                        <textarea
                            id="message"
                            name="message"
                            rows={4}
                            placeholder="Type your test message here..."
                            value={form.message}
                            onChange={handleChange}
                            style={{
                                ...FIELD_STYLE,
                                resize: "vertical",
                                minHeight: 100,
                            }}
                        />
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={!isValid || loading}
                        style={{
                            width: "100%",
                            padding: "13px",
                            borderRadius: 12,
                            border: "none",
                            background: isValid && !loading ? "#25D366" : "#1a3a28",
                            color: isValid && !loading ? "#fff" : "#3d6b50",
                            fontWeight: 700,
                            fontSize: 14,
                            cursor: isValid && !loading ? "pointer" : "not-allowed",
                            transition: "background 0.15s ease",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 8,
                        }}
                    >
                        {loading ? (
                            <>
                                <span style={{
                                    display: "inline-block",
                                    width: 14,
                                    height: 14,
                                    borderRadius: "50%",
                                    border: "2px solid rgba(255,255,255,0.2)",
                                    borderTopColor: "#fff",
                                    animation: "spin 0.7s linear infinite",
                                }} />
                                Sending…
                            </>
                        ) : (
                            "Send Message"
                        )}
                    </button>
                </form>

                {/* Result */}
                {result && (
                    <div style={{
                        marginTop: 28,
                        borderRadius: 14,
                        border: `1px solid ${result.success ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`,
                        background: result.success ? "rgba(34,197,94,0.06)" : "rgba(239,68,68,0.06)",
                        overflow: "hidden",
                    }}>
                        {/* Status bar */}
                        <div style={{
                            padding: "10px 16px",
                            background: result.success ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)",
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                        }}>
                            <span style={{ fontSize: 16 }}>{result.success ? "✅" : "❌"}</span>
                            <span style={{
                                fontWeight: 700,
                                fontSize: 13,
                                color: result.success ? "#22c55e" : "#ef4444",
                            }}>
                                {result.success ? "Message sent successfully" : "Send failed"}
                            </span>
                        </div>

                        <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
                            {result.success && result.messageId && (
                                <Row label="Message ID" value={result.messageId} />
                            )}
                            {result.success && result.to && (
                                <Row label="Delivered to" value={result.to} />
                            )}
                            {result.error && (
                                <Row label="Error" value={result.error} color="#ef4444" />
                            )}
                            {result.details && (
                                <div>
                                    <p style={{ ...LABEL_STYLE, marginBottom: 6 }}>Meta Error Details</p>
                                    <pre style={{
                                        background: "#0d0d0d",
                                        border: "1px solid #222",
                                        borderRadius: 8,
                                        padding: 12,
                                        fontSize: 11,
                                        color: "#ef4444",
                                        overflowX: "auto",
                                        margin: 0,
                                        fontFamily: "'DM Mono', monospace",
                                    }}>
                                        {JSON.stringify(result.details, null, 2)}
                                    </pre>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Footer note */}
                <p style={{
                    marginTop: 36,
                    textAlign: "center",
                    fontSize: 11,
                    color: "#333",
                    lineHeight: 1.6,
                }}>
                    This page and <code style={{ color: "#444" }}>/api/dev/whatsapp-send</code> must be
                    removed before deploying to production.
                </p>
            </div>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Inter:wght@400;600;700;800&display=swap');
                @keyframes spin { to { transform: rotate(360deg); } }
                * { box-sizing: border-box; }
                input::placeholder, textarea::placeholder { color: #444; }
                input:focus, textarea:focus {
                    border-color: #25D366 !important;
                    box-shadow: 0 0 0 3px rgba(37,211,102,0.1);
                }
            `}</style>
        </div>
    );
}

function Row({ label, value, color }) {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <span style={{ ...LABEL_STYLE, marginBottom: 0 }}>{label}</span>
            <span style={{
                fontSize: 12,
                color: color || "#aaa",
                fontFamily: "'DM Mono', monospace",
                wordBreak: "break-all",
            }}>
                {value}
            </span>
        </div>
    );
}
