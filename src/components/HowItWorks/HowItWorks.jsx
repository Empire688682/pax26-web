"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { useGlobalContext } from "../Context";
import { Wifi, Brain, Zap, Bot, ArrowRight, CheckCircle2 } from "lucide-react";

/* ── Keyframes + font ─────────────────────────────────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@1,700&family=Syne:wght@400;600;700;800&family=DM+Mono:wght@400;500&display=swap');

  .hw-root  { font-family: 'Syne', sans-serif; }
  .hw-serif { font-family: 'Playfair Display', serif; font-style: italic; }
  .hw-mono  { font-family: 'DM Mono', monospace; }

  @keyframes hw-glow   { 0%,100%{opacity:0.1} 50%{opacity:0.2} }
  @keyframes hw-dash   {
    from { stroke-dashoffset: 300; }
    to   { stroke-dashoffset: 0; }
  }
  @keyframes hw-float  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
  @keyframes hw-pulse  { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(0.75)} }

  .hw-glow  { animation: hw-glow  5s ease-in-out infinite; }
  .hw-float { animation: hw-float 4s ease-in-out infinite; }
  .hw-pulse { animation: hw-pulse 2s ease-in-out infinite; }

  .hw-connector.animated { animation: hw-dash 1s ease forwards; }

  .hw-card {
    transition: transform 0.25s ease, box-shadow 0.25s ease;
  }
  .hw-card:hover { transform: translateY(-5px); }
`;

const STEPS = [
  {
    icon: Wifi,
    color: "#22c55e",
    num: "01",
    title: "Connect WhatsApp",
    text: "Link your WhatsApp Business account via Meta's official Cloud API. Takes 2 minutes.",
    badge: "2 min setup",
  },
  {
    icon: Brain,
    color: "#38bdf8",
    num: "02",
    title: "Train Your AI",
    text: "Feed the AI your business info, products, FAQs and tone. It learns your brand instantly.",
    badge: "One-time setup",
  },
  {
    icon: Zap,
    color: "#f59e0b",
    num: "03",
    title: "Activate Automation",
    text: "Switch on follow-ups, auto-replies and lead qualification with a single toggle.",
    badge: "One click",
  },
  {
    icon: Bot,
    color: "#a78bfa",
    num: "04",
    title: "AI Replies Customers",
    text: "Sit back — your AI handles every message, qualifies leads and books sales 24/7.",
    badge: "Runs 24/7",
  },
];

export default function HowItWorks() {
  const { pax26 } = useGlobalContext();
  const ref    = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const primary = pax26?.primary || "#3b82f6";

  return (
    <>
      <style>{CSS}</style>
      <section ref={ref} className="hw-root relative overflow-hidden py-24 px-5"
        style={{ background: pax26?.bg }}>

        {/* bg orb */}
        <div className="hw-glow absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full pointer-events-none"
          style={{ background: primary, filter: "blur(140px)", opacity: 0.08 }} />

        <div className="relative max-w-5xl mx-auto">

          {/* ── Header ──────────────────────────────────── */}
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-5"
              style={{ background: `${primary}12`, border: `1px solid ${primary}28` }}>
              <CheckCircle2 size={12} style={{ color: primary }} />
              <span className="text-xs font-bold tracking-widest uppercase" style={{ color: primary }}>
                How It Works
              </span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-3xl md:text-5xl font-extrabold leading-tight mb-4"
              style={{ color: pax26?.textPrimary }}>
              Start automating{" "}
              <span className="hw-serif" style={{ color: primary }}>
                in minutes
              </span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-base max-w-xl mx-auto"
              style={{ color: pax26?.textSecondary, opacity: 0.65 }}>
              Four simple steps and your AI assistant is live — no code,
              no technical skills, no headaches.
            </motion.p>
          </div>

          {/* ── Steps ───────────────────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 relative">

            {/* connecting dashed line — desktop only */}
            <div className="absolute top-10 left-0 right-0 hidden lg:flex items-center px-16 pointer-events-none z-0">
              {[0, 1, 2].map((i) => (
                <div key={i} className="flex-1 flex items-center mx-4">
                  <div className="w-full border-t-2 border-dashed"
                    style={{ borderColor: `${primary}30` }} />
                  <ArrowRight size={14} style={{ color: `${primary}50`, flexShrink: 0, marginLeft: "-6px" }} />
                </div>
              ))}
            </div>

            {STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 28 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.55, delay: 0.25 + i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                  className="hw-card relative rounded-2xl p-6 overflow-hidden z-10"
                  style={{ background: pax26?.secondaryBg, border: `1px solid ${pax26?.border}` }}>

                  {/* top strip */}
                  <div className="absolute top-0 left-0 right-0 h-0.5"
                    style={{ background: `linear-gradient(90deg, ${step.color}, ${step.color}44, transparent)` }} />

                  {/* step number + icon */}
                  <div className="flex items-start justify-between mb-5">
                    <div className="relative">
                      {/* pulsing ring behind icon */}
                      {i === STEPS.length - 1 && (
                        <span className="hw-pulse absolute inset-0 rounded-2xl pointer-events-none"
                          style={{ background: `${step.color}20` }} />
                      )}
                      <div className="relative w-12 h-12 rounded-2xl flex items-center justify-center"
                        style={{ background: `${step.color}18`, color: step.color }}>
                        <Icon size={21} />
                      </div>
                    </div>

                    {/* step number */}
                    <span className="hw-mono text-3xl font-bold leading-none select-none"
                      style={{ color: step.color, opacity: 0.18 }}>
                      {step.num}
                    </span>
                  </div>

                  {/* title */}
                  <h3 className="text-sm font-extrabold mb-2"
                    style={{ color: pax26?.textPrimary }}>
                    {step.title}
                  </h3>

                  {/* description */}
                  <p className="text-xs leading-relaxed mb-4"
                    style={{ color: pax26?.textSecondary, opacity: 0.65 }}>
                    {step.text}
                  </p>

                  {/* badge */}
                  <span className="hw-mono text-[10px] font-bold px-2.5 py-1 rounded-full"
                    style={{
                      background: `${step.color}12`,
                      color: step.color,
                      border: `1px solid ${step.color}28`,
                    }}>
                    {step.badge}
                  </span>
                </motion.div>
              );
            })}
          </div>

          {/* ── Bottom result strip ─────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-3">
            {[
              { text: "No code required",          color: "#22c55e" },
              { text: "Live in under 5 minutes",   color: primary   },
              { text: "Cancel anytime",             color: "#f59e0b" },
            ].map(({ text, color }) => (
              <div key={text} className="flex items-center gap-2 px-4 py-2 rounded-xl"
                style={{ background: pax26?.secondaryBg, border: `1px solid ${pax26?.border}` }}>
                <CheckCircle2 size={12} style={{ color }} />
                <span className="text-xs font-semibold" style={{ color: pax26?.textSecondary }}>
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