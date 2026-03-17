"use client";

import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import WalletBalance from "../WalletBalance/WalletBalance";
import axios from "axios";
import { useGlobalContext } from "../Context";
import CashBackOption from "../ui/CashBackOption";
import { phoneCarrierDetector } from "../utils/phoneCarrierDetector";
import {
  Phone, Lock, Smartphone, ChevronDown,
  CheckCircle2, AlertCircle, Zap, X,
  Radio, CreditCard, ShieldCheck,
} from "lucide-react";

/* ── Keyframes + font only ───────────────────────────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Syne:wght@600;700;800&display=swap');

  .ba-root { font-family: 'Syne', sans-serif; }
  .ba-mono { font-family: 'DM Mono', monospace; }

  @keyframes ba-slide {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes ba-spin  { to { transform: rotate(360deg); } }
  @keyframes ba-fade  {
    from { opacity: 0; transform: translateY(4px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes ba-modal-in {
    from { opacity: 0; transform: scale(0.95) translateY(10px); }
    to   { opacity: 1; transform: scale(1) translateY(0); }
  }
  @keyframes ba-backdrop { from { opacity:0; } to { opacity:1; } }

  .ba-s1       { animation: ba-slide 0.4s ease both; }
  .ba-s2       { animation: ba-slide 0.4s ease 0.08s both; }
  .ba-fade     { animation: ba-fade 0.25s ease both; }
  .ba-spin     { animation: ba-spin 0.75s linear infinite; }
  .ba-modal-in { animation: ba-modal-in 0.3s cubic-bezier(0.22,1,0.36,1) both; }
  .ba-backdrop { animation: ba-backdrop 0.2s ease both; }

  .ba-input { transition: border-color 0.18s ease, box-shadow 0.18s ease; }
  .ba-input:focus { outline: none; }

  .ba-select { appearance: none; }

  .ba-btn { transition: opacity 0.15s ease, transform 0.15s ease; }
  .ba-btn:hover:not(:disabled) { opacity: 0.87; transform: translateY(-1px); }
  .ba-btn:active:not(:disabled) { transform: translateY(0); }
  .ba-btn:disabled { opacity: 0.45; cursor: not-allowed; }

  .ba-input[type=number]::-webkit-outer-spin-button,
  .ba-input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }
  .ba-input[type=number] { -moz-appearance: textfield; }

  .ba-network-btn { transition: all 0.18s ease; }
  .ba-network-btn:hover { transform: translateY(-1px); }
`;

/* ── Network config ───────────────────────────────────────────── */
const NETWORKS = {
  "01": { name: "MTN",     color: "#FCD34D", bg: "rgba(252,211,77,0.12)"  },
  "02": { name: "Glo",     color: "#22c55e", bg: "rgba(34,197,94,0.12)"   },
  "04": { name: "Airtel",  color: "#ef4444", bg: "rgba(239,68,68,0.12)"   },
  "03": { name: "9mobile", color: "#10b981", bg: "rgba(16,185,129,0.12)"  },
};

/* ── Quick amounts ───────────────────────────────────────────── */
const QUICK_AMOUNTS = [100, 200, 500, 1000];

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

/* ── Confirm Modal ────────────────────────────────────────────── */
function ConfirmModal({ visible, onConfirm, onCancel, loading, data, cashbackUsed, cashbackAmount, finalAmount, pax26 }) {
  if (!visible) return null;

  const primary = pax26?.primary;
  const GREEN   = "#22c55e";
  const network = NETWORKS[data.network];

  const rows = [
    { label: "Phone",    value: data.number,      highlight: true  },
    { label: "Network",  value: network?.name,    color: network?.color },
    { label: "Amount",   value: `₦${Number(data.amount).toLocaleString()}`, highlight: false },
    ...(cashbackUsed ? [{ label: "Cashback",  value: `-₦${cashbackAmount}`, color: GREEN }] : []),
    { label: "You Pay",  value: `₦${Number(finalAmount).toLocaleString()}`, highlight: true  },
  ];

  return (
    <div className="ba-backdrop fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}>

      <div className="ba-modal-in w-full max-w-md rounded-2xl overflow-hidden shadow-2xl"
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
              <p className="ba-mono text-[10px]" style={{ color: pax26?.textSecondary, opacity: 0.45 }}>
                Review before payment
              </p>
            </div>
          </div>
          <button onClick={onCancel}
            className="ba-btn w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: pax26?.secondaryBg, border: `1px solid ${pax26?.border}`, color: pax26?.textSecondary }}>
            <X size={14} />
          </button>
        </div>

        {/* rows */}
        <div className="px-6 py-4 space-y-2">
          {rows.map(({ label, value, highlight, color }) => (
            <div key={label} className="flex items-center justify-between px-4 py-3 rounded-xl"
              style={{
                background: highlight ? `${GREEN}08` : pax26?.secondaryBg,
                border: `1px solid ${highlight ? "rgba(34,197,94,0.2)" : pax26?.border}`,
              }}>
              <span className="ba-mono text-[10px] uppercase tracking-wider"
                style={{ color: pax26?.textSecondary, opacity: 0.5 }}>{label}</span>
              <span className="text-xs font-bold"
                style={{ color: color || (highlight ? GREEN : pax26?.textPrimary) }}>
                {value || "—"}
              </span>
            </div>
          ))}
        </div>

        {/* buttons */}
        <div className="flex gap-3 px-6 pb-6">
          <button onClick={onCancel} disabled={loading}
            className="ba-btn flex-1 py-3 rounded-xl text-sm font-semibold"
            style={{ background: pax26?.secondaryBg, color: pax26?.textSecondary, border: `1px solid ${pax26?.border}` }}>
            Go Back
          </button>
          <button onClick={onConfirm} disabled={loading}
            className="ba-btn flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white"
            style={{ background: GREEN, boxShadow: loading ? "none" : "0 8px 24px rgba(34,197,94,0.35)" }}>
            {loading
              ? <><div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white ba-spin" />Processing…</>
              : <><CheckCircle2 size={15} /> Confirm & Pay</>
            }
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Airtime Help panel ───────────────────────────────────────── */
function AirtimeHelpPanel({ data, pax26 }) {
  const primary = pax26?.primary;
  const GREEN   = "#22c55e";
  const network = NETWORKS[data.network];

  const tips = [
    "Airtime is credited instantly after payment.",
    "You can recharge any Nigerian number — not just your own.",
    "MTN, Glo, Airtel and 9mobile are all supported.",
    "Minimum purchase is ₦50.",
  ];

  return (
    <div className="space-y-4">
      {/* network spotlight */}
      {network ? (
        <div className="rounded-2xl p-5 overflow-hidden relative ba-fade"
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
              <p className="ba-mono text-[10px]" style={{ color: pax26?.textSecondary, opacity: 0.45 }}>
                Carrier detected automatically
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl p-5 flex items-center gap-4"
          style={{ background: pax26?.bg, border: `1px solid ${pax26?.border}` }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: `${primary}14`, color: primary }}>
            <Smartphone size={19} />
          </div>
          <div>
            <p className="text-sm font-bold mb-0.5" style={{ color: pax26?.textPrimary }}>Airtime Purchase</p>
            <p className="text-xs" style={{ color: pax26?.textSecondary, opacity: 0.55 }}>
              Enter a phone number and we'll auto-detect the network.
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

      {/* quick ref */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl p-4 flex flex-col items-center text-center gap-2"
          style={{ background: pax26?.bg, border: `1px solid ${pax26?.border}` }}>
          <Zap size={18} style={{ color: primary }} />
          <p className="text-xs font-bold" style={{ color: pax26?.textPrimary }}>Instant</p>
          <p className="text-[10px]" style={{ color: pax26?.textSecondary, opacity: 0.5 }}>Credits in seconds</p>
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
const BuyAirtime = () => {
  const { setPinModal, getUserRealTimeData, userData, checkIsTransactionPinSet, userCashBack, pax26 } = useGlobalContext();

  const initialData = { network: "", amount: "", number: "", pin: "" };

  const [data, setData]                   = useState(initialData);
  const [loading, setLoading]             = useState(false);
  const [checked, setChecked]             = useState(false);
  const [phoneCarrier, setPhoneCarrier]   = useState("");
  const [phoneNumberValid, setPhoneValid] = useState(false);
  const [focused, setFocused]             = useState("");
  const [showConfirm, setShowConfirm]     = useState(false);

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

  /* auto-detect carrier */
  useEffect(() => {
    if (data.number.length < 11) { setPhoneCarrier(""); setPhoneValid(false); return; }
    const carrier = phoneCarrierDetector(data.number);
    if (!carrier || carrier === "99") { setPhoneValid(false); setPhoneCarrier("99"); return; }
    setPhoneCarrier(carrier);
    setPhoneValid(true);
    setData(p => ({ ...p, network: carrier }));
  }, [data.number]);

  const handleChange = e => setData(p => ({ ...p, [e.target.name]: e.target.value }));

  /* cashback calculation */
  const cashbackUsed   = checked && userCashBack > 0;
  const cashbackAmount = cashbackUsed ? Math.min(Number(data.amount), userCashBack) : 0;
  const finalAmount    = Math.max(0, Number(data.amount) - cashbackAmount);

  /* Step 1 — validate → open confirm modal */
  const handleReview = e => {
    e.preventDefault();
    if (!data.network)                       return toast.error("Please select a network");
    if (!data.amount || Number(data.amount) < 50) return toast.error("Minimum amount is ₦50");
    if (!/^\d{11}$/.test(data.number))      return toast.error("Enter a valid 11-digit phone number");
    if (!phoneNumberValid)                   return toast.error("Invalid phone number prefix");
    if (data.pin.length < 4)                 return toast.error("PIN must be 4 digits");
    if (data.pin === "1234")                 { toast.error("1234 is not allowed"); setTimeout(() => setPinModal(true), 2000); return; }
    setShowConfirm(true);
  };

  /* Step 2 — confirmed submit */
  const handleConfirmedSubmit = async () => {
    setLoading(true);
    try {
      const res = await axios.post("/api/provider/airtime-provider", { ...data, usedCashBack: cashbackUsed });
      if (res.data.success) {
        getUserRealTimeData();
        toast.success(res.data.message);
        setData(initialData); setShowConfirm(false);
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Something went wrong";
      toast.error(msg);
      if (msg === "1234 is not allowed" || msg === "Pin not activated yet!") {
        setTimeout(() => setPinModal(true), 2000);
      }
    } finally { setLoading(false); }
  };

  const inputStyle = (field) => ({
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
        data={data}
        cashbackUsed={cashbackUsed}
        cashbackAmount={cashbackAmount}
        finalAmount={finalAmount}
        pax26={pax26}
      />

      <div className="ba-root min-h-screen px-5 py-10">
        <div className="max-w-5xl mx-auto">

          {/* ── Page header ─────────────────────────────── */}
          <div className="ba-s1 mb-8">
            <div className="flex items-center gap-2 mb-3">
              <span className="ba-mono text-[10px] font-medium uppercase tracking-widest"
                style={{ color: pax26?.textSecondary, opacity: 0.4 }}>Services</span>
              <div className="h-px w-8" style={{ background: pax26?.border }} />
            </div>
            <h1 className="text-3xl font-extrabold leading-tight" style={{ color: pax26?.textPrimary }}>
              Buy Airtime
            </h1>
            <p className="text-sm mt-1" style={{ color: pax26?.textSecondary, opacity: 0.55 }}>
              Recharge any Nigerian network instantly from your wallet.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">

            {/* ── LEFT col ──────────────────────────────── */}
            <div className="flex flex-col gap-5">
              <div className="ba-s1"><WalletBalance /></div>

              {/* form card */}
              <div className="ba-s2 rounded-2xl overflow-hidden"
                style={{ background: pax26?.bg, border: `1px solid ${pax26?.border}` }}>

                <div className="h-1 w-full"
                  style={{ background: `linear-gradient(90deg, ${primary}, ${primary}55, transparent)` }} />

                {/* card header */}
                <div className="flex items-center justify-between px-6 py-5"
                  style={{ borderBottom: `1px solid ${pax26?.border}` }}>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                      style={{ background: `${primary}15`, color: primary }}>
                      <Smartphone size={17} />
                    </div>
                    <div>
                      <p className="text-sm font-bold" style={{ color: pax26?.textPrimary }}>Airtime Top-Up</p>
                      <p className="ba-mono text-[10px]" style={{ color: pax26?.textSecondary, opacity: 0.45 }}>
                        Fill → Confirm → Done
                      </p>
                    </div>
                  </div>
                  {/* cashback toggle */}
                  <CashBackOption userCashBack={userCashBack} setChecked={setChecked} checked={checked} />
                </div>

                <form onSubmit={handleReview} className="p-6 space-y-5">

                  {/* Phone number */}
                  <Field label="Phone Number" pax26={pax26}>
                    <div className="relative">
                      <Phone size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                        style={{ color: pax26?.textSecondary, opacity: 0.35 }} />
                      <input
                        type="tel" name="number" value={data.number}
                        onChange={handleChange} required placeholder="e.g. 08012345678"
                        className="ba-input w-full pl-9 pr-10 py-3 rounded-xl text-sm"
                        style={inputStyle("number")}
                        onFocus={() => setFocused("number")} onBlur={() => setFocused("")}
                      />
                      {/* carrier badge */}
                      {phoneNumberValid && NETWORKS[data.network] && (
                        <span className="ba-fade absolute right-3 top-1/2 -translate-y-1/2 ba-mono text-[10px] font-bold px-2 py-0.5 rounded-lg"
                          style={{ background: NETWORKS[data.network].bg, color: NETWORKS[data.network].color }}>
                          {NETWORKS[data.network].name}
                        </span>
                      )}
                    </div>
                    {data.number.length >= 11 && phoneCarrier === "99" && (
                      <div className="ba-fade flex items-center gap-1.5 mt-2 text-xs font-semibold"
                        style={{ color: "#ef4444" }}>
                        <AlertCircle size={12} /> Invalid phone number
                      </div>
                    )}
                    {phoneNumberValid && (
                      <div className="ba-fade flex items-center gap-1.5 mt-2 text-xs font-semibold"
                        style={{ color: GREEN }}>
                        <CheckCircle2 size={12} /> Network detected
                      </div>
                    )}
                  </Field>

                  {/* Network selector — only show if carrier couldn't be detected */}
                  {(!phoneNumberValid || phoneCarrier === "99") && (
                    <Field label="Select Network" pax26={pax26}>
                      <div className="relative">
                        <select name="network" value={data.network} onChange={handleChange} required
                          className="ba-input ba-select w-full px-4 py-3 pr-10 rounded-xl text-sm cursor-pointer"
                          style={inputStyle("network")}
                          onFocus={() => setFocused("network")} onBlur={() => setFocused("")}>
                          <option value="" disabled>Choose network</option>
                          {Object.entries(NETWORKS).map(([code, n]) => (
                            <option key={code} value={code}>{n.name}</option>
                          ))}
                        </select>
                        <ChevronDown size={15} className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                          style={{ color: pax26?.textSecondary, opacity: 0.4 }} />
                      </div>
                    </Field>
                  )}

                  {/* Network pills (quick switch when auto-detected) */}
                  {phoneNumberValid && (
                    <Field label="Network" pax26={pax26}>
                      <div className="grid grid-cols-4 gap-2">
                        {Object.entries(NETWORKS).map(([code, n]) => (
                          <button type="button" key={code}
                            onClick={() => setData(p => ({ ...p, network: code }))}
                            className="ba-network-btn py-2.5 rounded-xl text-xs font-bold"
                            style={{
                              background: data.network === code ? n.bg : pax26?.secondaryBg,
                              color: data.network === code ? n.color : pax26?.textSecondary,
                              border: `1px solid ${data.network === code ? n.color + "50" : pax26?.border}`,
                            }}>
                            {n.name}
                          </button>
                        ))}
                      </div>
                    </Field>
                  )}

                  {/* Amount */}
                  <Field label="Amount (₦)" pax26={pax26}>
                    <div className="relative">
                      <span className="ba-mono absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold pointer-events-none"
                        style={{ color: data.amount && Number(data.amount) >= 50 ? primary : pax26?.textSecondary, opacity: data.amount ? 1 : 0.3 }}>
                        ₦
                      </span>
                      <input type="number" name="amount" value={data.amount}
                        onChange={handleChange} required min="50" placeholder="0"
                        className="ba-input w-full pl-8 pr-4 py-3 rounded-xl text-sm ba-mono font-bold"
                        style={inputStyle("amount")}
                        onFocus={() => setFocused("amount")} onBlur={() => setFocused("")}
                      />
                    </div>
                    {/* quick amounts */}
                    <div className="grid grid-cols-4 gap-2 mt-2">
                      {QUICK_AMOUNTS.map(v => (
                        <button type="button" key={v}
                          onClick={() => setData(p => ({ ...p, amount: String(v) }))}
                          className="ba-btn py-2 rounded-xl text-xs font-bold"
                          style={{
                            background: Number(data.amount) === v ? `${primary}18` : pax26?.secondaryBg,
                            color: Number(data.amount) === v ? primary : pax26?.textSecondary,
                            border: `1px solid ${Number(data.amount) === v ? primary + "40" : pax26?.border}`,
                          }}>
                          ₦{v}
                        </button>
                      ))}
                    </div>

                    {/* cashback preview */}
                    {cashbackUsed && data.amount && Number(data.amount) >= 50 && (
                      <div className="ba-fade mt-3 flex items-center justify-between px-4 py-3 rounded-xl"
                        style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)" }}>
                        <div>
                          <p className="ba-mono text-[10px] uppercase tracking-wider mb-0.5"
                            style={{ color: pax26?.textSecondary, opacity: 0.5 }}>Cashback applied</p>
                          <p className="text-xs" style={{ color: pax26?.textPrimary }}>
                            ₦{Number(data.amount).toLocaleString()}{" "}
                            <span style={{ color: GREEN }}>− ₦{cashbackAmount.toLocaleString()}</span>
                          </p>
                        </div>
                        <p className="ba-mono text-sm font-bold" style={{ color: GREEN }}>
                          = ₦{finalAmount.toLocaleString()}
                        </p>
                      </div>
                    )}
                  </Field>

                  {/* PIN */}
                  <Field label="Transaction PIN" pax26={pax26}>
                    <div className="relative">
                      <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                        style={{ color: pax26?.textSecondary, opacity: 0.35 }} />
                      <input type="password" name="pin" value={data.pin}
                        onChange={handleChange} required maxLength={4} placeholder="4-digit PIN"
                        className="ba-input w-full pl-9 pr-4 py-3 rounded-xl text-sm tracking-widest"
                        style={inputStyle("pin")}
                        onFocus={() => setFocused("pin")} onBlur={() => setFocused("")}
                      />
                    </div>
                  </Field>

                  <div className="h-px" style={{ background: pax26?.border }} />

                  <button type="submit"
                    className="ba-btn w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl text-sm font-bold text-white"
                    style={{ background: primary, boxShadow: `0 10px 28px ${primary}38` }}>
                    <CreditCard size={15} /> Review & Confirm
                  </button>
                </form>
              </div>
            </div>

            {/* ── RIGHT col ─────────────────────────────── */}
            <div className="ba-s2">
              <AirtimeHelpPanel data={data} pax26={pax26} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BuyAirtime;