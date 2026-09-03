"use client";

import { useState, useEffect, useCallback } from "react";
import { TagInput } from "@/components/ui/TagInput";
import { motion, AnimatePresence } from "framer-motion";
import { useGlobalContext } from "../Context";
import { CURRENCY_OPTIONS, formatPrice, getCurrencySymbol } from "@/app/lib/currency/currencyHelper";
import { THEME_LIST } from "@/app/lib/store/storeThemes";

/* ══════════════════════════════════════════════════════════
   ICONS
══════════════════════════════════════════════════════════ */
const BotIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 8V4H8" /><path d="M8 8H4a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-4" /><path d="M12 8h4" /><path d="M9 17v1" /><path d="M15 17v1" />
  </svg>
);
const StoreIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l1-6h16l1 6" /><path d="M3 9a2 2 0 0 0 2 2 2 2 0 0 0 4 0 2 2 0 0 0 4 0 2 2 0 0 0 4 0 2 2 0 0 0 2-2" /><path d="M5 11v9h14V11" /><path d="M9 21v-6h6v6" />
  </svg>
);
const PackageIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="16.5" y1="9.4" x2="7.5" y2="4.21" />
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" />
  </svg>
);
const CreditCardIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" />
  </svg>
);
const SlidersIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" y1="21" x2="4" y2="14" /><line x1="4" y1="10" x2="4" y2="3" />
    <line x1="12" y1="21" x2="12" y2="12" /><line x1="12" y1="8" x2="12" y2="3" />
    <line x1="20" y1="21" x2="20" y2="16" /><line x1="20" y1="12" x2="20" y2="3" />
    <line x1="1" y1="14" x2="7" y2="14" /><line x1="9" y1="8" x2="15" y2="8" /><line x1="17" y1="16" x2="23" y2="16" />
  </svg>
);
const MessageCircleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);
const ClipboardIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
  </svg>
);
const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
const TrashIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4h6v2" />
  </svg>
);
const UploadIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 16 12 12 8 16" /><line x1="12" y1="12" x2="12" y2="21" />
    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
  </svg>
);
const XIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const LinkIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
);
const CopyIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

/* ══════════════════════════════════════════════════════════
   SHARED PRIMITIVES
══════════════════════════════════════════════════════════ */
const fieldBase = (pax26) => ({
  width: "100%",
  backgroundColor: pax26?.secondaryBg,
  color: pax26?.textPrimary,
  border: `1px solid ${pax26?.border}`,
  borderRadius: "10px",
  padding: "10px 14px",
  fontSize: "14px",
  fontFamily: "inherit",
  outline: "none",
  transition: "border-color 0.2s, box-shadow 0.2s",
  boxSizing: "border-box",
});

const FieldLabel = ({ children, pax26 }) => (
  <label style={{ display: "block", fontSize: "11px", fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: pax26?.textPrimary, opacity: 0.7, marginBottom: "6px" }}>
    {children}
  </label>
);

const ThemedInput = ({ label, pax26, style, ...props }) => {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom: "4px" }}>
      {label && <FieldLabel pax26={pax26}>{label}</FieldLabel>}
      <input
        {...props}
        style={{ ...fieldBase(pax26), borderColor: focused ? pax26?.primary : pax26?.border, boxShadow: focused ? `0 0 0 3px ${pax26?.primary}18` : "none", ...style }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
    </div>
  );
};

const ThemedTextarea = ({ label, pax26, rows = 3, style, ...props }) => {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom: "4px" }}>
      {label && <FieldLabel pax26={pax26}>{label}</FieldLabel>}
      <textarea
        {...props}
        rows={rows}
        style={{ ...fieldBase(pax26), resize: "vertical", borderColor: focused ? pax26?.primary : pax26?.border, boxShadow: focused ? `0 0 0 3px ${pax26?.primary}18` : "none", ...style }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
    </div>
  );
};

const ThemedSelect = ({ label, pax26, options = [], value, onChange, style }) => {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom: "4px" }}>
      {label && <FieldLabel pax26={pax26}>{label}</FieldLabel>}
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          ...fieldBase(pax26),
          cursor: "pointer",
          appearance: "none",
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23888' strokeWidth='2.5' xmlns='http://www.w3.org/2000/svg'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 12px center",
          paddingRight: "36px",
          borderColor: focused ? pax26?.primary : pax26?.border,
          boxShadow: focused ? `0 0 0 3px ${pax26?.primary}18` : "none",
          ...style,
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value} style={{ backgroundColor: pax26?.secondaryBg, color: pax26?.textPrimary }}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};

const Toggle = ({ value, onChange, pax26, label, hint }) => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", borderRadius: "10px", background: pax26?.secondaryBg, border: `1px solid ${pax26?.border}` }}>
    <div>
      <p style={{ fontSize: "13px", fontWeight: 600, color: pax26?.textPrimary, margin: 0 }}>{label}</p>
      {hint && <p style={{ fontSize: "11px", color: pax26?.textPrimary, opacity: 0.5, margin: "2px 0 0" }}>{hint}</p>}
    </div>
    <button
      onClick={() => onChange(!value)}
      style={{ width: "44px", height: "24px", borderRadius: "999px", border: "none", cursor: "pointer", background: value ? pax26?.primary : pax26?.border, transition: "background 0.2s", position: "relative", flexShrink: 0 }}
    >
      <span style={{ position: "absolute", top: "3px", left: value ? "23px" : "3px", width: "18px", height: "18px", borderRadius: "50%", background: "#fff", transition: "left 0.2s", boxShadow: "0 1px 4px rgba(0,0,0,0.3)" }} />
    </button>
  </div>
);

const Spinner = ({ color = "white" }) => (
  <div style={{ width: "16px", height: "16px", border: `2px solid ${color}30`, borderTopColor: color, borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
);

const InfoBanner = ({ text, pax26 }) => (
  <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", padding: "11px 13px", borderRadius: "10px", background: `${pax26?.primary}0e`, border: `1px solid ${pax26?.primary}22` }}>
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={pax26?.textPrimary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1, opacity: 0.7 }}>
      <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
    <p style={{ fontSize: "12px", color: pax26?.textPrimary, lineHeight: 1.6, margin: 0, opacity: 0.75 }} dangerouslySetInnerHTML={{ __html: text }} />
  </div>
);

/* ══════════════════════════════════════════════════════════
   CLOUDINARY UPLOAD HOOK
══════════════════════════════════════════════════════════ */
function useCloudinaryUpload() {
  const upload = useCallback(async (file, { folder, tags = [], onProgress } = {}) => {
    const formData = new FormData();
    formData.append("file", file);
    if (folder) formData.append("folder", folder);
    if (tags.length) formData.append("tags", tags.join(","));

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", "/api/upload/cloudinary");
      xhr.upload.onprogress = (e) => {
        if (onProgress && e.lengthComputable) onProgress(Math.round((e.loaded * 100) / e.total));
      };
      xhr.onload = () => {
        if (xhr.status === 200) resolve(JSON.parse(xhr.response));
        else reject(new Error("Upload failed"));
      };
      xhr.onerror = () => reject(new Error("Network error"));
      xhr.send(formData);
    });
  }, []);
  return { upload };
}

/* ══════════════════════════════════════════════════════════
   PRODUCT MEDIA UPLOADER  (seller only)
══════════════════════════════════════════════════════════ */
function ProductMediaUploader({ images, onChange, pax26, sellerId }) {
  const { upload } = useCloudinaryUpload();
  const inputRef = useState(null);
  const [uploading, setUploading] = useState(false);
  const ref = { current: null };

  const handleFiles = async (files) => {
    const arr = Array.from(files).slice(0, 6 - images.length);
    if (!arr.length) return;
    setUploading(true);
    try {
      const folder = sellerId ? `pax26/${sellerId}/products` : "pax26/products";
      const results = await Promise.all(arr.map(f => upload(f, { folder, tags: ["product"] })));
      onChange([...images, ...results.map(r => ({ url: r.url, publicId: r.publicId }))]);
    } catch { /* silent */ }
    finally { setUploading(false); }
  };

  return (
    <div>
      <FieldLabel pax26={pax26}>Product Images (up to 6)</FieldLabel>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
        {images.map((img, i) => {
          const imgUrl = typeof img === "string" ? img : img?.url;
          return (
            <div key={i} style={{ position: "relative", width: "80px", height: "80px", borderRadius: "10px", overflow: "hidden", border: `1px solid ${pax26?.border}` }}>
              <img src={imgUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              <button onClick={() => onChange(images.filter((_, j) => j !== i))} style={{ position: "absolute", top: "3px", right: "3px", width: "20px", height: "20px", borderRadius: "50%", background: "#ff4444cc", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
                <XIcon />
              </button>
            </div>
          );
        })}
        {images.length < 6 && (
          <button onClick={() => ref.current?.click()} disabled={uploading} style={{ width: "80px", height: "80px", borderRadius: "10px", border: `2px dashed ${pax26?.border}`, background: pax26?.secondaryBg, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "4px", color: pax26?.textPrimary, opacity: uploading ? 0.5 : 0.7 }}>
            {uploading ? <Spinner color={pax26?.primary} /> : <><UploadIcon /><span style={{ fontSize: "10px" }}>Add</span></>}
          </button>
        )}
      </div>
      <input ref={r => { ref.current = r; }} type="file" accept="image/*" multiple style={{ display: "none" }} onChange={e => handleFiles(e.target.files)} />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   PRODUCT BUILDER  (seller only)
══════════════════════════════════════════════════════════ */
function ProductBuilder({ products, onChange, pax26, sellerId, currency = "NGN" }) {
  const emptyProduct = () => ({ name: "", price: "", discountPrice: "", deliveryFee: "", deliveryTimeFrame: "", locationNotes: "", isPhysical: true, description: "", category: "", tags: [], stock: "", images: [] });
  const [editing, setEditing] = useState(null);
  const [draft, setDraft] = useState(emptyProduct());

  const startNew = () => { setDraft(emptyProduct()); setEditing("new"); };
  const startEdit = (i) => { const prod = products[i]; setDraft({ ...prod, images: Array.isArray(prod.images) ? [...prod.images] : [] }); setEditing(i); };

  const save = () => {
    if (!draft.name.trim() || !String(draft.price).trim()) return;
    const item = { ...draft, price: parseFloat(draft.price) || 0, discountPrice: draft.discountPrice ? parseFloat(draft.discountPrice) : undefined, deliveryFee: draft.deliveryFee ? parseFloat(draft.deliveryFee) : undefined, stock: parseInt(draft.stock) || 0 };
    if (editing === "new") onChange([...products, item]);
    else onChange(products.map((p, i) => i === editing ? item : p));
    setEditing(null);
  };

  const remove = (i) => onChange(products.filter((_, j) => j !== i));
  const p = pax26;
  const canSave = draft.name.trim() && String(draft.price).trim();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      {products.map((prod, i) => (
        <div key={i} style={{ display: "flex", gap: "10px", alignItems: "center", padding: "10px 14px", borderRadius: "12px", border: `1px solid ${p?.border}`, background: p?.secondaryBg }}>
          {(() => { const firstImg = prod.images?.[0]; const imgUrl = typeof firstImg === "string" ? firstImg : firstImg?.url; return imgUrl ? (<img src={imgUrl} alt="" style={{ width: "44px", height: "44px", borderRadius: "8px", objectFit: "cover", flexShrink: 0 }} />) : (<div style={{ width: "44px", height: "44px", borderRadius: "8px", background: `${p?.primary}18`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: p?.textPrimary, opacity: 0.4 }}><PackageIcon /></div>); })()}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: "13px", fontWeight: 700, color: p?.textPrimary, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{prod.name}</p>
            <p style={{ margin: "2px 0 0", fontSize: "12px", color: p?.textPrimary, opacity: 0.55 }}>
              {prod.discountPrice ? (<><span style={{ textDecoration: "line-through", marginRight: "6px" }}>{formatPrice(prod.price, currency)}</span><span style={{ color: p?.primary, fontWeight: 700 }}>{formatPrice(prod.discountPrice, currency)}</span></>) : `${formatPrice(prod.price, currency)}`}
              {prod.stock ? ` · ${prod.stock} in stock` : ""}
            </p>
          </div>
          <button onClick={() => startEdit(i)} style={{ padding: "6px 10px", borderRadius: "8px", border: `1px solid ${p?.border}`, background: "transparent", color: p?.textPrimary, fontSize: "11px", fontWeight: 600, cursor: "pointer" }}>Edit</button>
          <button onClick={() => remove(i)} style={{ padding: "6px", borderRadius: "8px", border: "none", background: "#ff444415", color: "#ff4444", cursor: "pointer", display: "flex", alignItems: "center" }}><TrashIcon /></button>
        </div>
      ))}

      {editing !== null ? (
        <div style={{ padding: "16px", borderRadius: "14px", border: `1px solid ${p?.primary}44`, background: `${p?.primary}06`, display: "flex", flexDirection: "column", gap: "12px" }}>
          <p style={{ margin: 0, fontSize: "13px", fontWeight: 700, color: p?.textPrimary }}>{editing === "new" ? "New Product" : "Edit Product"}</p>
          <ThemedInput label="Product Name *" pax26={p} value={draft.name} onChange={e => setDraft(d => ({ ...d, name: e.target.value }))} placeholder="e.g. Black Leather Sneakers" />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "10px" }}>
            <ThemedInput label={`Price (${getCurrencySymbol(currency)}) *`} pax26={p} type="number" value={draft.price} onChange={e => setDraft(d => ({ ...d, price: e.target.value }))} placeholder="5000" />
            <ThemedInput label={`Discount Price (${getCurrencySymbol(currency)})`} pax26={p} type="number" value={draft.discountPrice} onChange={e => setDraft(d => ({ ...d, discountPrice: e.target.value }))} placeholder="4500" />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "10px" }}>
            <ThemedSelect label="Product Type *" value={draft.isPhysical ? "true" : "false"} onChange={v => setDraft(d => ({ ...d, isPhysical: v === "true" }))} options={[{ value: "true", label: "Physical Product" }, { value: "false", label: "Digital / Link" }]} pax26={p} />
            <ThemedInput label="Category" pax26={p} value={draft.category} onChange={e => setDraft(d => ({ ...d, category: e.target.value }))} placeholder="e.g. Shoes" />
          </div>
          <ThemedInput label="Stock Qty" pax26={p} type="number" value={draft.stock} onChange={e => setDraft(d => ({ ...d, stock: e.target.value }))} placeholder="10" />
          {draft.isPhysical && (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "10px" }}>
                <ThemedInput label={`Delivery Fee (${getCurrencySymbol(currency)})`} pax26={p} type="number" value={draft.deliveryFee} onChange={e => setDraft(d => ({ ...d, deliveryFee: e.target.value }))} placeholder="1000" />
                <ThemedInput label="Delivery Time" pax26={p} value={draft.deliveryTimeFrame} onChange={e => setDraft(d => ({ ...d, deliveryTimeFrame: e.target.value }))} placeholder="24-48 hours" />
              </div>
              <ThemedInput label="Delivery Location" pax26={p} value={draft.locationNotes} onChange={e => setDraft(d => ({ ...d, locationNotes: e.target.value }))} placeholder="e.g. Lagos only" />
            </div>
          )}
          <ThemedTextarea label="Description" pax26={p} value={draft.description} onChange={e => setDraft(d => ({ ...d, description: e.target.value }))} placeholder="Describe the product…" rows={2} />
          <TagInput label="Search Tags" example="e.g. black, nike, size-42" tags={draft.tags} onChange={tags => setDraft(d => ({ ...d, tags }))} pax26={p} />
          <ProductMediaUploader images={draft.images || []} onChange={imgs => setDraft(d => ({ ...d, images: imgs }))} pax26={p} sellerId={sellerId} />
          <div style={{ display: "flex", gap: "10px" }}>
            <button onClick={() => setEditing(null)} style={{ flex: 1, padding: "9px", borderRadius: "10px", border: `1px solid ${p?.border}`, background: "transparent", color: p?.textPrimary, fontWeight: 600, fontSize: "13px", cursor: "pointer" }}>Cancel</button>
            <button onClick={save} disabled={!canSave} style={{ flex: 2, padding: "9px", borderRadius: "10px", border: "none", background: p?.primary, color: "#fff", fontWeight: 700, fontSize: "13px", cursor: canSave ? "pointer" : "not-allowed", opacity: canSave ? 1 : 0.5 }}>Save Product</button>
          </div>
        </div>
      ) : (
        <button onClick={startNew} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "12px", borderRadius: "12px", border: `2px dashed ${p?.border}`, background: "transparent", color: p?.textPrimary, fontWeight: 600, fontSize: "13px", cursor: "pointer", opacity: 0.7 }} onMouseEnter={e => e.currentTarget.style.opacity = "1"} onMouseLeave={e => e.currentTarget.style.opacity = "0.7"}>
          <PlusIcon /> Add Product
        </button>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   PAYMENT BUILDER  (seller only)
══════════════════════════════════════════════════════════ */
function PaymentBuilder({ payments, onChange, pax26 }) {
  const emptyPayment = () => ({ label: "", bankName: "", accountNumber: "", accountName: "", active: true });
  const [editing, setEditing] = useState(null);
  const [draft, setDraft] = useState(emptyPayment());
  const p = pax26;

  const startNew = () => { setDraft(emptyPayment()); setEditing("new"); };
  const startEdit = (i) => { setDraft({ ...payments[i] }); setEditing(i); };
  const save = () => {
    if (!draft.bankName.trim() || !draft.accountNumber.trim()) return;
    if (editing === "new") onChange([...payments, draft]);
    else onChange(payments.map((x, i) => i === editing ? draft : x));
    setEditing(null);
  };
  const canSave = draft.bankName.trim() && draft.accountNumber.trim();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      {payments.map((pay, i) => (
        <div key={i} style={{ display: "flex", gap: "10px", alignItems: "center", padding: "10px 14px", borderRadius: "12px", border: `1px solid ${p?.border}`, background: p?.secondaryBg }}>
          <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: pay.active ? "#22c55e" : p?.border, flexShrink: 0 }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: "13px", fontWeight: 700, color: p?.textPrimary }}>{pay.label || pay.bankName}</p>
            <p style={{ margin: "2px 0 0", fontSize: "12px", color: p?.textPrimary, opacity: 0.55 }}>{pay.bankName} · {pay.accountNumber}</p>
          </div>
          <button onClick={() => startEdit(i)} style={{ padding: "6px 10px", borderRadius: "8px", border: `1px solid ${p?.border}`, background: "transparent", color: p?.textPrimary, fontSize: "11px", fontWeight: 600, cursor: "pointer" }}>Edit</button>
          <button onClick={() => onChange(payments.filter((_, j) => j !== i))} style={{ padding: "6px", borderRadius: "8px", border: "none", background: "#ff444415", color: "#ff4444", cursor: "pointer", display: "flex", alignItems: "center" }}><TrashIcon /></button>
        </div>
      ))}
      {editing !== null ? (
        <div style={{ padding: "16px", borderRadius: "14px", border: `1px solid ${p?.primary}44`, background: `${p?.primary}06`, display: "flex", flexDirection: "column", gap: "10px" }}>
          <ThemedInput label="Label (e.g. Primary Account)" pax26={p} value={draft.label} onChange={e => setDraft(d => ({ ...d, label: e.target.value }))} placeholder="Primary Account" />
          <ThemedInput label="Bank Name *" pax26={p} value={draft.bankName} onChange={e => setDraft(d => ({ ...d, bankName: e.target.value }))} placeholder="e.g. GTBank" />
          <ThemedInput label="Account Number *" pax26={p} value={draft.accountNumber} onChange={e => setDraft(d => ({ ...d, accountNumber: e.target.value }))} placeholder="0123456789" />
          <ThemedInput label="Account Name" pax26={p} value={draft.accountName} onChange={e => setDraft(d => ({ ...d, accountName: e.target.value }))} placeholder="Your business name" />
          <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
            <button onClick={() => setEditing(null)} style={{ flex: 1, padding: "9px", borderRadius: "10px", border: `1px solid ${p?.border}`, background: "transparent", color: p?.textPrimary, fontWeight: 600, fontSize: "13px", cursor: "pointer" }}>Cancel</button>
            <button onClick={save} disabled={!canSave} style={{ flex: 2, padding: "9px", borderRadius: "10px", border: "none", background: p?.primary, color: "#fff", fontWeight: 700, fontSize: "13px", cursor: canSave ? "pointer" : "not-allowed", opacity: canSave ? 1 : 0.5 }}>Save</button>
          </div>
        </div>
      ) : (
        <button onClick={startNew} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "12px", borderRadius: "12px", border: `2px dashed ${p?.border}`, background: "transparent", color: p?.textPrimary, fontWeight: 600, fontSize: "13px", cursor: "pointer", opacity: 0.7 }} onMouseEnter={e => e.currentTarget.style.opacity = "1"} onMouseLeave={e => e.currentTarget.style.opacity = "0.7"}>
          <PlusIcon /> Add Payment Account
        </button>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   DASHBOARD TAB
══════════════════════════════════════════════════════════ */
const DashboardTab = ({ label, active, onClick, icon: Icon, pax26 }) => (
  <button
    onClick={onClick}
    style={{
      display: "flex", alignItems: "center", gap: "6px",
      padding: "10px 18px", border: "none",
      background: active ? `${pax26?.primary}15` : "transparent",
      color: active ? pax26?.primary : pax26?.textPrimary,
      borderRadius: "12px", cursor: "pointer", fontWeight: 600,
      fontSize: "13px", transition: "all 0.2s", opacity: active ? 1 : 0.6,
      whiteSpace: "nowrap",
    }}
  >
    <Icon />
    {label}
  </button>
);

/* ══════════════════════════════════════════════════════════
   TYPE PICKER  — shown when businessType === null
══════════════════════════════════════════════════════════ */
function TypePicker({ onSelect, selecting, selectedTarget, pax26 }) {
  const p = pax26;
  const [hovered, setHovered] = useState(null);

  const SELLER_FEATURES = [
    "Product catalog with photos & pricing",
    "Stock tracking & inventory management",
    "Payment details for customer checkout",
    "Delivery info & location notes",
    "AI answers product & pricing questions",
  ];
  const SERVICE_FEATURES = [
    "Services list with descriptions",
    "FAQ management for common questions",
    "Business portfolio & bio",
    "Booking or contact link sharing",
    "AI qualifies leads & books consultations",
  ];

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "40px 20px",
      background: p?.bg,
    }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "48px", maxWidth: "520px" }}>
        <div style={{
          width: "64px", height: "64px", borderRadius: "20px",
          background: `${p?.primary}15`, display: "flex",
          alignItems: "center", justifyContent: "center",
          margin: "0 auto 20px", color: p?.primary,
        }}>
          <BotIcon />
        </div>
        <h1 style={{ fontSize: "clamp(24px, 5vw, 34px)", fontWeight: 900, color: p?.textPrimary, margin: "0 0 12px", letterSpacing: "-0.03em" }}>
          What type of business are you?
        </h1>
        <p style={{ fontSize: "15px", color: p?.textPrimary, opacity: 0.6, lineHeight: 1.7, margin: 0 }}>
          Choose your model to configure your Smart Agent. This determines what data your agent uses to respond to customers on WhatsApp.
        </p>
      </div>

      {/* Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px", width: "100%", maxWidth: "760px" }}>
        {[
          { type: "seller", emoji: "🛒", title: "Seller", subtitle: "I sell products", accent: p?.primary, features: SELLER_FEATURES },
          { type: "service", emoji: "🤝", title: "Service Provider", subtitle: "I offer services", accent: "#8b5cf6", features: SERVICE_FEATURES },
        ].map(({ type, emoji, title, subtitle, accent, features }) => (
          <button
            key={type}
            onClick={() => !selecting && onSelect(type)}
            disabled={selecting}
            onMouseEnter={() => setHovered(type)}
            onMouseLeave={() => setHovered(null)}
            style={{
              background: p?.secondaryBg,
              border: `2px solid ${hovered === type ? accent : p?.border}`,
              borderRadius: "24px",
              padding: "32px 28px",
              cursor: selecting ? "not-allowed" : "pointer",
              textAlign: "left",
              transition: "border-color 0.2s, box-shadow 0.2s, transform 0.2s",
              transform: hovered === type ? "translateY(-4px)" : "translateY(0)",
              boxShadow: hovered === type ? `0 16px 48px ${accent}22` : "none",
              display: "flex",
              flexDirection: "column",
              gap: "20px",
              opacity: selecting && selectedTarget !== type ? 0.5 : 1,
            }}
          >
            {/* Card header */}
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <div style={{
                width: "52px", height: "52px", borderRadius: "16px",
                background: `${accent}18`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "26px", flexShrink: 0,
              }}>
                {emoji}
              </div>
              <div>
                <p style={{ margin: 0, fontSize: "20px", fontWeight: 900, color: p?.textPrimary }}>{title}</p>
                <p style={{ margin: "2px 0 0", fontSize: "13px", color: p?.textPrimary, opacity: 0.55 }}>{subtitle}</p>
              </div>
            </div>

            {/* Feature list */}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {features.map((f, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                  <div style={{ width: "20px", height: "20px", borderRadius: "6px", background: `${accent}18`, color: accent, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: "1px" }}>
                    <CheckIcon />
                  </div>
                  <span style={{ fontSize: "13px", color: p?.textPrimary, opacity: 0.75, lineHeight: 1.5 }}>{f}</span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div style={{
              padding: "12px 20px",
              borderRadius: "14px",
              background: `${accent}15`,
              color: accent,
              fontWeight: 800,
              fontSize: "14px",
              textAlign: "center",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              border: `1px solid ${accent}25`,
            }}>
              {selecting && selectedTarget === type ? (
                <><Spinner color={accent} /> Setting up…</>
              ) : (
                `Select ${title}`
              )}
            </div>
          </button>
        ))}
      </div>

      <p style={{ marginTop: "28px", fontSize: "12px", color: p?.textPrimary, opacity: 0.4, textAlign: "center" }}>
        You can change your business type later, but switching will clear your current profile data.
      </p>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   WHATSAPP GATE — full-page lock until Meta WhatsApp is linked
══════════════════════════════════════════════════════════ */
function WhatsAppGate({ pax26, router }) {
  const p = pax26;
  const steps = [
    "Log in with Meta / Facebook",
    "Select or create your Business account",
    "Choose your WhatsApp Business number",
    "Return here to open your AI dashboard",
  ];

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "40px 20px",
      background: p?.bg,
      position: "relative",
      overflow: "hidden",
    }}>
      <div style={{
        position: "absolute",
        inset: 0,
        background: `radial-gradient(ellipse 70% 50% at 50% 0%, #25d36618 0%, transparent 60%), radial-gradient(ellipse 50% 40% at 80% 100%, ${p?.primary}12 0%, transparent 55%)`,
        pointerEvents: "none",
      }} />

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "480px",
          background: p?.secondaryBg,
          borderRadius: "28px",
          border: `1px solid ${p?.border}`,
          padding: "36px 28px",
          boxShadow: "0 24px 60px rgba(0,0,0,0.18)",
        }}
      >
        <div style={{
          width: "72px",
          height: "72px",
          borderRadius: "22px",
          margin: "0 auto 22px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(145deg, #25d366, #128c7e)",
          color: "#fff",
          boxShadow: "0 12px 28px #25d36644",
        }}>
          <svg width="34" height="34" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
        </div>

        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <p style={{
            margin: "0 0 10px",
            fontSize: "11px",
            fontWeight: 800,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#25d366",
          }}>
            Required to continue
          </p>
          <h1 style={{
            margin: "0 0 10px",
            fontSize: "clamp(22px, 5vw, 28px)",
            fontWeight: 900,
            letterSpacing: "-0.03em",
            color: p?.textPrimary,
          }}>
            Connect your WhatsApp
          </h1>
          <p style={{
            margin: 0,
            fontSize: "14px",
            lineHeight: 1.65,
            color: p?.textPrimary,
            opacity: 0.6,
          }}>
            Link your WhatsApp Business number with Pax26 through Meta to unlock your AI business dashboard.
          </p>
        </div>

        <div style={{
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          marginBottom: "28px",
          padding: "16px",
          borderRadius: "18px",
          background: p?.bg,
          border: `1px solid ${p?.border}`,
        }}>
          {steps.map((text, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{
                width: "26px",
                height: "26px",
                borderRadius: "8px",
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "12px",
                fontWeight: 800,
                background: `${p?.primary}18`,
                color: p?.primary,
              }}>
                {i + 1}
              </div>
              <p style={{ margin: 0, fontSize: "13px", fontWeight: 600, color: p?.textPrimary, opacity: 0.8 }}>{text}</p>
            </div>
          ))}
        </div>

        <button
          onClick={() => router.push("/dashboard/automations/whatsapp#connect")}
          style={{
            width: "100%",
            padding: "15px 20px",
            borderRadius: "16px",
            border: "none",
            background: "#25d366",
            color: "#fff",
            fontWeight: 800,
            fontSize: "15px",
            cursor: "pointer",
            boxShadow: "0 12px 28px #25d36644",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
          }}
        >
          <MessageCircleIcon />
          Connect WhatsApp with Meta
        </button>

        <button
          onClick={() => router.push("/dashboard/automations")}
          style={{
            width: "100%",
            marginTop: "12px",
            padding: "12px 20px",
            borderRadius: "14px",
            border: `1px solid ${p?.border}`,
            background: "transparent",
            color: p?.textPrimary,
            fontWeight: 700,
            fontSize: "13px",
            cursor: "pointer",
            opacity: 0.7,
          }}
        >
          ← Back to Automations
        </button>

        <p style={{
          margin: "18px 0 0",
          textAlign: "center",
          fontSize: "11px",
          color: p?.textPrimary,
          opacity: 0.4,
        }}>
          Personal WhatsApp numbers are not supported — Business + Meta only.
        </p>
      </motion.div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   SLUG FIELD — storefront URL manager
   Shows current slug, availability check, copy button, and
   a "View My Store" link that opens the public storefront.
══════════════════════════════════════════════════════════ */
function SlugField({ value, onChange, onSave, pax26, businessName }) {
  const p = pax26;
  const [checking, setChecking] = useState(false);
  const [saving, setSaving] = useState(false);
  const [availability, setAvailability] = useState(null); // null | "available" | "taken"
  const [copied, setCopied] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [draft, setDraft] = useState(value || "");

  // Sync draft when parent value changes (e.g. on first load)
  useEffect(() => { setDraft(value || ""); }, [value]);

  const storeUrl = typeof window !== "undefined"
    ? `${window.location.origin}/store/${draft}`
    : `/store/${draft}`;

  const checkSlug = async (slug) => {
    if (!slug || slug.length < 2) { setAvailability(null); return; }
    setChecking(true);
    try {
      const res = await fetch(`/api/store/check-slug?slug=${encodeURIComponent(slug)}`);
      const data = await res.json();
      setAvailability(data.available ? "available" : "taken");
    } catch { setAvailability(null); }
    finally { setChecking(false); }
  };

  const handleDraftChange = (e) => {
    // Auto-slug format: lowercase, hyphens only
    const clean = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "").replace(/-+/g, "-").slice(0, 60);
    setDraft(clean);
    setAvailability(null);
  };

  const autoGenerate = () => {
    if (!businessName) return;
    const slug = businessName.toLowerCase().trim()
      .replace(/[^a-z0-9\s-]/g, "").replace(/[\s]+/g, "-").replace(/-+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);
    setDraft(slug);
    setAvailability(null);
    setEditMode(true);
  };

  // Apply the slug locally AND immediately persist it to the DB
  const applyDraft = async () => {
    if (availability === "taken" || !draft) return;
    onChange(draft);  // update local form state
    setEditMode(false);
    // Immediately save just the slug to the DB so it's persisted even if
    // the user navigates away before clicking "Update Business Profile"
    if (onSave) {
      setSaving(true);
      try {
        await onSave(draft);
      } catch { /* non-fatal */ }
      finally { setSaving(false); }
    }
  };

  const copyUrl = () => {
    navigator.clipboard.writeText(storeUrl).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };

  const statusColor = availability === "available" ? "#22c55e" : availability === "taken" ? "#ef4444" : p?.textPrimary;
  const statusText = checking ? "Checking…" : availability === "available" ? "Available ✓" : availability === "taken" ? "Already taken" : "";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      <FieldLabel pax26={p}>Your Store URL (Slug)</FieldLabel>

      {/* Current slug display / edit toggle */}
      {!editMode ? (
        <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: "200px", display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", borderRadius: "10px", background: p?.secondaryBg, border: `1px solid ${p?.border}` }}>
            <span style={{ fontSize: "13px", color: p?.textPrimary, opacity: 0.5 }}>{typeof window !== "undefined" ? window.location.origin : ""}/store/</span>
            <span style={{ fontSize: "13px", fontWeight: 700, color: value ? p?.primary : p?.textPrimary, opacity: value ? 1 : 0.4 }}>
              {value || "not set yet"}
            </span>
          </div>
          {value && (
            <button onClick={copyUrl} title="Copy store link" style={{ padding: "10px 12px", borderRadius: "10px", border: `1px solid ${p?.border}`, background: p?.secondaryBg, color: copied ? "#22c55e" : p?.textPrimary, cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: 600 }}>
              <CopyIcon /> {copied ? "Copied!" : "Copy"}
            </button>
          )}
          {value && (
            <a href={`/store/${value}`} target="_blank" rel="noopener noreferrer" style={{ padding: "10px 14px", borderRadius: "10px", border: `1px solid ${p?.primary}44`, background: `${p?.primary}10`, color: p?.primary, cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: 700, textDecoration: "none" }}>
              <LinkIcon /> View My Store
            </a>
          )}
          <button onClick={() => setEditMode(true)} style={{ padding: "10px 14px", borderRadius: "10px", border: `1px solid ${p?.border}`, background: "transparent", color: p?.textPrimary, cursor: "pointer", fontSize: "12px", fontWeight: 600 }}>
            {value ? "Edit" : "Set Slug"}
          </button>
          {!value && businessName && (
            <button onClick={autoGenerate} style={{ padding: "10px 14px", borderRadius: "10px", border: `1px solid ${p?.border}`, background: "transparent", color: p?.primary, cursor: "pointer", fontSize: "12px", fontWeight: 600 }}>
              Auto-generate
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: "200px", display: "flex", alignItems: "center", borderRadius: "10px", overflow: "hidden", border: `1px solid ${availability === "taken" ? "#ef4444" : availability === "available" ? "#22c55e" : p?.primary}`, boxShadow: `0 0 0 3px ${p?.primary}18` }}>
              <span style={{ padding: "10px 10px 10px 14px", fontSize: "13px", color: p?.textPrimary, opacity: 0.45, whiteSpace: "nowrap", background: p?.secondaryBg, borderRight: `1px solid ${p?.border}` }}>
                /store/
              </span>
              <input
                value={draft}
                onChange={handleDraftChange}
                onBlur={() => checkSlug(draft)}
                placeholder="your-store-name"
                autoFocus
                style={{ flex: 1, padding: "10px 12px", fontSize: "14px", fontWeight: 600, background: p?.secondaryBg, color: p?.textPrimary, border: "none", outline: "none", fontFamily: "inherit" }}
              />
            </div>
            <button onClick={applyDraft} disabled={availability === "taken" || !draft || saving || checking} style={{ padding: "10px 16px", borderRadius: "10px", border: "none", background: availability === "taken" || !draft ? p?.border : p?.primary, color: "#fff", fontWeight: 700, fontSize: "13px", cursor: availability === "taken" || !draft ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
              {saving ? <><div style={{ width: "13px", height: "13px", border: "2px solid #ffffff40", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} /> Saving…</> : "Save"}
            </button>
            <button onClick={() => { setDraft(value || ""); setEditMode(false); setAvailability(null); }} style={{ padding: "10px 14px", borderRadius: "10px", border: `1px solid ${p?.border}`, background: "transparent", color: p?.textPrimary, fontSize: "12px", fontWeight: 600, cursor: "pointer" }}>
              Cancel
            </button>
          </div>
          {statusText && (
            <p style={{ fontSize: "12px", fontWeight: 600, color: statusColor, margin: "0 2px" }}>{statusText}</p>
          )}
          <p style={{ fontSize: "11px", color: p?.textPrimary, opacity: 0.45, margin: "0 2px" }}>
            Only lowercase letters, numbers, and hyphens. This becomes your public store URL.
          </p>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   MAIN DASHBOARD COMPONENT
══════════════════════════════════════════════════════════ */
export default function AiBusinessDashboard() {
  const { pax26, router, userData, fetchUser } = useGlobalContext();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState(null);
  const [showSwitchModal, setShowSwitchModal] = useState(false);
  const [switchingType, setSwitchingType] = useState(false);
  const [selectingType, setSelectingType] = useState(false);
  const [selectedTarget, setSelectedTarget] = useState(null);

  const businessType = userData?.paxAI?.businessType ?? null; // null | "seller" | "service"
  const p = pax26;

  // Sync default tab when type changes
  useEffect(() => {
    if (businessType === "seller") setActiveTab("profile");
    else if (businessType === "service") setActiveTab("services");
    else setActiveTab(null);
  }, [businessType]);

  const [form, setForm] = useState({
    sellerId: "",
    businessName: "",
    businessDescription: "",
    industry: "",
    tone: "friendly",
    autoReplyEnabled: true,
    followUpEnabled: true,
    followUpDelayMinutes: 30,
    currency: "NGN",
    workingHours: "",
    onlineStoreUrl: "",
    liveLocation: "",
    deliveryCoverage: "",
    fulfillmentSettings: { allowDelivery: true, allowPickup: false, pickupAddress: "", pickupInstructions: "" },
    slug: "",
    logoUrl: "",
    storeTheme: "classic",
    emailSalesAlerts: true,
    spamAutoHandoff: true,
    spamThreshold: 10,
    promoAnnouncement: { enabled: false, text: "", badgeText: "PROMO" },
    customInstructions: "",
    paymentDetails: [],
    whatsappNumber: "",
    products: [],
    services: [],
    faqs: [],
  });

  // Fetch profile data based on active type (only after WhatsApp is linked)
  const fetchProfile = useCallback(async () => {
    const waOk = !!(userData?.whatsapp?.connected && userData?.whatsapp?.displayPhone);
    if (!businessType || !waOk) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const endpoint = businessType === "service" ? "/api/automations/general-train" : "/api/seller/profile";
      const res = await fetch(endpoint);
      const text = await res.text();
      let data = null;
      try {
        data = text ? JSON.parse(text) : null;
      } catch {
        console.error("fetchProfile: invalid JSON", text?.slice(0, 120));
        return;
      }
      if (data?.success && data.profile) {
        const profile = data.profile;
        setForm(f => ({
          ...f,
          sellerId: profile._id || "",
          businessName: profile.businessName || "",
          businessDescription: profile.businessDescription || profile.description || "",
          industry: profile.industry || "",
          tone: profile.tone || "friendly",
          autoReplyEnabled: profile.autoReplyEnabled ?? true,
          followUpEnabled: profile.followUpEnabled ?? true,
          followUpDelayMinutes: profile.followUpDelayMinutes || 30,
          currency: profile.currency || "NGN",
          whatsappNumber: profile.whatsappNumber || userData?.whatsapp?.displayPhone || "",
          workingHours: profile.workingHours || "",
          onlineStoreUrl: profile.onlineStoreUrl || "",
          liveLocation: profile.liveLocation || "",
          deliveryCoverage: profile.deliveryCoverage || "",
          fulfillmentSettings: profile.fulfillmentSettings || { allowDelivery: true, allowPickup: false, pickupAddress: "", pickupInstructions: "" },
          slug: profile.slug || "",
          logoUrl: profile.logoUrl || "",
          storeTheme: profile.storeTheme || "classic",
          emailSalesAlerts: profile.emailSalesAlerts !== false,
          spamAutoHandoff: profile.spamAutoHandoff !== false,
          spamThreshold: profile.spamThreshold || 10,
          promoAnnouncement: profile.promoAnnouncement || { enabled: false, text: "", badgeText: "PROMO" },
          customInstructions: profile.customInstructions || "",
          paymentDetails: profile.paymentDetails || [],
          products: profile.products || [],
          services: profile.services || [],
          faqs: profile.faqs || [],
        }));
      }
    } catch (e) {
      console.error("fetchProfile error:", e);
    } finally {
      setLoading(false);
    }
  }, [businessType, userData?.whatsapp?.connected, userData?.whatsapp?.displayPhone]);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  // Prefer live WhatsApp number from the authenticated user
  useEffect(() => {
    const phone = userData?.whatsapp?.displayPhone;
    if (phone) setForm((f) => (f.whatsappNumber === phone ? f : { ...f, whatsappNumber: phone }));
  }, [userData?.whatsapp?.displayPhone]);

  // ── First-time type selection ────────────────────────────
  const handleSetType = async (newType) => {
    setSelectedTarget(newType);
    setSelectingType(true);
    try {
      const res = await fetch("/api/automations/set-type", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newType }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchUser?.();
      } else {
        alert("Could not set business type: " + (data.message || "Unknown error"));
      }
    } catch (err) {
      console.error("Set type error:", err);
      alert("An error occurred. Please try again.");
    } finally {
      setSelectingType(false);
      setSelectedTarget(null);
    }
  };

  // ── Clear type and reset to picker ──────────────────────
  const handleSwitchType = async () => {
    setSwitchingType(true);
    try {
      const res = await fetch("/api/automations/switch-type", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (data.success) {
        setShowSwitchModal(false);
        setForm(f => ({ ...f, products: [], services: [], faqs: [], paymentDetails: [] }));
        await fetchUser?.();
      } else {
        alert("Failed: " + (data.message || "Unknown error"));
      }
    } catch (err) {
      console.error("Switch type error:", err);
      alert("An error occurred. Please try again.");
    } finally {
      setSwitchingType(false);
    }
  };

  // ── Save profile ─────────────────────────────────────────
  const saveProfile = async (explicitData = null) => {
    setSaving(true);
    try {
      const dataToSave = explicitData || form;
      const endpoint = businessType === "service" ? "/api/automations/general-train" : "/api/seller/profile";
      const method = businessType === "service" ? "PUT" : "POST";
      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSave),
      });
      const data = await res.json();
      if (data.success) {
        if (data.profile) {
          setForm(f => ({
            ...f,
            ...data.profile,
            onlineStoreUrl: data.profile.onlineStoreUrl ?? f.onlineStoreUrl,
            liveLocation: data.profile.liveLocation ?? f.liveLocation,
            deliveryCoverage: data.profile.deliveryCoverage ?? f.deliveryCoverage,
            slug: data.profile.slug ?? f.slug,
            logoUrl: data.profile.logoUrl ?? f.logoUrl,
            storeTheme: data.profile.storeTheme ?? f.storeTheme,
            promoAnnouncement: data.profile.promoAnnouncement ?? f.promoAnnouncement,
            emailSalesAlerts: data.profile.emailSalesAlerts !== false,
            products: data.profile.products || f.products,
            services: data.profile.services || f.services,
            faqs: data.profile.faqs || f.faqs,
          }));
        }
        if (!explicitData) alert("Profile updated!");
      } else {
        alert("Save failed: " + (data.message || "Unknown error"));
      }
    } catch (e) {
      console.error("Save error:", e);
      alert("Error saving. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const whatsappConnected = !!(userData?.whatsapp?.connected && userData?.whatsapp?.displayPhone);

  // Wait for user profile before deciding gate vs dashboard
  if (!userData) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh" }}>
        <Spinner color={p?.primary} />
      </div>
    );
  }

  // ── Full-page WhatsApp gate ──────────────────────────────
  if (!whatsappConnected) {
    return <WhatsAppGate pax26={p} router={router} />;
  }

  // ── Loading ──────────────────────────────────────────────
  if (loading && businessType) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh" }}>
        <Spinner color={p?.primary} />
      </div>
    );
  }

  // ── Type picker (null state) ─────────────────────────────
  if (!businessType) {
    return (
      <TypePicker
        onSelect={handleSetType}
        selecting={selectingType}
        selectedTarget={selectedTarget}
        pax26={p}
      />
    );
  }

  const isSeller = businessType === "seller";
  const isService = businessType === "service";
  const isInactive = !userData?.paxAI?.trained || !userData?.paxAI?.enabled;

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "clamp(16px,4vw,32px) clamp(12px,4vw,20px)", minHeight: "100vh", display: "flex", flexDirection: "column", gap: "28px" }}>

      {/* ── Inactive banner ─────────────────────────────── */}
      {isInactive && (
        <div style={{ padding: "10px 14px", borderRadius: "12px", background: "#f59e0b12", border: "1px solid #f59e0b44", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: "1 1 auto" }}>
            <span style={{ fontSize: "14px" }}>⚠️</span>
            <div>
              <h4 style={{ margin: 0, fontSize: "12px", fontWeight: 700, color: p?.textPrimary }}>AI Automation Inactive</h4>
              <p style={{ margin: "1px 0 0", fontSize: "11px", color: p?.textPrimary, opacity: 0.75 }}>Complete setup wizard to start responding to customers.</p>
            </div>
          </div>
          <button onClick={() => router.push("/dashboard/automations/training")} style={{ padding: "7px 14px", borderRadius: "8px", background: p?.primary, color: "#fff", border: "none", fontWeight: 700, fontSize: "12px", cursor: "pointer", whiteSpace: "nowrap" }}>
            Train Smart Agent
          </button>
        </div>
      )}

      {/* ── Header ──────────────────────────────────────── */}
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "16px" }}>
        <div style={{ flex: "1 1 280px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(20px, 4vw, 26px)", fontWeight: 900, color: p?.textPrimary, margin: 0, letterSpacing: "-0.03em" }}>
              {isSeller ? "Seller Dashboard" : "Service Provider Dashboard"}
            </h1>
            <span style={{ fontSize: "10px", fontWeight: 800, padding: "4px 10px", borderRadius: "99px", background: isSeller ? `${p?.primary}18` : "#8b5cf618", color: isSeller ? p?.primary : "#8b5cf6", textTransform: "uppercase", letterSpacing: "0.06em", whiteSpace: "nowrap" }}>
              {isSeller ? "Seller" : "Service Provider"}
            </span>
          </div>
          <p style={{ fontSize: "13px", color: p?.textPrimary, opacity: 0.55, margin: "4px 0 0" }}>
            {isSeller ? "Manage your products, business profile and Smart Agent." : "Manage your services, FAQs and Smart Agent."}
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
          <button onClick={() => setShowSwitchModal(true)} style={{ padding: "9px 16px", borderRadius: "12px", border: `1px solid ${p?.border}`, background: "transparent", color: p?.textPrimary, fontSize: "13px", fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>
            Change Business Type
          </button>
          <button onClick={() => router.push("/dashboard/automations")} style={{ padding: "9px 16px", borderRadius: "12px", border: `1px solid ${p?.border}`, background: "transparent", color: p?.textPrimary, fontSize: "13px", fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>
            ← Back
          </button>
        </div>
      </div>

      {/* ── Switch type confirmation modal ──────────────── */}
      {showSwitchModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: "20px" }}>
          <div style={{ background: p?.secondaryBg, borderRadius: "24px", padding: "32px", maxWidth: "460px", width: "100%", border: `1px solid ${p?.border}`, boxShadow: "0 24px 60px rgba(0,0,0,0.35)" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: "#ff444418", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px", fontSize: "22px" }}>⚠️</div>
            <h3 style={{ fontSize: "20px", fontWeight: 900, color: p?.textPrimary, margin: "0 0 10px" }}>Change Business Type?</h3>
            <p style={{ fontSize: "14px", color: p?.textPrimary, opacity: 0.7, lineHeight: 1.65, margin: "0 0 8px" }}>
              This will <strong>permanently delete</strong> all your current {isSeller ? "products, inventory and payment details" : "services and FAQs"}.
            </p>
            <p style={{ fontSize: "13px", color: p?.textPrimary, opacity: 0.55, lineHeight: 1.6, margin: "0 0 28px" }}>
              Your WhatsApp number will be preserved. After clearing, you will be returned to the business type picker to choose again.
            </p>
            <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", flexWrap: "wrap" }}>
              <button onClick={() => setShowSwitchModal(false)} disabled={switchingType} style={{ padding: "12px 22px", borderRadius: "12px", border: `1px solid ${p?.border}`, background: "transparent", color: p?.textPrimary, fontWeight: 700, cursor: "pointer", fontSize: "14px" }}>
                Cancel
              </button>
              <button onClick={handleSwitchType} disabled={switchingType} style={{ padding: "12px 24px", borderRadius: "12px", border: "none", background: "#ff4444", color: "#fff", fontWeight: 800, cursor: switchingType ? "not-allowed" : "pointer", fontSize: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
                {switchingType ? <><Spinner /> Clearing…</> : "Yes, Clear & Switch"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Tabs navigation ─────────────────────────────── */}
      <div style={{ display: "flex", gap: "4px", padding: "6px", background: p?.secondaryBg, borderRadius: "16px", border: `1px solid ${p?.border}`, overflowX: "auto" }}>
        {isSeller && (
          <>
            <DashboardTab label="Business Info" icon={StoreIcon} active={activeTab === "profile"} onClick={() => setActiveTab("profile")} pax26={p} />
            <DashboardTab label="Overview" icon={ClipboardIcon} active={activeTab === "overview"} onClick={() => setActiveTab("overview")} pax26={p} />
            <button
              onClick={() => router.push("/dashboard/automations/products")}
              style={{ display: "flex", alignItems: "center", gap: "6px", padding: "10px 18px", border: "none", background: "transparent", color: p?.textPrimary, borderRadius: "12px", cursor: "pointer", fontWeight: 600, fontSize: "13px", opacity: 0.6, whiteSpace: "nowrap" }}
              onMouseEnter={e => { e.currentTarget.style.background = `${p?.primary}15`; e.currentTarget.style.color = p?.primary; e.currentTarget.style.opacity = "1"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = p?.textPrimary; e.currentTarget.style.opacity = "0.6"; }}
            >
              <PackageIcon /> Products ↗
            </button>
          </>
        )}
        {isService && (
          <>
            <DashboardTab label="Services & FAQs" icon={ClipboardIcon} active={activeTab === "services"} onClick={() => setActiveTab("services")} pax26={p} />
            <DashboardTab label="Business Info" icon={StoreIcon} active={activeTab === "profile"} onClick={() => setActiveTab("profile")} pax26={p} />
            <DashboardTab label="Overview" icon={MessageCircleIcon} active={activeTab === "overview"} onClick={() => setActiveTab("overview")} pax26={p} />
          </>
        )}
      </div>

      {/* ── Tab content ─────────────────────────────────── */}
      <AnimatePresence mode="wait">
        <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.18 }} style={{ flex: 1 }}>

          {/* ════ SERVICE: Services & FAQs tab ════ */}
          {isService && activeTab === "services" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
                <h2 style={{ fontSize: "20px", fontWeight: 800, color: p?.textPrimary, margin: 0 }}>Services & FAQs</h2>
                <button onClick={() => saveProfile()} disabled={saving} style={{ padding: "10px 20px", borderRadius: "12px", background: "#8b5cf6", color: "#fff", fontWeight: 800, border: "none", cursor: "pointer", fontSize: "13px", display: "flex", alignItems: "center", gap: "8px" }}>
                  {saving ? <><Spinner /> Saving…</> : "Save Changes"}
                </button>
              </div>

              <div style={{ background: p?.secondaryBg, padding: "28px", borderRadius: "24px", border: `1px solid ${p?.border}`, display: "flex", flexDirection: "column", gap: "32px" }}>
                {/* Services */}
                <div>
                  <h3 style={{ fontSize: "16px", fontWeight: 800, color: p?.textPrimary, margin: "0 0 14px" }}>Services Offered</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {form.services.map((svc, i) => (
                      <div key={i} style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                        <input value={svc} onChange={e => { const next = [...form.services]; next[i] = e.target.value; setForm(f => ({ ...f, services: next })); }} placeholder="e.g. Logo Design, Social Media Management" style={{ ...fieldBase(p), flex: 1 }} />
                        <button onClick={() => setForm(f => ({ ...f, services: f.services.filter((_, j) => j !== i) }))} style={{ padding: "10px", borderRadius: "10px", border: "none", background: "#ff444415", color: "#ff4444", cursor: "pointer", display: "flex", alignItems: "center" }}><TrashIcon /></button>
                      </div>
                    ))}
                    <button onClick={() => setForm(f => ({ ...f, services: [...f.services, ""] }))} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "10px 16px", borderRadius: "12px", border: `2px dashed ${p?.border}`, background: "transparent", color: p?.textPrimary, fontSize: "13px", fontWeight: 700, cursor: "pointer" }}>
                      <PlusIcon /> Add Service
                    </button>
                  </div>
                </div>

                {/* FAQs */}
                <div>
                  <h3 style={{ fontSize: "16px", fontWeight: 800, color: p?.textPrimary, margin: "0 0 14px" }}>Frequently Asked Questions</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                    {form.faqs.map((faq, i) => (
                      <div key={i} style={{ padding: "16px", borderRadius: "16px", border: `1px solid ${p?.border}`, background: p?.bg, display: "flex", flexDirection: "column", gap: "10px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontSize: "11px", fontWeight: 800, color: p?.textPrimary, opacity: 0.45 }}>FAQ #{i + 1}</span>
                          <button onClick={() => setForm(f => ({ ...f, faqs: f.faqs.filter((_, j) => j !== i) }))} style={{ padding: "5px", borderRadius: "7px", border: "none", background: "#ff444415", color: "#ff4444", cursor: "pointer", display: "flex", alignItems: "center" }}><TrashIcon /></button>
                        </div>
                        <input value={faq.question} onChange={e => { const next = form.faqs.map((f, j) => j === i ? { ...f, question: e.target.value } : f); setForm(f => ({ ...f, faqs: next })); }} placeholder="Question" style={{ ...fieldBase(p) }} />
                        <textarea value={faq.answer} onChange={e => { const next = form.faqs.map((f, j) => j === i ? { ...f, answer: e.target.value } : f); setForm(f => ({ ...f, faqs: next })); }} placeholder="Answer" rows={2} style={{ ...fieldBase(p), resize: "vertical" }} />
                      </div>
                    ))}
                    <button onClick={() => setForm(f => ({ ...f, faqs: [...f.faqs, { question: "", answer: "" }] }))} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "10px 16px", borderRadius: "12px", border: `2px dashed ${p?.border}`, background: "transparent", color: p?.textPrimary, fontSize: "13px", fontWeight: 700, cursor: "pointer" }}>
                      <PlusIcon /> Add FAQ
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ════ SHARED: Business Info tab ════ */}
          {activeTab === "profile" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "28px" }}>
              {/* Business Identity */}
              <section>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
                  <div style={{ width: "30px", height: "30px", borderRadius: "8px", background: `${p?.primary}15`, color: p?.primary, display: "flex", alignItems: "center", justifyContent: "center" }}><StoreIcon /></div>
                  <h3 style={{ fontSize: "18px", fontWeight: 800, color: p?.textPrimary, margin: 0 }}>Business Identity</h3>
                </div>
                <div style={{ background: p?.secondaryBg, padding: "28px", borderRadius: "24px", border: `1px solid ${p?.border}`, display: "flex", flexDirection: "column", gap: "20px" }}>
                  <ThemedInput label="Business Name" value={form.businessName} onChange={e => setForm(f => ({ ...f, businessName: e.target.value }))} pax26={p} />
                  <ThemedTextarea label="Tell the AI about your business" value={form.businessDescription} onChange={e => setForm(f => ({ ...f, businessDescription: e.target.value }))} pax26={p} rows={4} placeholder={isSeller ? "e.g. We are a premium fashion brand based in Lagos…" : "e.g. We are a digital marketing agency helping SMEs grow…"} />
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px" }}>
                    <ThemedInput label="Industry / Category" value={form.industry} onChange={e => setForm(f => ({ ...f, industry: e.target.value }))} pax26={p} placeholder={isSeller ? "e.g. Fashion, Electronics" : "e.g. Marketing, Legal, Design"} />
                    <ThemedInput label="Operating Hours" value={form.workingHours} onChange={e => setForm(f => ({ ...f, workingHours: e.target.value }))} pax26={p} placeholder="e.g. Mon-Sat 8am-9pm" />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px" }}>
                    <ThemedInput
                      label={isSeller ? "Online Store / Shop Link" : "Booking / Website Link"}
                      value={form.onlineStoreUrl}
                      onChange={e => setForm(f => ({ ...f, onlineStoreUrl: e.target.value }))}
                      pax26={p}
                      placeholder={isSeller ? "e.g. https://yourshop.com or Jumia/Konga store link" : "e.g. https://yoursite.com or Calendly booking link"}
                      type="url"
                    />
                    <ThemedInput
                      label="Business Location / Address"
                      value={form.liveLocation}
                      onChange={e => setForm(f => ({ ...f, liveLocation: e.target.value }))}
                      pax26={p}
                      placeholder="e.g. 15 Broad Street, Lagos Island, Lagos"
                    />
                  </div>
                  {/* ── SELLER ONLY: Delivery Coverage & Fulfillment ── */}
                  {isSeller && (
                    <>
                      <ThemedInput
                        label="Delivery Coverage Areas"
                        value={form.deliveryCoverage}
                        onChange={e => setForm(f => ({ ...f, deliveryCoverage: e.target.value }))}
                        pax26={p}
                        placeholder="e.g. Lagos, Ogun (or Nationwide)"
                      />

                      {/* ── Store Fulfillment & Pick-up Settings ── */}
                      <div style={{ paddingTop: "16px", borderTop: `1px solid ${p?.border}`, display: "flex", flexDirection: "column", gap: "16px" }}>
                        <FieldLabel pax26={p}>Fulfillment & Pick-up Options</FieldLabel>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px" }}>
                          <Toggle
                            label="Allow Home Delivery"
                            hint="Customers can enter their delivery address and order for delivery"
                            value={form.fulfillmentSettings?.allowDelivery ?? true}
                            onChange={v => setForm(f => ({ ...f, fulfillmentSettings: { ...(f.fulfillmentSettings || {}), allowDelivery: v } }))}
                            pax26={p}
                          />
                          <Toggle
                            label="Allow Store Pick-up"
                            hint="Customers can choose to pick up their order from your physical store"
                            value={form.fulfillmentSettings?.allowPickup ?? false}
                            onChange={v => setForm(f => ({ ...f, fulfillmentSettings: { ...(f.fulfillmentSettings || {}), allowPickup: v } }))}
                            pax26={p}
                          />
                        </div>

                        {form.fulfillmentSettings?.allowPickup && (
                          <div style={{ display: "flex", flexDirection: "column", gap: "14px", padding: "16px", borderRadius: "14px", background: p?.bg, border: `1px solid ${p?.border}` }}>
                            <ThemedInput
                              label="Pick-up Address"
                              value={form.fulfillmentSettings?.pickupAddress || ""}
                              onChange={e => setForm(f => ({ ...f, fulfillmentSettings: { ...(f.fulfillmentSettings || {}), pickupAddress: e.target.value } }))}
                              pax26={p}
                              placeholder="e.g. Suite 4, Ikeja Plaza, Allen Avenue, Lagos"
                            />
                            <ThemedInput
                              label="Pick-up Operating Hours / Instructions"
                              value={form.fulfillmentSettings?.pickupInstructions || ""}
                              onChange={e => setForm(f => ({ ...f, fulfillmentSettings: { ...(f.fulfillmentSettings || {}), pickupInstructions: e.target.value } }))}
                              pax26={p}
                              placeholder="e.g. Mon–Sat 9:00 AM – 6:00 PM. Bring your Order ID."
                            />
                          </div>
                        )}

                        {/* ── Delivery Pricing Model Selector ── */}
                        {form.fulfillmentSettings?.allowDelivery !== false && (
                          <div style={{ display: "flex", flexDirection: "column", gap: "14px", paddingTop: "14px", borderTop: `1px dashed ${p?.border}` }}>
                            <FieldLabel pax26={p}>Delivery Pricing Model</FieldLabel>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "10px" }}>
                              {[
                                { id: "flat", title: "Flat Rate Fee", desc: "Same delivery fee for all orders / products" },
                                { id: "zones", title: "Location-Based Zones", desc: "Delivery fee depends on buyer's area / state" },
                                { id: "quote", title: "Quote on WhatsApp", desc: "Delivery fee calculated after dispatch" },
                              ].map(model => {
                                const isSelected = (form.fulfillmentSettings?.deliveryModel || "flat") === model.id;
                                return (
                                  <button
                                    key={model.id}
                                    onClick={() => setForm(f => ({ ...f, fulfillmentSettings: { ...(f.fulfillmentSettings || {}), deliveryModel: model.id } }))}
                                    style={{
                                      padding: "12px 14px",
                                      borderRadius: "12px",
                                      border: isSelected ? `2px solid ${p?.primary}` : `1px solid ${p?.border}`,
                                      background: isSelected ? `${p?.primary}10` : p?.bg,
                                      cursor: "pointer",
                                      textAlign: "left",
                                      transition: "all 0.15s",
                                    }}
                                  >
                                    <p style={{ margin: 0, fontSize: "13px", fontWeight: 800, color: isSelected ? p?.primary : p?.textPrimary }}>{model.title}</p>
                                    <p style={{ margin: "2px 0 0", fontSize: "11px", color: p?.textPrimary, opacity: 0.5, lineHeight: 1.3 }}>{model.desc}</p>
                                  </button>
                                );
                              })}
                            </div>

                            {/* Location-Based Zones Manager */}
                            {form.fulfillmentSettings?.deliveryModel === "zones" && (
                              <div style={{ display: "flex", flexDirection: "column", gap: "16px", padding: "18px", borderRadius: "16px", background: p?.bg, border: `1px solid ${p?.border}` }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
                                  <div>
                                    <p style={{ margin: 0, fontSize: "14px", fontWeight: 800, color: p?.textPrimary }}>Delivery Zones & Rates</p>
                                    <p style={{ margin: "2px 0 0", fontSize: "11px", color: p?.textPrimary, opacity: 0.5 }}>Add delivery zones for your city, state or country. Buyers will select their area at checkout.</p>
                                  </div>
                                  {/* Quick Presets */}
                                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                                    <button
                                      onClick={() => setForm(f => ({
                                        ...f,
                                        fulfillmentSettings: {
                                          ...(f.fulfillmentSettings || {}),
                                          deliveryZones: [
                                            { name: "Lagos Local / Mainland", areas: "Ikeja, Yaba, Maryland, Surulere, Ojota", fee: 1500, timeframe: "Same Day" },
                                            { name: "Lagos Island / Outskirts", areas: "Lekki, Ajah, Ikoyi, Victoria Island", fee: 3000, timeframe: "1 Day" },
                                            { name: "Interstate / Other States", areas: "Abuja, Port Harcourt, Ibadan, etc.", fee: 4500, timeframe: "2–3 Days" },
                                          ]
                                        }
                                      }))}
                                      style={{ padding: "5px 10px", borderRadius: "8px", border: `1px solid ${p?.border}`, background: p?.secondaryBg, color: p?.textPrimary, fontSize: "11px", fontWeight: 700, cursor: "pointer" }}
                                    >
                                      📍 Load Lagos Presets
                                    </button>
                                    <button
                                      onClick={() => setForm(f => ({
                                        ...f,
                                        fulfillmentSettings: {
                                          ...(f.fulfillmentSettings || {}),
                                          deliveryZones: [
                                            { name: "Abuja Central", areas: "Wuse, Maitama, Garki, Asokoro", fee: 1500, timeframe: "Same Day" },
                                            { name: "Abuja Outer Districts", areas: "Gwarinpa, Kubwa, Lugbe, Utako", fee: 2500, timeframe: "1 Day" },
                                            { name: "Interstate / Other States", areas: "Lagos, Port Harcourt, Kano, etc.", fee: 4500, timeframe: "2–3 Days" },
                                          ]
                                        }
                                      }))}
                                      style={{ padding: "5px 10px", borderRadius: "8px", border: `1px solid ${p?.border}`, background: p?.secondaryBg, color: p?.textPrimary, fontSize: "11px", fontWeight: 700, cursor: "pointer" }}
                                    >
                                      📍 Load Abuja Presets
                                    </button>
                                    <button
                                      onClick={() => setForm(f => ({
                                        ...f,
                                        fulfillmentSettings: {
                                          ...(f.fulfillmentSettings || {}),
                                          deliveryZones: [
                                            { name: "Port Harcourt Central", areas: "GRA, Peter Odili, Trans Amadi", fee: 1500, timeframe: "Same Day" },
                                            { name: "Port Harcourt Outer", areas: "Rumuokwuta, Choba, Oyigbo", fee: 2500, timeframe: "1 Day" },
                                            { name: "Interstate / Other States", areas: "Lagos, Abuja, Enugu, etc.", fee: 4500, timeframe: "2–3 Days" },
                                          ]
                                        }
                                      }))}
                                      style={{ padding: "5px 10px", borderRadius: "8px", border: `1px solid ${p?.border}`, background: p?.secondaryBg, color: p?.textPrimary, fontSize: "11px", fontWeight: 700, cursor: "pointer" }}
                                    >
                                      📍 Load PH Presets
                                    </button>
                                  </div>
                                </div>

                                {/* Zones List */}
                                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                  {(form.fulfillmentSettings?.deliveryZones || []).map((zone, idx) => (
                                    <div key={idx} style={{ padding: "14px", borderRadius: "12px", background: p?.secondaryBg, border: `1px solid ${p?.border}`, display: "flex", flexDirection: "column", gap: "10px" }}>
                                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px" }}>
                                        <span style={{ fontSize: "12px", fontWeight: 800, color: p?.primary }}>Zone #{idx + 1}</span>
                                        <button
                                          onClick={() => {
                                            const updatedZones = (form.fulfillmentSettings?.deliveryZones || []).filter((_, i) => i !== idx);
                                            setForm(f => ({ ...f, fulfillmentSettings: { ...(f.fulfillmentSettings || {}), deliveryZones: updatedZones } }));
                                          }}
                                          style={{ padding: "4px 8px", borderRadius: "6px", border: "none", background: "#ff444415", color: "#ff4444", fontSize: "11px", fontWeight: 700, cursor: "pointer" }}
                                        >
                                          Remove Zone
                                        </button>
                                      </div>

                                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "10px" }}>
                                        <div>
                                          <label style={{ display: "block", fontSize: "10px", fontWeight: 700, color: p?.textPrimary, opacity: 0.5, marginBottom: "4px" }}>Zone Name</label>
                                          <input
                                            value={zone.name || ""}
                                            onChange={e => {
                                              const updatedZones = [...(form.fulfillmentSettings?.deliveryZones || [])];
                                              updatedZones[idx] = { ...updatedZones[idx], name: e.target.value };
                                              setForm(f => ({ ...f, fulfillmentSettings: { ...(f.fulfillmentSettings || {}), deliveryZones: updatedZones } }));
                                            }}
                                            placeholder="e.g. Lagos Island"
                                            style={{ ...fieldBase(p), padding: "8px 10px", fontSize: "12px" }}
                                          />
                                        </div>
                                        <div>
                                          <label style={{ display: "block", fontSize: "10px", fontWeight: 700, color: p?.textPrimary, opacity: 0.5, marginBottom: "4px" }}>Covered Areas / Cities</label>
                                          <input
                                            value={zone.areas || ""}
                                            onChange={e => {
                                              const updatedZones = [...(form.fulfillmentSettings?.deliveryZones || [])];
                                              updatedZones[idx] = { ...updatedZones[idx], areas: e.target.value };
                                              setForm(f => ({ ...f, fulfillmentSettings: { ...(f.fulfillmentSettings || {}), deliveryZones: updatedZones } }));
                                            }}
                                            placeholder="e.g. Lekki, Ajah, Ikoyi"
                                            style={{ ...fieldBase(p), padding: "8px 10px", fontSize: "12px" }}
                                          />
                                        </div>
                                        <div>
                                          <label style={{ display: "block", fontSize: "10px", fontWeight: 700, color: p?.textPrimary, opacity: 0.5, marginBottom: "4px" }}>Delivery Fee ({form.currency || "NGN"})</label>
                                          <input
                                            type="number"
                                            value={zone.fee || 0}
                                            onChange={e => {
                                              const updatedZones = [...(form.fulfillmentSettings?.deliveryZones || [])];
                                              updatedZones[idx] = { ...updatedZones[idx], fee: Number(e.target.value) || 0 };
                                              setForm(f => ({ ...f, fulfillmentSettings: { ...(f.fulfillmentSettings || {}), deliveryZones: updatedZones } }));
                                            }}
                                            placeholder="e.g. 3000"
                                            style={{ ...fieldBase(p), padding: "8px 10px", fontSize: "12px" }}
                                          />
                                        </div>
                                        <div>
                                          <label style={{ display: "block", fontSize: "10px", fontWeight: 700, color: p?.textPrimary, opacity: 0.5, marginBottom: "4px" }}>Timeframe</label>
                                          <input
                                            value={zone.timeframe || ""}
                                            onChange={e => {
                                              const updatedZones = [...(form.fulfillmentSettings?.deliveryZones || [])];
                                              updatedZones[idx] = { ...updatedZones[idx], timeframe: e.target.value };
                                              setForm(f => ({ ...f, fulfillmentSettings: { ...(f.fulfillmentSettings || {}), deliveryZones: updatedZones } }));
                                            }}
                                            placeholder="e.g. 1-2 Business Days"
                                            style={{ ...fieldBase(p), padding: "8px 10px", fontSize: "12px" }}
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  ))}

                                  <button
                                    onClick={() => {
                                      const currentZones = form.fulfillmentSettings?.deliveryZones || [];
                                      setForm(f => ({
                                        ...f,
                                        fulfillmentSettings: {
                                          ...(f.fulfillmentSettings || {}),
                                          deliveryZones: [...currentZones, { name: "", areas: "", fee: 0, timeframe: "" }]
                                        }
                                      }));
                                    }}
                                    style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", padding: "10px", borderRadius: "10px", border: `2px dashed ${p?.border}`, background: "transparent", color: p?.primary, fontSize: "12px", fontWeight: 700, cursor: "pointer" }}
                                  >
                                    ➕ Add Custom Zone
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  <InfoBanner pax26={p} text="Your <strong>online store link</strong> and <strong>location</strong> will be shared with customers by your Smart Agent when they ask where to buy or find you." />
                </div>
              </section>

              {/* ── Storefront — SELLER ONLY ─────────────────── */}
              {isSeller && (
                <section>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
                    <div style={{ width: "30px", height: "30px", borderRadius: "8px", background: `${p?.primary}15`, color: p?.primary, display: "flex", alignItems: "center", justifyContent: "center" }}><LinkIcon /></div>
                    <h3 style={{ fontSize: "18px", fontWeight: 800, color: p?.textPrimary, margin: 0 }}>Your Pax26 Storefront</h3>
                  </div>
                  <div style={{ background: p?.secondaryBg, padding: "28px", borderRadius: "24px", border: `1px solid ${p?.border}`, display: "flex", flexDirection: "column", gap: "20px" }}>
                    <InfoBanner pax26={p} text="Your <strong>free storefront</strong> lets customers browse your products online. Your Smart Agent will share this link on WhatsApp. You can also preview it exactly as your customers see it." />
                    <SlugField
                      value={form.slug}
                      onChange={slug => setForm(f => ({ ...f, slug }))}
                      onSave={async (slug) => {
                        // Immediately persist slug to DB — don't make the user
                        // also click "Update Business Profile"
                        const res = await fetch("/api/seller/profile", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ ...form, slug }),
                        });
                        const data = await res.json();
                        if (data.success && data.profile) {
                          setForm(f => ({ ...f, slug: data.profile.slug ?? slug }));
                        }
                      }}
                      pax26={p}
                      businessName={form.businessName}
                    />

                    {/* ── Theme Picker ── */}
                    <div>
                      <FieldLabel pax26={p}>Store Theme</FieldLabel>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: "10px", marginTop: "4px" }}>
                        {THEME_LIST.map(theme => {
                          const isSelected = form.storeTheme === theme.id;
                          return (
                            <button
                              key={theme.id}
                              onClick={() => setForm(f => ({ ...f, storeTheme: theme.id }))}
                              style={{
                                padding: "12px 14px",
                                borderRadius: "12px",
                                border: isSelected ? `2px solid ${p?.primary}` : `1.5px solid ${p?.border}`,
                                background: isSelected ? `${p?.primary}10` : p?.secondaryBg,
                                cursor: "pointer",
                                textAlign: "left",
                                transition: "all 0.15s",
                                boxShadow: isSelected ? `0 0 0 3px ${p?.primary}18` : "none",
                              }}
                            >
                              {/* Color dots preview */}
                              <div style={{ display: "flex", gap: "4px", marginBottom: "8px" }}>
                                {theme.preview.map((color, i) => (
                                  <div key={i} style={{ width: "16px", height: "16px", borderRadius: "50%", background: color, border: "1px solid rgba(0,0,0,0.1)", flexShrink: 0 }} />
                                ))}
                              </div>
                              <p style={{ margin: 0, fontSize: "13px", fontWeight: 700, color: p?.textPrimary }}>{theme.name}</p>
                              <p style={{ margin: "2px 0 0", fontSize: "10px", color: p?.textPrimary, opacity: 0.5, lineHeight: 1.4 }}>{theme.description}</p>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* ── Promo Announcement settings ── */}
                    <div style={{ paddingTop: "16px", borderTop: `1px solid ${p?.border}`, display: "flex", flexDirection: "column", gap: "16px" }}>
                      <FieldLabel pax26={p}>Storefront Promo Announcement Banner</FieldLabel>
                      <Toggle
                        label="Enable Storefront Promo Banner"
                        hint="Display a glowing promo announcement banner on your storefront & inform the Smart Agent"
                        value={form.promoAnnouncement?.enabled || false}
                        onChange={v => setForm(f => ({ ...f, promoAnnouncement: { ...(f.promoAnnouncement || {}), enabled: v } }))}
                        pax26={p}
                      />
                      {form.promoAnnouncement?.enabled && (
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: "14px" }}>
                          <ThemedInput
                            label="Badge Text"
                            value={form.promoAnnouncement?.badgeText || "PROMO"}
                            onChange={e => setForm(f => ({ ...f, promoAnnouncement: { ...(f.promoAnnouncement || {}), badgeText: e.target.value } }))}
                            pax26={p}
                            placeholder="e.g. PROMO, SPECIAL DEAL"
                          />
                          <ThemedInput
                            label="Promo Announcement Text"
                            value={form.promoAnnouncement?.text || ""}
                            onChange={e => setForm(f => ({ ...f, promoAnnouncement: { ...(f.promoAnnouncement || {}), text: e.target.value } }))}
                            pax26={p}
                            placeholder="e.g. Buy 10 items to get 1 free delivery in Lagos!"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </section>
              )}

              {/* AI Settings */}
              <section>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
                  <div style={{ width: "30px", height: "30px", borderRadius: "8px", background: `${p?.primary}15`, color: p?.primary, display: "flex", alignItems: "center", justifyContent: "center" }}><SlidersIcon /></div>
                  <h3 style={{ fontSize: "18px", fontWeight: 800, color: p?.textPrimary, margin: 0 }}>Smart Agent Settings</h3>
                </div>
                <div style={{ background: p?.secondaryBg, padding: "28px", borderRadius: "24px", border: `1px solid ${p?.border}`, display: "flex", flexDirection: "column", gap: "20px" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px" }}>
                    <ThemedSelect label="AI Conversation Tone" value={form.tone} onChange={v => setForm(f => ({ ...f, tone: v }))} options={[{ value: "friendly", label: "Friendly — Warm & Helpful" }, { value: "salesy", label: "Salesy — Persuasive & Bold" }, { value: "professional", label: "Professional — Calm & Clear" }]} pax26={p} />
                    {isSeller && (
                      <ThemedSelect label="Preferred Currency" value={form.currency} onChange={v => setForm(f => ({ ...f, currency: v }))} options={CURRENCY_OPTIONS} pax26={p} />
                    )}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
                    <Toggle label="Auto-Reply" hint="AI responds instantly to inquiries" value={form.autoReplyEnabled} onChange={v => setForm(f => ({ ...f, autoReplyEnabled: v }))} pax26={p} />
                    <Toggle label="Smart Follow-up" hint="AI follows up with leads after a delay" value={form.followUpEnabled} onChange={v => setForm(f => ({ ...f, followUpEnabled: v }))} pax26={p} />
                    {isSeller && (
                      <Toggle label="Payment Email Alerts" hint="Get an email when a customer sends payment proof" value={form.emailSalesAlerts !== false} onChange={v => setForm(f => ({ ...f, emailSalesAlerts: v }))} pax26={p} />
                    )}
                    {isSeller && (
                      <Toggle label="Spam Auto-Handoff" hint="Auto-pause AI for 24h if a contact sends too many messages with no intent to buy" value={form.spamAutoHandoff !== false} onChange={v => setForm(f => ({ ...f, spamAutoHandoff: v }))} pax26={p} />
                    )}
                  </div>
                  {isSeller && form.spamAutoHandoff !== false && (
                    <div style={{ paddingTop: "4px" }}>
                      <ThemedSelect
                        label="Spam handoff threshold"
                        pax26={p}
                        value={String(form.spamThreshold || 10)}
                        onChange={v => setForm(f => ({ ...f, spamThreshold: parseInt(v) }))}
                        options={[
                          { value: "5",  label: "5 messages — Very strict" },
                          { value: "10", label: "10 messages — Recommended" },
                          { value: "15", label: "15 messages — Lenient" },
                          { value: "20", label: "20 messages — Very lenient" },
                        ]}
                      />
                      <p style={{ margin: "6px 0 0", fontSize: "11px", color: p?.textPrimary, opacity: 0.45 }}>
                        If a contact sends this many messages with no buying intent, AI pauses for 24 hours.
                      </p>
                    </div>
                  )}

                  {/* ── Custom AI Instructions (optional) ── */}
                  <div style={{ paddingTop: "16px", borderTop: `1px solid ${p?.border}`, display: "flex", flexDirection: "column", gap: "10px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div>
                        <FieldLabel pax26={p}>Custom AI Instructions <span style={{ fontSize: "11px", fontWeight: 600, padding: "2px 8px", borderRadius: "99px", background: `${p?.primary}15`, color: p?.primary, marginLeft: "6px" }}>Optional</span></FieldLabel>
                        <p style={{ margin: "4px 0 0", fontSize: "12px", color: p?.textPrimary, opacity: 0.5, lineHeight: 1.55 }}>
                          Add your own policies, greetings, or disclaimers. These are injected after all core rules and <strong>cannot override security or pricing guardrails</strong>. Max 400 words.
                        </p>
                      </div>
                    </div>
                    <textarea
                      value={form.customInstructions || ""}
                      onChange={e => setForm(f => ({ ...f, customInstructions: e.target.value.slice(0, 2000) }))}
                      rows={5}
                      placeholder={isSeller
                        ? 'e.g. Always greet customers with "Welcome to [Store Name] 👑". No refunds after 48 hours. Delivery takes 2–3 working days. Do not accept cash on delivery.'
                        : 'e.g. Always address clients formally. Our consultation fee starts at ₦20,000. Do not discuss pricing for bespoke packages — direct them to book a call.'}
                      style={{
                        ...fieldBase(p),
                        resize: "vertical",
                        lineHeight: 1.6,
                        fontSize: "13px",
                      }}
                    />
                    <p style={{ margin: 0, fontSize: "11px", color: p?.textPrimary, opacity: 0.4 }}>
                      {(form.customInstructions || "").length}/2000 characters
                    </p>
                  </div>
                </div>
              </section>

              {/* Payment Methods */}
              <section>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
                  <div style={{ width: "30px", height: "30px", borderRadius: "8px", background: `${p?.primary}15`, color: p?.primary, display: "flex", alignItems: "center", justifyContent: "center" }}><CreditCardIcon /></div>
                  <h3 style={{ fontSize: "18px", fontWeight: 800, color: p?.textPrimary, margin: 0 }}>Payment Methods</h3>
                </div>
                <div style={{ background: p?.secondaryBg, padding: "28px", borderRadius: "24px", border: `1px solid ${p?.border}` }}>
                  <InfoBanner pax26={p} text="Add your bank details below. Your AI will share them with customers when they are ready to purchase or pay for services." />
                  <div style={{ marginTop: "18px" }}>
                    <PaymentBuilder payments={form.paymentDetails} onChange={v => { const updated = { ...form, paymentDetails: v }; setForm(updated); saveProfile(updated); }} pax26={p} />
                  </div>
                </div>
              </section>

              <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
                <button onClick={() => saveProfile()} disabled={saving} style={{ padding: "14px 36px", borderRadius: "16px", background: p?.secondaryBg, color: p?.textPrimary, fontWeight: 700, fontSize: "14px", border: `1px solid ${p?.border}`, cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}>
                  {saving ? <><Spinner /> Saving…</> : "Save Business Profile"}
                </button>
                {isInactive && (
                  <button onClick={() => router.push("/dashboard/automations/training")} style={{ padding: "14px 36px", borderRadius: "16px", background: p?.primary, color: "#fff", fontWeight: 800, fontSize: "14px", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", boxShadow: `0 10px 28px ${p?.primary}44` }}>
                    Train & Launch Agent 🚀
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ════ SHARED: Overview tab ════ */}
          {activeTab === "overview" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px" }}>
                {/* Stat: Products/Services */}
                <div style={{ background: p?.secondaryBg, padding: "28px", borderRadius: "24px", border: `1px solid ${p?.border}`, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: `${p?.primary}10`, display: "flex", alignItems: "center", justifyContent: "center", color: p?.primary, marginBottom: "14px" }}><PackageIcon /></div>
                  <p style={{ fontSize: "13px", color: p?.textPrimary, opacity: 0.55, margin: "0 0 4px" }}>{isSeller ? "Active Products" : "Services Listed"}</p>
                  <h3 style={{ fontSize: "34px", fontWeight: 900, color: p?.textPrimary, margin: 0 }}>{isSeller ? form.products.length : form.services.length}</h3>
                </div>
                {/* Stat: FAQs (service only) or Payment methods (seller) */}
                {isService && (
                  <div style={{ background: p?.secondaryBg, padding: "28px", borderRadius: "24px", border: `1px solid ${p?.border}`, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: "#8b5cf615", display: "flex", alignItems: "center", justifyContent: "center", color: "#8b5cf6", marginBottom: "14px" }}><ClipboardIcon /></div>
                    <p style={{ fontSize: "13px", color: p?.textPrimary, opacity: 0.55, margin: "0 0 4px" }}>FAQs Configured</p>
                    <h3 style={{ fontSize: "34px", fontWeight: 900, color: p?.textPrimary, margin: 0 }}>{form.faqs.length}</h3>
                  </div>
                )}
                {/* Stat: AI Status */}
                <div style={{ background: p?.secondaryBg, padding: "28px", borderRadius: "24px", border: `1px solid ${p?.border}`, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: "#22c55e15", display: "flex", alignItems: "center", justifyContent: "center", color: "#22c55e", marginBottom: "14px" }}><BotIcon /></div>
                  <p style={{ fontSize: "13px", color: p?.textPrimary, opacity: 0.55, margin: "0 0 4px" }}>Smart Agent Status</p>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{ width: "9px", height: "9px", borderRadius: "50%", background: userData?.paxAI?.trained ? "#22c55e" : "#f59e0b", boxShadow: userData?.paxAI?.trained ? "0 0 8px #22c55e" : "0 0 8px #f59e0b" }} />
                    <h3 style={{ fontSize: "20px", fontWeight: 900, color: p?.textPrimary, margin: 0 }}>{userData?.paxAI?.trained ? "Trained" : "Needs Training"}</h3>
                  </div>
                </div>
                {/* Stat: WhatsApp */}
                <div style={{ background: p?.secondaryBg, padding: "28px", borderRadius: "24px", border: `1px solid ${p?.border}`, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: "#25d36615", display: "flex", alignItems: "center", justifyContent: "center", color: "#25d366", marginBottom: "14px" }}><MessageCircleIcon /></div>
                  <p style={{ fontSize: "13px", color: p?.textPrimary, opacity: 0.55, margin: "0 0 4px" }}>Connected WhatsApp</p>
                  <h3 style={{ fontSize: "17px", fontWeight: 800, color: p?.textPrimary, margin: 0 }}>{form.whatsappNumber || "Not Linked"}</h3>
                </div>
              </div>

              {/* Banner */}
              <div style={{ background: `linear-gradient(135deg, ${p?.primary}, ${p?.primary}cc)`, padding: "28px 32px", borderRadius: "24px", color: "#fff", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "relative", zIndex: 1 }}>
                  <h3 style={{ fontSize: "20px", fontWeight: 800, margin: "0 0 8px" }}>
                    {userData?.paxAI?.trained ? "Your AI is active and working for you" : "Complete training to activate your AI"}
                  </h3>
                  <p style={{ fontSize: "14px", opacity: 0.88, maxWidth: "500px", lineHeight: 1.65 }}>
                    {userData?.paxAI?.trained
                      ? `Responding to inquiries using your ${form.tone} tone. Keep your ${isSeller ? "products" : "services"} updated for accurate AI responses.`
                      : `Your Smart Agent is set up as a ${isSeller ? "Seller" : "Service Provider"} but needs training data to start. Go to the training page to complete setup.`
                    }
                  </p>
                  {!userData?.paxAI?.trained && (
                    <button onClick={() => router.push("/dashboard/automations/training")} style={{ marginTop: "16px", padding: "10px 22px", borderRadius: "12px", background: "#fff", color: p?.primary, fontWeight: 800, border: "none", cursor: "pointer", fontSize: "14px" }}>
                      Go to Training →
                    </button>
                  )}
                </div>
                <div style={{ position: "absolute", right: "-16px", bottom: "-16px", opacity: 0.08, transform: "rotate(-10deg)", fontSize: "120px" }}>
                  {isSeller ? "🛒" : "🤝"}
                </div>
              </div>
            </div>
          )}

        </motion.div>
      </AnimatePresence>

      <style jsx global>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}