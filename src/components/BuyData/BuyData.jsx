"use client";

import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import WalletBalance from "../WalletBalance/WalletBalance";
import { useGlobalContext } from "../Context";
import axios from "axios";
import { applyMarkup } from "../utils/helper";
import CashBackOption from "../ui/CashBackOption";
import { phoneCarrierDetector } from "../utils/phoneCarrierDetector";
import {
  Phone, Lock, Wifi, ChevronDown, CheckCircle2,
  AlertCircle, X, ShieldCheck, Database, Radio, Zap,
} from "lucide-react";

/* ── Keyframes + font only ───────────────────────────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Syne:wght@600;700;800&display=swap');

  .bd-root { font-family: 'Syne', sans-serif; }
  .bd-mono { font-family: 'DM Mono', monospace; }

  @keyframes bd-slide {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes bd-spin  { to { transform: rotate(360deg); } }
  @keyframes bd-fade  {
    from { opacity: 0; transform: translateY(4px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes bd-modal-in {
    from { opacity: 0; transform: scale(0.95) translateY(10px); }
    to   { opacity: 1; transform: scale(1) translateY(0); }
  }
  @keyframes bd-backdrop { from { opacity:0; } to { opacity:1; } }

  .bd-s1       { animation: bd-slide 0.4s ease both; }
  .bd-s2       { animation: bd-slide 0.4s ease 0.08s both; }
  .bd-fade     { animation: bd-fade 0.25s ease both; }
  .bd-spin     { animation: bd-spin 0.75s linear infinite; }
  .bd-modal-in { animation: bd-modal-in 0.3s cubic-bezier(0.22,1,0.36,1) both; }
  .bd-backdrop { animation: bd-backdrop 0.2s ease both; }

  .bd-input { transition: border-color 0.18s ease, box-shadow 0.18s ease; }
  .bd-input:focus { outline: none; }
  .bd-select { appearance: none; }

  .bd-btn { transition: opacity 0.15s ease, transform 0.15s ease; }
  .bd-btn:hover:not(:disabled) { opacity: 0.87; transform: translateY(-1px); }
  .bd-btn:active:not(:disabled) { transform: translateY(0); }
  .bd-btn:disabled { opacity: 0.45; cursor: not-allowed; }

  .bd-network-btn { transition: all 0.18s ease; }
  .bd-network-btn:hover { transform: translateY(-1px); }

  .bd-plan-row { transition: background 0.15s ease, border-color 0.15s ease; }
`;

/* ── Network config ───────────────────────────────────────────── */
const NETWORKS = {
  "01": { name: "MTN",     apiName: "MTN",     color: "#FCD34D", bg: "rgba(252,211,77,0.12)"  },
  "02": { name: "Glo",     apiName: "Glo",     color: "#22c55e", bg: "rgba(34,197,94,0.12)"   },
  "04": { name: "Airtel",  apiName: "Airtel",  color: "#ef4444", bg: "rgba(239,68,68,0.12)"   },
  "03": { name: "9mobile", apiName: "m_9mobile", color: "#10b981", bg: "rgba(16,185,129,0.12)" },
};

function roundToNearestTen(num) {
  const r = num % 10;
  return r >= 5 ? num + (10 - r) : num - r;
}

/* ── Field wrapper ────────────────────────────────────────────── */
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
        className="bd-input bd-select w-full px-4 py-3 pr-10 rounded-xl text-sm cursor-pointer"
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

/* ── Confirm modal ────────────────────────────────────────────── */
function ConfirmModal({ visible, onConfirm, onCancel, loading, form, cashbackUsed, cashbackAmount, finalAmount, pax26 }) {
  if (!visible) return null;
  const GREEN   = "#22c55e";
  const network = NETWORKS[form.network];

  const rows = [
    { label: "Phone",    value: form.number,    highlight: true  },
    { label: "Network",  value: network?.name,  color: network?.color },
    { label: "Plan",     value: form.plan,      highlight: false },
    { label: "Amount",   value: `₦${Number(form.amount).toLocaleString()}` },
    ...(cashbackUsed ? [{ label: "Cashback", value: `-₦${cashbackAmount.toLocaleString()}`, color: GREEN }] : []),
    { label: "You Pay",  value: `₦${Number(finalAmount).toLocaleString()}`, highlight: true },
  ];

  return (
    <div className="bd-backdrop fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}>
      <div className="bd-modal-in w-full max-w-md rounded-2xl overflow-hidden shadow-2xl"
        style={{ background: pax26?.bg, border: `1px solid ${pax26?.border}` }}>

        <div className="h-1 w-full"
          style={{ background: `linear-gradient(90deg, ${GREEN}, ${GREEN}55, transparent)` }} />

        <div className="flex items-center justify-between px-6 py-5"
          style={{ borderBottom: `1px solid ${pax26?.border}` }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(34,197,94,0.12)", color: GREEN }}>
              <ShieldCheck size={17} />
            </div>
            <div>
              <p className="text-sm font-bold" style={{ color: pax26?.textPrimary }}>Confirm Purchase</p>
              <p className="bd-mono text-[10px]" style={{ color: pax26?.textSecondary, opacity: 0.45 }}>
                Review before payment
              </p>
            </div>
          </div>
          <button onClick={onCancel}
            className="bd-btn w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: pax26?.secondaryBg, border: `1px solid ${pax26?.border}`, color: pax26?.textSecondary }}>
            <X size={14} />
          </button>
        </div>

        <div className="px-6 py-4 space-y-2">
          {rows.map(({ label, value, highlight, color }) => (
            <div key={label} className="flex items-center justify-between px-4 py-3 rounded-xl"
              style={{
                background: highlight ? "rgba(34,197,94,0.08)" : pax26?.secondaryBg,
                border: `1px solid ${highlight ? "rgba(34,197,94,0.2)" : pax26?.border}`,
              }}>
              <span className="bd-mono text-[10px] uppercase tracking-wider"
                style={{ color: pax26?.textSecondary, opacity: 0.5 }}>{label}</span>
              <span className="text-xs font-bold"
                style={{ color: color || (highlight ? GREEN : pax26?.textPrimary) }}>
                {value || "—"}
              </span>
            </div>
          ))}
        </div>

        <div className="flex gap-3 px-6 pb-6">
          <button onClick={onCancel} disabled={loading}
            className="bd-btn flex-1 py-3 rounded-xl text-sm font-semibold"
            style={{ background: pax26?.secondaryBg, color: pax26?.textSecondary, border: `1px solid ${pax26?.border}` }}>
            Go Back
          </button>
          <button onClick={onConfirm} disabled={loading}
            className="bd-btn flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white"
            style={{ background: GREEN, boxShadow: loading ? "none" : "0 8px 24px rgba(34,197,94,0.35)" }}>
            {loading
              ? <><div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white bd-spin" />Processing…</>
              : <><CheckCircle2 size={15} /> Confirm & Pay</>
            }
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Data Help panel ──────────────────────────────────────────── */
function DataHelpPanel({ form, pax26 }) {
  const GREEN   = "#22c55e";
  const primary = pax26?.primary;
  const network = NETWORKS[form.network];

  const tips = [
    "Data is activated on the number within minutes of payment.",
    "You can buy data for any number — not just your own.",
    "Plans are auto-loaded based on the detected network.",
    "Data validity varies by plan — check the plan name for hints.",
  ];

  return (
    <div className="space-y-4">
      {/* network spotlight */}
      {network ? (
        <div className="rounded-2xl p-5 overflow-hidden relative bd-fade"
          style={{ background: pax26?.bg, border: `1px solid ${pax26?.border}` }}>
          <div className="absolute top-0 left-0 right-0 h-1"
            style={{ background: `linear-gradient(90deg, ${network.color}, ${network.color}44, transparent)` }} />
          <div className="flex items-center gap-3 mt-1">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: network.bg, color: network.color }}>
              <Radio size={17} />
            </div>
            <div>
              <p className="text-sm font-bold" style={{ color: pax26?.textPrimary }}>{network.name} Selected</p>
              <p className="bd-mono text-[10px]" style={{ color: pax26?.textSecondary, opacity: 0.45 }}>
                Plans loaded automatically
              </p>
            </div>
          </div>
          {/* selected plan summary */}
          {form.plan && (
            <div className="bd-fade mt-3 flex items-center justify-between px-4 py-3 rounded-xl"
              style={{ background: `${network.color}0C`, border: `1px solid ${network.color}22` }}>
              <div>
                <p className="bd-mono text-[10px] uppercase tracking-wider mb-0.5"
                  style={{ color: pax26?.textSecondary, opacity: 0.45 }}>Selected Plan</p>
                <p className="text-xs font-bold" style={{ color: pax26?.textPrimary }}>{form.plan}</p>
              </div>
              {form.amount && (
                <p className="bd-mono text-sm font-bold" style={{ color: network.color }}>
                  ₦{Number(form.amount).toLocaleString()}
                </p>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-2xl p-5 flex items-center gap-4"
          style={{ background: pax26?.bg, border: `1px solid ${pax26?.border}` }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: `${primary}14`, color: primary }}>
            <Wifi size={19} />
          </div>
          <div>
            <p className="text-sm font-bold mb-0.5" style={{ color: pax26?.textPrimary }}>Data Purchase</p>
            <p className="text-xs" style={{ color: pax26?.textSecondary, opacity: 0.55 }}>
              Enter a phone number — network and plans load automatically.
            </p>
          </div>
        </div>
      )}

      {/* tips */}
      <div className="rounded-2xl p-5" style={{ background: pax26?.bg, border: `1px solid ${pax26?.border}` }}>
        <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: pax26?.textPrimary }}>
          Good to Know
        </p>
        <div className="space-y-2">
          {tips.map((tip, i) => (
            <div key={i} className="flex items-start gap-2.5 px-3 py-2.5 rounded-xl"
              style={{ background: pax26?.secondaryBg }}>
              <CheckCircle2 size={13} className="flex-shrink-0 mt-0.5" style={{ color: GREEN }} />
              <p className="text-xs leading-relaxed" style={{ color: pax26?.textSecondary, opacity: 0.7 }}>{tip}</p>
            </div>
          ))}
        </div>
      </div>

      {/* quick facts */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl p-4 flex flex-col items-center text-center gap-2"
          style={{ background: pax26?.bg, border: `1px solid ${pax26?.border}` }}>
          <Zap size={18} style={{ color: primary }} />
          <p className="text-xs font-bold" style={{ color: pax26?.textPrimary }}>Instant</p>
          <p className="text-[10px]" style={{ color: pax26?.textSecondary, opacity: 0.5 }}>Activates in minutes</p>
        </div>
        <div className="rounded-2xl p-4 flex flex-col items-center text-center gap-2"
          style={{ background: pax26?.bg, border: `1px solid ${pax26?.border}` }}>
          <ShieldCheck size={18} style={{ color: GREEN }} />
          <p className="text-xs font-bold" style={{ color: pax26?.textPrimary }}>Secure</p>
          <p className="text-[10px]" style={{ color: pax26?.textSecondary, opacity: 0.5 }}>PIN protected</p>
        </div>
      </div>

      {/* support */}
      <div className="flex items-start gap-3 p-4 rounded-2xl"
        style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.18)" }}>
        <ShieldCheck size={14} style={{ color: GREEN, flexShrink: 0, marginTop: 1 }} />
        <p className="text-xs leading-relaxed" style={{ color: pax26?.textSecondary, opacity: 0.7 }}>
          Need help?{" "}
          <a href="mailto:info@pax26.com" className="font-bold underline" style={{ color: GREEN }}>
            info@pax26.com
          </a>
        </p>
      </div>
    </div>
  );
}

/* ── Main component ───────────────────────────────────────────── */
const BuyData = () => {
  const { dataPlan, getUserRealTimeData, userData, setPinModal, checkIsTransactionPinSet, profitConfig, pax26, userCashBack } = useGlobalContext();

  const initialForm = { network: "", plan: "", planId: "", amount: "", number: "", pin: "" };

  const [form, setForm]                     = useState(initialForm);
  const [availablePlans, setAvailablePlans] = useState([]);
  const [loading, setLoading]               = useState(false);
  const [checked, setChecked]               = useState(false);
  const [phoneCarrier, setPhoneCarrier]     = useState("");
  const [phoneNumberValid, setPhoneValid]   = useState(false);
  const [focused, setFocused]               = useState("");
  const [showConfirm, setShowConfirm]       = useState(false);

  const primary = pax26?.primary;
  const GREEN   = "#22c55e";

   useEffect(()=>{
        checkIsTransactionPinSet();
      },[])

  /* pin guard */
  useEffect(() => {
    const iv = setInterval(() => { if (userData.pin === null) setPinModal(true); }, 2000);
    return () => clearInterval(iv);
  }, [userData]);

  /* load plans for a network code */
  const loadPlans = (code) => {
    const networkName = NETWORKS[code]?.apiName;
    const plans = dataPlan?.MOBILE_NETWORK?.[networkName]?.[0]?.PRODUCT || [];
    const enhanced = plans.map(item => {
      const base    = Number(item.PRODUCT_AMOUNT);
      const markup  = applyMarkup(base, profitConfig.type, profitConfig.value);
      const rounded = roundToNearestTen(markup);
      return { name: item.PRODUCT_NAME, code: item.PRODUCT_ID, price: base, sellingPrice: rounded };
    });
    setAvailablePlans(enhanced);
  };

  /* phone number → auto-detect carrier */
  useEffect(() => {
    if (!form.number || form.number.length < 11) {
      setForm(p => ({ ...p, network: "", plan: "", planId: "", amount: "" }));
      setAvailablePlans([]); setPhoneCarrier(""); setPhoneValid(false);
      return;
    }
    const carrier = phoneCarrierDetector(form.number);
    if (!carrier || carrier === "99") { setPhoneValid(false); setPhoneCarrier("99"); return; }
    setPhoneCarrier(carrier);
    setPhoneValid(true);
    setForm(p => ({ ...p, network: carrier, plan: "", planId: "", amount: "" }));
    loadPlans(carrier);
  }, [form.number]);

  const handleChange  = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleNetworkChange = e => {
    const code = e.target.value;
    setForm(p => ({ ...p, network: code, plan: "", planId: "", amount: "" }));
    loadPlans(code);
  };

  const handlePlanChange = e => {
    const selected = e.target.value;
    const plan = availablePlans.find(p => p.name === selected);
    if (plan) setForm(p => ({ ...p, plan: selected, planId: plan.code, amount: plan.sellingPrice.toString() }));
  };

  /* cashback */
  const cashbackUsed   = checked && userCashBack > 0 && Number(form.amount) >= 50;
  const cashbackAmount = cashbackUsed ? Math.min(Number(form.amount), userCashBack) : 0;
  const finalAmount    = Math.max(0, Number(form.amount) - cashbackAmount);

  /* Step 1 — validate → open modal */
  const handleReview = e => {
    e.preventDefault();
    if (!form.network)                       return toast.error("Please select a network");
    if (!form.plan)                          return toast.error("Please choose a data plan");
    if (!/^\d{11}$/.test(form.number))       return toast.error("Enter a valid 11-digit phone number");
    if (!phoneNumberValid)                   return toast.error("Enter a valid phone number");
    if (form.pin.length < 4)                 return toast.error("PIN must be 4 digits");
    setShowConfirm(true);
  };

  /* Step 2 — confirmed → API */
  const handleConfirmedSubmit = async () => {
    setLoading(true);
    try {
      const res = await axios.post("/api/provider/data-provider", {
        ...form,
        usedCashBack: cashbackUsed,
        network: NETWORKS[form.network]?.apiName,
      });
      if (res.data.success) {
        getUserRealTimeData();
        toast.success("Data purchase successful!");
        setForm(initialForm); setAvailablePlans([]); setShowConfirm(false);
        setPhoneCarrier(""); setPhoneValid(false);
      } else {
        toast.error(res.data.message || "Purchase failed.");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally { setLoading(false); }
  };

  const inputStyle = (field) => ({
    background: pax26?.secondaryBg,
    color: pax26?.textPrimary,
    border: `1px solid ${focused === field ? primary : pax26?.border}`,
    boxShadow: focused === field ? `0 0 0 3px ${primary}15` : "none",
  });

  if (!dataPlan) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-t-transparent bd-spin"
            style={{ borderColor: `${primary}40`, borderTopColor: primary }} />
          <p className="bd-mono text-xs" style={{ color: pax26?.textSecondary, opacity: 0.4 }}>
            Loading data plans…
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{CSS}</style>

      <ConfirmModal
        visible={showConfirm}
        onConfirm={handleConfirmedSubmit}
        onCancel={() => setShowConfirm(false)}
        loading={loading}
        form={form}
        cashbackUsed={cashbackUsed}
        cashbackAmount={cashbackAmount}
        finalAmount={finalAmount}
        pax26={pax26}
      />

      <div className="bd-root min-h-screen px-5 py-10">
        <div className="max-w-5xl mx-auto">

          {/* ── Page header ─────────────────────────────── */}
          <div className="bd-s1 mb-8">
            <div className="flex items-center gap-2 mb-3">
              <span className="bd-mono text-[10px] font-medium uppercase tracking-widest"
                style={{ color: pax26?.textSecondary, opacity: 0.4 }}>Services</span>
              <div className="h-px w-8" style={{ background: pax26?.border }} />
            </div>
            <h1 className="text-3xl font-extrabold leading-tight" style={{ color: pax26?.textPrimary }}>
              Buy Data
            </h1>
            <p className="text-sm mt-1" style={{ color: pax26?.textSecondary, opacity: 0.55 }}>
              Purchase data for any Nigerian network — plans load automatically.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">

            {/* ── LEFT col ──────────────────────────────── */}
            <div className="flex flex-col gap-5">
              <div className="bd-s1"><WalletBalance /></div>

              {/* form card */}
              <div className="bd-s2 rounded-2xl overflow-hidden"
                style={{ background: pax26?.bg, border: `1px solid ${pax26?.border}` }}>

                <div className="h-1 w-full"
                  style={{ background: `linear-gradient(90deg, ${primary}, ${primary}55, transparent)` }} />

                {/* card header */}
                <div className="flex items-center justify-between px-6 py-5"
                  style={{ borderBottom: `1px solid ${pax26?.border}` }}>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                      style={{ background: `${primary}15`, color: primary }}>
                      <Database size={17} />
                    </div>
                    <div>
                      <p className="text-sm font-bold" style={{ color: pax26?.textPrimary }}>Data Top-Up</p>
                      <p className="bd-mono text-[10px]" style={{ color: pax26?.textSecondary, opacity: 0.45 }}>
                        Fill → Confirm → Done
                      </p>
                    </div>
                  </div>
                  <CashBackOption userCashBack={userCashBack} setChecked={setChecked} checked={checked} />
                </div>

                <form onSubmit={handleReview} className="p-6 space-y-5">

                  {/* Phone number */}
                  <Field label="Phone Number" pax26={pax26}>
                    <div className="relative">
                      <Phone size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                        style={{ color: pax26?.textSecondary, opacity: 0.35 }} />
                      <input type="tel" name="number" value={form.number}
                        onChange={handleChange} required placeholder="08012345678"
                        className="bd-input w-full pl-9 pr-10 py-3 rounded-xl text-sm"
                        style={inputStyle("number")}
                        onFocus={() => setFocused("number")} onBlur={() => setFocused("")}
                      />
                      {/* carrier badge */}
                      {phoneNumberValid && NETWORKS[form.network] && (
                        <span className="bd-fade absolute right-3 top-1/2 -translate-y-1/2 bd-mono text-[10px] font-bold px-2 py-0.5 rounded-lg"
                          style={{ background: NETWORKS[form.network].bg, color: NETWORKS[form.network].color }}>
                          {NETWORKS[form.network].name}
                        </span>
                      )}
                    </div>
                    {form.number.length >= 11 && phoneCarrier === "99" && (
                      <div className="bd-fade flex items-center gap-1.5 mt-2 text-xs font-semibold"
                        style={{ color: "#ef4444" }}>
                        <AlertCircle size={12} /> Invalid phone number
                      </div>
                    )}
                    {phoneNumberValid && (
                      <div className="bd-fade flex items-center gap-1.5 mt-2 text-xs font-semibold"
                        style={{ color: GREEN }}>
                        <CheckCircle2 size={12} /> Network detected · plans loaded
                      </div>
                    )}
                  </Field>

                  {/* Network — pills when auto-detected, select when manual */}
                  {phoneNumberValid ? (
                    <Field label="Network" pax26={pax26}>
                      <div className="grid grid-cols-4 gap-2">
                        {Object.entries(NETWORKS).map(([code, n]) => (
                          <button type="button" key={code}
                            onClick={() => {
                              setForm(p => ({ ...p, network: code, plan: "", planId: "", amount: "" }));
                              loadPlans(code);
                            }}
                            className="bd-network-btn py-2.5 rounded-xl text-xs font-bold"
                            style={{
                              background: form.network === code ? n.bg : pax26?.secondaryBg,
                              color: form.network === code ? n.color : pax26?.textSecondary,
                              border: `1px solid ${form.network === code ? n.color + "50" : pax26?.border}`,
                            }}>
                            {n.name}
                          </button>
                        ))}
                      </div>
                    </Field>
                  ) : (
                    <Field label="Select Network" pax26={pax26}>
                      <ThemedSelect name="network" value={form.network}
                        onChange={handleNetworkChange} required
                        pax26={pax26} isFocused={focused === "network"}
                        onFocus={() => setFocused("network")} onBlur={() => setFocused("")}>
                        <option value="" disabled>Choose network</option>
                        {Object.entries(NETWORKS).map(([code, n]) => (
                          <option key={code} value={code}>{n.name}</option>
                        ))}
                      </ThemedSelect>
                    </Field>
                  )}

                  {/* Data plan */}
                  <Field label="Data Plan" pax26={pax26}>
                    <ThemedSelect name="plan" value={form.plan}
                      onChange={handlePlanChange} required
                      disabled={!availablePlans.length}
                      pax26={pax26} isFocused={focused === "plan"}
                      onFocus={() => setFocused("plan")} onBlur={() => setFocused("")}>
                      <option value="" disabled>
                        {availablePlans.length ? "Choose a plan" : "Select network first"}
                      </option>
                      {availablePlans.map((p, i) => (
                        <option key={i} value={p.name}>
                          {p.name} — ₦{p.sellingPrice}
                        </option>
                      ))}
                    </ThemedSelect>
                  </Field>

                  {/* Amount (auto-filled, read-only) */}
                  {form.amount && (
                    <div className="bd-fade">
                      <Field label="Amount" pax26={pax26}>
                        <div className="flex items-center gap-2 px-4 py-3 rounded-xl"
                          style={{ background: `${primary}0C`, border: `1px solid ${primary}30` }}>
                          <span className="bd-mono text-sm font-bold" style={{ color: primary }}>
                            ₦{Number(form.amount).toLocaleString("en-NG")}
                          </span>
                          <span className="bd-mono text-[10px] ml-auto"
                            style={{ color: pax26?.textSecondary, opacity: 0.45 }}>
                            Auto-calculated
                          </span>
                        </div>

                        {/* cashback preview */}
                        {cashbackUsed && (
                          <div className="bd-fade mt-2 flex items-center justify-between px-4 py-3 rounded-xl"
                            style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)" }}>
                            <div>
                              <p className="bd-mono text-[10px] uppercase tracking-wider mb-0.5"
                                style={{ color: pax26?.textSecondary, opacity: 0.5 }}>Cashback applied</p>
                              <p className="text-xs" style={{ color: pax26?.textPrimary }}>
                                ₦{Number(form.amount).toLocaleString()}{" "}
                                <span style={{ color: GREEN }}>− ₦{cashbackAmount.toLocaleString()}</span>
                              </p>
                            </div>
                            <p className="bd-mono text-sm font-bold" style={{ color: GREEN }}>
                              = ₦{finalAmount.toLocaleString()}
                            </p>
                          </div>
                        )}
                      </Field>
                    </div>
                  )}

                  {/* PIN */}
                  <Field label="Transaction PIN" pax26={pax26}>
                    <div className="relative">
                      <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                        style={{ color: pax26?.textSecondary, opacity: 0.35 }} />
                      <input type="password" name="pin" value={form.pin}
                        onChange={handleChange} required maxLength={4} placeholder="4-digit PIN"
                        className="bd-input w-full pl-9 pr-4 py-3 rounded-xl text-sm tracking-widest"
                        style={inputStyle("pin")}
                        onFocus={() => setFocused("pin")} onBlur={() => setFocused("")}
                      />
                    </div>
                  </Field>

                  <div className="h-px" style={{ background: pax26?.border }} />

                  <button type="submit"
                    className="bd-btn w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl text-sm font-bold text-white"
                    style={{ background: primary, boxShadow: `0 10px 28px ${primary}38` }}>
                    <Database size={15} /> Review & Confirm
                  </button>
                </form>
              </div>
            </div>

            {/* ── RIGHT col ─────────────────────────────── */}
            <div className="bd-s2">
              <DataHelpPanel form={form} pax26={pax26} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BuyData;