"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { useGlobalContext } from "../Context";
import {
  MessageCircle, Brain, Zap, Users2,
  ArrowRight, CheckCircle2,
} from "lucide-react";

/* ── Keyframes + font ─────────────────────────────────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@1,700&family=Syne:wght@400;600;700;800&display=swap');

  .af-root  { font-family: 'Syne', sans-serif; }
  .af-serif { font-family: 'Playfair Display', serif; font-style: italic; }

  @keyframes af-glow { 0%,100%{opacity:0.12} 50%{opacity:0.22} }
  .af-glow { animation: af-glow 5s ease-in-out infinite; }

  .af-card {
    transition: transform 0.25s ease, box-shadow 0.25s ease;
    cursor: default;
  }
  .af-card:hover { transform: translateY(-5px); }

  .af-arrow { transition: transform 0.2s ease; }
  .af-card:hover .af-arrow { transform: translateX(4px); }
`;

/* ── Feature config ───────────────────────────────────────────── */
const FEATURES = [
  {
    icon: MessageCircle,
    color: "#22c55e",
    tag: "Core",
    title: "WhatsApp Automation",
    text: "Automatically respond to every customer message the moment it arrives — no delays, no missed chats, no manual effort.",
    bullets: ["Instant replies 24/7", "Custom triggers & keywords", "Handles 1000s of chats at once"],
  },
  {
    icon: Brain,
    color: "#38bdf8",
    tag: "AI-Powered",
    title: "AI Chatbot",
    text: "Train the AI once with your business info, tone and FAQs. It replies exactly like you would — on-brand, every time.",
    bullets: ["Learns your products & services", "Handles objections & FAQs", "Escalates complex queries to you"],
  },
  {
    icon: Zap,
    color: "#f59e0b",
    tag: "Automation",
    title: "Smart Follow-ups",
    text: "Automatically re-engage leads who went silent. Timed reminders and personalised follow-up sequences run while you sleep.",
    bullets: ["Multi-step follow-up flows", "Recovers cold leads automatically", "Timed to optimal engagement windows"],
  },
  {
    icon: Users2,
    color: "#a78bfa",
    tag: "Sales",
    title: "Lead Qualification",
    text: "AI asks the right questions before routing prospects to you — so every lead that lands in your inbox is already warm.",
    bullets: ["Pre-qualifies with smart questions", "Scores and ranks leads", "Sends only hot leads to your team"],
  },
];

function FeatureCard({ feature, index, pax26, inView }) {
  const { icon: Icon, color, tag, title, text, bullets } = feature;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      className="af-card relative rounded-2xl p-7 overflow-hidden"
      style={{ background: pax26?.bg, border: `1px solid ${pax26?.border}` }}>

      {/* corner glow */}
      <div className="af-glow absolute -top-8 -right-8 w-36 h-36 rounded-full pointer-events-none"
        style={{ background: color, filter: "blur(40px)" }} />

      {/* top row */}
      <div className="flex items-start justify-between gap-3 mb-5 relative z-10">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{ background: `${color}18`, color }}>
          <Icon size={22} />
        </div>
        <span className="text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full mt-1"
          style={{ background: `${color}12`, color, border: `1px solid ${color}28` }}>
          {tag}
        </span>
      </div>

      {/* title */}
      <h3 className="text-lg font-extrabold mb-2 relative z-10"
        style={{ color: pax26?.textPrimary }}>
        {title}
      </h3>

      {/* description */}
      <p className="text-sm leading-relaxed mb-5 relative z-10"
        style={{ color: pax26?.textSecondary, opacity: 0.7 }}>
        {text}
      </p>

      {/* divider */}
      <div className="h-px mb-5" style={{ background: pax26?.border }} />

      {/* bullet points */}
      <ul className="space-y-2 relative z-10">
        {bullets.map((b, i) => (
          <li key={i} className="flex items-center gap-2.5 text-xs font-medium"
            style={{ color: pax26?.textSecondary }}>
            <CheckCircle2 size={13} style={{ color, flexShrink: 0 }} />
            {b}
          </li>
        ))}
      </ul>

      {/* learn more */}
      <div className="flex items-center gap-1.5 mt-6 text-xs font-bold relative z-10" style={{ color }}>
        Learn more <ArrowRight size={12} className="af-arrow" />
      </div>
    </motion.div>
  );
}

export default function AutomationFeatures() {
  const { pax26 } = useGlobalContext();
  const ref    = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const primary = pax26?.primary || "#3b82f6";

  return (
    <>
      <style>{CSS}</style>
      <section ref={ref} className="af-root relative overflow-hidden py-24 px-5"
        style={{ background: pax26?.secondaryBg }}>

        {/* bg orb */}
        <div className="af-glow absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full pointer-events-none"
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
                Features
              </span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-3xl md:text-5xl font-extrabold leading-tight mb-4"
              style={{ color: pax26?.textPrimary }}>
              Everything you need to{" "}
              <span className="af-serif" style={{ color: primary }}>
                automate and grow
              </span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-base max-w-xl mx-auto"
              style={{ color: pax26?.textSecondary, opacity: 0.65 }}>
              From first reply to closed sale — Pax26 handles the entire
              customer journey automatically, so you can focus on growth.
            </motion.p>
          </div>

          {/* ── Feature cards grid ──────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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

        </div>
      </section>
    </>
  );
}