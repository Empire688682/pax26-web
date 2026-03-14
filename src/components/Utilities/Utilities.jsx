"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { useGlobalContext } from "../Context";
import {
  Phone, Database, Zap, Tv, Gift, Plus,
  ArrowRight, CheckCircle2,
} from "lucide-react";

/* ── Keyframes + font ─────────────────────────────────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@1,700&family=Syne:wght@400;600;700;800&family=DM+Mono:wght@400;500&display=swap');

  .ut-root  { font-family: 'Syne', sans-serif; }
  .ut-serif { font-family: 'Playfair Display', serif; font-style: italic; }
  .ut-mono  { font-family: 'DM Mono', monospace; }

  @keyframes ut-glow  { 0%,100%{opacity:0.1} 50%{opacity:0.2} }
  .ut-glow { animation: ut-glow 5s ease-in-out infinite; }

  .ut-card {
    transition: transform 0.22s ease, box-shadow 0.22s ease;
  }
  .ut-card:hover { transform: translateY(-5px); }

  .ut-arrow { transition: transform 0.18s ease; }
  .ut-card:hover .ut-arrow { transform: translateX(4px); }
`;

/* ── Service config ───────────────────────────────────────────── */
const SERVICES = [
  {
    icon:     Phone,
    color:    "#f97316",
    name:     "Airtime",
    desc:     "Recharge any network instantly",
    detail:   "MTN · Glo · Airtel · 9mobile",
    href:     "/dashboard/services/buy-airtime",
  },
  {
    icon:     Database,
    color:    "#38bdf8",
    name:     "Data",
    desc:     "Buy data for any number",
    detail:   "All networks supported",
    href:     "/dashboard/services/buy-data",
  },
  {
    icon:     Zap,
    color:    "#fbbf24",
    name:     "Electricity",
    desc:     "Pay bills & buy tokens",
    detail:   "Prepaid & Postpaid meters",
    href:     "/dashboard",
  },
  {
    icon:     Tv,
    color:    "#a78bfa",
    name:     "TV Subscription",
    desc:     "Renew your decoder",
    detail:   "DSTV · GOtv · Startimes",
    href:     "/dashboard/services/buy-tv",
  },
  {
    icon:     Gift,
    color:    "#f472b6",
    name:     "Gift Cards",
    desc:     "Buy & redeem gift cards",
    detail:   "iTunes · Amazon · Steam",
    href:     "/dashboard#VTU",
  },
  {
    icon:     Plus,
    color:    "#22c55e",
    name:     "More Coming",
    desc:     "New services launching soon",
    detail:   "Stay tuned for updates",
    href:     "#",
    soon:     true,
  },
];

/* ── Service card ─────────────────────────────────────────────── */
function ServiceCard({ service, index, pax26, inView }) {
  const Icon = service.icon;

  return (
    <motion.a
      href={service.soon ? undefined : service.href}
      initial={{ opacity: 0, y: 22 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
      className={`ut-card relative rounded-2xl p-5 flex flex-col gap-3 overflow-hidden ${service.soon ? "cursor-default" : "cursor-pointer"}`}
      style={{
        background: pax26?.bg,
        border:     `1px solid ${pax26?.border}`,
        textDecoration: "none",
        opacity:    service.soon ? 0.65 : 1,
      }}>

      {/* corner glow */}
      <div className="ut-glow absolute -top-5 -right-5 w-20 h-20 rounded-full pointer-events-none"
        style={{ background: service.color, filter: "blur(24px)" }} />

      {/* top strip */}
      <div className="absolute top-0 left-0 right-0 h-0.5"
        style={{ background: `linear-gradient(90deg, ${service.color}, ${service.color}44, transparent)` }} />

      {/* icon */}
      <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: `${service.color}18`, color: service.color }}>
        <Icon size={20} />
      </div>

      {/* text */}
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <p className="text-sm font-extrabold" style={{ color: pax26?.textPrimary }}>{service.name}</p>
          {service.soon && (
            <span className="ut-mono text-[9px] font-bold px-1.5 py-0.5 rounded-full"
              style={{ background: `${service.color}15`, color: service.color, border: `1px solid ${service.color}28` }}>
              SOON
            </span>
          )}
        </div>
        <p className="text-xs leading-relaxed" style={{ color: pax26?.textSecondary, opacity: 0.65 }}>
          {service.desc}
        </p>
      </div>

      {/* detail chip */}
      <div className="h-px" style={{ background: pax26?.border }} />
      <div className="flex items-center justify-between">
        <span className="ut-mono text-[10px]" style={{ color: pax26?.textSecondary, opacity: 0.45 }}>
          {service.detail}
        </span>
        {!service.soon && (
          <ArrowRight size={13} className="ut-arrow" style={{ color: service.color }} />
        )}
      </div>
    </motion.a>
  );
}

/* ── Main Utilities section ───────────────────────────────────── */
export default function Utilities() {
  const { pax26 } = useGlobalContext();
  const ref    = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const primary = pax26?.primary || "#3b82f6";

  return (
    <>
      <style>{CSS}</style>
      <section ref={ref}
        className="ut-root relative overflow-hidden py-24 px-5"
        style={{ background: pax26?.secondaryBg }}>

        {/* bg orb */}
        <div className="ut-glow absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] rounded-full pointer-events-none"
          style={{ background: primary, filter: "blur(130px)", opacity: 0.08 }} />

        <div className="relative max-w-5xl mx-auto">

          {/* ── Header ──────────────────────────────────── */}
          <div className="text-center mb-14">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-5"
              style={{ background: `${primary}12`, border: `1px solid ${primary}28` }}>
              <Zap size={12} style={{ color: primary }} />
              <span className="text-xs font-bold tracking-widest uppercase" style={{ color: primary }}>
                Digital Services
              </span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-3xl md:text-5xl font-extrabold leading-tight mb-4"
              style={{ color: pax26?.textPrimary }}>
              Everything else your{" "}
              <span className="ut-serif" style={{ color: primary }}>business needs</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-base max-w-xl mx-auto"
              style={{ color: pax26?.textSecondary, opacity: 0.65 }}>
              Beyond AI automation — Pax26 handles all your everyday digital utility payments
              in one place, instantly, from your wallet.
            </motion.p>
          </div>

          {/* ── Services grid ───────────────────────────── */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
            {SERVICES.map((s, i) => (
              <ServiceCard
                key={i}
                service={s}
                index={i}
                pax26={pax26}
                inView={inView}
              />
            ))}
          </div>

          {/* ── Bottom strip ────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="flex flex-wrap items-center justify-center gap-4">
            {[
              { text: "Instant delivery",    color: "#22c55e" },
              { text: "Wallet-powered",       color: primary   },
              { text: "All Nigerian networks",color: "#f97316" },
              { text: "24/7 availability",    color: "#38bdf8" },
            ].map(({ text, color }) => (
              <div key={text} className="flex items-center gap-2">
                <CheckCircle2 size={13} style={{ color }} />
                <span className="text-xs font-medium" style={{ color: pax26?.textSecondary, opacity: 0.55 }}>
                  {text}
                </span>
              </div>
            ))}
          </motion.div>

        </div>
      </section>
    </>
  );
}