"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { formatPrice } from "@/app/lib/currency/currencyHelper";
import { getTheme } from "@/app/lib/store/storeThemes";
import { useCart } from "@/app/lib/store/useCart";
import { buildMultiProductWhatsAppMessage } from "@/app/lib/store/buildMultiProductWhatsAppMessage";

/* ── Icons ──────────────────────────────────────────────── */
const SearchIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>);
const WhatsAppIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>);
const MenuIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>);
const XIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>);
const MapPinIcon = () => (<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>);
const ClockIcon = () => (<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>);
const PackageIcon = () => (<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>);
const EditIcon = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>);
const ZapIcon = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>);
const ShoppingBagIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>);
const TrashIcon = () => (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>);
const PlusIcon = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>);
const MinusIcon = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>);

/* ── Owner preview banner ───────────────────────────────── */
function OwnerBanner({ slug }) {
  return (
    <div style={{ position: "sticky", top: 0, zIndex: 100, background: "#1a1a1a", color: "#fff", padding: "10px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px", fontSize: "13px", fontWeight: 600 }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span style={{ background: "#22c55e", borderRadius: "4px", padding: "2px 8px", fontSize: "10px", fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase" }}>Preview Mode</span>
        <span style={{ opacity: 0.75 }}>This is exactly what your customers see</span>
      </div>
      <a href="/dashboard/automations/ai-business-dashboard" style={{ display: "flex", alignItems: "center", gap: "6px", padding: "6px 14px", borderRadius: "8px", background: "#fff", color: "#1a1a1a", textDecoration: "none", fontSize: "12px", fontWeight: 700 }}>
        <EditIcon /> Edit Store
      </a>
    </div>
  );
}

/* ── Pax26 powered footer (ad strip) ───────────────────── */
function Pax26Footer() {
  return (
    <div style={{ background: "linear-gradient(135deg, #0f0f13 0%, #1a1a28 100%)", borderTop: "1px solid #2a2a3a", padding: "20px 24px" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", flexShrink: 0 }}>
            <ZapIcon />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: "13px", fontWeight: 800, color: "#fff" }}>
              Powered by <span style={{ color: "#818cf8" }}>Pax26</span>
            </p>
            <p style={{ margin: 0, fontSize: "11px", color: "#6b7280" }}>
              AI-powered WhatsApp storefront — free for every business
            </p>
          </div>
        </div>
        <a
          href="https://pax26.com"
          target="_blank"
          rel="noopener noreferrer"
          style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 18px", borderRadius: "10px", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "#fff", fontWeight: 700, fontSize: "12px", textDecoration: "none", whiteSpace: "nowrap", boxShadow: "0 4px 14px #6366f140" }}
        >
          Create your free store →
        </a>
      </div>
    </div>
  );
}

export function handleWhatsAppRedirect(e, href) {
  if (!href) return;
  e?.preventDefault();
  const isMobile = typeof window !== "undefined" && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  const match = href.match(/wa\.me\/(\d+)(?:\?text=(.*))?/);
  if (isMobile && match) {
    const phone = match[1];
    const text = match[2] || "";
    const deepLink = `whatsapp://send?phone=${phone}${text ? `&text=${text}` : ""}`;
    window.location.href = deepLink;
    setTimeout(() => {
      window.location.href = href;
    }, 1200);
  } else {
    window.open(href, "_blank");
  }
}

/* ── Cart Drawer Component ───────────────────────────────── */
function CartDrawer({ open, onClose, cart, totalQuantity, totalPrice, onUpdateQty, onRemoveItem, onClearCart, store, slug, sessionToken, theme }) {
  const t = theme;
  const [deliveryLocation, setDeliveryLocation] = useState("");
  const currency = store.currency || "NGN";

  if (!open) return null;

  const handleCheckoutWhatsApp = (e) => {
    e.preventDefault();
    if (!cart.length) return;

    const baseWaHref = store.whatsappHref?.split("?")[0] || "";
    if (!baseWaHref) return;

    const encodedText = buildMultiProductWhatsAppMessage({
      businessName: store.businessName,
      cartItems: cart,
      currency,
      deliveryLocation,
      slug,
      sessionToken,
    });

    const fullWaUrl = `${baseWaHref}?text=${encodedText}`;

    // Clear cart immediately when customer clicks Order on WhatsApp!
    onClearCart();
    onClose();

    handleWhatsAppRedirect(e, fullWaUrl);
  };

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 300, backdropFilter: "blur(3px)" }} />
      <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: "380px", maxWidth: "90vw", background: t.navBg, zIndex: 301, display: "flex", flexDirection: "column", boxShadow: "-6px 0 40px rgba(0,0,0,0.3)" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 20px 16px", borderBottom: `1px solid ${t.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: t.accent, color: t.accentText, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <ShoppingBagIcon />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: "16px", fontWeight: 800, color: t.textPrimary }}>Your Cart</p>
              <p style={{ margin: 0, fontSize: "11px", color: t.textSecondary }}>{totalQuantity} {totalQuantity === 1 ? "item" : "items"}</p>
            </div>
          </div>
          <button onClick={onClose} style={{ width: "32px", height: "32px", borderRadius: "8px", background: "transparent", border: `1px solid ${t.border}`, color: t.textSecondary, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><XIcon /></button>
        </div>

        {/* Cart Items */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: "14px" }}>
          {cart.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px 16px", color: t.textSecondary }}>
              <div style={{ fontSize: "40px", marginBottom: "12px" }}>🛒</div>
              <p style={{ margin: "0 0 6px", fontSize: "15px", fontWeight: 700, color: t.textPrimary }}>Your cart is empty</p>
              <p style={{ margin: 0, fontSize: "12px" }}>Add items from the store to order multiple products at once.</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.productId} style={{ display: "flex", alignItems: "center", gap: "12px", background: t.card, padding: "12px", borderRadius: "12px", border: `1px solid ${t.border}` }}>
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.name} style={{ width: "48px", height: "48px", borderRadius: "8px", objectFit: "cover", flexShrink: 0 }} />
                ) : (
                  <div style={{ width: "48px", height: "48px", borderRadius: "8px", background: t.pageBg, display: "flex", alignItems: "center", justifyContent: "center", color: t.textSecondary, flexShrink: 0 }}><PackageIcon /></div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: "0 0 2px", fontSize: "13px", fontWeight: 700, color: t.textPrimary, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.name}</p>
                  <p style={{ margin: 0, fontSize: "13px", fontWeight: 800, color: t.accent }}>{formatPrice(item.price * item.quantity, currency)}</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", background: t.pageBg, borderRadius: "8px", padding: "4px 6px", border: `1px solid ${t.border}` }}>
                  <button onClick={() => onUpdateQty(item.productId, item.quantity - 1)} style={{ background: "none", border: "none", color: t.textPrimary, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: "2px" }}><MinusIcon /></button>
                  <span style={{ fontSize: "12px", fontWeight: 800, color: t.textPrimary, minWidth: "16px", textAlign: "center" }}>{item.quantity}</span>
                  <button onClick={() => onUpdateQty(item.productId, item.quantity + 1)} style={{ background: "none", border: "none", color: t.textPrimary, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: "2px" }}><PlusIcon /></button>
                </div>
                <button onClick={() => onRemoveItem(item.productId)} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", padding: "4px" }} title="Remove item"><TrashIcon /></button>
              </div>
            ))
          )}
        </div>

        {/* Footer Checkout Section */}
        {cart.length > 0 && (
          <div style={{ padding: "16px 20px 20px", borderTop: `1px solid ${t.border}`, background: t.navBg, display: "flex", flexDirection: "column", gap: "12px" }}>
            {/* Delivery Location Input */}
            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: t.textSecondary, marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Delivery Location (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Ikeja, Lagos or Delivery Address"
                value={deliveryLocation}
                onChange={(e) => setDeliveryLocation(e.target.value)}
                style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: `1px solid ${t.border}`, background: t.pageBg, color: t.textPrimary, fontSize: "13px", outline: "none" }}
              />
            </div>

            {/* Total Price Summary */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "4px" }}>
              <span style={{ fontSize: "14px", fontWeight: 700, color: t.textSecondary }}>Total Order Amount</span>
              <span style={{ fontSize: "18px", fontWeight: 900, color: t.textPrimary }}>{formatPrice(totalPrice, currency)}</span>
            </div>

            {/* WhatsApp Checkout Button */}
            <button
              onClick={handleCheckoutWhatsApp}
              style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "14px", borderRadius: "12px", background: "#25d366", color: "#fff", fontWeight: 800, fontSize: "15px", border: "none", cursor: "pointer", boxShadow: "0 4px 16px #25d36640" }}
            >
              <WhatsAppIcon /> Order on WhatsApp ({totalQuantity})
            </button>
          </div>
        )}
      </div>
    </>
  );
}

/* ── Side menu drawer ───────────────────────────────────── */
function SideMenu({ open, onClose, store, categories, activeCategory, onCategoryChange, theme, search, onSearchChange, slug }) {
  const t = theme;
  if (!open) return null;
  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 200, backdropFilter: "blur(2px)" }} />
      {/* Drawer */}
      <div style={{ position: "fixed", top: 0, left: 0, bottom: 0, width: "280px", maxWidth: "85vw", background: t.navBg, zIndex: 201, display: "flex", flexDirection: "column", boxShadow: "4px 0 40px rgba(0,0,0,0.25)", overflowY: "auto" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 20px 16px", borderBottom: `1px solid ${t.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {store.logoUrl ? (
              <img src={store.logoUrl} alt={store.businessName} style={{ width: "36px", height: "36px", borderRadius: "8px", objectFit: "cover" }} />
            ) : (
              <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: t.accent, display: "flex", alignItems: "center", justifyContent: "center", color: t.accentText, fontWeight: 900, fontSize: "16px", flexShrink: 0 }}>
                {store.businessName?.charAt(0)?.toUpperCase()}
              </div>
            )}
            <p style={{ margin: 0, fontSize: "15px", fontWeight: 800, color: t.textPrimary }}>{store.businessName}</p>
          </div>
          <button onClick={onClose} style={{ width: "32px", height: "32px", borderRadius: "8px", background: "transparent", border: `1px solid ${t.border}`, color: t.textSecondary, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><XIcon /></button>
        </div>

        {/* Search */}
        <div style={{ padding: "14px 16px", borderBottom: `1px solid ${t.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", background: t.bg, borderRadius: "10px", padding: "9px 12px", border: `1px solid ${t.border}` }}>
            <span style={{ color: t.textSecondary, flexShrink: 0 }}><SearchIcon /></span>
            <input value={search} onChange={e => onSearchChange(e.target.value)} placeholder="Search products…" style={{ flex: 1, background: "none", border: "none", outline: "none", fontSize: "13px", color: t.textPrimary, fontFamily: "inherit" }} />
          </div>
        </div>

        {/* Categories */}
        {categories.length > 0 && (
          <div style={{ padding: "14px 16px", borderBottom: `1px solid ${t.border}` }}>
            <p style={{ margin: "0 0 10px", fontSize: "10px", fontWeight: 800, color: t.textSecondary, textTransform: "uppercase", letterSpacing: "0.1em" }}>Categories</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              {["all", ...categories].map(cat => {
                const isActive = activeCategory === cat;
                return (
                  <button key={cat} onClick={() => { onCategoryChange(cat); onClose(); }}
                    style={{ padding: "9px 12px", borderRadius: "8px", border: "none", background: isActive ? t.accent : "transparent", color: isActive ? t.accentText : t.textPrimary, fontSize: "14px", fontWeight: isActive ? 700 : 500, cursor: "pointer", textAlign: "left", transition: "background 0.12s" }}>
                    {cat === "all" ? "All Products" : cat}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Store info */}
        <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: "10px" }}>
          {store.workingHours && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: t.textSecondary }}>
              <ClockIcon />{store.workingHours}
            </div>
          )}
          {store.liveLocation && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: t.textSecondary }}>
              <MapPinIcon />{store.liveLocation}
            </div>
          )}
        </div>

        {/* WhatsApp CTA */}
        {store.whatsappHref && (
          <div style={{ padding: "0 16px 20px", marginTop: "auto" }}>
            <a href={store.whatsappHref} onClick={(e) => handleWhatsAppRedirect(e, store.whatsappHref)} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "12px", borderRadius: "12px", background: "#25d366", color: "#fff", fontWeight: 800, fontSize: "14px", textDecoration: "none", boxShadow: "0 4px 14px #25d36640" }}>
              <WhatsAppIcon /> Chat with us
            </a>
          </div>
        )}
      </div>
    </>
  );
}

/* ── Product Card ───────────────────────────────────────── */
function ProductCard({ product, store, slug, sessionToken, theme, highlighted, index = 0, cartQuantity = 0, onUpdateQty }) {
  const [imgError, setImgError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hovered, setHovered] = useState(false);
  const t = theme;
  const currency = store.currency || "NGN";
  const displayPrice = product.discountPrice || product.price;
  const hasDiscount = !!(product.discountPrice && product.discountPrice < product.price);
  const productHref = `/store/${slug}/${product.slug || product._id}${sessionToken ? `?session=${sessionToken}` : ""}`;

  return (
    <div style={{ textDecoration: "none", position: "relative" }}>
      <article
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          background: t.card,
          borderRadius: "16px",
          overflow: "hidden",
          border: highlighted ? `2px solid ${t.accent}` : `1px solid ${t.border}`,
          boxShadow: hovered
            ? `0 16px 36px rgba(0,0,0,0.16)`
            : highlighted
            ? `0 0 0 4px ${t.accent}22`
            : "0 2px 8px rgba(0,0,0,0.04)",
          transform: hovered ? "translateY(-4px)" : "none",
          transition: "transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.25s",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          animation: `sf-card-entry 0.45s cubic-bezier(0.16, 1, 0.3, 1) ${Math.min(index * 0.03, 0.3)}s both`,
        }}
      >
        {/* Loading overlay */}
        {loading && (
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 10, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "16px", backdropFilter: "blur(2px)" }}>
            <div style={{ width: "32px", height: "32px", border: "3px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "sf-spin 0.7s linear infinite" }} />
          </div>
        )}

        {/* Quantity Badge on Card Top Right */}
        {cartQuantity > 0 && (
          <div style={{ position: "absolute", top: "10px", right: "10px", zIndex: 5, background: "#25d366", color: "#fff", padding: "2px 8px", borderRadius: "999px", fontSize: "11px", fontWeight: 900, boxShadow: "0 2px 8px rgba(37,211,102,0.4)" }}>
            {cartQuantity} in cart
          </div>
        )}

        {/* Image container */}
        <Link href={productHref} onClick={() => setLoading(true)} style={{ textDecoration: "none", color: "inherit", display: "block" }}>
          <div style={{ position: "relative", paddingTop: "80%", background: t.pageBg, overflow: "hidden" }}>
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
                  transform: hovered ? "scale(1.08)" : "scale(1)",
                  transition: "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
                }}
              />
            ) : (
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: t.textSecondary, opacity: 0.3 }}><PackageIcon /></div>
            )}

            {product.stock === 0 && <div style={{ position: "absolute", top: "10px", left: "10px", background: "rgba(0,0,0,0.75)", color: "#fff", padding: "3px 10px", borderRadius: "6px", fontSize: "10px", fontWeight: 800, letterSpacing: "0.06em" }}>SOLD OUT</div>}
            {highlighted && <div style={{ position: "absolute", top: "10px", left: "10px", background: t.accent, color: t.accentText, padding: "3px 10px", borderRadius: "6px", fontSize: "10px", fontWeight: 800, display: "flex", alignItems: "center", gap: "4px", boxShadow: "0 2px 8px rgba(0,0,0,0.2)" }}>🤖 AI Pick</div>}
            {hasDiscount && !highlighted && product.stock > 0 && cartQuantity === 0 && <div style={{ position: "absolute", top: "10px", right: "10px", background: "#ef4444", color: "#fff", padding: "3px 10px", borderRadius: "6px", fontSize: "10px", fontWeight: 800, boxShadow: "0 2px 8px rgba(239,68,68,0.3)" }}>SALE</div>}
          </div>
        </Link>

        {/* Info */}
        <div style={{ padding: "10px 12px", flex: 1, display: "flex", flexDirection: "column", gap: "4px" }}>
          <Link href={productHref} onClick={() => setLoading(true)} style={{ textDecoration: "none", color: "inherit" }}>
            {product.category && <span style={{ fontSize: "10px", fontWeight: 700, color: t.textSecondary, textTransform: "uppercase", letterSpacing: "0.06em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", display: "block" }}>{product.category}</span>}
            <h3 style={{ margin: 0, fontSize: "13px", fontWeight: 700, color: hovered ? t.accent : t.textPrimary, transition: "color 0.2s", lineHeight: 1.3, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", textOverflow: "ellipsis" }}>{product.name}</h3>
          </Link>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "6px", marginTop: "auto", paddingTop: "8px" }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: "15px", fontWeight: 900, color: t.textPrimary }}>{formatPrice(displayPrice, currency)}</span>
              {hasDiscount && <span style={{ fontSize: "10px", color: t.textSecondary, textDecoration: "line-through" }}>{formatPrice(product.price, currency)}</span>}
            </div>

            {/* Quick Quantity Counter / Add Button */}
            {product.stock !== 0 && (
              <div style={{ zIndex: 2 }} onClick={(e) => { e.stopPropagation(); e.preventDefault(); }}>
                {cartQuantity > 0 ? (
                  <div style={{ display: "flex", alignItems: "center", gap: "4px", background: t.pageBg, border: `1px solid ${t.border}`, borderRadius: "8px", padding: "3px 6px" }}>
                    <button onClick={() => onUpdateQty(product._id, cartQuantity - 1)} style={{ background: "none", border: "none", color: t.textPrimary, cursor: "pointer", display: "flex", alignItems: "center", padding: "2px" }}><MinusIcon /></button>
                    <span style={{ fontSize: "12px", fontWeight: 800, color: t.textPrimary, minWidth: "14px", textAlign: "center" }}>{cartQuantity}</span>
                    <button onClick={() => onUpdateQty(product._id, cartQuantity + 1)} style={{ background: "none", border: "none", color: t.textPrimary, cursor: "pointer", display: "flex", alignItems: "center", padding: "2px" }}><PlusIcon /></button>
                  </div>
                ) : (
                  <button
                    onClick={() => onUpdateQty(product._id, 1)}
                    style={{ padding: "6px 12px", borderRadius: "8px", background: t.accent, color: t.accentText, border: "none", fontSize: "11px", fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", boxShadow: "0 2px 6px rgba(0,0,0,0.1)" }}
                  >
                    <PlusIcon /> Add
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

  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [highlightedProductId, setHighlightedProductId] = useState(referredProductId || null);
  const [loadingPage, setLoadingPage] = useState(false);
  const [isInitialMount, setIsInitialMount] = useState(true);

  // Validate session + resolve referredProductId
  useEffect(() => {
    if (!sessionToken) return;
    fetch(`/api/store/session?token=${encodeURIComponent(sessionToken)}`)
      .then(r => r.json())
      .then(data => { if (data.valid && data.payload?.referredProductId) setHighlightedProductId(data.payload.referredProductId); })
      .catch(() => {});
  }, [sessionToken]);

  // Reset page to 1 when search or category changes
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
    // Skip initial fetch since initial data was SSR-rendered
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
      <div style={{ minHeight: "100vh", background: t.pageBg, fontFamily: "system-ui, -apple-system, sans-serif" }}>

        {/* ── NAVBAR ───────────────────────────────────── */}
        <nav style={{ background: t.navBg, borderBottom: `1px solid ${t.border}`, position: "sticky", top: isPreview ? "41px" : 0, zIndex: 50 }}>
          <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 16px", display: "flex", alignItems: "center", justifyContent: "space-between", height: "60px", gap: "12px" }}>
            {/* Left: hamburger + logo */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <button onClick={() => setMenuOpen(true)} style={{ width: "36px", height: "36px", borderRadius: "8px", border: `1px solid ${t.border}`, background: "transparent", color: t.textPrimary, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <MenuIcon />
              </button>
              <Link href={`/store/${slug}`} style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
                {store.logoUrl ? (
                  <img src={store.logoUrl} alt={store.businessName} style={{ width: "32px", height: "32px", borderRadius: "8px", objectFit: "cover" }} />
                ) : (
                  <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: t.accent, display: "flex", alignItems: "center", justifyContent: "center", color: t.accentText, fontWeight: 900, fontSize: "15px", flexShrink: 0 }}>
                    {store.businessName?.charAt(0)?.toUpperCase()}
                  </div>
                )}
                <span style={{ fontSize: "16px", fontWeight: 800, color: t.textPrimary, letterSpacing: "-0.01em" }}>{store.businessName}</span>
              </Link>
            </div>

            {/* Right: Cart Button & WhatsApp link */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <button
                onClick={() => setCartDrawerOpen(true)}
                style={{ position: "relative", display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px", borderRadius: "10px", background: cartState.totalQuantity > 0 ? t.accent : t.card, border: `1px solid ${t.border}`, color: cartState.totalQuantity > 0 ? t.accentText : t.textPrimary, cursor: "pointer", fontSize: "13px", fontWeight: 700 }}
              >
                <ShoppingBagIcon />
                <span>Cart</span>
                {cartState.totalQuantity > 0 && (
                  <span style={{ background: "#ef4444", color: "#fff", padding: "1px 6px", borderRadius: "999px", fontSize: "10px", fontWeight: 900 }}>
                    {cartState.totalQuantity}
                  </span>
                )}
              </button>
              {store.whatsappHref && (
                <a href={store.whatsappHref} onClick={(e) => handleWhatsAppRedirect(e, store.whatsappHref)} target="_blank" rel="noopener noreferrer"
                  style={{ display: "flex", alignItems: "center", gap: "7px", padding: "9px 16px", borderRadius: "10px", background: "#25d366", color: "#fff", fontWeight: 700, fontSize: "13px", textDecoration: "none", whiteSpace: "nowrap", boxShadow: "0 2px 10px #25d36640" }}>
                  <WhatsAppIcon /> Chat
                </a>
              )}
            </div>
          </div>
        </nav>

        {/* ── PROMO ANNOUNCEMENT BANNER ──────────────── */}
        {store.promoAnnouncement?.enabled && store.promoAnnouncement?.text && (
          <div style={{
            background: "linear-gradient(90deg, #6366f1 0%, #a855f7 50%, #ec4899 100%)",
            color: "#ffffff",
            padding: "10px 16px",
            textAlign: "center",
            fontSize: "13px",
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            boxShadow: "0 2px 10px rgba(99, 102, 241, 0.25)",
          }}>
            <span style={{
              background: "rgba(255, 255, 255, 0.25)",
              color: "#fff",
              padding: "2px 8px",
              borderRadius: "6px",
              fontSize: "10px",
              fontWeight: 900,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              backdropFilter: "blur(4px)",
            }}>
              {store.promoAnnouncement.badgeText || "PROMO"}
            </span>
            <span>{store.promoAnnouncement.text}</span>
          </div>
        )}

        {/* ── SIDE MENU ────────────────────────────────── */}
        <SideMenu open={menuOpen} onClose={() => setMenuOpen(false)} store={store} categories={categoriesList} activeCategory={activeCategory} onCategoryChange={handleCategoryChange} theme={t} search={search} onSearchChange={handleSearchChange} slug={slug} />

        {/* ── MAIN CONTENT ─────────────────────────────── */}
        <main style={{ maxWidth: "1100px", margin: "0 auto", padding: "24px 16px", position: "relative" }}>

          {/* Search bar + category pills */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginBottom: "24px", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", background: t.card, borderRadius: "10px", padding: "9px 14px", border: `1px solid ${t.border}`, flex: "1 1 200px", maxWidth: "380px" }}>
              <span style={{ color: t.textSecondary, flexShrink: 0 }}>
                {loadingPage ? <div style={{ width: "16px", height: "16px", border: `2px solid ${t.border}`, borderTopColor: t.accent, borderRadius: "50%", animation: "sf-spin 0.7s linear infinite" }} /> : <SearchIcon />}
              </span>
              <input value={search} onChange={e => handleSearchChange(e.target.value)} placeholder="Search products…" style={{ flex: 1, background: "none", border: "none", outline: "none", fontSize: "14px", color: t.textPrimary, fontFamily: "inherit" }} />
              {search && <button onClick={() => handleSearchChange("")} style={{ background: "none", border: "none", cursor: "pointer", color: t.textSecondary, fontSize: "18px", lineHeight: 1, padding: 0 }}>×</button>}
            </div>

            {categoriesList.length > 0 && (
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                {["all", ...categoriesList].map(cat => (
                  <button key={cat} onClick={() => handleCategoryChange(cat)}
                    style={{ padding: "7px 14px", borderRadius: "999px", border: "none", background: activeCategory === cat ? t.accent : t.card, color: activeCategory === cat ? t.accentText : t.textSecondary, fontSize: "12px", fontWeight: 600, cursor: "pointer", border: activeCategory === cat ? "none" : `1px solid ${t.border}`, transition: "all 0.12s" }}>
                    {cat === "all" ? `All (${totalProducts})` : cat}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Search results label */}
          {search && <p style={{ fontSize: "13px", color: t.textSecondary, marginBottom: "16px" }}>{productsList.length === 0 ? `No results for "${search}"` : `${totalProducts} result${totalProducts !== 1 ? "s" : ""} for "${search}"`}</p>}

          {/* Loading Indicator */}
          {loadingPage && (
            <div style={{ padding: "12px 0", textAlign: "center", fontSize: "13px", color: t.textSecondary, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
              <div style={{ width: "16px", height: "16px", border: `2px solid ${t.border}`, borderTopColor: t.accent, borderRadius: "50%", animation: "sf-spin 0.7s linear infinite" }} />
              Loading products…
            </div>
          )}

          {/* Product grid */}
          {productsList.length > 0 ? (
            <>
              <div className="sf-product-grid" style={{ opacity: loadingPage ? 0.6 : 1, transition: "opacity 0.15s" }}>
                {productsList.map((product, idx) => (
                  <ProductCard key={product._id} index={idx} product={product} store={store} slug={slug} sessionToken={sessionToken} theme={t} highlighted={product._id === highlightedProductId} />
                ))}
              </div>

              {/* ── PAGINATION CONTROLS ──────────────────────── */}
              {totalPages > 1 && (
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "16px", marginTop: "36px", paddingTop: "24px", borderTop: `1px solid ${t.border}` }}>
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
                        fontSize: "13px",
                        fontWeight: 600,
                      }}
                    >
                      Previous
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        disabled={loadingPage}
                        onClick={() => handlePageChange(page)}
                        style={{
                          minWidth: "36px",
                          height: "36px",
                          padding: "0 8px",
                          borderRadius: "8px",
                          border: page === currentPage ? "none" : `1px solid ${t.border}`,
                          background: page === currentPage ? t.accent : t.card,
                          color: page === currentPage ? t.accentText : t.textPrimary,
                          cursor: "pointer",
                          fontSize: "13px",
                          fontWeight: page === currentPage ? 800 : 600,
                          transition: "all 0.12s",
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
                        fontSize: "13px",
                        fontWeight: 600,
                      }}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div style={{ textAlign: "center", padding: "72px 20px", background: t.card, borderRadius: "20px", border: `1px dashed ${t.border}` }}>
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>📦</div>
              <h3 style={{ fontSize: "18px", fontWeight: 800, color: t.textPrimary, margin: "0 0 8px" }}>{search ? "No products match your search" : "No products yet"}</h3>
              <p style={{ fontSize: "14px", color: t.textSecondary, margin: "0 0 24px" }}>{search ? "Try a different search or browse all categories." : "This store hasn't added any products yet."}</p>
              {search && <button onClick={() => { handleSearchChange(""); handleCategoryChange("all"); }} style={{ padding: "10px 24px", borderRadius: "10px", background: t.accent, color: t.accentText, fontWeight: 700, border: "none", cursor: "pointer", fontSize: "14px" }}>Clear search</button>}
              {!search && store.whatsappHref && <a href={store.whatsappHref} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "10px 24px", borderRadius: "10px", background: "#25d366", color: "#fff", fontWeight: 700, textDecoration: "none", fontSize: "14px" }}><WhatsAppIcon /> Ask about availability</a>}
            </div>
          )}
        </main>

        {/* ── STICKY FLOATING CART BUTTON ────────────────────── */}
        {cartState.totalQuantity > 0 && (
          <button
            onClick={() => setCartDrawerOpen(true)}
            style={{
              position: "fixed",
              bottom: "24px",
              right: "24px",
              zIndex: 90,
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "14px 22px",
              borderRadius: "999px",
              background: "#25d366",
              color: "#fff",
              fontWeight: 800,
              fontSize: "14px",
              border: "none",
              cursor: "pointer",
              boxShadow: "0 8px 30px rgba(37,211,102,0.45)",
              animation: "sf-card-entry 0.3s ease-out",
            }}
          >
            <ShoppingBagIcon />
            <span>View Cart ({cartState.totalQuantity}) • {formatPrice(cartState.totalPrice, store.currency || "NGN")}</span>
          </button>
        )}

        {/* ── PAX26 AD FOOTER ──────────────────────────── */}
        {/* Always shown on all storefronts — Pax26 advertising */}
        <Pax26Footer />

      </div>
      <style>{`
        @keyframes sf-spin { to { transform: rotate(360deg); } }
        @keyframes sf-card-entry {
          0% { opacity: 0; transform: translateY(18px) scale(0.96); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        .sf-product-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
        }
        @media (min-width: 580px) {
          .sf-product-grid {
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 18px;
          }
        }
      `}</style>
    </>
  );
}
