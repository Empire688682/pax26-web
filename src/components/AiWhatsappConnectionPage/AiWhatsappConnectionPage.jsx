"use client";

import React, { useEffect, useState } from "react";
import { Phone, ExternalLink, Wifi, WifiOff, Unplug, Webhook } from "lucide-react";
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

  const GREEN = "#22c55e";
  const AMBER = "#f59e0b";

  useEffect(() => { fetchUser(); }, []);

  useEffect(() => {
    window.fbAsyncInit = function () {
      window.FB.init({
        appId: process.env.NEXT_PUBLIC_META_APP_ID,
        cookie: true,
        xfbml: true,
        version: "v19.0",
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

  const handleWithToken = async (accessToken) => {
    try {
      const res = await fetch("/api/meta/use-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ accessToken }),
      });

      const data = await res.json();

      if (!data.success) {
        alert(data.message || "Failed to connect");
        return;
      }

      // ✅ SINGLE → go dashboard
      if (data.type === "single") {
        await fetchUser();
        router.push("/dashboard/automations/market-place?whatsapp=connected");
      }

      // ✅ MULTIPLE → go select page
      if (data.type === "multiple") {
        router.push(`/dashboard/automations/select-phone?session=${data.sessionId}`);
      }

    } catch (err) {
      console.error(err);
      alert("Connection failed");
    }
  };

  const launchWhatsAppSignup = () => {
    if (!window.FB || !sdkReady) {
      alert("Please wait, Facebook SDK is loading...");
      return;
    }
    window.FB.login(
      function (response) {
        console.log("FB RESPONSE:", response);
        if (response.authResponse) {
          const accessToken = response.authResponse.accessToken;
          if (!accessToken) {
            alert("No access token returned. Check your config.");
            return;
          }

          handleWithToken(accessToken);
        }
      },
      {
        config_id: process.env.NEXT_PUBLIC_META_EMBEDDED_SIGNUP_CONFIG_ID,
        response_type: "token", // 🔥 CHANGE THIS
        override_default_response_type: true,
        extras: {
          setup: {
            business: {
              name: "Pax26 Technologies",
            },
          },
        },
      }
    );
  }

  const handleExchangeCode = async (code) => {
    try {
      const res = await fetch("/api/meta/exchange-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      const data = await res.json();

      if (data.success) {
        await fetchUser();
      } else {
        alert("Failed to connect WhatsApp");
      }
    } catch (err) {
      console.error(err);
      alert("Connection failed");
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
                  <p className="wa-mono text-xs font-medium" style={{ color: GREEN }}>
                    {userData?.whatsappBusinessNo}
                  </p>
                ) : (
                  <p className="text-xs" style={{ color: pax26?.textSecondary, opacity: 0.55 }}>
                    No WhatsApp Business number connected
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
          <div className="wa-card wa-slide-3 rounded-2xl p-6 space-y-6"
            style={{ background: pax26?.bg, border: `1px solid ${pax26?.border}` }}>

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

      </div>
    </>
  );
}