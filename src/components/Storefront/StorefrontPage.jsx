"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { formatPrice } from "@/app/lib/currency/currencyHelper";
import { getTheme } from "@/app/lib/store/storeThemes";

/* ─── Icons ─────────────────────────────────────────────────── */
const SearchIcon = ({ size = 16 }) => (
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
    <circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/>
    <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
  </svg>
);
const PlusIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);
const MinusIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);
const ClockIcon = ({ size = 12 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);
const MapPinIcon = ({ size = 12 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
  </svg>
);
const PackageIcon = ({ size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
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
const ChevronDownIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"/>
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

/* ─── Owner Preview Banner ───────────────────────────────────── */
function OwnerBanner() {
  return (
    <div style={{
      position: "sticky", top: 0, zIndex: 200,
      background: "#111", color: "#fff",
      padding: "8px 20px",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      fontSize: "12px",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span style={{ background: "#22c55e", borderRadius: "4px", padding: "2px 8px", fontSize: "9px", fontWeight: 800, letterSpacing: "0.1em" }}>
          PREVIEW
        </span>
        <span style={{ opacity: 0.55, fontSize: "11px" }}>Customers see exactly this</span>
      </div>
      <a href="/dashboard/automations/ai-business-dashboard"
        style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: "5px 14px", borderRadius: "6px", background: "#fff", color: "#111", textDecoration: "none", fontSize: "11px", fontWeight: 700 }}>
        <EditIcon /> Edit Store
      </a>
    </div>
  );
}

/* ─── NAV ────────────────────────────────────────────────────── */
function StoreNav({ store, slug, theme: t, totalCartItems, onCartOpen, search, setSearch, searching, searchExpanded, setSearchExpanded, mobileSearchRef, clearSearch }) {
  return (
    <nav style={{
      position: "sticky", top: 0, zIndex: 100,
      background: t.navBg,
      borderBottom: `1px solid ${t.border}`,
      backdropFilter: "blur(12px)",
    }}>
      <div style={{
        maxWidth: "1200px", margin: "0 auto",
        padding: "0 16px", height: "52px",
        display: "flex", alignItems: "center", gap: "12px",
      }}>
        {/* Identity */}
        <Link href={`/store/${slug}`} style={{ display: "flex", alignItems: "center", gap: "9px", textDecoration: "none", flexShrink: 0, minWidth: 0 }}>
          {store.logoUrl ? (
            <img src={store.logoUrl} alt={store.businessName}
              style={{ width: "28px", height: "28px", borderRadius: "7px", objectFit: "cover", flexShrink: 0 }} />
          ) : (
            <div style={{
              width: "28px", height: "28px", borderRadius: "7px",
              background: t.accent, color: t.accentText,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 900, fontSize: "13px", flexShrink: 0,
            }}>
              {store.businessName?.charAt(0)?.toUpperCase()}
            </div>
          )}
          <span style={{
            fontSize: "14px", fontWeight: 800, color: t.textPrimary,
            letterSpacing: "-0.02em", whiteSpace: "nowrap",
            overflow: "hidden", textOverflow: "ellipsis", maxWidth: "150px",
          }}>
            {store.businessName}
          </span>
        </Link>

        {/* Desktop search */}
        <div className="pax-search-desktop" style={{
          flex: 1, display: "flex", alignItems: "center", gap: "8px",
          background: t.card, border: `1px solid ${t.border}`,
          borderRadius: "8px", padding: "7px 12px",
          maxWidth: "360px", margin: "0 auto",
        }}>
          <span style={{ color: t.textSecondary, flexShrink: 0, display: "flex" }}>
            {searching
              ? <div style={{ width: "14px", height: "14px", border: `2px solid ${t.border}`, borderTopColor: t.accent, borderRadius: "50%", animation: "pax-spin 0.7s linear infinite" }} />
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

        {/* Spacer mobile */}
        <div className="pax-spacer" style={{ flex: 1 }} />

        {/* Right actions */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
          {/* Mobile search toggle */}
          <button
            className="pax-search-btn"
            onClick={() => setSearchExpanded(v => !v)}
            style={{
              width: "36px", height: "36px", borderRadius: "8px",
              border: `1px solid ${t.border}`, background: "transparent",
              color: t.textSecondary, cursor: "pointer",
              display: "none", alignItems: "center", justifyContent: "center",
            }}>
            {searchExpanded ? <XIcon /> : <SearchIcon />}
          </button>

          {/* Cart */}
          <button onClick={onCartOpen} style={{
            position: "relative", width: "36px", height: "36px", borderRadius: "8px",
            border: `1px solid ${t.border}`, background: t.card,
            color: t.textPrimary, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <CartIcon size={16} />
            {totalCartItems > 0 && (
              <span className="pax-cart-badge" style={{
                position: "absolute", top: "-5px", right: "-5px",
                background: t.accent, color: t.accentText,
                borderRadius: "999px", fontSize: "8px", fontWeight: 800,
                padding: "1px 5px", minWidth: "15px", textAlign: "center",
              }}>
                {totalCartItems}
              </span>
            )}
          </button>

          {/* WhatsApp */}
          {store.whatsappHref && (
            <a href={store.whatsappHref} target="_blank" rel="noopener noreferrer"
              style={{
                display: "inline-flex", alignItems: "center", gap: "6px",
                padding: "8px 14px", borderRadius: "8px",
                background: "#25D366", color: "#fff",
                fontWeight: 700, fontSize: "12px", textDecoration: "none", whiteSpace: "nowrap",
              }}>
              <WhatsAppIcon size={13} />
              <span className="pax-wa-text">Chat</span>
            </a>
          )}
        </div>
      </div>

      {/* Mobile expandable search */}
      {searchExpanded && (
        <div style={{ background: t.navBg, borderTop: `1px solid ${t.border}`, padding: "8px 16px" }}>
          <div style={{
            display: "flex", alignItems: "center", gap: "8px",
            background: t.card, border: `1px solid ${t.border}`,
            borderRadius: "8px", padding: "7px 12px",
          }}>
            <span style={{ color: t.textSecondary, display: "flex", flexShrink: 0 }}>
              {searching
                ? <div style={{ width: "14px", height: "14px", border: `2px solid ${t.border}`, borderTopColor: t.accent, borderRadius: "50%", animation: "pax-spin 0.7s linear infinite" }} />
                : <SearchIcon />}
            </span>
            <input
              ref={mobileSearchRef}
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search products…"
              style={{ flex: 1, background: "none", border: "none", outline: "none", fontSize: "13px", color: t.textPrimary, fontFamily: "inherit" }}
            />
            <button onClick={() => { setSearch(""); clearSearch(); setSearchExpanded(false); }}
              style={{ background: "none", border: "none", cursor: "pointer", color: t.textSecondary, fontSize: "12px", padding: "0 0 0 4px", whiteSpace: "nowrap", fontFamily: "inherit" }}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}

/* ─── HERO ───────────────────────────────────────────────────── */
function StoreHero({ store, theme: t, onBrowse }) {
  const hasMeta = store.workingHours || store.liveLocation;
  const hasSales = store.totalSalesCount > 0;
  const desc = store.businessDescription || store.description || null;

  return (
    <section style={{
      background: t.navBg,
      borderBottom: `1px solid ${t.border}`,
      padding: "40px 16px 36px",
    }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>

        {/* Trust / meta row */}
        {(hasMeta || hasSales) && (
          <div style={{
            display: "flex", alignItems: "center", flexWrap: "wrap",
            gap: "16px", marginBottom: "20px",
          }}>
            {hasSales && (
              <span style={{
                display: "inline-flex", alignItems: "center", gap: "5px",
                fontSize: "11px", fontWeight: 700, color: t.textSecondary,
                letterSpacing: "0.04em",
              }}>
                <span style={{
                  width: "6px", height: "6px", borderRadius: "50%",
                  background: "#16A34A", display: "inline-block",
                }} />
                {store.totalSalesCount.toLocaleString()} sold
              </span>
            )}
            {store.workingHours && (
              <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "11px", color: t.textSecondary }}>
                <ClockIcon /> {store.workingHours}
              </span>
            )}
            {store.liveLocation && (
              <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "11px", color: t.textSecondary }}>
                <MapPinIcon /> {store.liveLocation}
              </span>
            )}
          </div>
        )}

        {/* Store identity */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: "16px", marginBottom: "12px" }}>
          {store.logoUrl ? (
            <img src={store.logoUrl} alt={store.businessName}
              style={{ width: "52px", height: "52px", borderRadius: "12px", objectFit: "cover", flexShrink: 0, marginTop: "2px" }} />
          ) : null}
          <div style={{ minWidth: 0 }}>
            <h1 style={{
              margin: 0, color: t.textPrimary,
              fontSize: "clamp(24px, 6vw, 36px)",
              fontWeight: 900, letterSpacing: "-0.03em", lineHeight: 1.1,
            }}>
              {store.businessName}
            </h1>
            {desc && (
              <p style={{
                margin: "8px 0 0", color: t.textSecondary,
                fontSize: "14px", lineHeight: 1.6,
                maxWidth: "520px",
              }}>
                {desc}
              </p>
            )}
          </div>
        </div>

        {/* CTA row */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "24px", flexWrap: "wrap" }}>
          {store.whatsappHref && (
            <a href={store.whatsappHref} target="_blank" rel="noopener noreferrer"
              style={{
                display: "inline-flex", alignItems: "center", gap: "8px",
                padding: "12px 22px", borderRadius: "10px",
                background: "#25D366", color: "#fff",
                fontWeight: 700, fontSize: "14px", textDecoration: "none",
              }}>
              <WhatsAppIcon size={16} /> Chat with us
            </a>
          )}
          <button onClick={onBrowse} style={{
            display: "inline-flex", alignItems: "center", gap: "6px",
            padding: "12px 20px", borderRadius: "10px",
            background: "transparent", color: t.textPrimary,
            border: `1px solid ${t.border}`,
            fontWeight: 600, fontSize: "14px", cursor: "pointer", fontFamily: "inherit",
          }}>
            Browse products <ChevronDownIcon />
          </button>
        </div>
      </div>
    </section>
  );
}

/* ─── CATEGORY RAIL ──────────────────────────────────────────── */
function CategoryRail({ categories, categoryCounts, active, onChange, topOffset, theme: t }) {
  return (
    <div style={{
      position: "sticky", top: `${topOffset}px`, zIndex: 80,
      background: t.navBg,
      borderBottom: `1px solid ${t.border}`,
      overflowX: "auto", scrollbarWidth: "none",
    }}>
      <div style={{
        display: "flex", gap: "4px",
        padding: "10px 16px",
        maxWidth: "1200px", margin: "0 auto", whiteSpace: "nowrap",
      }}>
        {["all", ...categories].map(cat => {
          const isActive = active === cat;
          const count = cat === "all" ? null : categoryCounts[cat];
          return (
            <button key={cat} onClick={() => onChange(cat)} style={{
              padding: "7px 14px", borderRadius: "999px", cursor: "pointer",
              border: isActive ? "none" : `1px solid ${t.border}`,
              background: isActive ? t.accent : "transparent",
              color: isActive ? t.accentText : t.textSecondary,
              fontSize: "12px", fontWeight: isActive ? 700 : 500,
              transition: "all 0.15s ease",
              whiteSpace: "nowrap", flexShrink: 0,
              fontFamily: "inherit",
            }}>
              {cat === "all" ? "All" : cat}
              {count && <span style={{ opacity: 0.6, marginLeft: "4px" }}>({count})</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ─── PRODUCT CARD — STANDARD ────────────────────────────────── */
function ProductCard({ product, store, slug, sessionToken, theme: t, highlighted, cartQuantity, onAddToCart, onUpdateQty }) {
  const [imgError, setImgError] = useState(false);
  const [hovered, setHovered] = useState(false);
  const currency = store.currency || "NGN";
  const displayPrice = product.discountPrice || product.price;
  const hasDiscount = !!(product.discountPrice && product.discountPrice < product.price);
  const outOfStock = product.stock === 0;
  const productHref = `/store/${slug}/${product.slug || product._id}${sessionToken ? `?session=${sessionToken}` : ""}`;
  const discountPct = hasDiscount ? Math.round((1 - product.discountPrice / product.price) * 100) : 0;

  return (
    <article
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: t.card,
        borderRadius: "10px",
        overflow: "hidden",
        border: cartQuantity > 0
          ? `1.5px solid ${t.accent}`
          : `1px solid ${t.border}`,
        display: "flex", flexDirection: "column",
        position: "relative",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        transform: hovered ? "translateY(-2px)" : "none",
        boxShadow: hovered ? "0 8px 24px rgba(0,0,0,0.1)" : "none",
      }}>

      {/* Image */}
      <Link href={productHref} style={{ display: "block", textDecoration: "none", position: "relative", overflow: "hidden" }}>
        <div style={{ paddingTop: "100%", position: "relative", background: t.pageBg }}>
          {product.images?.[0]?.url && !imgError ? (
            <img
              src={product.images[0].url}
              alt={product.name}
              onError={() => setImgError(true)}
              style={{
                position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover",
                transition: "transform 0.25s ease",
                transform: hovered ? "scale(1.04)" : "scale(1)",
              }}
            />
          ) : (
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: t.textSecondary, opacity: 0.15 }}>
              <PackageIcon size={32} />
            </div>
          )}

          {/* Badge stack */}
          <div style={{ position: "absolute", top: "8px", left: "8px", display: "flex", flexDirection: "column", gap: "4px", zIndex: 3 }}>
            {outOfStock && (
              <span style={{ background: "rgba(0,0,0,0.75)", color: "#fff", fontSize: "9px", fontWeight: 800, letterSpacing: "0.08em", padding: "3px 8px", borderRadius: "5px" }}>
                SOLD OUT
              </span>
            )}
            {highlighted && !outOfStock && (
              <span style={{ background: t.accent, color: t.accentText, fontSize: "9px", fontWeight: 800, letterSpacing: "0.06em", padding: "3px 8px", borderRadius: "5px" }}>
                ✦ AI PICK
              </span>
            )}
            {hasDiscount && !outOfStock && !highlighted && (
              <span style={{ background: "#EF4444", color: "#fff", fontSize: "9px", fontWeight: 800, padding: "3px 8px", borderRadius: "5px" }}>
                -{discountPct}%
              </span>
            )}
          </div>

          {/* Cart qty badge */}
          {cartQuantity > 0 && (
            <div style={{
              position: "absolute", top: "8px", right: "8px", zIndex: 3,
              background: t.accent, color: t.accentText,
              fontSize: "9px", fontWeight: 800,
              padding: "3px 9px", borderRadius: "5px",
            }}>
              {cartQuantity} IN CART
            </div>
          )}

          {/* Sold-out dim */}
          {outOfStock && (
            <div style={{ position: "absolute", inset: 0, background: "rgba(255,255,255,0.45)", zIndex: 2 }} />
          )}
        </div>
      </Link>

      {/* Info strip */}
      <div style={{
        padding: "10px 12px",
        display: "flex", alignItems: "center", gap: "8px",
        borderTop: `1px solid ${t.border}`,
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            margin: 0, fontSize: "13px", fontWeight: 700, color: t.textPrimary,
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
            lineHeight: 1.2,
          }}>
            {product.name}
          </p>
          <div style={{ display: "flex", alignItems: "baseline", gap: "5px", marginTop: "3px" }}>
            <span style={{ fontSize: "15px", fontWeight: 900, color: t.textPrimary, letterSpacing: "-0.02em" }}>
              {formatPrice(displayPrice, currency)}
            </span>
            {hasDiscount && (
              <span style={{ fontSize: "11px", color: t.textSecondary, textDecoration: "line-through" }}>
                {formatPrice(product.price, currency)}
              </span>
            )}
          </div>
        </div>

        {/* Cart action — inline, right side */}
        {cartQuantity > 0 ? (
          <div style={{
            display: "flex", alignItems: "center", gap: "0",
            border: `1.5px solid ${t.accent}`, borderRadius: "8px",
            overflow: "hidden", flexShrink: 0,
          }}>
            <button
              onClick={e => { e.stopPropagation(); e.preventDefault(); onUpdateQty(product._id, cartQuantity - 1); }}
              style={{ width: "30px", height: "30px", background: "transparent", border: "none", color: t.accent, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "inherit" }}>
              <MinusIcon />
            </button>
            <span style={{ width: "22px", textAlign: "center", fontSize: "12px", fontWeight: 800, color: t.accent }}>
              {cartQuantity}
            </span>
            <button
              onClick={e => { e.stopPropagation(); e.preventDefault(); onAddToCart(product); }}
              style={{ width: "30px", height: "30px", background: t.accent, border: "none", color: t.accentText, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "inherit" }}>
              <PlusIcon />
            </button>
          </div>
        ) : (
          <button
            onClick={() => !outOfStock && onAddToCart(product)}
            disabled={outOfStock}
            style={{
              width: "32px", height: "32px", borderRadius: "8px",
              border: outOfStock ? `1px solid ${t.border}` : "none",
              background: outOfStock ? "transparent" : t.accent,
              color: outOfStock ? t.textSecondary : t.accentText,
              cursor: outOfStock ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
              opacity: outOfStock ? 0.4 : 1,
              transition: "transform 0.1s ease",
              fontFamily: "inherit",
            }}>
            <PlusIcon size={15} />
          </button>
        )}
      </div>
    </article>
  );
}

/* ─── HERO PRODUCT CARD (first product / featured) ───────────── */
function HeroProductCard({ product, store, slug, sessionToken, theme: t, highlighted, cartQuantity, onAddToCart, onUpdateQty }) {
  const [imgError, setImgError] = useState(false);
  const [hovered, setHovered] = useState(false);
  const currency = store.currency || "NGN";
  const displayPrice = product.discountPrice || product.price;
  const hasDiscount = !!(product.discountPrice && product.discountPrice < product.price);
  const outOfStock = product.stock === 0;
  const productHref = `/store/${slug}/${product.slug || product._id}${sessionToken ? `?session=${sessionToken}` : ""}`;
  const discountPct = hasDiscount ? Math.round((1 - product.discountPrice / product.price) * 100) : 0;

  return (
    <article
      className="pax-hero-card"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: t.card,
        borderRadius: "12px",
        overflow: "hidden",
        border: cartQuantity > 0 ? `1.5px solid ${t.accent}` : `1px solid ${t.border}`,
        display: "flex",
        flexDirection: "column",
        position: "relative",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        transform: hovered ? "translateY(-2px)" : "none",
        boxShadow: hovered ? "0 12px 32px rgba(0,0,0,0.12)" : "0 2px 8px rgba(0,0,0,0.04)",
      }}>

      {/* Image — taller for hero */}
      <Link href={productHref} style={{ display: "block", textDecoration: "none", overflow: "hidden" }}>
        <div className="pax-hero-img" style={{ position: "relative", background: t.pageBg }}>
          {product.images?.[0]?.url && !imgError ? (
            <img
              src={product.images[0].url}
              alt={product.name}
              onError={() => setImgError(true)}
              style={{
                width: "100%", height: "100%", objectFit: "cover",
                transition: "transform 0.3s ease",
                transform: hovered ? "scale(1.03)" : "scale(1)",
              }}
            />
          ) : (
            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: t.textSecondary, opacity: 0.1 }}>
              <PackageIcon size={48} />
            </div>
          )}

          {/* Badges */}
          <div style={{ position: "absolute", top: "12px", left: "12px", display: "flex", flexDirection: "column", gap: "5px", zIndex: 3 }}>
            {highlighted && !outOfStock && (
              <span style={{ background: t.accent, color: t.accentText, fontSize: "10px", fontWeight: 800, letterSpacing: "0.06em", padding: "4px 10px", borderRadius: "6px" }}>
                ✦ AI PICK
              </span>
            )}
            {hasDiscount && !outOfStock && (
              <span style={{ background: "#EF4444", color: "#fff", fontSize: "10px", fontWeight: 800, padding: "4px 10px", borderRadius: "6px" }}>
                -{discountPct}% OFF
              </span>
            )}
            {outOfStock && (
              <span style={{ background: "rgba(0,0,0,0.72)", color: "#fff", fontSize: "10px", fontWeight: 800, letterSpacing: "0.08em", padding: "4px 10px", borderRadius: "6px" }}>
                SOLD OUT
              </span>
            )}
          </div>

          {cartQuantity > 0 && (
            <div style={{
              position: "absolute", top: "12px", right: "12px", zIndex: 3,
              background: t.accent, color: t.accentText,
              fontSize: "10px", fontWeight: 800,
              padding: "4px 10px", borderRadius: "6px",
            }}>
              {cartQuantity} IN CART
            </div>
          )}

          {outOfStock && (
            <div style={{ position: "absolute", inset: 0, background: "rgba(255,255,255,0.4)", zIndex: 2 }} />
          )}
        </div>
      </Link>

      {/* Info row — horizontal layout for hero */}
      <div style={{
        padding: "16px 18px",
        borderTop: `1px solid ${t.border}`,
        display: "flex", alignItems: "center", gap: "12px",
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          {product.category && (
            <p style={{ margin: "0 0 3px", fontSize: "10px", fontWeight: 700, color: t.textSecondary, textTransform: "uppercase", letterSpacing: "0.1em" }}>
              {product.category}
            </p>
          )}
          <Link href={productHref} style={{ textDecoration: "none" }}>
            <p style={{
              margin: 0, fontSize: "17px", fontWeight: 800, color: t.textPrimary,
              letterSpacing: "-0.01em", lineHeight: 1.2,
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>
              {product.name}
            </p>
          </Link>
          <div style={{ display: "flex", alignItems: "baseline", gap: "7px", marginTop: "5px" }}>
            <span style={{ fontSize: "20px", fontWeight: 900, color: t.textPrimary, letterSpacing: "-0.02em" }}>
              {formatPrice(displayPrice, currency)}
            </span>
            {hasDiscount && (
              <span style={{ fontSize: "13px", color: t.textSecondary, textDecoration: "line-through" }}>
                {formatPrice(product.price, currency)}
              </span>
            )}
          </div>
        </div>

        {/* Cart control */}
        {cartQuantity > 0 ? (
          <div style={{
            display: "flex", alignItems: "center",
            border: `1.5px solid ${t.accent}`, borderRadius: "10px",
            overflow: "hidden", flexShrink: 0,
          }}>
            <button
              onClick={e => { e.stopPropagation(); e.preventDefault(); onUpdateQty(product._id, cartQuantity - 1); }}
              style={{ width: "36px", height: "36px", background: "transparent", border: "none", color: t.accent, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "inherit" }}>
              <MinusIcon />
            </button>
            <span style={{ width: "26px", textAlign: "center", fontSize: "13px", fontWeight: 800, color: t.accent }}>
              {cartQuantity}
            </span>
            <button
              onClick={e => { e.stopPropagation(); e.preventDefault(); onAddToCart(product); }}
              style={{ width: "36px", height: "36px", background: t.accent, border: "none", color: t.accentText, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "inherit" }}>
              <PlusIcon size={16} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => !outOfStock && onAddToCart(product)}
            disabled={outOfStock}
            style={{
              padding: "10px 20px", borderRadius: "10px",
              border: outOfStock ? `1px solid ${t.border}` : "none",
              background: outOfStock ? "transparent" : t.accent,
              color: outOfStock ? t.textSecondary : t.accentText,
              cursor: outOfStock ? "not-allowed" : "pointer",
              fontWeight: 700, fontSize: "13px",
              display: "flex", alignItems: "center", gap: "6px",
              flexShrink: 0,
              opacity: outOfStock ? 0.4 : 1,
              fontFamily: "inherit",
            }}>
            {outOfStock ? "Out of stock" : <><PlusIcon size={14} /> Add to cart</>}
          </button>
        )}
      </div>
    </article>
  );
}

/* ─── CART FAB ───────────────────────────────────────────────── */
function CartFAB({ itemCount, total, currency, onClick, theme: t }) {
  if (itemCount === 0) return null;
  return (
    <button
      className="pax-cart-fab"
      onClick={onClick}
      style={{
        position: "fixed", bottom: "20px", right: "16px", zIndex: 90,
        display: "flex", alignItems: "center", gap: "10px",
        padding: "12px 18px", borderRadius: "14px",
        background: t.accent, color: t.accentText,
        border: "none", cursor: "pointer",
        boxShadow: "0 4px 20px rgba(0,0,0,0.22)",
        fontFamily: "inherit",
        transition: "transform 0.15s ease",
      }}>
      <div style={{ position: "relative" }}>
        <CartIcon size={18} />
        <span style={{
          position: "absolute", top: "-7px", right: "-8px",
          background: "#fff", color: t.accent,
          borderRadius: "999px", fontSize: "8px", fontWeight: 900,
          padding: "1px 5px", minWidth: "14px", textAlign: "center",
        }}>
          {itemCount}
        </span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "1px" }}>
        <span style={{ fontSize: "10px", opacity: 0.7, fontWeight: 500 }}>
          {itemCount} item{itemCount !== 1 ? "s" : ""}
        </span>
        <span style={{ fontSize: "14px", fontWeight: 900, letterSpacing: "-0.02em" }}>
          {formatPrice(total, currency)}
        </span>
      </div>
    </button>
  );
}

/* ─── CART DRAWER ────────────────────────────────────────────── */
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
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 200, backdropFilter: "blur(4px)" }} />
      <div style={{
        position: "fixed", top: 0, right: 0, bottom: 0,
        width: "400px", maxWidth: "96vw",
        background: t.navBg, zIndex: 201,
        display: "flex", flexDirection: "column",
        boxShadow: "-12px 0 60px rgba(0,0,0,0.18)",
      }}>
        {/* Header */}
        <div style={{ padding: "20px", borderBottom: `1px solid ${t.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <p style={{ margin: 0, fontSize: "17px", fontWeight: 800, color: t.textPrimary, letterSpacing: "-0.02em" }}>
              Your bag
            </p>
            <p style={{ margin: "2px 0 0", fontSize: "11px", color: t.textSecondary }}>
              {totalItems} item{totalItems !== 1 ? "s" : ""}
            </p>
          </div>
          <button onClick={onClose} style={{
            width: "32px", height: "32px", borderRadius: "8px",
            background: "transparent", border: `1px solid ${t.border}`,
            color: t.textSecondary, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <XIcon />
          </button>
        </div>

        {/* Items */}
        <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px", display: "flex", flexDirection: "column", gap: "8px" }}>
          {validCart.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px", color: t.textSecondary }}>
              <div style={{ opacity: 0.2, marginBottom: "14px", display: "flex", justifyContent: "center" }}>
                <CartIcon size={40} />
              </div>
              <p style={{ margin: "0 0 6px", fontSize: "15px", fontWeight: 700, color: t.textPrimary }}>Your bag is empty</p>
              <p style={{ margin: 0, fontSize: "13px" }}>Browse products and add your favourites</p>
            </div>
          ) : validCart.map(item => {
            const price = item.product.discountPrice || item.product.price || 0;
            return (
              <div key={item.product._id} style={{
                display: "flex", gap: "10px",
                padding: "12px", background: t.card,
                borderRadius: "10px", border: `1px solid ${t.border}`,
                alignItems: "center",
              }}>
                {/* Thumbnail */}
                {item.product.images?.[0]?.url ? (
                  <img src={item.product.images[0].url} alt={item.product.name}
                    style={{ width: "52px", height: "52px", borderRadius: "8px", objectFit: "cover", flexShrink: 0 }} />
                ) : (
                  <div style={{ width: "52px", height: "52px", borderRadius: "8px", background: t.pageBg, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ opacity: 0.2 }}><PackageIcon size={20} /></span>
                  </div>
                )}

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: "0 0 2px", fontSize: "13px", fontWeight: 700, color: t.textPrimary, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {item.product.name}
                  </p>
                  <p style={{ margin: 0, fontSize: "14px", fontWeight: 900, color: t.accent, letterSpacing: "-0.01em" }}>
                    {formatPrice(price * item.quantity, currency)}
                  </p>
                </div>

                {/* Qty stepper + remove */}
                <div style={{ display: "flex", alignItems: "center", gap: "4px", flexShrink: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", border: `1px solid ${t.border}`, borderRadius: "8px", overflow: "hidden" }}>
                    <button
                      onClick={() => onUpdateQty(item.product._id, item.quantity - 1)}
                      style={{ width: "28px", height: "28px", background: "transparent", border: "none", color: t.textPrimary, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "inherit" }}>
                      <MinusIcon size={12} />
                    </button>
                    <span style={{ width: "22px", textAlign: "center", fontSize: "12px", fontWeight: 700, color: t.textPrimary }}>
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => onUpdateQty(item.product._id, item.quantity + 1)}
                      style={{ width: "28px", height: "28px", background: "transparent", border: "none", color: t.textPrimary, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "inherit" }}>
                      <PlusIcon size={12} />
                    </button>
                  </div>
                  <button onClick={() => onRemove(item.product._id)} style={{ width: "28px", height: "28px", background: "transparent", border: "none", cursor: "pointer", color: t.textSecondary, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <TrashIcon />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        {validCart.length > 0 && (
          <div style={{ borderTop: `1px solid ${t.border}`, padding: "16px 20px" }}>
            {/* Totals */}
            <div style={{ display: "flex", flexDirection: "column", gap: "7px", marginBottom: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                <span style={{ color: t.textSecondary }}>Subtotal</span>
                <span style={{ color: t.textPrimary, fontWeight: 700 }}>{formatPrice(subtotal, currency)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                <span style={{ color: t.textSecondary }}>Delivery</span>
                <span style={{ color: t.textSecondary, fontSize: "12px" }}>
                  {totalDelivery > 0 ? formatPrice(totalDelivery, currency) : "Confirmed after address"}
                </span>
              </div>
              <div style={{ height: "1px", background: t.border, margin: "4px 0" }} />
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: "14px", fontWeight: 800, color: t.textPrimary }}>Total</span>
                <span style={{ fontSize: "18px", fontWeight: 900, color: t.textPrimary, letterSpacing: "-0.02em" }}>
                  {formatPrice(grandTotal, currency)}
                </span>
              </div>
            </div>

            {/* Checkout */}
            <button onClick={handleWhatsAppCheckout} style={{
              width: "100%", padding: "15px", borderRadius: "10px",
              background: "#25D366", color: "#fff",
              border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
              fontWeight: 800, fontSize: "14px", fontFamily: "inherit",
              letterSpacing: "-0.01em",
            }}>
              <WhatsAppIcon size={16} />
              Order on WhatsApp
            </button>
            <p style={{ margin: "10px 0 0", fontSize: "11px", color: t.textSecondary, textAlign: "center" }}>
              You'll be taken to WhatsApp to complete your order
            </p>
          </div>
        )}
      </div>
    </>
  );
}

/* ─── PAX26 FOOTER ───────────────────────────────────────────── */
function StoreFooter({ theme: t }) {
  return (
    <footer style={{
      borderTop: `1px solid ${t.border}`,
      padding: "28px 16px",
      textAlign: "center",
    }}>
      <p style={{ margin: 0, fontSize: "12px", color: t.textSecondary }}>
        Powered by{" "}
        <a href="https://pax26.com" target="_blank" rel="noopener noreferrer"
          style={{ color: t.accent, fontWeight: 700, textDecoration: "none" }}>
          Pax26
        </a>
        {" "}·{" "}
        <a href="https://pax26.com/privacy" style={{ color: t.textSecondary, textDecoration: "none" }}>Privacy</a>
      </p>
    </footer>
  );
}

/* ─── MAIN PAGE ──────────────────────────────────────────────── */
export default function StorefrontPage({
  store,
  products: rawProducts = [],
  slug,
  sessionToken,
  referredProductId,
  isOwner = false,
}) {
  const t = getTheme(store?.theme);
  const currency = store?.currency || "NGN";
  const productsRef = useRef(null);

  /* ── Cart state + localStorage persistence ── */
  const [cart, setCart] = useState(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = localStorage.getItem(`pax26_cart_${slug}`);
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      // Rehydrate: match saved items against current products
      return parsed.filter(s => rawProducts.some(p => p._id === s.productId)).map(s => ({
        product: rawProducts.find(p => p._id === s.productId),
        quantity: s.quantity,
      }));
    } catch { return []; }
  });

  useEffect(() => {
    try {
      const toSave = cart.map(i => ({ productId: i.product._id, quantity: i.quantity }));
      localStorage.setItem(`pax26_cart_${slug}`, JSON.stringify(toSave));
    } catch {}
  }, [cart, slug]);

  const addToCart = useCallback((product) => {
    setCart(prev => {
      const idx = prev.findIndex(i => i.product._id === product._id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], quantity: next[idx].quantity + 1 };
        return next;
      }
      return [...prev, { product, quantity: 1 }];
    });
  }, []);

  const updateCartQty = useCallback((productId, qty) => {
    if (qty <= 0) {
      setCart(prev => prev.filter(i => i.product._id !== productId));
    } else {
      setCart(prev => prev.map(i => i.product._id === productId ? { ...i, quantity: qty } : i));
    }
  }, []);

  const removeFromCart = useCallback((productId) => {
    setCart(prev => prev.filter(i => i.product._id !== productId));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
    try { localStorage.removeItem(`pax26_cart_${slug}`); } catch {}
  }, [slug]);

  const cartQtyMap = useMemo(() =>
    Object.fromEntries(cart.map(i => [i.product._id, i.quantity])), [cart]);
  const totalCartItems = cart.reduce((a, b) => a + b.quantity, 0);
  const cartTotal = cart.reduce((s, i) => s + ((i.product?.discountPrice || i.product?.price || 0) * i.quantity), 0);

  /* ── Search ── */
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [searching, setSearching] = useState(false);
  const [searchExpanded, setSearchExpanded] = useState(false);
  const mobileSearchRef = useRef(null);
  const searchTimer = useRef(null);

  const clearSearch = useCallback(() => {
    setSearch("");
    setSearchResults(null);
    setSearchExpanded(false);
  }, []);

  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    if (!search.trim()) { setSearchResults(null); return; }
    setSearching(true);
    searchTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/store/${slug}/search?q=${encodeURIComponent(search)}`);
        const data = await res.json();
        setSearchResults(data.products || []);
      } catch { setSearchResults([]); }
      setSearching(false);
    }, 320);
    return () => clearTimeout(searchTimer.current);
  }, [search, slug]);

  useEffect(() => {
    if (searchExpanded && mobileSearchRef.current) {
      setTimeout(() => mobileSearchRef.current?.focus(), 80);
    }
  }, [searchExpanded]);

  /* ── Category ── */
  const categories = useMemo(() => {
    const cats = [...new Set(rawProducts.map(p => p.category).filter(Boolean))];
    return cats;
  }, [rawProducts]);

  const categoryCounts = useMemo(() => {
    return categories.reduce((acc, cat) => {
      acc[cat] = rawProducts.filter(p => p.category === cat).length;
      return acc;
    }, {});
  }, [categories, rawProducts]);

  const [activeCategory, setActiveCategory] = useState("all");
  const highlightedProductId = referredProductId || null;

  const filtered = useMemo(() => {
    const source = searchResults !== null ? searchResults : rawProducts;
    if (activeCategory === "all") return source;
    return source.filter(p => p.category === activeCategory);
  }, [rawProducts, searchResults, activeCategory]);

  /* ── Cart drawer ── */
  const [cartOpen, setCartOpen] = useState(false);

  /* ── Nav sticky offset ── */
  const ownerBarHeight = isOwner ? 40 : 0;
  const navHeight = 52;
  const categoryBarTop = ownerBarHeight + navHeight;

  /* ── Scroll to products ── */
  const handleBrowse = () => {
    productsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (!store) return null;

  return (
    <>
      <div style={{ background: t.pageBg, minHeight: "100vh", fontFamily: "'DM Sans', system-ui, -apple-system, sans-serif" }}>

        {/* Owner preview */}
        {isOwner && <OwnerBanner />}

        {/* Nav */}
        <StoreNav
          store={store}
          slug={slug}
          theme={t}
          totalCartItems={totalCartItems}
          onCartOpen={() => setCartOpen(true)}
          search={search}
          setSearch={setSearch}
          searching={searching}
          searchExpanded={searchExpanded}
          setSearchExpanded={setSearchExpanded}
          mobileSearchRef={mobileSearchRef}
          clearSearch={clearSearch}
        />

        {/* Hero */}
        <StoreHero store={store} theme={t} onBrowse={handleBrowse} />

        {/* Category rail */}
        {categories.length > 0 && !search && (
          <CategoryRail
            categories={categories}
            categoryCounts={categoryCounts}
            active={activeCategory}
            onChange={setActiveCategory}
            topOffset={categoryBarTop}
            theme={t}
          />
        )}

        {/* Cart drawer */}
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

        {/* Products */}
        <main ref={productsRef} style={{ maxWidth: "1200px", margin: "0 auto", padding: "24px 16px 120px" }}>

          {/* Search label */}
          {search && !searching && (
            <div style={{ marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
              <p style={{ margin: 0, fontSize: "13px", color: t.textSecondary }}>
                {filtered.length === 0
                  ? `No results for "${search}"`
                  : `${filtered.length} result${filtered.length !== 1 ? "s" : ""} for "${search}"`}
              </p>
              <button onClick={clearSearch} style={{ background: "none", border: `1px solid ${t.border}`, borderRadius: "6px", padding: "3px 10px", fontSize: "11px", color: t.textSecondary, cursor: "pointer", fontFamily: "inherit" }}>
                Clear
              </button>
            </div>
          )}

          {/* Products grid */}
          {filtered.length > 0 ? (
            <div>
              {/* Hero card — first product, full width */}
              <HeroProductCard
                product={filtered[0]}
                store={store}
                slug={slug}
                sessionToken={sessionToken}
                theme={t}
                highlighted={filtered[0]._id === highlightedProductId}
                cartQuantity={cartQtyMap[filtered[0]._id] || 0}
                onAddToCart={addToCart}
                onUpdateQty={updateCartQty}
              />

              {/* Standard grid — remaining products */}
              {filtered.length > 1 && (
                <div className="pax-grid" style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: "12px",
                  marginTop: "12px",
                }}>
                  {filtered.slice(1).map(product => (
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
              )}
            </div>
          ) : (
            /* Empty state */
            <div style={{
              textAlign: "center", padding: "80px 20px",
            }}>
              <div style={{ fontSize: "44px", marginBottom: "16px", opacity: 0.35 }}>📦</div>
              <h2 style={{ margin: "0 0 8px", fontSize: "18px", fontWeight: 800, color: t.textPrimary, letterSpacing: "-0.02em" }}>
                {search ? "Nothing matched" : "Shop coming soon"}
              </h2>
              <p style={{ margin: "0 0 24px", fontSize: "13px", color: t.textSecondary, maxWidth: "300px", margin: "0 auto 24px" }}>
                {search
                  ? `We couldn't find "${search}". Try different words or browse all products.`
                  : "This store is getting stocked. Check back soon or chat with us directly."}
              </p>
              {search ? (
                <button
                  onClick={() => { clearSearch(); setActiveCategory("all"); }}
                  style={{ padding: "10px 24px", borderRadius: "8px", background: t.accent, color: t.accentText, fontWeight: 700, border: "none", cursor: "pointer", fontSize: "13px", fontFamily: "inherit" }}>
                  Browse all
                </button>
              ) : store.whatsappHref ? (
                <a href={store.whatsappHref} target="_blank" rel="noopener noreferrer"
                  style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "10px 22px", borderRadius: "8px", background: "#25D366", color: "#fff", fontWeight: 700, textDecoration: "none", fontSize: "13px" }}>
                  <WhatsAppIcon size={14} /> Ask about availability
                </a>
              ) : null}
            </div>
          )}
        </main>

        {/* Footer */}
        <StoreFooter theme={t} />

        {/* Cart FAB */}
        <CartFAB
          itemCount={totalCartItems}
          total={cartTotal}
          currency={currency}
          onClick={() => setCartOpen(true)}
          theme={t}
        />
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&display=swap');

        @keyframes pax-spin { to { transform: rotate(360deg); } }

        * { box-sizing: border-box; }

        /* ── Category rail scrollbar ── */
        .pax-cat-rail::-webkit-scrollbar { display: none; }

        /* ── Hero card image height ── */
        .pax-hero-img { height: 240px; }

        /* ── Mobile defaults (<640px) ── */
        .pax-search-desktop { display: none !important; }
        .pax-search-btn     { display: flex !important; }
        .pax-spacer         { display: block !important; }
        .pax-wa-text        { display: none !important; }
        .pax-cart-fab       { display: flex !important; }

        /* ── Tablet (≥640px) ── */
        @media (min-width: 640px) {
          .pax-search-desktop { display: flex !important; }
          .pax-search-btn     { display: none !important; }
          .pax-spacer         { display: none !important; }
          .pax-wa-text        { display: inline !important; }
          .pax-cart-fab       { display: none !important; }
          .pax-grid           { grid-template-columns: repeat(3, 1fr) !important; gap: 14px !important; }
          .pax-hero-img       { height: 320px !important; }
        }

        /* ── Desktop (≥900px) ── */
        @media (min-width: 900px) {
          .pax-grid     { grid-template-columns: repeat(4, 1fr) !important; gap: 16px !important; }
          .pax-hero-img { height: 420px !important; }
          .pax-hero-card {
            display: flex !important;
            flex-direction: row !important;
          }
          .pax-hero-card .pax-hero-img {
            width: 52% !important;
            flex-shrink: 0 !important;
            height: auto !important;
            min-height: 380px !important;
          }
        }
      `}</style>
    </>
  );
}
