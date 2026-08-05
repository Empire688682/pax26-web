"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { useGlobalContext } from "../Context";
import {
  Store, Bot, MessageSquare, Package,
  Users, BarChart2, Bell, Zap, ArrowRight, CheckCircle2,
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

/* ── Feature config ───────────────────────────────────────────── */
const FEATURES = [
  {
    icon: Store,
    color: "#22c55e",
    name: "Online Storefront",
    desc: "Display your products beautifully and let customers order on WhatsApp.",
    detail: "No code required",
  },
  {
    icon: Bot,
    color: "#38bdf8",
    name: "AI Sales Agent",
    desc: "Reply to customers instantly — even while you sleep.",
    detail: "Powered by PaxAI",
  },
  {
    icon: MessageSquare,
    color: "#a78bfa",
    name: "WhatsApp Automation",
    desc: "Smart conversation flows that guide customers from first message to order.",
    detail: "Official Meta API",
  },
  {
    icon: Package,
    color: "#f59e0b",
    name: "Product Catalog",
    desc: "Add unlimited products with images, prices and descriptions in minutes.",
    detail: "Unlimited products",
  },
  {
    icon: Users,
    color: "#f472b6",
    name: "Lead Follow-up",
    desc: "Automatically re-engage cold leads so no sale slips through.",
    detail: "Auto-sequences",
  },
  {
    icon: BarChart2,
    color: "#fb923c",
    name: "Sales Analytics",
    desc: "See conversations, orders and revenue — all in one clean dashboard.",
    detail: "Real-time insights",
  },
];

/* ── Feature card ─────────────────────────────────────────────── */
function FeatureCard({ feature, index, pax26, inView }) {
  const Icon = feature.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 22 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
      className="ut-card relative rounded-2xl p-5 flex flex-col gap-3 overflow-hidden"
      style={{
        background: pax26?.bg,
        border: `1px solid ${pax26?.border}`,
      }}>

      {/* corner glow */}
      <div className="ut-glow absolute -top-5 -right-5 w-20 h-20 rounded-full pointer-events-none"
        style={{ background: feature.color, filter: "blur(24px)" }} />

      {/* top strip */}
      <div className="absolute top-0 left-0 right-0 h-0.5"
        style={{ background: `linear-gradient(90deg, ${feature.color}, ${feature.color}44, transparent)` }} />

      {/* icon */}
      <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: `${feature.color}18`, color: feature.color }}>
        <Icon size={20} />
      </div>

      {/* text */}
      <div className="flex-1">
        <p className="text-sm font-extrabold mb-1" style={{ color: pax26?.textPrimary }}>
          {feature.name}
        </p>
        <p className="text-xs leading-relaxed" style={{ color: pax26?.textSecondary, opacity: 0.65 }}>
          {feature.desc}
        </p>
      </div>

      {/* detail chip */}
      <div className="h-px" style={{ background: pax26?.border }} />
      <div className="flex items-center justify-between">
        <span className="ut-mono text-[10px]" style={{ color: pax26?.textSecondary, opacity: 0.45 }}>
          {feature.detail}
        </span>
        <ArrowRight size={13} className="ut-arrow" style={{ color: feature.color }} />
      </div>
    </motion.div>
  );
}

/* ── Main section ─────────────────────────────────────────────── */
export default function Utilities() {
  const { pax26 } = useGlobalContext();
  const ref = useRef(null);
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
                All the tools you need
              </span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-3xl md:text-5xl font-extrabold leading-tight mb-4"
              style={{ color: pax26?.textPrimary }}>
              Everything you need to{" "}
              <span className="ut-serif" style={{ color: primary }}>sell on WhatsApp</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-base max-w-xl mx-auto"
              style={{ color: pax26?.textSecondary, opacity: 0.65 }}>
              From storefront to sale — Pax26 gives you every tool to build,
              automate and grow your WhatsApp business.
            </motion.p>
          </div>

          {/* ── Features grid ───────────────────────────── */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4 mb-10">
            {FEATURES.map((f, i) => (
              <FeatureCard
                key={i}
                feature={f}
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
              { text: "No code required", color: "#22c55e" },
              { text: "Live in 5 minutes", color: primary },
              { text: "Official WhatsApp API", color: "#25D366" },
              { text: "24/7 automation", color: "#38bdf8" },
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
