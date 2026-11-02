"use client";

/**
 * DeliveryMethodStage.jsx
 *
 * Stage 2 of the dedicated checkout flow.
 * Only shown when the seller has BOTH delivery AND pickup enabled.
 *
 * Two tabs:
 *   Delivery — door delivery with zone breakdown (or flat/quote note)
 *   Pickup   — seller's pickup address + instructions
 *
 * Props:
 *   store    — serialised store object (fulfillmentSettings, businessName, etc.)
 *   t        — theme object from getTheme()
 *   slug     — store slug
 *   onBack   — () => void
 *   onSelect — (method: "delivery" | "pickup") => void
 */

import { useState } from "react";

/* ── Icons ────────────────────────────────────────────────────── */
const BackIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);
const TruckIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="3" width="15" height="13" rx="2"/>
    <path d="M16 8h4l3 3v5h-7V8z"/>
    <circle cx="5.5" cy="18.5" r="2.5"/>
    <circle cx="18.5" cy="18.5" r="2.5"/>
  </svg>
);
const StoreIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);
const PinIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
);
const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const ClockIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
);

/* ── CSS ──────────────────────────────────────────────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
  .dms-root { font-family: 'Inter', -apple-system, sans-serif; -webkit-font-smoothing: antialiased; }
  @keyframes dms-in { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
  .dms-in { animation: dms-in 0.3s ease both; }
  .dms-tab { transition: all 0.18s ease; cursor: pointer; }
  .dms-tab:hover { opacity: 0.85; }
  .dms-method-btn { transition: all 0.18s ease; cursor: pointer; }
  .dms-method-btn:hover { transform: translateY(-2px); }
  .dms-cta { transition: opacity 0.15s ease, transform 0.15s ease; }
  .dms-cta:hover:not(:disabled) { opacity: 0.88; transform: translateY(-1px); }
  .dms-cta:disabled { opacity: 0.45; cursor: not-allowed; }
`;

const fmtFee = (fee, currency = "NGN") => {
  if (!fee || fee === 0) return "Free";
  return new Intl.NumberFormat("en-NG", { style: "currency", currency, maximumFractionDigits: 0 }).format(fee);
};

/* ══════════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════ */
export default function DeliveryMethodStage({ store, t, slug, onBack, onSelect }) {
  const [activeTab, setActiveTab] = useState("delivery");

  const fs = store.fulfillmentSettings || {};
  const deliveryModel   = fs.deliveryModel || "flat";
  const deliveryZones   = fs.deliveryZones || [];
  const flatFee         = Number(fs.flatDeliveryFee) || 0;
  const pickupAddress   = fs.pickupAddress || "";
  const pickupInstr     = fs.pickupInstructions || "";
  const currency        = store.currency || "NGN";

  const tabs = [
    { key: "delivery", label: "Door Delivery", icon: <TruckIcon /> },
    { key: "pickup",   label: "Pickup",         icon: <StoreIcon /> },
  ];

  return (
    <>
      <style>{CSS}</style>
      <div className="dms-root dms-in" style={{ background: t.pageBg, minHeight: "100vh" }}>

        {/* ── Header ───────────────────────────────────────────── */}
        <div style={{ background: t.navBg, borderBottom: `1px solid ${t.border}`, padding: "0 16px", position: "sticky", top: 0, zIndex: 10 }}>
          <div style={{ maxWidth: "640px", margin: "0 auto", display: "flex", alignItems: "center", height: "56px", gap: "12px" }}>
            <button
              onClick={onBack}
              style={{ background: "none", border: "none", cursor: "pointer", color: t.textPrimary, display: "flex", alignItems: "center", padding: "8px 4px 8px 0" }}
            >
              <BackIcon />
            </button>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontSize: "17px", fontWeight: 800, color: t.textPrimary }}>Delivery Method</p>
              <p style={{ margin: 0, fontSize: "11px", color: t.textSecondary }}>How would you like to receive your order?</p>
            </div>
          </div>
        </div>

        {/* ── Body ────────────────────────────────────────────── */}
        <div style={{ maxWidth: "640px", margin: "0 auto", padding: "20px 16px 120px" }}>

          {/* Step indicator */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "24px" }}>
            {["Cart", "Delivery", "Address"].map((step, i) => (
              <div key={step} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{
                  width: "24px", height: "24px", borderRadius: "50%", fontSize: "11px", fontWeight: 800,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: i === 1 ? t.accent : i < 1 ? `${t.accent}30` : t.border,
                  color: i === 1 ? t.accentText : i < 1 ? t.accent : t.textSecondary,
                }}>
                  {i < 1 ? <CheckIcon /> : i + 1}
                </div>
                <span style={{ fontSize: "12px", fontWeight: i === 1 ? 700 : 500, color: i === 1 ? t.textPrimary : t.textSecondary }}>{step}</span>
                {i < 2 && <div style={{ width: "20px", height: "1px", background: t.border }} />}
              </div>
            ))}
          </div>

          {/* ── Tab Switcher ─────────────────────────────────── */}
          <div style={{ display: "flex", gap: "8px", background: t.card, border: `1px solid ${t.border}`, borderRadius: "16px", padding: "6px", marginBottom: "20px" }}>
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className="dms-tab"
                style={{
                  flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                  padding: "12px 16px", borderRadius: "12px", border: "none",
                  background: activeTab === tab.key ? t.accent : "transparent",
                  color: activeTab === tab.key ? t.accentText : t.textSecondary,
                  fontWeight: 700, fontSize: "14px",
                  boxShadow: activeTab === tab.key ? `0 4px 16px rgba(0,0,0,0.15)` : "none",
                }}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* ── Delivery Tab ─────────────────────────────────── */}
          {activeTab === "delivery" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {deliveryModel === "flat" && (
                <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: "16px", padding: "18px 20px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                    <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: `${t.accent}14`, display: "flex", alignItems: "center", justifyContent: "center", color: t.accent }}>
                      <TruckIcon />
                    </div>
                    <div>
                      <p style={{ margin: 0, fontSize: "15px", fontWeight: 800, color: t.textPrimary }}>Standard Delivery</p>
                      <p style={{ margin: 0, fontSize: "12px", color: t.textSecondary }}>Delivered to your door</p>
                    </div>
                    <div style={{ marginLeft: "auto", textAlign: "right" }}>
                      <p style={{ margin: 0, fontSize: "16px", fontWeight: 900, color: t.accent }}>{fmtFee(flatFee, currency)}</p>
                    </div>
                  </div>
                  <p style={{ margin: "8px 0 0", fontSize: "12px", color: t.textSecondary, lineHeight: 1.6 }}>
                    Enter your full address in the next step and we'll arrange delivery.
                  </p>
                </div>
              )}

              {deliveryModel === "zones" && (
                <>
                  <p style={{ margin: "0 0 4px", fontSize: "12px", fontWeight: 700, color: t.textSecondary, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    Delivery Zones
                  </p>
                  {deliveryZones.length === 0 ? (
                    <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: "16px", padding: "20px", textAlign: "center", color: t.textSecondary, fontSize: "13px" }}>
                      Delivery zones not configured yet. Contact the store.
                    </div>
                  ) : (
                    deliveryZones.map((zone, i) => (
                      <div key={i} style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: "14px", padding: "14px 16px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
                          <div style={{ flex: 1 }}>
                            <p style={{ margin: "0 0 4px", fontSize: "14px", fontWeight: 800, color: t.textPrimary }}>{zone.name}</p>
                            {zone.areas && (
                              <div style={{ display: "flex", alignItems: "flex-start", gap: "4px" }}>
                                <div style={{ color: t.textSecondary, flexShrink: 0, marginTop: "2px" }}><PinIcon /></div>
                                <p style={{ margin: 0, fontSize: "12px", color: t.textSecondary, lineHeight: 1.5 }}>{zone.areas}</p>
                              </div>
                            )}
                            {zone.timeframe && (
                              <div style={{ display: "flex", alignItems: "center", gap: "4px", marginTop: "4px" }}>
                                <div style={{ color: t.textSecondary }}><ClockIcon /></div>
                                <span style={{ fontSize: "11px", color: t.textSecondary }}>{zone.timeframe}</span>
                              </div>
                            )}
                          </div>
                          <div style={{ flexShrink: 0, textAlign: "right" }}>
                            <p style={{ margin: 0, fontSize: "16px", fontWeight: 900, color: t.accent }}>{fmtFee(zone.fee, currency)}</p>
                            <p style={{ margin: 0, fontSize: "10px", color: t.textSecondary }}>delivery fee</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                  <p style={{ margin: "4px 0 0", fontSize: "11px", color: t.textSecondary, textAlign: "center", lineHeight: 1.6 }}>
                    Your zone will be detected from the address you enter next.
                  </p>
                </>
              )}

              {deliveryModel === "quote" && (
                <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: "16px", padding: "20px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                    <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: `${t.accent}14`, display: "flex", alignItems: "center", justifyContent: "center", color: t.accent }}>
                      <TruckIcon />
                    </div>
                    <div>
                      <p style={{ margin: 0, fontSize: "15px", fontWeight: 800, color: t.textPrimary }}>Quoted Delivery</p>
                      <p style={{ margin: 0, fontSize: "12px", color: t.textSecondary }}>Price depends on your location</p>
                    </div>
                  </div>
                  <p style={{ margin: 0, fontSize: "12px", color: t.textSecondary, lineHeight: 1.7 }}>
                    After you place your order the store will send you a delivery quote on WhatsApp. You can accept or negotiate before payment.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ── Pickup Tab ───────────────────────────────────── */}
          {activeTab === "pickup" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: "16px", padding: "20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
                  <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: `${t.accent}14`, display: "flex", alignItems: "center", justifyContent: "center", color: t.accent }}>
                    <StoreIcon />
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: "15px", fontWeight: 800, color: t.textPrimary }}>Pickup Station</p>
                    <p style={{ margin: 0, fontSize: "12px", color: t.textSecondary }}>Collect from {store.businessName}</p>
                  </div>
                  <div style={{ marginLeft: "auto" }}>
                    <span style={{ background: "#22c55e20", color: "#16a34a", fontSize: "11px", fontWeight: 800, padding: "3px 10px", borderRadius: "999px" }}>Free</span>
                  </div>
                </div>

                {pickupAddress ? (
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", background: t.pageBg, borderRadius: "12px", padding: "12px 14px" }}>
                    <div style={{ color: t.accent, flexShrink: 0, marginTop: "1px" }}><PinIcon /></div>
                    <div>
                      <p style={{ margin: "0 0 2px", fontSize: "12px", fontWeight: 700, color: t.textSecondary, textTransform: "uppercase", letterSpacing: "0.05em" }}>Pickup Address</p>
                      <p style={{ margin: 0, fontSize: "14px", fontWeight: 600, color: t.textPrimary, lineHeight: 1.5 }}>{pickupAddress}</p>
                    </div>
                  </div>
                ) : (
                  <p style={{ margin: 0, fontSize: "13px", color: t.textSecondary, lineHeight: 1.6 }}>
                    Contact {store.businessName} on WhatsApp for the exact pickup location.
                  </p>
                )}

                {pickupInstr && (
                  <div style={{ marginTop: "12px", background: `${t.accent}08`, border: `1px solid ${t.accent}20`, borderRadius: "10px", padding: "10px 14px" }}>
                    <p style={{ margin: "0 0 4px", fontSize: "11px", fontWeight: 700, color: t.accent, textTransform: "uppercase", letterSpacing: "0.05em" }}>Instructions</p>
                    <p style={{ margin: 0, fontSize: "13px", color: t.textPrimary, lineHeight: 1.6 }}>{pickupInstr}</p>
                  </div>
                )}
              </div>

              <div style={{ background: `#f59e0b10`, border: `1px solid #f59e0b30`, borderRadius: "12px", padding: "12px 14px" }}>
                <p style={{ margin: 0, fontSize: "12px", color: "#92400e", lineHeight: 1.7 }}>
                  💡 After placing your order you'll get a WhatsApp confirmation with the full pickup details.
                </p>
              </div>
            </div>
          )}

        </div>

        {/* ── Sticky bottom CTA ──────────────────────────────────── */}
        <div style={{
          position: "fixed", bottom: 0, left: 0, right: 0,
          background: t.navBg, borderTop: `1px solid ${t.border}`,
          padding: "12px 16px max(12px, env(safe-area-inset-bottom, 12px))",
          zIndex: 50,
        }}>
          <div style={{ maxWidth: "640px", margin: "0 auto" }}>
            <button
              onClick={() => onSelect(activeTab)}
              className="dms-cta"
              style={{
                width: "100%", height: "54px", borderRadius: "16px", border: "none",
                background: t.accent, color: t.accentText,
                fontWeight: 800, fontSize: "16px", cursor: "pointer",
                boxShadow: `0 6px 24px rgba(0,0,0,0.18)`,
              }}
            >
              {activeTab === "delivery" ? "Continue to Address →" : "Continue to Pickup Details →"}
            </button>
          </div>
        </div>

      </div>
    </>
  );
}
