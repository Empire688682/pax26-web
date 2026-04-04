"use client";
import React, { useState } from "react";
import {
  Facebook, CheckCircle2, ShieldCheck, Phone,
  ArrowRight, Wifi, Lock, Zap, RefreshCw,
  MessageCircle, AlertCircle, ExternalLink,
} from "lucide-react";
import { useGlobalContext } from "../Context";

/* ── CSS ─────────────────────────────────────────────────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Syne:wght@600;700;800&display=swap');

  .wa-info-root { font-family: 'Syne', sans-serif; }
  .wa-info-mono { font-family: 'DM Mono', monospace; }

  @keyframes wi-slide  { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
  @keyframes wi-glow   { 0%,100%{opacity:0.15} 50%{opacity:0.28} }
  @keyframes wi-pulse  { 0%,100%{transform:scale(1)} 50%{transform:scale(1.04)} }
  @keyframes wi-spin   { to{transform:rotate(360deg)} }
  @keyframes wi-float  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }

  .wi-s1 { animation: wi-slide 0.4s ease both; }
  .wi-s2 { animation: wi-slide 0.4s ease 0.08s both; }
  .wi-s3 { animation: wi-slide 0.4s ease 0.16s both; }
  .wi-s4 { animation: wi-slide 0.4s ease 0.24s both; }

  .wi-glow   { animation: wi-glow  4s ease-in-out infinite; }
  .wi-float  { animation: wi-float 3s ease-in-out infinite; }
  .wi-spin   { animation: wi-spin  0.75s linear infinite; }

  .wi-btn {
    transition: opacity 0.15s ease, transform 0.15s ease, box-shadow 0.15s ease;
    cursor: pointer;
  }
  .wi-btn:hover:not(:disabled) {
    opacity: 0.9; transform: translateY(-2px);
    box-shadow: 0 16px 40px rgba(24,119,242,0.45) !important;
  }
  .wi-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none !important; }

  .wi-card {
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }
  .wi-card:hover { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(0,0,0,0.08); }

  .wi-step {
    transition: background 0.15s ease, border-color 0.15s ease;
  }
`;

const GREEN_WA = "#25D366";
const META_BLUE = "#1877f2";

export default function AiWhatsappConnectInfo() {
  const { pax26, router } = useGlobalContext();
  const [loading, setLoading] = useState(false);

  return (
    <>
      <style>{CSS}</style>
      <div className="wa-info-root" style={{
        background: pax26?.bg || "#f8fafc",
        minHeight: "100vh",
        padding: "24px 16px 60px",
      }}>
        <div style={{ maxWidth: "580px", margin: "0 auto" }}>

          {/* ── Hero card ───────────────────────────── */}
          <div className="wi-s1 wi-card" style={{
            background: pax26?.card || "#fff",
            border: "1px solid rgba(0,0,0,0.07)",
            borderRadius: "24px",
            overflow: "hidden",
            marginBottom: "16px",
          }}>
            {/* green top strip */}
            <div style={{
              height: "3px",
              background: `linear-gradient(90deg, ${GREEN_WA}, rgba(37,211,102,0.3), transparent)`,
            }} />

            {/* glow orb */}
            <div style={{ position: "relative", overflow: "hidden" }}>
              <div className="wi-glow" style={{
                position: "absolute", top: "-60px", right: "-40px",
                width: "240px", height: "240px", borderRadius: "50%",
                background: GREEN_WA, filter: "blur(60px)",
                pointerEvents: "none",
              }} />

              <div style={{ padding: "32px 28px 28px", position: "relative", zIndex: 1 }}>
                {/* icon + badge */}
                <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "20px" }}>
                  <div className="wi-float" style={{
                    width: "52px", height: "52px", borderRadius: "16px",
                    background: `${GREEN_WA}15`,
                    border: `1.5px solid ${GREEN_WA}30`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                  }}>
                    <MessageCircle size={24} style={{ color: GREEN_WA }} />
                  </div>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "3px" }}>
                      <p style={{ fontSize: "16px", fontWeight: 800, color: pax26?.textPrimary || "#111827" }}>
                        Connect WhatsApp
                      </p>
                      <span className="wa-info-mono" style={{
                        fontSize: "9px", letterSpacing: "0.1em", textTransform: "uppercase",
                        background: `${GREEN_WA}12`, color: GREEN_WA,
                        padding: "2px 8px", borderRadius: "20px",
                        border: `1px solid ${GREEN_WA}22`,
                      }}>
                        Official
                      </span>
                    </div>
                    <p className="wa-info-mono" style={{
                      fontSize: "10px", color: pax26?.textSecondary || "rgba(0,0,0,0.38)",
                      letterSpacing: "0.05em",
                    }}>
                      Powered by Meta Cloud API
                    </p>
                  </div>
                </div>

                <p style={{
                  fontSize: "0.9rem", lineHeight: 1.75,
                  color: pax26?.textSecondary || "rgba(0,0,0,0.55)",
                  fontWeight: 400,
                }}>
                  Pax26 connects to WhatsApp using{" "}
                  <strong style={{ color: pax26?.textPrimary || "#111827", fontWeight: 700 }}>
                    Meta's official Cloud API
                  </strong>
                  {" "}— the same infrastructure used by global businesses. Your messages stay secure and private.
                </p>
              </div>
            </div>
          </div>

          {/* ── Why Meta card ────────────────────────── */}
          <div className="wi-s2 wi-card" style={{
            background: pax26?.card || "#fff",
            border: "1px solid rgba(0,0,0,0.07)",
            borderRadius: "20px",
            overflow: "hidden",
            marginBottom: "16px",
          }}>
            <div style={{
              height: "3px",
              background: `linear-gradient(90deg, ${META_BLUE}, rgba(24,119,242,0.3), transparent)`,
            }} />
            <div style={{ padding: "24px 24px 20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                <div style={{
                  width: "34px", height: "34px", borderRadius: "10px",
                  background: "rgba(24,119,242,0.1)", flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <ShieldCheck size={16} style={{ color: META_BLUE }} />
                </div>
                <p style={{ fontSize: "14px", fontWeight: 700, color: pax26?.textPrimary || "#111827" }}>
                  Why Meta Login is Required
                </p>
              </div>

              <p style={{
                fontSize: "0.88rem", lineHeight: 1.75,
                color: pax26?.textSecondary || "rgba(0,0,0,0.5)",
                marginBottom: "16px",
              }}>
                WhatsApp doesn't allow third-party tools to access messages directly. Meta requires you to approve Pax26 so we can send and receive messages securely on your behalf.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {[
                  { icon: Lock, text: "Your data stays protected at all times" },
                  { icon: ShieldCheck, text: "No password sharing — OAuth only" },
                  { icon: RefreshCw, text: "You can disconnect anytime from your settings" },
                ].map(({ icon: Icon, text }, i) => (
                  <div key={i} style={{
                    display: "flex", alignItems: "center", gap: "10px",
                    padding: "10px 14px", borderRadius: "12px",
                    background: pax26?.secondaryBg || "#f8fafc",
                    border: "1px solid rgba(0,0,0,0.06)",
                  }}>
                    <div style={{
                      width: "28px", height: "28px", borderRadius: "8px",
                      background: "rgba(34,197,94,0.1)", flexShrink: 0,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <Icon size={13} style={{ color: "#22c55e" }} />
                    </div>
                    <span style={{
                      fontSize: "0.85rem",
                      color: pax26?.textSecondary || "rgba(0,0,0,0.55)",
                    }}>
                      {text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Business number card ─────────────────── */}
          <div className="wi-s2 wi-card" style={{
            background: pax26?.card || "#fff",
            border: "1px solid rgba(0,0,0,0.07)",
            borderRadius: "20px",
            overflow: "hidden",
            marginBottom: "16px",
          }}>
            <div style={{
              height: "3px",
              background: `linear-gradient(90deg,#f59e0b,rgba(245,158,11,0.3),transparent)`,
            }} />
            <div style={{ padding: "24px 24px 20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                <div style={{
                  width: "34px", height: "34px", borderRadius: "10px",
                  background: "rgba(245,158,11,0.1)", flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Phone size={16} style={{ color: "#f59e0b" }} />
                </div>
                <p style={{ fontSize: "14px", fontWeight: 700, color: pax26?.textPrimary || "#111827" }}>
                  Do I Need a Business Account?
                </p>
              </div>

              <div style={{
                padding: "12px 14px", borderRadius: "12px", marginBottom: "14px",
                background: "rgba(245,158,11,0.07)",
                border: "1px solid rgba(245,158,11,0.2)",
                display: "flex", alignItems: "flex-start", gap: "8px",
              }}>
                <AlertCircle size={14} style={{ color: "#f59e0b", flexShrink: 0, marginTop: "2px" }} />
                <p style={{ fontSize: "0.83rem", color: "#d97706", lineHeight: 1.6 }}>
                  Yes — but it's easier than it sounds. You don't need an existing business account to get started.
                </p>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {[
                  { text: "Use an existing WhatsApp Business number", highlight: true },
                  { text: "Or create a new Business number during setup", highlight: true },
                  { text: "Your personal WhatsApp account cannot be used", highlight: false, warn: true },
                ].map(({ text, highlight, warn }, i) => (
                  <div key={i} style={{
                    display: "flex", alignItems: "flex-start", gap: "10px",
                    padding: "10px 14px", borderRadius: "12px",
                    background: warn ? "rgba(239,68,68,0.05)" : pax26?.secondaryBg || "#f8fafc",
                    border: `1px solid ${warn ? "rgba(239,68,68,0.15)" : "rgba(0,0,0,0.06)"}`,
                  }}>
                    <div style={{
                      width: "20px", height: "20px", borderRadius: "50%", flexShrink: 0,
                      background: warn ? "rgba(239,68,68,0.12)" : "rgba(34,197,94,0.12)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      marginTop: "1px",
                    }}>
                      {warn
                        ? <span style={{ color: "#ef4444", fontSize: "11px", fontWeight: 700 }}>✕</span>
                        : <span style={{ color: "#22c55e", fontSize: "11px" }}>✓</span>
                      }
                    </div>
                    <span style={{
                      fontSize: "0.85rem", lineHeight: 1.55,
                      color: warn ? "#ef4444" : pax26?.textSecondary || "rgba(0,0,0,0.55)",
                    }}>
                      {text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── How it works card ────────────────────── */}
          <div className="wi-s3 wi-card" style={{
            background: pax26?.card || "#fff",
            border: "1px solid rgba(0,0,0,0.07)",
            borderRadius: "20px",
            overflow: "hidden",
            marginBottom: "20px",
          }}>
            <div style={{
              height: "3px",
              background: `linear-gradient(90deg,#a78bfa,rgba(167,139,250,0.3),transparent)`,
            }} />
            <div style={{ padding: "24px 24px 20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
                <div style={{
                  width: "34px", height: "34px", borderRadius: "10px",
                  background: "rgba(167,139,250,0.1)", flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Zap size={16} style={{ color: "#a78bfa" }} />
                </div>
                <p style={{ fontSize: "14px", fontWeight: 700, color: pax26?.textPrimary || "#111827" }}>
                  How Connection Works
                </p>
              </div>

              {/* steps */}
              {[
                { num: "01", text: "Log in with Facebook (Meta)", color: "#1877f2" },
                { num: "02", text: "Select or create a WhatsApp Business account", color: "#25D366" },
                { num: "03", text: "Verify a phone number with your business", color: "#f59e0b" },
                { num: "04", text: "Pax26 activates AI replies instantly", color: "#a78bfa" },
              ].map(({ num, text, color }, i, arr) => (
                <div key={num} style={{ display: "flex", gap: "14px", marginBottom: i < arr.length - 1 ? "4px" : 0 }}>
                  {/* left: number + connector */}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                    <div style={{
                      width: "32px", height: "32px", borderRadius: "10px",
                      background: `${color}12`, border: `1.5px solid ${color}25`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0,
                    }}>
                      <span className="wa-info-mono" style={{ fontSize: "9px", fontWeight: 500, color, letterSpacing: "0.04em" }}>
                        {num}
                      </span>
                    </div>
                    {i < arr.length - 1 && (
                      <div style={{ width: "1.5px", height: "20px", background: "rgba(0,0,0,0.07)", marginTop: "4px" }} />
                    )}
                  </div>
                  {/* right: text */}
                  <div style={{ paddingTop: "6px", paddingBottom: i < arr.length - 1 ? "20px" : 0 }}>
                    <p style={{
                      fontSize: "0.88rem", lineHeight: 1.55,
                      color: pax26?.textSecondary || "rgba(0,0,0,0.55)",
                    }}>
                      {text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── CTA ─────────────────────────────────── */}
          <div className="wi-s4">
            <button
              onClick={() => router.push("/dashboard/automations/whatsapp#whatsapp-connect")}
              disabled={loading}
              className="wi-btn"
              style={{
                width: "100%",
                padding: "16px 24px",
                borderRadius: "16px",
                background: META_BLUE,
                color: "#fff",
                border: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
                fontFamily: "'Syne', sans-serif",
                fontSize: "15px",
                fontWeight: 700,
                letterSpacing: "0.01em",
                boxShadow: "0 10px 32px rgba(24,119,242,0.35)",
                marginBottom: "12px",
              }}>
              {loading ? (
                <>
                  <div className="wi-spin" style={{
                    width: "18px", height: "18px", borderRadius: "50%",
                    border: "2px solid rgba(255,255,255,0.3)",
                    borderTopColor: "#fff",
                  }} />
                  Connecting to Meta…
                </>
              ) : (
                <>
                  <Facebook size={18} />
                  Continue with Meta
                  <ArrowRight size={16} />
                </>
              )}
            </button>

            {/* security strip */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: "16px",
              padding: "12px 16px", borderRadius: "12px",
              background: pax26?.card || "#fff",
              border: "1px solid rgba(0,0,0,0.07)",
            }}>
              {[
                { icon: Wifi, label: "Cloud API" },
                { icon: ShieldCheck, label: "Encrypted" },
                { icon: CheckCircle2, label: "Official" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                  <Icon size={12} style={{ color: GREEN_WA }} />
                  <span className="wa-info-mono" style={{
                    fontSize: "9px", letterSpacing: "0.08em", textTransform: "uppercase",
                    color: pax26?.textSecondary || "rgba(0,0,0,0.38)",
                  }}>
                    {label}
                  </span>
                </div>
              ))}
            </div>

            <p className="wa-info-mono" style={{
              fontSize: "10px", textAlign: "center", marginTop: "10px",
              color: pax26?.textSecondary || "rgba(0,0,0,0.3)",
              letterSpacing: "0.04em",
            }}>
              Powered by WhatsApp Cloud API · Meta Official Partner
            </p>
          </div>

        </div>
      </div>
    </>
  );
}