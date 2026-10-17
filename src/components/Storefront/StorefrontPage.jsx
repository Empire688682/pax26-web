"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { formatPrice } from "@/app/lib/currency/currencyHelper";
import { getTheme } from "@/app/lib/store/storeThemes";
import { useCart } from "@/app/lib/store/useCart";
import { buildMultiProductWhatsAppMessage } from "@/app/lib/store/buildMultiProductWhatsAppMessage";
import { validateDeliveryLocation } from "@/app/lib/store/validateDeliveryLocation";

/* ── Icons ──────────────────────────────────────────────── */
const SearchIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>);
const WhatsAppIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>);
const MenuIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg>);
const XIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>);
const MapPinIcon = () => (<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>);
const ClockIcon = () => (<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>);
const PackageIcon = () => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21" /><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></svg>);
const EditIcon = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>);
const ZapIcon = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>);
const ShoppingBagIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>);
const TrashIcon = () => (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>);
const PlusIcon = () => (<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>);
const MinusIcon = () => (<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /></svg>);

/* ── Owner preview banner ───────────────────────────────── */
function OwnerBanner({ slug }) {
  return (
    <div style={{ position: "sticky", top: 0, zIndex: 100, background: "#111115", color: "#fff", padding: "10px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px", fontSize: "12px", fontWeight: 600, borderBottom: "1px solid #2a2a35" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span style={{ background: "#22c55e", color: "#fff", borderRadius: "6px", padding: "2px 8px", fontSize: "10px", fontWeight: 900, letterSpacing: "0.08em", textTransform: "uppercase" }}>Preview Mode</span>
        <span style={{ opacity: 0.85, fontSize: "12px" }}>This is live view as seen by customers</span>
      </div>
      <a href="/dashboard/automations/ai-business-dashboard" style={{ display: "flex", alignItems: "center", gap: "6px", padding: "5px 12px", borderRadius: "8px", background: "#ffffff", color: "#111115", textDecoration: "none", fontSize: "12px", fontWeight: 800 }}>
        <EditIcon /> Edit Store
      </a>
    </div>
  );
}

/* ── Pax26 powered footer ───────────────────── */
function Pax26Footer() {
  return (
    <div style={{ background: "linear-gradient(135deg, #09090d 0%, #151522 100%)", borderTop: "1px solid #232332", padding: "24px 20px 88px" }}>
      <div style={{ maxWidth: "1140px", margin: "0 auto", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "32px", height: "32px", borderRadius: "10px", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", flexShrink: 0, boxShadow: "0 4px 14px rgba(99, 102, 241, 0.4)" }}>
            <ZapIcon />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: "13px", fontWeight: 800, color: "#fff" }}>
              Powered by <span style={{ color: "#818cf8" }}>Pax26</span>
            </p>
            <p style={{ margin: 0, fontSize: "11px", color: "#828799" }}>
              AI WhatsApp Storefront — automated orders 24/7
            </p>
          </div>
        </div>
        <a
          href="https://pax26.com"
          target="_blank"
          rel="noopener noreferrer"
          style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px", borderRadius: "10px", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "#fff", fontWeight: 800, fontSize: "12px", textDecoration: "none", whiteSpace: "nowrap", boxShadow: "0 4px 16px rgba(99, 102, 241, 0.35)" }}
        >
          Create free store →
        </a>
      </div>
    </div>
  );
}

/* ── WhatsApp app chooser (Android multi-app support) ───────── */
// Android allows both WhatsApp Messenger (com.whatsapp) and
// WhatsApp Business (com.whatsapp.w4b) to be installed at the same time.
// Using intent:// links targets each package directly.

export function WhatsAppChooserModal({ visible, onClose, messengerUrl, businessUrl, theme }) {
  const t = theme || { pageBg: '#09090d', navBg: '#111118', card: '#16161f', textPrimary: '#f1f5f9', textSecondary: '#94a3b8', border: '#1e1e2e', accent: '#6366f1' };
  if (!visible) return null;
  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.65)',
          zIndex: 9998,
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          animation: 'sf-fade-in 0.18s ease',
        }}
      />
      {/* Bottom sheet */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        zIndex: 9999,
        background: t.navBg,
        borderRadius: '24px 24px 0 0',
        borderTop: `1px solid ${t.border}`,
        padding: '8px 20px 36px',
        boxShadow: '0 -8px 40px rgba(0,0,0,0.4)',
        animation: 'sf-slide-up 0.22s cubic-bezier(0.16,1,0.3,1)',
      }}>
        {/* Drag handle */}
        <div style={{ width: '40px', height: '4px', borderRadius: '2px', background: t.border, margin: '10px auto 20px' }} />
        <p style={{ margin: '0 0 6px', fontSize: '15px', fontWeight: 900, color: t.textPrimary, textAlign: 'center' }}>
          Open in WhatsApp
        </p>
        <p style={{ margin: '0 0 20px', fontSize: '12px', color: t.textSecondary, textAlign: 'center' }}>
          You have multiple WhatsApp apps installed — choose one
        </p>

        {/* WhatsApp Messenger */}
        <a
          href={messengerUrl}
          onClick={onClose}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex', alignItems: 'center', gap: '14px',
            padding: '14px 18px',
            borderRadius: '16px',
            background: t.card,
            border: `1px solid ${t.border}`,
            textDecoration: 'none',
            marginBottom: '10px',
            cursor: 'pointer',
          }}
        >
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#25d366', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="#fff"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          </div>
          <div>
            <p style={{ margin: 0, fontSize: '14px', fontWeight: 800, color: t.textPrimary }}>WhatsApp Messenger</p>
            <p style={{ margin: 0, fontSize: '11px', color: t.textSecondary }}>Personal WhatsApp account</p>
          </div>
          <div style={{ marginLeft: 'auto', fontSize: '18px', color: t.textSecondary }}>›</div>
        </a>

        {/* WhatsApp Business */}
        <a
          href={businessUrl}
          onClick={onClose}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex', alignItems: 'center', gap: '14px',
            padding: '14px 18px',
            borderRadius: '16px',
            background: t.card,
            border: `1px solid ${t.border}`,
            textDecoration: 'none',
            cursor: 'pointer',
          }}
        >
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#128C7E', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="#fff"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          </div>
          <div>
            <p style={{ margin: 0, fontSize: '14px', fontWeight: 800, color: t.textPrimary }}>WhatsApp Business</p>
            <p style={{ margin: 0, fontSize: '11px', color: t.textSecondary }}>Business WhatsApp account</p>
          </div>
          <div style={{ marginLeft: 'auto', fontSize: '18px', color: t.textSecondary }}>›</div>
        </a>

        <button
          onClick={onClose}
          style={{ width: '100%', marginTop: '14px', padding: '12px', borderRadius: '12px', background: 'transparent', border: `1px solid ${t.border}`, color: t.textSecondary, fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
        >
          Cancel
        </button>
      </div>
      <style>{`
        @keyframes sf-slide-up { from { transform: translateY(100%); } to { transform: translateY(0); } }
        @keyframes sf-fade-in  { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </>
  );
}

/**
 * buildWhatsAppIntentUrls
 * Given a wa.me href (with optional ?text=...), returns:
 *  - messengerUrl: intent:// link targeting com.whatsapp (Messenger)
 *  - businessUrl:  intent:// link targeting com.whatsapp.w4b (Business)
 *  - universalUrl: original wa.me https link (iOS fallback / desktop)
 */
export function buildWhatsAppIntentUrls(href) {
  if (!href) return { messengerUrl: href, businessUrl: href, universalUrl: href };
  let url;
  try { url = new URL(href.startsWith('http') ? href : `https://${href}`); } catch { return { messengerUrl: href, businessUrl: href, universalUrl: href }; }

  // Extract phone from wa.me path: /15551234567
  const phone  = url.pathname.replace(/^\//,'').replace(/\D/g,'');
  const text   = url.searchParams.get('text') || '';
  const query  = [phone && `phone=${encodeURIComponent(`+${phone}`)}`, text && `text=${encodeURIComponent(text)}`].filter(Boolean).join('&');

  const intentBase = (pkg) => `intent://send?${query}#Intent;scheme=whatsapp;package=${pkg};end`;
  return {
    messengerUrl: intentBase('com.whatsapp'),
    businessUrl:  intentBase('com.whatsapp.w4b'),
    universalUrl: href,
  };
}

export function handleWhatsAppRedirect(e, href, onShowChooser) {
  if (!href) return;
  e?.preventDefault();

  let targetUrl = href;
  if (!targetUrl.startsWith("http://") && !targetUrl.startsWith("https://")) {
    targetUrl = `https://${targetUrl}`;
  }

  const isAndroid = typeof window !== "undefined" && /Android/i.test(navigator.userAgent);
  if (isAndroid) {
    const { messengerUrl, businessUrl } = buildWhatsAppIntentUrls(targetUrl);
    if (onShowChooser) {
      onShowChooser(messengerUrl, businessUrl);
    } else {
      window.location.href = targetUrl;
    }
  } else {
    window.open(targetUrl, "_blank", "noopener,noreferrer");
  }
}

/* ── Cart Drawer Component ───────────────────────────────── */
function CartDrawer({ open, onClose, cart, totalQuantity, totalPrice, onUpdateQty, onRemoveItem, onClearCart, store, slug, sessionToken, theme, onWhatsAppRedirect }) {
  const t = theme;
  const [deliveryLocation, setDeliveryLocation] = useState("");
  const [checkoutState, setCheckoutState] = useState("idle"); // idle | loading | success | error
  const [checkoutError, setCheckoutError] = useState("");
  const [detectedZone, setDetectedZone] = useState(null); // { fee, zoneName, timeframe, confidence }
  const allowDelivery = store.fulfillmentSettings?.allowDelivery !== false;
  const allowPickup = store.fulfillmentSettings?.allowPickup === true;
  const deliveryModel = store.fulfillmentSettings?.deliveryModel || "flat";
  const deliveryZones = store.fulfillmentSettings?.deliveryZones || [];
  const flatDeliveryFee = Number(store.fulfillmentSettings?.flatDeliveryFee) || 0;
  const [fulfillmentMethod, setFulfillmentMethod] = useState(allowPickup && !allowDelivery ? "pickup" : "delivery");
  const currency = store.currency || "NGN";

  if (!open) return null;

  // ── Auto-detect zone from address as customer types ──────────────────────
  // Uses debounced matching against store delivery zones
  const handleAddressChange = (val) => {
    setDeliveryLocation(val);
    if (deliveryModel === "zones" && val.trim().length >= 5) {
      // Inline detection — import is a module so call inline
      const normVal = val.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
      let best = null;
      let bestScore = 0;
      for (const zone of deliveryZones) {
        const combined = `${zone.name || ""}, ${zone.areas || ""}`;
        const keywords = combined.split(",").map(k => k.trim().toLowerCase().replace(/[^a-z0-9\s]/g, " ").trim()).filter(k => k.length >= 3);
        let score = 0;
        for (const kw of keywords) { if (normVal.includes(kw)) score += kw.length; }
        if (score > bestScore) { bestScore = score; best = zone; }
      }
      if (best && bestScore > 0) {
        setDetectedZone({ fee: Number(best.fee) || 0, zoneName: best.name || "", timeframe: best.timeframe || "", confidence: "matched" });
      } else if (deliveryZones.length > 0) {
        const fb = deliveryZones[deliveryZones.length - 1];
        setDetectedZone({ fee: Number(fb.fee) || 0, zoneName: fb.name || "", timeframe: fb.timeframe || "", confidence: "fallback" });
      } else {
        setDetectedZone(null);
      }
    } else if (deliveryModel !== "zones") {
      setDetectedZone(null);
    } else {
      setDetectedZone(null);
    }
  };

  // ── Compute the active delivery fee ──────────────────────────────────────
  const maxProductFee = cart.length > 0 ? Math.max(0, ...cart.map(i => Number(i.deliveryFee) || 0)) : 0;

  const activeDeliveryFee = fulfillmentMethod === "pickup"
    ? 0
    : deliveryModel === "quote"
      ? 0
      : deliveryModel === "zones"
        ? Math.max(detectedZone?.fee || 0, maxProductFee)
        : Math.max(flatDeliveryFee, maxProductFee); // flat model

  const grandTotal = (totalPrice || 0) + activeDeliveryFee;

  const locationValidation = fulfillmentMethod === "delivery"
    ? validateDeliveryLocation(cart, deliveryLocation, store.deliveryCoverage || "Nationwide")
    : { valid: true };

  const canCheckout = locationValidation.valid && checkoutState !== "loading";

  const handleConfirmOrder = async (e) => {
    e.preventDefault();
    if (!cart.length || !canCheckout) return;

    setCheckoutState("loading");
    setCheckoutError("");

    try {
      const res = await fetch(`/api/store/${slug}/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // customerPhone intentionally omitted — resolved from session token
          sessionToken: sessionToken || null,  // used to look up customer phone
          items: cart.map(item => ({
            productId: item.productId,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            imageUrl: item.imageUrl,
            selectedVariants: item.selectedVariants || [],
          })),
          deliveryAddress: fulfillmentMethod === "delivery" ? deliveryLocation.trim() : "",
          deliveryLocation: fulfillmentMethod === "delivery" ? deliveryLocation.trim() : "",
          fulfillmentMethod,
          pickupDetails: fulfillmentMethod === "pickup" ? (store.fulfillmentSettings?.pickupAddress || store.liveLocation || "") : "",
          deliveryFee: activeDeliveryFee,
          selectedZoneName: detectedZone?.zoneName || "",
          deliveryZoneTimeframe: detectedZone?.timeframe || "",
        }),
      });

      const data = await res.json();

      if (!data.success) {
        setCheckoutState("error");
        setCheckoutError(data.message || "Something went wrong. Please try again.");
        return;
      }

      // Build the WhatsApp redirect message — full order summary so it's visible
      // in the customer's thread and the system can parse it correctly
      const baseWaHref = store.whatsappHref?.split("?")[0] || "";
      if (baseWaHref) {
        const deliveryFeeVal = Number(data.deliveryFee) || 0;
        const subtotalVal = Number(data.itemsSubtotal) || (Number(data.totalPrice) - deliveryFeeVal);
        const totalVal = Number(data.totalPrice) || 0;

        // Build item lines from cart (already validated by server)
        const itemLines = cart.map(item => {
          const lineTotal = item.price * item.quantity;
          const variantStr = (item.selectedVariants || []).length > 0
            ? ` [${item.selectedVariants.map(v => `${v.label}: ${v.value}`).join(", ")}]`
            : "";
          return `• ${item.quantity > 1 ? `${item.quantity}x ` : ""}${item.name}${variantStr} — ₦${lineTotal.toLocaleString()}`;
        }).join("\n");

        let waMsg = `Hi! I've confirmed my order #${data.orderCode} on ${data.businessName || "your store"}.\n\n`;
        waMsg += `🛒 *Order #${data.orderCode}*\n`;
        waMsg += `${itemLines}\n\n`;
        waMsg += `💰 Products Total: ₦${subtotalVal.toLocaleString()}`;
        if (deliveryFeeVal > 0) {
          waMsg += `\n🚚 Delivery Fee: ₦${deliveryFeeVal.toLocaleString()}`;
        }
        waMsg += `\n💳 *Grand Total: ₦${totalVal.toLocaleString()}*`;
        if (deliveryLocation) {
          waMsg += `\n📍 ${deliveryLocation.trim()}`;
        }

        const fullWaUrl = `${baseWaHref}?text=${encodeURIComponent(waMsg)}`;

        onClearCart();
        setCheckoutState("idle");
        onClose();

        if (onWhatsAppRedirect) {
          onWhatsAppRedirect(e, fullWaUrl);
        } else {
          handleWhatsAppRedirect(e, fullWaUrl);
        }
      } else {
        // No WhatsApp link configured — still success, just close
        onClearCart();
        setCheckoutState("success");
      }
    } catch (err) {
      console.error("Checkout error:", err);
      setCheckoutState("error");
      setCheckoutError("Network error. Please check your connection and try again.");
    }
  };

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", zIndex: 300, backdropFilter: "blur(4px)", animation: "sf-fade-in 0.2s" }} />
      <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: "400px", maxWidth: "92vw", background: t.navBg, zIndex: 301, display: "flex", flexDirection: "column", boxShadow: "-8px 0 48px rgba(0,0,0,0.28)", borderLeft: `1px solid ${t.border}` }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 20px 16px", borderBottom: `1px solid ${t.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: t.accent, color: t.accentText, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(0,0,0,0.12)" }}>
              <ShoppingBagIcon />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: "16px", fontWeight: 900, color: t.textPrimary }}>Your Cart</p>
              <p style={{ margin: 0, fontSize: "11px", color: t.textSecondary }}>{totalQuantity} {totalQuantity === 1 ? "item selected" : "items selected"}</p>
            </div>
          </div>
          <button onClick={onClose} style={{ width: "32px", height: "32px", borderRadius: "8px", background: t.pageBg, border: `1px solid ${t.border}`, color: t.textSecondary, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><XIcon /></button>
        </div>

        {/* Cart Items */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: "12px" }}>
          {cart.length === 0 ? (
            <div style={{ textAlign: "center", padding: "56px 16px", color: t.textSecondary }}>
              <div style={{ fontSize: "40px", marginBottom: "12px" }}>🛒</div>
              <p style={{ margin: "0 0 6px", fontSize: "15px", fontWeight: 800, color: t.textPrimary }}>Your cart is empty</p>
              <p style={{ margin: 0, fontSize: "12px", lineHeight: 1.5 }}>Select products from the storefront to add them to your order.</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.cartItemKey || item.productId} style={{ display: "flex", alignItems: "flex-start", gap: "12px", background: t.card, padding: "12px", borderRadius: "14px", border: `1px solid ${t.border}` }}>
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.name} style={{ width: "48px", height: "48px", borderRadius: "10px", objectFit: "cover", flexShrink: 0 }} />
                ) : (
                  <div style={{ width: "48px", height: "48px", borderRadius: "10px", background: t.pageBg, display: "flex", alignItems: "center", justifyContent: "center", color: t.textSecondary, flexShrink: 0 }}><PackageIcon /></div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: "0 0 2px", fontSize: "13px", fontWeight: 800, color: t.textPrimary, overflow: "hidden", textOverflow: "ellipsis" }}>{item.name}</p>
                  {/* Show selected variants */}
                  {item.selectedVariants && item.selectedVariants.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginBottom: "4px" }}>
                      {item.selectedVariants.map(v => (
                        <span key={v.label} style={{ fontSize: "10px", fontWeight: 700, color: t.accent, background: `${t.accent}14`, borderRadius: "4px", padding: "1px 6px" }}>
                          {v.label}: {v.value}
                        </span>
                      ))}
                    </div>
                  )}
                  <p style={{ margin: 0, fontSize: "13px", fontWeight: 900, color: t.accent }}>{formatPrice(item.price * item.quantity, currency)}</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "4px", background: t.pageBg, borderRadius: "8px", padding: "4px 6px", border: `1px solid ${t.border}`, flexShrink: 0 }}>
                  <button onClick={() => onUpdateQty(item.cartItemKey || item.productId, item.quantity - 1)} style={{ background: "none", border: "none", color: t.textPrimary, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: "2px" }}><MinusIcon /></button>
                  <span style={{ fontSize: "12px", fontWeight: 900, color: t.textPrimary, minWidth: "16px", textAlign: "center" }}>{item.quantity}</span>
                  <button onClick={() => onUpdateQty(item.cartItemKey || item.productId, item.quantity + 1)} style={{ background: "none", border: "none", color: t.textPrimary, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: "2px" }}><PlusIcon /></button>
                </div>
                <button onClick={() => onRemoveItem(item.cartItemKey || item.productId)} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", padding: "4px", flexShrink: 0 }} title="Remove item"><TrashIcon /></button>
              </div>
            ))
          )}
        </div>

        {/* Footer Checkout Section */}
        {cart.length > 0 && (
          <div style={{ padding: "16px 20px 20px", borderTop: `1px solid ${t.border}`, background: t.navBg, display: "flex", flexDirection: "column", gap: "12px" }}>
            {/* Fulfillment Choice Segment Toggle */}
            {allowPickup && (
              <div style={{ display: "flex", background: t.pageBg, borderRadius: "12px", padding: "3px", border: `1px solid ${t.border}` }}>
                {allowDelivery && (
                  <button
                    onClick={() => setFulfillmentMethod("delivery")}
                    style={{
                      flex: 1,
                      padding: "8px 10px",
                      borderRadius: "99px",
                      border: "none",
                      background: fulfillmentMethod === "delivery" ? t.card : "transparent",
                      color: fulfillmentMethod === "delivery" ? t.textPrimary : t.textSecondary,
                      fontWeight: 800,
                      fontSize: "12px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                      boxShadow: fulfillmentMethod === "delivery" ? "0 2px 8px rgba(0,0,0,0.08)" : "none",
                      transition: "all 0.15s"
                    }}
                  >
                    🚚 Delivery
                  </button>
                )}
                <button
                  onClick={() => setFulfillmentMethod("pickup")}
                  style={{
                    flex: 1,
                    padding: "8px 10px",
                    borderRadius: "99px",
                    border: "none",
                    background: fulfillmentMethod === "pickup" ? t.card : "transparent",
                    color: fulfillmentMethod === "pickup" ? t.textPrimary : t.textSecondary,
                    fontWeight: 800,
                    fontSize: "12px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                    boxShadow: fulfillmentMethod === "pickup" ? "0 2px 8px rgba(0,0,0,0.08)" : "none",
                    transition: "all 0.15s"
                  }}
                >
                  🏬 Store Pick-up
                </button>
              </div>
            )}

            {fulfillmentMethod === "delivery" ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {/* Location Zone Dropdown */}
                {deliveryModel === "zones" && deliveryZones.length > 0 && (
                  <div>
                    <label style={{ display: "block", fontSize: "10px", fontWeight: 800, color: t.textSecondary, marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.08em" }}>Select Delivery Zone / Area</label>
                    <select
                      value={selectedZoneIndex}
                      onChange={(e) => setSelectedZoneIndex(Number(e.target.value))}
                      style={{ width: "100%", padding: "10px 12px", borderRadius: "10px", border: `1px solid ${t.border}`, background: t.pageBg, color: t.textPrimary, fontSize: "13px", outline: "none", fontFamily: "inherit", fontWeight: 700, cursor: "pointer" }}
                    >
                      {deliveryZones.map((zone, i) => (
                        <option key={i} value={i}>
                          📍 {zone.name}{zone.areas ? ` (${zone.areas})` : ""} — {formatPrice(zone.fee, currency)} {zone.timeframe ? `· ${zone.timeframe}` : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {deliveryModel === "quote" && (
                  <div style={{ padding: "10px 12px", borderRadius: "10px", background: `${t.accent}12`, border: `1px solid ${t.accent}33`, fontSize: "12px", color: t.textPrimary }}>
                    ℹ️ <strong>Dispatch Quote:</strong> Delivery fee will be calculated upon order placement based on rider rates.
                  </div>
                )}

                <div>
                  <label style={{ display: "block", fontSize: "10px", fontWeight: 800, color: t.textSecondary, marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.08em" }}>Full Delivery Address *</label>
                  <input
                    type="text"
                    placeholder="e.g. Lagos, Ikeja, No 11 Allen Avenue"
                    value={deliveryLocation}
                    onChange={(e) => handleAddressChange(e.target.value)}
                    style={{ width: "100%", padding: "10px 12px", borderRadius: "10px", border: `1px solid ${t.border}`, background: t.pageBg, color: t.textPrimary, fontSize: "13px", outline: "none", fontFamily: "inherit" }}
                  />
                  {/* Auto-detected zone chip */}
                  {deliveryModel === "zones" && deliveryLocation.trim().length >= 5 && (
                    <div style={{ marginTop: "8px", padding: "8px 12px", borderRadius: "8px", display: "flex", alignItems: "center", gap: "8px", background: detectedZone?.confidence === "matched" ? `${t.accent}12` : "#fef3c7", border: `1px solid ${detectedZone?.confidence === "matched" ? `${t.accent}33` : "#fde68a"}` }}>
                      <span style={{ fontSize: "14px" }}>{detectedZone?.confidence === "matched" ? "📍" : "⚠️"}</span>
                      <div style={{ flex: 1 }}>
                        {detectedZone?.confidence === "matched" ? (
                          <p style={{ margin: 0, fontSize: "12px", fontWeight: 700, color: t.textPrimary }}>
                            Zone: <strong>{detectedZone.zoneName}</strong> — {formatPrice(activeDeliveryFee, currency)}
                            {detectedZone.timeframe ? ` · ${detectedZone.timeframe}` : ""}
                          </p>
                        ) : (
                          <p style={{ margin: 0, fontSize: "12px", fontWeight: 700, color: "#92400e" }}>
                            Area not matched — using: <strong>{detectedZone?.zoneName || "Default Zone"}</strong> ({formatPrice(activeDeliveryFee, currency)})
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                  {deliveryModel === "flat" && activeDeliveryFee > 0 && deliveryLocation.trim().length > 0 && (
                    <p style={{ margin: "6px 0 0", fontSize: "11px", color: t.textSecondary, fontWeight: 600 }}>
                      🚚 Flat delivery fee: {formatPrice(activeDeliveryFee, currency)}
                    </p>
                  )}
                </div>

                {!locationValidation.valid && (
                  <div style={{
                    padding: "10px 12px",
                    borderRadius: "10px",
                    background: locationValidation.reason === "empty_address" ? "#fef3c7" : "#fef2f2",
                    border: `1px solid ${locationValidation.reason === "empty_address" ? "#fde68a" : "#fecaca"}`,
                    fontSize: "12px",
                    color: locationValidation.reason === "empty_address" ? "#92400e" : "#ef4444",
                    fontWeight: 700,
                    lineHeight: 1.4,
                  }}>
                    {locationValidation.message}
                  </div>
                )}
              </div>
            ) : (
              <div style={{ padding: "10px 12px", borderRadius: "10px", background: `${t.accent}12`, border: `1px solid ${t.accent}33`, fontSize: "12px", color: t.textPrimary, display: "flex", flexDirection: "column", gap: "4px" }}>
                <p style={{ margin: 0, fontWeight: 800, color: t.accent }}>🏬 Store Pick-up Selected</p>
                <p style={{ margin: 0, opacity: 0.85 }}>
                  <strong>Address:</strong> {store.fulfillmentSettings?.pickupAddress || store.liveLocation || "Contact seller for address"}
                </p>
                {store.fulfillmentSettings?.pickupInstructions && (
                  <p style={{ margin: "2px 0 0", opacity: 0.65, fontSize: "11px" }}>
                    ℹ️ {store.fulfillmentSettings.pickupInstructions}
                  </p>
                )}
              </div>
            )}

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "2px" }}>
              <div>
                <span style={{ fontSize: "13px", fontWeight: 700, color: t.textSecondary }}>
                  {fulfillmentMethod === "pickup" ? "Total (Pick-up FREE)" : "Total Order Amount"}
                </span>
                {fulfillmentMethod === "delivery" && activeDeliveryFee > 0 && (
                  <p style={{ margin: 0, fontSize: "11px", color: t.accent, fontWeight: 700 }}>
                    Products: {formatPrice(totalPrice, currency)} + Delivery: {formatPrice(activeDeliveryFee, currency)}
                  </p>
                )}
                {fulfillmentMethod === "delivery" && deliveryModel === "quote" && (
                  <p style={{ margin: 0, fontSize: "11px", color: t.textSecondary, fontWeight: 600 }}>
                    + Delivery fee to be confirmed
                  </p>
                )}
              </div>
              <span style={{ fontSize: "18px", fontWeight: 900, color: t.textPrimary }}>{formatPrice(grandTotal, currency)}</span>
            </div>

            {checkoutError && (
              <div style={{ padding: "10px 12px", borderRadius: "10px", background: "#fef2f2", border: "1px solid #fecaca", fontSize: "12px", color: "#ef4444", fontWeight: 700 }}>
                {checkoutError}
              </div>
            )}

            <button
              onClick={handleConfirmOrder}
              disabled={!canCheckout}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                padding: "14px",
                borderRadius: "12px",
                background: canCheckout ? "#25d366" : t.border,
                color: canCheckout ? "#fff" : t.textSecondary,
                fontWeight: 900,
                fontSize: "15px",
                border: "none",
                cursor: canCheckout ? "pointer" : "not-allowed",
                opacity: canCheckout ? 1 : 0.6,
                boxShadow: canCheckout ? "0 6px 20px rgba(37, 211, 102, 0.35)" : "none",
              }}
            >
              {checkoutState === "loading"
                ? <><div style={{ width: "16px", height: "16px", border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", animation: "sf-spin 0.7s linear infinite" }} /> Confirming order…</>
                : <><WhatsAppIcon /> Confirm Order ({totalQuantity})</>
              }
            </button>
          </div>
        )}
      </div>
    </>
  );
}

/* ── Side menu drawer ───────────────────────────────────── */
function SideMenu({ open, onClose, store, categories, activeCategory, onCategoryChange, theme, search, onSearchChange, slug, onWhatsAppRedirect }) {
  const t = theme;
  if (!open) return null;
  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 200, backdropFilter: "blur(4px)", animation: "sf-fade-in 0.2s" }} />
      <div style={{ position: "fixed", top: 0, left: 0, bottom: 0, width: "290px", maxWidth: "88vw", background: t.navBg, zIndex: 201, display: "flex", flexDirection: "column", boxShadow: "8px 0 48px rgba(0,0,0,0.25)", overflowY: "auto", borderRight: `1px solid ${t.border}` }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 18px 16px", borderBottom: `1px solid ${t.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {store.logoUrl ? (
              <img src={store.logoUrl} alt={store.businessName} style={{ width: "34px", height: "34px", borderRadius: "8px", objectFit: "cover" }} />
            ) : (
              <div style={{ width: "34px", height: "34px", borderRadius: "8px", background: t.accent, display: "flex", alignItems: "center", justifyContent: "center", color: t.accentText, fontWeight: 900, fontSize: "16px", flexShrink: 0 }}>
                {store.businessName?.charAt(0)?.toUpperCase()}
              </div>
            )}
            <p style={{ margin: 0, fontSize: "15px", fontWeight: 900, color: t.textPrimary }}>{store.businessName}</p>
          </div>
          <button onClick={onClose} style={{ width: "30px", height: "30px", borderRadius: "8px", background: t.pageBg, border: `1px solid ${t.border}`, color: t.textSecondary, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><XIcon /></button>
        </div>

        <div style={{ padding: "14px 16px", borderBottom: `1px solid ${t.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", background: t.pageBg, borderRadius: "10px", padding: "9px 12px", border: `1px solid ${t.border}` }}>
            <span style={{ color: t.textSecondary, flexShrink: 0 }}><SearchIcon /></span>
            <input value={search} onChange={e => onSearchChange(e.target.value)} placeholder="Search products…" style={{ flex: 1, background: "none", border: "none", outline: "none", fontSize: "13px", color: t.textPrimary, fontFamily: "inherit" }} />
          </div>
        </div>

        {categories.length > 0 && (
          <div style={{ padding: "16px", borderBottom: `1px solid ${t.border}` }}>
            <p style={{ margin: "0 0 10px", fontSize: "10px", fontWeight: 900, color: t.textSecondary, textTransform: "uppercase", letterSpacing: "0.1em" }}>Categories</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
              {["all", ...categories].map(cat => {
                const isActive = activeCategory === cat;
                return (
                  <button key={cat} onClick={() => { onCategoryChange(cat); onClose(); }}
                    style={{ padding: "9px 12px", borderRadius: "8px", border: "none", background: isActive ? t.accent : "transparent", color: isActive ? t.accentText : t.textPrimary, fontSize: "13px", fontWeight: isActive ? 800 : 600, cursor: "pointer", textAlign: "left", transition: "all 0.15s" }}>
                    {cat === "all" ? "All Products" : cat}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
          {store.workingHours && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: t.textSecondary }}>
              <ClockIcon />{store.workingHours}
            </div>
          )}
          {store.liveLocation && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: t.textSecondary }}>
              <MapPinIcon />{store.liveLocation}
            </div>
          )}
        </div>

        {store.whatsappHref && (
          <div style={{ padding: "0 16px 20px", marginTop: "auto" }}>
            <a href={store.whatsappHref} onClick={(e) => onWhatsAppRedirect ? onWhatsAppRedirect(e, store.whatsappHref) : handleWhatsAppRedirect(e, store.whatsappHref)} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "12px", borderRadius: "12px", background: "#25d366", color: "#fff", fontWeight: 900, fontSize: "14px", textDecoration: "none", boxShadow: "0 4px 16px rgba(37,211,102,0.3)" }}>
              <WhatsAppIcon /> Chat on WhatsApp
            </a>
          </div>
        )}
      </div>
    </>
  );
}

/* ── Product Card Component ─────────────────────────────── */
function ProductCard({ product, store, slug, sessionToken, theme, highlighted, index = 0, cartQuantity = 0, onUpdateQty, onAddToCart }) {
  const [imgError, setImgError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [showVariantPicker, setShowVariantPicker] = useState(false);
  const [selectedVariants, setSelectedVariants] = useState({});
  const t = theme;
  const currency = store.currency || "NGN";
  const displayPrice = product.discountPrice || product.price;
  const hasDiscount = !!(product.discountPrice && product.discountPrice < product.price);
  const discountPercent = hasDiscount ? Math.round(((product.price - product.discountPrice) / product.price) * 100) : 0;
  const productHref = `/store/${slug}/${product.slug || product._id}${sessionToken ? `?session=${sessionToken}` : ""}`;
  const hasVariants = product.variants && product.variants.length > 0;

  // Calculate price with selected variant adjustments
  const variantPriceAdj = Object.entries(selectedVariants).reduce((sum, [label, value]) => {
    const variantDef = (product.variants || []).find(v => v.label === label);
    const optionDef = variantDef?.options?.find(o => o.value === value);
    return sum + (optionDef?.priceAdjustment || 0);
  }, 0);
  const effectivePrice = displayPrice + variantPriceAdj;

  const allVariantsSelected = !hasVariants || product.variants.every(v => selectedVariants[v.label]);

  const handleAddClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (hasVariants) {
      setShowVariantPicker(true);
    } else {
      onAddToCart(product, 1, []);
    }
  };

  const handleVariantConfirm = () => {
    if (!allVariantsSelected) return;
    const variantsArray = Object.entries(selectedVariants).map(([label, value]) => ({ label, value }));
    onAddToCart(product, 1, variantsArray);
    setShowVariantPicker(false);
    setSelectedVariants({});
  };

  return (
    <div style={{ textDecoration: "none", position: "relative" }}>
      {/* Variant Picker Modal */}
      {showVariantPicker && (
        <div
          onClick={() => setShowVariantPicker(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 400, display: "flex", alignItems: "flex-end", justifyContent: "center", backdropFilter: "blur(4px)" }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ background: t.navBg, borderRadius: "20px 20px 0 0", padding: "24px 20px 32px", width: "100%", maxWidth: "480px", boxShadow: "0 -8px 40px rgba(0,0,0,0.25)" }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
              <div>
                <p style={{ margin: 0, fontSize: "15px", fontWeight: 900, color: t.textPrimary }}>{product.name}</p>
                <p style={{ margin: "2px 0 0", fontSize: "14px", fontWeight: 700, color: t.accent }}>{formatPrice(effectivePrice, currency)}</p>
              </div>
              <button onClick={() => setShowVariantPicker(false)} style={{ background: t.pageBg, border: `1px solid ${t.border}`, borderRadius: "8px", width: "32px", height: "32px", cursor: "pointer", color: t.textSecondary, display: "flex", alignItems: "center", justifyContent: "center" }}><XIcon /></button>
            </div>

            {product.variants.map(variant => (
              <div key={variant.label} style={{ marginBottom: "16px" }}>
                <p style={{ margin: "0 0 8px", fontSize: "11px", fontWeight: 800, color: t.textSecondary, textTransform: "uppercase", letterSpacing: "0.08em" }}>{variant.label}</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {variant.options.map(opt => {
                    const isSelected = selectedVariants[variant.label] === opt.value;
                    const isOutOfStock = opt.stock === 0;
                    return (
                      <button
                        key={opt.value}
                        disabled={isOutOfStock}
                        onClick={() => setSelectedVariants(prev => ({ ...prev, [variant.label]: opt.value }))}
                        style={{
                          padding: "7px 14px",
                          borderRadius: "8px",
                          border: isSelected ? `2px solid ${t.accent}` : `1px solid ${t.border}`,
                          background: isSelected ? `${t.accent}18` : t.pageBg,
                          color: isOutOfStock ? t.textSecondary : t.textPrimary,
                          fontWeight: isSelected ? 800 : 600,
                          fontSize: "13px",
                          cursor: isOutOfStock ? "not-allowed" : "pointer",
                          opacity: isOutOfStock ? 0.4 : 1,
                          transition: "all 0.15s",
                        }}
                      >
                        {opt.value}
                        {opt.priceAdjustment > 0 && <span style={{ fontSize: "10px", color: t.accent, marginLeft: "4px" }}>+{formatPrice(opt.priceAdjustment, currency)}</span>}
                        {opt.priceAdjustment < 0 && <span style={{ fontSize: "10px", color: "#22c55e", marginLeft: "4px" }}>{formatPrice(opt.priceAdjustment, currency)}</span>}
                        {isOutOfStock && <span style={{ fontSize: "9px", color: t.textSecondary, marginLeft: "4px" }}>Out</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            <button
              onClick={handleVariantConfirm}
              disabled={!allVariantsSelected}
              style={{ width: "100%", padding: "14px", borderRadius: "12px", background: allVariantsSelected ? t.accent : t.border, color: allVariantsSelected ? t.accentText : t.textSecondary, fontWeight: 900, fontSize: "14px", border: "none", cursor: allVariantsSelected ? "pointer" : "not-allowed", marginTop: "8px", transition: "all 0.15s" }}
            >
              {allVariantsSelected ? "Add to Cart" : "Select all options to continue"}
            </button>
          </div>
        </div>
      )}

      <article
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          background: t.card,
          borderRadius: "16px",
          overflow: "hidden",
          border: highlighted ? `2px solid ${t.accent}` : `1px solid ${t.border}`,
          boxShadow: hovered
            ? `0 16px 36px rgba(0,0,0,0.12)`
            : highlighted
              ? `0 0 0 3px ${t.accent}22`
              : "0 2px 10px rgba(0,0,0,0.03)",
          transform: hovered ? "translateY(-4px)" : "none",
          transition: "transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          animation: `sf-card-entry 0.4s cubic-bezier(0.16, 1, 0.3, 1) ${Math.min(index * 0.03, 0.3)}s both`,
        }}
      >
        {/* Loading overlay */}
        {loading && (
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 10, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "16px", backdropFilter: "blur(3px)" }}>
            <div style={{ width: "28px", height: "28px", border: "3px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "sf-spin 0.7s linear infinite" }} />
          </div>
        )}

        {/* Quantity Badge */}
        {cartQuantity > 0 && (
          <div style={{ position: "absolute", top: "8px", right: "8px", zIndex: 5, background: "#25d366", color: "#fff", padding: "2px 8px", borderRadius: "999px", fontSize: "10px", fontWeight: 900, boxShadow: "0 2px 8px rgba(37,211,102,0.4)" }}>
            {cartQuantity} in cart
          </div>
        )}

        {/* Image container */}
        <Link href={productHref} onClick={() => setLoading(true)} style={{ textDecoration: "none", color: "inherit", display: "block" }}>
          <div style={{ position: "relative", paddingTop: "88%", background: t.pageBg, overflow: "hidden" }}>
            {product.images?.[0]?.url && !imgError ? (
              <img
                src={product.images[0].url}
                alt={product.name}
                onError={() => setImgError(true)}
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  transform: hovered ? "scale(1.06)" : "scale(1)",
                  transition: "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
                }}
              />
            ) : (
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: t.textSecondary, opacity: 0.35 }}><PackageIcon /></div>
            )}

            {product.stock === 0 && <div style={{ position: "absolute", top: "8px", left: "8px", background: "rgba(15, 15, 19, 0.88)", color: "#fff", padding: "3px 8px", borderRadius: "6px", fontSize: "9px", fontWeight: 900, letterSpacing: "0.06em", backdropFilter: "blur(4px)" }}>SOLD OUT</div>}
            {highlighted && <div style={{ position: "absolute", top: "8px", left: "8px", background: t.accent, color: t.accentText, padding: "3px 8px", borderRadius: "6px", fontSize: "9px", fontWeight: 900 }}>🤖 AI Pick</div>}
            {hasDiscount && !highlighted && product.stock > 0 && cartQuantity === 0 && (
              <div style={{ position: "absolute", top: "8px", left: "8px", background: "#ef4444", color: "#fff", padding: "3px 8px", borderRadius: "6px", fontSize: "9px", fontWeight: 900, boxShadow: "0 2px 8px rgba(239,68,68,0.3)" }}>
                -{discountPercent}% OFF
              </div>
            )}
          </div>
        </Link>

        {/* Info Content */}
        <div style={{ padding: "12px 14px", flex: 1, display: "flex", flexDirection: "column", gap: "4px" }}>
          <Link href={productHref} onClick={() => setLoading(true)} style={{ textDecoration: "none", color: "inherit" }}>
            {product.category && <span style={{ fontSize: "10px", fontWeight: 800, color: t.textSecondary, textTransform: "uppercase", letterSpacing: "0.06em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", display: "block" }}>{product.category}</span>}
            <h3 style={{ margin: "2px 0 0", fontSize: "13px", fontWeight: 700, color: hovered ? t.accent : t.textPrimary, transition: "color 0.2s", lineHeight: 1.3, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", textOverflow: "ellipsis" }}>{product.name}</h3>
          </Link>

          {hasVariants && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginTop: "2px" }}>
              {product.variants.map(v => (
                <span key={v.label} style={{ fontSize: "9px", fontWeight: 700, color: t.textSecondary, background: t.pageBg, border: `1px solid ${t.border}`, borderRadius: "4px", padding: "2px 5px" }}>
                  {v.label}: {v.options.slice(0, 3).map(o => o.value).join(", ")}{v.options.length > 3 ? "…" : ""}
                </span>
              ))}
            </div>
          )}

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "6px", marginTop: "auto", paddingTop: "8px" }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: "15px", fontWeight: 900, color: t.textPrimary }}>{formatPrice(displayPrice, currency)}</span>
              {hasDiscount && <span style={{ fontSize: "10px", color: t.textSecondary, textDecoration: "line-through" }}>{formatPrice(product.price, currency)}</span>}
            </div>

            {/* Compact Action Button */}
            {product.stock !== 0 && (
              <div style={{ zIndex: 2 }} onClick={(e) => { e.stopPropagation(); e.preventDefault(); }}>
                {cartQuantity > 0 && !hasVariants ? (
                  <div style={{ display: "flex", alignItems: "center", gap: "3px", background: t.pageBg, border: `1px solid ${t.accent}`, borderRadius: "8px", padding: "2px 6px" }}>
                    <button onClick={() => onUpdateQty(`${product._id}__`, cartQuantity - 1)} style={{ background: "none", border: "none", color: t.textPrimary, cursor: "pointer", display: "flex", alignItems: "center", padding: "2px" }}><MinusIcon /></button>
                    <span style={{ fontSize: "12px", fontWeight: 900, color: t.textPrimary, minWidth: "14px", textAlign: "center" }}>{cartQuantity}</span>
                    <button onClick={() => onUpdateQty(`${product._id}__`, cartQuantity + 1)} style={{ background: "none", border: "none", color: t.textPrimary, cursor: "pointer", display: "flex", alignItems: "center", padding: "2px" }}><PlusIcon /></button>
                  </div>
                ) : (
                  <button
                    onClick={handleAddClick}
                    style={{ padding: "5px 10px", borderRadius: "8px", background: t.accent, color: t.accentText, border: "none", fontSize: "11px", fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", gap: "3px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}
                  >
                    <PlusIcon /> {hasVariants ? "Select" : "Add"}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </article>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   MAIN: StorefrontPage
══════════════════════════════════════════════════════════ */
export default function StorefrontPage({
  store,
  initialProducts = [],
  initialCategories = [],
  initialPagination = null,
  products = [],
  slug,
  isPreview,
  sessionToken,
  referredProductId,
  initialSearch = "",
  initialOrderCode = "",   // ?order=CODE — pre-fills cart from an existing DB order for editing
}) {
  const theme = getTheme(store.storeTheme);
  const t = theme;
  const cartState = useCart(slug);

  const [productsList, setProductsList] = useState(initialProducts.length ? initialProducts : products);
  const [categoriesList, setCategoriesList] = useState(
    initialCategories.length
      ? initialCategories
      : [...new Set(products.map(p => p.category).filter(Boolean))].sort()
  );
  const [pagination, setPagination] = useState(
    initialPagination || {
      total: productsList.length,
      page: 1,
      limit: 20,
      totalPages: Math.ceil(productsList.length / 20) || 1,
    }
  );

  const [search, setSearch] = useState(initialSearch || "");
  const [activeCategory, setActiveCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [highlightedProductId, setHighlightedProductId] = useState(referredProductId || null);
  const [loadingPage, setLoadingPage] = useState(false);
  // Skip the initial-mount guard when a search query was pre-seeded from the URL —
  // we need the useEffect to fire on first render to fetch the filtered products.
  const [isInitialMount, setIsInitialMount] = useState(!initialSearch);
  const [waChooserModal, setWaChooserModal] = useState({ visible: false, messengerUrl: "", businessUrl: "" });

  const openWhatsApp = (e, href) => {
    handleWhatsAppRedirect(e, href, (messengerUrl, businessUrl) => {
      setWaChooserModal({ visible: true, messengerUrl, businessUrl });
    });
  };

  // Validate session + resolve referredProductId
  useEffect(() => {
    if (!sessionToken) return;
    fetch(`/api/store/session?token=${encodeURIComponent(sessionToken)}`)
      .then(r => r.json())
      .then(data => { if (data.valid && data.payload?.referredProductId) setHighlightedProductId(data.payload.referredProductId); })
      .catch(() => { });
  }, [sessionToken]);

  // Pre-fill cart from an existing order when ?order=CODE is in the URL (edit flow)
  useEffect(() => {
    if (!initialOrderCode || !slug) return;
    fetch(`/api/store/${slug}/checkout?order=${encodeURIComponent(initialOrderCode)}`)
      .then(r => r.json())
      .then(data => {
        if (data.success && data.order?.items?.length) {
          // Clear current cart and load order items
          cartState.clear();
          data.order.items.forEach(item => {
            cartState.addItem(
              {
                _id: item.productId,
                name: item.name,
                price: item.price,
                discountPrice: null,
                images: item.imageUrl ? [{ url: item.imageUrl }] : [],
                deliveryFee: 0,
                variants: [],
              },
              item.quantity,
              item.selectedVariants || []
            );
          });
          // Open cart drawer after a short delay so the customer sees the pre-filled cart
          setTimeout(() => setCartDrawerOpen(true), 400);
        }
      })
      .catch(() => { });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialOrderCode, slug]);

  const handleCategoryChange = (newCat) => {
    setActiveCategory(newCat);
    setCurrentPage(1);
  };

  const handleSearchChange = (val) => {
    setSearch(val);
    setCurrentPage(1);
  };

  // Fetch paginated products from DB API whenever page, category, or search changes
  useEffect(() => {
    if (isInitialMount) {
      setIsInitialMount(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoadingPage(true);
      try {
        const params = new URLSearchParams({
          page: currentPage.toString(),
          limit: "20",
        });
        if (activeCategory && activeCategory !== "all") params.set("category", activeCategory);
        if (search.trim()) params.set("q", search.trim());

        const res = await fetch(`/api/store/${slug}?${params.toString()}`);
        const data = await res.json();

        if (data.success) {
          setProductsList(data.products || []);
          if (data.categories) setCategoriesList(data.categories);
          if (data.pagination) setPagination(data.pagination);
        }
      } catch (err) {
        console.error("Storefront product fetch error:", err);
      } finally {
        setLoadingPage(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [currentPage, activeCategory, search, slug, isInitialMount]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 300, behavior: "smooth" });
  };

  const totalPages = pagination?.totalPages || 1;
  const totalProducts = pagination?.total || productsList.length;

  return (
    <>
      {isPreview && <OwnerBanner slug={slug} />}
      <div style={{ minHeight: "100vh", background: t.pageBg, fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>

        {/* ── DESKTOP & MOBILE HEADER BAR ────────────────────── */}
        <nav className="sf-top-navbar" style={{
          background: `${t.navBg}f5`,
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderBottom: `1px solid ${t.border}`,
          position: "sticky",
          top: isPreview ? "42px" : 0,
          zIndex: 50,
        }}>
          <div style={{ maxWidth: "1140px", margin: "0 auto", padding: "0 16px", display: "flex", alignItems: "center", justifyContent: "space-between", height: "56px", gap: "12px" }}>
            {/* Left: hamburger menu + store title */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <button onClick={() => setMenuOpen(true)} style={{ width: "36px", height: "36px", borderRadius: "8px", border: `1px solid ${t.border}`, background: t.card, color: t.textPrimary, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <MenuIcon />
              </button>
            </div>

            {/* Right: Cart Button & Desktop WhatsApp Link */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <button
                onClick={() => setCartDrawerOpen(true)}
                style={{
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "7px 14px",
                  borderRadius: "10px",
                  background: cartState.totalQuantity > 0 ? t.accent : t.card,
                  border: `1px solid ${cartState.totalQuantity > 0 ? t.accent : t.border}`,
                  color: cartState.totalQuantity > 0 ? t.accentText : t.textPrimary,
                  cursor: "pointer",
                  fontSize: "12px",
                  fontWeight: 800
                }}
              >
                <ShoppingBagIcon />
                <span>Cart</span>
                {cartState.totalQuantity > 0 && (
                  <span style={{ background: "#ef4444", color: "#fff", padding: "1px 6px", borderRadius: "999px", fontSize: "10px", fontWeight: 900 }}>
                    {cartState.totalQuantity}
                  </span>
                )}
              </button>
            </div>
          </div>
        </nav>

        {/* ── PROMO ANNOUNCEMENT BANNER ────────────────
        {store.promoAnnouncement?.enabled && store.promoAnnouncement?.text && (
          <div style={{
            background: "linear-gradient(90deg, #6366f1 0%, #a855f7 50%, #ec4899 100%)",
            color: "#ffffff",
            padding: "9px 16px",
            textAlign: "center",
            fontSize: "12px",
            fontWeight: 800,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
          }}>
            <span style={{
              background: "rgba(255, 255, 255, 0.25)",
              color: "#fff",
              padding: "2px 7px",
              borderRadius: "5px",
              fontSize: "10px",
              fontWeight: 900,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}>
              {store.promoAnnouncement.badgeText || "PROMO"}
            </span>
            <span>{store.promoAnnouncement.text}</span>
          </div>
        )} */}

        {/* ── SIDE MENU ────────────────────────────────── */}
        <SideMenu open={menuOpen} onClose={() => setMenuOpen(false)} store={store} categories={categoriesList} activeCategory={activeCategory} onCategoryChange={handleCategoryChange} theme={t} search={search} onSearchChange={handleSearchChange} slug={slug} onWhatsAppRedirect={openWhatsApp} />

        {/* ── CART DRAWER ──────────────────────────────── */}
        <CartDrawer
          open={cartDrawerOpen}
          onClose={() => setCartDrawerOpen(false)}
          cart={cartState.cart}
          totalQuantity={cartState.totalQuantity}
          totalPrice={cartState.totalPrice}
          onUpdateQty={(id, q) => cartState.setItemQuantity(id, q)}
          onRemoveItem={(id) => cartState.removeItem(id)}
          onClearCart={() => cartState.clear()}
          store={store}
          slug={slug}
          sessionToken={sessionToken}
          theme={t}
          onWhatsAppRedirect={openWhatsApp}
        />

        {/* ── MAIN CONTENT ─────────────────────────────── */}
        <main style={{ maxWidth: "1140px", margin: "0 auto", padding: "16px 16px 88px", position: "relative" }}>

          {/* ── COMPACT STORE HERO BANNER ──────────────── */}
          <div style={{
            background: t.card,
            borderRadius: "18px",
            border: `1px solid ${t.border}`,
            padding: "16px 18px",
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "14px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.02)"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "14px", minWidth: 0 }}>
              {store.logoUrl ? (
                <img src={store.logoUrl} alt={store.businessName} style={{ width: "52px", height: "52px", borderRadius: "14px", objectFit: "cover", flexShrink: 0, border: `1px solid ${t.border}` }} />
              ) : (
                <div style={{ width: "52px", height: "52px", borderRadius: "14px", background: t.accent, color: t.accentText, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: "22px", flexShrink: 0 }}>
                  {store.businessName?.charAt(0)?.toUpperCase()}
                </div>
              )}
              <div style={{ minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <h1 style={{ margin: 0, fontSize: "17px", fontWeight: 900, color: t.textPrimary, letterSpacing: "-0.02em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {store.businessName}
                  </h1>
                  <span style={{ background: "#22c55e18", color: "#16a34a", padding: "1px 6px", borderRadius: "4px", fontSize: "10px", fontWeight: 800, whiteSpace: "nowrap" }}>✓ Verified</span>
                </div>
                {store.businessDescription && (
                  <p style={{ margin: "2px 0 4px", fontSize: "12px", color: t.textSecondary, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {store.businessDescription}
                  </p>
                )}
                <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "11px", color: t.textSecondary }}>
                  {store.liveLocation && <span>📍 {store.liveLocation}</span>}
                  <span>📦 {totalProducts} Products</span>
                </div>
              </div>
            </div>

            {/* Desktop Hero CTA */}
            {store.whatsappHref && (
              <a href={store.whatsappHref} onClick={(e) => openWhatsApp(e, store.whatsappHref)} target="_blank" rel="noopener noreferrer" className="sf-desktop-chat-btn"
                style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "8px 16px", borderRadius: "10px", background: "#25d366", color: "#fff", fontWeight: 800, fontSize: "12px", textDecoration: "none", whiteSpace: "nowrap", flexShrink: 0, boxShadow: "0 2px 10px rgba(37,211,102,0.3)" }}>
                <WhatsAppIcon /> Order on WhatsApp
              </a>
            )}
          </div>

          {/* Search bar + category selector */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "20px", alignItems: "center" }}>
            {/* Search Input */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", background: t.card, borderRadius: "12px", padding: "8px 12px", border: `1px solid ${t.border}`, flex: "1 1 200px" }}>
              <span style={{ color: t.textSecondary, flexShrink: 0 }}>
                {loadingPage ? <div style={{ width: "14px", height: "14px", border: `2px solid ${t.border}`, borderTopColor: t.accent, borderRadius: "50%", animation: "sf-spin 0.7s linear infinite" }} /> : <SearchIcon />}
              </span>
              <input id="sf-search-input" value={search} onChange={e => handleSearchChange(e.target.value)} placeholder="Search store products…" style={{ flex: 1, background: "none", border: "none", outline: "none", fontSize: "13px", color: t.textPrimary, fontFamily: "inherit" }} />
              {search && <button onClick={() => handleSearchChange("")} style={{ background: "none", border: "none", cursor: "pointer", color: t.textSecondary, fontSize: "16px", lineHeight: 1, padding: 0 }}>×</button>}
            </div>

            {/* Mobile Category Dropdown Select (< 640px) */}
            {categoriesList.length > 0 && (
              <div className="sf-mobile-category-select" style={{ width: "100%" }}>
                <select
                  value={activeCategory}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "9px 14px",
                    borderRadius: "12px",
                    border: `1px solid ${t.border}`,
                    background: t.card,
                    color: t.textPrimary,
                    fontSize: "13px",
                    fontWeight: 700,
                    outline: "none",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    appearance: "none",
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23888' strokeWidth='2.5' xmlns='http://www.w3.org/2000/svg'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right 14px center",
                    paddingRight: "36px"
                  }}
                >
                  <option value="all">All Categories ({totalProducts})</option>
                  {categoriesList.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Desktop Category Pills (>= 640px) */}
            {categoriesList.length > 0 && (
              <div className="sf-desktop-category-pills" style={{ gap: "6px", flexWrap: "wrap" }}>
                {["all", ...categoriesList].map(cat => (
                  <button key={cat} onClick={() => handleCategoryChange(cat)}
                    style={{ padding: "7px 14px", borderRadius: "999px", border: activeCategory === cat ? "none" : `1px solid ${t.border}`, background: activeCategory === cat ? t.accent : t.card, color: activeCategory === cat ? t.accentText : t.textSecondary, fontSize: "12px", fontWeight: 700, cursor: "pointer", transition: "all 0.12s" }}>
                    {cat === "all" ? `All (${totalProducts})` : cat}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Search results label */}
          {search && <p style={{ fontSize: "13px", color: t.textSecondary, marginBottom: "16px", fontWeight: 600 }}>{productsList.length === 0 ? `No results for "${search}"` : `${totalProducts} result${totalProducts !== 1 ? "s" : ""} found`}</p>}

          {/* Loading Indicator */}
          {loadingPage && productsList.length > 0 && (
            <div style={{ padding: "12px 0", textAlign: "center", fontSize: "13px", color: t.textSecondary, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
              <div style={{ width: "16px", height: "16px", border: `2px solid ${t.border}`, borderTopColor: t.accent, borderRadius: "50%", animation: "sf-spin 0.7s linear infinite" }} />
              Updating products…
            </div>
          )}

          {/* Product grid / Loading state / Empty state */}
          {loadingPage && productsList.length === 0 ? (
            <div style={{ padding: "64px 20px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "12px", background: t.card, borderRadius: "18px", border: `1px solid ${t.border}` }}>
              <div style={{ width: "32px", height: "32px", border: `3px solid ${t.border}`, borderTopColor: t.accent, borderRadius: "50%", animation: "sf-spin 0.7s linear infinite" }} />
              <span style={{ fontSize: "14px", color: t.textSecondary, fontWeight: 700 }}>Loading store products…</span>
            </div>
          ) : productsList.length > 0 ? (
            <>
              <div className="sf-product-grid" style={{ opacity: loadingPage ? 0.6 : 1, transition: "opacity 0.2s" }}>
                {productsList.map((product, idx) => (
                  <ProductCard
                    key={product._id}
                    index={idx}
                    product={product}
                    store={store}
                    slug={slug}
                    sessionToken={sessionToken}
                    theme={t}
                    highlighted={product._id === highlightedProductId}
                    cartQuantity={cartState.cart
                      .filter(item => item.productId === product._id)
                      .reduce((sum, item) => sum + item.quantity, 0)}
                    onUpdateQty={(cartItemKeyOrProductId, qty) => {
                      if (qty > 0) {
                        cartState.setItemQuantity(cartItemKeyOrProductId, qty);
                      } else {
                        cartState.removeItem(cartItemKeyOrProductId);
                      }
                    }}
                    onAddToCart={(prod, qty, selectedVariants) => {
                      cartState.addItem(prod, qty, selectedVariants);
                    }}
                  />
                ))}
              </div>

              {/* ── PAGINATION CONTROLS ──────────────────────── */}
              {totalPages > 1 && (
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "14px", marginTop: "32px", paddingTop: "20px", borderTop: `1px solid ${t.border}` }}>
                  <p style={{ margin: 0, fontSize: "13px", color: t.textSecondary }}>
                    Showing <strong style={{ color: t.textPrimary }}>{(currentPage - 1) * 20 + 1}</strong>–<strong style={{ color: t.textPrimary }}>{Math.min(currentPage * 20, totalProducts)}</strong> of <strong style={{ color: t.textPrimary }}>{totalProducts}</strong> products
                  </p>

                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <button
                      disabled={currentPage === 1 || loadingPage}
                      onClick={() => handlePageChange(currentPage - 1)}
                      style={{
                        padding: "8px 14px",
                        borderRadius: "8px",
                        border: `1px solid ${t.border}`,
                        background: t.card,
                        color: currentPage === 1 ? t.textSecondary : t.textPrimary,
                        opacity: currentPage === 1 ? 0.4 : 1,
                        cursor: currentPage === 1 ? "not-allowed" : "pointer",
                        fontSize: "12px",
                        fontWeight: 700,
                      }}
                    >
                      Prev
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        disabled={loadingPage}
                        onClick={() => handlePageChange(page)}
                        style={{
                          minWidth: "34px",
                          height: "34px",
                          padding: "0 6px",
                          borderRadius: "8px",
                          border: page === currentPage ? "none" : `1px solid ${t.border}`,
                          background: page === currentPage ? t.accent : t.card,
                          color: page === currentPage ? t.accentText : t.textPrimary,
                          cursor: "pointer",
                          fontSize: "13px",
                          fontWeight: page === currentPage ? 900 : 700,
                        }}
                      >
                        {page}
                      </button>
                    ))}

                    <button
                      disabled={currentPage === totalPages || loadingPage}
                      onClick={() => handlePageChange(currentPage + 1)}
                      style={{
                        padding: "8px 14px",
                        borderRadius: "8px",
                        border: `1px solid ${t.border}`,
                        background: t.card,
                        color: currentPage === totalPages ? t.textSecondary : t.textPrimary,
                        opacity: currentPage === totalPages ? 0.4 : 1,
                        cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                        fontSize: "12px",
                        fontWeight: 700,
                      }}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div style={{ textAlign: "center", padding: "64px 20px", background: t.card, borderRadius: "18px", border: `1px dashed ${t.border}` }}>
              <div style={{ fontSize: "44px", marginBottom: "14px" }}>📦</div>
              <h3 style={{ fontSize: "18px", fontWeight: 900, color: t.textPrimary, margin: "0 0 8px" }}>{search ? "No products match your search" : "No products yet"}</h3>
              <p style={{ fontSize: "13px", color: t.textSecondary, margin: "0 0 24px" }}>{search ? "Try searching for a different item or select another category." : "This store hasn't published any products yet."}</p>
              {search && <button onClick={() => { handleSearchChange(""); handleCategoryChange("all"); }} style={{ padding: "10px 24px", borderRadius: "10px", background: t.accent, color: t.accentText, fontWeight: 800, border: "none", cursor: "pointer", fontSize: "13px" }}>Clear search</button>}
              {!search && store.whatsappHref && <a href={store.whatsappHref} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "10px 24px", borderRadius: "12px", background: "#25d366", color: "#fff", fontWeight: 900, textDecoration: "none", fontSize: "13px" }}><WhatsAppIcon /> Ask on WhatsApp</a>}
            </div>
          )}
        </main>

        {/* ── MOBILE STICKY BOTTOM APP NAVIGATION BAR ────────── */}
        <div className="sf-mobile-bottom-bar" style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 150,
          background: `${t.navBg}f5`,
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderTop: `1px solid ${t.border}`,
          alignItems: "center",
          justifyContent: "space-around",
          padding: "8px 8px calc(8px + env(safe-area-inset-bottom, 0px))",
          boxShadow: "0 -4px 20px rgba(0,0,0,0.15)"
        }}>
          {/* Menu Tab */}
          <button onClick={() => setMenuOpen(true)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2px", background: "none", border: "none", color: t.textSecondary, cursor: "pointer", fontSize: "10px", fontWeight: 700 }}>
            <MenuIcon />
            <span>Menu</span>
          </button>

          {/* Store Tab */}
          <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2px", background: "none", border: "none", color: t.accent, cursor: "pointer", fontSize: "10px", fontWeight: 800 }}>
            <span style={{ fontSize: "18px", lineHeight: 1 }}>🏪</span>
            <span>Store</span>
          </button>

          {/* Search Tab */}
          <button onClick={() => { const el = document.getElementById("sf-search-input"); el?.focus(); el?.scrollIntoView({ behavior: "smooth", block: "center" }); }} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2px", background: "none", border: "none", color: t.textSecondary, cursor: "pointer", fontSize: "10px", fontWeight: 700 }}>
            <SearchIcon />
            <span>Search</span>
          </button>

          {/* Cart Tab */}
          <button onClick={() => setCartDrawerOpen(true)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2px", background: "none", border: "none", color: t.textSecondary, cursor: "pointer", fontSize: "10px", fontWeight: 700, position: "relative" }}>
            <ShoppingBagIcon />
            <span>Cart</span>
            {cartState.totalQuantity > 0 && (
              <span style={{ position: "absolute", top: "-4px", right: "6px", background: "#ef4444", color: "#fff", padding: "1px 5px", borderRadius: "999px", fontSize: "9px", fontWeight: 900, boxShadow: "0 2px 6px rgba(239,68,68,0.4)" }}>
                {cartState.totalQuantity}
              </span>
            )}
          </button>

          {/* WhatsApp Chat Tab */}
          {store.whatsappHref && (
            <a href={store.whatsappHref} onClick={(e) => openWhatsApp(e, store.whatsappHref)} target="_blank" rel="noopener noreferrer" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2px", color: "#25d366", textDecoration: "none", fontSize: "10px", fontWeight: 800 }}>
              <WhatsAppIcon />
              <span>Chat</span>
            </a>
          )}
        </div>

        {/* ── PAX26 AD FOOTER ──────────────────────────── */}
        <Pax26Footer />

        <WhatsAppChooserModal
          visible={waChooserModal.visible}
          onClose={() => setWaChooserModal({ visible: false, messengerUrl: "", businessUrl: "" })}
          messengerUrl={waChooserModal.messengerUrl}
          businessUrl={waChooserModal.businessUrl}
          theme={t}
        />

      </div>
      <style>{`
        @keyframes sf-spin { to { transform: rotate(360deg); } }
        @keyframes sf-fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes sf-card-entry {
          0% { opacity: 0; transform: translateY(14px) scale(0.97); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        .sf-product-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
        }
        @media (min-width: 640px) {
          .sf-product-grid {
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 16px;
          }
          .sf-mobile-bottom-bar {
            display: none !important;
          }
          .sf-mobile-category-select {
            display: none !important;
          }
          .sf-desktop-category-pills {
            display: flex !important;
          }
        }
        @media (max-width: 639px) {
          .sf-top-navbar {
            display: none !important;
          }
          .sf-mobile-bottom-bar {
            display: flex !important;
          }
          .sf-mobile-category-select {
            display: block !important;
          }
          .sf-desktop-category-pills {
            display: none !important;
          }
          .sf-desktop-chat-btn {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
}
