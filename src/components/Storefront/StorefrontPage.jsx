"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { formatPrice } from "@/app/lib/currency/currencyHelper";
import { getTheme } from "@/app/lib/store/storeThemes";

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
            <a href={store.whatsappHref} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "12px", borderRadius: "12px", background: "#25d366", color: "#fff", fontWeight: 800, fontSize: "14px", textDecoration: "none", boxShadow: "0 4px 14px #25d36640" }}>
              <WhatsAppIcon /> Chat with us
            </a>
          </div>
        )}
      </div>
    </>
  );
}

/* ── Product Card ───────────────────────────────────────── */
function ProductCard({ product, store, slug, sessionToken, theme, highlighted, cartQuantity, onAddToCart, onUpdateQty }) {
  const [imgError, setImgError] = useState(false);
  const [loading, setLoading] = useState(false);
  const t = theme;
  const currency = store.currency || "NGN";
  const displayPrice = product.discountPrice || product.price;
  const hasDiscount = !!(product.discountPrice && product.discountPrice < product.price);
  const productHref = `/store/${slug}/${product.slug || product._id}${sessionToken ? `?session=${sessionToken}` : ""}`;

  return (
    <article style={{ background: t.card, borderRadius: "16px", overflow: "hidden", border: highlighted ? `2px solid ${t.accent}` : cartQuantity > 0 ? `2px solid #22c55e` : `1px solid ${t.border}`, boxShadow: highlighted ? `0 0 0 4px ${t.accent}22` : cartQuantity > 0 ? "0 4px 14px rgba(34,197,94,0.15)" : "none", transition: "transform 0.18s, box-shadow 0.18s", display: "flex", flexDirection: "column", position: "relative" }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = `0 12px 32px rgba(0,0,0,0.12)`; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = highlighted ? `0 0 0 4px ${t.accent}22` : cartQuantity > 0 ? "0 4px 14px rgba(34,197,94,0.15)" : "none"; }}>

      <Link href={productHref} style={{ textDecoration: "none", color: "inherit", display: "flex", flexDirection: "column", flex: 1 }} onClick={() => setLoading(true)}>
        {/* Loading overlay */}
        {loading && (
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 10, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "16px" }}>
            <div style={{ width: "32px", height: "32px", border: "3px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "sf-spin 0.7s linear infinite" }} />
          </div>
        )}

        {/* Image */}
        <div style={{ position: "relative", paddingTop: "80%", background: t.pageBg, overflow: "hidden" }}>
          {product.images?.[0]?.url && !imgError ? (
            <img src={product.images[0].url} alt={product.name} onError={() => setImgError(true)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: t.textSecondary, opacity: 0.3 }}><PackageIcon /></div>
          )}
          {product.stock === 0 && <div style={{ position: "absolute", top: "10px", left: "10px", background: "rgba(0,0,0,0.75)", color: "#fff", padding: "3px 10px", borderRadius: "6px", fontSize: "10px", fontWeight: 800, letterSpacing: "0.06em" }}>SOLD OUT</div>}
          {highlighted && <div style={{ position: "absolute", top: "10px", left: "10px", background: t.accent, color: t.accentText, padding: "3px 10px", borderRadius: "6px", fontSize: "10px", fontWeight: 800, display: "flex", alignItems: "center", gap: "4px" }}>🤖 AI Pick</div>}
          {cartQuantity > 0 && <div style={{ position: "absolute", top: "10px", right: "10px", background: "#22c55e", color: "#fff", padding: "3px 10px", borderRadius: "6px", fontSize: "10px", fontWeight: 800, boxShadow: "0 2px 8px rgba(34,197,94,0.4)", zIndex: 4 }}>✓ {cartQuantity} IN CART</div>}
          {hasDiscount && !highlighted && cartQuantity === 0 && product.stock > 0 && <div style={{ position: "absolute", top: "10px", right: "10px", background: "#ef4444", color: "#fff", padding: "3px 10px", borderRadius: "6px", fontSize: "10px", fontWeight: 800 }}>SALE</div>}
        </div>

        {/* Info */}
        <div style={{ padding: "14px 16px 8px", flex: 1, display: "flex", flexDirection: "column", gap: "6px" }}>
          {product.category && <span style={{ fontSize: "10px", fontWeight: 700, color: t.textSecondary, textTransform: "uppercase", letterSpacing: "0.08em" }}>{product.category}</span>}
          <h3 style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: t.textPrimary, lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{product.name}</h3>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "auto", paddingTop: "8px" }}>
            <span style={{ fontSize: "16px", fontWeight: 900, color: t.textPrimary }}>{formatPrice(displayPrice, currency)}</span>
            {hasDiscount && <span style={{ fontSize: "12px", color: t.textSecondary, textDecoration: "line-through" }}>{formatPrice(product.price, currency)}</span>}
          </div>
        </div>
      </Link>

      {/* Add to cart action button / Quantity Controls */}
      <div style={{ padding: "0 16px 14px" }}>
        {cartQuantity > 0 ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: t.pageBg, border: `1.5px solid #22c55e`, borderRadius: "10px", padding: "3px 6px" }}>
            <button onClick={(e) => { e.stopPropagation(); onUpdateQty(product._id, cartQuantity - 1); }} style={{ width: "28px", height: "28px", borderRadius: "6px", border: `1px solid ${t.border}`, background: t.card, color: t.textPrimary, fontWeight: 900, cursor: "pointer", fontSize: "14px" }}>-</button>
            <span style={{ fontSize: "12px", fontWeight: 800, color: "#22c55e" }}>{cartQuantity} in Cart</span>
            <button onClick={(e) => { e.stopPropagation(); onAddToCart(product); }} style={{ width: "28px", height: "28px", borderRadius: "6px", border: "none", background: "#22c55e", color: "#fff", fontWeight: 900, cursor: "pointer", fontSize: "14px" }}>+</button>
          </div>
        ) : (
          <button onClick={() => onAddToCart(product)} disabled={product.stock === 0} style={{ width: "100%", padding: "9px", borderRadius: "10px", border: `1px solid ${t.border}`, background: t.accent, color: t.accentText, fontWeight: 700, fontSize: "12px", cursor: product.stock === 0 ? "not-allowed" : "pointer", opacity: product.stock === 0 ? 0.5 : 1 }}>
            {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
          </button>
        )}
      </div>
    </article>
  );
}

const CartIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>);

/* ── Cart Drawer ────────────────────────────────────────── */
function CartDrawer({ open, onClose, cart, onUpdateQty, onRemove, onClearCart, store, theme }) {
  const t = theme;
  if (!open) return null;

  const currency = store.currency || "NGN";
  const subtotal = cart.reduce((sum, item) => sum + (item.product.discountPrice || item.product.price) * item.quantity, 0);
  const baseDelivery = store.defaultDeliveryFee || 0;
  const extraDeliverySum = cart.reduce((sum, item) => sum + (item.product.extraShippingFee || 0) * item.quantity, 0);
  const totalDelivery = cart.length > 0 ? baseDelivery + extraDeliverySum : 0;
  const grandTotal = subtotal + totalDelivery;

  const handleWhatsAppCheckout = () => {
    if (cart.length === 0 || !store.whatsappHref) return;

    let itemsText = cart.map(i => {
      const itemPrice = (i.product.discountPrice || i.product.price) * i.quantity;
      const imgLink = i.product.images?.[0]?.url || `https://www.pax26.com/store/${store.slug}/${i.product.slug || i.product._id}`;
      return `- ${i.quantity}x *${i.product.name}* (${formatPrice(itemPrice, currency)})\n  🖼️ ${imgLink}`;
    }).join("\n\n");

    let msg = `Hi! I would like to place an order from *${store.businessName}*:\n\n${itemsText}\n\n*Subtotal:* ${formatPrice(subtotal, currency)}`;
    if (totalDelivery > 0) {
      msg += `\n*Delivery Fee:* ${formatPrice(totalDelivery, currency)}`;
    }
    msg += `\n*Grand Total:* ${formatPrice(grandTotal, currency)}\n\nPlease let me know your delivery time and payment details.`;

    const waNum = store.whatsappHref.replace(/.*wa\.me\//, "");
    window.open(`https://wa.me/${waNum}?text=${encodeURIComponent(msg)}`, "_blank");

    // Clear cart state + localStorage behind the scenes
    if (onClearCart) onClearCart();
    onClose();
  };

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 200, backdropFilter: "blur(2px)" }} />
      <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: "380px", maxWidth: "90vw", background: t.navBg, zIndex: 201, display: "flex", flexDirection: "column", boxShadow: "-4px 0 40px rgba(0,0,0,0.25)" }}>
        {/* Header */}
        <div style={{ padding: "20px", borderBottom: `1px solid ${t.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: 800, fontSize: "16px", color: t.textPrimary }}>
            <CartIcon /> Your Cart ({cart.reduce((a, b) => a + b.quantity, 0)})
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: t.textSecondary, cursor: "pointer" }}><XIcon /></button>
        </div>

        {/* Cart Items */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
          {cart.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: t.textSecondary }}>
              <CartIcon />
              <p style={{ marginTop: "10px", fontSize: "14px" }}>Your cart is empty</p>
            </div>
          ) : (
            cart.map(item => {
              const price = item.product.discountPrice || item.product.price;
              return (
                <div key={item.product._id} style={{ display: "flex", gap: "12px", background: t.card, padding: "12px", borderRadius: "12px", border: `1px solid ${t.border}` }}>
                  <img src={item.product.images?.[0]?.url} alt={item.product.name} style={{ width: "50px", height: "50px", borderRadius: "8px", objectFit: "cover", flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: "13px", fontWeight: 700, color: t.textPrimary, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.product.name}</p>
                    <p style={{ margin: "2px 0 6px", fontSize: "12px", fontWeight: 800, color: t.accent }}>{formatPrice(price * item.quantity, currency)}</p>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <button onClick={() => onUpdateQty(item.product._id, item.quantity - 1)} style={{ width: "22px", height: "22px", borderRadius: "4px", border: `1px solid ${t.border}`, background: t.bg, color: t.textPrimary, cursor: "pointer", fontWeight: 800 }}>-</button>
                      <span style={{ fontSize: "12px", fontWeight: 700, color: t.textPrimary }}>{item.quantity}</span>
                      <button onClick={() => onUpdateQty(item.product._id, item.quantity + 1)} style={{ width: "22px", height: "22px", borderRadius: "4px", border: `1px solid ${t.border}`, background: t.bg, color: t.textPrimary, cursor: "pointer", fontWeight: 800 }}>+</button>
                    </div>
                  </div>
                  <button onClick={() => onRemove(item.product._id)} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: "16px" }}>×</button>
                </div>
              );
            })
          )}
        </div>

        {/* Summary & Checkout */}
        {cart.length > 0 && (
          <div style={{ padding: "20px", borderTop: `1px solid ${t.border}`, background: t.card, display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: t.textSecondary }}>
              <span>Subtotal</span>
              <span style={{ fontWeight: 700, color: t.textPrimary }}>{formatPrice(subtotal, currency)}</span>
            </div>
            {totalDelivery > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: t.textSecondary }}>
                <span>Estimated Delivery</span>
                <span style={{ fontWeight: 700, color: t.textPrimary }}>{formatPrice(totalDelivery, currency)}</span>
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "15px", fontWeight: 900, color: t.textPrimary, paddingTop: "6px", borderTop: `1px dashed ${t.border}` }}>
              <span>Total</span>
              <span>{formatPrice(grandTotal, currency)}</span>
            </div>

            <button onClick={handleWhatsAppCheckout} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", width: "100%", padding: "14px", borderRadius: "12px", background: "#25d366", color: "#fff", fontWeight: 800, fontSize: "14px", border: "none", cursor: "pointer", marginTop: "6px", boxShadow: "0 4px 14px #25d36640" }}>
              <WhatsAppIcon /> Order via WhatsApp
            </button>
          </div>
        )}
      </div>
    </>
  );
}

/* ══════════════════════════════════════════════════════════
   MAIN: StorefrontPage
══════════════════════════════════════════════════════════ */
export default function StorefrontPage({ store, products, slug, isPreview, sessionToken, referredProductId }) {
  const theme = getTheme(store.storeTheme);
  const t = theme;

  const storageKey = `pax26_cart_${store.slug || slug}`;

  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [cart, setCart] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(`pax26_cart_${store.slug || slug}`);
        return saved ? JSON.parse(saved) : [];
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  // Save cart to localStorage on state changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(storageKey, JSON.stringify(cart));
      } catch (e) {}
    }
  }, [cart, storageKey]);

  const clearCart = useCallback(() => {
    setCart([]);
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(storageKey);
      } catch (e) {}
    }
  }, [storageKey]);

  const [highlightedProductId, setHighlightedProductId] = useState(referredProductId || null);
  const [searchResults, setSearchResults] = useState(null);
  const [searching, setSearching] = useState(false);

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(i => i.product._id === product._id);
      if (existing) {
        return prev.map(i => i.product._id === product._id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { product, quantity: 1 }];
    });
    setCartOpen(true);
  };

  const updateCartQty = (productId, qty) => {
    if (qty <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev => prev.map(i => i.product._id === productId ? { ...i, quantity: qty } : i));
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(i => i.product._id !== productId));
  };

  // Map product ID to quantity in cart
  const cartQtyMap = useMemo(() => {
    const map = {};
    for (const item of cart) {
      map[item.product._id] = item.quantity;
    }
    return map;
  }, [cart]);

  // Validate session + resolve referredProductId
  useEffect(() => {
    if (!sessionToken) return;
    fetch(`/api/store/session?token=${encodeURIComponent(sessionToken)}`)
      .then(r => r.json())
      .then(data => { if (data.valid && data.payload?.referredProductId) setHighlightedProductId(data.payload.referredProductId); })
      .catch(() => {});
  }, [sessionToken]);

  // Debounced API search
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

  const categories = useMemo(() => [...new Set(products.map(p => p.category).filter(Boolean))].sort(), [products]);

  const filtered = useMemo(() => {
    if (search.trim() && searchResults !== null) {
      return activeCategory === "all" ? searchResults : searchResults.filter(p => p.category === activeCategory);
    }
    if (activeCategory === "all") return products;
    return products.filter(p => p.category === activeCategory);
  }, [products, searchResults, search, activeCategory]);

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

            {/* Right: Cart + WhatsApp button */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <button onClick={() => setCartOpen(true)} style={{ position: "relative", width: "38px", height: "38px", borderRadius: "10px", border: `1px solid ${t.border}`, background: t.card, color: t.textPrimary, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <CartIcon />
                {cart.length > 0 && (
                  <span style={{ position: "absolute", top: "-5px", right: "-5px", background: "#ef4444", color: "#fff", borderRadius: "999px", padding: "1px 6px", fontSize: "10px", fontWeight: 800 }}>
                    {cart.reduce((a, b) => a + b.quantity, 0)}
                  </span>
                )}
              </button>
              {store.whatsappHref && (
                <a href={store.whatsappHref} target="_blank" rel="noopener noreferrer"
                  style={{ display: "flex", alignItems: "center", gap: "7px", padding: "9px 16px", borderRadius: "10px", background: "#25d366", color: "#fff", fontWeight: 700, fontSize: "13px", textDecoration: "none", whiteSpace: "nowrap", boxShadow: "0 2px 10px #25d36640" }}>
                  <WhatsAppIcon /> Chat
                </a>
              )}
            </div>
          </div>
        </nav>

        {/* ── SIDE MENU & CART DRAWER ──────────────────── */}
        <SideMenu open={menuOpen} onClose={() => setMenuOpen(false)} store={store} categories={categories} activeCategory={activeCategory} onCategoryChange={setActiveCategory} theme={t} search={search} onSearchChange={setSearch} slug={slug} />
        <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} cart={cart} onUpdateQty={updateCartQty} onRemove={removeFromCart} onClearCart={clearCart} store={store} theme={t} />

        {/* ── MAIN CONTENT ─────────────────────────────── */}
        <main style={{ maxWidth: "1100px", margin: "0 auto", padding: "24px 16px" }}>

          {/* Search bar + category pills */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginBottom: "24px", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", background: t.card, borderRadius: "10px", padding: "9px 14px", border: `1px solid ${t.border}`, flex: "1 1 200px", maxWidth: "380px" }}>
              <span style={{ color: t.textSecondary, flexShrink: 0 }}>
                {searching ? <div style={{ width: "16px", height: "16px", border: `2px solid ${t.border}`, borderTopColor: t.accent, borderRadius: "50%", animation: "sf-spin 0.7s linear infinite" }} /> : <SearchIcon />}
              </span>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products…" style={{ flex: 1, background: "none", border: "none", outline: "none", fontSize: "14px", color: t.textPrimary, fontFamily: "inherit" }} />
              {search && <button onClick={() => { setSearch(""); setSearchResults(null); }} style={{ background: "none", border: "none", cursor: "pointer", color: t.textSecondary, fontSize: "18px", lineHeight: 1, padding: 0 }}>×</button>}
            </div>

            {categories.length > 0 && (
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                {["all", ...categories].map(cat => (
                  <button key={cat} onClick={() => setActiveCategory(cat)}
                    style={{ padding: "7px 14px", borderRadius: "999px", border: "none", background: activeCategory === cat ? t.accent : t.card, color: activeCategory === cat ? t.accentText : t.textSecondary, fontSize: "12px", fontWeight: 600, cursor: "pointer", border: activeCategory === cat ? "none" : `1px solid ${t.border}`, transition: "all 0.12s" }}>
                    {cat === "all" ? `All (${products.length})` : cat}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Search results label */}
          {search && <p style={{ fontSize: "13px", color: t.textSecondary, marginBottom: "16px" }}>{filtered.length === 0 ? `No results for "${search}"` : `${filtered.length} result${filtered.length !== 1 ? "s" : ""} for "${search}"`}</p>}

          {/* Product grid */}
          {filtered.length > 0 ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))", gap: "18px" }}>
              {filtered.map(product => (
                <ProductCard key={product._id} product={product} store={store} slug={slug} sessionToken={sessionToken} theme={t} highlighted={product._id === highlightedProductId} cartQuantity={cartQtyMap[product._id] || 0} onAddToCart={addToCart} onUpdateQty={updateCartQty} />
              ))}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "72px 20px", background: t.card, borderRadius: "20px", border: `1px dashed ${t.border}` }}>
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>📦</div>
              <h3 style={{ fontSize: "18px", fontWeight: 800, color: t.textPrimary, margin: "0 0 8px" }}>{search ? "No products match your search" : "No products yet"}</h3>
              <p style={{ fontSize: "14px", color: t.textSecondary, margin: "0 0 24px" }}>{search ? "Try a different search or browse all categories." : "This store hasn't added any products yet."}</p>
              {search && <button onClick={() => { setSearch(""); setSearchResults(null); setActiveCategory("all"); }} style={{ padding: "10px 24px", borderRadius: "10px", background: t.accent, color: t.accentText, fontWeight: 700, border: "none", cursor: "pointer", fontSize: "14px" }}>Clear search</button>}
              {!search && store.whatsappHref && <a href={store.whatsappHref} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "10px 24px", borderRadius: "10px", background: "#25d366", color: "#fff", fontWeight: 700, textDecoration: "none", fontSize: "14px" }}><WhatsAppIcon /> Ask about availability</a>}
            </div>
          )}
        </main>

        {/* ── PAX26 AD FOOTER ──────────────────────────── */}
        {/* Always shown on all storefronts — Pax26 advertising */}
        <Pax26Footer />

      </div>
      <style>{`@keyframes sf-spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}
