"use client";

import { useState, useEffect, useRef, useCallback, useImperativeHandle, forwardRef } from "react";
import { TagInput } from "@/components/ui/TagInput";
import { motion, AnimatePresence } from "framer-motion";
import { useGlobalContext } from "../Context";
import { CURRENCY_OPTIONS, detectUserCurrency, formatPrice, getCurrencySymbol } from "@/app/lib/currency/currencyHelper";

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
   STEPS CONFIG — Seller (existing flow)
══════════════════════════════════════════════════════════ */
const SELLER_STEPS = [
  { label: "Store Info", icon: StoreIcon, desc: "Your shop identity & logo" },
  { label: "WhatsApp", icon: MessageCircleIcon, desc: "Connect your number" },
  { label: "Products", icon: PackageIcon, desc: "What you sell" },
  { label: "Payment", icon: CreditCardIcon, desc: "How customers pay you" },
  { label: "AI Behaviour", icon: SlidersIcon, desc: "Tone, hours & auto-reply" },
  { label: "Review", icon: ClipboardIcon, desc: "Confirm your details" },
  { label: "Train AI", icon: RocketIcon, desc: "Launch your sales agent" },
];

/* ══════════════════════════════════════════════════════════
   STEPS CONFIG — Service Provider (new flow)
══════════════════════════════════════════════════════════ */
const ServiceIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
  </svg>
);
const FaqIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const SERVICE_STEPS = [
  { label: "Business Info", icon: StoreIcon, desc: "Your business identity" },
  { label: "Services & FAQs", icon: FaqIcon, desc: "What you offer" },
  { label: "Payment", icon: CreditCardIcon, desc: "How clients pay you" },
  { label: "AI Behaviour", icon: SlidersIcon, desc: "Tone, hours & auto-reply" },
  { label: "WhatsApp", icon: MessageCircleIcon, desc: "Connect your number" },
  { label: "Review", icon: ClipboardIcon, desc: "Confirm your details" },
  { label: "Train AI", icon: RocketIcon, desc: "Launch your service agent" },
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
    {/* Use a span + dangerouslySetInnerHTML only for the text portion */}
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
function LogoUploader({ value, onChange, pax26, sellerId }) {
  const { upload } = useCloudinaryUpload();
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);

  const handleFile = async (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) { setError("Please upload an image file"); return; }
    if (file.size > 5 * 1024 * 1024) { setError("Image must be under 5MB"); return; }
    setError("");
    setUploading(true);
    try {
      const folder = sellerId ? `pax26/${sellerId}/logos` : "pax26/logos";
      const result = await upload(file, { folder, tags: ["logo"] });
      onChange({ url: result.url, publicId: result.publicId });
    } catch {
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  };

  return (
    <div>
      <FieldLabel pax26={pax26}>Shop Logo / Banner</FieldLabel>
      <div
        onClick={() => !uploading && inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        style={{
          width: "100%", minHeight: "140px", borderRadius: "14px",
          border: `2px dashed ${dragOver ? pax26?.primary : value?.url ? pax26?.primary + "55" : pax26?.border}`,
          background: dragOver ? `${pax26?.primary}08` : value?.url ? `${pax26?.primary}06` : pax26?.secondaryBg,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          gap: "10px", cursor: uploading ? "wait" : "pointer", transition: "all 0.2s",
          overflow: "hidden", position: "relative",
        }}
      >
        {uploading ? (
          <>
            <Spinner color={pax26?.primary} />
            <span style={{ fontSize: "12px", color: pax26?.textPrimary, opacity: 0.6 }}>Uploading…</span>
          </>
        ) : value?.url ? (
          <>
            <img src={value.url} alt="Shop logo" style={{ maxHeight: "100px", maxWidth: "100%", objectFit: "contain", borderRadius: "8px" }} />
            <span style={{ fontSize: "11px", color: pax26?.textPrimary, opacity: 0.5 }}>Click to change</span>
            <button
              onClick={e => { e.stopPropagation(); onChange(null); }}
              style={{ position: "absolute", top: "8px", right: "8px", width: "24px", height: "24px", borderRadius: "50%", background: "#ff4444", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}
            >
              <XIcon />
            </button>
          </>
        ) : (
          <>
            <div style={{ color: pax26?.textPrimary, opacity: 0.35 }}><ImageIcon /></div>
            <div style={{ textAlign: "center" }}>
              <p style={{ fontSize: "13px", fontWeight: 600, color: pax26?.textPrimary, margin: 0 }}>Drop image here or click to browse</p>
              <p style={{ fontSize: "11px", color: pax26?.textPrimary, opacity: 0.45, margin: "4px 0 0" }}>PNG, JPG, WEBP · max 5 MB</p>
            </div>
          </>
        )}
      </div>
      {error && <p style={{ fontSize: "12px", color: "#ff4444", marginTop: "6px" }}>{error}</p>}
      <input ref={inputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={e => handleFile(e.target.files[0])} />
    </div>
  );
}

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
      // silent — individual failures won't crash the form
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <FieldLabel pax26={pax26}>Product Images (up to 6)</FieldLabel>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
        {images.map((img, i) => (
          <div key={img.publicId || i} style={{ position: "relative", width: "80px", height: "80px", borderRadius: "10px", overflow: "hidden", border: `1px solid ${pax26?.border}` }}>
            <img src={img.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            <button
              onClick={() => onChange(images.filter((_, j) => j !== i))}
              style={{ position: "absolute", top: "3px", right: "3px", width: "20px", height: "20px", borderRadius: "50%", background: "#ff4444cc", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}
            >
              <XIcon />
            </button>
          </div>
        ))}
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
function ProductBuilder({ products, onChange, pax26, currency = "NGN", sellerId, locked = false }) {
  const emptyProduct = () => ({ name: "", price: "", description: "", category: "", tags: [], stock: "", images: [] });
  const [editing, setEditing] = useState(null); // number | "new" | null
  const [draft, setDraft] = useState(emptyProduct());

  const startNew = () => {
    if (locked) return;
    setDraft(emptyProduct());
    setEditing("new");
  };
  const startEdit = (i) => {
    if (locked) return;
    setDraft({ ...products[i] });
    setEditing(i);
  };

  const save = () => {
    if (locked) return;
    if (!draft.name.trim() || !String(draft.price).trim()) return;
    const item = { ...draft, price: parseFloat(draft.price) || 0, stock: parseInt(draft.stock) || 0 };
    if (editing === "new") onChange([...products, item]);
    else onChange(products.map((p, i) => i === editing ? item : p));
    setEditing(null);
  };

  const remove = (i) => {
    if (locked) return;
    onChange(products.filter((_, j) => j !== i));
  };
  const p = pax26;
  const canSave = !locked && draft.name.trim() && String(draft.price).trim();
  const symbol = getCurrencySymbol(currency);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      {products.map((prod, i) => (
        <div key={i} style={{ display: "flex", gap: "10px", alignItems: "center", padding: "10px 14px", borderRadius: "12px", border: `1px solid ${p?.border}`, background: p?.secondaryBg }}>
          {prod.images?.[0]?.url
            ? <img src={prod.images[0].url} alt="" style={{ width: "44px", height: "44px", borderRadius: "8px", objectFit: "cover", flexShrink: 0 }} />
            : <div style={{ width: "44px", height: "44px", borderRadius: "8px", background: `${p?.primary}18`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: p?.textPrimary, opacity: 0.4 }}><PackageIcon /></div>
          }
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: "13px", fontWeight: 700, color: p?.textPrimary, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{prod.name}</p>
            <p style={{ margin: "2px 0 0", fontSize: "12px", color: p?.textPrimary, opacity: 0.55 }}>
              {formatPrice(prod.price, currency)}{prod.stock ? ` · ${prod.stock} in stock` : ""}
            </p>
          </div>
          <button onClick={() => startEdit(i)} disabled={locked} style={{ padding: "6px 10px", borderRadius: "8px", border: `1px solid ${p?.border}`, background: "transparent", color: p?.textPrimary, fontSize: "11px", fontWeight: 600, cursor: locked ? "not-allowed" : "pointer", opacity: locked ? 0.45 : 1 }}>Edit</button>
          <button onClick={() => remove(i)} disabled={locked} style={{ padding: "6px", borderRadius: "8px", border: "none", background: "#ff444415", color: "#ff4444", cursor: locked ? "not-allowed" : "pointer", display: "flex", alignItems: "center", opacity: locked ? 0.45 : 1 }}><TrashIcon /></button>
        </div>
      ))}

      {editing !== null && !locked ? (
        <div style={{ padding: "16px", borderRadius: "14px", border: `1px solid ${p?.primary}44`, background: `${p?.primary}06`, display: "flex", flexDirection: "column", gap: "12px" }}>
          <p style={{ margin: 0, fontSize: "13px", fontWeight: 700, color: p?.textPrimary }}>{editing === "new" ? "New Product" : "Edit Product"}</p>
          <ThemedInput label="Product Name *" pax26={p} value={draft.name} onChange={e => setDraft(d => ({ ...d, name: e.target.value }))} placeholder="e.g. Black Leather Sneakers" />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "10px" }}>
            <ThemedInput label={`Price (${symbol}) *`} pax26={p} type="number" value={draft.price} onChange={e => setDraft(d => ({ ...d, price: e.target.value }))} placeholder="5000" />
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
          disabled={locked}
          style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "12px", borderRadius: "12px", border: `2px dashed ${p?.border}`, background: "transparent", color: p?.textPrimary, fontWeight: 600, fontSize: "13px", cursor: locked ? "not-allowed" : "pointer", opacity: locked ? 0.45 : 0.7, transition: "opacity 0.2s" }}
          onMouseEnter={e => { if (!locked) e.currentTarget.style.opacity = "1"; }}
          onMouseLeave={e => { e.currentTarget.style.opacity = locked ? "0.45" : "0.7"; }}
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

/* ══════════════════════════════════════════════════════════
   BUSINESS TYPE SELECTOR
   Shown when businessType === null (first-time setup or after switch)
══════════════════════════════════════════════════════════ */
function BusinessTypeSelector({ onSelect, pax26 }) {
  const p = pax26;
  const [hovered, setHovered] = useState(null);

  const cards = [
    {
      type: "seller",
      emoji: "🛍️",
      title: "Seller",
      subtitle: "Products, pricing & delivery",
      desc: "Sell physical or digital products on WhatsApp. Your AI handles enquiries, images, pricing, and orders.",
      color: p?.primary,
    },
    {
      type: "service",
      emoji: "🛠️",
      title: "Service Provider",
      subtitle: "Services, FAQs & consultations",
      desc: "For consultants, agencies & professionals. Your AI answers service questions and captures leads.",
      color: "#8b5cf6",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "24px", padding: "8px 0 16px" }}
    >
      <div style={{ textAlign: "center" }}>
        <h2 style={{ fontSize: "20px", fontWeight: 900, color: p?.textPrimary, margin: "0 0 6px" }}>What type of business are you setting up?</h2>
        <p style={{ fontSize: "13px", color: p?.textPrimary, opacity: 0.55, margin: 0 }}>Choose the model that matches how you work</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "14px", width: "100%" }}>
        {cards.map(card => (
          <button
            key={card.type}
            onClick={() => onSelect(card.type)}
            onMouseEnter={() => setHovered(card.type)}
            onMouseLeave={() => setHovered(null)}
            style={{
              display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "10px",
              padding: "20px 16px", borderRadius: "16px", border: `2px solid`,
              borderColor: hovered === card.type ? card.color : p?.border,
              background: hovered === card.type ? `${card.color}08` : p?.secondaryBg,
              cursor: "pointer", textAlign: "left", transition: "all 0.18s",
              boxShadow: hovered === card.type ? `0 6px 24px ${card.color}20` : "none",
            }}
          >
            <span style={{ fontSize: "32px", lineHeight: 1 }}>{card.emoji}</span>
            <div>
              <p style={{ margin: 0, fontSize: "15px", fontWeight: 800, color: p?.textPrimary }}>{card.title}</p>
              <p style={{ margin: "2px 0 0", fontSize: "11px", fontWeight: 600, color: card.color, opacity: 0.9 }}>{card.subtitle}</p>
            </div>
            <p style={{ margin: 0, fontSize: "12px", color: p?.textPrimary, opacity: 0.55, lineHeight: 1.5 }}>{card.desc}</p>
          </button>
        ))}
      </div>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════
   SERVICES & FAQS BUILDER
   Used in step 1 of SERVICE_STEPS
══════════════════════════════════════════════════════════ */
function ServicesFaqsBuilder({ services, faqs, onServicesChange, onFaqsChange, pax26 }) {
  const p = pax26;

  const updateService = (i, val) => {
    const next = [...services];
    next[i] = val;
    onServicesChange(next);
  };
  const removeService = (i) => onServicesChange(services.filter((_, j) => j !== i));
  const addService = () => onServicesChange([...services, ""]);

  const updateFaq = (i, field, val) => {
    const next = faqs.map((f, j) => j === i ? { ...f, [field]: val } : f);
    onFaqsChange(next);
  };
  const removeFaq = (i) => onFaqsChange(faqs.filter((_, j) => j !== i));
  const addFaq = () => onFaqsChange([...faqs, { question: "", answer: "" }]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Services section */}
      <div>
        <FieldLabel pax26={p}>Services Offered</FieldLabel>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {services.map((svc, i) => (
            <div key={i} style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <input
                value={svc}
                onChange={e => updateService(i, e.target.value)}
                placeholder={`e.g. Logo Design, Social Media Management`}
                style={{ ...fieldBase(p), flex: 1 }}
              />
              <button
                onClick={() => removeService(i)}
                style={{ padding: "8px", borderRadius: "8px", border: "none", background: "#ff444415", color: "#ff4444", cursor: "pointer", flexShrink: 0, display: "flex", alignItems: "center" }}
              ><TrashIcon /></button>
            </div>
          ))}
          <button
            onClick={addService}
            style={{ display: "flex", alignItems: "center", gap: "6px", padding: "9px 14px", borderRadius: "10px", border: `2px dashed ${p?.border}`, background: "transparent", color: p?.textPrimary, fontSize: "13px", fontWeight: 600, cursor: "pointer", opacity: 0.7 }}
            onMouseEnter={e => e.currentTarget.style.opacity = "1"}
            onMouseLeave={e => e.currentTarget.style.opacity = "0.7"}
          >
            <PlusIcon /> Add Service
          </button>
        </div>
      </div>

      {/* FAQs section */}
      <div>
        <FieldLabel pax26={p}>Frequently Asked Questions</FieldLabel>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {faqs.map((faq, i) => (
            <div key={i} style={{ padding: "12px 14px", borderRadius: "12px", border: `1px solid ${p?.border}`, background: p?.secondaryBg, display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "11px", fontWeight: 700, color: p?.textPrimary, opacity: 0.5 }}>FAQ {i + 1}</span>
                <button onClick={() => removeFaq(i)} style={{ padding: "4px", borderRadius: "6px", border: "none", background: "#ff444415", color: "#ff4444", cursor: "pointer", display: "flex", alignItems: "center" }}><TrashIcon /></button>
              </div>
              <input
                value={faq.question}
                onChange={e => updateFaq(i, "question", e.target.value)}
                placeholder="Question"
                style={{ ...fieldBase(p) }}
              />
              <textarea
                value={faq.answer}
                onChange={e => updateFaq(i, "answer", e.target.value)}
                placeholder="Answer"
                rows={2}
                style={{ ...fieldBase(p), resize: "vertical" }}
              />
            </div>
          ))}
          <button
            onClick={addFaq}
            style={{ display: "flex", alignItems: "center", gap: "6px", padding: "9px 14px", borderRadius: "10px", border: `2px dashed ${p?.border}`, background: "transparent", color: p?.textPrimary, fontSize: "13px", fontWeight: 600, cursor: "pointer", opacity: 0.7 }}
            onMouseEnter={e => e.currentTarget.style.opacity = "1"}
            onMouseLeave={e => e.currentTarget.style.opacity = "0.7"}
          >
            <PlusIcon /> Add FAQ
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   STEP RENDERER — proper React component (receives props object)
══════════════════════════════════════════════════════════ */
function StepRenderer({ step, form, setForm, pax26, sellerId, whatsappConnected, whatsappPhone, onConnectWhatsApp }) {
  const p = pax26;
  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  switch (step) {

    /* ── 0: Store Info ── */
    case 0:
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <LogoUploader
            value={form.logo}
            onChange={logo => set("logo", logo)}
            pax26={p}
            sellerId={sellerId}
          />
          <ThemedInput
            label="Store / Business Name *"
            pax26={p}
            value={form.businessName}
            onChange={e => set("businessName", e.target.value)}
            placeholder="e.g. Kemi's Boutique"
          />
          <ThemedTextarea
            label="Business Description *"
            pax26={p}
            value={form.businessDescription}
            onChange={e => set("businessDescription", e.target.value)}
            placeholder="e.g. We sell premium fashion and accessories in Lagos…"
            rows={3}
          />
          <ThemedInput
            label="Industry / Category *"
            pax26={p}
            value={form.industry}
            onChange={e => set("industry", e.target.value)}
            placeholder="e.g. Fashion, Electronics"
          />
          <ThemedSelect
            label="Currency"
            pax26={p}
            value={form.currency}
            options={CURRENCY_OPTIONS}
            onChange={v => set("currency", v)}
          />
        </div>
      );

    /* ── 1: WhatsApp (before products) ── */
    case 1:
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <InfoBanner
            text="WhatsApp must be connected before you can add products. This prevents failed saves and unused image uploads."
            pax26={p}
          />
          {whatsappConnected ? (
            <div style={{ padding: "16px", borderRadius: "14px", border: "1px solid #22c55e44", background: "#22c55e12", display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#22c55e" }}>
                <CheckIcon />
                <p style={{ margin: 0, fontSize: "14px", fontWeight: 800 }}>WhatsApp connected</p>
              </div>
              <p style={{ margin: 0, fontSize: "13px", color: p?.textPrimary, opacity: 0.75 }}>
                Linked number: <strong>{whatsappPhone || form.whatsappNumber}</strong>
              </p>
            </div>
          ) : (
            <div style={{ padding: "18px", borderRadius: "14px", border: "1px solid #f59e0b44", background: "#f59e0b12", display: "flex", flexDirection: "column", gap: "12px" }}>
              <p style={{ margin: 0, fontSize: "14px", fontWeight: 800, color: p?.textPrimary }}>WhatsApp not connected</p>
              <p style={{ margin: 0, fontSize: "13px", color: p?.textPrimary, opacity: 0.65, lineHeight: 1.55 }}>
                Connect your WhatsApp Business number first. You cannot continue to products until this is done.
              </p>
              <button
                onClick={onConnectWhatsApp}
                style={{ alignSelf: "flex-start", padding: "10px 16px", borderRadius: "10px", border: "none", background: p?.primary, color: "#fff", fontWeight: 800, fontSize: "13px", cursor: "pointer" }}
              >
                Connect WhatsApp
              </button>
            </div>
          )}
        </div>
      );

    /* ── 2: Products ── */
    case 2:
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {!whatsappConnected ? (
            <div style={{ padding: "18px", borderRadius: "14px", border: "1px solid #f59e0b44", background: "#f59e0b12", display: "flex", flexDirection: "column", gap: "12px", marginBottom: "8px" }}>
              <p style={{ margin: 0, fontSize: "14px", fontWeight: 800, color: p?.textPrimary }}>Connect WhatsApp first</p>
              <p style={{ margin: 0, fontSize: "13px", color: p?.textPrimary, opacity: 0.65, lineHeight: 1.55 }}>
                Product uploads are locked until WhatsApp is connected.
              </p>
              <button
                onClick={onConnectWhatsApp}
                style={{ alignSelf: "flex-start", padding: "10px 16px", borderRadius: "10px", border: "none", background: p?.primary, color: "#fff", fontWeight: 800, fontSize: "13px", cursor: "pointer" }}
              >
                Connect WhatsApp
              </button>
            </div>
          ) : (
            <p style={{ fontSize: "13px", color: p?.textPrimary, opacity: 0.6, lineHeight: 1.6, margin: "0 0 4px" }}>
              Add your products with prices, descriptions, and images. Your AI will use these to answer customer questions and take orders.
            </p>
          )}
          <ProductBuilder
            products={form.products}
            onChange={v => set("products", v)}
            pax26={p}
            currency={form.currency}
            sellerId={sellerId}
            locked={!whatsappConnected}
          />
        </div>
      );

    /* ── 3: Payment ── */
    case 3:
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <InfoBanner text="Your AI will automatically share these payment details when customers are ready to pay." pax26={p} />
          <PaymentBuilder
            payments={form.paymentDetails}
            onChange={v => set("paymentDetails", v)}
            pax26={p}
          />
        </div>
      );

    /* ── 4: AI Behaviour ── */
    case 4:
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <ThemedSelect
            label="Conversation Tone"
            pax26={p}
            value={form.tone}
            options={[
              { value: "salesy", label: "Salesy — persuasive & conversion-focused" },
              { value: "friendly", label: "Friendly — warm & conversational" },
              { value: "professional", label: "Professional — formal & structured" },
            ]}
            onChange={v => set("tone", v)}
          />
          <ThemedInput
            label="Working Hours"
            pax26={p}
            value={form.workingHours}
            onChange={e => set("workingHours", e.target.value)}
            placeholder="e.g. Mon–Sat 8am–8pm"
          />
          <Toggle label="Auto-Reply" hint="AI responds instantly to new messages" value={form.autoReplyEnabled} onChange={v => set("autoReplyEnabled", v)} pax26={p} />
          <Toggle label="Follow-Up Messages" hint="AI follows up on unresponded leads" value={form.followUpEnabled} onChange={v => set("followUpEnabled", v)} pax26={p} />
          {form.followUpEnabled && (
            <ThemedSelect
              label="Follow-Up Delay"
              pax26={p}
              value={String(form.followUpDelayMinutes)}
              options={[
                { value: "15", label: "15 minutes" },
                { value: "30", label: "30 minutes" },
                { value: "60", label: "1 hour" },
                { value: "120", label: "2 hours" },
                { value: "1440", label: "24 hours" },
              ]}
              onChange={v => set("followUpDelayMinutes", parseInt(v))}
            />
          )}
        </div>
      );

    /* ── 5: Review ── */
    case 5:
      return (
        <div>
          {form.logo?.url && (
            <div style={{ marginBottom: "16px" }}>
              <img src={form.logo.url} alt="Store logo" style={{ height: "60px", borderRadius: "10px", objectFit: "contain" }} />
            </div>
          )}
          <ReviewRow label="Store" value={form.businessName} pax26={p} />
          <ReviewRow label="Industry" value={form.industry} pax26={p} />
          <ReviewRow label="Currency" value={form.currency} pax26={p} />
          <ReviewRow label="Products" value={`${form.products.length} product${form.products.length !== 1 ? "s" : ""}`} pax26={p} />
          <ReviewRow label="Payment" value={`${form.paymentDetails.length} account${form.paymentDetails.length !== 1 ? "s" : ""}`} pax26={p} />
          <ReviewRow label="Tone" value={form.tone.charAt(0).toUpperCase() + form.tone.slice(1)} pax26={p} />
          <ReviewRow label="Hours" value={form.workingHours} pax26={p} />
          <ReviewRow label="Auto-Reply" value={form.autoReplyEnabled ? "Enabled" : "Disabled"} pax26={p} />
          <ReviewRow label="Follow-Up" value={form.followUpEnabled ? `Enabled · ${form.followUpDelayMinutes}min delay` : "Disabled"} pax26={p} />
          <ReviewRow label="WhatsApp" value={whatsappPhone || form.whatsappNumber} pax26={p} />
          <p style={{ fontSize: "12px", color: p?.textPrimary, opacity: 0.45, marginTop: "16px", lineHeight: 1.6 }}>
            Everything look right? Hit "Launch Agent" to train your AI sales assistant.
          </p>
        </div>
      );

    /* ── 6: Launch ── */
    case 6:
      return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "28px 0 16px", gap: "20px" }}>
          <div style={{ position: "relative", width: "80px", height: "80px" }}>
            <div className="animate-ping" style={{ position: "absolute", inset: 0, borderRadius: "50%", background: p?.primary, opacity: 0.15 }} />
            <div style={{ position: "relative", width: "80px", height: "80px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: `${p?.primary}18`, border: `2px solid ${p?.primary}33`, color: p?.textPrimary }}>
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
                <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
                <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
                <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
              </svg>
            </div>
          </div>
          <div>
            <h3 style={{ fontSize: "19px", fontWeight: 900, color: p?.textPrimary, margin: "0 0 8px" }}>
              Ready to launch{form.businessName ? ` ${form.businessName}'s` : " your"} Sales Agent
            </h3>
            <p style={{ fontSize: "13px", color: p?.textPrimary, opacity: 0.55, maxWidth: "320px", lineHeight: 1.65, margin: "0 auto" }}>
              Your AI will know your products, prices, payment details, and selling style — ready to handle customer inquiries and close sales automatically.
            </p>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", justifyContent: "center" }}>
            {[
              `${form.products.length} products`,
              `${form.paymentDetails.length} payment accounts`,
              form.tone,
              form.workingHours || "hours not set",
              form.followUpEnabled ? `follow-up ${form.followUpDelayMinutes}min` : "no follow-up",
            ].map((pill, i) => (
              <span key={i} style={{ fontSize: "11px", fontWeight: 700, padding: "5px 13px", borderRadius: "999px", background: `${p?.primary}14`, color: p?.textPrimary }}>{pill}</span>
            ))}
          </div>
        </div>
      );

    default:
      return null;
  }
}

/* ══════════════════════════════════════════════════════════
   SERVICE STEP RENDERER
   Renders each step of the SERVICE_STEPS wizard
══════════════════════════════════════════════════════════ */
function ServiceStepRenderer({ step, form, setForm, pax26 }) {
  const p = pax26;
  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  switch (step) {
    /* ── 0: Business Info ── */
    case 0:
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <ThemedInput
            label="Business Name *"
            pax26={p}
            value={form.businessName}
            onChange={e => set("businessName", e.target.value)}
            placeholder="e.g. Kemi Digital Agency"
          />
          <ThemedInput
            label="Industry *"
            pax26={p}
            value={form.industry}
            onChange={e => set("industry", e.target.value)}
            placeholder="e.g. Marketing, Legal, Consulting"
          />
          <ThemedTextarea
            label="Business Description"
            pax26={p}
            value={form.description}
            onChange={e => set("description", e.target.value)}
            placeholder="Tell the AI about what your business does…"
            rows={3}
          />
          <ThemedInput
            label="Website / Business URL"
            pax26={p}
            value={form.businessUrl}
            onChange={e => set("businessUrl", e.target.value)}
            placeholder="https://yourbusiness.com"
          />
          <ThemedSelect
            label="Currency"
            pax26={p}
            value={form.currency}
            options={CURRENCY_OPTIONS}
            onChange={v => set("currency", v)}
          />
        </div>
      );

    /* ── 1: Services & FAQs ── */
    case 1:
      return (
        <ServicesFaqsBuilder
          services={form.services}
          faqs={form.faqs}
          onServicesChange={v => set("services", v)}
          onFaqsChange={v => set("faqs", v)}
          pax26={p}
        />
      );

    /* ── 2: Payment ── */
    case 2:
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <InfoBanner text="Your AI will automatically share these payment details when clients are ready to pay." pax26={p} />
          <PaymentBuilder
            payments={form.paymentDetails}
            onChange={v => set("paymentDetails", v)}
            pax26={p}
          />
        </div>
      );

    /* ── 3: AI Behaviour ── */
    case 3:
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <ThemedSelect
            label="Conversation Tone"
            pax26={p}
            value={form.tone}
            options={[
              { value: "professional", label: "Professional — formal & structured" },
              { value: "friendly", label: "Friendly — warm & conversational" },
              { value: "salesy", label: "Salesy — persuasive & conversion-focused" },
            ]}
            onChange={v => set("tone", v)}
          />
          <ThemedInput
            label="Working Hours"
            pax26={p}
            value={form.workingHours}
            onChange={e => set("workingHours", e.target.value)}
            placeholder="e.g. Mon–Fri 9am–5pm"
          />
          <Toggle label="Auto-Reply" hint="AI responds instantly to new messages" value={form.autoReplyEnabled} onChange={v => set("autoReplyEnabled", v)} pax26={p} />
          <Toggle label="Follow-Up Messages" hint="AI follows up on unresponded leads" value={form.followUpEnabled} onChange={v => set("followUpEnabled", v)} pax26={p} />
          {form.followUpEnabled && (
            <ThemedSelect
              label="Follow-Up Delay"
              pax26={p}
              value={String(form.followUpDelayMinutes)}
              options={[
                { value: "15", label: "15 minutes" },
                { value: "30", label: "30 minutes" },
                { value: "60", label: "1 hour" },
                { value: "120", label: "2 hours" },
                { value: "1440", label: "24 hours" },
              ]}
              onChange={v => set("followUpDelayMinutes", parseInt(v))}
            />
          )}
        </div>
      );

    /* ── 4: WhatsApp ── */
    case 4:
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <InfoBanner text="Use international format e.g. <strong>+2348012345678</strong>. This is the number your clients will message." pax26={p} />
          <ThemedInput
            label="WhatsApp Business Number *"
            pax26={p}
            value={form.whatsappNumber}
            onChange={e => set("whatsappNumber", e.target.value)}
            placeholder="+2348012345678"
          />
        </div>
      );

    /* ── 5: Review ── */
    case 5:
      return (
        <div>
          <ReviewRow label="Business" value={form.businessName} pax26={p} />
          <ReviewRow label="Industry" value={form.industry} pax26={p} />
          <ReviewRow label="Services" value={`${form.services.filter(s => s.trim()).length} service(s)`} pax26={p} />
          <ReviewRow label="FAQs" value={`${form.faqs.length} FAQ(s)`} pax26={p} />
          <ReviewRow label="Payment" value={`${form.paymentDetails.length} account(s)`} pax26={p} />
          <ReviewRow label="Tone" value={form.tone.charAt(0).toUpperCase() + form.tone.slice(1)} pax26={p} />
          <ReviewRow label="Hours" value={form.workingHours} pax26={p} />
          <ReviewRow label="Auto-Reply" value={form.autoReplyEnabled ? "Enabled" : "Disabled"} pax26={p} />
          <ReviewRow label="WhatsApp" value={form.whatsappNumber} pax26={p} />
          <p style={{ fontSize: "12px", color: p?.textPrimary, opacity: 0.45, marginTop: "16px", lineHeight: 1.6 }}>
            Everything look right? Hit "Launch Agent" to train your AI service assistant.
          </p>
        </div>
      );

    /* ── 6: Launch ── */
    case 6:
      return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "28px 0 16px", gap: "20px" }}>
          <div style={{ position: "relative", width: "80px", height: "80px" }}>
            <div className="animate-ping" style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "#8b5cf6", opacity: 0.15 }} />
            <div style={{ position: "relative", width: "80px", height: "80px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: "#8b5cf618", border: "2px solid #8b5cf633", color: p?.textPrimary }}>
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
              </svg>
            </div>
          </div>
          <div>
            <h3 style={{ fontSize: "19px", fontWeight: 900, color: p?.textPrimary, margin: "0 0 8px" }}>
              Ready to launch{form.businessName ? ` ${form.businessName}'s` : " your"} Service Agent
            </h3>
            <p style={{ fontSize: "13px", color: p?.textPrimary, opacity: 0.55, maxWidth: "320px", lineHeight: 1.65, margin: "0 auto" }}>
              Your AI will know your services, FAQs, payment details, and professional style — ready to handle client inquiries 24/7.
            </p>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", justifyContent: "center" }}>
            {[
              `${form.services.filter(s => s.trim()).length} services`,
              `${form.faqs.length} FAQs`,
              `${form.paymentDetails.length} payment accounts`,
              form.tone,
              form.workingHours || "hours not set",
            ].map((pill, i) => (
              <span key={i} style={{ fontSize: "11px", fontWeight: 700, padding: "5px 13px", borderRadius: "999px", background: "#8b5cf614", color: p?.textPrimary }}>{pill}</span>
            ))}
          </div>
        </div>
      );

    default:
      return null;
  }
}

/* ══════════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════════ */
const AiTrainingPage = forwardRef(function AiTrainingPage(props, ref) {
  const { pax26, router, userData, setAIsPaxAiBusinessTrained, fetchUser } = useGlobalContext();

  // ── Business type gate ──────────────────────────────────
  // Derives from context; user may select via BusinessTypeSelector
  const [businessType, setBusinessType] = useState(userData?.paxAI?.businessType || null);

  useEffect(() => {
    setBusinessType(userData?.paxAI?.businessType || null);
  }, [userData?.paxAI?.businessType]);

  const [loading, setLoading] = useState(false);
  const [trainError, setTrainError] = useState("");
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);

  // ── Unified form state — covers both seller and service flows ─
  const [form, setForm] = useState({
    sellerId: "",           // populated from the fetched seller profile _id
    businessName: "",
    businessDescription: "",
    whatsappNumber: "",
    logo: null,             // { url, publicId }
    tone: "salesy",
    autoReplyEnabled: true,
    followUpEnabled: true,
    followUpDelayMinutes: 30,
    currency: "NGN",
    workingHours: "",
    paymentDetails: [],
    products: [],
    // Service-provider fields
    industry: "",
    description: "",
    businessUrl: "",
    services: [],
    faqs: [],
  });

  const whatsappConnected = !!(userData?.whatsapp?.connected && userData?.whatsapp?.displayPhone);
  const whatsappPhone = userData?.whatsapp?.displayPhone || "";

  // Keep form WhatsApp number in sync with the connected Meta number
  useEffect(() => {
    if (whatsappPhone) {
      setForm((f) => (f.whatsappNumber === whatsappPhone ? f : { ...f, whatsappNumber: whatsappPhone }));
    }
  }, [whatsappPhone]);

  // ── Derive active steps array based on businessType ────
  const STEPS = businessType === "service" ? SERVICE_STEPS : SELLER_STEPS;

  /* fetch existing seller profile on mount (seller flow only) */
  const fetchProfile = useCallback(async () => {
    if (businessType !== "seller") return;
    try {
      const res = await fetch("/api/seller/profile");
      const data = await res.json();
      if (data.success && data.profile) {
        const p = data.profile;
        setAIsPaxAiBusinessTrained?.(p.aiTrained || false);
        setForm(f => ({
          ...f,
          sellerId: p._id || "",
          businessName: p.businessName || "",
          businessDescription: p.businessDescription || "",
          industry: p.industry || f.industry || "",
          whatsappNumber: p.whatsappNumber || "",
          logo: p.logo || null,
          tone: p.tone || "salesy",
          autoReplyEnabled: p.autoReplyEnabled ?? true,
          followUpEnabled: p.followUpEnabled ?? true,
          followUpDelayMinutes: p.followUpDelayMinutes || 30,
          currency: p.currency || "NGN",
          workingHours: p.workingHours || "",
          paymentDetails: p.paymentDetails || [],
          products: p.products || [],
        }));
      }
    } catch (e) {
      console.error("fetchProfile error:", e);
    }
  }, [setAIsPaxAiBusinessTrained, businessType]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // ── Expose wizard state via ref (Property 10) ───────────
  useImperativeHandle(ref, () => ({
    getWizardState: () => ({
      businessType,
      currentStep: step,
      formData: {
        businessName: form.businessName,
        businessDescription: form.businessDescription,
        industry: form.industry,
        description: form.description,
        businessUrl: form.businessUrl,
        currency: form.currency,
        tone: form.tone,
        workingHours: form.workingHours,
        autoReplyEnabled: form.autoReplyEnabled,
        followUpEnabled: form.followUpEnabled,
        followUpDelayMinutes: form.followUpDelayMinutes,
        paymentDetails: form.paymentDetails,
        services: form.services,
        faqs: form.faqs,
        products: form.products,
        whatsappNumber: form.whatsappNumber,
      },
    }),
  }));

  /* per-step validation — type-specific */
  const nextDisabled = () => {
    if (businessType === "service") {
      switch (step) {
        case 0: return !form.businessName.trim() || !form.industry.trim();
        case 1: return form.services.filter(s => s.trim()).length === 0 && form.faqs.length === 0;
        case 2: return false; // payment optional
        case 3: return !form.tone || !form.workingHours.trim();
        case 4: return !(whatsappConnected || form.whatsappNumber.trim());
        default: return false;
      }
    }
    // seller — WhatsApp is step 1, Products is step 2
    switch (step) {
      case 0: return !form.businessName.trim() || !form.businessDescription.trim() || !form.industry.trim();
      case 1: return !whatsappConnected;
      case 2: return !whatsappConnected; // products are optional — can be added anytime
      case 3: return form.paymentDetails.length === 0;
      case 4: return !form.tone || !form.workingHours.trim();
      default: return false;
    }
  };

  const go = (dir) => {
    setDirection(dir);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const next = () => {
    if (businessType === "seller") {
      if (step === 1 && !whatsappConnected) return;
      if (step === 2 && !whatsappConnected) return;
    }
    if (step === STEPS.length - 1) { handleTrain(); return; }
    go(1);
    setStep(s => Math.min(s + 1, STEPS.length - 1));
  };

  const back = () => {
    go(-1);
    setStep(s => Math.max(s - 1, 0));
  };

  const handleTrain = async () => {
    setTrainError("");
    if (businessType === "seller" && !whatsappConnected) {
      setTrainError("Connect WhatsApp before launching your seller agent.");
      setStep(1);
      return;
    }
    try {
      setLoading(true);
      const endpoint = businessType === "service"
        ? "/api/automations/general-train"
        : "/api/automations/seller-train";
      const payload = businessType === "seller"
        ? {
          businessName: form.businessName,
          businessDescription: form.businessDescription || form.description,
          industry: form.industry,
          tone: form.tone,
          autoReplyEnabled: form.autoReplyEnabled,
          followUpEnabled: form.followUpEnabled,
          followUpDelayMinutes: form.followUpDelayMinutes,
          currency: form.currency,
          workingHours: form.workingHours,
          paymentDetails: form.paymentDetails,
          products: form.products,
          whatsappNumber: whatsappPhone || form.whatsappNumber,
        }
        : {
          ...form,
          description: form.description || form.businessDescription,
          whatsappNumber: whatsappPhone || form.whatsappNumber,
        };
      const res = await fetch(endpoint, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const text = await res.text();
      let data = null;
      try {
        data = text ? JSON.parse(text) : null;
      } catch {
        setTrainError("Training failed. Please try again.");
        return;
      }
      if (res.ok && data?.success) {
        setAIsPaxAiBusinessTrained?.(true);
        await fetchUser?.();
        router.push("/dashboard/automations/ai-business-dashboard");
      } else {
        setTrainError(data?.message || "Training failed. Please try again.");
      }
    } catch (e) {
      console.error("handleTrain error:", e);
      setTrainError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Business type gate: show selector if no type chosen ──
  if (businessType === null) {
    return (
      <>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div style={{ minHeight: "100vh", paddingBottom: "80px", paddingTop: "24px", maxWidth: "640px", margin: "0 auto", paddingLeft: "16px", paddingRight: "16px" }}>
          <div style={{ marginBottom: "28px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
              <div style={{ width: "32px", height: "32px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", background: `${pax26?.primary}22`, color: pax26?.textPrimary }}>
                <BotIcon />
              </div>
              <p style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: pax26?.textPrimary, opacity: 0.5, margin: 0 }}>Agent Setup</p>
            </div>
            <h1 style={{ fontSize: "22px", fontWeight: 900, letterSpacing: "-0.5px", color: pax26?.textPrimary, margin: "0 0 4px" }}>Set Up Your AI Agent</h1>
            <p style={{ fontSize: "13px", color: pax26?.textPrimary, opacity: 0.55, margin: 0 }}>Choose how your business works to get the right AI setup</p>
          </div>
          <BusinessTypeSelector onSelect={setBusinessType} pax26={pax26} />
        </div>
      </>
    );
  }

  const StepIcon = STEPS[step].icon;
  const progress = (step / (STEPS.length - 1)) * 100;
  const isLastStep = step === STEPS.length - 1;
  const disabled = nextDisabled() || loading;
  const accentColor = businessType === "service" ? "#8b5cf6" : pax26?.primary;

  return (
    <>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } } .animate-ping { animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite; } @keyframes ping { 75%, 100% { transform: scale(2); opacity: 0; } }`}</style>

      <div style={{ minHeight: "100vh", paddingBottom: "80px", paddingTop: "24px", maxWidth: "640px", margin: "0 auto", paddingLeft: "16px", paddingRight: "16px" }}>

        {/* ── Page header ── */}
        <div style={{ marginBottom: "28px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", background: `${accentColor}22`, color: pax26?.textPrimary }}>
              <BotIcon />
            </div>
            <p style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: pax26?.textPrimary, opacity: 0.5, margin: 0 }}>
              {businessType === "service" ? "AI Service Agent" : "AI Sales Agent"}
            </p>
          </div>
          <h1 style={{ fontSize: "22px", fontWeight: 900, letterSpacing: "-0.5px", color: pax26?.textPrimary, margin: "0 0 4px" }}>
            {businessType === "service" ? "Train your Service Agent" : "Train your Seller Agent"}
          </h1>
          <p style={{ fontSize: "13px", color: pax26?.textPrimary, opacity: 0.55, margin: 0 }}>
            {businessType === "service"
              ? "Set up your services, FAQs & payment so your AI can handle clients 24/7"
              : "Set up your store, products & payment so your AI can sell for you 24/7"}
          </p>
        </div>

        {/* ── Progress bar ── */}
        <div style={{ marginBottom: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
            <span style={{ fontSize: "12px", color: pax26?.textPrimary, opacity: 0.5 }}>Step {step + 1} of {STEPS.length}</span>
            <span style={{ fontSize: "12px", fontWeight: 700, color: accentColor }}>{Math.round(progress)}%</span>
          </div>
          <div style={{ height: "4px", borderRadius: "999px", overflow: "hidden", background: pax26?.secondaryBg }}>
            <div style={{ height: "100%", borderRadius: "999px", background: `linear-gradient(90deg, ${accentColor}, ${accentColor}cc)`, width: `${progress}%`, transition: "width 0.5s cubic-bezier(0.4,0,0.2,1)" }} />
          </div>
        </div>

        {/* ── Step pills ── */}
        <div style={{ display: "flex", gap: "6px", marginBottom: "24px", overflowX: "auto", paddingBottom: "4px" }}>
          {STEPS.map((s, i) => {
            const SIcon = s.icon;
            const done = i < step;
            const active = i === step;
            return (
              <button
                key={i}
                onClick={() => { if (i < step) { go(-1); setStep(i); } }}
                disabled={i > step}
                title={s.label}
                style={{
                  display: "flex", alignItems: "center", gap: "6px",
                  padding: "6px 12px", borderRadius: "999px",
                  fontSize: "11px", fontWeight: 700, flexShrink: 0, border: "none",
                  cursor: i > step ? "not-allowed" : "pointer", transition: "all 0.2s",
                  background: active ? accentColor : done ? `${accentColor}18` : pax26?.secondaryBg,
                  color: active ? "#fff" : pax26?.textPrimary,
                  opacity: !active && !done ? 0.4 : 1,
                }}
              >
                {done ? <CheckIcon /> : <SIcon />}
              </button>
            );
          })}
        </div>

        {/* ── Step card ── */}
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            initial={{ opacity: 0, x: direction * 28 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -28 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
          >
            {/* Card header */}
            <div style={{ borderRadius: "16px 16px 0 0", padding: "18px 20px", display: "flex", alignItems: "center", gap: "14px", background: `${accentColor}0e`, borderBottom: `1px solid ${accentColor}1a` }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", background: accentColor, color: "#fff", flexShrink: 0 }}>
                <StepIcon />
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: "17px", fontWeight: 900, color: pax26?.textPrimary }}>{STEPS[step].label}</h2>
                <p style={{ margin: "2px 0 0", fontSize: "12px", color: pax26?.textPrimary, opacity: 0.55 }}>{STEPS[step].desc}</p>
              </div>
            </div>

            {/* Card body */}
            <div style={{
              borderRadius: "0 0 16px 16px",
              padding: "20px",
              backgroundColor: pax26?.card || pax26?.bg,
              borderLeft: `1px solid ${pax26?.border}`,
              borderRight: `1px solid ${pax26?.border}`,
              borderBottom: `1px solid ${pax26?.border}`,
              borderTop: "none",
            }}>
              {businessType === "service" ? (
                <ServiceStepRenderer
                  step={step}
                  form={form}
                  setForm={setForm}
                  pax26={pax26}
                />
              ) : (
                <StepRenderer
                  step={step}
                  form={form}
                  setForm={setForm}
                  pax26={pax26}
                  sellerId={form.sellerId}
                  whatsappConnected={whatsappConnected}
                  whatsappPhone={whatsappPhone}
                  onConnectWhatsApp={() => router.push("/dashboard/automations/whatsapp#connect")}
                />
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* ── Train error ── */}
        {trainError && (
          <div style={{ marginTop: "12px", padding: "10px 14px", borderRadius: "10px", background: "#ff444415", border: "1px solid #ff444433", color: "#ff4444", fontSize: "13px" }}>
            {trainError}
          </div>
        )}

        {/* ── Navigation ── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "20px", gap: "12px" }}>
          {step > 0 ? (
            <button
              onClick={back}
              disabled={loading}
              style={{ display: "flex", alignItems: "center", gap: "6px", padding: "11px 20px", borderRadius: "12px", fontSize: "13px", fontWeight: 600, cursor: "pointer", background: pax26?.secondaryBg, color: pax26?.textPrimary, border: `1px solid ${pax26?.border}`, transition: "border-color 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.borderColor = accentColor + "44"}
              onMouseLeave={e => e.currentTarget.style.borderColor = pax26?.border}
            >
              <ChevronLeftIcon /> Back
            </button>
          ) : <div />}

          <button
            onClick={next}
            disabled={disabled}
            style={{
              display: "flex", alignItems: "center", gap: "8px",
              padding: "11px 24px", borderRadius: "12px",
              fontSize: "13px", fontWeight: 800, marginLeft: "auto",
              cursor: disabled ? "not-allowed" : "pointer",
              background: disabled ? pax26?.secondaryBg : accentColor,
              color: disabled ? pax26?.textPrimary : "#fff",
              border: `1px solid ${disabled ? pax26?.border : "transparent"}`,
              opacity: nextDisabled() ? 0.5 : 1,
              boxShadow: !disabled ? `0 6px 20px ${accentColor}35` : "none",
              transition: "all 0.2s",
            }}
          >
            {loading
              ? <><Spinner />Processing…</>
              : isLastStep
                ? <><RocketIcon />Launch Agent</>
                : <>Save & Continue<ChevronRightIcon /></>
            }
          </button>
        </div>

      </div>
    </>
  );
});

export default AiTrainingPage;