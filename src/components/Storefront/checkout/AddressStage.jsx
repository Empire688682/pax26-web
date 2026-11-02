"use client";

/**
 * AddressStage.jsx
 *
 * Stage 3 of the dedicated checkout flow.
 *
 * Two sub-flows depending on fulfillmentMethod:
 *
 *   "delivery" → Zone/Region dropdown → City → Name → Phone1 → Phone2 (optional)
 *                → Address → Additional Info (optional) → Set as Default checkbox
 *                Saved addresses appear as selectable cards above the form.
 *
 *   "pickup"   → Name → Phone1 → Phone2 (optional) → Additional Info (optional)
 *                (no address/zone needed — seller handles pickup)
 *
 * After form submit:
 *   1. POST /api/store/[slug]/checkout
 *   2. Build WhatsApp message with order summary + customer details
 *   3. Save address to localStorage (delivery only)
 *   4. Redirect to WhatsApp
 */

import { useState, useEffect, useRef } from "react";
import { loadSavedAddresses, saveAddress } from "@/app/lib/store/savedAddressUtils";

/* ── Icons ────────────────────────────────────────────────────── */
const BackIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
);
const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const PinIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
);
const WhatsAppIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
  </svg>
);
const ClockIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);

/* ── CSS ──────────────────────────────────────────────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
  .as-root { font-family: 'Inter', -apple-system, sans-serif; -webkit-font-smoothing: antialiased; }
  @keyframes as-in { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
  .as-in { animation: as-in 0.3s ease both; }
  .as-input {
    width: 100%; box-sizing: border-box;
    padding: 14px 16px; font-size: 15px; font-family: inherit;
    border-radius: 12px; outline: none;
    transition: border-color 0.18s ease, box-shadow 0.18s ease;
  }
  .as-input:focus { box-shadow: 0 0 0 3px rgba(0,0,0,0.08); }
  .as-label { font-size: 12px; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; margin-bottom: 6px; display: block; }
  .as-saved-card { transition: all 0.18s ease; cursor: pointer; }
  .as-saved-card:hover { transform: translateY(-2px); }
  .as-cta { transition: opacity 0.15s ease, transform 0.15s ease; }
  .as-cta:hover:not(:disabled) { opacity: 0.88; transform: translateY(-1px); }
  .as-cta:disabled { opacity: 0.45; cursor: not-allowed; }
  .as-checkbox { width: 18px; height: 18px; accent-color: var(--accent); cursor: pointer; }
`;

const fmtPrice = (n, currency = "NGN") => {
  try {
    return new Intl.NumberFormat("en-NG", { style: "currency", currency, maximumFractionDigits: 0 }).format(n);
  } catch { return `₦${Number(n).toLocaleString()}`; }
};

/* ── Helpers ──────────────────────────────────────────────────── */
function detectZone(address, zones = []) {
  if (!address?.trim() || !zones.length) return null;
  const lower = address.toLowerCase();
  for (const zone of zones) {
    const areas = (zone.areas || "").toLowerCase().split(",").map(a => a.trim()).filter(Boolean);
    if (areas.some(a => a && lower.includes(a))) {
      return { zoneName: zone.name, fee: Number(zone.fee) || 0, timeframe: zone.timeframe || "" };
    }
  }
  return null;
}

/* ── Saved Address Card ────────────────────────────────────────── */
function SavedAddressCard({ entry, selected, t, onSelect }) {
  const relTime = (() => {
    if (!entry.usedAt) return "";
    const days = Math.floor((Date.now() - new Date(entry.usedAt).getTime()) / 86400000);
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days}d ago`;
    return new Date(entry.usedAt).toLocaleDateString("en-NG", { day: "numeric", month: "short" });
  })();

  return (
    <div
      onClick={onSelect}
      className="as-saved-card"
      style={{
        background: selected ? `${t.accent}12` : t.card,
        border: `2px solid ${selected ? t.accent : t.border}`,
        borderRadius: "14px", padding: "14px 16px",
        display: "flex", alignItems: "flex-start", gap: "12px",
      }}
    >
      <div style={{
        width: "32px", height: "32px", borderRadius: "50%", flexShrink: 0,
        background: selected ? t.accent : t.pageBg,
        border: `2px solid ${selected ? t.accent : t.border}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        color: selected ? t.accentText : t.textSecondary,
      }}>
        {selected ? <CheckIcon /> : <PinIcon />}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: "0 0 2px", fontSize: "14px", fontWeight: 700, color: t.textPrimary, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {entry.label || entry.address}
        </p>
        {entry.label && (
          <p style={{ margin: "0 0 4px", fontSize: "12px", color: t.textSecondary, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{entry.address}</p>
        )}
        <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
          {entry.zoneName && (
            <span style={{ fontSize: "11px", fontWeight: 700, color: t.accent, background: `${t.accent}14`, padding: "2px 8px", borderRadius: "999px" }}>
              {entry.zoneName}
            </span>
          )}
          {relTime && (
            <div style={{ display: "flex", alignItems: "center", gap: "3px", color: t.textSecondary }}>
              <ClockIcon /><span style={{ fontSize: "11px" }}>{relTime}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════ */
export default function AddressStage({
  store, t, slug, sessionToken,
  cart, totalPrice, fulfillmentMethod,
  onBack, onSuccess,
}) {
  const fs            = store.fulfillmentSettings || {};
  const deliveryModel = fs.deliveryModel || "flat";
  const deliveryZones = fs.deliveryZones || [];
  const flatFee       = Number(fs.flatDeliveryFee) || 0;
  const currency      = store.currency || "NGN";
  const isDelivery    = fulfillmentMethod === "delivery";

  // ── Form state ───────────────────────────────────────────────
  const [firstName,   setFirstName]   = useState("");
  const [lastName,    setLastName]    = useState("");
  const [phone1,      setPhone1]      = useState("");
  const [phone2,      setPhone2]      = useState("");
  const [address,     setAddress]     = useState("");
  const [city,        setCity]        = useState("");
  const [addInfo,     setAddInfo]     = useState("");
  const [selectedZone, setSelectedZone] = useState(""); // zone name (zones model) or "" for flat/auto
  const [setAsDefault, setSetAsDefault] = useState(false);

  // ── Saved addresses ──────────────────────────────────────────
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedSaved,  setSelectedSaved]  = useState(null); // index of selected saved address

  // ── Submission state ─────────────────────────────────────────
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState("");

  // ── Load saved addresses on mount ────────────────────────────
  useEffect(() => {
    if (isDelivery) {
      const saved = loadSavedAddresses(slug);
      setSavedAddresses(saved);
    }
  }, [slug, isDelivery]);

  // ── When a saved address is selected, autofill the form ──────
  const applySavedAddress = (idx) => {
    if (selectedSaved === idx) {
      // Deselect — clear address fields
      setSelectedSaved(null);
      setAddress("");
      setCity("");
      setSelectedZone("");
      return;
    }
    const entry = savedAddresses[idx];
    if (!entry) return;
    setSelectedSaved(idx);
    setAddress(entry.address || "");
    // Try to auto-select zone
    if (deliveryModel === "zones" && entry.zoneName) {
      const stillValid = deliveryZones.some(z => z.name === entry.zoneName);
      setSelectedZone(stillValid ? entry.zoneName : "");
    }
  };

  // ── Compute effective delivery fee ───────────────────────────
  const effectiveFee = (() => {
    if (!isDelivery) return 0;
    if (deliveryModel === "zones") {
      const zone = deliveryZones.find(z => z.name === selectedZone);
      return zone ? Number(zone.fee) : 0;
    }
    if (deliveryModel === "quote") return 0;
    return flatFee;
  })();

  const detectedZone = deliveryModel === "zones" && selectedZone
    ? deliveryZones.find(z => z.name === selectedZone) || null
    : null;

  const grandTotal = totalPrice + effectiveFee;

  // ── Validation ───────────────────────────────────────────────
  const formValid = (() => {
    if (!firstName.trim()) return false;
    if (!phone1.trim())    return false;
    if (isDelivery) {
      if (!address.trim()) return false;
      if (deliveryModel === "zones" && !selectedZone) return false;
    }
    return true;
  })();

  // ── Submit ───────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formValid || submitting) return;

    setSubmitting(true);
    setError("");

    try {
      const pickupDetails = !isDelivery
        ? (fs.pickupAddress || store.liveLocation || "")
        : "";

      const fullAddress = isDelivery
        ? [address.trim(), city.trim()].filter(Boolean).join(", ")
        : "";

      const customerName = [firstName.trim(), lastName.trim()].filter(Boolean).join(" ");

      const payload = {
        sessionToken: sessionToken || null,
        customerName,
        customerPhone1: phone1.trim(),
        customerPhone2: phone2.trim() || null,
        items: cart.map(item => ({
          productId: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          imageUrl: item.imageUrl,
          selectedVariants: item.selectedVariants || [],
        })),
        deliveryAddress: fullAddress,
        deliveryLocation: fullAddress,
        fulfillmentMethod,
        pickupDetails,
        deliveryFee: effectiveFee,
        selectedZoneName: detectedZone?.name || "",
        deliveryZoneTimeframe: detectedZone?.timeframe || "",
        additionalInfo: addInfo.trim() || "",
      };

      const res  = await fetch(`/api/store/${slug}/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!data.success) {
        setError(data.message || "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }

      // ── Save address to localStorage ──────────────────────────
      if (isDelivery && fullAddress) {
        saveAddress(slug, {
          address: fullAddress,
          zoneName: detectedZone?.name || null,
          deliveryFee: effectiveFee,
          label: setAsDefault ? "Default" : null,
        });
      }

      // ── Build WhatsApp message ────────────────────────────────
      const baseWaHref = store.whatsappHref?.split("?")[0] || "";
      if (baseWaHref) {
        const deliveryFeeVal  = Number(data.deliveryFee) || 0;
        const subtotalVal     = Number(data.itemsSubtotal) || (Number(data.totalPrice) - deliveryFeeVal);
        const totalVal        = Number(data.totalPrice) || 0;

        const itemLines = cart.map(item => {
          const lineTotal  = item.price * item.quantity;
          const variantStr = (item.selectedVariants || []).length > 0
            ? ` [${item.selectedVariants.map(v => `${v.label}: ${v.value}`).join(", ")}]`
            : "";
          return `• ${item.quantity > 1 ? `${item.quantity}x ` : ""}${item.name}${variantStr} — ₦${lineTotal.toLocaleString()}`;
        }).join("\n");

        let waMsg = `Hi! I've confirmed my order #${data.orderCode} on ${data.businessName || store.businessName}.\n\n`;
        waMsg += `🛒 *Order #${data.orderCode}*\n`;
        waMsg += `${itemLines}\n\n`;
        waMsg += `💰 Products Total: ₦${subtotalVal.toLocaleString()}`;

        if (deliveryFeeVal > 0) {
          waMsg += `\n🚚 Delivery Fee: ₦${deliveryFeeVal.toLocaleString()}`;
          if (detectedZone?.timeframe) waMsg += ` · Est. ${detectedZone.timeframe}`;
        }
        waMsg += `\n💳 *Grand Total: ₦${totalVal.toLocaleString()}*`;

        if (isDelivery && fullAddress)  waMsg += `\n📍 ${fullAddress}`;
        if (!isDelivery && pickupDetails) waMsg += `\n📦 Pickup: ${pickupDetails}`;

        waMsg += `\n\n👤 ${customerName}`;
        waMsg += `\n📱 ${phone1.trim()}`;
        if (phone2.trim()) waMsg += ` / ${phone2.trim()}`;

        if (addInfo.trim()) waMsg += `\n📝 ${addInfo.trim()}`;

        if (data.payment) {
          waMsg += `\n\n💳 *Payment Details*\n`;
          waMsg += `Bank: ${data.payment.bankName}\n`;
          waMsg += `Account: ${data.payment.accountNumber}\n`;
          waMsg += `Name: ${data.payment.accountName}`;
        }

        // Clear cart and call onSuccess before redirect
        onSuccess();

        window.location.href = `${baseWaHref}?text=${encodeURIComponent(waMsg)}`;
      } else {
        // No WhatsApp configured — just clear cart and show done
        onSuccess();
      }
    } catch (err) {
      console.error("[AddressStage] submit error:", err);
      setError("Network error. Please check your connection and try again.");
      setSubmitting(false);
    }
  };

  const inputStyle = (hasError = false) => ({
    background: t.card,
    border: `1px solid ${hasError ? "#ef4444" : t.border}`,
    color: t.textPrimary,
  });

  const labelStyle = { color: t.textSecondary };

  // Progress stages for indicator
  const stageNames = ["Cart", "Delivery", "Address"];
  const stageIdx   = fulfillmentMethod === "pickup"
    ? 2  // skipped Delivery stage
    : 2; // same index after Delivery

  return (
    <>
      <style>{CSS}</style>
      <div className="as-root as-in" style={{ background: t.pageBg, minHeight: "100vh" }}>

        {/* ── Header ──────────────────────────────────────────── */}
        <div style={{ background: t.navBg, borderBottom: `1px solid ${t.border}`, padding: "0 16px", position: "sticky", top: 0, zIndex: 10 }}>
          <div style={{ maxWidth: "640px", margin: "0 auto", display: "flex", alignItems: "center", height: "56px", gap: "12px" }}>
            <button
              onClick={onBack}
              style={{ background: "none", border: "none", cursor: "pointer", color: t.textPrimary, display: "flex", alignItems: "center", padding: "8px 4px 8px 0" }}
            >
              <BackIcon />
            </button>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontSize: "17px", fontWeight: 800, color: t.textPrimary }}>
                {isDelivery ? "Delivery Address" : "Pickup Details"}
              </p>
              <p style={{ margin: 0, fontSize: "11px", color: t.textSecondary }}>
                {isDelivery ? "Where should we deliver your order?" : "Your contact info for pickup"}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ maxWidth: "640px", margin: "0 auto", padding: "20px 16px 160px" }}>

          {/* Step indicator */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "24px" }}>
            {stageNames.map((step, i) => (
              <div key={step} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{
                  width: "24px", height: "24px", borderRadius: "50%", fontSize: "11px", fontWeight: 800,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: i === stageIdx ? t.accent : i < stageIdx ? `${t.accent}30` : t.border,
                  color: i === stageIdx ? t.accentText : i < stageIdx ? t.accent : t.textSecondary,
                }}>
                  {i < stageIdx ? <CheckIcon /> : i + 1}
                </div>
                <span style={{ fontSize: "12px", fontWeight: i === stageIdx ? 700 : 500, color: i === stageIdx ? t.textPrimary : t.textSecondary }}>{step}</span>
                {i < stageNames.length - 1 && <div style={{ width: "20px", height: "1px", background: t.border }} />}
              </div>
            ))}
          </div>

          {/* ── Saved Addresses (delivery only) ─────────────────── */}
          {isDelivery && savedAddresses.length > 0 && (
            <div style={{ marginBottom: "24px" }}>
              <p style={{ margin: "0 0 10px", fontSize: "13px", fontWeight: 800, color: t.textPrimary }}>Recent Addresses</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {savedAddresses.map((entry, i) => (
                  <SavedAddressCard
                    key={i}
                    entry={entry}
                    selected={selectedSaved === i}
                    t={t}
                    onSelect={() => applySavedAddress(i)}
                  />
                ))}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "16px 0" }}>
                <div style={{ flex: 1, height: "1px", background: t.border }} />
                <span style={{ fontSize: "12px", color: t.textSecondary, fontWeight: 600 }}>or enter new address</span>
                <div style={{ flex: 1, height: "1px", background: t.border }} />
              </div>
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

            {/* ── Zone / Region (delivery + zones model) ─────────── */}
            {isDelivery && deliveryModel === "zones" && (
              <div>
                <label className="as-label" style={labelStyle}>
                  Zone / Region <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <select
                  value={selectedZone}
                  onChange={e => setSelectedZone(e.target.value)}
                  className="as-input"
                  required
                  style={{ ...inputStyle(!selectedZone), appearance: "none" }}
                >
                  <option value="">Select your delivery zone</option>
                  {deliveryZones.map((zone, i) => (
                    <option key={i} value={zone.name}>
                      {zone.name}{zone.fee > 0 ? ` — ${fmtPrice(zone.fee, currency)}` : " — Free"}
                      {zone.timeframe ? ` · ${zone.timeframe}` : ""}
                    </option>
                  ))}
                </select>
                {selectedZone && detectedZone && (
                  <div style={{ marginTop: "6px", display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", color: t.textSecondary }}>
                    <ClockIcon />
                    <span>{detectedZone.timeframe || "Delivery timeframe will be confirmed"}</span>
                  </div>
                )}
              </div>
            )}

            {/* ── Name row ─────────────────────────────────────── */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div>
                <label className="as-label" style={labelStyle}>
                  First Name <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input
                  className="as-input"
                  type="text"
                  placeholder="e.g. Amara"
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  required
                  style={inputStyle(!firstName.trim())}
                  autoComplete="given-name"
                />
              </div>
              <div>
                <label className="as-label" style={labelStyle}>Last Name</label>
                <input
                  className="as-input"
                  type="text"
                  placeholder="e.g. Okafor"
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  style={inputStyle()}
                  autoComplete="family-name"
                />
              </div>
            </div>

            {/* ── Phone row ────────────────────────────────────── */}
            <div>
              <label className="as-label" style={labelStyle}>
                Phone Number <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <input
                className="as-input"
                type="tel"
                placeholder="+234 803 000 0000"
                value={phone1}
                onChange={e => setPhone1(e.target.value)}
                required
                style={inputStyle(!phone1.trim())}
                autoComplete="tel"
                inputMode="tel"
              />
            </div>

            <div>
              <label className="as-label" style={labelStyle}>Alternative Phone <span style={{ color: t.textSecondary, fontWeight: 500, textTransform: "none", fontSize: "11px" }}>(optional)</span></label>
              <input
                className="as-input"
                type="tel"
                placeholder="+234 805 000 0000"
                value={phone2}
                onChange={e => setPhone2(e.target.value)}
                style={inputStyle()}
                autoComplete="tel"
                inputMode="tel"
              />
            </div>

            {/* ── Delivery address fields (delivery only) ──────── */}
            {isDelivery && (
              <>
                <div>
                  <label className="as-label" style={labelStyle}>
                    City / Area <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    className="as-input"
                    type="text"
                    placeholder="e.g. Ikeja, Surulere"
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    style={inputStyle(!city.trim())}
                    autoComplete="address-level2"
                  />
                </div>

                <div>
                  <label className="as-label" style={labelStyle}>
                    Street Address <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <textarea
                    className="as-input"
                    rows={3}
                    placeholder="House no., Street name, Landmark..."
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    required
                    style={{ ...inputStyle(!address.trim()), resize: "vertical", lineHeight: 1.6 }}
                    autoComplete="street-address"
                  />
                </div>
              </>
            )}

            {/* ── Additional Info (both modes) ─────────────────── */}
            <div>
              <label className="as-label" style={labelStyle}>Additional Info <span style={{ color: t.textSecondary, fontWeight: 500, textTransform: "none", fontSize: "11px" }}>(optional)</span></label>
              <input
                className="as-input"
                type="text"
                placeholder={isDelivery ? "Gate colour, nearby landmark, etc." : "Any special request or note"}
                value={addInfo}
                onChange={e => setAddInfo(e.target.value)}
                style={inputStyle()}
              />
            </div>

            {/* ── Set as Default (delivery only) ───────────────── */}
            {isDelivery && (
              <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={setAsDefault}
                  onChange={e => setSetAsDefault(e.target.checked)}
                  className="as-checkbox"
                  style={{ "--accent": t.accent }}
                />
                <div>
                  <p style={{ margin: 0, fontSize: "14px", fontWeight: 600, color: t.textPrimary }}>Save as Default Address</p>
                  <p style={{ margin: 0, fontSize: "11px", color: t.textSecondary }}>Autofill for faster checkout next time</p>
                </div>
              </label>
            )}

          </div>

          {/* ── Error ──────────────────────────────────────────── */}
          {error && (
            <div style={{ marginTop: "16px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "12px", padding: "12px 16px" }}>
              <p style={{ margin: 0, fontSize: "13px", color: "#dc2626", fontWeight: 600 }}>{error}</p>
            </div>
          )}

        </form>

        {/* ── Sticky bottom CTA ──────────────────────────────────── */}
        <div style={{
          position: "fixed", bottom: 0, left: 0, right: 0,
          background: t.navBg, borderTop: `1px solid ${t.border}`,
          padding: "12px 16px max(12px, env(safe-area-inset-bottom, 12px))",
          zIndex: 50,
        }}>
          <div style={{ maxWidth: "640px", margin: "0 auto" }}>
            {/* Order summary row */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px", padding: "0 2px" }}>
              <div>
                <p style={{ margin: 0, fontSize: "11px", color: t.textSecondary }}>Grand Total</p>
                <p style={{ margin: 0, fontSize: "18px", fontWeight: 900, color: t.accent }}>
                  {fmtPrice(grandTotal, currency)}
                  {deliveryModel === "quote" && isDelivery && <span style={{ fontSize: "11px", fontWeight: 500, color: t.textSecondary }}> + delivery</span>}
                </p>
              </div>
              {isDelivery && effectiveFee > 0 && (
                <div style={{ textAlign: "right" }}>
                  <p style={{ margin: 0, fontSize: "11px", color: t.textSecondary }}>
                    Subtotal {fmtPrice(totalPrice, currency)} + {fmtPrice(effectiveFee, currency)} delivery
                  </p>
                </div>
              )}
            </div>

            <button
              type="submit"
              form="" /* form submission handled via onSubmit on the form element */
              onClick={handleSubmit}
              disabled={!formValid || submitting}
              className="as-cta"
              style={{
                width: "100%", height: "54px", borderRadius: "16px", border: "none",
                background: formValid && !submitting ? "#25d366" : t.border,
                color: formValid && !submitting ? "#fff" : t.textSecondary,
                fontWeight: 800, fontSize: "16px", cursor: formValid && !submitting ? "pointer" : "not-allowed",
                boxShadow: formValid && !submitting ? "0 6px 20px rgba(37,211,102,0.35)" : "none",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
              }}
            >
              {submitting ? (
                <span>Placing Order…</span>
              ) : (
                <>
                  <WhatsAppIcon />
                  <span>Confirm Order on WhatsApp</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </>
  );
}
