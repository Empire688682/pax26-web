"use client";

import React, { useEffect, useState } from "react";
import WalletBalance from "../WalletBalance/WalletBalance";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import TvHelp from "./TvHelp";
import axios from "axios";
import { useGlobalContext } from "../Context";
import {
  Tv, CheckCircle2, AlertCircle, ChevronDown,
  Lock, Phone, CreditCard, X, User, ShieldCheck,
} from "lucide-react";

/* ── Keyframes + font only ───────────────────────────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Syne:wght@600;700;800&display=swap');

  .bt-root { font-family: 'Syne', sans-serif; }
  .bt-mono { font-family: 'DM Mono', monospace; }

  @keyframes bt-slide {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes bt-spin  { to { transform: rotate(360deg); } }
  @keyframes bt-fade  {
    from { opacity: 0; transform: translateY(4px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes bt-modal-in {
    from { opacity: 0; transform: scale(0.95) translateY(10px); }
    to   { opacity: 1; transform: scale(1) translateY(0); }
  }
  @keyframes bt-backdrop-in {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  .bt-s1        { animation: bt-slide 0.4s ease both; }
  .bt-s2        { animation: bt-slide 0.4s ease 0.08s both; }
  .bt-fade      { animation: bt-fade 0.25s ease both; }
  .bt-spin      { animation: bt-spin 0.75s linear infinite; }
  .bt-modal-in  { animation: bt-modal-in 0.3s cubic-bezier(0.22,1,0.36,1) both; }
  .bt-backdrop  { animation: bt-backdrop-in 0.2s ease both; }

  .bt-input  { transition: border-color 0.18s ease, box-shadow 0.18s ease; }
  .bt-input:focus { outline: none; }
  .bt-select { appearance: none; }

  .bt-btn { transition: opacity 0.15s ease, transform 0.15s ease; }
  .bt-btn:hover:not(:disabled) { opacity: 0.87; transform: translateY(-1px); }
  .bt-btn:active:not(:disabled) { transform: translateY(0); }
  .bt-btn:disabled { opacity: 0.45; cursor: not-allowed; }

  .bt-amount-in { animation: bt-fade 0.3s ease both; }

  .bt-input[type=number]::-webkit-outer-spin-button,
  .bt-input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }
  .bt-input[type=number] { -moz-appearance: textfield; }
`;

/* ── Helpers ──────────────────────────────────────────────────── */
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

function ThemedInput({ pax26, isFocused, ...props }) {
  return (
    <input {...props}
      className="bt-input w-full px-4 py-3 rounded-xl text-sm"
      style={{
        background: pax26?.secondaryBg, color: pax26?.textPrimary,
        border: `1px solid ${isFocused ? pax26?.primary : pax26?.border}`,
        boxShadow: isFocused ? `0 0 0 3px ${pax26?.primary}15` : "none",
      }}
    />
  );
}

function ThemedSelect({ pax26, isFocused, children, ...props }) {
  return (
    <div className="relative">
      <select {...props}
        className="bt-input bt-select w-full px-4 py-3 pr-10 rounded-xl text-sm cursor-pointer"
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

/* ── Confirmation Modal ───────────────────────────────────────── */
function ConfirmModal({ visible, onConfirm, onCancel, loading, data, pax26 }) {
  if (!visible) return null;

  const primary = pax26?.primary;
  const GREEN   = "#22c55e";

  const rows = [
    { label: "Subscriber",   value: data.customerName, icon: <User size={13} />,        highlight: true },
    { label: "Provider",     value: data.provider,     icon: <Tv size={13} /> },
    { label: "Smartcard",    value: data.smartcard,    icon: <CreditCard size={13} /> },
    { label: "Package",      value: data.packageName,  icon: <Tv size={13} /> },
    { label: "Amount",       value: `₦${Number(data.amount || 0).toLocaleString("en-NG")}`, icon: <CreditCard size={13} />, highlight: true },
    { label: "Phone",        value: data.phone,        icon: <Phone size={13} /> },
  ];

  return (
    <div className="bt-backdrop fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}>

      <div className="bt-modal-in w-full max-w-md rounded-2xl overflow-hidden shadow-2xl"
        style={{ background: pax26?.bg, border: `1px solid ${pax26?.border}` }}>

        {/* top strip */}
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
              <p className="text-sm font-bold" style={{ color: pax26?.textPrimary }}>
                Confirm Subscription
              </p>
              <p className="bt-mono text-[10px]" style={{ color: pax26?.textSecondary, opacity: 0.45 }}>
                Review details before payment
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="w-8 h-8 rounded-xl flex items-center justify-center bt-btn"
            style={{ background: pax26?.secondaryBg, border: `1px solid ${pax26?.border}`, color: pax26?.textSecondary }}>
            <X size={14} />
          </button>
        </div>

        {/* detail rows */}
        <div className="px-6 py-4 space-y-2">
          {rows.map(({ label, value, icon, highlight }) => (
            <div key={label} className="flex items-center justify-between gap-4 px-4 py-3 rounded-xl"
              style={{ background: highlight ? `${GREEN}08` : pax26?.secondaryBg,
                       border: `1px solid ${highlight ? "rgba(34,197,94,0.2)" : pax26?.border}` }}>
              <div className="flex items-center gap-2">
                <span style={{ color: highlight ? GREEN : pax26?.textSecondary, opacity: highlight ? 1 : 0.45 }}>
                  {icon}
                </span>
                <span className="bt-mono text-[10px] uppercase tracking-wider"
                  style={{ color: pax26?.textSecondary, opacity: 0.5 }}>
                  {label}
                </span>
              </div>
              <span className={`text-xs font-bold text-right`}
                style={{ color: highlight ? GREEN : pax26?.textPrimary }}>
                {value || "—"}
              </span>
            </div>
          ))}
        </div>

        {/* warning note */}
        <div className="mx-6 mb-4 flex items-start gap-2.5 p-3.5 rounded-xl"
          style={{ background: "rgba(234,179,8,0.08)", border: "1px solid rgba(234,179,8,0.2)" }}>
          <AlertCircle size={13} style={{ color: "#ca8a04", flexShrink: 0, marginTop: 1 }} />
          <p className="text-xs leading-relaxed" style={{ color: "#ca8a04" }}>
            Please confirm the subscriber name matches the account owner.
            Payments to wrong smartcard numbers <strong>cannot be reversed</strong>.
          </p>
        </div>

        {/* action buttons */}
        <div className="flex gap-3 px-6 pb-6">
          <button
            onClick={onCancel}
            disabled={loading}
            className="bt-btn flex-1 py-3 rounded-xl text-sm font-semibold"
            style={{ background: pax26?.secondaryBg, color: pax26?.textSecondary, border: `1px solid ${pax26?.border}` }}>
            Go Back
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="bt-btn flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white"
            style={{ background: GREEN, boxShadow: loading ? "none" : "0 8px 24px rgba(34,197,94,0.35)" }}>
            {loading
              ? <><div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white bt-spin" /> Processing…</>
              : <><CheckCircle2 size={15} /> Confirm & Pay</>
            }
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Main component ───────────────────────────────────────────── */
const BuyTv = () => {
  const { getUserRealTimeData, pax26, userData } = useGlobalContext();

  const initialForm = { provider: "", smartcardNumber: "", tvPackage: "", phone: "", pin: "" };

  const [form, setForm]                     = useState(initialForm);
  const [packagesData, setPackagesData]     = useState({});
  const [packageAmount, setPackageAmount]   = useState(null);
  const [packageName, setPackageName]       = useState("");
  const [availablePackages, setAvailablePackages] = useState([]);
  const [customerName, setCustomerName]     = useState("");
  const [verifyStatus, setVerifyStatus]     = useState("idle"); // idle | loading | success | error
  const [loading, setLoading]               = useState(false);
  const [showConfirm, setShowConfirm]       = useState(false);
  const [focused, setFocused]               = useState("");

  const primary = pax26?.primary;
  const GREEN   = "#22c55e";

  /* fetch all packages on mount */
  useEffect(() => {
    (async () => {
      try {
        const res  = await fetch("https://www.nellobytesystems.com/APICableTVPackagesV2.asp");
        const data = await res.json();
        if (data?.TV_ID) setPackagesData(data.TV_ID);
      } catch (err) { console.error("Failed to fetch packages:", err); }
    })();
  }, []);

  /* reset on provider change */
  useEffect(() => {
    if (!form.provider) return;
    const providerData = packagesData[form.provider];
    setAvailablePackages(providerData?.[0]?.PRODUCT || []);
    setForm(p => ({ ...p, smartcardNumber: "", tvPackage: "" }));
    setCustomerName(""); setVerifyStatus("idle"); setPackageAmount(null); setPackageName("");
  }, [form.provider]);

  /* update amount when package changes */
  useEffect(() => {
    if (!availablePackages.length || !form.tvPackage) return;
    const pkg = availablePackages.find(p => p.PACKAGE_ID === form.tvPackage);
    if (pkg) { setPackageAmount(pkg.PACKAGE_AMOUNT); setPackageName(pkg.PACKAGE_NAME); }
  }, [form.tvPackage, availablePackages]);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
    /* reset verify state if smartcard changes */
    if (name === "smartcardNumber") { setCustomerName(""); setVerifyStatus("idle"); }
  };

  /* Step 1 — verify smartcard */
  const verifySmartcard = async () => {
    const { smartcardNumber, provider } = form;
    if (!smartcardNumber || !provider) { toast.error("Select a provider and enter smartcard number."); return; }
    setVerifyStatus("loading");
    try {
      const res = await axios.post("/api/verify-uic-tv-number", { smartcardNumber, provider });
      if (res.data.success) {
        setCustomerName(res.data.data);
        setVerifyStatus("success");
        toast.success("Smartcard verified!");
      } else {
        setCustomerName("Verification failed.");
        setVerifyStatus("error");
        toast.error("Smartcard not found.");
      }
    } catch {
      setCustomerName("Verification error occurred.");
      setVerifyStatus("error");
      toast.error("Verification error.");
    }
  };

  /* Step 2 — open confirm modal */
  const handleReview = e => {
    e.preventDefault();
    const { provider, smartcardNumber, tvPackage, phone, pin } = form;
    if (!provider || !smartcardNumber || !phone || !tvPackage || !pin) {
      toast.error("Please fill all fields."); return;
    }
    if (verifyStatus !== "success") {
      toast.error("Please verify your smartcard number first."); return;
    }
    setShowConfirm(true);
  };

  /* Step 3 — final submit after confirm */
  const handleConfirmedSubmit = async () => {
    const { provider, smartcardNumber, tvPackage, phone, pin } = form;
    try {
      setLoading(true);
      const res = await axios.post("/api/provider/tv-subscribe-provider", {
        provider, customerName, smartcardNumber, amount: packageAmount, tvPackage, phone, pin,
      });
      if (res.data.success) {
        getUserRealTimeData();
        toast.success("TV subscription successful!");
        setForm(initialForm); setCustomerName(""); setAvailablePackages([]);
        setPackageAmount(null); setPackageName(""); setVerifyStatus("idle");
        setShowConfirm(false);
      } else {
        toast.error(res.data.message || "Subscription failed.");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const isVerifying = verifyStatus === "loading";

  return (
    <>
      <style>{CSS}</style>

      {/* ── Confirm modal ─────────────────────────────── */}
      <ConfirmModal
        visible={showConfirm}
        onConfirm={handleConfirmedSubmit}
        onCancel={() => setShowConfirm(false)}
        loading={loading}
        pax26={pax26}
        data={{
          customerName,
          provider: form.provider,
          smartcard: form.smartcardNumber,
          packageName,
          amount: packageAmount,
          phone: form.phone,
        }}
      />

      <div className="bt-root min-h-screen px-5 py-10">
        <div className="max-w-5xl mx-auto">

          {/* ── Page header ─────────────────────────────── */}
          <div className="bt-s1 mb-8">
            <div className="flex items-center gap-2 mb-3">
              <span className="bt-mono text-[10px] font-medium uppercase tracking-widest"
                style={{ color: pax26?.textSecondary, opacity: 0.4 }}>Services</span>
              <div className="h-px w-8" style={{ background: pax26?.border }} />
            </div>
            <h1 className="text-3xl font-extrabold leading-tight" style={{ color: pax26?.textPrimary }}>
              TV Subscription
            </h1>
            <p className="text-sm mt-1" style={{ color: pax26?.textSecondary, opacity: 0.55 }}>
              Renew DSTV, GOtv, Startimes and more — instantly from your wallet.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">

            {/* ── LEFT col ──────────────────────────────── */}
            <div className="flex flex-col gap-5">
              <div className="bt-s1"><WalletBalance /></div>

              {/* form card */}
              <div className="bt-s2 rounded-2xl overflow-hidden"
                style={{ background: pax26?.bg, border: `1px solid ${pax26?.border}` }}>

                <div className="h-1 w-full"
                  style={{ background: `linear-gradient(90deg, ${primary}, ${primary}55, transparent)` }} />

                {/* card header */}
                <div className="flex items-center gap-3 px-6 py-5"
                  style={{ borderBottom: `1px solid ${pax26?.border}` }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: `${primary}15`, color: primary }}>
                    <Tv size={17} />
                  </div>
                  <div>
                    <p className="text-sm font-bold" style={{ color: pax26?.textPrimary }}>Buy TV Package</p>
                    <p className="bt-mono text-[10px]" style={{ color: pax26?.textSecondary, opacity: 0.45 }}>
                      3-step: fill → verify → confirm
                    </p>
                  </div>
                </div>

                <form onSubmit={handleReview} className="p-6 space-y-5">

                  {/* Provider */}
                  <Field label="TV Provider" pax26={pax26}>
                    <ThemedSelect name="provider" value={form.provider} onChange={handleChange}
                      required pax26={pax26} isFocused={focused === "provider"}
                      onFocus={() => setFocused("provider")} onBlur={() => setFocused("")}>
                      <option value="">Select provider</option>
                      {Object.keys(packagesData).map((p, i) => (
                        <option key={i} value={p}>{p}</option>
                      ))}
                    </ThemedSelect>
                  </Field>

                  {/* Smartcard + verify inline */}
                  <Field label="Smartcard / IUC Number" pax26={pax26}>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <ThemedInput
                          type="tel" name="smartcardNumber" maxLength={12}
                          placeholder="Enter smartcard number"
                          value={form.smartcardNumber} onChange={handleChange}
                          required disabled={!form.provider}
                          pax26={pax26} isFocused={focused === "smartcardNumber"}
                          onFocus={() => setFocused("smartcardNumber")} onBlur={() => setFocused("")}
                        />
                      </div>
                      {/* verify button */}
                      <button
                        type="button"
                        onClick={verifySmartcard}
                        disabled={isVerifying || !form.smartcardNumber || !form.provider}
                        className="bt-btn flex-shrink-0 flex items-center gap-1.5 px-4 rounded-xl text-xs font-bold"
                        style={{
                          background: verifyStatus === "success" ? "rgba(34,197,94,0.12)" : `${primary}15`,
                          color: verifyStatus === "success" ? GREEN : primary,
                          border: `1px solid ${verifyStatus === "success" ? "rgba(34,197,94,0.3)" : primary + "30"}`,
                          minWidth: "80px",
                        }}>
                        {isVerifying
                          ? <div className="w-3.5 h-3.5 rounded-full border-2 border-t-transparent bt-spin"
                              style={{ borderColor: `${primary}40`, borderTopColor: primary }} />
                          : verifyStatus === "success"
                            ? <><CheckCircle2 size={12} /> Done</>
                            : "Verify"
                        }
                      </button>
                    </div>

                    {/* customer name result */}
                    {customerName && (
                      <div className={`bt-fade flex items-center gap-1.5 mt-2 px-3 py-2 rounded-xl text-xs font-semibold`}
                        style={{
                          background: verifyStatus === "success" ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.08)",
                          border: `1px solid ${verifyStatus === "success" ? "rgba(34,197,94,0.25)" : "rgba(239,68,68,0.25)"}`,
                          color: verifyStatus === "success" ? GREEN : "#ef4444",
                        }}>
                        {verifyStatus === "success"
                          ? <CheckCircle2 size={12} />
                          : <AlertCircle size={12} />
                        }
                        <span>{verifyStatus === "success" ? "Subscriber: " : ""}</span>
                        <span className="font-bold">{customerName}</span>
                      </div>
                    )}
                  </Field>

                  {/* Package */}
                  <Field label="TV Package" pax26={pax26}>
                    <ThemedSelect name="tvPackage" value={form.tvPackage} onChange={handleChange}
                      required disabled={!availablePackages.length}
                      pax26={pax26} isFocused={focused === "tvPackage"}
                      onFocus={() => setFocused("tvPackage")} onBlur={() => setFocused("")}>
                      <option value="" disabled>Select package</option>
                      {availablePackages.map((pkg, i) => (
                        <option key={i} value={pkg.PACKAGE_ID}>{pkg.PACKAGE_NAME}</option>
                      ))}
                    </ThemedSelect>
                  </Field>

                  {/* Amount auto-filled */}
                  {packageAmount && (
                    <div className="bt-amount-in">
                      <Field label="Amount" pax26={pax26}>
                        <div className="flex items-center gap-2 px-4 py-3 rounded-xl"
                          style={{ background: `${primary}0C`, border: `1px solid ${primary}30` }}>
                          <span className="bt-mono text-sm font-bold" style={{ color: primary }}>
                            ₦{Number(packageAmount).toLocaleString("en-NG")}
                          </span>
                          <span className="bt-mono text-[10px] ml-auto"
                            style={{ color: pax26?.textSecondary, opacity: 0.45 }}>
                            Auto-calculated
                          </span>
                        </div>
                      </Field>
                    </div>
                  )}

                  {/* Phone */}
                  <Field label="Phone Number" pax26={pax26}>
                    <div className="relative">
                      <Phone size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                        style={{ color: pax26?.textSecondary, opacity: 0.35 }} />
                      <input type="tel" name="phone" value={form.phone}
                        onChange={handleChange} required placeholder="08012345678"
                        className="bt-input w-full pl-9 pr-4 py-3 rounded-xl text-sm"
                        style={{
                          background: pax26?.secondaryBg, color: pax26?.textPrimary,
                          border: `1px solid ${focused === "phone" ? primary : pax26?.border}`,
                          boxShadow: focused === "phone" ? `0 0 0 3px ${primary}15` : "none",
                        }}
                        onFocus={() => setFocused("phone")} onBlur={() => setFocused("")}
                      />
                    </div>
                  </Field>

                  {/* PIN */}
                  <Field label="Transaction PIN" pax26={pax26}>
                    <div className="relative">
                      <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                        style={{ color: pax26?.textSecondary, opacity: 0.35 }} />
                      <input type="password" name="pin" value={form.pin}
                        onChange={handleChange} required maxLength={4} placeholder="4-digit PIN"
                        className="bt-input w-full pl-9 pr-4 py-3 rounded-xl text-sm tracking-widest"
                        style={{
                          background: pax26?.secondaryBg, color: pax26?.textPrimary,
                          border: `1px solid ${focused === "pin" ? primary : pax26?.border}`,
                          boxShadow: focused === "pin" ? `0 0 0 3px ${primary}15` : "none",
                        }}
                        onFocus={() => setFocused("pin")} onBlur={() => setFocused("")}
                      />
                    </div>
                  </Field>

                  <div className="h-px" style={{ background: pax26?.border }} />

                  {/* Review button → opens confirm modal */}
                  <button
                    type="submit"
                    disabled={verifyStatus !== "success"}
                    className="bt-btn w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl text-sm font-bold text-white"
                    style={{
                      background: verifyStatus === "success" ? primary : `${primary}55`,
                      boxShadow: verifyStatus === "success" ? `0 10px 28px ${primary}38` : "none",
                    }}>
                    <CreditCard size={15} />
                    {verifyStatus === "success" ? "Review & Confirm" : "Verify smartcard to continue"}
                  </button>

                </form>
              </div>
            </div>

            {/* ── RIGHT col ─────────────────────────────── */}
            <div className="bt-s2">
              <TvHelp data={form} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BuyTv;