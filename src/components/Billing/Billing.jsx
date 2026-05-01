"use client";

import React, { useState } from "react";
import { useGlobalContext } from "../Context";
import WalletBalance from "../WalletBalance/WalletBalance";
import { toast } from "react-toastify";

/* ─── Styles ─────────────────────────────────────────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Mono:wght@400;500&family=Inter:wght@300;400;500;600&display=swap');

  .bl-root  { font-family: 'Inter', sans-serif; }
  .bl-syne  { font-family: 'Syne', sans-serif; }
  .bl-mono  { font-family: 'DM Mono', monospace; }

  @keyframes bl-slide {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes bl-pulse {
    0%,100% { opacity:1; transform:scale(1); }
    50%     { opacity:0.5; transform:scale(0.7); }
  }
  @keyframes bl-spin { to { transform: rotate(360deg); } }
  @keyframes bl-glow {
    0%,100% { opacity: 0.35; }
    50%     { opacity: 0.65; }
  }

  .bl-slide  { animation: bl-slide 0.45s ease both; }
  .bl-dot    { animation: bl-pulse 2s ease-in-out infinite; }
  .bl-spin   { animation: bl-spin 0.75s linear infinite; }
  .bl-glow   { animation: bl-glow 3.5s ease-in-out infinite; }

  .bl-card {
    transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease;
    cursor: pointer;
  }
  .bl-card:hover { transform: translateY(-5px); }

  .bl-btn {
    transition: opacity 0.16s ease, transform 0.16s ease;
    white-space: nowrap;
  }
  .bl-btn:hover:not(:disabled) { opacity: 0.85; transform: translateY(-1px); }
  .bl-btn:active:not(:disabled) { transform: translateY(0); }
  .bl-btn:disabled { opacity: 0.45; cursor: not-allowed; }

  .bl-check-item { transition: opacity 0.15s ease; }
`;

/* ─── Icons ──────────────────────────────────────────────────── */
const IconCrown = ({ size = 20 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14" /></svg>;
const IconCheck = ({ size = 14 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>;
const IconZap = ({ size = 20 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>;
const IconRocket = ({ size = 20 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" /><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" /><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" /><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" /></svg>;
const IconStar = ({ size = 20 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>;
const IconArrow = ({ size = 16 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>;
const IconWallet = ({ size = 16 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" /><path d="M3 5v14a2 2 0 0 0 2 2h16v-5" /><path d="M18 12a2 2 0 0 0 0 4h4v-4Z" /></svg>;

/* ─── Plan catalogue (mirrors API) ───────────────────────────── */
const PLANS = [
  {
    key: "starter",
    label: "Starter",
    icon: <IconZap size={22} />,
    price: 5000,
    accentHex: "#38BDF8",
    popular: false,
    tagline: "Perfect for solo entrepreneurs",
    messages: "500 AI messages / month",
    features: [
      "500 AI WhatsApp replies / month",
      "Lead capture & auto-tagging",
      "Basic follow-up automation",
      "Business profile training",
      "Email support",
    ],
  },
  {
    key: "business",
    label: "Business",
    icon: <IconRocket size={22} />,
    price: 25000,
    accentHex: "#C9A84C",
    popular: true,
    tagline: "For growing businesses",
    messages: "3,000 AI messages / month",
    features: [
      "3,000 AI WhatsApp replies / month",
      "Advanced lead follow-up flows",
      "Image search & product matching",
      "Priority AI response speed",
      "Full automation marketplace",
      "Priority support",
    ],
  },
  {
    key: "enterprise",
    label: "Enterprise",
    icon: <IconStar size={22} />,
    price: 75000,
    accentHex: "#A78BFA",
    popular: false,
    tagline: "For high-volume teams",
    messages: "20,000 AI messages / month",
    features: [
      "20,000 AI WhatsApp replies / month",
      "Unlimited automation workflows",
      "Custom AI personality & tone",
      "Dedicated account manager",
      "API access",
      "White-label ready",
      "24/7 priority support",
    ],
  },
];

/* ─── Spinner ────────────────────────────────────────────────── */
function Spinner({ color }) {
  return (
    <span className="bl-spin inline-block w-4 h-4 rounded-full border-2 border-transparent"
      style={{ borderTopColor: color || "#fff", borderRightColor: color || "#fff" }} />
  );
}

/* ─── Plan Card ──────────────────────────────────────────────── */
function PlanCard({ plan, selected, currentPlan, onSelect, pax26 }) {
  const accent = plan.accentHex;
  const isCurrent = currentPlan === plan.key;
  const isSelected = selected === plan.key;

  return (
    <div
      id={`plan-card-${plan.key}`}
      className="bl-card relative rounded-2xl overflow-hidden flex flex-col"
      onClick={() => !isCurrent && onSelect(plan.key)}
      style={{
        background: pax26?.bg,
        border: `2px solid ${isSelected ? accent : isCurrent ? `${accent}55` : pax26?.border}`,
        boxShadow: isSelected ? `0 0 0 4px ${accent}18, 0 8px 32px ${accent}22` : "none",
      }}
    >
      {/* Colored top strip */}
      <div style={{ height: "3px", background: `linear-gradient(90deg, ${accent}, ${accent}44, transparent)` }} />

      {/* Popular badge */}
      {plan.popular && (
        <div className="absolute top-4 right-4">
          <span className="bl-mono text-[9px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full"
            style={{ background: `${accent}20`, color: accent, border: `1px solid ${accent}40` }}>
            Most Popular
          </span>
        </div>
      )}

      {/* Current plan badge */}
      {isCurrent && (
        <div className="absolute top-4 right-4">
          <span className="bl-mono text-[9px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full"
            style={{ background: `${accent}20`, color: accent, border: `1px solid ${accent}40` }}>
            Current Plan
          </span>
        </div>
      )}

      <div className="p-6 flex flex-col gap-5 flex-1">
        {/* Icon + label */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center"
            style={{ background: `${accent}15`, color: accent }}>
            {plan.icon}
          </div>
          <div>
            <p className="bl-syne text-base font-bold" style={{ color: pax26?.textPrimary }}>{plan.label}</p>
            <p className="text-xs" style={{ color: pax26?.textSecondary, opacity: 0.55 }}>{plan.tagline}</p>
          </div>
        </div>

        {/* Price */}
        <div>
          <div className="flex items-end gap-1">
            <span className="bl-mono text-3xl font-bold" style={{ color: accent }}>
              ₦{plan.price.toLocaleString()}
            </span>
            <span className="text-xs pb-1.5" style={{ color: pax26?.textSecondary, opacity: 0.5 }}>/month</span>
          </div>
          <p className="bl-mono text-[11px] mt-1" style={{ color: pax26?.textSecondary, opacity: 0.5 }}>
            {plan.messages}
          </p>
        </div>

        {/* Divider */}
        <div className="h-px w-full" style={{ background: pax26?.border }} />

        {/* Features */}
        <ul className="flex flex-col gap-2.5 flex-1">
          {plan.features.map((f) => (
            <li key={f} className="bl-check-item flex items-start gap-2.5 text-xs"
              style={{ color: pax26?.textSecondary }}>
              <span className="flex-shrink-0 mt-0.5 w-4 h-4 rounded-full flex items-center justify-center"
                style={{ background: `${accent}20`, color: accent }}>
                <IconCheck size={9} />
              </span>
              {f}
            </li>
          ))}
        </ul>

        {/* Select button */}
        <button
          className="bl-btn w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold mt-auto"
          onClick={(e) => { e.stopPropagation(); !isCurrent && onSelect(plan.key); }}
          disabled={isCurrent}
          style={
            isSelected
              ? { background: accent, color: "#fff", boxShadow: `0 6px 20px ${accent}40` }
              : isCurrent
                ? { background: `${accent}10`, color: accent, border: `1px solid ${accent}30`, opacity: 0.6, cursor: "not-allowed" }
                : { background: `${accent}12`, color: accent, border: `1px solid ${accent}28` }
          }
        >
          {isCurrent ? "Active Plan" : isSelected ? <><IconCheck size={14} /> Selected</> : "Select Plan"}
        </button>
      </div>
    </div>
  );
}

/* ─── Main Billing Component ─────────────────────────────────── */
export default function Billing() {
  const { pax26, userData, userWallet, fetchUser, router } = useGlobalContext();

  const [selected, setSelected] = useState(null);
  const [paying, setPaying] = useState(false);
  const [showMore, setShowMore] = useState(false);

  const currentPlan = userData?.paxAI?.plan || "free";
  const selectedMeta = PLANS.find((p) => p.key === selected);

  const GOLD = "#C9A84C";
  const GREEN = "#4CAF7D";
  const CORAL = "#FB923C";

  /* wallet is sufficient for selected plan */
  const canAfford = selected ? (userWallet >= (selectedMeta?.price ?? 0)) : false;
  const shortfall = selected ? Math.max(0, (selectedMeta?.price ?? 0) - userWallet) : 0;

  /* ── Subscribe handler ─────────────────────────────────────── */
  const handleSubscribe = async () => {
    if (!selected || paying) return;
    setPaying(true);
    try {
      const res = await fetch("/api/billing/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: selected }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        await fetchUser();        // refresh userData so plan badge updates everywhere
        setSelected(null);
        router.push("/dashboard/automations");
      } else {
        toast.error(data.message || "Subscription failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setPaying(false);
    }
  };

  return (
    <>
      <style>{CSS}</style>
      <div className="bl-root max-w-6xl mx-auto px-5 py-10 pb-24">

        {/* ── Ambient glow orbs ──────────────────────────────── */}
        <div className="pointer-events-none fixed top-0 left-0 w-full h-full overflow-hidden" style={{ zIndex: 0 }}>
          <div className="bl-glow absolute -top-32 -left-32 w-96 h-96 rounded-full"
            style={{ background: `${GOLD}10`, filter: "blur(90px)" }} />
          <div className="bl-glow absolute top-1/2 -right-40 w-80 h-80 rounded-full"
            style={{ background: `${pax26?.primary}08`, filter: "blur(80px)", animationDelay: "-2s" }} />
        </div>

        <div className="relative z-10">

          {/* ── Page header ────────────────────────────────────── */}
          <div className="bl-slide mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4"
              style={{ background: `${GOLD}15`, border: `1px solid ${GOLD}30` }}>
              <span className="bl-dot w-2 h-2 rounded-full block" style={{ background: GOLD }} />
              <span className="bl-mono text-xs font-bold tracking-widest uppercase" style={{ color: GOLD }}>
                AI Plans & Billing
              </span>
            </div>
            <h1 className="bl-syne font-extrabold leading-tight mb-2"
              style={{ fontSize: "clamp(24px, 4.5vw, 40px)", color: pax26?.textPrimary }}>
              Choose your{" "}
              <span style={{ color: GOLD }}>AI Power</span> level
            </h1>
            <p className="text-sm max-w-xl" style={{ color: pax26?.textSecondary, opacity: 0.6 }}>
              Unlock smarter automations, higher message volumes, and priority AI responses. All billed from your wallet — no card needed.
            </p>
          </div>

          {/* ── Current plan chip ──────────────────────────────── */}
          <div className="bl-slide mb-8" style={{ animationDelay: "0.05s" }}>
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full"
              style={{ background: pax26?.bg, border: `1px solid ${pax26?.border}` }}>
              <IconCrown size={14} style={{ color: GOLD }} />
              <span className="text-xs font-medium" style={{ color: pax26?.textSecondary }}>
                Current plan:{" "}
              </span>
              <span className="bl-mono text-xs font-bold uppercase tracking-wider" style={{ color: GOLD }}>
                {currentPlan}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* ── LEFT — Plan cards ──────────────────────────────── */}
            <div className="lg:col-span-2 flex flex-col gap-4">

              {/* Plan grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bl-slide" style={{ animationDelay: "0.1s" }}>
                {PLANS.map((plan, i) => (
                  <PlanCard
                    key={plan.key}
                    plan={plan}
                    selected={selected}
                    currentPlan={currentPlan}
                    onSelect={setSelected}
                    pax26={pax26}
                  />
                ))}
              </div>

              {/* ── FAQ / info cards ─────────────────────────────── */}
              <div className="bl-slide grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2" style={{ animationDelay: "0.2s" }}>
                {[
                  {
                    title: "Billed from Wallet",
                    desc: "Subscription is deducted instantly from your Pax26 wallet. Fund your wallet first if your balance is low.",
                    color: GREEN,
                  },
                  {
                    title: "Monthly Billing Cycle",
                    desc: "Your message quota resets every 30 days from your subscription date. Upgrade anytime.",
                    color: pax26?.primary,
                  },
                  {
                    title: "Instant Activation",
                    desc: "AI automations activate immediately after payment — no waiting or manual review required.",
                    color: "#38BDF8",
                  },
                  {
                    title: "Downgrade Anytime",
                    desc: "Switch to a lower plan at your next billing cycle. No lock-in, no cancellation fees.",
                    color: CORAL,
                  },
                ].map(({ title, desc, color }) => (
                  <div key={title} className="rounded-xl p-4"
                    style={{ background: pax26?.bg, border: `1px solid ${pax26?.border}` }}>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: color }} />
                      <p className="text-xs font-semibold" style={{ color: pax26?.textPrimary }}>{title}</p>
                    </div>
                    <p className="text-xs leading-relaxed" style={{ color: pax26?.textSecondary, opacity: 0.6 }}>{desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* ── RIGHT — Wallet + checkout panel ───────────────── */}
            <div className="flex flex-col gap-4">

              {/* Wallet card */}
              <div className="bl-slide" style={{ animationDelay: "0.15s" }}>
                <WalletBalance setShowMore={setShowMore} showMore={showMore} />
              </div>

              {/* Order summary card */}
              <div className="bl-slide rounded-2xl overflow-hidden"
                style={{ background: pax26?.bg, border: `1px solid ${pax26?.border}`, animationDelay: "0.22s" }}>

                {/* Colored strip matching selected plan */}
                <div style={{
                  height: "3px",
                  background: selectedMeta
                    ? `linear-gradient(90deg, ${selectedMeta.accentHex}, ${selectedMeta.accentHex}44, transparent)`
                    : pax26?.border,
                }} />

                <div className="p-5 flex flex-col gap-4">
                  <p className="bl-syne text-sm font-bold" style={{ color: pax26?.textPrimary }}>
                    Order Summary
                  </p>

                  {/* No plan selected placeholder */}
                  {!selected && (
                    <div className="flex flex-col items-center justify-center py-6 gap-2">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                        style={{ background: `${GOLD}12`, color: GOLD }}>
                        <IconCrown size={22} />
                      </div>
                      <p className="text-xs text-center" style={{ color: pax26?.textSecondary, opacity: 0.5 }}>
                        Select a plan on the left to continue
                      </p>
                    </div>
                  )}

                  {/* Selected plan summary */}
                  {selected && selectedMeta && (
                    <>
                      {/* Plan row */}
                      <div className="flex items-center justify-between gap-3 rounded-xl px-4 py-3"
                        style={{ background: `${selectedMeta.accentHex}0D`, border: `1px solid ${selectedMeta.accentHex}22` }}>
                        <div className="flex items-center gap-2.5">
                          <span style={{ color: selectedMeta.accentHex }}>{selectedMeta.icon}</span>
                          <div>
                            <p className="text-sm font-semibold" style={{ color: pax26?.textPrimary }}>
                              {selectedMeta.label} Plan
                            </p>
                            <p className="bl-mono text-[10px]" style={{ color: pax26?.textSecondary, opacity: 0.5 }}>
                              {selectedMeta.messages}
                            </p>
                          </div>
                        </div>
                        <button
                          className="text-[10px] font-bold px-2 py-1 rounded-lg"
                          style={{ color: CORAL, background: `${CORAL}10`, border: `1px solid ${CORAL}20` }}
                          onClick={() => setSelected(null)}
                        >
                          ✕ Clear
                        </button>
                      </div>

                      {/* Price breakdown */}
                      <div className="flex flex-col gap-2">
                        <div className="flex justify-between text-xs" style={{ color: pax26?.textSecondary }}>
                          <span>Plan price</span>
                          <span className="bl-mono font-semibold" style={{ color: pax26?.textPrimary }}>
                            ₦{selectedMeta.price.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs" style={{ color: pax26?.textSecondary }}>
                          <span>Processing fee</span>
                          <span className="bl-mono font-semibold" style={{ color: GREEN }}>₦0.00</span>
                        </div>
                        <div className="h-px w-full" style={{ background: pax26?.border }} />
                        <div className="flex justify-between text-sm font-bold">
                          <span style={{ color: pax26?.textPrimary }}>Total</span>
                          <span className="bl-mono" style={{ color: selectedMeta.accentHex }}>
                            ₦{selectedMeta.price.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {/* Wallet info row */}
                      <div className="rounded-xl px-4 py-3 flex items-center justify-between gap-3"
                        style={{ background: pax26?.secondaryBg || `${pax26?.border}50`, border: `1px solid ${pax26?.border}` }}>
                        <div className="flex items-center gap-2">
                          <IconWallet size={14} style={{ color: pax26?.textSecondary }} />
                          <span className="text-xs" style={{ color: pax26?.textSecondary, opacity: 0.6 }}>Wallet</span>
                        </div>
                        <span className="bl-mono text-xs font-bold"
                          style={{ color: canAfford ? GREEN : CORAL }}>
                          ₦{userWallet?.toLocaleString("en-NG", { minimumFractionDigits: 2 }) || "0.00"}
                        </span>
                      </div>

                      {/* Insufficient funds warning */}
                      {!canAfford && (
                        <div className="rounded-xl px-4 py-3 text-xs leading-relaxed"
                          style={{ background: `${CORAL}0D`, border: `1px solid ${CORAL}25`, color: CORAL }}>
                          ⚠️ You need{" "}
                          <span className="bl-mono font-bold">₦{shortfall.toLocaleString()}</span>{" "}
                          more. Fund your wallet first.
                          <button
                            className="bl-btn block mt-2 w-full py-2 rounded-xl text-xs font-bold text-white"
                            style={{ background: pax26?.primary, boxShadow: `0 4px 14px ${pax26?.primary}40` }}
                            onClick={() => router.push("/fund-wallet")}
                          >
                            Fund Wallet →
                          </button>
                        </div>
                      )}

                      {/* Pay CTA */}
                      {canAfford && (
                        <button
                          id="billing-pay-btn"
                          className="bl-btn w-full flex items-center justify-center gap-2.5 py-3 rounded-xl text-sm font-bold text-white"
                          disabled={paying}
                          onClick={handleSubscribe}
                          style={{
                            background: `linear-gradient(135deg, ${selectedMeta.accentHex}, ${selectedMeta.accentHex}cc)`,
                            boxShadow: `0 8px 24px ${selectedMeta.accentHex}40`,
                          }}
                        >
                          {paying ? (
                            <><Spinner color="#fff" /> Processing…</>
                          ) : (
                            <>
                              <IconCrown size={16} />
                              Pay ₦{selectedMeta.price.toLocaleString()} · Activate Now
                              <IconArrow size={14} />
                            </>
                          )}
                        </button>
                      )}

                      <p className="text-center text-[10px]" style={{ color: pax26?.textSecondary, opacity: 0.4 }}>
                        Billed monthly · Cancel anytime
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
