"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { TagInput } from "@/components/ui/TagInput";
import { motion, AnimatePresence } from "framer-motion";
import { useGlobalContext } from "../Context";

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
const RocketIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
    <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
    <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
    <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
  </svg>
);
const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const ChevronRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);
const ChevronLeftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
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
const ImageIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
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

/* ══════════════════════════════════════════════════════════
   STEPS CONFIG
══════════════════════════════════════════════════════════ */
const STEPS = [
  { label: "Store Info", icon: StoreIcon, desc: "Your shop identity & logo" },
  { label: "Products", icon: PackageIcon, desc: "What you sell" },
  { label: "Payment", icon: CreditCardIcon, desc: "How customers pay you" },
  { label: "AI Behaviour", icon: SlidersIcon, desc: "Tone, hours & auto-reply" },
  { label: "WhatsApp", icon: MessageCircleIcon, desc: "Connect your number" },
  { label: "Review", icon: ClipboardIcon, desc: "Confirm your details" },
  { label: "Train AI", icon: RocketIcon, desc: "Launch your sales agent" },
];

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

const ReviewRow = ({ label, value, pax26 }) => (
  <div style={{ display: "flex", gap: "12px", padding: "10px 0", borderBottom: `1px solid ${pax26?.border}` }}>
    <span style={{ color: pax26?.textPrimary, opacity: 0.5, fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", width: "7.5rem", flexShrink: 0, marginTop: 2 }}>{label}</span>
    <span style={{ color: pax26?.textPrimary, fontSize: "13px", flex: 1 }}>{value || "—"}</span>
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
    <p style={{ fontSize: "12px", color: pax26?.textPrimary, lineHeight: 1.6, margin: 0, opacity: 0.75 }}
      dangerouslySetInnerHTML={{ __html: text }}
    />
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
        if (onProgress && e.lengthComputable) {
          onProgress(Math.round((e.loaded * 100) / e.total));
        }
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
   LOGO UPLOADER
══════════════════════════════════════════════════════════ */


/* ══════════════════════════════════════════════════════════
   PRODUCT MEDIA UPLOADER
══════════════════════════════════════════════════════════ */
function ProductMediaUploader({ images, onChange, pax26, sellerId }) {
  const { upload } = useCloudinaryUpload();
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const handleFiles = async (files) => {
    const arr = Array.from(files).slice(0, 6 - images.length);
    if (!arr.length) return;
    setUploading(true);
    try {
      const folder = sellerId ? `pax26/${sellerId}/products` : "pax26/products";
      const results = await Promise.all(arr.map(f => upload(f, { folder, tags: ["product"] })));
      onChange([...images, ...results.map(r => ({ url: r.url, publicId: r.publicId }))]);
    } catch {
      // silent
    } finally {
      setUploading(false);
    }
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
              <button
                onClick={() => onChange(images.filter((_, j) => j !== i))}
                style={{ position: "absolute", top: "3px", right: "3px", width: "20px", height: "20px", borderRadius: "50%", background: "#ff4444cc", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}
              >
                <XIcon />
              </button>
            </div>
          );
        })}
        {images.length < 6 && (
          <button
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            style={{ width: "80px", height: "80px", borderRadius: "10px", border: `2px dashed ${pax26?.border}`, background: pax26?.secondaryBg, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "4px", color: pax26?.textPrimary, opacity: uploading ? 0.5 : 0.7, transition: "opacity 0.2s" }}
          >
            {uploading ? <Spinner color={pax26?.primary} /> : <><UploadIcon /><span style={{ fontSize: "10px" }}>Add</span></>}
          </button>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/*" multiple style={{ display: "none" }} onChange={e => handleFiles(e.target.files)} />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   PRODUCT BUILDER
══════════════════════════════════════════════════════════ */
function ProductBuilder({ products, onChange, pax26, sellerId }) {
  const emptyProduct = () => ({ name: "", price: "", description: "", category: "", tags: [], stock: "", images: [] });
  const [editing, setEditing] = useState(null);
  const [draft, setDraft] = useState(emptyProduct());

  const startNew = () => { setDraft(emptyProduct()); setEditing("new"); };
  const startEdit = (i) => {
    const prod = products[i];
    setDraft({
      ...prod,
      images: Array.isArray(prod.images) ? [...prod.images] : []
    });
    setEditing(i);
  };

  const save = () => {
    if (!draft.name.trim() || !String(draft.price).trim()) return;
    const item = { ...draft, price: parseFloat(draft.price) || 0, stock: parseInt(draft.stock) || 0 };
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
          {(() => {
            const firstImg = prod.images?.[0];
            const imgUrl = typeof firstImg === "string" ? firstImg : firstImg?.url;
            return imgUrl ? (
              <img src={imgUrl} alt="" style={{ width: "44px", height: "44px", borderRadius: "8px", objectFit: "cover", flexShrink: 0 }} />
            ) : (
              <div style={{ width: "44px", height: "44px", borderRadius: "8px", background: `${p?.primary}18`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: p?.textPrimary, opacity: 0.4 }}><PackageIcon /></div>
            );
          })()}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: "13px", fontWeight: 700, color: p?.textPrimary, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{prod.name}</p>
            <p style={{ margin: "2px 0 0", fontSize: "12px", color: p?.textPrimary, opacity: 0.55 }}>
              ₦{Number(prod.price).toLocaleString()}{prod.stock ? ` · ${prod.stock} in stock` : ""}
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
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <ThemedInput label="Price (₦) *" pax26={p} type="number" value={draft.price} onChange={e => setDraft(d => ({ ...d, price: e.target.value }))} placeholder="5000" />
            <ThemedInput label="Stock Qty" pax26={p} type="number" value={draft.stock} onChange={e => setDraft(d => ({ ...d, stock: e.target.value }))} placeholder="10" />
          </div>
          <ThemedInput label="Category" pax26={p} value={draft.category} onChange={e => setDraft(d => ({ ...d, category: e.target.value }))} placeholder="e.g. Shoes, Bags, Electronics" />
          <ThemedTextarea label="Description" pax26={p} value={draft.description} onChange={e => setDraft(d => ({ ...d, description: e.target.value }))} placeholder="Describe the product…" rows={2} />
          <TagInput label="Search Tags" example="e.g. black, nike, size-42" tags={draft.tags} onChange={tags => setDraft(d => ({ ...d, tags }))} pax26={p} />
          <ProductMediaUploader
            images={draft.images || []}
            onChange={imgs => setDraft(d => ({ ...d, images: imgs }))}
            pax26={p}
            sellerId={sellerId}
          />
          <div style={{ display: "flex", gap: "10px" }}>
            <button onClick={() => setEditing(null)} style={{ flex: 1, padding: "9px", borderRadius: "10px", border: `1px solid ${p?.border}`, background: "transparent", color: p?.textPrimary, fontWeight: 600, fontSize: "13px", cursor: "pointer" }}>Cancel</button>
            <button onClick={save} disabled={!canSave} style={{ flex: 2, padding: "9px", borderRadius: "10px", border: "none", background: p?.primary, color: "#fff", fontWeight: 700, fontSize: "13px", cursor: canSave ? "pointer" : "not-allowed", opacity: canSave ? 1 : 0.5 }}>Save Product</button>
          </div>
        </div>
      ) : (
        <button
          onClick={startNew}
          style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "12px", borderRadius: "12px", border: `2px dashed ${p?.border}`, background: "transparent", color: p?.textPrimary, fontWeight: 600, fontSize: "13px", cursor: "pointer", opacity: 0.7, transition: "opacity 0.2s" }}
          onMouseEnter={e => e.currentTarget.style.opacity = "1"}
          onMouseLeave={e => e.currentTarget.style.opacity = "0.7"}
        >
          <PlusIcon /> Add Product
        </button>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   PAYMENT BUILDER
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
        <button
          onClick={startNew}
          style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "12px", borderRadius: "12px", border: `2px dashed ${p?.border}`, background: "transparent", color: p?.textPrimary, fontWeight: 600, fontSize: "13px", cursor: "pointer", opacity: 0.7 }}
          onMouseEnter={e => e.currentTarget.style.opacity = "1"}
          onMouseLeave={e => e.currentTarget.style.opacity = "0.7"}
        >
          <PlusIcon /> Add Payment Account
        </button>
      )}
    </div>
  );
}

const DashboardTab = ({ label, active, onClick, icon: Icon, pax26 }) => (
  <button
    onClick={onClick}
    style={{
      display: "flex",
      alignItems: "center",
      gap: "8px",
      padding: "12px 20px",
      border: "none",
      background: active ? `${pax26?.primary}15` : "transparent",
      color: active ? pax26?.primary : pax26?.textPrimary,
      borderRadius: "12px",
      cursor: "pointer",
      fontSize: "14px",
      fontWeight: 600,
      transition: "all 0.2s",
      opacity: active ? 1 : 0.6,
    }}
  >
    <Icon />
    {label}
  </button>
);

/* ══════════════════════════════════════════════════════════
   MAIN PAGE
   ══════════════════════════════════════════════════════════ */
export default function AiBusinessDashboard() {
  const { pax26, router, setAIsPaxAiBusinessTrained } = useGlobalContext();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("products");
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProductIndex, setEditingProductIndex] = useState(null);

  const [form, setForm] = useState({
    sellerId: "",
    businessName: "",
    businessDescription: "",
    industry: "",
    tone: "salesy",
    autoReplyEnabled: true,
    followUpEnabled: true,
    followUpDelayMinutes: 30,
    currency: "NGN",
    workingHours: "",
    paymentDetails: [],
    whatsappNumber: "",
    products: [],
  });

  const p = pax26;

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/seller/profile");
      const data = await res.json();
      if (data.success && data.profile) {
        const profile = data.profile;
        setAIsPaxAiBusinessTrained?.(profile.aiTrained || false);
        setForm(f => ({
          ...f,
          sellerId: profile._id || "",
          businessName: profile.businessName || "",
          businessDescription: profile.businessDescription || "",
          industry: profile.industry || "",
          tone: profile.tone || "salesy",
          autoReplyEnabled: profile.autoReplyEnabled ?? true,
          followUpEnabled: profile.followUpEnabled ?? true,
          followUpDelayMinutes: profile.followUpDelayMinutes || 30,
          currency: profile.currency || "NGN",
          whatsappNumber: profile.whatsappNumber || "",
          workingHours: profile.workingHours || "",
          paymentDetails: profile.paymentDetails || [],
          products: profile.products || [],
        }));
      }
    } catch (e) {
      console.error("fetchProfile error:", e);
    } finally {
      setLoading(false);
    }
  }, [setAIsPaxAiBusinessTrained]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const saveProfile = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/seller/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        // Update local state with saved data (including IDs)
        if (data.profile) {
          setForm(f => ({
            ...f,
            ...data.profile,
            products: data.profile.products || []
          }));
        }
        alert("Changes saved successfully!");
      } else {
        alert("Failed to save: " + (data.message || "Unknown error"));
      }
    } catch (e) {
      console.error("Save profile error:", e);
      alert("Error saving changes. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleProductChange = (newProducts) => {
    setForm(f => ({ ...f, products: newProducts }));
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh" }}>
        <Spinner color={p?.primary} />
      </div>
    );
  }

  return (
    <div style={{
      maxWidth: "1000px",
      margin: "0 auto",
      padding: "32px 20px",
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      gap: "32px"
    }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: 900, color: p?.textPrimary, margin: 0, letterSpacing: "-0.03em" }}>Seller Dashboard</h1>
          <p style={{ fontSize: "14px", color: p?.textPrimary, opacity: 0.6, margin: "4px 0 0" }}>
            Control your products, business profile and AI sales agent.
          </p>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <button
            onClick={() => router.push("/dashboard/automations",)}
            style={{ padding: "12px 20px", borderRadius: "14px", border: `1px solid ${p?.border}`, background: "transparent", color: p?.textPrimary, fontSize: "14px", fontWeight: 700, cursor: "pointer" }}
          >
            Exit Dashboard
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div style={{
        display: "flex",
        gap: "4px",
        padding: "6px",
        background: p?.secondaryBg,
        borderRadius: "16px",
        border: `1px solid ${p?.border}`,
        width: "fit-content"
      }}>
        <DashboardTab label="All Products" icon={PackageIcon} active={activeTab === "products"} onClick={() => setActiveTab("products")} pax26={p} />
        <DashboardTab label="Update Profile" icon={StoreIcon} active={activeTab === "profile"} onClick={() => setActiveTab("profile")} pax26={p} />
        <DashboardTab label="Overview" icon={ClipboardIcon} active={activeTab === "overview"} onClick={() => setActiveTab("overview")} pax26={p} />
      </div>

      {/* Main Content Area */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          style={{ flex: 1 }}
        >
          {activeTab === "products" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h2 style={{ fontSize: "20px", fontWeight: 800, color: p?.textPrimary, margin: 0 }}>Manage Inventory</h2>
                <button
                  onClick={() => { setEditingProductIndex(null); setShowProductForm(true); }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "12px 20px",
                    borderRadius: "12px",
                    background: `${p?.primary}15`,
                    color: p?.primary,
                    fontWeight: 700,
                    border: "none",
                    cursor: "pointer",
                    fontSize: "14px",
                  }}
                >
                  <PlusIcon /> Upload New Product
                </button>
              </div>

              {showProductForm ? (
                <div style={{ background: p?.secondaryBg, padding: "32px", borderRadius: "24px", border: `1px solid ${p?.border}`, boxShadow: "0 10px 30px rgba(0,0,0,0.05)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                    <div>
                      <h3 style={{ margin: 0, color: p?.textPrimary, fontSize: "20px", fontWeight: 800 }}>{editingProductIndex !== null ? "Edit Product" : "Upload Product"}</h3>
                      <p style={{ margin: "4px 0 0", fontSize: "13px", color: p?.textPrimary, opacity: 0.5 }}>Fill in the details to update your store inventory.</p>
                    </div>
                    <button
                      onClick={() => setShowProductForm(false)}
                      style={{ width: "36px", height: "36px", borderRadius: "50%", background: "transparent", border: `1px solid ${p?.border}`, cursor: "pointer", color: p?.textPrimary, display: "flex", alignItems: "center", justifyContent: "center" }}
                    >
                      <XIcon />
                    </button>
                  </div>
                  <ProductBuilder
                    products={form.products}
                    onChange={handleProductChange}
                    pax26={p}
                    sellerId={form.sellerId}
                  />
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "24px" }}>
                  {form.products.length > 0 ? (
                    form.products.map((prod, i) => (
                      <div key={i} style={{ background: p?.secondaryBg, borderRadius: "20px", border: `1px solid ${p?.border}`, overflow: "hidden", display: "flex", flexDirection: "column", transition: "transform 0.2s, box-shadow 0.2s" }} onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 10px 30px rgba(0,0,0,0.05)"; }} onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}>
                        <div style={{ position: "relative", paddingTop: "75%", background: `${p?.primary}08` }}>
                          {(() => {
                            const firstImg = prod.images?.[0];
                            const imgUrl = typeof firstImg === "string" ? firstImg : firstImg?.url;
                            return imgUrl ? (
                              <img
                                src={imgUrl}
                                alt={prod.name}
                                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
                                onError={(e) => { e.currentTarget.style.display = "none"; }}
                              />
                            ) : (
                              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: p?.primary, opacity: 0.3 }}>
                                <PackageIcon style={{ width: "48px", height: "48px" }} />
                              </div>
                            );
                          })()}
                          {prod.images?.length > 1 && (
                            <div style={{ position: "absolute", top: "12px", right: "12px", background: "rgba(0,0,0,0.5)", color: "#fff", padding: "4px 8px", borderRadius: "6px", fontSize: "10px", fontWeight: 700, backdropFilter: "blur(4px)" }}>
                              +{prod.images.length - 1}
                            </div>
                          )}
                          <div style={{ position: "absolute", bottom: "12px", right: "12px" }}>
                            <div style={{ padding: "6px 14px", borderRadius: "99px", background: "rgba(0,0,0,0.7)", color: "#fff", fontSize: "13px", fontWeight: 800, backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.1)" }}>
                              ₦{Number(prod.price).toLocaleString()}
                            </div>
                          </div>
                        </div>
                        <div style={{ padding: "20px", flex: 1, display: "flex", flexDirection: "column" }}>
                          <div style={{ marginBottom: "12px" }}>
                            <h4 style={{ margin: "0 0 6px", fontSize: "18px", fontWeight: 800, color: p?.textPrimary }}>{prod.name}</h4>
                            <p style={{ margin: 0, fontSize: "13px", color: p?.textPrimary, opacity: 0.6, lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                              {prod.description || "No description provided for this product."}
                            </p>
                          </div>
                          <div style={{ marginTop: "auto", display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "16px", borderTop: `1px solid ${p?.border}` }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: prod.stock > 0 ? "#22c55e" : "#ff4444" }} />
                              <span style={{ fontSize: "12px", fontWeight: 600, color: p?.textPrimary, opacity: 0.7 }}>{prod.stock} in stock</span>
                            </div>
                            <div style={{ display: "flex", gap: "8px" }}>
                              <button
                                onClick={() => { setEditingProductIndex(i); setShowProductForm(true); }}
                                style={{ width: "36px", height: "36px", borderRadius: "10px", border: `1px solid ${p?.border}`, background: "transparent", color: p?.textPrimary, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                              >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                              </button>
                              <button
                                onClick={() => handleProductChange(form.products.filter((_, j) => j !== i))}
                                style={{ width: "36px", height: "36px", borderRadius: "10px", border: "none", background: "#ff444415", color: "#ff4444", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                              >
                                <TrashIcon />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "80px 40px", background: p?.secondaryBg, borderRadius: "24px", border: `2px dashed ${p?.border}` }}>
                      <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: `${p?.primary}10`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", color: p?.primary }}>
                        <PackageIcon />
                      </div>
                      <h3 style={{ fontSize: "22px", fontWeight: 800, color: p?.textPrimary, margin: "0 0 12px" }}>Your store is empty</h3>
                      <p style={{ margin: "0 0 32px", fontSize: "15px", color: p?.textPrimary, opacity: 0.6, maxWidth: "400px", margin: "0 auto 32px" }}>Upload your products so your AI agent can start selling them on WhatsApp.</p>
                      <button
                        onClick={() => setShowProductForm(true)}
                        style={{ padding: "14px 32px", borderRadius: "16px", background: p?.primary, color: "#fff", fontWeight: 800, border: "none", cursor: "pointer", boxShadow: `0 8px 20px ${p?.primary}33` }}
                      >
                        Upload First Product
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === "profile" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "32px" }}>
              <section>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                  <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: `${p?.primary}15`, color: p?.primary, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <StoreIcon />
                  </div>
                  <h3 style={{ fontSize: "20px", fontWeight: 800, color: p?.textPrimary, margin: 0 }}>Business Identity</h3>
                </div>
                <div style={{ background: p?.secondaryBg, padding: "32px", borderRadius: "24px", border: `1px solid ${p?.border}`, display: "flex", flexDirection: "column", gap: "24px" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "24px" }}>
                    <ThemedInput label="Business Name" value={form.businessName} onChange={e => setForm(f => ({ ...f, businessName: e.target.value }))} pax26={p} />
                  </div>
                  <ThemedTextarea label="Tell the AI about your business" value={form.businessDescription} onChange={e => setForm(f => ({ ...f, businessDescription: e.target.value }))} pax26={p} rows={4} placeholder="e.g. We are a premium fashion brand based in Lagos..." />
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "24px" }}>
                    <ThemedInput label="Industry / Category" value={form.industry} onChange={e => setForm(f => ({ ...f, industry: e.target.value }))} pax26={p} placeholder="e.g. Fashion, Electronics" />
                    <ThemedInput label="Operating Hours" value={form.workingHours} onChange={e => setForm(f => ({ ...f, workingHours: e.target.value }))} pax26={p} placeholder="e.g. Mon-Sat 8am-9pm" />
                  </div>
                </div>
              </section>

              <section>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                  <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: `${p?.primary}15`, color: p?.primary, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <SlidersIcon />
                  </div>
                  <h3 style={{ fontSize: "20px", fontWeight: 800, color: p?.textPrimary, margin: 0 }}>AI Agent Settings</h3>
                </div>
                <div style={{ background: p?.secondaryBg, padding: "32px", borderRadius: "24px", border: `1px solid ${p?.border}`, display: "flex", flexDirection: "column", gap: "24px" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "24px" }}>
                    <ThemedSelect
                      label="AI Conversation Tone"
                      value={form.tone}
                      onChange={v => setForm(f => ({ ...f, tone: v }))}
                      options={[
                        { value: "salesy", label: "Salesy — Persuasive & Bold" },
                        { value: "friendly", label: "Friendly — Warm & Helpful" },
                        { value: "professional", label: "Professional — Calm & Clear" },
                      ]}
                      pax26={p}
                    />
                    <ThemedSelect
                      label="Preferred Currency"
                      value={form.currency}
                      onChange={v => setForm(f => ({ ...f, currency: v }))}
                      options={[
                        { value: "NGN", label: "Nigerian Naira (₦)" },
                        { value: "USD", label: "US Dollar ($)" },
                      ]}
                      pax26={p}
                    />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "24px" }}>
                    <Toggle label="Auto-Reply" hint="AI responds instantly to customer inquiries" value={form.autoReplyEnabled} onChange={v => setForm(f => ({ ...f, autoReplyEnabled: v }))} pax26={p} />
                    <Toggle label="Smart Follow-up" hint="AI follows up with leads after a delay" value={form.followUpEnabled} onChange={v => setForm(f => ({ ...f, followUpEnabled: v }))} pax26={p} />
                  </div>
                </div>
              </section>

              <section>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                  <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: `${p?.primary}15`, color: p?.primary, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <CreditCardIcon />
                  </div>
                  <h3 style={{ fontSize: "20px", fontWeight: 800, color: p?.textPrimary, margin: 0 }}>Payment Methods</h3>
                </div>
                <div style={{ background: p?.secondaryBg, padding: "32px", borderRadius: "24px", border: `1px solid ${p?.border}` }}>
                  <InfoBanner pax26={p} text="Add your bank details below. Your AI will securely share these with customers when they are ready to purchase." />
                  <div style={{ marginTop: "20px" }}>
                    <PaymentBuilder payments={form.paymentDetails} onChange={v => setForm(f => ({ ...f, paymentDetails: v }))} pax26={p} />
                  </div>
                </div>
              </section>
            </div>
          )}

          {activeTab === "overview" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px" }}>
                <div style={{ background: p?.secondaryBg, padding: "32px", borderRadius: "24px", border: `1px solid ${p?.border}`, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: `${p?.primary}10`, display: "flex", alignItems: "center", justifyContent: "center", color: p?.primary, marginBottom: "16px" }}>
                    <PackageIcon />
                  </div>
                  <p style={{ fontSize: "14px", color: p?.textPrimary, opacity: 0.6, margin: "0 0 4px" }}>Active Products</p>
                  <h3 style={{ fontSize: "36px", fontWeight: 900, color: p?.textPrimary, margin: 0 }}>{form.products.length}</h3>
                </div>
                <div style={{ background: p?.secondaryBg, padding: "32px", borderRadius: "24px", border: `1px solid ${p?.border}`, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: "#22c55e15", display: "flex", alignItems: "center", justifyContent: "center", color: "#22c55e", marginBottom: "16px" }}>
                    <BotIcon />
                  </div>
                  <p style={{ fontSize: "14px", color: p?.textPrimary, opacity: 0.6, margin: "0 0 4px" }}>AI Agent Status</p>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 10px #22c55e" }} />
                    <h3 style={{ fontSize: "24px", fontWeight: 900, color: p?.textPrimary, margin: 0 }}>Online</h3>
                  </div>
                </div>
                <div style={{ background: p?.secondaryBg, padding: "32px", borderRadius: "24px", border: `1px solid ${p?.border}`, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: "#3b82f615", display: "flex", alignItems: "center", justifyContent: "center", color: "#3b82f6", marginBottom: "16px" }}>
                    <MessageCircleIcon />
                  </div>
                  <p style={{ fontSize: "14px", color: p?.textPrimary, opacity: 0.6, margin: "0 0 4px" }}>Connected WhatsApp</p>
                  <h3 style={{ fontSize: "20px", fontWeight: 800, color: p?.textPrimary, margin: 0 }}>{form.whatsappNumber || "Not Linked"}</h3>
                </div>
              </div>

              <div style={{ background: `linear-gradient(135deg, ${p?.primary}, ${p?.primary}dd)`, padding: "32px", borderRadius: "24px", color: "#fff", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "relative", zIndex: 1 }}>
                  <h3 style={{ fontSize: "22px", fontWeight: 800, margin: "0 0 8px" }}>Your AI is working for you</h3>
                  <p style={{ fontSize: "15px", opacity: 0.9, maxWidth: "500px", lineHeight: 1.6 }}>
                    It's currently responding to inquiries using your <strong>{form.tone}</strong> tone settings.
                    Make sure to keep your product inventory updated so the AI can provide accurate pricing and availability to your customers.
                  </p>
                </div>
                <div style={{ position: "absolute", right: "-20px", bottom: "-20px", opacity: 0.1, transform: "rotate(-15deg)" }}>
                  <BotIcon style={{ width: "200px", height: "200px" }} />
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Footer Save Button */}
      {activeTab !== "overview" && (
        <div style={{
          position: "sticky",
          bottom: "20px",
          display: "flex",
          justifyContent: "center",
          zIndex: 100,
          marginTop: "20px"
        }}>
          <button
            onClick={saveProfile}
            disabled={saving}
            style={{
              padding: "16px 48px",
              borderRadius: "16px",
              background: p?.primary,
              color: "#fff",
              fontWeight: 800,
              fontSize: "16px",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              boxShadow: `0 12px 32px ${p?.primary}55`,
              transition: "transform 0.2s, box-shadow 0.2s",
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.02)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}
          >
            {saving ? <><Spinner /> Saving...</> : "Save Dashboard Changes"}
          </button>
        </div>
      )}

      <style jsx global>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .animate-ping {
          animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
        @keyframes ping {
          75%, 100% { transform: scale(2); opacity: 0; }
        }
      `}</style>
    </div>
  );
}