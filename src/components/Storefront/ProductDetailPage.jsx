"use client";

import { useState } from "react";
import Link from "next/link";
import { formatPrice } from "@/app/lib/currency/currencyHelper";
import { getTheme } from "@/app/lib/store/storeThemes";
import { useCart } from "@/app/lib/store/useCart";

/* ── Icons ──────────────────────────────────────────────── */
const WhatsAppIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>);
const ChevronLeft = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>);
const PackageIcon = () => (<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>);
const TruckIcon = () => (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>);
const MapPinIcon = () => (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>);
const EditIcon = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>);
const ZapIcon = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>);
const ShieldCheckIcon = () => (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>);
const ShoppingBagIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>);
const MenuIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>);

function handleWhatsAppRedirect(e, href) {
  if (!href) return;
  e?.preventDefault();

  let targetUrl = href;
  if (!targetUrl.startsWith("http://") && !targetUrl.startsWith("https://")) {
    targetUrl = `https://${targetUrl}`;
  }

  const isMobile = typeof window !== "undefined" && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  if (isMobile) {
    // Universal Meta HTTPS wa.me link allows iOS/Android to route to the active app
    // (WhatsApp Business or Consumer WhatsApp) without forcing com.whatsapp
    window.location.href = targetUrl;
  } else {
    window.open(targetUrl, "_blank", "noopener,noreferrer");
  }
}

function OwnerBanner() {
  return (
    <div style={{ position: "sticky", top: 0, zIndex: 100, background: "#111115", color: "#fff", padding: "10px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px", fontSize: "12px", fontWeight: 600, borderBottom: "1px solid #2a2a35" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span style={{ background: "#22c55e", color: "#fff", borderRadius: "6px", padding: "2px 8px", fontSize: "10px", fontWeight: 900, letterSpacing: "0.08em", textTransform: "uppercase" }}>Preview Mode</span>
        <span style={{ opacity: 0.85, fontSize: "12px" }}>Product detail view</span>
      </div>
      <a href="/dashboard/automations/ai-business-dashboard" style={{ display: "flex", alignItems: "center", gap: "6px", padding: "5px 12px", borderRadius: "8px", background: "#ffffff", color: "#111115", textDecoration: "none", fontSize: "12px", fontWeight: 800 }}>
        <EditIcon /> Edit Store
      </a>
    </div>
  );
}

function Pax26Footer() {
  return (
    <div style={{ background: "linear-gradient(135deg, #09090d 0%, #151522 100%)", borderTop: "1px solid #232332", padding: "24px 20px 88px" }}>
      <div style={{ maxWidth: "1140px", margin: "0 auto", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "32px", height: "32px", borderRadius: "10px", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", flexShrink: 0, boxShadow: "0 4px 14px rgba(99, 102, 241, 0.4)" }}><ZapIcon /></div>
          <div>
            <p style={{ margin: 0, fontSize: "13px", fontWeight: 800, color: "#fff" }}>Powered by <span style={{ color: "#818cf8" }}>Pax26</span></p>
            <p style={{ margin: 0, fontSize: "11px", color: "#828799" }}>AI WhatsApp Storefront — automated orders 24/7</p>
          </div>
        </div>
        <a href="https://pax26.com" target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px", borderRadius: "10px", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "#fff", fontWeight: 800, fontSize: "12px", textDecoration: "none", whiteSpace: "nowrap", boxShadow: "0 4px 16px rgba(99, 102, 241, 0.35)" }}>
          Create free store →
        </a>
      </div>
    </div>
  );
}

function RelatedProducts({ products, currentId, store, slug, sessionToken, theme }) {
  const t = theme;
  const related = products.filter(p => p._id !== currentId).slice(0, 4);
  if (!related.length) return null;
  const currency = store.currency || "NGN";
  return (
    <section style={{ marginTop: "40px", paddingTop: "24px", borderTop: `1px solid ${t.border}` }}>
      <h2 style={{ fontSize: "18px", fontWeight: 900, color: t.textPrimary, margin: "0 0 20px", letterSpacing: "-0.02em" }}>More from {store.businessName}</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "16px" }}>
        {related.map(p => {
          const displayPrice = p.discountPrice || p.price;
          const href = `/store/${slug}/${p.slug || p._id}${sessionToken ? `?session=${sessionToken}` : ""}`;
          return (
            <Link key={p._id} href={href} style={{ textDecoration: "none" }}>
              <div style={{ background: t.card, borderRadius: "16px", overflow: "hidden", border: `1px solid ${t.border}`, transition: "transform 0.25s, box-shadow 0.25s", boxShadow: "0 2px 10px rgba(0,0,0,0.03)" }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 12px 30px rgba(0,0,0,0.12)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 2px 10px rgba(0,0,0,0.03)"; }}>
                <div style={{ paddingTop: "85%", position: "relative", background: t.pageBg }}>
                  {p.images?.[0]?.url ? <img src={p.images[0].url} alt={p.name} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} /> : <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: t.textSecondary, opacity: 0.3 }}><PackageIcon /></div>}
                </div>
                <div style={{ padding: "12px" }}>
                  <p style={{ margin: "0 0 4px", fontSize: "13px", fontWeight: 800, color: t.textPrimary, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</p>
                  <p style={{ margin: 0, fontSize: "14px", fontWeight: 900, color: t.textPrimary }}>{formatPrice(displayPrice, currency)}</p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function buildWhatsAppMessage(product, selectedVariants, currency, slug, sessionToken) {
  const price = product.discountPrice || product.price;
  const BASE = process.env.NEXT_PUBLIC_BASE_URL || "https://www.pax26.com";
  const productUrl = `${BASE}/store/${slug}/${product.slug || product._id}${sessionToken ? `?session=${sessionToken}` : ""}`;

  let text = `Hi! I'm interested in *${product.name}*`;
  const variantParts = Object.entries(selectedVariants).map(([label, value]) => `${label}: ${value}`).filter(Boolean);
  if (variantParts.length > 0) text += ` (${variantParts.join(", ")})`;
  text += ` — priced at ${formatPrice(price, currency)}.`;
  text += `\n\nProduct page: ${productUrl}`;
  text += "\n\nCould you assist me with this order?";
  return encodeURIComponent(text);
}

export default function ProductDetailPage({ store, product, allProducts, slug, isPreview, sessionToken }) {
  const theme = getTheme(store.storeTheme);
  const t = theme;
  const cartState = useCart(slug);

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedVariants, setSelectedVariants] = useState({});
  const [imgError, setImgError] = useState(false);

  const currency = store.currency || "NGN";
  const displayPrice = product.discountPrice || product.price;
  const hasDiscount = !!(product.discountPrice && product.discountPrice < product.price);
  const discountPercent = hasDiscount ? Math.round(((product.price - product.discountPrice) / product.price) * 100) : 0;
  const isOutOfStock = product.stock === 0;
  const images = product.images || [];

  const cartQuantity = cartState.cart.find(item => item.productId === product._id)?.quantity || 0;

  const whatsappMessage = buildWhatsAppMessage(product, selectedVariants, currency, slug, sessionToken);
  const whatsappHref = store.whatsappHref ? `${store.whatsappHref}?text=${whatsappMessage}` : null;
  const storeHref = `/store/${slug}${sessionToken ? `?session=${sessionToken}` : ""}`;

  return (
    <>
      {isPreview && <OwnerBanner />}
      <div style={{ minHeight: "100vh", background: t.pageBg, fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>

        {/* Translucent Glassmorphism Header */}
        <nav className="sf-top-navbar" style={{
          background: `${t.navBg}f5`,
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderBottom: `1px solid ${t.border}`,
          position: "sticky",
          top: isPreview ? "42px" : 0,
          zIndex: 50,
        }}>
          <div style={{ maxWidth: "1140px", margin: "0 auto", padding: "0 16px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: "56px", gap: "12px" }}>
              <Link href={storeHref} style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
                {store.logoUrl ? (
                  <img src={store.logoUrl} alt={store.businessName} style={{ width: "32px", height: "32px", borderRadius: "8px", objectFit: "cover" }} />
                ) : (
                  <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: t.accent, display: "flex", alignItems: "center", justifyContent: "center", color: t.accentText, fontWeight: 900, fontSize: "15px", flexShrink: 0 }}>
                    {store.businessName?.charAt(0)?.toUpperCase()}
                  </div>
                )}
                <span style={{ fontSize: "16px", fontWeight: 800, color: t.textPrimary, letterSpacing: "-0.01em" }}>{store.businessName}</span>
              </Link>
              {store.whatsappHref && (
                <a href={store.whatsappHref} onClick={(e) => handleWhatsAppRedirect(e, store.whatsappHref)} target="_blank" rel="noopener noreferrer" className="sf-desktop-chat-btn"
                  style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px", borderRadius: "10px", background: "#25d366", color: "#fff", fontWeight: 800, fontSize: "12px", textDecoration: "none", whiteSpace: "nowrap", boxShadow: "0 2px 10px rgba(37,211,102,0.3)" }}>
                  <WhatsAppIcon /> Chat
                </a>
              )}
            </div>
            {/* Compact Breadcrumb CTA */}
            <div style={{ display: "flex", alignItems: "center", gap: "6px", paddingBottom: "10px" }}>
              <Link href={storeHref} style={{ color: t.textSecondary, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "3px", fontSize: "11px", fontWeight: 600 }}><ChevronLeft /> All products</Link>
            </div>
          </div>
        </nav>

        {/* Promo announcement banner */}
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
        )}

        {/* Main Content */}
        <main style={{ maxWidth: "1140px", margin: "0 auto", padding: "24px 16px 88px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "36px", alignItems: "start" }}>

            {/* Product Image Gallery */}
            <div>
              <div style={{ borderRadius: "20px", overflow: "hidden", background: t.card, aspectRatio: "1", position: "relative", border: `1px solid ${t.border}`, boxShadow: "0 4px 18px rgba(0,0,0,0.03)" }}>
                {images[activeImageIndex]?.url && !imgError ? (
                  <img src={images[activeImageIndex].url} alt={product.name} onError={() => setImgError(true)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: t.textSecondary, opacity: 0.3 }}><PackageIcon /></div>
                )}
                {isOutOfStock && (
                  <div style={{ position: "absolute", inset: 0, background: "rgba(15, 15, 19, 0.65)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ background: "#ffffff", color: "#111115", padding: "8px 20px", borderRadius: "10px", fontWeight: 900, fontSize: "14px", letterSpacing: "0.04em" }}>SOLD OUT</span>
                  </div>
                )}
              </div>
              {images.length > 1 && (
                <div style={{ display: "flex", gap: "8px", marginTop: "12px", flexWrap: "wrap" }}>
                  {images.map((img, i) => (
                    <button key={i} onClick={() => setActiveImageIndex(i)} style={{ width: "60px", height: "60px", borderRadius: "10px", overflow: "hidden", cursor: "pointer", border: i === activeImageIndex ? `2px solid ${t.accent}` : `1px solid ${t.border}`, padding: 0, background: t.card, flexShrink: 0, transition: "all 0.15s" }}>
                      <img src={img.url} alt={`Thumbnail ${i + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info & Buy Box */}
            <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              {product.category && <span style={{ fontSize: "10px", fontWeight: 900, color: t.textSecondary, textTransform: "uppercase", letterSpacing: "0.08em" }}>{product.category}</span>}
              <h1 style={{ margin: 0, fontSize: "clamp(22px, 4vw, 28px)", fontWeight: 900, color: t.textPrimary, letterSpacing: "-0.02em", lineHeight: 1.25 }}>{product.name}</h1>
              
              {/* Price Row */}
              <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                <span style={{ fontSize: "28px", fontWeight: 900, color: t.textPrimary, letterSpacing: "-0.02em" }}>{formatPrice(displayPrice, currency)}</span>
                {hasDiscount && <span style={{ fontSize: "16px", color: t.textSecondary, textDecoration: "line-through" }}>{formatPrice(product.price, currency)}</span>}
                {hasDiscount && (
                  <span style={{ background: "#fef2f2", color: "#ef4444", border: "1px solid #fecaca", padding: "4px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: 900 }}>
                    -{discountPercent}% OFF
                  </span>
                )}
              </div>

              {product.description && <p style={{ margin: 0, fontSize: "14px", color: t.textSecondary, lineHeight: 1.65 }}>{product.description}</p>}

              {/* Variants */}
              {product.variants?.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  {product.variants.map((variant, vi) => (
                    <div key={vi}>
                      <p style={{ margin: "0 0 8px", fontSize: "13px", fontWeight: 800, color: t.textPrimary }}>{variant.label}{selectedVariants[variant.label] && <span style={{ fontWeight: 600, color: t.textSecondary, marginLeft: "6px" }}>— {selectedVariants[variant.label]}</span>}</p>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                        {variant.options?.map((opt, oi) => {
                          const isSelected = selectedVariants[variant.label] === opt.value;
                          return (
                            <button key={oi} onClick={() => opt.stock !== 0 && setSelectedVariants(v => ({ ...v, [variant.label]: opt.value }))} disabled={opt.stock === 0}
                              style={{ padding: "8px 16px", borderRadius: "8px", border: isSelected ? `2px solid ${t.accent}` : `1px solid ${t.border}`, background: isSelected ? t.accent : t.card, color: isSelected ? t.accentText : opt.stock === 0 ? t.textSecondary : t.textPrimary, fontSize: "12px", fontWeight: 800, cursor: opt.stock === 0 ? "not-allowed" : "pointer", textDecoration: opt.stock === 0 ? "line-through" : "none", transition: "all 0.15s" }}>
                              {opt.value}{opt.priceAdjustment > 0 && <span style={{ fontSize: "10px", marginLeft: "4px", opacity: 0.8 }}>+{formatPrice(opt.priceAdjustment, currency)}</span>}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Trust & Delivery Card */}
              <div style={{ background: t.card, borderRadius: "16px", padding: "16px 18px", display: "flex", flexDirection: "column", gap: "10px", border: `1px solid ${t.border}` }}>
                <p style={{ margin: 0, fontSize: "10px", fontWeight: 900, color: t.textSecondary, textTransform: "uppercase", letterSpacing: "0.1em" }}>Fulfilment & Guarantee</p>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: t.textPrimary, fontWeight: 600 }}>
                  <ShieldCheckIcon /> Verified Seller Order Protection
                </div>

                {product.fulfillmentType === "pickup_only" ? (
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: t.accent, fontWeight: 700 }}>
                    <span>🏬</span> Store Pick-up Only — {store.fulfillmentSettings?.pickupAddress || store.liveLocation || "Contact seller"}
                  </div>
                ) : (
                  <>
                    {store.fulfillmentSettings?.deliveryModel === "zones" && store.fulfillmentSettings?.deliveryZones?.length > 0 ? (
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: t.textPrimary, fontWeight: 600 }}>
                        <TruckIcon />
                        Delivery: From {formatPrice(Math.min(...store.fulfillmentSettings.deliveryZones.map(z => Number(z.fee) || 0)), currency)} · (Location rates apply at checkout)
                      </div>
                    ) : store.fulfillmentSettings?.deliveryModel === "quote" ? (
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: t.textPrimary, fontWeight: 600 }}>
                        <TruckIcon />
                        Delivery Fee: Calculated upon dispatch / quote
                      </div>
                    ) : product.isPhysical && (product.deliveryFee != null || product.deliveryTimeFrame || product.locationNotes) && (
                      <>
                        {product.deliveryFee != null && (
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: t.textPrimary, fontWeight: 600 }}>
                            <TruckIcon />
                            {product.deliveryFee === 0 ? "Free delivery" : `Delivery Fee: ${formatPrice(product.deliveryFee, currency)}`}
                            {product.deliveryTimeFrame && ` · (${product.deliveryTimeFrame})`}
                          </div>
                        )}
                        {product.locationNotes && (
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: t.textPrimary, fontWeight: 600 }}>
                            <MapPinIcon /> {product.locationNotes}
                          </div>
                        )}
                      </>
                    )}
                    {store.fulfillmentSettings?.allowPickup && (
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: t.textPrimary, fontWeight: 600 }}>
                        <span>🏬</span> Store Pick-up Available ({store.fulfillmentSettings?.pickupAddress || store.liveLocation || "In store"})
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Stock warning */}
              {!isOutOfStock && product.stock > 0 && product.stock <= 10 && (
                <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "6px 12px", borderRadius: "8px", background: "#fef3c7", color: "#92400e", fontSize: "12px", fontWeight: 800, border: "1px solid #fde68a" }}>
                  ⚡ Low Stock: Only {product.stock} items left
                </div>
              )}

              {/* CTA Actions */}
              {whatsappHref ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                    {!isOutOfStock && (
                      <div style={{ flex: "1 1 160px" }}>
                        {cartQuantity > 0 ? (
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderRadius: "14px", background: t.card, border: `2px solid ${t.accent}` }}>
                            <span style={{ fontSize: "13px", fontWeight: 800, color: t.textPrimary }}>In Cart:</span>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                              <button onClick={() => cartState.setItemQuantity(product._id, cartQuantity - 1)} style={{ width: "28px", height: "28px", borderRadius: "6px", background: t.pageBg, border: `1px solid ${t.border}`, color: t.textPrimary, cursor: "pointer", fontWeight: 900 }}>-</button>
                              <span style={{ fontSize: "15px", fontWeight: 900, color: t.textPrimary }}>{cartQuantity}</span>
                              <button onClick={() => cartState.setItemQuantity(product._id, cartQuantity + 1)} style={{ width: "28px", height: "28px", borderRadius: "6px", background: t.pageBg, border: `1px solid ${t.border}`, color: t.textPrimary, cursor: "pointer", fontWeight: 900 }}>+</button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => cartState.addItem(product, 1)}
                            style={{ width: "100%", padding: "15px", borderRadius: "14px", background: t.accent, color: t.accentText, fontWeight: 900, fontSize: "15px", border: "none", cursor: "pointer", boxShadow: "0 4px 14px rgba(0,0,0,0.12)" }}
                          >
                            + Add to Cart
                          </button>
                        )}
                      </div>
                    )}

                    <a href={isOutOfStock ? undefined : whatsappHref} onClick={(e) => !isOutOfStock && handleWhatsAppRedirect(e, whatsappHref)} target={isOutOfStock ? undefined : "_blank"} rel="noopener noreferrer"
                      style={{ flex: "1.2 1 180px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "15px 20px", borderRadius: "14px", background: isOutOfStock ? t.border : "#25d366", color: isOutOfStock ? t.textSecondary : "#fff", fontWeight: 900, fontSize: "15px", textDecoration: "none", cursor: isOutOfStock ? "not-allowed" : "pointer", boxShadow: isOutOfStock ? "none" : "0 6px 20px rgba(37,211,102,0.35)", pointerEvents: isOutOfStock ? "none" : "auto" }}>
                      <WhatsAppIcon />{isOutOfStock ? "Out of Stock" : "Buy on WhatsApp"}
                    </a>
                  </div>

                  {cartState.totalQuantity > 0 && (
                    <Link href={`/store/${slug}`} style={{ fontSize: "13px", fontWeight: 800, color: t.accent, textAlign: "center", textDecoration: "none", padding: "6px" }}>
                      🛒 View Storefront Cart ({cartState.totalQuantity} items — {formatPrice(cartState.totalPrice, currency)}) →
                    </Link>
                  )}
                </div>
              ) : (
                <div style={{ padding: "14px 20px", borderRadius: "12px", background: t.card, fontSize: "13px", color: t.textSecondary, textAlign: "center", border: `1px solid ${t.border}` }}>Contact seller to enquire</div>
              )}

              {/* Tags */}
              {product.tags?.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {product.tags.map(tag => <span key={tag} style={{ padding: "4px 10px", borderRadius: "999px", background: t.card, color: t.textSecondary, fontSize: "11px", fontWeight: 700, border: `1px solid ${t.border}` }}>#{tag}</span>)}
                </div>
              )}
            </div>
          </div>

          <RelatedProducts products={allProducts} currentId={product._id} store={store} slug={slug} sessionToken={sessionToken} theme={t} />
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
          {/* Menu / Back to Store */}
          <Link href={storeHref} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2px", color: t.textSecondary, textDecoration: "none", fontSize: "10px", fontWeight: 700 }}>
            <MenuIcon />
            <span>Menu</span>
          </Link>

          {/* Store Tab */}
          <Link href={storeHref} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2px", color: t.textSecondary, textDecoration: "none", fontSize: "10px", fontWeight: 700 }}>
            <span style={{ fontSize: "18px", lineHeight: 1 }}>🏪</span>
            <span>Store</span>
          </Link>

          {/* Cart Tab */}
          <Link href={storeHref} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2px", color: t.textSecondary, textDecoration: "none", fontSize: "10px", fontWeight: 700, position: "relative" }}>
            <ShoppingBagIcon />
            <span>Cart</span>
            {cartState.totalQuantity > 0 && (
              <span style={{ position: "absolute", top: "-4px", right: "6px", background: "#ef4444", color: "#fff", padding: "1px 5px", borderRadius: "999px", fontSize: "9px", fontWeight: 900 }}>
                {cartState.totalQuantity}
              </span>
            )}
          </Link>

          {/* WhatsApp Chat Tab */}
          {store.whatsappHref && (
            <a href={whatsappHref || store.whatsappHref} onClick={(e) => handleWhatsAppRedirect(e, whatsappHref || store.whatsappHref)} target="_blank" rel="noopener noreferrer" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2px", color: "#25d366", textDecoration: "none", fontSize: "10px", fontWeight: 800 }}>
              <WhatsAppIcon />
              <span>Chat & Buy</span>
            </a>
          )}
        </div>

        <Pax26Footer />
      </div>
      <style>{`
        @media (min-width: 640px) {
          .sf-mobile-bottom-bar { display: none !important; }
        }
        @media (max-width: 639px) {
          .sf-top-navbar { display: none !important; }
          .sf-mobile-bottom-bar { display: flex !important; }
          .sf-desktop-chat-btn { display: none !important; }
        }
      `}</style>
    </>
  );
}
