"use client";

import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useGlobalContext } from "../Context";
import PaymentButton from "../PaymentButton/PaymentButton";
import axios from "axios";
import { Copy, ShieldCheck, Wallet, Zap, Mail, CheckCircle2, ArrowRight, Clock } from "lucide-react";
import WalletBalance from "../WalletBalance/WalletBalance";

/* ── Keyframes + font only ───────────────────────────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Syne:wght@600;700;800&display=swap');

  .fw-root { font-family: 'Syne', sans-serif; }
  .fw-mono { font-family: 'DM Mono', monospace; }

  @keyframes fw-slide {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fw-spin  { to { transform: rotate(360deg); } }
  @keyframes fw-pulse {
    0%,100% { opacity: 1; transform: scale(1); }
    50%     { opacity: 0.5; transform: scale(0.85); }
  }
  @keyframes fw-shimmer {
    0%   { background-position: -400px 0; }
    100% { background-position: 400px 0; }
  }

  .fw-s1 { animation: fw-slide 0.4s ease both; }
  .fw-s2 { animation: fw-slide 0.4s ease 0.08s both; }
  .fw-spin    { animation: fw-spin 0.75s linear infinite; }
  .fw-pulse   { animation: fw-pulse 1.6s ease-in-out infinite; }
  .fw-shimmer {
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent);
    background-size: 400px 100%;
    animation: fw-shimmer 1.6s ease-in-out infinite;
  }

  .fw-input { transition: border-color 0.18s ease, box-shadow 0.18s ease; }
  .fw-input:focus { outline: none; }

  .fw-btn { transition: opacity 0.15s ease, transform 0.15s ease; }
  .fw-btn:hover:not(:disabled) { opacity: 0.85; transform: translateY(-1px); }
  .fw-btn:disabled { opacity: 0.45; cursor: not-allowed; }

  .fw-copy-btn { transition: color 0.15s ease, transform 0.15s ease; }
  .fw-copy-btn:hover { transform: scale(1.1); }

  .fw-feature { transition: background 0.18s ease; }
  .fw-feature:hover { background: rgba(255,255,255,0.03) !important; }
`;

/* ── Feature row ──────────────────────────────────────────────── */
function Feature({ icon, title, desc, pax26 }) {
  return (
    <div className="fw-feature flex items-start gap-3.5 p-3.5 rounded-xl -mx-1">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
        style={{ background: `${pax26?.primary}14`, color: pax26?.primary }}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-bold mb-0.5" style={{ color: pax26?.textPrimary }}>{title}</p>
        <p className="text-xs leading-relaxed" style={{ color: pax26?.textSecondary, opacity: 0.6 }}>{desc}</p>
      </div>
    </div>
  );
}

/* ── Main component ───────────────────────────────────────────── */
const FundWallet = () => {
  const { userData, paymentId, setPaymentId, getUserRealTimeData, pax26 } = useGlobalContext();
  const [amount, setAmount]   = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied]   = useState(false);

  const primary = pax26?.primary;
  const GREEN   = "#22c55e";

  const verifyPayment = async () => {
    if (!paymentId) return;
    setLoading(true);
    try {
      const res = await axios.post("/api/verify-payment", { transaction_id: paymentId });
      if (res.data.success) {
        setAmount("");
        toast.success("Payment verified! Your wallet has been funded.");
        await getUserRealTimeData()
      } else {
        toast.error(res.data.message || "Payment verification failed.");
      }
    } catch {
      toast.error("An error occurred during payment verification.");
    } finally {
      setLoading(false);
      setPaymentId("");
    }
  };

  useEffect(() => { verifyPayment(); }, [paymentId]);

  const copyVirtualAccount = () => {
    navigator.clipboard.writeText(userData?.virtualAccount)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => toast.error("Failed to copy"));
  };

  const amountValid = amount && Number(amount) >= 100;

  return (
    <>
      <style>{CSS}</style>
      <div className="fw-root min-h-screen py-12 px-5" style={{ background: pax26?.secondaryBg }}>
        <div className="max-w-5xl mx-auto">

          {/* ── Page header ─────────────────────────────── */}
          <div className="fw-s1 mb-10">
            <div className="flex items-center gap-2 mb-3">
              <span className="fw-mono text-[10px] font-medium uppercase tracking-widest"
                style={{ color: pax26?.textSecondary, opacity: 0.4 }}>
                Wallet
              </span>
              <div className="h-px w-10" style={{ background: pax26?.border }} />
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold leading-tight" style={{ color: pax26?.textPrimary }}>
              Fund Your Wallet
            </h1>
            <p className="text-sm mt-2" style={{ color: pax26?.textSecondary, opacity: 0.6 }}>
              Top up instantly via card — buy airtime, data, bills and more.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">

            {/* ── LEFT: form / verifying ─────────────────── */}
            {loading ? (

              /* Verification state */
              <div className="fw-s1 relative rounded-2xl p-8 overflow-hidden flex flex-col items-center text-center gap-5"
                style={{ background: pax26?.bg, border: `1px solid ${pax26?.border}` }}>
                <div className="fw-shimmer absolute inset-0 pointer-events-none" />

                <div className="relative">
                  <div className="fw-pulse absolute inset-0 rounded-full"
                    style={{ background: `${primary}20` }} />
                  <div className="relative w-16 h-16 rounded-full flex items-center justify-center"
                    style={{ background: `${primary}15`, border: `2px solid ${primary}30` }}>
                    <div className="w-7 h-7 rounded-full border-2 border-t-transparent fw-spin"
                      style={{ borderColor: `${primary}40`, borderTopColor: primary }} />
                  </div>
                </div>

                <div>
                  <h2 className="text-lg font-bold mb-1" style={{ color: pax26?.textPrimary }}>
                    Verifying Payment
                  </h2>
                  <p className="text-sm" style={{ color: pax26?.textSecondary, opacity: 0.6 }}>
                    Please wait while we confirm your transaction
                  </p>
                </div>

                {paymentId && (
                  <div className="w-full rounded-xl px-4 py-3"
                    style={{ background: pax26?.secondaryBg, border: `1px solid ${pax26?.border}` }}>
                    <p className="fw-mono text-[10px] uppercase tracking-widest mb-1"
                      style={{ color: pax26?.textSecondary, opacity: 0.4 }}>
                      Transaction ID
                    </p>
                    <p className="fw-mono text-xs font-medium truncate" style={{ color: pax26?.textPrimary }}>
                      {paymentId}
                    </p>
                  </div>
                )}
              </div>

            ) : (

              /* Top-up form */
              <div className="fw-s1 rounded-2xl overflow-hidden"
                style={{ background: pax26?.bg, border: `1px solid ${pax26?.border}` }}>

                {/* card top strip */}
                <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${primary}, ${primary}88)` }} />

                <div className="p-6 space-y-6">
                  <div>
                    <h2 className="text-base font-bold mb-0.5" style={{ color: pax26?.textPrimary }}>
                      Card Top-Up
                    </h2>
                    <p className="text-xs" style={{ color: pax26?.textSecondary, opacity: 0.55 }}>
                      Minimum deposit ₦100 · Instant credit
                    </p>
                  </div>

                  {/* amount input */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-widest mb-2"
                      style={{ color: pax26?.textSecondary, opacity: 0.5 }}>
                      Amount (₦)
                    </label>
                    <div className="relative">
                      <span className="fw-mono absolute left-3.5 top-1/2 -translate-y-1/2 text-base font-bold pointer-events-none"
                        style={{ color: amountValid ? primary : pax26?.textSecondary, opacity: amountValid ? 1 : 0.3 }}>
                        ₦
                      </span>
                      <input
                        type="number"
                        value={amount}
                        onChange={e => setAmount(e.target.value)}
                        min="100"
                        placeholder="0"
                        className="fw-input fw-mono w-full pl-9 pr-4 py-3 rounded-xl text-lg font-bold"
                        style={{
                          background: pax26?.secondaryBg,
                          color: pax26?.textPrimary,
                          border: `1px solid ${amountValid ? primary + "60" : pax26?.border}`,
                          boxShadow: amountValid ? `0 0 0 3px ${primary}12` : "none",
                        }}
                      />
                    </div>
                    {amount && Number(amount) < 100 && (
                      <p className="fw-mono text-[11px] mt-1.5" style={{ color: "#ef4444" }}>
                        Minimum amount is ₦100
                      </p>
                    )}
                  </div>

                  {/* quick amounts */}
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest mb-2"
                      style={{ color: pax26?.textSecondary, opacity: 0.4 }}>
                      Quick select
                    </p>
                    <div className="grid grid-cols-4 gap-2">
                      {[500, 1000, 2000, 5000].map(v => (
                        <button key={v}
                          onClick={() => setAmount(String(v))}
                          className="fw-btn py-2 rounded-xl text-xs font-bold"
                          style={{
                            background: Number(amount) === v ? `${primary}20` : pax26?.secondaryBg,
                            color: Number(amount) === v ? primary : pax26?.textSecondary,
                            border: `1px solid ${Number(amount) === v ? primary + "40" : pax26?.border}`,
                          }}>
                          ₦{v.toLocaleString()}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* virtual account */}
                  {userData?.virtualAccount && (
                    <div className="rounded-xl p-4"
                      style={{ background: pax26?.secondaryBg, border: `1px solid ${pax26?.border}` }}>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <p className="fw-mono text-[10px] uppercase tracking-widest"
                          style={{ color: pax26?.textSecondary, opacity: 0.4 }}>
                          Virtual Account
                        </p>
                        <button
                          className="fw-copy-btn flex items-center gap-1.5 text-[10px] font-semibold px-2 py-1 rounded-lg"
                          onClick={copyVirtualAccount}
                          style={{
                            background: copied ? "rgba(34,197,94,0.1)" : `${primary}10`,
                            color: copied ? GREEN : primary,
                          }}>
                          {copied
                            ? <><CheckCircle2 size={10} /> Copied</>
                            : <><Copy size={10} /> Copy</>}
                        </button>
                      </div>
                      <p className="fw-mono text-base font-bold" style={{ color: pax26?.textPrimary }}>
                        {userData.virtualAccount}
                      </p>
                    </div>
                  )}

                  {/* pay button */}
                  {amountValid ? (
                    <div className="w-full flex items-center justify-center rounded-xl py-3.5 font-bold text-sm text-white"
                      style={{ background: primary, boxShadow: `0 10px 28px ${primary}40` }}>
                      <PaymentButton
                        email={userData?.email}
                        amount={parseInt(amount)}
                        name={userData?.name}
                        phonenumber={userData?.number}
                      />
                    </div>
                  ) : (
                    <div className="w-full flex items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold"
                      style={{ background: pax26?.secondaryBg, color: pax26?.textSecondary, opacity: 0.4, border: `1px solid ${pax26?.border}` }}>
                      Enter amount to continue <ArrowRight size={14} />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── RIGHT: info panel ─────────────────────── */}
            <div className="fw-s2 space-y-4">

              {/* wallet balance chip */}
              <WalletBalance/>

              {/* features */}
              <div className="rounded-2xl p-5 space-y-1"
                style={{ background: pax26?.bg, border: `1px solid ${pax26?.border}` }}>
                <p className="fw-mono text-[10px] uppercase tracking-widest mb-4"
                  style={{ color: pax26?.textSecondary, opacity: 0.4 }}>
                  What you can do
                </p>
                <Feature icon={<Zap size={16} />} title="Automation Subscription"        desc="Instantly payment for any automation services" pax26={pax26} />
                <div className="h-px" style={{ background: pax26?.border }} />
                <Feature icon={<Zap size={16} />}         title="Airtime & Data"        desc="Instantly recharge any network — MTN, Airtel, Glo, 9mobile." pax26={pax26} />
                <div className="h-px" style={{ background: pax26?.border }} />
                <Feature icon={<Zap size={16} />}         title="Electricity Bills"      desc="Pay EKEDC, IKEDC, AEDC and more in seconds."                pax26={pax26} />
                <div className="h-px" style={{ background: pax26?.border }} />
                <Feature icon={<Zap size={16} />}         title="TV Subscription"        desc="Renew DSTV, GOtv, Startimes subscriptions instantly."        pax26={pax26} />
              </div>

              {/* security notice */}
              <div className="rounded-2xl p-5 flex items-start gap-4"
                style={{ background: `${GREEN}08`, border: `1px solid rgba(34,197,94,0.18)` }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: "rgba(34,197,94,0.12)", color: GREEN }}>
                  <ShieldCheck size={17} />
                </div>
                <div>
                  <p className="text-sm font-bold mb-1" style={{ color: pax26?.textPrimary }}>
                    Bank-grade security
                  </p>
                  <p className="text-xs leading-relaxed" style={{ color: pax26?.textSecondary, opacity: 0.6 }}>
                    All transactions are encrypted end-to-end via Flutterwave. Your card details are never stored on our servers.
                  </p>
                </div>
              </div>

              {/* instant credit notice */}
              <div className="rounded-2xl p-4 flex items-center gap-3"
                style={{ background: pax26?.bg, border: `1px solid ${pax26?.border}` }}>
                <Clock size={15} style={{ color: primary, flexShrink: 0 }} />
                <p className="text-xs" style={{ color: pax26?.textSecondary, opacity: 0.6 }}>
                  Payments are credited to your wallet <span className="font-bold" style={{ color: pax26?.textPrimary }}>instantly</span> after verification.
                  Need help?{" "}
                  <a href="mailto:info@pax26.com" className="font-semibold underline"
                    style={{ color: primary }}>
                    info@pax26.com
                  </a>
                </p>
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FundWallet;