"use client";

import React, { useEffect, useState, useRef } from "react";
import { toast } from "react-toastify";
import { User, Lock, ArrowRight, CheckCircle2, AlertCircle, X, ShieldCheck, Wallet, Zap, Clock } from "lucide-react";
import { useGlobalContext } from "../Context";
import WalletBalance from "../WalletBalance/WalletBalance";

/* ── Keyframes + font ─────────────────────────────────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Syne:wght@600;700;800&display=swap');

  .tr-root { font-family: 'Syne', sans-serif; }
  .tr-mono { font-family: 'DM Mono', monospace; }

  @keyframes tr-slide  { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
  @keyframes tr-spin   { to{transform:rotate(360deg)} }
  @keyframes tr-fade   { from{opacity:0;transform:translateY(4px)} to{opacity:1;transform:translateY(0)} }
  @keyframes tr-modal-in { from{opacity:0;transform:scale(0.95) translateY(10px)} to{opacity:1;transform:scale(1) translateY(0)} }
  @keyframes tr-backdrop { from{opacity:0} to{opacity:1} }

  .tr-s1       { animation: tr-slide 0.4s ease both; }
  .tr-s2       { animation: tr-slide 0.4s ease 0.08s both; }
  .tr-fade     { animation: tr-fade  0.25s ease both; }
  .tr-spin     { animation: tr-spin  0.75s linear infinite; }
  .tr-modal-in { animation: tr-modal-in 0.3s cubic-bezier(0.22,1,0.36,1) both; }
  .tr-backdrop { animation: tr-backdrop 0.2s ease both; }

  .tr-input { transition: border-color 0.18s ease, box-shadow 0.18s ease; }
  .tr-input:focus { outline: none; }

  .tr-btn { transition: opacity 0.15s ease, transform 0.15s ease; }
  .tr-btn:hover:not(:disabled) { opacity: 0.87; transform: translateY(-1px); }
  .tr-btn:disabled { opacity: 0.45; cursor: not-allowed; }

  .tr-input[type=number]::-webkit-outer-spin-button,
  .tr-input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }
  .tr-input[type=number] { -moz-appearance: textfield; }
`;

const GREEN   = "#22c55e";
const QUICK   = [500, 1000, 2000, 5000];

/* ── Field label ──────────────────────────────────────────────── */
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

/* ── Confirm modal ────────────────────────────────────────────── */
function ConfirmModal({ visible, onConfirm, onCancel, loading, accountNumber, recipientName, amount, pax26 }) {
  if (!visible) return null;
  const primary = pax26?.primary;

  const rows = [
    { label: "Recipient",  value: recipientName,                                   highlight: true  },
    { label: "Account No", value: accountNumber,                                   mono: true       },
    { label: "Amount",     value: `₦${Number(amount).toLocaleString("en-NG")}`,    highlight: true  },
    { label: "Fee",        value: "₦0.00 — Free transfer",                         color: GREEN     },
  ];

  return (
    <div className="tr-backdrop fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)" }}>
      <div className="tr-modal-in tr-root w-full max-w-md rounded-2xl overflow-hidden shadow-2xl"
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
              <p className="text-sm font-bold" style={{ color: pax26?.textPrimary }}>Confirm Transfer</p>
              <p className="tr-mono text-[10px]" style={{ color: pax26?.textSecondary, opacity: 0.45 }}>
                Review before sending
              </p>
            </div>
          </div>
          <button onClick={onCancel}
            className="tr-btn w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: pax26?.secondaryBg, border: `1px solid ${pax26?.border}`, color: pax26?.textSecondary }}>
            <X size={14} />
          </button>
        </div>

        {/* rows */}
        <div className="px-6 py-4 space-y-2">
          {rows.map(({ label, value, highlight, mono, color }) => (
            <div key={label} className="flex items-center justify-between px-4 py-3 rounded-xl"
              style={{
                background: highlight ? "rgba(34,197,94,0.08)" : pax26?.secondaryBg,
                border: `1px solid ${highlight ? "rgba(34,197,94,0.2)" : pax26?.border}`,
              }}>
              <span className="tr-mono text-[10px] uppercase tracking-wider"
                style={{ color: pax26?.textSecondary, opacity: 0.5 }}>{label}</span>
              <span className={`text-xs font-bold ${mono ? "tr-mono" : ""}`}
                style={{ color: color || (highlight ? GREEN : pax26?.textPrimary) }}>
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
            Confirm the recipient name before sending.
            Pax26-to-Pax26 transfers <strong>cannot be reversed</strong>.
          </p>
        </div>

        {/* actions */}
        <div className="flex gap-3 px-6 pb-6">
          <button onClick={onCancel} disabled={loading}
            className="tr-btn flex-1 py-3 rounded-xl text-sm font-semibold"
            style={{ background: pax26?.secondaryBg, color: pax26?.textSecondary, border: `1px solid ${pax26?.border}` }}>
            Go Back
          </button>
          <button onClick={onConfirm} disabled={loading}
            className="tr-btn flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white"
            style={{ background: GREEN, boxShadow: loading ? "none" : "0 8px 24px rgba(34,197,94,0.35)" }}>
            {loading
              ? <><div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white tr-spin" />Sending…</>
              : <><CheckCircle2 size={15} /> Confirm & Send</>}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Transfer Help panel ──────────────────────────────────────── */
function TransferHelpPanel({ accountNumber, recipientName, amount, pax26 }) {
  const primary = pax26?.primary;
  const isVerified = !!recipientName;

  const tips = [
    "Only Pax26 registered users can receive transfers.",
    "Transfers are instant — funds arrive immediately.",
    "All Pax26-to-Pax26 transfers are completely free.",
    "Double-check the recipient name before confirming.",
  ];

  return (
    <div className="space-y-4">
      {/* recipient status card */}
      <div className="rounded-2xl p-5 overflow-hidden relative"
        style={{ background: pax26?.bg, border: `1px solid ${pax26?.border}` }}>
        <div className="absolute top-0 left-0 right-0 h-1"
          style={{ background: `linear-gradient(90deg, ${isVerified ? GREEN : pax26?.border}, transparent)` }} />

        <div className="flex items-center gap-3 mt-1 mb-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: isVerified ? "rgba(34,197,94,0.12)" : `${primary}12`, color: isVerified ? GREEN : primary }}>
            <User size={17} />
          </div>
          <div>
            <p className="text-sm font-bold" style={{ color: pax26?.textPrimary }}>
              {isVerified ? "Recipient Verified" : "Recipient Status"}
            </p>
            <p className="tr-mono text-[10px]" style={{ color: pax26?.textSecondary, opacity: 0.45 }}>
              {isVerified ? "Ready to transfer" : "Enter a valid Pax26 number"}
            </p>
          </div>
        </div>

        {isVerified && (
          <div className="tr-fade flex items-center gap-2 px-4 py-3 rounded-xl"
            style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)" }}>
            <CheckCircle2 size={13} style={{ color: GREEN }} />
            <div>
              <p className="tr-mono text-[10px] uppercase tracking-wider mb-0.5"
                style={{ color: pax26?.textSecondary, opacity: 0.45 }}>Recipient</p>
              <p className="text-xs font-bold" style={{ color: GREEN }}>{recipientName}</p>
            </div>
          </div>
        )}

        {accountNumber && amount && (
          <div className="tr-fade mt-3 grid grid-cols-2 gap-2">
            <div className="px-3 py-2.5 rounded-xl" style={{ background: pax26?.secondaryBg }}>
              <p className="tr-mono text-[10px] uppercase tracking-wider mb-0.5"
                style={{ color: pax26?.textSecondary, opacity: 0.4 }}>Amount</p>
              <p className="tr-mono text-sm font-bold" style={{ color: pax26?.textPrimary }}>
                ₦{Number(amount).toLocaleString("en-NG")}
              </p>
            </div>
            <div className="px-3 py-2.5 rounded-xl" style={{ background: pax26?.secondaryBg }}>
              <p className="tr-mono text-[10px] uppercase tracking-wider mb-0.5"
                style={{ color: pax26?.textSecondary, opacity: 0.4 }}>Fee</p>
              <p className="tr-mono text-sm font-bold" style={{ color: GREEN }}>Free</p>
            </div>
          </div>
        )}
      </div>

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
          <p className="text-[10px]" style={{ color: pax26?.textSecondary, opacity: 0.5 }}>Funds arrive immediately</p>
        </div>
        <div className="rounded-2xl p-4 flex flex-col items-center text-center gap-2"
          style={{ background: pax26?.bg, border: `1px solid ${pax26?.border}` }}>
          <ShieldCheck size={18} style={{ color: GREEN }} />
          <p className="text-xs font-bold" style={{ color: pax26?.textPrimary }}>100% Free</p>
          <p className="text-[10px]" style={{ color: pax26?.textSecondary, opacity: 0.5 }}>Zero transfer fees</p>
        </div>
      </div>
    </div>
  );
}

/* ── Main component ───────────────────────────────────────────── */
const Transfer = () => {
  const { pax26, userWallet, getUserRealTimeData, router } = useGlobalContext();

  const [accountNumber, setAccountNumber] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [checkingUser, setCheckingUser]   = useState(false);
  const [userChecked, setUserChecked]     = useState(false);
  const [amount, setAmount]               = useState("");
  const [transactionPin, setTransactionPin]                     = useState("");
  const [loading, setLoading]             = useState(false);
  const [showConfirm, setShowConfirm]     = useState(false);
  const [focused, setFocused]             = useState("");

  const primary = pax26?.primary;

  /* auto-verify account on change */
  useEffect(() => {
    if (accountNumber.length < 10) {
      setRecipientName(""); setUserChecked(false); return;
    }
    const timer = setTimeout(verifyAccount, 800);
    return () => clearTimeout(timer);
  }, [accountNumber]);

  async function verifyAccount() {
    setCheckingUser(true);
    try {
      const res  = await fetch("/api/verify-recipient-number", {
        method: "POST",
        body: JSON.stringify({ recipientNumber: accountNumber }),
      });
      if (!res.ok) { setRecipientName(""); setUserChecked(false); return; }
      const data = await res.json();
      setRecipientName(data?.data?.name || "");
      setUserChecked(!!data?.data?.name);
    } catch {
      setRecipientName(""); setUserChecked(false);
    } finally { setCheckingUser(false); }
  }

  /* Step 1 — validate → open modal */
  const handleReview = () => {
    if (!accountNumber || !amount || !transactionPin || !recipientName)
      return toast.error("Please complete all fields correctly.");
    if (!userChecked)
      return toast.error("Please wait for account verification.");
    if (Number(amount) < 50)
      return toast.error("Minimum transfer is ₦50.");
    if (Number(amount) > userWallet)
      return toast.error("Insufficient wallet balance.");
    if (transactionPin.length < 4)
      return toast.error("PIN must be 4 digits.");
    setShowConfirm(true);
  };

  /* Step 2 — confirmed → API */
  const handleConfirmedTransfer = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/transfer", {
        method: "POST",
        body: JSON.stringify({ accountNumber, amount, transactionPin, recipientName }),
      });
      if (!res.ok) {
        const err = await res.json();
        toast.error(err.message || "Transfer failed");
        setLoading(false); return;
      }
      const data = await res.json();
      await getUserRealTimeData();
      setShowConfirm(false);
      setTransactionPin(""); setAmount(""); setAccountNumber(""); setRecipientName("");
      const { transactionId } = data.data;
      router.push(`/transaction-receipt/?id=${transactionId}`);
    } catch {
      toast.error("Something went wrong. Try again.");
    } finally { setLoading(false); }
  };

  const inputStyle = (field) => ({
    background: pax26?.secondaryBg,
    color: pax26?.textPrimary,
    border: `1px solid ${focused === field ? primary : pax26?.border}`,
    boxShadow: focused === field ? `0 0 0 3px ${primary}15` : "none",
  });

  const amountValid  = amount && Number(amount) >= 50;
  const overBalance  = Number(amount) > userWallet;
  const canSubmit    = recipientName && amountValid && !overBalance && transactionPin.length === 4;

  return (
    <>
      <style>{CSS}</style>

      <ConfirmModal
        visible={showConfirm}
        onConfirm={handleConfirmedTransfer}
        onCancel={() => setShowConfirm(false)}
        loading={loading}
        accountNumber={accountNumber}
        recipientName={recipientName}
        amount={amount}
        pax26={pax26}
      />

      <div className="tr-root min-h-screen px-5 py-10">
        <div className="max-w-5xl mx-auto">

          {/* ── Page header ─────────────────────────────── */}
          <div className="tr-s1 mb-8">
            <div className="flex items-center gap-2 mb-3">
              <span className="tr-mono text-[10px] font-medium uppercase tracking-widest"
                style={{ color: pax26?.textSecondary, opacity: 0.4 }}>Finance</span>
              <div className="h-px w-8" style={{ background: pax26?.border }} />
            </div>
            <h1 className="text-3xl font-extrabold leading-tight" style={{ color: pax26?.textPrimary }}>
              Transfer Funds
            </h1>
            <p className="text-sm mt-1" style={{ color: pax26?.textSecondary, opacity: 0.55 }}>
              Send money instantly to any Pax26 user — zero fees.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">

            {/* ── LEFT col ──────────────────────────────── */}
            <div className="flex flex-col gap-5">
              <div className="tr-s1"><WalletBalance /></div>

              {/* form card */}
              <div className="tr-s2 rounded-2xl overflow-hidden"
                style={{ background: pax26?.bg, border: `1px solid ${pax26?.border}` }}>

                <div className="h-1 w-full"
                  style={{ background: `linear-gradient(90deg, ${primary}, ${primary}55, transparent)` }} />

                {/* card header */}
                <div className="flex items-center gap-3 px-6 py-5"
                  style={{ borderBottom: `1px solid ${pax26?.border}` }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: `${primary}15`, color: primary }}>
                    <Wallet size={17} />
                  </div>
                  <div>
                    <p className="text-sm font-bold" style={{ color: pax26?.textPrimary }}>Pax26 Transfer</p>
                    <p className="tr-mono text-[10px]" style={{ color: pax26?.textSecondary, opacity: 0.45 }}>
                      Fill → Verify → Confirm
                    </p>
                  </div>
                </div>

                <div className="p-6 space-y-5">

                  {/* Account number + auto-verify */}
                  <Field label="Recipient's Pax26 Number" pax26={pax26}>
                    <div className="relative">
                      <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                        style={{ color: pax26?.textSecondary, opacity: 0.35 }} />
                      <input
                        inputMode="numeric" maxLength={10} value={accountNumber}
                        onChange={e => { setAccountNumber(e.target.value.replace(/\D/g, "")); setRecipientName(""); setUserChecked(false); }}
                        placeholder="e.g. 9154358139"
                        className="tr-input w-full pl-9 pr-10 py-3 rounded-xl text-sm tr-mono"
                        style={inputStyle("account")}
                        onFocus={() => setFocused("account")} onBlur={() => setFocused("")}
                      />
                      {/* spinner / check */}
                      {checkingUser && (
                        <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                          <div className="w-4 h-4 rounded-full border-2 border-t-transparent tr-spin"
                            style={{ borderColor: `${primary}40`, borderTopColor: primary }} />
                        </div>
                      )}
                      {!checkingUser && recipientName && (
                        <div className="absolute right-3.5 top-1/2 -translate-y-1/2"
                          style={{ color: GREEN }}>
                          <CheckCircle2 size={16} />
                        </div>
                      )}
                    </div>

                    {/* result chip */}
                    {!checkingUser && accountNumber.length >= 10 && (
                      <div className="tr-fade flex items-center gap-1.5 mt-2 px-3 py-2 rounded-xl text-xs font-semibold"
                        style={{
                          background: recipientName ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.08)",
                          border: `1px solid ${recipientName ? "rgba(34,197,94,0.25)" : "rgba(239,68,68,0.25)"}`,
                          color: recipientName ? GREEN : "#ef4444",
                        }}>
                        {recipientName
                          ? <><CheckCircle2 size={12} /> Recipient: <span className="font-bold ml-1">{recipientName}</span></>
                          : <><AlertCircle size={12} /> User not found on Pax26</>
                        }
                      </div>
                    )}
                    {checkingUser && (
                      <p className="tr-mono text-[11px] mt-1.5" style={{ color: primary }}>Verifying account…</p>
                    )}
                  </Field>

                  {/* Amount */}
                  <Field label="Amount (₦)" pax26={pax26}>
                    <div className="relative">
                      <span className="tr-mono absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold pointer-events-none"
                        style={{ color: amountValid && !overBalance ? primary : pax26?.textSecondary, opacity: amount ? 1 : 0.3 }}>
                        ₦
                      </span>
                      <input
                        type="number" value={amount} min="50"
                        onChange={e => setAmount(e.target.value)}
                        placeholder="0"
                        className="tr-input w-full pl-8 pr-4 py-3 rounded-xl text-sm tr-mono font-bold"
                        style={{
                          ...inputStyle("amount"),
                          border: `1px solid ${overBalance ? "#ef4444" : focused === "amount" ? primary : pax26?.border}`,
                          boxShadow: overBalance ? "0 0 0 3px rgba(239,68,68,0.12)" : focused === "amount" ? `0 0 0 3px ${primary}15` : "none",
                        }}
                        onFocus={() => setFocused("amount")} onBlur={() => setFocused("")}
                      />
                    </div>
                    {overBalance && (
                      <p className="tr-mono text-[11px] mt-1.5 text-red-500">Insufficient wallet balance</p>
                    )}
                    {/* quick amounts */}
                    <div className="grid grid-cols-4 gap-2 mt-2">
                      {QUICK.map(v => (
                        <button type="button" key={v}
                          onClick={() => setAmount(String(v))}
                          className="tr-btn py-2 rounded-xl text-xs font-bold"
                          style={{
                            background: Number(amount) === v ? `${primary}18` : pax26?.secondaryBg,
                            color: Number(amount) === v ? primary : pax26?.textSecondary,
                            border: `1px solid ${Number(amount) === v ? primary + "40" : pax26?.border}`,
                          }}>
                          ₦{v >= 1000 ? `${v / 1000}k` : v}
                        </button>
                      ))}
                    </div>
                  </Field>

                  {/* Fee row */}
                  <div className="flex items-center justify-between px-4 py-2.5 rounded-xl"
                    style={{ background: pax26?.secondaryBg }}>
                    <span className="tr-mono text-xs" style={{ color: pax26?.textSecondary, opacity: 0.5 }}>Transfer Fee</span>
                    <span className="tr-mono text-xs font-bold" style={{ color: GREEN }}>₦0.00 — Free</span>
                  </div>

                  {/* PIN */}
                  <Field label="Transaction PIN" pax26={pax26}>
                    <div className="relative">
                      <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                        style={{ color: pax26?.textSecondary, opacity: 0.35 }} />
                      <input
                        type="password" value={transactionPin} maxLength={4} placeholder="4-digit PIN"
                        onChange={e => setTransactionPin(e.target.value)}
                        className="tr-input w-full pl-9 pr-4 py-3 rounded-xl text-sm tracking-widest"
                        style={inputStyle("pin")}
                        onFocus={() => setFocused("pin")} onBlur={() => setFocused("")}
                      />
                    </div>
                  </Field>

                  <div className="h-px" style={{ background: pax26?.border }} />

                  {/* Submit */}
                  <button
                    onClick={handleReview}
                    disabled={!canSubmit}
                    className="tr-btn w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl text-sm font-bold text-white"
                    style={{
                      background: canSubmit ? primary : `${primary}55`,
                      boxShadow: canSubmit ? `0 10px 28px ${primary}38` : "none",
                    }}>
                    <ArrowRight size={15} />
                    {canSubmit ? "Review & Send" : "Complete all fields to continue"}
                  </button>
                </div>
              </div>
            </div>

            {/* ── RIGHT col ─────────────────────────────── */}
            <div className="tr-s2">
              <TransferHelpPanel
                accountNumber={accountNumber}
                recipientName={recipientName}
                amount={amount}
                pax26={pax26}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Transfer;