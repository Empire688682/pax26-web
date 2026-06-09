"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import { useGlobalContext } from "../Context";
import { CheckCircle2, Zap, Crown, Sparkles, ArrowRight, AlertCircle, ShoppingBag } from "lucide-react";

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

  .p-disabled { filter: grayscale(1); opacity: 0.7; pointer-events: none; }
`;

const ICON_MAP = {
  starter: Zap,
  business: Sparkles,
  enterprise: Crown,
  default: ShoppingBag
};

/* ── Plan card ────────────────────────────────────────────────── */
function PlanCard({ plan, index, pax26, inView }) {
  const { openModal } = useGlobalContext();
  const primary = pax26?.primary || "#3b82f6";
  const accent = plan.accentHex || (plan.popular ? primary : pax26?.textPrimary);
  const Icon = ICON_MAP[plan.key] || ICON_MAP.default;

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay: index * 0.12, ease: [0.22, 1, 0.36, 1] }}
      className={`relative flex flex-col rounded-2xl overflow-hidden ${plan.popular ? "pr-popular-card" : "pr-card"} ${!plan.isActive ? 'p-disabled' : ''}`}
      style={{
        background: pax26?.bg,
        border: `${plan.popular ? "2px" : "1px"} solid ${plan.popular ? accent : pax26?.border}`,
        boxShadow: plan.popular ? `0 0 0 1px ${accent}30, 0 24px 60px ${accent}20` : "none",
      }}>

      {/* popular glow orb */}
      {plan.popular && (
        <div className="pr-glow absolute -top-10 left-1/2 -translate-x-1/2 w-64 h-32 rounded-full pointer-events-none"
          style={{ background: accent, filter: "blur(40px)" }} />
      )}

      {/* top strip */}
      <div className="h-1 w-full"
        style={{ background: `linear-gradient(90deg, ${accent}, ${accent}88, transparent)` }} />

      {/* popular badge */}
      {plan.popular && (
        <div className="absolute -top-0 right-5 flex items-center gap-1.5 px-3 py-1.5 rounded-b-xl text-xs font-bold text-white z-10"
          style={{ background: accent, boxShadow: `0 4px 14px ${accent}50` }}>
          <Sparkles size={11} /> Most Popular
        </div>
      )}

      {!plan.isActive && (
        <div className="absolute top-4 left-4 bg-gray-900 text-white text-[10px] font-black px-2 py-1 rounded uppercase tracking-widest z-20">
          Maintenance
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
               ₦{plan.price.toLocaleString()}
            </span>
            <span className="text-sm mb-1" style={{ color: pax26?.textSecondary, opacity: 0.5 }}>
              / {plan.period}
            </span>
          </div>
          <p className="text-[10px] mt-1.5 font-medium" style={{ color: pax26?.textSecondary, opacity: 0.45 }}>* USD pricing coming soon</p>
        </div>

        {/* divider */}
        <div className="h-px mb-5" style={{ background: pax26?.border }} />

        {/* included features */}
        <ul className="space-y-2.5 flex-1 mb-6">
          {plan.features.map((f, i) => (
            <li key={i} className="flex items-start gap-2.5 text-xs font-medium"
              style={{ color: pax26?.textSecondary }}>
              <CheckCircle2 size={13} style={{ color: accent, flexShrink: 0, marginTop: "2px" }} />
              <span>{f}</span>
            </li>
          ))}
        </ul>

        {/* CTA button */}
        <button
          onClick={() => openModal("register")}
          disabled={!plan.isActive}
          className="pr-cta w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold mt-auto"
          style={
            plan.popular
              ? { background: accent, color: "#fff", boxShadow: `0 10px 28px ${accent}40` }
              : { background: pax26?.secondaryBg, color: pax26?.textPrimary, border: `1px solid ${pax26?.border}` }
          }>
          {plan.isActive ? (plan.key === 'free' ? 'Get Started' : 'Upgrade Now') : 'Coming Soon'} <ArrowRight size={14} />
        </button>
      </div>
    </motion.div>
  );
}

/* ── Main Pricing section ─────────────────────────────────────── */
export default function Pricing() {
  const { pax26 } = useGlobalContext();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const primary = pax26?.primary || "#3b82f6";

  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      setLoading(true);
      try {
        const adminUrl = process.env.NEXT_PUBLIC_ADMIN_URL;
        if (!adminUrl) {
            setLoading(false);
            return;
        }
        const res = await fetch(`${adminUrl}/plans`);
        if (!res.ok) {
            setLoading(false);
            return;
        }
        const data = await res.json();
        const plansList = Array.isArray(data) ? data : (data.data || data.plans || []);

        if (plansList.length > 0) {
          const mergedPlans = plansList.map((fetchedPlan) => {
            return {
              key: fetchedPlan.key,
              name: fetchedPlan.name || fetchedPlan.label,
              price: fetchedPlan.price || 0,
              period: fetchedPlan.period || "month",
              tagline: fetchedPlan.tagline || "",
              popular: fetchedPlan.popular || false,
              features: fetchedPlan.features || [],
              usersCount: fetchedPlan.usersCount || 0,
              isActive: fetchedPlan.isActive !== undefined ? fetchedPlan.isActive : true
            };
          });
          setPlans(mergedPlans);
        }
      } catch (err) {
        console.error("Error fetching plans:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 items-stretch">
            {loading ? (
                [1,2,3,4].map(i => (
                    <div key={i} className="h-96 rounded-2xl bg-gray-800/20 animate-pulse border border-gray-700/50" />
                ))
            ) : plans.length === 0 ? (
                <div className="col-span-full py-20 bg-gray-900/40 rounded-[32px] border border-gray-800/50 flex flex-col items-center text-center px-10">
                    <div className="w-20 h-20 rounded-3xl bg-amber-500/10 flex items-center justify-center mb-6 border border-amber-500/20">
                        <AlertCircle size={40} className="text-amber-500" />
                    </div>
                    <h3 className="text-2xl font-black mb-3 text-white">Subscription Engine Maintenance</h3>
                    <p className="text-gray-400 max-w-md mx-auto leading-relaxed">
                        We're currently updating our subscription plans to bring you better features. 
                        Please check back in a few minutes or contact support for manual upgrades.
                    </p>
                    <div className="mt-8 flex gap-4">
                        <button className="px-8 py-3 bg-white text-black font-black rounded-xl hover:bg-gray-200 transition-all">Contact Support</button>
                    </div>
                </div>
            ) : (
                plans.map((plan, i) => (
                    <PlanCard
                        key={i}
                        plan={plan}
                        index={i}
                        pax26={pax26}
                        inView={inView}
                    />
                ))
            )}
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