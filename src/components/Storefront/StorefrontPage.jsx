"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { formatPrice } from "@/app/lib/currency/currencyHelper";
import { getTheme } from "@/app/lib/store/storeThemes";

/* ── Icons ───────────────────────────────────────────────── */
const SearchIcon = ({ size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);
const WhatsAppIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);
const XIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const CartIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
  </svg>
);
const ClockIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);
const MapPinIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
  </svg>
);
const PackageIcon = () => (
  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/>
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
    <polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
  </svg>
);
const EditIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);
const ZapIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
);
const TrashIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
    <path d="M10 11v6"/><path d="M14 11v6"/>
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
  </svg>
);

/* ── Owner preview banner ────────────────────────────────── */
function OwnerBanner() {
  return (
    <div style={{
      position: "sticky", top: 0, zIndex: 100,
      background: "#111", color: "#fff",
      padding: "7px 20px",
      display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px",
      fontSize: "12px",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span style={{ background: "#22c55e", borderRadius: "3px", padding: "2px 7px", fontSize: "9px", fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase" }}>
          Preview
        </span>
        <span style={{ opacity: 0.6 }}>Customers see exactly this</span>
      </div>
      <a href="/dashboard/automations/ai-business-dashboard"
        style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: "5px 12px", borderRadius: "6px", background: "#fff", color: "#111", textDecoration: "none", fontSize: "11px", fontWeight: 700 }}>
        <EditIcon /> Edit Store
      </a>
    </div>
  );
}

/* ── Store Hero Strip ────────────────────────────────────── */
function StoreHeroStrip({ store, theme: t }) {
  const hasMeta = store.workingHours || store.liveLocation;
  return (
    <div style={{ background: t.navBg, borderBottom: `1px solid ${t.border}`, padding: "16px" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "14px", flexWrap: "wrap" }}>
        {/* Identity */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0 }}>
          {store.logoUrl ? (
            <img src={store.logoUrl} alt={store.businessName}
              style={{ width: "46px", height: "46px", borderRadius: "10px", objectFit: "cover", flexShrink: 0 }} />
          ) : (
            <div style={{
              width: "46px", height: "46px", borderRadius: "10px",
              background: t.accent, color: t.accentText,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 900, fontSize: "20px", flexShrink: 0, letterSpacing: "-0.02em",
            }}>
              {store.businessName?.charAt(0)?.toUpperCase()}
            </div>
          )}
          <div style={{ minWidth: 0 }}>
            <h1 style={{
              margin: 0, fontSize: "18px", fontWeight: 900,
              color: t.textPrimary, letterSpacing: "-0.02em",
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
            }}>
              {store.businessName}
            </h1>
            {hasMeta && (
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "4px", flexWrap: "wrap" }}>
                {store.workingHours && (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "11px", color: t.textSecondary }}>
                    <ClockIcon />{store.workingHours}
                  </span>
                )}
                {store.liveLocation && (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "11px", color: t.textSecondary }}>
                    <MapPinIcon />{store.liveLocation}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* WhatsApp CTA */}
        {store.whatsappHref && (
          <a href={store.whatsappHref} target="_blank" rel="noopener noreferrer"
            style={{
              display: "inline-flex", alignItems: "center", gap: "7px",
              padding: "10px 18px", borderRadius: "8px",
              background: "#25d366", color: "#fff",
              fontWeight: 700, fontSize: "13px", textDecoration: "none",
              flexShrink: 0, whiteSpace: "nowrap",
            }}>
            <WhatsAppIcon size={15} /> Chat with us
          </a>
        )}
      </div>
    </div>
  );
}

/* ── Category Bar (sticky horizontal pills) ──────────────── */
function CategoryBar({ categories, active, onChange, topOffset, theme: t }) {
  return (
    <div style={{
      position: "sticky", top: `${topOffset}px`, zIndex: 40,
      background: t.pageBg, borderBottom: `1px solid ${t.border}`,
      overflowX: "auto", scrollbarWidth: "none",
    }}>
      <div style={{
        display: "flex", gap: "6px", padding: "10px 14px",
        maxWidth: "1100px", margin: "0 auto", whiteSpace: "nowrap",
      }}>
        {["all", ...categories].map(cat => {
          const active_ = active === cat;
          return (
            <button key={cat} onClick={() => onChange(cat)} style={{
              padding: "6px 15px", borderRadius: "999px", cursor: "pointer",
              border: active_ ? "none" : `1px solid ${t.border}`,
              background: active_ ? t.accent : "transparent",
              color: active_ ? t.accentText : t.textSecondary,
              fontSize: "12px", fontWeight: active_ ? 700 : 500,
              transition: "all 0.12s", whiteSpace: "nowrap", flexShrink: 0,
              fontFamily: "inherit",
            }}>
              {cat === "all" ? "All" : cat}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── Product Card ─────────────────────────────────────────── */
function ProductCard({ product, store, slug, sessionToken, theme: t, highlighted, cartQuantity, onAddToCart, onUpdateQty }) {
  const [imgError, setImgError] = useState(false);
  const [navLoading, setNavLoading] = useState(false);
  const currency = store.currency || "NGN";
  const displayPrice = product.discountPrice || product.price;
  const hasDiscount = !!(product.discountPrice && product.discountPrice < product.price);
  const outOfStock = product.stock === 0;
  const productHref = `/store/${slug}/${product.slug || product._id}${sessionToken ? `?session=${sessionToken}` : ""}`;
  const discountPct = hasDiscount ? Math.round((1 - product.discountPrice / product.price) * 100) : 0;

  return (
    <article style={{
      background: t.card,
      borderRadius: "12px",
      overflow: "hidden",
      border: cartQuantity > 0 ? `1.5px solid #22c55e` : highlighted ? `1.5px solid ${t.accent}` : `1px solid ${t.border}`,
      display: "flex", flexDirection: "column",
      position: "relative",
    }}>
      {/* Image region */}
      <Link href={productHref} style={{ display: "block", textDecoration: "none", position: "relative" }} onClick={() => setNavLoading(true)}>
        <div style={{ paddingTop: "75%", position: "relative", background: t.pageBg, overflow: "hidden" }}>

          {/* Loading spinner overlay */}
          {navLoading && (
            <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.38)", zIndex: 5, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: "22px", height: "22px", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "sf-spin 0.7s linear infinite" }} />
            </div>
          )}

          {/* Product image */}
          {product.images?.[0]?.url && !imgError ? (
            <img
              src={product.images[0].url}
              alt={product.name}
              onError={() => setImgError(true)}
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: t.textSecondary, opacity: 0.2 }}>
              <PackageIcon />
            </div>
          )}

          {/* Top-left badge stack */}
          <div style={{ position: "absolute", top: "8px", left: "8px", display: "flex", flexDirection: "column", gap: "4px", zIndex: 3 }}>
            {outOfStock && (
              <span style={{ background: "rgba(0,0,0,0.78)", color: "#fff", fontSize: "8px", fontWeight: 800, letterSpacing: "0.08em", padding: "2px 7px", borderRadius: "4px" }}>
                SOLD OUT
              </span>
            )}
            {highlighted && !outOfStock && (
              <span style={{ background: t.accent, color: t.accentText, fontSize: "8px", fontWeight: 800, letterSpacing: "0.06em", padding: "2px 7px", borderRadius: "4px" }}>
                ✦ AI PICK
              </span>
            )}
            {hasDiscount && !outOfStock && !highlighted && (
              <span style={{ background: "#ef4444", color: "#fff", fontSize: "8px", fontWeight: 800, padding: "2px 7px", borderRadius: "4px" }}>
                -{discountPct}%
              </span>
            )}
          </div>

          {/* Cart quantity badge — top right */}
          {cartQuantity > 0 && (
            <div style={{
              position: "absolute", top: "8px", right: "8px", zIndex: 3,
              background: "#22c55e", color: "#fff",
              fontSize: "8px", fontWeight: 800, letterSpacing: "0.04em",
              padding: "2px 8px", borderRadius: "4px",
            }}>
              {cartQuantity} IN CART
            </div>
          )}
        </div>
      </Link>

      {/* Text info */}
      <div style={{ padding: "10px 11px 0" }}>
        {product.category && (
          <p style={{ margin: "0 0 2px", fontSize: "9px", fontWeight: 700, color: t.textSecondary, textTransform: "uppercase", letterSpacing: "0.08em" }}>
            {product.category}
          </p>
        )}
        <Link href={productHref} style={{ textDecoration: "none" }} onClick={() => setNavLoading(true)}>
          <p style={{
            margin: 0, fontSize: "13px", fontWeight: 700, color: t.textPrimary,
            lineHeight: 1.35,
            display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
          }}>
            {product.name}
          </p>
        </Link>
        <div style={{ display: "flex", alignItems: "baseline", gap: "6px", marginTop: "5px" }}>
          <span style={{ fontSize: "15px", fontWeight: 900, color: t.textPrimary }}>{formatPrice(displayPrice, currency)}</span>
          {hasDiscount && (
            <span style={{ fontSize: "11px", color: t.textSecondary, textDecoration: "line-through" }}>{formatPrice(product.price, currency)}</span>
          )}
        </div>
      </div>

      {/* Cart action area */}
      <div style={{ padding: "9px 11px 11px", marginTop: "auto" }}>
        {cartQuantity > 0 ? (
          <div style={{ display: "flex", alignItems: "center", border: `1.5px solid #22c55e`, borderRadius: "7px", overflow: "hidden" }}>
            <button
              onClick={e => { e.stopPropagation(); e.preventDefault(); onUpdateQty(product._id, cartQuantity - 1); }}
              style={{ flex: "0 0 34px", height: "32px", background: "transparent", border: "none", color: "#22c55e", fontWeight: 900, fontSize: "17px", cursor: "pointer", fontFamily: "inherit" }}>
              −
            </button>
            <span style={{ flex: 1, textAlign: "center", fontSize: "12px", fontWeight: 800, color: "#22c55e" }}>{cartQuantity}</span>
            <button
              onClick={e => { e.stopPropagation(); e.preventDefault(); onAddToCart(product); }}
              style={{ flex: "0 0 34px", height: "32px", background: "#22c55e", border: "none", color: "#fff", fontWeight: 900, fontSize: "17px", cursor: "pointer", fontFamily: "inherit" }}>
              +
            </button>
          </div>
        ) : (
          <button
            onClick={() => !outOfStock && onAddToCart(product)}
            disabled={outOfStock}
            style={{
              width: "100%", height: "33px", borderRadius: "7px",
              border: outOfStock ? `1px solid ${t.border}` : `1px solid ${t.accent}`,
              background: outOfStock ? "transparent" : t.accent,
              color: outOfStock ? t.textSecondary : t.accentText,
              fontWeight: 700, fontSize: "12px",
              cursor: outOfStock ? "not-allowed" : "pointer",
              opacity: outOfStock ? 0.55 : 1,
              fontFamily: "inherit",
            }}>
            {outOfStock ? "Out of Stock" : "Add to Cart"}
          </button>
        )}
      </div>
    </article>
  );
}

/* ── Cart FAB (floating action button — mobile) ───────────── */
function CartFAB({ itemCount, total, currency, onClick, theme: t }) {
  if (itemCount === 0) return null;
  return (
    <button
      className="sf-cart-fab"
      onClick={onClick}
      style={{
        position: "fixed", bottom: "20px", right: "14px", zIndex: 90,
        display: "flex", alignItems: "center", gap: "10px",
        padding: "11px 16px", borderRadius: "14px",
        background: t.accent, color: t.accentText,
        border: "none", cursor: "pointer",
        boxShadow: "0 4px 24px rgba(0,0,0,0.25)",
        fontFamily: "inherit",
      }}>
      <div style={{ position: "relative" }}>
        <CartIcon size={19} />
        <span style={{
          position: "absolute", top: "-7px", right: "-8px",
          background: "#ef4444", color: "#fff",
          borderRadius: "999px", fontSize: "9px", fontWeight: 800,
          padding: "1px 5px", minWidth: "15px", textAlign: "center",
        }}>
          {itemCount}
        </span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "1px" }}>
        <span style={{ fontSize: "10px", opacity: 0.75, fontWeight: 500 }}>{itemCount} item{itemCount !== 1 ? "s" : ""}</span>
        <span style={{ fontSize: "14px", fontWeight: 900 }}>{formatPrice(total, currency)}</span>
      </div>
    </button>
  );
}

/* ── Cart Drawer ──────────────────────────────────────────── */
function CartDrawer({ open, onClose, cart, onUpdateQty, onRemove, onClearCart, store, theme: t }) {
  if (!open) return null;

  const validCart = (cart || []).filter(i => i?.product?._id);
  const currency = store.currency || "NGN";
  const subtotal = validCart.reduce((s, i) => s + ((i.product?.discountPrice || i.product?.price || 0) * (i.quantity || 1)), 0);
  const baseDelivery = store.defaultDeliveryFee || 0;
  const extraDelivery = validCart.reduce((s, i) => s + ((i.product?.extraShippingFee || 0) * (i.quantity || 1)), 0);
  const totalDelivery = validCart.length > 0 ? baseDelivery + extraDelivery : 0;
  const grandTotal = subtotal + totalDelivery;
  const totalItems = validCart.reduce((a, b) => a + (b.quantity || 1), 0);

  const handleWhatsAppCheckout = () => {
    if (!validCart.length || !store.whatsappHref) return;
    const itemsText = validCart.map(i => {
      const itemTotal = (i.product.discountPrice || i.product.price || 0) * (i.quantity || 1);
      return `• ${i.quantity || 1}x *${i.product.name}* (${formatPrice(itemTotal, currency)})`;
    }).join("\n");

    let msg = `Hi! I'd like to order from *${store.businessName}*:\n\n${itemsText}\n\n*Subtotal:* ${formatPrice(subtotal, currency)}`;
    if (totalDelivery > 0) msg += `\n*Estimated Delivery:* ${formatPrice(totalDelivery, currency)}`;
    msg += `\n*Grand Total:* ${formatPrice(grandTotal, currency)}\n\nPlease confirm my order and share payment details.`;

    const waNum = store.whatsappHref.replace(/.*wa\.me\//, "");
    window.open(`https://wa.me/${waNum}?text=${encodeURIComponent(msg)}`, "_blank");
    if (onClearCart) onClearCart();
    onClose();
  };

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 200, backdropFilter: "blur(3px)" }} />
      <div style={{
        position: "fixed", top: 0, right: 0, bottom: 0,
        width: "390px", maxWidth: "95vw",
        background: t.navBg, zIndex: 201,
        display: "flex", flexDirection: "column",
        boxShadow: "-8px 0 48px rgba(0,0,0,0.2)",
      }}>
        {/* Header */}
        <div style={{ padding: "18px 20px", borderBottom: `1px solid ${t.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <p style={{ margin: 0, fontSize: "16px", fontWeight: 800, color: t.textPrimary }}>Your Cart</p>
            <p style={{ margin: 0, fontSize: "11px", color: t.textSecondary, marginTop: "1px" }}>
              {totalItems} item{totalItems !== 1 ? "s" : ""}
            </p>
          </div>
          <button onClick={onClose} style={{
            width: "32px", height: "32px", borderRadius: "7px",
            background: "transparent", border: `1px solid ${t.border}`,
            color: t.textSecondary, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <XIcon />
          </button>
        </div>

        {/* Items */}
        <div style={{ flex: 1, overflowY: "auto", padding: "14px 16px", display: "flex", flexDirection: "column", gap: "10px" }}>
          {validCart.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 0", color: t.textSecondary }}>
              <div style={{ opacity: 0.25, marginBottom: "12px" }}><CartIcon size={36} /></div>
              <p style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: t.textPrimary }}>Nothing here yet</p>
              <p style={{ margin: "5px 0 0", fontSize: "12px" }}>Browse and add products from the store</p>
            </div>
          ) : validCart.map(item => {
            const price = item.product.discountPrice || item.product.price || 0;
            return (
              <div key={item.product._id} style={{
                display: "flex", gap: "10px",
                padding: "12px", background: t.card,
                borderRadius: "10px", border: `1px solid ${t.border}`,
                alignItems: "flex-start",
              }}>
                {item.product.images?.[0]?.url ? (
                  <img src={item.product.images[0].url} alt={item.product.name}
                    style={{ width: "52px", height: "52px", borderRadius: "8px", objectFit: "cover", flexShrink: 0 }} />
                ) : (
                  <div style={{ width: "52px", height: "52px", borderRadius: "8px", background: t.pageBg, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ opacity: 0.25 }}><PackageIcon /></span>
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: "0 0 3px", fontSize: "13px", fontWeight: 700, color: t.textPrimary, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {item.product.name}
                  </p>
                  <p style={{ margin: "0 0 9px", fontSize: "13px", fontWeight: 900, color: t.accent }}>
                    {formatPrice(price * (item.quantity || 1), currency)}
                  </p>
                  <div style={{ display: "flex", alignItems: "center", border: `1px solid ${t.border}`, borderRadius: "6px", overflow: "hidden", width: "fit-content" }}>
                    <button onClick={() => onUpdateQty(item.product._id, (item.quantity || 1) - 1)}
                      style={{ width: "28px", height: "26px", background: "transparent", border: "none", color: t.textPrimary, cursor: "pointer", fontWeight: 800, fontSize: "14px", fontFamily: "inherit" }}>
                      −
                    </button>
                    <span style={{
                      padding: "0 10px", fontSize: "12px", fontWeight: 700, color: t.textPrimary,
                      borderLeft: `1px solid ${t.border}`, borderRight: `1px solid ${t.border}`,
                      height: "26px", display: "flex", alignItems: "center",
                    }}>
                      {item.quantity || 1}
                    </span>
                    <button onClick={() => onUpdateQty(item.product._id, (item.quantity || 1) + 1)}
                      style={{ width: "28px", height: "26px", background: "transparent", border: "none", color: t.textPrimary, cursor: "pointer", fontWeight: 800, fontSize: "14px", fontFamily: "inherit" }}>
                      +
                    </button>
                  </div>
                </div>
                <button onClick={() => onRemove(item.product._id)}
                  style={{ background: "none", border: "none", color: t.textSecondary, cursor: "pointer", padding: "2px", opacity: 0.55, flexShrink: 0, display: "flex", alignItems: "center" }}>
                  <TrashIcon />
                </button>
              </div>
            );
          })}
        </div>

        {/* Summary + checkout */}
        {validCart.length > 0 && (
          <div style={{ padding: "16px 20px 20px", borderTop: `1px solid ${t.border}`, display: "flex", flexDirection: "column", gap: "8px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
              <span style={{ color: t.textSecondary }}>Subtotal</span>
              <span style={{ fontWeight: 700, color: t.textPrimary }}>{formatPrice(subtotal, currency)}</span>
            </div>
            {totalDelivery > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                <span style={{ color: t.textSecondary }}>Est. Delivery</span>
                <span style={{ fontWeight: 700, color: t.textPrimary }}>{formatPrice(totalDelivery, currency)}</span>
              </div>
            )}
            <div style={{
              display: "flex", justifyContent: "space-between",
              fontSize: "15px", fontWeight: 900, color: t.textPrimary,
              paddingTop: "9px", borderTop: `1px solid ${t.border}`,
            }}>
              <span>Total</span>
              <span>{formatPrice(grandTotal, currency)}</span>
            </div>
            <button onClick={handleWhatsAppCheckout} style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
              width: "100%", padding: "13px",
              borderRadius: "10px", background: "#25d366", color: "#fff",
              fontWeight: 800, fontSize: "14px", border: "none", cursor: "pointer",
              marginTop: "4px", fontFamily: "inherit",
            }}>
              <WhatsAppIcon size={16} /> Order via WhatsApp
            </button>
          </div>
        )}
      </div>
    </>
  );
}

/* ── Pax26 Footer ─────────────────────────────────────────── */
function Pax26Footer({ theme: t }) {
  return (
    <div style={{ background: t.footerBg || "#111", borderTop: `1px solid ${t.border}`, padding: "18px 16px" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
          <div style={{ width: "26px", height: "26px", borderRadius: "6px", background: "#6366f1", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", flexShrink: 0 }}>
            <ZapIcon />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: "12px", fontWeight: 700, color: t.footerText || "#fff" }}>
              Powered by <span style={{ color: "#818cf8" }}>Pax26</span>
            </p>
            <p style={{ margin: 0, fontSize: "10px", color: t.footerText ? `${t.footerText}88` : "#555" }}>
              AI-powered WhatsApp selling
            </p>
          </div>
        </div>
        <a href="https://pax26.com" target="_blank" rel="noopener noreferrer"
          style={{ padding: "7px 16px", borderRadius: "7px", background: "#6366f1", color: "#fff", fontWeight: 700, fontSize: "12px", textDecoration: "none" }}>
          Get your free store →
        </a>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   MAIN: StorefrontPage
══════════════════════════════════════════════════════════ */
export default function StorefrontPage({ store, products, slug, isPreview, sessionToken, referredProductId }) {
  const theme = getTheme(store.storeTheme);
  const t = theme;
  const storageKey = `pax26_cart_${store?.slug || slug}`;
  const currency = store.currency || "NGN";

  /* ── State ─────────────────────────────────────────────── */
  const [search, setSearch] = useState("");
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");
  const [cartOpen, setCartOpen] = useState(false);
  const [cart, setCart] = useState([]);
  const [cartLoaded, setCartLoaded] = useState(false);
  const [highlightedProductId, setHighlightedProductId] = useState(referredProductId || null);
  const [searchResults, setSearchResults] = useState(null);
  const [searching, setSearching] = useState(false);
  const mobileSearchRef = useRef(null);

  /* ── Cart persistence ──────────────────────────────────── */
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) setCart(JSON.parse(saved));
    } catch (e) {}
    setCartLoaded(true);
  }, [storageKey]);

  useEffect(() => {
    if (!cartLoaded) return;
    try { localStorage.setItem(storageKey, JSON.stringify(cart)); } catch (e) {}
  }, [cart, storageKey, cartLoaded]);

  const clearCart = useCallback(() => {
    setCart([]);
    try { localStorage.removeItem(storageKey); } catch (e) {}
  }, [storageKey]);

  /* ── Session validation ────────────────────────────────── */
  useEffect(() => {
    if (!sessionToken) return;
    fetch(`/api/store/session?token=${encodeURIComponent(sessionToken)}`)
      .then(r => r.json())
      .then(data => {
        if (data.valid && data.payload?.referredProductId)
          setHighlightedProductId(data.payload.referredProductId);
      })
      .catch(() => {});
  }, [sessionToken]);

  /* ── Debounced search ──────────────────────────────────── */
  useEffect(() => {
    if (!search.trim()) { setSearchResults(null); return; }
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`/api/store/${slug}/search?q=${encodeURIComponent(search.trim())}`);
        const data = await res.json();
        setSearchResults(data.success ? data.results : []);
      } catch { setSearchResults([]); }
      finally { setSearching(false); }
    }, 350);
    return () => clearTimeout(timer);
  }, [search, slug]);

  /* ── Focus mobile search when expanded ─────────────────── */
  useEffect(() => {
    if (searchExpanded && mobileSearchRef.current) mobileSearchRef.current.focus();
  }, [searchExpanded]);

  /* ── Cart helpers ──────────────────────────────────────── */
  const addToCart = useCallback((product) => {
    setCart(prev => {
      const existing = prev.find(i => i.product._id === product._id);
      if (existing) return prev.map(i => i.product._id === product._id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { product, quantity: 1 }];
    });
  }, []);

  const updateCartQty = useCallback((productId, qty) => {
    if (qty <= 0) { setCart(prev => prev.filter(i => i.product._id !== productId)); return; }
    setCart(prev => prev.map(i => i.product._id === productId ? { ...i, quantity: qty } : i));
  }, []);

  const removeFromCart = useCallback((productId) => {
    setCart(prev => prev.filter(i => i.product._id !== productId));
  }, []);

  /* ── Derived data ──────────────────────────────────────── */
  const cartQtyMap = useMemo(() => {
    const map = {};
    for (const item of cart) map[item.product._id] = item.quantity;
    return map;
  }, [cart]);

  const totalCartItems = useMemo(() => cart.reduce((a, b) => a + (b.quantity || 1), 0), [cart]);

  const cartTotal = useMemo(() => {
    const subtotal = cart.reduce((s, i) => s + ((i.product?.discountPrice || i.product?.price || 0) * (i.quantity || 1)), 0);
    const baseDelivery = store.defaultDeliveryFee || 0;
    const extraDelivery = cart.reduce((s, i) => s + ((i.product?.extraShippingFee || 0) * (i.quantity || 1)), 0);
    return subtotal + (cart.length > 0 ? baseDelivery + extraDelivery : 0);
  }, [cart, store.defaultDeliveryFee]);

  const categories = useMemo(() =>
    [...new Set(products.map(p => p.category).filter(Boolean))].sort(),
    [products]
  );

  const filtered = useMemo(() => {
    const base = search.trim() && searchResults !== null ? searchResults : products;
    return activeCategory === "all" ? base : base.filter(p => p.category === activeCategory);
  }, [products, searchResults, search, activeCategory]);

  /* ── Layout constants ──────────────────────────────────── */
  const previewOffset = isPreview ? 37 : 0;
  const navHeight = 56;
  const categoryBarTop = previewOffset + navHeight;

  const clearSearch = useCallback(() => {
    setSearch("");
    setSearchResults(null);
    setSearchExpanded(false);
  }, []);

  return (
    <>
      {isPreview && <OwnerBanner />}

      <div style={{ minHeight: "100vh", background: t.pageBg, fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}>

        {/* ── NAVBAR ──────────────────────────────────────── */}
        <nav style={{
          position: "sticky", top: isPreview ? `${previewOffset}px` : 0, zIndex: 50,
          background: t.navBg, borderBottom: `1px solid ${t.border}`,
        }}>
          <div style={{
            maxWidth: "1100px", margin: "0 auto",
            padding: "0 14px", height: `${navHeight}px`,
            display: "flex", alignItems: "center", gap: "10px",
          }}>
            {/* Logo + name */}
            <Link href={`/store/${slug}`} style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none", flexShrink: 0 }}>
              {store.logoUrl ? (
                <img src={store.logoUrl} alt={store.businessName}
                  style={{ width: "29px", height: "29px", borderRadius: "7px", objectFit: "cover" }} />
              ) : (
                <div style={{
                  width: "29px", height: "29px", borderRadius: "7px",
                  background: t.accent, color: t.accentText,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontWeight: 900, fontSize: "14px", flexShrink: 0,
                }}>
                  {store.businessName?.charAt(0)?.toUpperCase()}
                </div>
              )}
              <span style={{
                fontSize: "15px", fontWeight: 800, color: t.textPrimary,
                letterSpacing: "-0.02em", maxWidth: "130px",
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>
                {store.businessName}
              </span>
            </Link>

            {/* Desktop search bar */}
            <div className="sf-search-desktop" style={{
              flex: 1, display: "flex", alignItems: "center", gap: "8px",
              background: t.card, border: `1px solid ${t.border}`,
              borderRadius: "8px", padding: "7px 12px",
              maxWidth: "340px", margin: "0 auto",
            }}>
              <span style={{ color: t.textSecondary, flexShrink: 0, display: "flex" }}>
                {searching
                  ? <div style={{ width: "14px", height: "14px", border: `2px solid ${t.border}`, borderTopColor: t.accent, borderRadius: "50%", animation: "sf-spin 0.7s linear infinite" }} />
                  : <SearchIcon />}
              </span>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search products…"
                style={{ flex: 1, background: "none", border: "none", outline: "none", fontSize: "13px", color: t.textPrimary, fontFamily: "inherit" }}
              />
              {search && (
                <button onClick={clearSearch} style={{ background: "none", border: "none", cursor: "pointer", color: t.textSecondary, padding: 0, display: "flex" }}>
                  <XIcon />
                </button>
              )}
            </div>

            {/* Spacer on mobile */}
            <div style={{ flex: 1 }} className="sf-spacer" />

            {/* Right: mobile search icon + cart + WA */}
            <div style={{ display: "flex", alignItems: "center", gap: "7px", flexShrink: 0 }}>
              {/* Mobile search toggle */}
              <button
                className="sf-search-mobile-btn"
                onClick={() => setSearchExpanded(v => !v)}
                style={{
                  width: "34px", height: "34px", borderRadius: "7px",
                  border: `1px solid ${t.border}`, background: "transparent",
                  color: t.textPrimary, cursor: "pointer",
                  display: "none", alignItems: "center", justifyContent: "center",
                }}>
                {searchExpanded ? <XIcon /> : <SearchIcon />}
              </button>

              {/* Cart button */}
              <button
                onClick={() => setCartOpen(true)}
                style={{
                  position: "relative", width: "34px", height: "34px", borderRadius: "7px",
                  border: `1px solid ${t.border}`, background: t.card,
                  color: t.textPrimary, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                <CartIcon size={16} />
                {totalCartItems > 0 && (
                  <span style={{
                    position: "absolute", top: "-5px", right: "-5px",
                    background: "#ef4444", color: "#fff",
                    borderRadius: "999px", fontSize: "8px", fontWeight: 800,
                    padding: "1px 5px", minWidth: "15px", textAlign: "center",
                  }}>
                    {totalCartItems}
                  </span>
                )}
              </button>

              {store.whatsappHref && (
                <a href={store.whatsappHref} target="_blank" rel="noopener noreferrer"
                  style={{
                    display: "inline-flex", alignItems: "center", gap: "6px",
                    padding: "8px 13px", borderRadius: "7px",
                    background: "#25d366", color: "#fff",
                    fontWeight: 700, fontSize: "12px", textDecoration: "none", whiteSpace: "nowrap",
                  }}>
                  <WhatsAppIcon size={13} /> <span className="sf-wa-label">Chat</span>
                </a>
              )}
            </div>
          </div>

          {/* Mobile expandable search bar */}
          {searchExpanded && (
            <div className="sf-mobile-search-bar" style={{ background: t.navBg, borderTop: `1px solid ${t.border}`, padding: "8px 14px" }}>
              <div style={{
                display: "flex", alignItems: "center", gap: "8px",
                background: t.card, border: `1px solid ${t.border}`,
                borderRadius: "8px", padding: "7px 12px",
              }}>
                <span style={{ color: t.textSecondary, display: "flex", flexShrink: 0 }}>
                  {searching
                    ? <div style={{ width: "14px", height: "14px", border: `2px solid ${t.border}`, borderTopColor: t.accent, borderRadius: "50%", animation: "sf-spin 0.7s linear infinite" }} />
                    : <SearchIcon />}
                </span>
                <input
                  ref={mobileSearchRef}
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search products…"
                  style={{ flex: 1, background: "none", border: "none", outline: "none", fontSize: "13px", color: t.textPrimary, fontFamily: "inherit" }}
                />
                {search
                  ? <button onClick={() => { setSearch(""); setSearchResults(null); }} style={{ background: "none", border: "none", cursor: "pointer", color: t.textSecondary, padding: 0, display: "flex" }}><XIcon /></button>
                  : null
                }
                <button onClick={clearSearch}
                  style={{ background: "none", border: "none", cursor: "pointer", color: t.textSecondary, fontSize: "12px", padding: "0 0 0 4px", whiteSpace: "nowrap", fontFamily: "inherit" }}>
                  Cancel
                </button>
              </div>
            </div>
          )}
        </nav>

        {/* ── STORE HERO STRIP ─────────────────────────────── */}
        <StoreHeroStrip store={store} theme={t} />

        {/* ── CATEGORY BAR ─────────────────────────────────── */}
        {categories.length > 0 && (
          <CategoryBar
            categories={categories}
            active={activeCategory}
            onChange={setActiveCategory}
            topOffset={categoryBarTop}
            theme={t}
          />
        )}

        {/* ── CART DRAWER ──────────────────────────────────── */}
        <CartDrawer
          open={cartOpen}
          onClose={() => setCartOpen(false)}
          cart={cart}
          onUpdateQty={updateCartQty}
          onRemove={removeFromCart}
          onClearCart={clearCart}
          store={store}
          theme={t}
        />

        {/* ── MAIN CONTENT ─────────────────────────────────── */}
        <main style={{ maxWidth: "1100px", margin: "0 auto", padding: "18px 14px 110px" }}>

          {/* Search status label */}
          {search && !searching && (
            <p style={{ fontSize: "12px", color: t.textSecondary, marginBottom: "14px" }}>
              {filtered.length === 0
                ? `No results for "${search}"`
                : `${filtered.length} result${filtered.length !== 1 ? "s" : ""} for "${search}"`}
            </p>
          )}

          {/* Product grid */}
          {filtered.length > 0 ? (
            <div className="sf-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "11px" }}>
              {filtered.map(product => (
                <ProductCard
                  key={product._id}
                  product={product}
                  store={store}
                  slug={slug}
                  sessionToken={sessionToken}
                  theme={t}
                  highlighted={product._id === highlightedProductId}
                  cartQuantity={cartQtyMap[product._id] || 0}
                  onAddToCart={addToCart}
                  onUpdateQty={updateCartQty}
                />
              ))}
            </div>
          ) : (
            <div style={{
              textAlign: "center", padding: "60px 20px",
              border: `1px dashed ${t.border}`, borderRadius: "14px", marginTop: "6px",
            }}>
              <div style={{ fontSize: "38px", marginBottom: "12px", opacity: 0.45 }}>📦</div>
              <h2 style={{ margin: "0 0 6px", fontSize: "16px", fontWeight: 800, color: t.textPrimary }}>
                {search ? "No matches found" : "No products yet"}
              </h2>
              <p style={{ margin: "0 0 20px", fontSize: "13px", color: t.textSecondary }}>
                {search
                  ? "Try a different search or browse all products."
                  : "This store hasn't listed any products yet."}
              </p>
              {search && (
                <button
                  onClick={() => { clearSearch(); setActiveCategory("all"); }}
                  style={{ padding: "9px 22px", borderRadius: "8px", background: t.accent, color: t.accentText, fontWeight: 700, border: "none", cursor: "pointer", fontSize: "13px", fontFamily: "inherit" }}>
                  Clear search
                </button>
              )}
              {!search && store.whatsappHref && (
                <a href={store.whatsappHref} target="_blank" rel="noopener noreferrer"
                  style={{ display: "inline-flex", alignItems: "center", gap: "7px", padding: "9px 22px", borderRadius: "8px", background: "#25d366", color: "#fff", fontWeight: 700, textDecoration: "none", fontSize: "13px" }}>
                  <WhatsAppIcon size={14} /> Ask about availability
                </a>
              )}
            </div>
          )}
        </main>

        {/* ── PAX26 FOOTER ─────────────────────────────────── */}
        <Pax26Footer theme={t} />

        {/* ── CART FAB (mobile) ────────────────────────────── */}
        <CartFAB
          itemCount={totalCartItems}
          total={cartTotal}
          currency={currency}
          onClick={() => setCartOpen(true)}
          theme={t}
        />

      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

        @keyframes sf-spin { to { transform: rotate(360deg); } }

        /* ── Category bar scrollbar hide ── */
        .sf-cat-bar::-webkit-scrollbar { display: none; }

        /* ── Mobile defaults (< 640px) ── */
        .sf-search-desktop { display: none !important; }
        .sf-search-mobile-btn { display: flex !important; }
        .sf-mobile-search-bar { display: block !important; }
        .sf-spacer { display: block !important; }
        .sf-wa-label { display: none !important; }
        .sf-cart-fab { display: flex !important; }

        /* ── Tablet and up (≥ 640px) ── */
        @media (min-width: 640px) {
          .sf-search-desktop { display: flex !important; }
          .sf-search-mobile-btn { display: none !important; }
          .sf-mobile-search-bar { display: none !important; }
          .sf-spacer { display: none !important; }
          .sf-wa-label { display: inline !important; }
          .sf-cart-fab { display: none !important; }
          .sf-grid { grid-template-columns: repeat(3, 1fr) !important; gap: 14px !important; }
        }

        /* ── Desktop (≥ 900px) ── */
        @media (min-width: 900px) {
          .sf-grid { grid-template-columns: repeat(4, 1fr) !important; gap: 16px !important; }
        }
      `}</style>
    </>
  );
}
