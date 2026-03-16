"use client";

import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import WalletBalance from "../WalletBalance/WalletBalance";
import axios from "axios";
import { useGlobalContext } from "../Context";
import {
  Zap, Phone, Lock, ChevronDown, CheckCircle2,
  AlertCircle, X, ShieldCheck, Gauge, Clock,
  HelpCircle, ChevronRight,
} from "lucide-react";

/* ── Keyframes + font only ───────────────────────────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Syne:wght@600;700;800&display=swap');

  .be-root { font-family: 'Syne', sans-serif; }
  .be-mono { font-family: 'DM Mono', monospace; }

  @keyframes be-slide {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes be-spin  { to { transform: rotate(360deg); } }
  @keyframes be-fade  {
    from { opacity: 0; transform: translateY(4px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes be-modal-in {
    from { opacity: 0; transform: scale(0.95) translateY(10px); }
    to   { opacity: 1; transform: scale(1) translateY(0); }
  }
  @keyframes be-backdrop { from { opacity:0; } to { opacity:1; } }

  .be-s1       { animation: be-slide 0.4s ease both; }
  .be-s2       { animation: be-slide 0.4s ease 0.08s both; }
  .be-fade     { animation: be-fade 0.25s ease both; }
  .be-spin     { animation: be-spin 0.75s linear infinite; }
  .be-modal-in { animation: be-modal-in 0.3s cubic-bezier(0.22,1,0.36,1) both; }
  .be-backdrop { animation: be-backdrop 0.2s ease both; }

  .be-input  { transition: border-color 0.18s ease, box-shadow 0.18s ease; }
  .be-input:focus { outline: none; }
  .be-select { appearance: none; }

  .be-btn { transition: opacity 0.15s ease, transform 0.15s ease; }
  .be-btn:hover:not(:disabled) { opacity: 0.87; transform: translateY(-1px); }
  .be-btn:active:not(:disabled) { transform: translateY(0); }
  .be-btn:disabled { opacity: 0.45; cursor: not-allowed; }

  .be-input[type=number]::-webkit-outer-spin-button,
  .be-input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }
  .be-input[type=number] { -moz-appearance: textfield; }

  .be-faq-chevron { transition: transform 0.2s ease; }
`;

const GREEN = "#22c55e";
const AMBER = "#f59e0b";

/* ── Reusable field label ─────────────────────────────────────── */
function Field({ label, pax26, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-widest mb-2"
        style={{ color: pax26?.textSecondary, opacity: 0.5 }}>
        {label}
      </label>
      {children}
    </div>
  );
}

/* ── Themed select ────────────────────────────────────────────── */
function ThemedSelect({ pax26, isFocused, children, ...props }) {
  return (
    <div className="relative">
      <select {...props}
        className="be-input be-select w-full px-4 py-3 pr-10 rounded-xl text-sm cursor-pointer"
        style={{
          background: pax26?.secondaryBg, color: pax26?.textPrimary,
          border: `1px solid ${isFocused ? pax26?.primary : pax26?.border}`,
          boxShadow: isFocused ? `0 0 0 3px ${pax26?.primary}15` : "none",
        }}>
        {children}
      </select>
      <ChevronDown size={15} className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
        style={{ color: pax26?.textSecondary, opacity: 0.4 }} />
    </div>
  );
}

/* ── Quick amount buttons ─────────────────────────────────────── */
const QUICK_AMOUNTS = [1000, 2000, 5000, 10000];

/* ── Confirm modal ────────────────────────────────────────────── */
function ConfirmModal({ visible, onConfirm, onCancel, loading, formData, customerName, pax26 }) {
  if (!visible) return null;
  const primary = pax26?.primary;

  const rows = [
    { label: "Customer",    value: customerName,       highlight: true  },
    { label: "Provider",    value: formData.disco                        },
    { label: "Meter No.",   value: formData.meterNumber, highlight: false },
    { label: "Meter Type",  value: formData.meterType                    },
    { label: "Amount",      value: `₦${Number(formData.amount).toLocaleString("en-NG")}`, highlight: true },
    { label: "Phone",       value: formData.phone                        },
  ];

  return (
    <div className="be-backdrop fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)" }}>
      <div className="be-modal-in w-full max-w-md rounded-2xl overflow-hidden shadow-2xl"
        style={{ background: pax26?.bg, border: `1px solid ${pax26?.border}` }}>

        <div className="h-1 w-full"
          style={{ background: `linear-gradient(90deg, ${GREEN}, ${GREEN}55, transparent)` }} />

        {/* header */}
        <div className="flex items-center justify-between px-6 py-5"
          style={{ borderBottom: `1px solid ${pax26?.border}` }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(34,197,94,0.12)", color: GREEN }}>
              <ShieldCheck size={17} />
            </div>
            <div>
              <p className="text-sm font-bold" style={{ color: pax26?.textPrimary }}>Confirm Purchase</p>
              <p className="be-mono text-[10px]" style={{ color: pax26?.textSecondary, opacity: 0.45 }}>
                Review details before payment
              </p>
            </div>
          </div>
          <button onClick={onCancel}
            className="be-btn w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: pax26?.secondaryBg, border: `1px solid ${pax26?.border}`, color: pax26?.textSecondary }}>
            <X size={14} />
          </button>
        </div>

        {/* detail rows */}
        <div className="px-6 py-4 space-y-2">
          {rows.map(({ label, value, highlight }) => (
            <div key={label} className="flex items-center justify-between px-4 py-3 rounded-xl"
              style={{
                background: highlight ? "rgba(34,197,94,0.08)" : pax26?.secondaryBg,
                border: `1px solid ${highlight ? "rgba(34,197,94,0.2)" : pax26?.border}`,
              }}>
              <span className="be-mono text-[10px] uppercase tracking-wider"
                style={{ color: pax26?.textSecondary, opacity: 0.5 }}>{label}</span>
              <span className="text-xs font-bold"
                style={{ color: highlight ? GREEN : pax26?.textPrimary }}>
                {value || "—"}
              </span>
            </div>
          ))}
        </div>

        {/* warning */}
        <div className="mx-6 mb-4 flex items-start gap-2.5 p-3.5 rounded-xl"
          style={{ background: "rgba(234,179,8,0.08)", border: "1px solid rgba(234,179,8,0.2)" }}>
          <AlertCircle size={13} style={{ color: "#ca8a04", flexShrink: 0, marginTop: 1 }} />
          <p className="text-xs leading-relaxed" style={{ color: "#ca8a04" }}>
            Confirm the customer name matches your meter. Electricity payments{" "}
            <strong>cannot be reversed</strong> once processed.
          </p>
        </div>

        {/* actions */}
        <div className="flex gap-3 px-6 pb-6">
          <button onClick={onCancel} disabled={loading}
            className="be-btn flex-1 py-3 rounded-xl text-sm font-semibold"
            style={{ background: pax26?.secondaryBg, color: pax26?.textSecondary, border: `1px solid ${pax26?.border}` }}>
            Go Back
          </button>
          <button onClick={onConfirm} disabled={loading}
            className="be-btn flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white"
            style={{ background: GREEN, boxShadow: loading ? "none" : "0 8px 24px rgba(34,197,94,0.35)" }}>
            {loading
              ? <><div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white be-spin" />Processing…</>
              : <><CheckCircle2 size={15} /> Confirm & Pay</>
            }
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Electricity Help panel ───────────────────────────────────── */
const FAQS = [
  { q: "How long does activation take?",         a: "Tokens are delivered to your phone within 5 minutes of a successful payment." },
  { q: "What is the minimum purchase amount?",   a: "Minimum electricity purchase is ₦1,000." },
  { q: "Prepaid vs Postpaid — what's the difference?", a: "Prepaid: you get a token to load on your meter. Postpaid: payment goes toward your monthly bill account." },
  { q: "What if the token doesn't arrive?",      a: "Contact support at info@pax26.com — we resolve failed transactions within 24 hours." },
];

function ElectricityHelpPanel({ formData, customerName, isMeterVerified, pax26 }) {
  const [openFaq, setOpenFaq] = useState(null);
  const primary = pax26?.primary;

  return (
    <div className="space-y-4">

      {/* meter status card */}
      <div className="rounded-2xl p-5 overflow-hidden relative"
        style={{ background: pax26?.bg, border: `1px solid ${pax26?.border}` }}>
        <div className="absolute top-0 left-0 right-0 h-1"
          style={{ background: `linear-gradient(90deg, ${isMeterVerified ? GREEN : pax26?.border}, transparent)` }} />

        <div className="flex items-center gap-3 mt-1 mb-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{
              background: isMeterVerified ? "rgba(34,197,94,0.12)" : `${primary}12`,
              color: isMeterVerified ? GREEN : primary,
            }}>
            <Gauge size={17} />
          </div>
          <div>
            <p className="text-sm font-bold" style={{ color: pax26?.textPrimary }}>
              {isMeterVerified ? "Meter Verified" : "Meter Status"}
            </p>
            <p className="be-mono text-[10px]" style={{ color: pax26?.textSecondary, opacity: 0.45 }}>
              {isMeterVerified ? "Ready to purchase" : "Enter meter number then tap Verify"}
            </p>
          </div>
        </div>

        {/* customer name chip */}
        {customerName && isMeterVerified && (
          <div className="be-fade flex items-center gap-2 px-4 py-3 rounded-xl"
            style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)" }}>
            <CheckCircle2 size={13} style={{ color: GREEN }} />
            <div>
              <p className="be-mono text-[10px] uppercase tracking-wider mb-0.5"
                style={{ color: pax26?.textSecondary, opacity: 0.45 }}>Customer Name</p>
              <p className="text-xs font-bold" style={{ color: GREEN }}>{customerName}</p>
            </div>
          </div>
        )}

        {/* provider + meter type summary */}
        {(formData.disco || formData.meterType) && (
          <div className="be-fade mt-3 grid grid-cols-2 gap-2">
            {formData.disco && (
              <div className="px-3 py-2.5 rounded-xl"
                style={{ background: pax26?.secondaryBg }}>
                <p className="be-mono text-[10px] uppercase tracking-wider mb-0.5"
                  style={{ color: pax26?.textSecondary, opacity: 0.4 }}>Provider</p>
                <p className="text-xs font-semibold" style={{ color: pax26?.textPrimary }}>{formData.disco}</p>
              </div>
            )}
            {formData.meterType && (
              <div className="px-3 py-2.5 rounded-xl"
                style={{ background: pax26?.secondaryBg }}>
                <p className="be-mono text-[10px] uppercase tracking-wider mb-0.5"
                  style={{ color: pax26?.textSecondary, opacity: 0.4 }}>Type</p>
                <p className="text-xs font-semibold" style={{ color: pax26?.textPrimary }}>{formData.meterType}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* quick facts */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl p-4 flex flex-col items-center text-center gap-2"
          style={{ background: pax26?.bg, border: `1px solid ${pax26?.border}` }}>
          <Clock size={18} style={{ color: primary }} />
          <p className="text-xs font-bold" style={{ color: pax26?.textPrimary }}>Within 5 mins</p>
          <p className="text-[10px]" style={{ color: pax26?.textSecondary, opacity: 0.5 }}>Token delivery</p>
        </div>
        <div className="rounded-2xl p-4 flex flex-col items-center text-center gap-2"
          style={{ background: pax26?.bg, border: `1px solid ${pax26?.border}` }}>
          <ShieldCheck size={18} style={{ color: GREEN }} />
          <p className="text-xs font-bold" style={{ color: pax26?.textPrimary }}>Secure</p>
          <p className="text-[10px]" style={{ color: pax26?.textSecondary, opacity: 0.5 }}>PIN protected</p>
        </div>
      </div>

      {/* FAQs */}
      <div className="rounded-2xl p-5" style={{ background: pax26?.bg, border: `1px solid ${pax26?.border}` }}>
        <div className="flex items-center gap-2 mb-4">
          <HelpCircle size={14} style={{ color: primary }} />
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: pax26?.textPrimary }}>
            FAQs
          </p>
        </div>
        <div className="space-y-2">
          {FAQS.map((f, i) => (
            <div key={i} className="rounded-xl overflow-hidden"
              style={{ border: `1px solid ${pax26?.border}` }}>
              <button
                className="w-full flex items-center justify-between px-4 py-3 text-left gap-3"
                style={{ background: pax26?.secondaryBg }}
                onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                <span className="text-xs font-semibold" style={{ color: pax26?.textPrimary }}>{f.q}</span>
                <ChevronRight size={13}
                  className="be-faq-chevron flex-shrink-0"
                  style={{
                    color: pax26?.textSecondary, opacity: 0.5,
                    transform: openFaq === i ? "rotate(90deg)" : "rotate(0deg)",
                  }} />
              </button>
              {openFaq === i && (
                <div className="px-4 py-3 be-fade" style={{ background: pax26?.bg }}>
                  <p className="text-xs leading-relaxed" style={{ color: pax26?.textSecondary, opacity: 0.7 }}>{f.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* support */}
      <div className="flex items-start gap-3 p-4 rounded-2xl"
        style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.18)" }}>
        <ShieldCheck size={14} style={{ color: GREEN, flexShrink: 0, marginTop: 1 }} />
        <p className="text-xs leading-relaxed" style={{ color: pax26?.textSecondary, opacity: 0.7 }}>
          Issues with your token?{" "}
          <a href="mailto:info@pax26.com" className="font-bold underline" style={{ color: GREEN }}>
            info@pax26.com
          </a>{" "}
          — resolved within 24 hours.
        </p>
      </div>
    </div>
  );
}

/* ── Main component ───────────────────────────────────────────── */
const BuyElectricity = () => {
  const { getUserRealTimeData, pax26, userData, router, setPinModal } = useGlobalContext();

  const [electricityCompany, setElectricityCompany] = useState({});
  const [loading, setLoading]                       = useState(false);
  const [customerName, setCustomerName]             = useState("");
  const [isMeterVerified, setIsMeterVerified]       = useState(false);
  const [verifyingMeter, setVerifyingMeter]         = useState(false);
  const [showConfirm, setShowConfirm]               = useState(false);
  const [focused, setFocused]                       = useState("");

  const primary = pax26?.primary;

  const [formData, setFormData] = useState({
    disco: "", 
    meterNumber: "", 
    meterType: "", 
    amount: "", 
    phone: "", 
    pin: "", 
    customerName: "",
    customerAddress: ""
  });

  /* fetch discos */
  useEffect(() => {
    (async () => {
      try {
        const res  = await fetch("https://www.nellobytesystems.com/APIElectricityDiscosV1.asp");
        const data = await res.json();
        if (data?.ELECTRIC_COMPANY) setElectricityCompany(data.ELECTRIC_COMPANY);
      } catch (err) { console.error(err); }
    })();
  }, []);

  /* pin guard */
  useEffect(() => {
    const iv = setInterval(() => { if (userData.pin === null) setPinModal(true); }, 2000);
    return () => clearInterval(iv);
  }, [userData]);

  /* manual meter verification — triggered by user button */
  const verifyMeter = async () => {
    const { disco, meterNumber } = formData;
    if (!disco)                  return toast.error("Select a provider first.");
    if (meterNumber.length < 7)  return toast.error("Enter a valid meter number.");
    setVerifyingMeter(true);
    setCustomerName(""); setIsMeterVerified(false);
    try {
      const res = await axios.post("/api/verify-meter-number", { meterNumber, disco });
      if (res.data.success) {
        const {customer_name, customer_address} = res.data.data;
        setCustomerName(customer_name);
        setFormData(p => ({ ...p, customerName: customer_name, customerAddress: customer_address }));
        setIsMeterVerified(true);
        toast.success("Meter verified!");
      } else {
        setCustomerName("Meter not found"); setIsMeterVerified(false);
        toast.error("Meter not found. Check the number and provider.");
      }
    } catch {
      setCustomerName("Invalid provider or meter number"); setIsMeterVerified(false);
      toast.error("Verification failed. Try again.");
    } finally { setVerifyingMeter(false); }
  };

  const handleChange = e => {
    const { name, value } = e.target;
    if (name === "meterNumber" || name === "disco") {
      setCustomerName(""); setIsMeterVerified(false);
    }
    setFormData(p => ({ ...p, [name]: value }));
  };

  /* Step 1 — validate → open modal */
  const handleReview = e => {
    e.preventDefault();
    const { disco, meterNumber, meterType, amount, phone, pin } = formData;
    if (!disco || !meterNumber || !meterType || !amount || !phone || !pin)
      return toast.error("All fields are required.");
    if (Number(amount) < 1000) return toast.error("Minimum amount is ₦1,000.");
    if (pin.length < 4)         return toast.error("PIN must be 4 digits.");
    if (!isMeterVerified)       return toast.error("Meter not verified. Wait for verification.");
    setShowConfirm(true);
  };

  /* Step 2 — confirmed → API */
  const handleConfirmedSubmit = async () => {
    setLoading(true);
    try {
      const res = await axios.post("/api/provider/electricity-provider", formData);
      if (res.data.success) {
        getUserRealTimeData();
        toast.success(res.data.message);
        const transactionId = res.data.data._id;
        router.push(`/transaction-receipt/?id=${transactionId}`);
      } else {
        toast.error(res.data.message || "Purchase failed.");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong.");
    } finally { setLoading(false); }
  };

  const inputStyle = field => ({
    background: pax26?.secondaryBg,
    color: pax26?.textPrimary,
    border: `1px solid ${focused === field ? primary : pax26?.border}`,
    boxShadow: focused === field ? `0 0 0 3px ${primary}15` : "none",
  });

  return (
    <>
      <style>{CSS}</style>

      <ConfirmModal
        visible={showConfirm}
        onConfirm={handleConfirmedSubmit}
        onCancel={() => setShowConfirm(false)}
        loading={loading}
        formData={formData}
        customerName={customerName}
        pax26={pax26}
      />

      <div className="be-root min-h-screen px-5 py-10">
        <div className="max-w-5xl mx-auto">

          {/* ── Page header ─────────────────────────────── */}
          <div className="be-s1 mb-8">
            <div className="flex items-center gap-2 mb-3">
              <span className="be-mono text-[10px] font-medium uppercase tracking-widest"
                style={{ color: pax26?.textSecondary, opacity: 0.4 }}>Services</span>
              <div className="h-px w-8" style={{ background: pax26?.border }} />
            </div>
            <h1 className="text-3xl font-extrabold leading-tight" style={{ color: pax26?.textPrimary }}>
              Buy Electricity
            </h1>
            <p className="text-sm mt-1" style={{ color: pax26?.textSecondary, opacity: 0.55 }}>
              Pay your electricity bill or buy prepaid tokens — instantly from your wallet.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">

            {/* ── LEFT col ──────────────────────────────── */}
            <div className="flex flex-col gap-5">
              <div className="be-s1"><WalletBalance /></div>

              {/* form card */}
              <div className="be-s2 rounded-2xl overflow-hidden"
                style={{ background: pax26?.bg, border: `1px solid ${pax26?.border}` }}>

                <div className="h-1 w-full"
                  style={{ background: `linear-gradient(90deg, ${primary}, ${primary}55, transparent)` }} />

                {/* card header */}
                <div className="flex items-center gap-3 px-6 py-5"
                  style={{ borderBottom: `1px solid ${pax26?.border}` }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: `${primary}15`, color: primary }}>
                    <Zap size={17} />
                  </div>
                  <div>
                    <p className="text-sm font-bold" style={{ color: pax26?.textPrimary }}>Electricity Payment</p>
                    <p className="be-mono text-[10px]" style={{ color: pax26?.textSecondary, opacity: 0.45 }}>
                      Fill → Verify meter → Confirm
                    </p>
                  </div>
                </div>

                <form onSubmit={handleReview} className="p-6 space-y-5">

                  {/* Provider */}
                  <Field label="Electricity Provider" pax26={pax26}>
                    <ThemedSelect name="disco" value={formData.disco} onChange={handleChange}
                      required pax26={pax26} isFocused={focused === "disco"}
                      onFocus={() => setFocused("disco")} onBlur={() => setFocused("")}>
                      <option value="" disabled>Select provider</option>
                      {Object.keys(electricityCompany).map((merchant, i) => (
                        <option key={i} value={merchant}>{merchant}</option>
                      ))}
                    </ThemedSelect>
                  </Field>

                  {/* Meter type pills */}
                  <Field label="Meter Type" pax26={pax26}>
                    <div className="grid grid-cols-2 gap-3">
                      {["Prepaid", "Postpaid"].map(type => (
                        <button type="button" key={type}
                          onClick={() => setFormData(p => ({ ...p, meterType: type }))}
                          className="be-btn py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2"
                          style={{
                            background: formData.meterType === type ? `${primary}18` : pax26?.secondaryBg,
                            color: formData.meterType === type ? primary : pax26?.textSecondary,
                            border: `1px solid ${formData.meterType === type ? primary + "40" : pax26?.border}`,
                          }}>
                          <Gauge size={14} />
                          {type}
                        </button>
                      ))}
                    </div>
                  </Field>

                  {/* Meter number + manual verify */}
                  <Field label="Meter Number" pax26={pax26}>
                    <div className="flex gap-2">
                      <input type="text" name="meterNumber" value={formData.meterNumber}
                        onChange={handleChange} required maxLength={11}
                        placeholder="e.g. 12345678901"
                        className="be-input flex-1 px-4 py-3 rounded-xl text-sm"
                        style={inputStyle("meterNumber")}
                        onFocus={() => setFocused("meterNumber")} onBlur={() => setFocused("")}
                      />
                      {/* verify button */}
                      <button
                        type="button"
                        onClick={verifyMeter}
                        disabled={verifyingMeter || !formData.meterNumber || !formData.disco}
                        className="be-btn flex-shrink-0 flex items-center gap-1.5 px-4 rounded-xl text-xs font-bold"
                        style={{
                          background: isMeterVerified ? "rgba(34,197,94,0.12)" : `${primary}15`,
                          color: isMeterVerified ? GREEN : primary,
                          border: `1px solid ${isMeterVerified ? "rgba(34,197,94,0.3)" : primary + "30"}`,
                          minWidth: "76px",
                        }}>
                        {verifyingMeter
                          ? <div className="w-3.5 h-3.5 rounded-full border-2 border-t-transparent be-spin"
                              style={{ borderColor: `${primary}40`, borderTopColor: primary }} />
                          : isMeterVerified
                            ? <><CheckCircle2 size={12} /> Done</>
                            : "Verify"
                        }
                      </button>
                    </div>

                    {/* result chip */}
                    {customerName && (
                      <div className="be-fade flex items-center gap-1.5 mt-2 px-3 py-2 rounded-xl text-xs font-semibold"
                        style={{
                          background: isMeterVerified ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.08)",
                          border: `1px solid ${isMeterVerified ? "rgba(34,197,94,0.25)" : "rgba(239,68,68,0.25)"}`,
                          color: isMeterVerified ? GREEN : "#ef4444",
                        }}>
                        {isMeterVerified ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                        {isMeterVerified ? `Customer: ${customerName}` : customerName}
                      </div>
                    )}
                  </Field>

                  {/* Amount */}
                  <Field label="Amount (₦)" pax26={pax26}>
                    <div className="relative">
                      <span className="be-mono absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold pointer-events-none"
                        style={{ color: formData.amount && Number(formData.amount) >= 1000 ? primary : pax26?.textSecondary, opacity: formData.amount ? 1 : 0.3 }}>
                        ₦
                      </span>
                      <input type="number" name="amount" value={formData.amount}
                        onChange={handleChange} required min="1000" placeholder="0"
                        className="be-input w-full pl-8 pr-4 py-3 rounded-xl text-sm be-mono font-bold"
                        style={inputStyle("amount")}
                        onFocus={() => setFocused("amount")} onBlur={() => setFocused("")}
                      />
                    </div>
                    {formData.amount && Number(formData.amount) < 1000 && (
                      <p className="be-mono text-[11px] mt-1.5" style={{ color: "#ef4444" }}>
                        Minimum amount is ₦1,000
                      </p>
                    )}
                    {/* quick amounts */}
                    <div className="grid grid-cols-4 gap-2 mt-2">
                      {QUICK_AMOUNTS.map(v => (
                        <button type="button" key={v}
                          onClick={() => setFormData(p => ({ ...p, amount: String(v) }))}
                          className="be-btn py-2 rounded-xl text-xs font-bold"
                          style={{
                            background: Number(formData.amount) === v ? `${primary}18` : pax26?.secondaryBg,
                            color: Number(formData.amount) === v ? primary : pax26?.textSecondary,
                            border: `1px solid ${Number(formData.amount) === v ? primary + "40" : pax26?.border}`,
                          }}>
                          ₦{v >= 1000 ? `${v / 1000}k` : v}
                        </button>
                      ))}
                    </div>
                  </Field>

                  {/* Phone */}
                  <Field label="Phone Number" pax26={pax26}>
                    <div className="relative">
                      <Phone size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                        style={{ color: pax26?.textSecondary, opacity: 0.35 }} />
                      <input type="tel" name="phone" value={formData.phone}
                        onChange={handleChange} required placeholder="08012345678"
                        className="be-input w-full pl-9 pr-4 py-3 rounded-xl text-sm"
                        style={inputStyle("phone")}
                        onFocus={() => setFocused("phone")} onBlur={() => setFocused("")}
                      />
                    </div>
                  </Field>

                  {/* PIN */}
                  <Field label="Transaction PIN" pax26={pax26}>
                    <div className="relative">
                      <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                        style={{ color: pax26?.textSecondary, opacity: 0.35 }} />
                      <input type="password" name="pin" value={formData.pin}
                        onChange={handleChange} required maxLength={4} placeholder="4-digit PIN"
                        className="be-input w-full pl-9 pr-4 py-3 rounded-xl text-sm tracking-widest"
                        style={inputStyle("pin")}
                        onFocus={() => setFocused("pin")} onBlur={() => setFocused("")}
                      />
                    </div>
                  </Field>

                  <div className="h-px" style={{ background: pax26?.border }} />

                  <button type="submit"
                    disabled={verifyingMeter || !isMeterVerified}
                    className="be-btn w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl text-sm font-bold text-white"
                    style={{
                      background: isMeterVerified ? primary : `${primary}55`,
                      boxShadow: isMeterVerified ? `0 10px 28px ${primary}38` : "none",
                    }}>
                    {verifyingMeter
                      ? <><div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white be-spin" />Verifying Meter…</>
                      : <><Zap size={15} />{isMeterVerified ? "Review & Confirm" : "Verify meter to continue"}</>
                    }
                  </button>
                </form>
              </div>
            </div>

            {/* ── RIGHT col ─────────────────────────────── */}
            <div className="be-s2">
              <ElectricityHelpPanel
                formData={formData}
                customerName={customerName}
                isMeterVerified={isMeterVerified}
                pax26={pax26}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BuyElectricity;