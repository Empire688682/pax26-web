"use client";

import { useState } from "react";
import Link from "next/link";
import { formatPrice } from "@/app/lib/currency/currencyHelper";
import { getTheme } from "@/app/lib/store/storeThemes";

/* ── Icons ──────────────────────────────────────────────── */
const WhatsAppIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>);
const ChevronLeft = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>);
const PackageIcon = () => (<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>);
const TruckIcon = () => (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>);
const MapPinIcon = () => (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>);
const EditIcon = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>);
const ZapIcon = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>);

function OwnerBanner() {
  return (
    <div style={{ position: "sticky", top: 0, zIndex: 100, background: "#1a1a1a", color: "#fff", padding: "10px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px", fontSize: "13px", fontWeight: 600 }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span style={{ background: "#22c55e", borderRadius: "4px", padding: "2px 8px", fontSize: "10px", fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase" }}>Preview Mode</span>
        <span style={{ opacity: 0.75 }}>Product detail view</span>
      </div>
      <a href="/dashboard/automations/ai-business-dashboard" style={{ display: "flex", alignItems: "center", gap: "6px", padding: "6px 14px", borderRadius: "8px", background: "#fff", color: "#1a1a1a", textDecoration: "none", fontSize: "12px", fontWeight: 700 }}>
        <EditIcon /> Edit Store
      </a>
    </div>
  );
}

function Pax26Footer() {
  return (
    <div style={{ background: "linear-gradient(135deg, #0f0f13 0%, #1a1a28 100%)", borderTop: "1px solid #2a2a3a", padding: "20px 24px" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", flexShrink: 0 }}><ZapIcon /></div>
          <div>
            <p style={{ margin: 0, fontSize: "13px", fontWeight: 800, color: "#fff" }}>Powered by <span style={{ color: "#818cf8" }}>Pax26</span></p>
            <p style={{ margin: 0, fontSize: "11px", color: "#6b7280" }}>AI-powered WhatsApp storefront — free for every business</p>
          </div>
        </div>
        <a href="https://pax26.com" target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 18px", borderRadius: "10px", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "#fff", fontWeight: 700, fontSize: "12px", textDecoration: "none", whiteSpace: "nowrap", boxShadow: "0 4px 14px #6366f140" }}>
          Create your free store →
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
    <section style={{ marginTop: "48px" }}>
      <h2 style={{ fontSize: "18px", fontWeight: 800, color: t.textPrimary, margin: "0 0 20px" }}>More from this store</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "16px" }}>
        {related.map(p => {
          const displayPrice = p.discountPrice || p.price;
          const href = `/store/${slug}/${p.slug || p._id}${sessionToken ? `?session=${sessionToken}` : ""}`;
          return (
            <Link key={p._id} href={href} style={{ textDecoration: "none" }}>
              <div style={{ background: t.card, borderRadius: "14px", overflow: "hidden", border: `1px solid ${t.border}`, transition: "transform 0.15s, box-shadow 0.15s" }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.1)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}>
                <div style={{ paddingTop: "80%", position: "relative", background: t.pageBg }}>
                  {p.images?.[0]?.url ? <img src={p.images[0].url} alt={p.name} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} /> : <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: t.textSecondary, opacity: 0.3 }}><PackageIcon /></div>}
                </div>
                <div style={{ padding: "10px 12px" }}>
                  <p style={{ margin: "0 0 4px", fontSize: "13px", fontWeight: 700, color: t.textPrimary, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</p>
                  <p style={{ margin: 0, fontSize: "13px", fontWeight: 800, color: t.textPrimary }}>{formatPrice(displayPrice, currency)}</p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function buildWhatsAppMessage(product, selectedVariants, currency) {
  const price = product.discountPrice || product.price;
  let text = `Hi! I'm interested in *${product.name}*`;
  const variantParts = Object.entries(selectedVariants).map(([label, value]) => `${label}: ${value}`).filter(Boolean);
  if (variantParts.length > 0) text += ` (${variantParts.join(", ")})`;
  text += ` — priced at ${formatPrice(price, currency)}. Could you assist me with this?`;
  return encodeURIComponent(text);
}

export default function ProductDetailPage({ store, product, allProducts, slug, isPreview, sessionToken }) {
  const theme = getTheme(store.storeTheme);
  const t = theme;

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedVariants, setSelectedVariants] = useState({});
  const [imgError, setImgError] = useState(false);

  const currency = store.currency || "NGN";
  const displayPrice = product.discountPrice || product.price;
  const hasDiscount = !!(product.discountPrice && product.discountPrice < product.price);
  const isOutOfStock = product.stock === 0;
  const images = product.images || [];

  const whatsappMessage = buildWhatsAppMessage(product, selectedVariants, currency);
  const whatsappHref = store.whatsappHref ? `${store.whatsappHref}?text=${whatsappMessage}` : null;
  const storeHref = `/store/${slug}${sessionToken ? `?session=${sessionToken}` : ""}`;

  return (
    <>
      {isPreview && <OwnerBanner />}
      <div style={{ minHeight: "100vh", background: t.pageBg, fontFamily: "system-ui, -apple-system, sans-serif" }}>

        {/* Nav — full branded bar matching storefront */}
        <nav style={{ background: t.navBg, borderBottom: `1px solid ${t.border}`, position: "sticky", top: isPreview ? "41px" : 0, zIndex: 50 }}>
          <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 16px" }}>
            {/* Main bar: logo + name + WhatsApp */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: "60px", gap: "12px" }}>
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
                <a href={store.whatsappHref} target="_blank" rel="noopener noreferrer"
                  style={{ display: "flex", alignItems: "center", gap: "7px", padding: "9px 16px", borderRadius: "10px", background: "#25d366", color: "#fff", fontWeight: 700, fontSize: "13px", textDecoration: "none", whiteSpace: "nowrap", boxShadow: "0 2px 10px #25d36640" }}>
                  <WhatsAppIcon /> Chat
                </a>
              )}
            </div>
            {/* Breadcrumb sub-bar */}
            <div style={{ display: "flex", alignItems: "center", gap: "6px", paddingBottom: "10px", fontSize: "12px", color: t.textSecondary }}>
              <Link href={storeHref} style={{ color: t.textSecondary, textDecoration: "none", fontWeight: 600 }}><ChevronLeft /> All products</Link>
              <span style={{ color: t.border }}>·</span>
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "200px" }}>{product.name}</span>
            </div>
          </div>
        </nav>

        {/* Content */}
        <main style={{ maxWidth: "1100px", margin: "0 auto", padding: "28px 16px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "40px", alignItems: "start" }}>

            {/* Images */}
            <div>
              <div style={{ borderRadius: "20px", overflow: "hidden", background: t.pageBg, aspectRatio: "1", position: "relative", border: `1px solid ${t.border}` }}>
                {images[activeImageIndex]?.url && !imgError ? (
                  <img src={images[activeImageIndex].url} alt={product.name} onError={() => setImgError(true)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: t.textSecondary, opacity: 0.3 }}><PackageIcon /></div>
                )}
                {isOutOfStock && <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ background: "#fff", color: "#111", padding: "8px 20px", borderRadius: "8px", fontWeight: 900, fontSize: "14px" }}>SOLD OUT</span></div>}
              </div>
              {images.length > 1 && (
                <div style={{ display: "flex", gap: "8px", marginTop: "12px", flexWrap: "wrap" }}>
                  {images.map((img, i) => (
                    <button key={i} onClick={() => setActiveImageIndex(i)} style={{ width: "64px", height: "64px", borderRadius: "10px", overflow: "hidden", cursor: "pointer", border: i === activeImageIndex ? `2px solid ${t.accent}` : `2px solid transparent`, padding: 0, background: t.pageBg, flexShrink: 0 }}>
                      <img src={img.url} alt={`Thumbnail ${i + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info */}
            <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              {product.category && <span style={{ fontSize: "11px", fontWeight: 700, color: t.textSecondary, textTransform: "uppercase", letterSpacing: "0.1em" }}>{product.category}</span>}
              <h1 style={{ margin: 0, fontSize: "clamp(22px, 4vw, 28px)", fontWeight: 900, color: t.textPrimary, letterSpacing: "-0.02em", lineHeight: 1.25 }}>{product.name}</h1>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span style={{ fontSize: "28px", fontWeight: 900, color: t.textPrimary }}>{formatPrice(displayPrice, currency)}</span>
                {hasDiscount && <span style={{ fontSize: "18px", color: t.textSecondary, textDecoration: "line-through" }}>{formatPrice(product.price, currency)}</span>}
                {hasDiscount && <span style={{ background: "#fef2f2", color: "#ef4444", padding: "4px 10px", borderRadius: "8px", fontSize: "12px", fontWeight: 800 }}>SALE</span>}
              </div>
              {product.description && <p style={{ margin: 0, fontSize: "15px", color: t.textSecondary, lineHeight: 1.7 }}>{product.description}</p>}

              {/* Variants */}
              {product.variants?.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  {product.variants.map((variant, vi) => (
                    <div key={vi}>
                      <p style={{ margin: "0 0 8px", fontSize: "13px", fontWeight: 700, color: t.textPrimary }}>{variant.label}{selectedVariants[variant.label] && <span style={{ fontWeight: 500, color: t.textSecondary, marginLeft: "6px" }}>— {selectedVariants[variant.label]}</span>}</p>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                        {variant.options?.map((opt, oi) => {
                          const isSelected = selectedVariants[variant.label] === opt.value;
                          return (
                            <button key={oi} onClick={() => opt.stock !== 0 && setSelectedVariants(v => ({ ...v, [variant.label]: opt.value }))} disabled={opt.stock === 0}
                              style={{ padding: "8px 16px", borderRadius: "8px", border: isSelected ? `2px solid ${t.accent}` : `1.5px solid ${t.border}`, background: isSelected ? t.accent : t.card, color: isSelected ? t.accentText : opt.stock === 0 ? t.textSecondary : t.textPrimary, fontSize: "13px", fontWeight: 600, cursor: opt.stock === 0 ? "not-allowed" : "pointer", textDecoration: opt.stock === 0 ? "line-through" : "none" }}>
                              {opt.value}{opt.priceAdjustment > 0 && <span style={{ fontSize: "10px", marginLeft: "4px", opacity: 0.7 }}>+{formatPrice(opt.priceAdjustment, currency)}</span>}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Delivery */}
              {product.isPhysical && (product.deliveryFee || product.deliveryTimeFrame || product.locationNotes) && (
                <div style={{ background: t.pageBg, borderRadius: "14px", padding: "14px", display: "flex", flexDirection: "column", gap: "8px", border: `1px solid ${t.border}` }}>
                  <p style={{ margin: 0, fontSize: "12px", fontWeight: 800, color: t.textSecondary, textTransform: "uppercase", letterSpacing: "0.08em" }}>Delivery</p>
                  {product.deliveryFee != null && <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: t.textPrimary }}><TruckIcon />{product.deliveryFee === 0 ? "Free delivery" : formatPrice(product.deliveryFee, currency)}{product.deliveryTimeFrame && ` · ${product.deliveryTimeFrame}`}</div>}
                  {product.locationNotes && <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: t.textPrimary }}><MapPinIcon />{product.locationNotes}</div>}
                </div>
              )}

              {/* Stock warning */}
              {!isOutOfStock && product.stock > 0 && product.stock <= 10 && <p style={{ margin: 0, fontSize: "13px", color: "#f59e0b", fontWeight: 700 }}>⚡ Only {product.stock} left</p>}

              {/* CTA */}
              {whatsappHref ? (
                <a href={isOutOfStock ? undefined : whatsappHref} target={isOutOfStock ? undefined : "_blank"} rel="noopener noreferrer"
                  style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", padding: "16px 24px", borderRadius: "14px", background: isOutOfStock ? t.border : "#25d366", color: isOutOfStock ? t.textSecondary : "#fff", fontWeight: 800, fontSize: "16px", textDecoration: "none", cursor: isOutOfStock ? "not-allowed" : "pointer", boxShadow: isOutOfStock ? "none" : "0 6px 20px #25d36640", pointerEvents: isOutOfStock ? "none" : "auto" }}>
                  <WhatsAppIcon />{isOutOfStock ? "Out of Stock" : "Chat about this product"}
                </a>
              ) : (
                <div style={{ padding: "14px 20px", borderRadius: "12px", background: t.pageBg, fontSize: "14px", color: t.textSecondary, textAlign: "center", border: `1px solid ${t.border}` }}>Contact the seller to enquire</div>
              )}

              {/* Tags */}
              {product.tags?.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {product.tags.map(tag => <span key={tag} style={{ padding: "4px 10px", borderRadius: "999px", background: t.pageBg, color: t.textSecondary, fontSize: "11px", fontWeight: 600, border: `1px solid ${t.border}` }}>{tag}</span>)}
                </div>
              )}
            </div>
          </div>

          <RelatedProducts products={allProducts} currentId={product._id} store={store} slug={slug} sessionToken={sessionToken} theme={t} />
        </main>

        <Pax26Footer />
      </div>
    </>
  );
}
