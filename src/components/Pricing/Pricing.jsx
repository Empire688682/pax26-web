"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { useGlobalContext } from "../Context";
import { CheckCircle2, Zap, Crown, Sparkles, ArrowRight } from "lucide-react";

/* ── Keyframes + font ─────────────────────────────────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@1,700&family=Syne:wght@400;600;700;800&family=DM+Mono:wght@400;500&display=swap');

  .pr-root  { font-family: 'Syne', sans-serif; }
  .pr-serif { font-family: 'Playfair Display', serif; font-style: italic; }
  .pr-mono  { font-family: 'DM Mono', monospace; }

  @keyframes pr-glow   { 0%,100%{opacity:0.12} 50%{opacity:0.24} }
  @keyframes pr-shine  {
    0%   { left: -100%; }
    100% { left: 200%; }
  }

  .pr-glow { animation: pr-glow 4s ease-in-out infinite; }

  .pr-card {
    transition: transform 0.25s ease, box-shadow 0.25s ease;
  }
  .pr-card:hover { transform: translateY(-6px); }

  .pr-popular-card {
    transition: transform 0.25s ease, box-shadow 0.25s ease;
    transform: scale(1.04);
  }
  .pr-popular-card:hover { transform: scale(1.04) translateY(-6px); }

  .pr-cta {
    transition: opacity 0.18s ease, transform 0.18s ease;
    position: relative;
    overflow: hidden;
  }
  .pr-cta::after {
    content: '';
    position: absolute;
    top: 0; left: -100%; width: 60%; height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
    transform: skewX(-20deg);
  }
  .pr-cta:hover::after { animation: pr-shine 0.6s ease forwards; }
  .pr-cta:hover { opacity: 0.9; transform: translateY(-1px); }
  .pr-cta:disabled { opacity: 0.45; cursor: not-allowed; }
`;

/* ── Plan config ──────────────────────────────────────────────── */
const PLANS = [
  {
    name: "Starter",
    icon: Zap,
    price: "₦0",
    period: "/ month",
    tagline: "Perfect to get started",
    popular: false,
    cta: "Get Started Free",
    features: [
      "1 WhatsApp number",
      "Up to 500 AI replies/month",
      "Basic chatbot setup",
      "Airtime & Data VTU",
      "Email support",
    ],
    missing: [
      "Smart follow-up automation",
      "Lead qualification AI",
      "Priority support",
    ],
  },
  {
    name: "Growth",
    icon: Sparkles,
    price: "₦9,000",
    period: "/ month",
    tagline: "For growing businesses",
    popular: true,
    cta: "Start Growing",
    features: [
      "1 WhatsApp number",
      "Up to 5,000 AI replies/month",
      "Full AI chatbot + training",
      "Smart follow-up automation",
      "Lead qualification flows",
      "All VTU services",
      "Priority chat support",
    ],
    missing: [
      "Multiple WhatsApp numbers",
    ],
  },
  {
    name: "Business",
    icon: Crown,
    price: "₦25,000",
    period: "/ month",
    tagline: "For serious scaling",
    popular: false,
    cta: "Go Business",
    features: [
      "Up to 3 WhatsApp numbers",
      "Unlimited AI replies",
      "Full AI chatbot + training",
      "Smart follow-up automation",
      "Lead qualification flows",
      "All VTU services",
      "Custom automation workflows",
      "Dedicated account manager",
    ],
    missing: [],
  },
];

/* ── Plan card ────────────────────────────────────────────────── */
function PlanCard({ plan, index, pax26, inView }) {
  const { openModal } = useGlobalContext();
  const primary = pax26?.primary || "#3b82f6";
  const GOLD    = "#F59E0B";
  const accent  = plan.popular ? primary : pax26?.textPrimary;
  const Icon    = plan.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay: index * 0.12, ease: [0.22, 1, 0.36, 1] }}
      className={`relative flex flex-col rounded-2xl overflow-hidden ${plan.popular ? "pr-popular-card" : "pr-card"}`}
      style={{
        background: plan.popular ? pax26?.bg : pax26?.bg,
        border: `${plan.popular ? "2px" : "1px"} solid ${plan.popular ? primary : pax26?.border}`,
        boxShadow: plan.popular ? `0 0 0 1px ${primary}30, 0 24px 60px ${primary}20` : "none",
      }}>

      {/* popular glow orb */}
      {plan.popular && (
        <div className="pr-glow absolute -top-10 left-1/2 -translate-x-1/2 w-64 h-32 rounded-full pointer-events-none"
          style={{ background: primary, filter: "blur(40px)" }} />
      )}

      {/* top strip */}
      <div className="h-1 w-full"
        style={{ background: plan.popular ? `linear-gradient(90deg, ${primary}, ${primary}88, transparent)` : pax26?.border }} />

      {/* popular badge */}
      {plan.popular && (
        <div className="absolute -top-0 right-5 flex items-center gap-1.5 px-3 py-1.5 rounded-b-xl text-xs font-bold text-white z-10"
          style={{ background: primary, boxShadow: `0 4px 14px ${primary}50` }}>
          <Sparkles size={11} /> Most Popular
        </div>
      )}

      <div className="p-7 flex flex-col flex-1 relative z-10">

        {/* plan header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: `${accent}15`, color: accent }}>
            <Icon size={20} />
          </div>
          <div>
            <p className="text-sm font-extrabold" style={{ color: pax26?.textPrimary }}>{plan.name}</p>
            <p className="text-xs" style={{ color: pax26?.textSecondary, opacity: 0.55 }}>{plan.tagline}</p>
          </div>
        </div>

        {/* price */}
        <div className="mb-6">
          <div className="flex items-end gap-1.5">
            <span className="pr-mono text-4xl font-bold leading-none" style={{ color: pax26?.textPrimary }}>
              {plan.price}
            </span>
            <span className="text-sm mb-1" style={{ color: pax26?.textSecondary, opacity: 0.5 }}>
              {plan.period}
            </span>
          </div>
        </div>

        {/* divider */}
        <div className="h-px mb-5" style={{ background: pax26?.border }} />

        {/* included features */}
        <ul className="space-y-2.5 flex-1 mb-6">
          {plan.features.map((f, i) => (
            <li key={i} className="flex items-center gap-2.5 text-xs font-medium"
              style={{ color: pax26?.textSecondary }}>
              <CheckCircle2 size={13} style={{ color: plan.popular ? primary : "#22c55e", flexShrink: 0 }} />
              {f}
            </li>
          ))}
          {plan.missing.map((f, i) => (
            <li key={`x-${i}`} className="flex items-center gap-2.5 text-xs"
              style={{ color: pax26?.textSecondary, opacity: 0.3 }}>
              <div className="w-3.5 h-3.5 flex items-center justify-center flex-shrink-0">
                <div className="w-2.5 h-px rounded-full" style={{ background: pax26?.textSecondary }} />
              </div>
              {f}
            </li>
          ))}
        </ul>

        {/* CTA button */}
        <button
          onClick={() => openModal("register")}
          className="pr-cta w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold"
          style={
            plan.popular
              ? { background: primary, color: "#fff", boxShadow: `0 10px 28px ${primary}40` }
              : { background: pax26?.secondaryBg, color: pax26?.textPrimary, border: `1px solid ${pax26?.border}` }
          }>
          {plan.cta} <ArrowRight size={14} />
        </button>
      </div>
    </motion.div>
  );
}

/* ── Main Pricing section ─────────────────────────────────────── */
export default function Pricing() {
  const { pax26 } = useGlobalContext();
  const ref    = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const primary = pax26?.primary || "#3b82f6";

  return (
    <>
      <style>{CSS}</style>
      <section id="pricing" ref={ref}
        className="pr-root relative overflow-hidden py-24 px-5"
        style={{ background: pax26?.bg }}>

        {/* bg orbs */}
        <div className="pr-glow absolute -top-20 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full pointer-events-none"
          style={{ background: primary, filter: "blur(140px)", opacity: 0.08 }} />

        <div className="relative max-w-5xl mx-auto">

          {/* ── Header ──────────────────────────────────── */}
          <div className="text-center mb-14">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-5"
              style={{ background: `${primary}12`, border: `1px solid ${primary}28` }}>
              <Crown size={12} style={{ color: primary }} />
              <span className="text-xs font-bold tracking-widest uppercase" style={{ color: primary }}>
                Pricing
              </span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-3xl md:text-5xl font-extrabold leading-tight mb-4"
              style={{ color: pax26?.textPrimary }}>
              Simple,{" "}
              <span className="pr-serif" style={{ color: primary }}>transparent</span>
              {" "}pricing
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-base max-w-xl mx-auto"
              style={{ color: pax26?.textSecondary, opacity: 0.65 }}>
              No hidden fees. No surprises. Pick a plan and start automating today —
              upgrade or downgrade any time.
            </motion.p>
          </div>

          {/* ── Plans grid ──────────────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 items-start">
            {PLANS.map((plan, i) => (
              <PlanCard
                key={i}
                plan={plan}
                index={i}
                pax26={pax26}
                inView={inView}
              />
            ))}
          </div>

          {/* ── Bottom reassurance ──────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.65 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-4">
            {[
              "Cancel anytime",
              "No credit card for free plan",
              "Instant activation",
              "Nigerian Naira billing",
            ].map((t) => (
              <div key={t} className="flex items-center gap-2">
                <CheckCircle2 size={13} style={{ color: "#22c55e" }} />
                <span className="text-xs font-medium" style={{ color: pax26?.textSecondary, opacity: 0.55 }}>
                  {t}
                </span>
              </div>
            ))}
          </motion.div>

        </div>
      </section>
    </>
  );
}