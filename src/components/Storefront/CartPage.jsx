"use client";

/**
 * CartPage.jsx
 *
 * Stage 1 of the new dedicated checkout flow.
 * Shows the cart review with items, subtotal, call button, checkout CTA,
 * and a "Top Products" section below.
 *
 * Stages are managed here and passed down to child stage components:
 *   "cart"     → this file (CartPage)
 *   "delivery" → DeliveryMethodStage (only if both pickup + delivery enabled)
 *   "address"  → AddressStage
 */

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getTheme } from "@/app/lib/store/storeThemes";
import { useCart } from "@/app/lib/store/useCart";
import { formatPrice } from "@/app/lib/currency/currencyHelper";
import DeliveryMethodStage from "./checkout/DeliveryMethodStage";
import AddressStage from "./checkout/AddressStage";

/* ── Icons ──────────────────────────────────────────────────────── */
const BackIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);
const PhoneIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 2.15 9.18 2 2 0 0 1 4.11 7h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 14.91a16 16 0 0 0 6 6"/>
  </svg>
);
const TrashIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
  </svg>
);
const MinusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);
const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);
const CartEmptyIcon = () => (
  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
  </svg>
);

/* ── CSS ─────────────────────────────────────────────────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
  .cp-root { font-family: 'Inter', -apple-system, sans-serif; -webkit-font-smoothing: antialiased; }
  @keyframes cp-in { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
  .cp-in { animation: cp-in 0.3s ease both; }
  .cp-btn { transition: opacity 0.15s ease, transform 0.15s ease; }
  .cp-btn:hover:not(:disabled) { opacity: 0.88; transform: translateY(-1px); }
  .cp-btn:disabled { opacity: 0.45; cursor: not-allowed; }
  .cp-qty-btn { transition: background 0.15s ease; }
  .cp-qty-btn:hover { filter: brightness(0.9); }
  .cp-card { transition: transform 0.18s ease, box-shadow 0.18s ease; }
  .cp-card:hover { transform: translateY(-3px); }
  
  /* Responsive layout */
  .cp-layout {
    display: grid;
    grid-template-columns: 1fr;
    gap: 0;
    min-height: 100vh;
  }
  @media (min-width: 900px) {
    .cp-layout {
      grid-template-columns: minmax(0, 1fr) 380px;
      align-items: start;
      gap: 24px;
      padding: 24px;
    }
  }
  
  .cp-sticky-bar {
    position: sticky;
    top: 0;
    z-index: 10;
  }
  @media (min-width: 900px) {
    .cp-sticky-bar { position: static; }
  }

  .cp-products-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
  @media (min-width: 560px) {
    .cp-products-grid { grid-template-columns: repeat(3, 1fr); }
  }
  @media (min-width: 900px) {
    .cp-products-grid { grid-template-columns: repeat(2, 1fr); }
  }
  @media (min-width: 1100px) {
    .cp-products-grid { grid-template-columns: repeat(3, 1fr); }
  }

  .cp-checkout-bar {
    display: flex;
    gap: 10px;
    align-items: center;
  }
  
  .cp-sidebar-summary {
    display: none;
  }
  @media (min-width: 900px) {
    .cp-sidebar-summary {
      display: block;
      position: sticky;
      top: 24px;
    }
  }
`;

/* ── Helpers ─────────────────────────────────────────────────────── */
const fmtN = (n, currency = "NGN") => formatPrice(n, currency);

/* ── Product mini card ───────────────────────────────────────────── */
function ProductCard({ product, t, slug, currency }) {
  const displayPrice = product.discountPrice || product.price;
  const hasDiscount = product.discountPrice && product.discountPrice < product.price;

  return (
    <a
      href={`/store/${slug}/${product.slug || product._id}`}
      className="cp-card"
      style={{
        background: t.card,
        border: `1px solid ${t.border}`,
        borderRadius: "14px",
        overflow: "hidden",
        textDecoration: "none",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Image */}
      <div style={{ paddingTop: "100%", position: "relative", background: t.pageBg, flexShrink: 0 }}>
        {product.image
          ? <img src={product.image} alt={product.name} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
          : <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", opacity: 0.2 }}>
              <CartEmptyIcon />
            </div>
        }
        {hasDiscount && (
          <div style={{ position: "absolute", top: "8px", right: "8px", background: "#ef4444", color: "#fff", fontSize: "10px", fontWeight: 800, padding: "2px 6px", borderRadius: "6px" }}>
            -{Math.round(((product.price - product.discountPrice) / product.price) * 100)}%
          </div>
        )}
      </div>
      {/* Info */}
      <div style={{ padding: "10px 12px", flex: 1, display: "flex", flexDirection: "column", gap: "4px" }}>
        <p style={{ margin: 0, fontSize: "12px", fontWeight: 600, color: t.textPrimary, overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", lineHeight: 1.4 }}>
          {product.name}
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "auto", paddingTop: "4px" }}>
          <span style={{ fontSize: "13px", fontWeight: 800, color: t.accent }}>{fmtN(displayPrice, currency)}</span>
          {hasDiscount && (
            <span style={{ fontSize: "11px", color: t.textSecondary, textDecoration: "line-through" }}>{fmtN(product.price, currency)}</span>
          )}
        </div>
      </div>
    </a>
  );
}

/* ── Order Summary sidebar (desktop only) ───────────────────────── */
function OrderSummary({ cart, totalPrice, activeDeliveryFee, deliveryModel, t, currency }) {
  const grandTotal = totalPrice + activeDeliveryFee;
  return (
    <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: "20px", padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
      <p style={{ margin: 0, fontSize: "15px", fontWeight: 800, color: t.textPrimary }}>Order Summary</p>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {cart.map(item => (
          <div key={item.cartItemKey} style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
            <span style={{ color: t.textSecondary, flex: 1, marginRight: "8px" }}>{item.name} × {item.quantity}</span>
            <span style={{ color: t.textPrimary, fontWeight: 600, flexShrink: 0 }}>{fmtN(item.price * item.quantity, currency)}</span>
          </div>
        ))}
      </div>
      <div style={{ borderTop: `1px solid ${t.border}`, paddingTop: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
          <span style={{ color: t.textSecondary }}>Subtotal</span>
          <span style={{ color: t.textPrimary, fontWeight: 600 }}>{fmtN(totalPrice, currency)}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
          <span style={{ color: t.textSecondary }}>Delivery</span>
          <span style={{ color: t.textPrimary, fontWeight: 600 }}>
            {deliveryModel === "quote" ? "Quoted on WhatsApp" : activeDeliveryFee > 0 ? fmtN(activeDeliveryFee, currency) : "Free"}
          </span>
        </div>
        <div style={{ borderTop: `1px solid ${t.border}`, paddingTop: "10px", display: "flex", justifyContent: "space-between", fontSize: "15px", fontWeight: 800 }}>
          <span style={{ color: t.textPrimary }}>Total</span>
          <span style={{ color: t.accent }}>{fmtN(grandTotal, currency)}</span>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   MAIN CartPage COMPONENT
══════════════════════════════════════════════════════════════════ */
export default function CartPage({ store, topProducts, slug, sessionToken }) {
  const router = useRouter();
  const t = getTheme(store.storeTheme);
  const { cart, totalPrice, setItemQuantity, removeItem, clear } = useCart(slug);
  const currency = store.currency || "NGN";

  // Checkout stage: "cart" | "delivery" | "address"
  const [stage, setStage] = useState("cart");
  const [checkoutData, setCheckoutData] = useState(null); // carries address + method through stages

  const allowDelivery = store.fulfillmentSettings?.allowDelivery !== false;
  const allowPickup   = store.fulfillmentSettings?.allowPickup === true;
  const deliveryModel = store.fulfillmentSettings?.deliveryModel || "flat";
  const deliveryZones = store.fulfillmentSettings?.deliveryZones || [];
  const flatDeliveryFee = Number(store.fulfillmentSettings?.flatDeliveryFee) || 0;

  // Simple delivery fee estimate for summary (actual fee confirmed in address stage)
  const maxProductFee = cart.length > 0 ? Math.max(0, ...cart.map(i => Number(i.deliveryFee) || 0)) : 0;
  const estimatedFee = deliveryModel === "quote" ? 0 : deliveryModel === "zones" ? 0 : Math.max(flatDeliveryFee, maxProductFee);

  const handleCheckout = () => {
    if (!cart.length) return;
    // If both delivery AND pickup are enabled, show delivery method selection first
    if (allowDelivery && allowPickup) {
      setStage("delivery");
    } else {
      // Single fulfillment type — go straight to address
      setCheckoutData({ fulfillmentMethod: allowDelivery ? "delivery" : "pickup" });
      setStage("address");
    }
  };

  // Stage: delivery method selected
  const handleDeliveryMethodSelected = (method) => {
    setCheckoutData(prev => ({ ...prev, fulfillmentMethod: method }));
    setStage("address");
  };

  // Stage: address confirmed → submit order
  const handleAddressConfirmed = (addressData) => {
    setCheckoutData(prev => ({ ...prev, ...addressData }));
    // Submission happens inside AddressStage itself after this
  };

  // Back navigation per stage
  const handleBack = () => {
    if (stage === "delivery") setStage("cart");
    else if (stage === "address") setStage(allowDelivery && allowPickup ? "delivery" : "cart");
    else router.push(`/store/${slug}`);
  };

  // ── Stage: Delivery Method ──────────────────────────────────────
  if (stage === "delivery") {
    return (
      <DeliveryMethodStage
        store={store}
        t={t}
        slug={slug}
        onBack={handleBack}
        onSelect={handleDeliveryMethodSelected}
      />
    );
  }

  // ── Stage: Address ─────────────────────────────────────────────
  if (stage === "address") {
    return (
      <AddressStage
        store={store}
        t={t}
        slug={slug}
        sessionToken={sessionToken}
        cart={cart}
        totalPrice={totalPrice}
        fulfillmentMethod={checkoutData?.fulfillmentMethod || "delivery"}
        onBack={handleBack}
        onSuccess={clear}
      />
    );
  }

  // ── Stage: Cart Review ─────────────────────────────────────────
  const canCheckout = cart.length > 0;
  const grandTotal  = totalPrice + estimatedFee;
  const showCallBtn = store.callNumberEnabled && store.callNumber;

  return (
    <>
      <style>{CSS}</style>
      <div className="cp-root cp-in" style={{ background: t.pageBg, minHeight: "100vh" }}>

        {/* ── Sticky header ──────────────────────────────────────── */}
        <div className="cp-sticky-bar" style={{ background: t.navBg, borderBottom: `1px solid ${t.border}`, padding: "0 16px" }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", alignItems: "center", height: "56px", gap: "12px" }}>
            <button
              onClick={handleBack}
              className="cp-btn"
              style={{ background: "none", border: "none", cursor: "pointer", color: t.textPrimary, display: "flex", alignItems: "center", padding: "8px 4px 8px 0" }}
            >
              <BackIcon />
            </button>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontSize: "17px", fontWeight: 800, color: t.textPrimary, lineHeight: 1.2 }}>Cart</p>
              <p style={{ margin: 0, fontSize: "11px", color: t.textSecondary }}>{cart.length} {cart.length === 1 ? "item" : "items"}</p>
            </div>
            {/* Store name on large screens */}
            <p style={{ margin: 0, fontSize: "13px", fontWeight: 600, color: t.textSecondary, display: "none" }} className="desktop-only">
              {store.businessName}
            </p>
          </div>
        </div>

        {/* ── Page body ──────────────────────────────────────────── */}
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div className="cp-layout">

            {/* ── LEFT / MAIN: cart items ──────────────────────── */}
            <div style={{ padding: "0 0 120px" }}>

              {cart.length === 0 ? (
                <div style={{ textAlign: "center", padding: "80px 24px", color: t.textSecondary }}>
                  <div style={{ opacity: 0.25, marginBottom: "16px", display: "flex", justifyContent: "center" }}>
                    <CartEmptyIcon />
                  </div>
                  <p style={{ margin: "0 0 8px", fontSize: "18px", fontWeight: 800, color: t.textPrimary }}>Your cart is empty</p>
                  <p style={{ margin: "0 0 28px", fontSize: "13px", lineHeight: 1.6 }}>Browse the store and add items you love</p>
                  <a
                    href={`/store/${slug}`}
                    style={{ display: "inline-block", padding: "12px 28px", borderRadius: "12px", background: t.accent, color: t.accentText, fontWeight: 800, fontSize: "14px", textDecoration: "none" }}
                  >
                    Continue Shopping
                  </a>
                </div>
              ) : (
                <>
                  {/* Cart items */}
                  <div style={{ padding: "16px" }}>
                    <p style={{ margin: "0 0 12px", fontSize: "12px", fontWeight: 700, color: t.textSecondary, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                      Cart ({cart.length})
                    </p>
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                      {cart.map((item) => (
                        <div key={item.cartItemKey} style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: "16px", padding: "14px", display: "flex", alignItems: "flex-start", gap: "12px" }}>
                          {/* Image */}
                          <div style={{ width: "80px", height: "80px", flexShrink: 0, borderRadius: "10px", overflow: "hidden", background: t.pageBg }}>
                            {item.imageUrl
                              ? <img src={item.imageUrl} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                              : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", opacity: 0.2 }}><CartEmptyIcon /></div>
                            }
                          </div>

                          {/* Details */}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ margin: "0 0 4px", fontSize: "14px", fontWeight: 700, color: t.textPrimary, lineHeight: 1.35, overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                              {item.name}
                            </p>
                            {/* Variants */}
                            {item.selectedVariants?.length > 0 && (
                              <p style={{ margin: "0 0 6px", fontSize: "11px", color: t.textSecondary }}>
                                {item.selectedVariants.map(v => `${v.label}: ${v.value}`).join(" · ")}
                              </p>
                            )}
                            <p style={{ margin: "0 0 10px", fontSize: "15px", fontWeight: 900, color: t.accent }}>
                              {fmtN(item.price * item.quantity, currency)}
                            </p>
                            {/* Controls row */}
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                              <button
                                onClick={() => removeItem(item.cartItemKey)}
                                className="cp-btn"
                                style={{ background: "none", border: "none", cursor: "pointer", color: t.accent, fontSize: "12px", fontWeight: 700, display: "flex", alignItems: "center", gap: "4px", padding: 0 }}
                              >
                                <TrashIcon /> Remove
                              </button>
                              {/* Qty controls */}
                              <div style={{ display: "flex", alignItems: "center", gap: "2px", background: t.pageBg, borderRadius: "10px", padding: "3px", border: `1px solid ${t.border}` }}>
                                <button
                                  onClick={() => setItemQuantity(item.cartItemKey, item.quantity - 1)}
                                  className="cp-qty-btn cp-btn"
                                  style={{ width: "32px", height: "32px", borderRadius: "8px", border: "none", background: t.card, color: t.textPrimary, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}
                                >
                                  <MinusIcon />
                                </button>
                                <span style={{ minWidth: "32px", textAlign: "center", fontSize: "14px", fontWeight: 800, color: t.textPrimary }}>
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => setItemQuantity(item.cartItemKey, item.quantity + 1)}
                                  className="cp-qty-btn cp-btn"
                                  style={{ width: "32px", height: "32px", borderRadius: "8px", border: "none", background: t.accent, color: t.accentText, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                                >
                                  <PlusIcon />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Top products section */}
                  {topProducts?.length > 0 && (
                    <div style={{ padding: "24px 16px 16px" }}>
                      <p style={{ margin: "0 0 14px", fontSize: "14px", fontWeight: 800, color: t.textPrimary }}>
                        Customers also love
                      </p>
                      <div className="cp-products-grid">
                        {topProducts.slice(0, 6).map(p => (
                          <ProductCard key={p._id} product={p} t={t} slug={slug} currency={currency} />
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* ── RIGHT / SIDEBAR (desktop): Order Summary ─────── */}
            <div className="cp-sidebar-summary" style={{ padding: "16px 16px 16px 0" }}>
              <OrderSummary
                cart={cart}
                totalPrice={totalPrice}
                activeDeliveryFee={estimatedFee}
                deliveryModel={deliveryModel}
                t={t}
                currency={currency}
              />
              {/* Desktop checkout button */}
              <div style={{ marginTop: "14px", display: "flex", gap: "10px" }}>
                {showCallBtn && (
                  <a
                    href={`tel:${store.callNumber}`}
                    style={{ width: "52px", height: "52px", flexShrink: 0, borderRadius: "14px", background: `${t.accent}14`, border: `1px solid ${t.border}`, display: "flex", alignItems: "center", justifyContent: "center", color: t.accent, textDecoration: "none" }}
                    title={`Call ${store.businessName}`}
                  >
                    <PhoneIcon />
                  </a>
                )}
                <button
                  onClick={handleCheckout}
                  disabled={!canCheckout}
                  className="cp-btn"
                  style={{ flex: 1, height: "52px", borderRadius: "14px", border: "none", background: canCheckout ? "#25d366" : t.border, color: canCheckout ? "#fff" : t.textSecondary, fontWeight: 800, fontSize: "15px", cursor: canCheckout ? "pointer" : "not-allowed", boxShadow: canCheckout ? "0 6px 20px rgba(37,211,102,0.35)" : "none" }}
                >
                  Checkout
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* ── Sticky bottom checkout bar (mobile) ─────────────────── */}
        {cart.length > 0 && (
          <div style={{
            position: "fixed", bottom: 0, left: 0, right: 0,
            background: t.navBg,
            borderTop: `1px solid ${t.border}`,
            padding: "12px 16px max(12px, env(safe-area-inset-bottom, 12px))",
            zIndex: 50,
          }}>
            <div style={{ maxWidth: "600px", margin: "0 auto" }}>
              <div className="cp-checkout-bar">
                {showCallBtn && (
                  <a
                    href={`tel:${store.callNumber}`}
                    style={{ width: "52px", height: "52px", flexShrink: 0, borderRadius: "14px", background: `${t.accent}14`, border: `1px solid ${t.border}`, display: "flex", alignItems: "center", justifyContent: "center", color: t.accent, textDecoration: "none" }}
                    title={`Call ${store.businessName}`}
                  >
                    <PhoneIcon />
                  </a>
                )}
                <button
                  onClick={handleCheckout}
                  disabled={!canCheckout}
                  className="cp-btn"
                  style={{ flex: 1, height: "52px", borderRadius: "14px", border: "none", background: canCheckout ? "#25d366" : t.border, color: canCheckout ? "#fff" : t.textSecondary, fontWeight: 800, fontSize: "15px", cursor: canCheckout ? "pointer" : "not-allowed", boxShadow: canCheckout ? "0 6px 20px rgba(37,211,102,0.35)" : "none", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}
                >
                  <span>Checkout</span>
                  <span style={{ opacity: 0.8, fontSize: "13px", fontWeight: 700 }}>
                    {fmtN(grandTotal, currency)}
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </>
  );
}
