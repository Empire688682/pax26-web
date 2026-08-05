"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useGlobalContext } from "@/components/Context";
import { formatPrice, getCurrencySymbol } from "@/app/lib/currency/currencyHelper";
import { generateSlug } from "@/app/lib/store/generateSlug";

/* ── Icons ──────────────────────────────────────────────── */
const PlusIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>);
const TrashIcon = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>);
const EditIcon = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>);
const PackageIcon = () => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>);
const SearchIcon = () => (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>);
const XIcon = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>);
const UploadIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>);
const EyeIcon = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>);
const Spinner = ({ color = "white", size = 16 }) => (<div style={{ width: size, height: size, border: `2px solid ${color}30`, borderTopColor: color, borderRadius: "50%", animation: "pm-spin 0.7s linear infinite", flexShrink: 0 }}/>);

/* ── Shared primitives ──────────────────────────────────── */
const fieldBase = (p) => ({
  width: "100%", backgroundColor: p?.secondaryBg, color: p?.textPrimary,
  border: `1px solid ${p?.border}`, borderRadius: "10px", padding: "10px 14px",
  fontSize: "14px", fontFamily: "inherit", outline: "none",
  transition: "border-color 0.2s, box-shadow 0.2s", boxSizing: "border-box",
});

const Label = ({ children, p }) => (
  <label style={{ display: "block", fontSize: "11px", fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: p?.textPrimary, opacity: 0.65, marginBottom: "5px" }}>{children}</label>
);

function TInput({ label, p, style, ...rest }) {
  const [f, setF] = useState(false);
  return (
    <div>
      {label && <Label p={p}>{label}</Label>}
      <input {...rest} style={{ ...fieldBase(p), borderColor: f ? p?.primary : p?.border, boxShadow: f ? `0 0 0 3px ${p?.primary}18` : "none", ...style }} onFocus={() => setF(true)} onBlur={() => setF(false)} />
    </div>
  );
}

function TTextarea({ label, p, rows = 3, style, ...rest }) {
  const [f, setF] = useState(false);
  return (
    <div>
      {label && <Label p={p}>{label}</Label>}
      <textarea {...rest} rows={rows} style={{ ...fieldBase(p), resize: "vertical", borderColor: f ? p?.primary : p?.border, boxShadow: f ? `0 0 0 3px ${p?.primary}18` : "none", ...style }} onFocus={() => setF(true)} onBlur={() => setF(false)} />
    </div>
  );
}

function TSelect({ label, p, options = [], value, onChange, style }) {
  const [f, setF] = useState(false);
  return (
    <div>
      {label && <Label p={p}>{label}</Label>}
      <select value={value} onChange={e => onChange(e.target.value)} onFocus={() => setF(true)} onBlur={() => setF(false)}
        style={{ ...fieldBase(p), cursor: "pointer", appearance: "none", backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23888' strokeWidth='2.5' xmlns='http://www.w3.org/2000/svg'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center", paddingRight: "36px", borderColor: f ? p?.primary : p?.border, boxShadow: f ? `0 0 0 3px ${p?.primary}18` : "none", ...style }}>
        {options.map(o => <option key={o.value} value={o.value} style={{ backgroundColor: p?.secondaryBg, color: p?.textPrimary }}>{o.label}</option>)}
      </select>
    </div>
  );
}

/* ── Image Uploader ─────────────────────────────────────── */
function ImageUploader({ images, onChange, p, sellerId }) {
  const ref = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [convertNotice, setConvertNotice] = useState("");

  const handleFiles = async (files) => {
    const arr = Array.from(files).slice(0, 6 - images.length);
    if (!arr.length) return;

    // Detect non-JPEG/PNG files and show a notice that they'll be auto-converted
    const hasNonStandard = arr.some(f => !f.type.match(/^image\/(jpeg|jpg|png)$/i));
    if (hasNonStandard) {
      setConvertNotice("WebP/AVIF files detected — we'll auto-convert them to JPEG for WhatsApp compatibility.");
      setTimeout(() => setConvertNotice(""), 5000);
    }

    setUploading(true);
    try {
      const results = await Promise.all(arr.map(async (file) => {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("folder", sellerId ? `pax26/${sellerId}/products` : "pax26/products");
        fd.append("tags", "product");
        const res = await fetch("/api/upload/cloudinary", { method: "POST", body: fd });
        return res.json();
      }));
      onChange([...images, ...results.map(r => ({ url: r.url, publicId: r.publicId }))]);
    } catch { /* silent */ }
    finally { setUploading(false); }
  };

  return (
    <div>
      <Label p={p}>Product Images (up to 6)</Label>
      {/* WhatsApp format notice */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", padding: "8px 12px", borderRadius: "8px", background: `${p?.primary}0d`, border: `1px solid ${p?.primary}25`, marginBottom: "10px" }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={p?.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: "1px" }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <p style={{ margin: 0, fontSize: "11px", color: p?.textPrimary, opacity: 0.7, lineHeight: 1.5 }}>
          Upload <strong>JPEG or PNG</strong> for best WhatsApp delivery. Any other format (WebP, AVIF, HEIC) will be <strong>automatically converted to JPEG</strong> — no action needed from you.
        </p>
      </div>

      {convertNotice && (
        <div style={{ padding: "7px 12px", borderRadius: "8px", background: "#f59e0b18", border: "1px solid #f59e0b44", marginBottom: "10px" }}>
          <p style={{ margin: 0, fontSize: "11px", color: "#92400e" }}>⚡ {convertNotice}</p>
        </div>
      )}

      <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
        {images.map((img, i) => (
          <div key={i} style={{ position: "relative", width: "78px", height: "78px", borderRadius: "10px", overflow: "hidden", border: `1px solid ${p?.border}` }}>
            <img src={img.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            <button onClick={() => onChange(images.filter((_, j) => j !== i))} style={{ position: "absolute", top: "3px", right: "3px", width: "20px", height: "20px", borderRadius: "50%", background: "#ff4444cc", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", padding: 0 }}><XIcon /></button>
          </div>
        ))}
        {images.length < 6 && (
          <button onClick={() => ref.current?.click()} disabled={uploading} style={{ width: "78px", height: "78px", borderRadius: "10px", border: `2px dashed ${p?.border}`, background: p?.secondaryBg, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "4px", color: p?.textPrimary, opacity: uploading ? 0.5 : 0.7 }}>
            {uploading ? <Spinner color={p?.primary} /> : <><UploadIcon /><span style={{ fontSize: "10px" }}>Add</span></>}
          </button>
        )}
      </div>
      {/* Accept all image types — server auto-converts to JPEG */}
      <input ref={ref} type="file" accept="image/*" multiple style={{ display: "none" }} onChange={e => handleFiles(e.target.files)} />
    </div>
  );
}

/* ── Tag Input ──────────────────────────────────────────── */
function TagInput({ tags, onChange, p, placeholder = "Add tag, press Enter" }) {
  const [input, setInput] = useState("");
  const add = () => {
    const t = input.trim().toLowerCase();
    if (t && !tags.includes(t)) onChange([...tags, t]);
    setInput("");
  };
  return (
    <div>
      <Label p={p}>Tags (for AI search)</Label>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", padding: "8px 10px", borderRadius: "10px", border: `1px solid ${p?.border}`, background: p?.secondaryBg, minHeight: "42px" }}>
        {tags.map(t => (
          <span key={t} style={{ display: "flex", alignItems: "center", gap: "4px", padding: "3px 10px", borderRadius: "999px", background: `${p?.primary}18`, color: p?.primary, fontSize: "12px", fontWeight: 600 }}>
            {t}
            <button onClick={() => onChange(tags.filter(x => x !== t))} style={{ background: "none", border: "none", cursor: "pointer", color: "inherit", padding: 0, display: "flex", alignItems: "center" }}><XIcon /></button>
          </span>
        ))}
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); add(); } }} placeholder={tags.length === 0 ? placeholder : ""} style={{ border: "none", outline: "none", background: "none", color: p?.textPrimary, fontSize: "13px", minWidth: "100px", flex: 1, fontFamily: "inherit" }} />
      </div>
      <p style={{ margin: "4px 0 0", fontSize: "11px", color: p?.textPrimary, opacity: 0.45 }}>Press Enter or comma to add. Tags help the AI find this product.</p>
    </div>
  );
}

/* ── Variant Builder ────────────────────────────────────── */
function VariantBuilder({ variants, onChange, p }) {
  const addVariant = () => onChange([...variants, { label: "", options: [] }]);
  const removeVariant = (i) => onChange(variants.filter((_, j) => j !== i));
  const updateLabel = (i, label) => onChange(variants.map((v, j) => j === i ? { ...v, label } : v));
  const addOption = (i) => onChange(variants.map((v, j) => j === i ? { ...v, options: [...v.options, { value: "", priceAdjustment: 0, stock: 0 }] } : v));
  const removeOption = (vi, oi) => onChange(variants.map((v, j) => j === vi ? { ...v, options: v.options.filter((_, k) => k !== oi) } : v));
  const updateOption = (vi, oi, field, val) => onChange(variants.map((v, j) => j === vi ? { ...v, options: v.options.map((o, k) => k === oi ? { ...o, [field]: val } : o) } : v));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <Label p={p}>Variants (Size, Color, Material…)</Label>
      {variants.map((v, vi) => (
        <div key={vi} style={{ padding: "14px", borderRadius: "12px", border: `1px solid ${p?.border}`, background: p?.bg, display: "flex", flexDirection: "column", gap: "10px" }}>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <input value={v.label} onChange={e => updateLabel(vi, e.target.value)} placeholder="Variant label (e.g. Size)" style={{ ...fieldBase(p), flex: 1 }} />
            <button onClick={() => removeVariant(vi)} style={{ padding: "8px", borderRadius: "8px", border: "none", background: "#ff444415", color: "#ff4444", cursor: "pointer", display: "flex", alignItems: "center" }}><TrashIcon /></button>
          </div>
          {v.options.map((o, oi) => (
            <div key={oi} style={{ display: "grid", gridTemplateColumns: "1fr 100px 80px auto", gap: "6px", alignItems: "center" }}>
              <input value={o.value} onChange={e => updateOption(vi, oi, "value", e.target.value)} placeholder="Value (e.g. 42)" style={{ ...fieldBase(p), padding: "8px 12px" }} />
              <input type="number" value={o.priceAdjustment} onChange={e => updateOption(vi, oi, "priceAdjustment", Number(e.target.value))} placeholder="+price" title="Price adjustment" style={{ ...fieldBase(p), padding: "8px 12px" }} />
              <input type="number" value={o.stock} onChange={e => updateOption(vi, oi, "stock", Number(e.target.value))} placeholder="Stock" style={{ ...fieldBase(p), padding: "8px 12px" }} />
              <button onClick={() => removeOption(vi, oi)} style={{ padding: "8px", borderRadius: "8px", border: "none", background: "#ff444415", color: "#ff4444", cursor: "pointer", display: "flex", alignItems: "center" }}><XIcon /></button>
            </div>
          ))}
          <button onClick={() => addOption(vi)} style={{ fontSize: "12px", fontWeight: 600, color: p?.primary, background: `${p?.primary}10`, border: `1px dashed ${p?.primary}44`, borderRadius: "8px", padding: "7px", cursor: "pointer" }}>+ Add Option</button>
        </div>
      ))}
      <button onClick={addVariant} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", padding: "10px", borderRadius: "10px", border: `2px dashed ${p?.border}`, background: "transparent", color: p?.textPrimary, fontSize: "13px", fontWeight: 600, cursor: "pointer", opacity: 0.7 }}>
        <PlusIcon /> Add Variant Group
      </button>
    </div>
  );
}

/* ── Empty product form ─────────────────────────────────── */
const emptyProduct = () => ({
  name: "", slug: "", price: "", discountPrice: "", comparePrice: "",
  sku: "", description: "", category: "", tags: [], stock: "",
  isPhysical: true, isAvailable: true,
  deliveryFee: "", deliveryTimeFrame: "", locationNotes: "",
  images: [], variants: [],
});

/* ── Product Form (create + edit) ──────────────────────── */
function ProductForm({ initial, onSave, onCancel, p, currency, sellerId, saving }) {
  const [form, setForm] = useState(initial || emptyProduct());
  const sym = getCurrencySymbol(currency);

  // Auto-slug when name changes (only if slug is empty / auto-mode)
  const [autoSlug, setAutoSlug] = useState(!initial?.slug);
  const set = (field, val) => setForm(f => ({ ...f, [field]: val }));

  const handleName = (val) => {
    set("name", val);
    if (autoSlug) set("slug", generateSlug(val));
  };

  const canSave = form.name.trim() && String(form.price).trim();

  const handleSubmit = () => {
    if (!canSave) return;
    onSave({
      ...form,
      price: parseFloat(form.price) || 0,
      discountPrice: form.discountPrice ? parseFloat(form.discountPrice) : undefined,
      comparePrice: form.comparePrice ? parseFloat(form.comparePrice) : undefined,
      deliveryFee: form.deliveryFee ? parseFloat(form.deliveryFee) : undefined,
      stock: parseInt(form.stock) || 0,
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Basic info */}
      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        <TInput label="Product Name *" p={p} value={form.name} onChange={e => handleName(e.target.value)} placeholder="e.g. Black Nike Sneakers" />
        <div>
          <Label p={p}>URL Slug</Label>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <input value={form.slug} onChange={e => { setAutoSlug(false); set("slug", generateSlug(e.target.value)); }} placeholder="auto-generated" style={{ ...fieldBase(p), flex: 1 }} />
            {!autoSlug && <button onClick={() => { setAutoSlug(true); set("slug", generateSlug(form.name)); }} style={{ fontSize: "11px", padding: "8px 12px", borderRadius: "8px", border: `1px solid ${p?.border}`, background: "transparent", color: p?.textPrimary, cursor: "pointer", whiteSpace: "nowrap" }}>Auto</button>}
          </div>
          <p style={{ margin: "4px 0 0", fontSize: "11px", color: p?.textPrimary, opacity: 0.4 }}>/store/…/{form.slug || "your-product-name"}</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "12px" }}>
          <TInput label={`Price (${sym}) *`} p={p} type="number" value={form.price} onChange={e => set("price", e.target.value)} placeholder="5000" />
          <TInput label={`Discount Price (${sym})`} p={p} type="number" value={form.discountPrice} onChange={e => set("discountPrice", e.target.value)} placeholder="4500" />
          <TInput label={`Compare Price (${sym})`} p={p} type="number" value={form.comparePrice} onChange={e => set("comparePrice", e.target.value)} placeholder="6000" />
          <TInput label="Stock Qty" p={p} type="number" value={form.stock} onChange={e => set("stock", e.target.value)} placeholder="10" />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <TInput label="Category" p={p} value={form.category} onChange={e => set("category", e.target.value)} placeholder="e.g. Shoes, Bags" />
          <TInput label="SKU (internal code)" p={p} value={form.sku} onChange={e => set("sku", e.target.value)} placeholder="e.g. NK-BLK-42" />
        </div>
        <TTextarea label="Description" p={p} value={form.description} onChange={e => set("description", e.target.value)} placeholder="Describe this product…" rows={3} />
      </div>

      {/* Toggles */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        {[
          { label: "Physical Product", hint: "Requires delivery", field: "isPhysical" },
          { label: "Available", hint: "Visible in store + AI", field: "isAvailable" },
        ].map(({ label, hint, field }) => (
          <div key={field} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", borderRadius: "10px", background: p?.secondaryBg, border: `1px solid ${p?.border}` }}>
            <div>
              <p style={{ fontSize: "13px", fontWeight: 600, color: p?.textPrimary, margin: 0 }}>{label}</p>
              <p style={{ fontSize: "11px", color: p?.textPrimary, opacity: 0.45, margin: "2px 0 0" }}>{hint}</p>
            </div>
            <button onClick={() => set(field, !form[field])} style={{ width: "44px", height: "24px", borderRadius: "999px", border: "none", cursor: "pointer", background: form[field] ? p?.primary : p?.border, transition: "background 0.2s", position: "relative", flexShrink: 0 }}>
              <span style={{ position: "absolute", top: "3px", left: form[field] ? "23px" : "3px", width: "18px", height: "18px", borderRadius: "50%", background: "#fff", transition: "left 0.2s", boxShadow: "0 1px 4px rgba(0,0,0,0.3)" }} />
            </button>
          </div>
        ))}
      </div>

      {/* Delivery (physical only) */}
      {form.isPhysical && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "12px" }}>
          <TInput label={`Delivery Fee (${sym})`} p={p} type="number" value={form.deliveryFee} onChange={e => set("deliveryFee", e.target.value)} placeholder="1000" />
          <TInput label="Delivery Time" p={p} value={form.deliveryTimeFrame} onChange={e => set("deliveryTimeFrame", e.target.value)} placeholder="24-48 hours" />
          <TInput label="Delivery Location" p={p} value={form.locationNotes} onChange={e => set("locationNotes", e.target.value)} placeholder="Lagos only" />
        </div>
      )}

      {/* Tags, images, variants */}
      <TagInput tags={form.tags} onChange={v => set("tags", v)} p={p} />
      <ImageUploader images={form.images} onChange={v => set("images", v)} p={p} sellerId={sellerId} />
      <VariantBuilder variants={form.variants} onChange={v => set("variants", v)} p={p} />

      {/* Actions */}
      <div style={{ display: "flex", gap: "10px", paddingTop: "8px" }}>
        <button onClick={onCancel} style={{ flex: 1, padding: "12px", borderRadius: "12px", border: `1px solid ${p?.border}`, background: "transparent", color: p?.textPrimary, fontWeight: 700, fontSize: "14px", cursor: "pointer" }}>Cancel</button>
        <button onClick={handleSubmit} disabled={!canSave || saving} style={{ flex: 2, padding: "12px", borderRadius: "12px", border: "none", background: canSave && !saving ? p?.primary : p?.border, color: "#fff", fontWeight: 800, fontSize: "14px", cursor: canSave && !saving ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
          {saving ? <><Spinner /> Saving…</> : "Save Product"}
        </button>
      </div>
    </div>
  );
}

/* ── Product Card (list view) ───────────────────────────── */
function ProductCard({ product, currency, onEdit, onDelete, onToggle, p, storeSlug }) {
  const [deleting, setDeleting] = useState(false);
  const displayPrice = product.discountPrice || product.price;
  const imgUrl = product.images?.[0]?.url;

  const handleDelete = async () => {
    if (!confirm(`Delete "${product.name}"? This cannot be undone.`)) return;
    setDeleting(true);
    await onDelete(product._id);
    setDeleting(false);
  };

  return (
    <div style={{ background: p?.secondaryBg, borderRadius: "16px", border: `1px solid ${p?.border}`, overflow: "hidden", display: "flex", flexDirection: "column", transition: "box-shadow 0.15s" }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.08)"}
      onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}>
      {/* Image */}
      <div style={{ paddingTop: "70%", position: "relative", background: p?.bg, flexShrink: 0 }}>
        {imgUrl ? <img src={imgUrl} alt={product.name} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
          : <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: p?.textPrimary, opacity: 0.2 }}><PackageIcon /></div>}
        {/* Availability badge */}
        <div style={{ position: "absolute", top: "8px", right: "8px" }}>
          <button onClick={() => onToggle(product._id, !product.isAvailable)} title={product.isAvailable ? "Click to hide" : "Click to show"} style={{ padding: "4px 10px", borderRadius: "6px", border: "none", background: product.isAvailable ? "#22c55e" : "#888", color: "#fff", fontSize: "10px", fontWeight: 800, cursor: "pointer", letterSpacing: "0.06em" }}>
            {product.isAvailable ? "LIVE" : "HIDDEN"}
          </button>
        </div>
      </div>
      {/* Info */}
      <div style={{ padding: "14px", flex: 1, display: "flex", flexDirection: "column", gap: "6px" }}>
        {product.category && <span style={{ fontSize: "10px", fontWeight: 700, color: p?.textPrimary, opacity: 0.45, textTransform: "uppercase", letterSpacing: "0.08em" }}>{product.category}</span>}
        <p style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: p?.textPrimary, lineHeight: 1.35, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{product.name}</p>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "auto", paddingTop: "8px" }}>
          <span style={{ fontSize: "16px", fontWeight: 900, color: p?.textPrimary }}>{formatPrice(displayPrice, currency)}</span>
          {product.discountPrice && <span style={{ fontSize: "12px", color: p?.textPrimary, opacity: 0.4, textDecoration: "line-through" }}>{formatPrice(product.price, currency)}</span>}
        </div>
        <p style={{ margin: 0, fontSize: "11px", color: product.stock > 0 ? "#22c55e" : "#ef4444", fontWeight: 600 }}>{product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}</p>
      </div>
      {/* Actions */}
      <div style={{ display: "flex", borderTop: `1px solid ${p?.border}` }}>
        <button onClick={() => onEdit(product)} style={{ flex: 1, padding: "10px", border: "none", background: "transparent", color: p?.textPrimary, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", fontSize: "12px", fontWeight: 600, opacity: 0.7, transition: "opacity 0.15s" }} onMouseEnter={e => e.currentTarget.style.opacity = "1"} onMouseLeave={e => e.currentTarget.style.opacity = "0.7"}>
          <EditIcon /> Edit
        </button>
        {storeSlug && (
          <a href={`/store/${storeSlug}/${product.slug || product._id}`} target="_blank" rel="noopener noreferrer" style={{ flex: 1, padding: "10px", borderLeft: `1px solid ${p?.border}`, borderRight: `1px solid ${p?.border}`, background: "transparent", color: p?.textPrimary, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", fontSize: "12px", fontWeight: 600, opacity: 0.7, textDecoration: "none", transition: "opacity 0.15s" }} onMouseEnter={e => e.currentTarget.style.opacity = "1"} onMouseLeave={e => e.currentTarget.style.opacity = "0.7"}>
            <EyeIcon /> Preview
          </a>
        )}
        <button onClick={handleDelete} disabled={deleting} style={{ flex: 1, padding: "10px", border: "none", background: "transparent", color: "#ef4444", cursor: deleting ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", fontSize: "12px", fontWeight: 600, opacity: 0.7, transition: "opacity 0.15s" }} onMouseEnter={e => e.currentTarget.style.opacity = "1"} onMouseLeave={e => e.currentTarget.style.opacity = "0.7"}>
          {deleting ? <Spinner color="#ef4444" size={14} /> : <TrashIcon />} Delete
        </button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   MAIN EXPORT: ProductManager
══════════════════════════════════════════════════════════ */
export default function ProductManager() {
  const { pax26: p, userData, router } = useGlobalContext();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [view, setView] = useState("list"); // "list" | "create" | "edit"
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("all");
  const [sellerId, setSellerId] = useState(null);
  const [storeSlug, setStoreSlug] = useState(null);
  const [currency, setCurrency] = useState("NGN");

  const isSellerUser = userData?.paxAI?.businessType === "seller";

  // Fetch products + profile data
  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [prodRes, profileRes] = await Promise.all([
        fetch("/api/seller/products"),
        fetch("/api/seller/profile"),
      ]);
      const prodData = await prodRes.json();
      const profileData = await profileRes.json();
      if (prodData.success) setProducts(prodData.products || []);
      if (profileData.success) {
        setSellerId(profileData.profile?._id || null);
        setStoreSlug(profileData.profile?.slug || null);
        setCurrency(profileData.profile?.currency || "NGN");
      }
    } catch (err) {
      console.error("ProductManager fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { if (isSellerUser) fetchAll(); else setLoading(false); }, [isSellerUser, fetchAll]);

  // Derived category list for filter pills
  const categories = [...new Set(products.map(p => p.category).filter(Boolean))].sort();

  // Local filter (applied on top of the API list)
  const filtered = products.filter(prod => {
    const matchesCat = filterCat === "all" || prod.category === filterCat;
    const q = search.trim().toLowerCase();
    const matchesSearch = !q || prod.name?.toLowerCase().includes(q) || prod.category?.toLowerCase().includes(q) || prod.tags?.some(t => t.toLowerCase().includes(q));
    return matchesCat && matchesSearch;
  });

  // Create
  const handleCreate = async (data) => {
    setSaving(true);
    try {
      const res = await fetch("/api/seller/products", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      const json = await res.json();
      if (json.success) { setProducts(prev => [json.product, ...prev]); setView("list"); }
      else alert("Save failed: " + (json.message || "Unknown error"));
    } catch { alert("Network error. Please try again."); }
    finally { setSaving(false); }
  };

  // Update
  const handleUpdate = async (data) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/seller/products/${editing._id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      const json = await res.json();
      if (json.success) { setProducts(prev => prev.map(p => p._id === editing._id ? json.product : p)); setView("list"); setEditing(null); }
      else alert("Update failed: " + (json.message || "Unknown error"));
    } catch { alert("Network error. Please try again."); }
    finally { setSaving(false); }
  };

  // Delete
  const handleDelete = async (id) => {
    try {
      const res = await fetch(`/api/seller/products/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) setProducts(prev => prev.filter(p => p._id !== id));
      else alert("Delete failed: " + (json.message || "Unknown error"));
    } catch { alert("Network error. Please try again."); }
  };

  // Toggle availability
  const handleToggle = async (id, isAvailable) => {
    setProducts(prev => prev.map(p => p._id === id ? { ...p, isAvailable } : p));
    try {
      await fetch(`/api/seller/products/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isAvailable }) });
    } catch { setProducts(prev => prev.map(p => p._id === id ? { ...p, isAvailable: !isAvailable } : p)); }
  };

  // ── Not a seller ─────────────────────────────────────────
  if (!loading && !isSellerUser) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", padding: "40px 20px", textAlign: "center" }}>
        <div style={{ fontSize: "48px", marginBottom: "20px" }}>🛒</div>
        <h2 style={{ fontSize: "22px", fontWeight: 900, color: p?.textPrimary, margin: "0 0 10px" }}>Product Manager is for Sellers</h2>
        <p style={{ fontSize: "14px", color: p?.textPrimary, opacity: 0.6, maxWidth: "360px", margin: "0 0 28px" }}>Set your business type to Seller in the AI Agent Setup to manage your product catalogue.</p>
        <button onClick={() => router.push("/dashboard/automations/ai-business-dashboard")} style={{ padding: "12px 28px", borderRadius: "12px", background: p?.primary, color: "#fff", fontWeight: 800, border: "none", cursor: "pointer", fontSize: "14px" }}>Go to AI Agent Setup</button>
      </div>
    );
  }

  // ── Loading ───────────────────────────────────────────────
  if (loading) {
    return <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh" }}><Spinner color={p?.primary} size={28} /></div>;
  }

  // ── Create / Edit form ───────────────────────────────────
  if (view === "create" || view === "edit") {
    return (
      <div style={{ maxWidth: "760px", margin: "0 auto", padding: "28px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "28px" }}>
          <button onClick={() => { setView("list"); setEditing(null); }} style={{ padding: "8px 14px", borderRadius: "10px", border: `1px solid ${p?.border}`, background: "transparent", color: p?.textPrimary, fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>← Back</button>
          <h1 style={{ margin: 0, fontSize: "22px", fontWeight: 900, color: p?.textPrimary }}>{view === "create" ? "Add New Product" : `Editing: ${editing?.name}`}</h1>
        </div>
        <div style={{ background: p?.secondaryBg, borderRadius: "24px", border: `1px solid ${p?.border}`, padding: "28px" }}>
          <ProductForm
            initial={view === "edit" ? editing : null}
            onSave={view === "create" ? handleCreate : handleUpdate}
            onCancel={() => { setView("list"); setEditing(null); }}
            p={p}
            currency={currency}
            sellerId={sellerId}
            saving={saving}
          />
        </div>
        <style>{`@keyframes pm-spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // ── Product List ─────────────────────────────────────────
  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "28px 20px", display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "14px" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "clamp(20px, 4vw, 26px)", fontWeight: 900, color: p?.textPrimary, letterSpacing: "-0.03em" }}>Product Manager</h1>
          <p style={{ margin: "4px 0 0", fontSize: "13px", color: p?.textPrimary, opacity: 0.5 }}>{products.length} product{products.length !== 1 ? "s" : ""} · {products.filter(x => x.isAvailable).length} live</p>
        </div>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          {storeSlug && (
            <a href={`/store/${storeSlug}`} target="_blank" rel="noopener noreferrer" style={{ padding: "10px 16px", borderRadius: "12px", border: `1px solid ${p?.border}`, background: "transparent", color: p?.textPrimary, fontSize: "13px", fontWeight: 700, textDecoration: "none", display: "flex", alignItems: "center", gap: "6px" }}>
              <EyeIcon /> View Store
            </a>
          )}
          <button onClick={() => setView("create")} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 20px", borderRadius: "12px", background: p?.primary, color: "#fff", fontWeight: 800, border: "none", cursor: "pointer", fontSize: "13px", boxShadow: `0 4px 14px ${p?.primary}40` }}>
            <PlusIcon /> Add Product
          </button>
        </div>
      </div>

      {/* Search + Category filter */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 14px", borderRadius: "12px", border: `1px solid ${p?.border}`, background: p?.secondaryBg, flex: "1 1 220px", maxWidth: "360px" }}>
          <span style={{ color: p?.textPrimary, opacity: 0.4 }}><SearchIcon /></span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products…" style={{ border: "none", outline: "none", background: "none", color: p?.textPrimary, fontSize: "14px", fontFamily: "inherit", flex: 1 }} />
          {search && <button onClick={() => setSearch("")} style={{ background: "none", border: "none", cursor: "pointer", color: p?.textPrimary, opacity: 0.4, padding: 0 }}><XIcon /></button>}
        </div>
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          {["all", ...categories].map(cat => (
            <button key={cat} onClick={() => setFilterCat(cat)} style={{ padding: "7px 14px", borderRadius: "999px", border: filterCat === cat ? "none" : `1px solid ${p?.border}`, background: filterCat === cat ? p?.primary : p?.secondaryBg, color: filterCat === cat ? "#fff" : p?.textPrimary, fontSize: "12px", fontWeight: 600, cursor: "pointer", opacity: filterCat === cat ? 1 : 0.75 }}>
              {cat === "all" ? `All (${products.length})` : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      {filtered.length > 0 ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "20px" }}>
          {filtered.map(prod => (
            <ProductCard key={prod._id} product={prod} currency={currency} p={p} storeSlug={storeSlug}
              onEdit={prod => { setEditing(prod); setView("edit"); }}
              onDelete={handleDelete}
              onToggle={handleToggle}
            />
          ))}
        </div>
      ) : (
        <div style={{ textAlign: "center", padding: "72px 20px", background: p?.secondaryBg, borderRadius: "24px", border: `2px dashed ${p?.border}` }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>📦</div>
          <h3 style={{ fontSize: "20px", fontWeight: 800, color: p?.textPrimary, margin: "0 0 10px" }}>{search || filterCat !== "all" ? "No products match your filter" : "No products yet"}</h3>
          <p style={{ fontSize: "14px", color: p?.textPrimary, opacity: 0.55, margin: "0 0 24px" }}>{search || filterCat !== "all" ? "Try a different search or category." : "Add your first product to start selling on WhatsApp and your storefront."}</p>
          {!search && filterCat === "all" && (
            <button onClick={() => setView("create")} style={{ padding: "12px 28px", borderRadius: "14px", background: p?.primary, color: "#fff", fontWeight: 800, border: "none", cursor: "pointer", fontSize: "14px", boxShadow: `0 8px 20px ${p?.primary}33` }}>
              Add First Product
            </button>
          )}
        </div>
      )}

      <style>{`@keyframes pm-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
