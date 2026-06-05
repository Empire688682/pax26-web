"use client";

import React, { useEffect, useState, useRef } from "react";
import { Phone, ExternalLink, Wifi, WifiOff, Unplug, Webhook, AlertTriangle, CheckCircle2, ShieldAlert, ArrowRight } from "lucide-react";
import { useGlobalContext } from "../Context";

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Syne:wght@600;700;800&display=swap');

  .wa-root { font-family: 'Syne', sans-serif; }
  .wa-mono { font-family: 'DM Mono', monospace; }

  @keyframes wa-slide {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes wa-pulse {
    0%, 100% { box-shadow: 0 0 0 0 rgba(34,197,94,0.5); }
    60%       { box-shadow: 0 0 0 8px rgba(34,197,94,0); }
  }
  @keyframes wa-spin { to { transform: rotate(360deg); } }
  @keyframes wa-blink {
    0%, 100% { opacity: 1; }
    50%      { opacity: 0.35; }
  }

  .wa-slide-1 { animation: wa-slide 0.4s ease both; }
  .wa-slide-2 { animation: wa-slide 0.4s ease 0.08s both; }
  .wa-slide-3 { animation: wa-slide 0.4s ease 0.16s both; }
  .wa-slide-4 { animation: wa-slide 0.4s ease 0.24s both; }

  .wa-pulse-dot { animation: wa-pulse 2s ease-out infinite; }
  .wa-spin      { animation: wa-spin  0.8s linear   infinite; }
  .wa-blink     { animation: wa-blink 1.6s ease-in-out infinite; }

  .wa-card { transition: box-shadow 0.2s ease; }
  .wa-card:hover { box-shadow: 0 0 0 1px currentColor; }

  .wa-btn { transition: opacity 0.16s ease, transform 0.16s ease; }
  .wa-btn:hover:not(:disabled)  { opacity: 0.85; transform: translateY(-1px); }
  .wa-btn:active:not(:disabled) { transform: translateY(0); }
  .wa-btn:disabled { opacity: 0.45; cursor: not-allowed; }

  .wa-step { transition: background 0.2s ease; }
`;

const IcoArrow = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

const IcoMeta = () => (
  <svg width="18" height="18" viewBox="0 0 40 40" fill="currentColor">
    <path d="M20 3C10.6 3 3 10.6 3 20s7.6 17 17 17 17-7.6 17-17S29.4 3 20 3zm-3.5 24.2c-2.7 0-4.9-2.2-4.9-4.9s2.2-4.9 4.9-4.9c1.3 0 2.5.5 3.4 1.3l-1.4 1.4c-.5-.5-1.2-.8-2-.8-1.7 0-3 1.3-3 3s1.3 3 3 3c1.5 0 2.5-.8 2.8-2h-2.8v-1.9h4.8c.1.3.1.6.1.9 0 2.7-1.8 4.9-4.9 4.9zm9.5-.2h-2v-5c0-1.3-.5-1.9-1.4-1.9-1 0-1.6.7-1.6 1.9v5h-2v-9.1h1.9v1c.5-.7 1.3-1.2 2.3-1.2 1.8 0 2.8 1.2 2.8 3.3v6z" />
  </svg>
);

function Step({ num, text, pax26 }) {
  return (
    <div className="wa-step flex items-center gap-3 py-2.5 px-1 rounded-xl">
      <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
        style={{ background: `${pax26?.primary}15`, color: pax26?.primary }}>
        {num}
      </div>
      <p className="text-sm" style={{ color: pax26?.textSecondary, opacity: 0.75 }}>{text}</p>
    </div>
  );
}

export default function AiWhatsappConnectionPage() {
  const { pax26, router, isWhatsappNumberConnected, userData, fetchUser } = useGlobalContext();
  const [loading, setLoading] = useState(false);
  const [sdkReady, setSdkReady] = useState(false);
  const [metaLoading, setMetaLoading] = useState(false);
  const popupTimerRef = useRef(null);
  // Captures waba_id + phone_number_id sent by Meta's popup via postMessage
  const sessionInfoRef = useRef(null);

  const GREEN = "#22c55e";
  const AMBER = "#f59e0b";

  // QR States
  const [connectionMethod, setConnectionMethod] = useState("meta");
  const [qrCode, setQrCode] = useState(null);
  const [qrStatus, setQrStatus] = useState("DISCONNECTED");

  // --- Risk acknowledgement state ---
  const [showRiskModal, setShowRiskModal] = useState(false);
  const [riskChecked, setRiskChecked] = useState(false);
  const [riskAccepted, setRiskAccepted] = useState(false); // true once user submits

  // --- Ban-risk warning state ---
  const [qrUsage, setQrUsage] = useState(null); // { weeklyCount, dailyCount, dailyLimit, banRiskThreshold, isBanRisk }

  useEffect(() => { fetchUser(); }, []);

  // Fetch QR usage stats for ban-risk banner (only when QR-connected)
  useEffect(() => {
    if (!userData?.whatsapp?.connected || userData?.whatsapp?.connectionType !== "qr") return;
    const fetchUsage = async () => {
      try {
        const res = await fetch("/api/connection/qr/usage");
        const data = await res.json();
        if (data.success) setQrUsage(data);
      } catch (err) {
        console.error("Error fetching QR usage:", err);
      }
    };
    fetchUsage();
  }, [userData?.whatsapp?.connected, userData?.whatsapp?.connectionType]);

  // When user switches to QR tab, show modal if not yet accepted
  const handleQRTabSelect = () => {
    setConnectionMethod("qr");
    if (!riskAccepted) {
      setShowRiskModal(true);
    }
  };

  // User confirms risk modal
  const handleRiskAccept = async () => {
    try {
      await fetch("/api/connection/qr/risk-ack", { method: "POST", credentials: "include" });
    } catch (err) {
      console.error("Failed to record risk acknowledgement:", err);
    }
    setRiskAccepted(true);
    setShowRiskModal(false);
  };

  useEffect(() => {
    let intervalId;
    if (!isWhatsappNumberConnected && connectionMethod === "qr" && riskAccepted) {
      const checkQrStatus = async () => {
        try {
          const res = await fetch("/api/connection/qr/status");
          const data = await res.json();
          if (data.success) {
            setQrStatus(data.status);
            if (data.status === "QR" && data.qr) {
              setQrCode(data.qr);
            } else if (data.status === "CONNECTED") {
              await fetchUser();
            }
          }
        } catch (err) {
          console.error("Error polling QR status:", err);
        }
      };

      checkQrStatus();
      intervalId = setInterval(checkQrStatus, 4000);
    } else {
      setQrCode(null);
      setQrStatus("DISCONNECTED");
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [connectionMethod, isWhatsappNumberConnected, riskAccepted]);

  useEffect(() => {
    return () => {
      if (popupTimerRef.current) {
        clearInterval(popupTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    window.fbAsyncInit = function () {
      window.FB.init({
        appId: process.env.NEXT_PUBLIC_META_APP_ID,
        cookie: true,
        xfbml: true,
        version: "v22.0",
      });
      setSdkReady(true);
    };

    (function (d, s, id) {
      if (d.getElementById(id)) return;
      const js = d.createElement(s);
      js.id = id;
      js.src = "https://connect.facebook.net/en_US/sdk.js";
      d.body.appendChild(js);
    })(document, "script", "facebook-jssdk");
  }, []);

  const handleWithCode = async (code) => {
    console.log("Using authorization code:", code ? "received" : "missing");
    console.log("Session info from postMessage:", sessionInfoRef.current);
    try {
      const res = await fetch("/api/meta/exchange-code", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          // ✅ Pass WABA/phone IDs captured from Meta's postMessage — backend uses these directly
          wabaId: sessionInfoRef.current?.wabaId || null,
          phoneNumberId: sessionInfoRef.current?.phoneNumberId || null,
        }),
      });

      const data = await res.json();
      console.log("exchange-code response:", data);

      if (!data.success) {
        alert(data.message || "Failed to connect");
        return;
      }

      router.push(`/dashboard/automations/select-phone?session=${data.sessionId}`);

    } catch (err) {
      console.error("exchange-code fetch error:", err);
      alert("Connection failed. Please try again.");
    } finally {
      setMetaLoading(false);
      sessionInfoRef.current = null;
    }
  };

  const launchWhatsAppSignup = () => {
    if (!window.FB || !sdkReady) {
      alert("Please wait, Facebook SDK is loading...");
      return;
    }
    setMetaLoading(true);
    sessionInfoRef.current = null;

    // ✅ Listen for Meta's postMessage with waba_id + phone_number_id
    // This fires BEFORE FB.login callback and is the most reliable source
    const handleSessionMessage = (event) => {
      // Log ALL postMessages so we can see what Meta actually sends
      try {
        const raw = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
        if (raw && typeof raw === "object") {
          console.log("📬 postMessage from", event.origin, "→", JSON.stringify(raw));
          if (
            raw?.type === "WA_EMBEDDED_SIGNUP" &&
            raw?.event === "FINISH" &&
            raw?.data
          ) {
            console.log("📨 Meta session info captured:", raw.data);
            sessionInfoRef.current = {
              wabaId: raw.data.waba_id,
              phoneNumberId: raw.data.phone_number_id,
            };
          }
        }
      } catch {
        // non-JSON messages (e.g. from other extensions) — ignore
      }
    };
    window.addEventListener("message", handleSessionMessage);

    let popupWindow = null;
    const originalWindowOpen = window.open;
    window.open = function (...args) {
      popupWindow = originalWindowOpen.apply(this, args);
      return popupWindow;
    };

    window.FB.login(
      function (response) {
        // Log the FULL response to see all available data
        console.log("FB RESPONSE (full):", JSON.stringify(response));
        console.log("sessionInfo captured:", sessionInfoRef.current);
        window.removeEventListener("message", handleSessionMessage);
        window.open = originalWindowOpen;
        if (popupTimerRef.current) {
          clearInterval(popupTimerRef.current);
          popupTimerRef.current = null;
        }
        if (response.authResponse) {
          const code = response.authResponse.code;
          if (!code) {
            setMetaLoading(false);
            alert("No authorization code returned. Check your app config.");
            return;
          }
          handleWithCode(code);
        } else {
          setMetaLoading(false);
        }
      },
      {
        config_id: process.env.NEXT_PUBLIC_META_EMBEDDED_SIGNUP_CONFIG_ID,
        response_type: "code",
        override_default_response_type: true,
        extras: {
          feature: "whatsapp_embedded_signup",
          sessionInfoVersion: 3,
          setup: { business: { name: "Pax26 Technologies" } },
        },
      }
    );

    if (popupWindow) {
      if (popupTimerRef.current) clearInterval(popupTimerRef.current);
      popupTimerRef.current = setInterval(() => {
        if (popupWindow.closed) {
          clearInterval(popupTimerRef.current);
          popupTimerRef.current = null;
          window.removeEventListener("message", handleSessionMessage);
          window.open = originalWindowOpen;
          setMetaLoading(false);
        }
      }, 1000);
    }
  };

  const disconnectNumber = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/automations/disconnect-whatsapp", {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) { await fetchUser(); }
      else alert("Failed to disconnect.");
    } catch {
      alert("Disconnect error!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{CSS}</style>
      <div className="wa-root max-w-5xl mx-auto py-10 pb-20 space-y-5">

        {/* ── Risk Acknowledgement Modal (blocking overlay) ── */}
        {showRiskModal && (
          <div style={{
            position: "fixed", inset: 0, zIndex: 9999,
            background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "16px",
          }}>
            <div style={{
              background: pax26?.bg, borderRadius: "20px", maxWidth: "440px", width: "100%",
              border: "1.5px solid rgba(245,158,11,0.4)",
              boxShadow: "0 24px 60px rgba(0,0,0,0.4)",
              overflow: "hidden",
            }}>
              {/* amber top strip */}
              <div style={{ height: "3px", background: "linear-gradient(90deg, #f59e0b, #ef4444, transparent)" }} />
              <div style={{ padding: "28px 24px 24px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "18px" }}>
                  <div style={{
                    width: "44px", height: "44px", borderRadius: "12px", flexShrink: 0,
                    background: "rgba(245,158,11,0.12)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <ShieldAlert size={22} style={{ color: "#f59e0b" }} />
                  </div>
                  <div>
                    <p style={{ fontSize: "15px", fontWeight: 800, color: pax26?.textPrimary, marginBottom: "2px" }}>
                      QR Connection Risk Notice
                    </p>
                    <p style={{ fontSize: "11px", color: pax26?.textSecondary, opacity: 0.5 }}>
                      Read carefully before continuing
                    </p>
                  </div>
                </div>

                <div style={{
                  padding: "14px 16px", borderRadius: "12px", marginBottom: "20px",
                  background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)",
                }}>
                  <p style={{ fontSize: "13px", lineHeight: 1.7, color: pax26?.textSecondary }}>
                    QR connection uses an unofficial WhatsApp bridge. WhatsApp may detect automated activity
                    and temporarily restrict or ban your number. <strong style={{ color: pax26?.textPrimary }}>
                    Pax26 is not responsible for number restrictions.</strong> By continuing, you accept this risk.
                  </p>
                </div>

                {/* Checkbox */}
                <label style={{
                  display: "flex", alignItems: "flex-start", gap: "10px", cursor: "pointer",
                  marginBottom: "20px",
                }}>
                  <div
                    onClick={() => setRiskChecked(v => !v)}
                    style={{
                      width: "18px", height: "18px", borderRadius: "5px", flexShrink: 0, marginTop: "1px",
                      border: `2px solid ${riskChecked ? "#f59e0b" : pax26?.border}`,
                      background: riskChecked ? "rgba(245,158,11,0.15)" : "transparent",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      transition: "all 0.15s ease", cursor: "pointer",
                    }}
                  >
                    {riskChecked && <span style={{ color: "#f59e0b", fontSize: "11px", fontWeight: 700 }}>✓</span>}
                  </div>
                  <span
                    style={{ fontSize: "13px", color: pax26?.textSecondary, lineHeight: 1.5, cursor: "pointer" }}
                    onClick={() => setRiskChecked(v => !v)}
                  >
                    I understand and accept the risk — Continue
                  </span>
                </label>

                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    onClick={() => { setShowRiskModal(false); setConnectionMethod("meta"); setRiskChecked(false); }}
                    style={{
                      flex: 1, padding: "11px", borderRadius: "12px", fontSize: "13px", fontWeight: 600,
                      background: pax26?.secondaryBg, color: pax26?.textSecondary,
                      border: `1px solid ${pax26?.border}`, cursor: "pointer",
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRiskAccept}
                    disabled={!riskChecked}
                    style={{
                      flex: 1, padding: "11px", borderRadius: "12px", fontSize: "13px", fontWeight: 700,
                      background: riskChecked ? "#f59e0b" : "rgba(245,158,11,0.3)",
                      color: riskChecked ? "#fff" : "rgba(255,255,255,0.4)",
                      border: "none", cursor: riskChecked ? "pointer" : "not-allowed",
                      transition: "all 0.15s ease",
                    }}
                  >
                    Continue with QR
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Ban-risk warning banner (shows when connected via QR + high usage) ── */}
        {userData?.whatsapp?.connected && userData?.whatsapp?.connectionType === "qr" && qrUsage?.isBanRisk && (
          <div style={{
            padding: "14px 18px", borderRadius: "14px",
            background: "rgba(245,158,11,0.08)", border: "1.5px solid rgba(245,158,11,0.35)",
            display: "flex", alignItems: "flex-start", gap: "12px",
          }}>
            <AlertTriangle size={18} style={{ color: "#f59e0b", flexShrink: 0, marginTop: "1px" }} />
            <div>
              <p style={{ fontSize: "13px", fontWeight: 700, color: "#f59e0b", marginBottom: "4px" }}>
                High Volume Warning
              </p>
              <p style={{ fontSize: "12px", color: pax26?.textSecondary, lineHeight: 1.6 }}>
                You&apos;ve sent a high volume of automated messages this week using QR connection.
                High volume increases ban risk. Consider upgrading to Official Meta API for a dedicated business number.
              </p>
              <button
                onClick={() => setConnectionMethod("meta")}
                style={{
                  marginTop: "10px", display: "inline-flex", alignItems: "center", gap: "6px",
                  fontSize: "12px", fontWeight: 700, color: pax26?.primary,
                  background: "transparent", border: "none", cursor: "pointer", padding: 0,
                }}
              >
                Learn about Meta API <ArrowRight size={13} />
              </button>
            </div>
          </div>
        )}

        {/* ── Meta API upgrade nudge (visible to QR-connected users) ── */}
        {userData?.whatsapp?.connected && userData?.whatsapp?.connectionType === "qr" && (
          <div style={{
            padding: "14px 18px", borderRadius: "14px",
            background: `${pax26?.primary}08`, border: `1px dashed ${pax26?.primary}35`,
            display: "flex", alignItems: "flex-start", gap: "12px",
          }}>
            <div style={{
              width: "32px", height: "32px", borderRadius: "8px", flexShrink: 0,
              background: `${pax26?.primary}15`, color: pax26?.primary,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <ArrowRight size={15} />
            </div>
            <div>
              <p style={{ fontSize: "13px", fontWeight: 700, color: pax26?.textPrimary, marginBottom: "4px" }}>
                Upgrade to Official Meta API
              </p>
              <p style={{ fontSize: "12px", color: pax26?.textSecondary, lineHeight: 1.65, opacity: 0.8 }}>
                You don&apos;t have to abandon your personal number. Get a ₦500 SIM from any network, activate
                WhatsApp Business on it, and use it purely for customer replies. Your clients see your
                business name — not just a number. Meta API is stable, ban-proof, and has no daily limits.
              </p>
              <button
                onClick={() => router.push("/dashboard/automations/whatsapp-connect-info")}
                style={{
                  marginTop: "10px", display: "inline-flex", alignItems: "center", gap: "6px",
                  fontSize: "12px", fontWeight: 700, color: pax26?.primary,
                  background: "transparent", border: "none", cursor: "pointer", padding: 0,
                }}
              >
                How Meta API works <ArrowRight size={13} />
              </button>
            </div>
          </div>
        )}

        {/* Page header */}
        <div className="wa-slide-1 space-y-1 mb-8">
          <div className="flex items-center gap-2 mb-3">
            <span className="wa-mono text-[10px] font-medium tracking-widest uppercase"
              style={{ color: pax26?.textSecondary, opacity: 0.4 }}>
              Integrations
            </span>
            <div className="h-px w-10 flex-1" style={{ background: pax26?.border }} />
          </div>
          <h1 className="text-3xl font-extrabold leading-tight" style={{ color: pax26?.textPrimary }}>
            WhatsApp Connection
          </h1>
          <p className="text-sm" style={{ color: pax26?.textSecondary, opacity: 0.6 }}>
            Link your WhatsApp Business number to enable AI-powered replies and automations.
          </p>
        </div>

        {/* Connection status card */}
        <div className="wa-card wa-slide-2 rounded-2xl overflow-hidden"
          style={{
            background: pax26?.bg,
            border: `1px solid ${isWhatsappNumberConnected ? "rgba(34,197,94,0.3)" : pax26?.border}`,
          }}>
          <div className="h-1 w-full" style={{ background: isWhatsappNumberConnected ? GREEN : pax26?.border }} />
          <div className="p-5 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <div className="relative">
                {isWhatsappNumberConnected && (
                  <span className="wa-pulse-dot absolute inset-0 rounded-full pointer-events-none"
                    style={{ background: "rgba(34,197,94,0.15)" }} />
                )}
                <div className="relative w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{
                    background: isWhatsappNumberConnected ? "rgba(34,197,94,0.12)" : `${AMBER}10`,
                    color: isWhatsappNumberConnected ? GREEN : AMBER,
                  }}>
                  {isWhatsappNumberConnected ? <Wifi size={22} /> : <WifiOff size={22} />}
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-sm font-bold" style={{ color: pax26?.textPrimary }}>
                    {isWhatsappNumberConnected ? "Connected" : "Not Connected"}
                  </p>
                  <span className="wa-mono text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{
                      background: isWhatsappNumberConnected ? "rgba(34,197,94,0.12)" : `${AMBER}12`,
                      color: isWhatsappNumberConnected ? GREEN : AMBER,
                      border: `1px solid ${isWhatsappNumberConnected ? "rgba(34,197,94,0.25)" : AMBER + "30"}`,
                    }}>
                    {isWhatsappNumberConnected ? "● Live" : "○ Idle"}
                  </span>
                </div>
                {isWhatsappNumberConnected ? (
                  <div className="space-y-0.5">
                    <p className="wa-mono text-xs font-medium" style={{ color: GREEN }}>
                      {userData?.whatsappBusinessNo || userData?.whatsapp?.displayPhone}
                    </p>
                    <p className="text-[10px]" style={{ color: pax26?.textSecondary, opacity: 0.5 }}>
                      Connected via {userData?.whatsapp?.connectionType === "qr" ? "Direct QR Scan" : "Meta Cloud API"}
                    </p>
                  </div>
                ) : (
                  <p className="text-xs" style={{ color: pax26?.textSecondary, opacity: 0.55 }}>
                    No WhatsApp number connected
                  </p>
                )}
              </div>
            </div>

            {isWhatsappNumberConnected && (
              <button
                className="wa-btn flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold"
                onClick={disconnectNumber}
                disabled={loading}
                style={{
                  background: "rgba(239,68,68,0.08)",
                  color: "#ef4444",
                  border: "1px solid rgba(239,68,68,0.2)",
                }}>
                {loading
                  ? <><span className="w-3.5 h-3.5 rounded-full border-2 border-red-400 border-t-transparent wa-spin" />Disconnecting…</>
                  : <><Unplug size={13} /> Disconnect</>
                }
              </button>
            )}
          </div>
        </div>

        {/* Connect flow */}
        {!isWhatsappNumberConnected && (
          <div
            id="connect"
            className="wa-card wa-slide-3 rounded-2xl p-6 space-y-6"
            style={{ background: pax26?.bg, border: `1px solid ${pax26?.border}` }}>

            {/* Tab Switcher */}
            <div className="flex gap-2 p-1 rounded-xl" style={{ background: pax26?.secondaryBg, border: `1px solid ${pax26?.border}` }}>
              <button
                className="flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all duration-200"
                onClick={() => setConnectionMethod("meta")}
                style={{
                  background: connectionMethod === "meta" ? pax26?.bg : "transparent",
                  color: connectionMethod === "meta" ? pax26?.textPrimary : pax26?.textSecondary,
                  boxShadow: connectionMethod === "meta" ? "0 4px 12px rgba(0,0,0,0.05)" : "none",
                  border: connectionMethod === "meta" ? `1px solid ${pax26?.border}` : "1px solid transparent"
                }}
              >
                Official Meta API
              </button>
              <button
                className="flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all duration-200"
                onClick={() => setConnectionMethod("qr")}
                style={{
                  background: connectionMethod === "qr" ? pax26?.bg : "transparent",
                  color: connectionMethod === "qr" ? pax26?.textPrimary : pax26?.textSecondary,
                  boxShadow: connectionMethod === "qr" ? "0 4px 12px rgba(0,0,0,0.05)" : "none",
                  border: connectionMethod === "qr" ? `1px solid ${pax26?.border}` : "1px solid transparent",
                  position: "relative",
                }}
              >
                Direct QR Scan
                <span style={{
                  position: "absolute", top: "-6px", right: "-4px",
                  fontSize: "8px", fontWeight: 700, letterSpacing: "0.04em",
                  background: "#f59e0b", color: "#fff",
                  padding: "1px 5px", borderRadius: "20px",
                  textTransform: "uppercase",
                }}>
                  Soon
                </span>
              </button>
            </div>

            {connectionMethod === "meta" ? (
              <>
                <div>
                  <h2 className="text-base font-bold mb-1" style={{ color: pax26?.textPrimary }}>
                    Connect WhatsApp Business
                  </h2>
                  <p className="text-xs" style={{ color: pax26?.textSecondary, opacity: 0.55 }}>
                    Only Business accounts are supported — personal numbers won't work.
                  </p>
                </div>

                <div className="flex items-start gap-3 p-4 rounded-xl"
                  style={{ background: `${pax26?.primary}08`, border: `1px dashed ${pax26?.primary}35` }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: `${pax26?.primary}15`, color: pax26?.primary }}>
                    <Phone size={15} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold mb-0.5" style={{ color: pax26?.textPrimary }}>
                      WhatsApp Business required
                    </p>
                    <p className="text-xs leading-relaxed" style={{ color: pax26?.textSecondary, opacity: 0.65 }}>
                      You need an active WhatsApp Business account linked to a Meta Business Manager.
                      Personal WhatsApp numbers are not supported.
                    </p>
                  </div>
                </div>

                {/* ⚠️ Dedicated SIM warning */}
                <div
                  className="rounded-xl p-4 space-y-3"
                  style={{ background: "rgba(245,158,11,0.07)", border: "1.5px solid rgba(245,158,11,0.3)" }}
                >
                  <div className="flex items-center gap-2">
                    <AlertTriangle size={15} className="flex-shrink-0" style={{ color: "#f59e0b" }} />
                    <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "#f59e0b" }}>
                      Important — Read before connecting
                    </p>
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: pax26?.textSecondary, opacity: 0.85 }}>
                    For the best experience, use a <strong style={{ color: pax26?.textPrimary }}>dedicated business SIM</strong> that has <strong style={{ color: pax26?.textPrimary }}>never been registered on personal WhatsApp</strong>. If you migrate a personal number, it will be removed from consumer WhatsApp and your customers may not be able to reach it.
                  </p>
                  <div className="space-y-1.5 pt-0.5">
                    {[
                      "Use a fresh SIM dedicated to your business",
                      "Never been on regular/personal WhatsApp",
                      "Customers can message it immediately after setup",
                    ].map((tip, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <CheckCircle2 size={13} className="flex-shrink-0 mt-0.5" style={{ color: "#22c55e" }} />
                        <p className="text-xs" style={{ color: pax26?.textSecondary, opacity: 0.75 }}>{tip}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div id="whatsapp-connect">
                  <p className="text-xs font-bold uppercase tracking-widest mb-2"
                    style={{ color: pax26?.textSecondary, opacity: 0.4 }}>
                    What happens next
                  </p>
                  <div className="divide-y" style={{ borderColor: pax26?.border }}>
                    {[
                      "Log in with your Facebook account",
                      "Create or select a Meta Business account",
                      "Choose your WhatsApp Business number",
                      "Approve Pax26 to manage AI replies",
                    ].map((step, i) => <Step key={i} num={i + 1} text={step} pax26={pax26} />)}
                  </div>
                </div>

                {/* CTA buttons */}
                <div className="space-y-3 pt-1">
                  <button
                    className="wa-btn w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl text-sm font-bold text-white"
                    onClick={launchWhatsAppSignup}
                    disabled={!sdkReady}
                    style={{
                      background: "#1877F2",
                      boxShadow: "0 10px 28px rgba(24,119,242,0.35)",
                    }}>
                    {sdkReady
                      ? <><IcoMeta /> Continue with Meta <ExternalLink size={14} /></>
                      : "Loading SDK..."
                    }
                  </button>

                  <button
                    className="wa-btn w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-semibold"
                    onClick={() => router.push("/dashboard/automations/whatsapp-connect-info")}
                    style={{
                      background: pax26?.secondaryBg,
                      color: pax26?.textSecondary,
                      border: `1px solid ${pax26?.border}`,
                    }}>
                    How does WhatsApp connection work? <IcoArrow />
                  </button>

                  <p className="wa-mono text-center text-[10px]" style={{ color: pax26?.textSecondary, opacity: 0.35 }}>
                    Pax26 uses Meta's official WhatsApp Cloud API
                  </p>
                </div>
              </>
            ) : (
              <>
                <div>
                  <h2 className="text-base font-bold mb-1" style={{ color: pax26?.textPrimary }}>
                    Direct QR Scan — Coming Soon
                  </h2>
                  <p className="text-xs" style={{ color: pax26?.textSecondary, opacity: 0.55 }}>
                    Connect personal or business WhatsApp numbers via QR scanning.
                  </p>
                </div>

                <div style={{
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                  padding: "48px 24px", borderRadius: "16px", textAlign: "center",
                  background: pax26?.secondaryBg, border: `1px dashed ${pax26?.border}`,
                }}>
                  {/* QR placeholder icon */}
                  <div style={{
                    width: "72px", height: "72px", borderRadius: "16px", marginBottom: "20px",
                    background: "rgba(245,158,11,0.1)", border: "1.5px solid rgba(245,158,11,0.3)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
                      <rect x="3" y="14" width="7" height="7" rx="1"/>
                      <path d="M14 14h2v2h-2zM18 14h3M14 18h2M18 18h3v3M14 21h2"/>
                    </svg>
                  </div>

                  <span style={{
                    display: "inline-block", marginBottom: "12px",
                    fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
                    background: "rgba(245,158,11,0.12)", color: "#f59e0b",
                    padding: "3px 12px", borderRadius: "20px", border: "1px solid rgba(245,158,11,0.3)",
                  }}>
                    Coming Soon
                  </span>

                  <p style={{ fontSize: "14px", fontWeight: 700, color: pax26?.textPrimary, marginBottom: "8px" }}>
                    QR connection is in development
                  </p>
                  <p style={{ fontSize: "12px", color: pax26?.textSecondary, opacity: 0.65, lineHeight: 1.6, maxWidth: "280px" }}>
                    We&apos;re working to make QR scanning available. In the meantime, use the Official Meta API — it&apos;s more stable and ban-proof.
                  </p>

                  <button
                    onClick={() => setConnectionMethod("meta")}
                    style={{
                      marginTop: "20px", display: "inline-flex", alignItems: "center", gap: "6px",
                      padding: "10px 20px", borderRadius: "12px", fontSize: "12px", fontWeight: 700,
                      background: pax26?.primary, color: "#fff", border: "none", cursor: "pointer",
                    }}
                  >
                    Switch to Meta API
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Webhook status card */}
        <div className="wa-card wa-slide-4 rounded-2xl p-5"
          style={{ background: pax26?.bg, border: `1px solid ${pax26?.border}` }}>

          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: isWhatsappNumberConnected ? "rgba(34,197,94,0.1)" : pax26?.secondaryBg,
                  color: isWhatsappNumberConnected ? GREEN : pax26?.textSecondary,
                }}>
                <Webhook size={18} />
              </div>
              <div>
                <p className="text-sm font-bold mb-0.5" style={{ color: pax26?.textPrimary }}>Webhook Status</p>
                <p className="text-xs" style={{ color: pax26?.textSecondary, opacity: 0.55 }}>
                  Incoming WhatsApp messages route to your Pax26 AI endpoint
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
              style={{
                background: isWhatsappNumberConnected ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.08)",
                border: `1px solid ${isWhatsappNumberConnected ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)"}`,
              }}>
              <span className={`w-2 h-2 rounded-full block ${isWhatsappNumberConnected ? "wa-blink" : ""}`}
                style={{ background: isWhatsappNumberConnected ? GREEN : "#ef4444" }} />
              <span className="wa-mono text-xs font-medium"
                style={{ color: isWhatsappNumberConnected ? GREEN : "#ef4444" }}>
                {isWhatsappNumberConnected ? "Active" : "Not verified"}
              </span>
            </div>
          </div>

          <div className="mt-4 pt-4 grid grid-cols-2 gap-3"
            style={{ borderTop: `1px solid ${pax26?.border}` }}>
            {[
              { label: "Protocol", value: "HTTPS / Meta Cloud API" },
              { label: "Scope", value: "messages, business_management" },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-xl px-3 py-2.5"
                style={{ background: pax26?.secondaryBg }}>
                <p className="wa-mono text-[10px] mb-1 uppercase tracking-wider"
                  style={{ color: pax26?.textSecondary, opacity: 0.4 }}>
                  {label}
                </p>
                <p className="wa-mono text-xs font-medium" style={{ color: pax26?.textPrimary }}>
                  {value}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Loading Overlay */}
        {metaLoading && (
          <div style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.85)",
            backdropFilter: "blur(12px)",
            zIndex: 9999,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "24px",
            color: "#fff",
            animation: "wa-slide 0.3s ease-out"
          }}>
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-blue-500/20 border-t-blue-500 wa-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <IcoMeta />
              </div>
            </div>
            <div className="text-center flex flex-col items-center">
              <h3 className="text-xl font-bold mb-2">Connecting to Meta</h3>
              <p className="text-sm opacity-60 max-w-xs mb-6">
                Securely authenticating with WhatsApp Cloud API. Please do not close this window.
              </p>
              <button
                onClick={() => {
                  setMetaLoading(false);
                  if (popupTimerRef.current) {
                    clearInterval(popupTimerRef.current);
                    popupTimerRef.current = null;
                  }
                }}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold tracking-wide border transition-all duration-200"
                style={{
                  background: "rgba(255, 255, 255, 0.08)",
                  borderColor: "rgba(255, 255, 255, 0.15)",
                  color: "rgba(255, 255, 255, 0.8)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.15)";
                  e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.25)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)";
                  e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.15)";
                }}
              >
                Cancel Connection
              </button>
            </div>
          </div>
        )}

      </div>
    </>
  );
}