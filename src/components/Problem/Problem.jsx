"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { useGlobalContext } from "../Context";
import {
  X, CheckCircle2, Clock, MessageCircle,
  TrendingDown, AlertCircle, Zap, Bot, TrendingUp, Users,
} from "lucide-react";

/* ── Keyframes + font ─────────────────────────────────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@1,700&family=Syne:wght@400;600;700;800&display=swap');

  .pb-root  { font-family: 'Syne', sans-serif; }
  .pb-serif { font-family: 'Playfair Display', serif; font-style: italic; }

  @keyframes pb-glow { 0%,100%{opacity:0.1} 50%{opacity:0.2} }
  .pb-glow { animation: pb-glow 5s ease-in-out infinite; }

  .pb-card { transition: transform 0.22s ease; }
  .pb-card:hover { transform: translateY(-3px); }
`;

const PROBLEMS = [
  { icon: Clock,         text: "Replying customers manually all day — no time to actually run your business." },
  { icon: AlertCircle,   text: "Forgetting to follow up on warm leads and losing sales you already earned."  },
  { icon: TrendingDown,  text: "Slow response times that push customers straight to your competitors."       },
  { icon: MessageCircle, text: "Missed messages at night, weekends and public holidays."                     },
];

const SOLUTIONS = [
  { icon: Bot,         text: "AI replies to every customer instantly — 24/7, no days off."           },
  { icon: Zap,         text: "Automated follow-ups re-engage leads before they go cold."              },
  { icon: TrendingUp,  text: "Sub-second response times that make your brand look ultra-professional." },
  { icon: Users,       text: "Never miss a message — holidays, nights, weekends all covered."          },
];

const RED   = "#ef4444";
const GREEN = "#22c55e";

function ProblemCard({ icon: Icon, text, pax26 }) {
  return (
    <div className="pb-card flex items-start gap-3.5 p-4 rounded-2xl"
      style={{ background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.15)" }}>
      <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
        style={{ background: "rgba(239,68,68,0.1)", color: RED }}>
        <Icon size={15} />
      </div>
      <p className="text-sm leading-relaxed" style={{ color: pax26?.textSecondary, opacity: 0.75 }}>
        {text}
      </p>
    </div>
  );
}

function SolutionCard({ icon: Icon, text, pax26 }) {
  return (
    <div className="pb-card flex items-start gap-3.5 p-4 rounded-2xl"
      style={{ background: "rgba(34,197,94,0.05)", border: "1px solid rgba(34,197,94,0.15)" }}>
      <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
        style={{ background: "rgba(34,197,94,0.12)", color: GREEN }}>
        <Icon size={15} />
      </div>
      <p className="text-sm leading-relaxed" style={{ color: pax26?.textSecondary, opacity: 0.75 }}>
        {text}
      </p>
    </div>
  );
}

export default function Problem() {
  const { pax26 } = useGlobalContext();
  const ref    = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const primary = pax26?.primary || "#3b82f6";

  return (
    <>
      <style>{CSS}</style>
      <section ref={ref} className="pb-root relative overflow-hidden py-24 px-5"
        style={{ background: pax26?.bg }}>

        {/* background orbs */}
        <div className="pb-glow absolute -top-20 -left-20 w-72 h-72 rounded-full pointer-events-none"
          style={{ background: RED, filter: "blur(90px)" }} />
        <div className="pb-glow absolute -bottom-20 -right-20 w-72 h-72 rounded-full pointer-events-none"
          style={{ background: GREEN, filter: "blur(90px)" }} />

        {/* subtle grid */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(${pax26?.textPrimary || "#000"} 1px, transparent 1px),
                              linear-gradient(90deg, ${pax26?.textPrimary || "#000"} 1px, transparent 1px)`,
            backgroundSize: "48px 48px",
          }} />

        <div className="relative max-w-5xl mx-auto">

          {/* ── Header ──────────────────────────────────── */}
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-5"
              style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
              <X size={12} color={RED} />
              <span className="text-xs font-bold tracking-widest uppercase" style={{ color: RED }}>
                The Problem
              </span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-3xl md:text-5xl font-extrabold leading-tight mb-4"
              style={{ color: pax26?.textPrimary }}>
              Managing WhatsApp manually{" "}
              <span className="pb-serif block" style={{ color: RED }}>
                is killing your growth
              </span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-base max-w-xl mx-auto"
              style={{ color: pax26?.textSecondary, opacity: 0.65 }}>
              Most businesses lose customers not because of bad products — but because
              of slow, inconsistent, manual WhatsApp handling.
            </motion.p>
          </div>

          {/* ── Before / After columns ──────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* WITHOUT PAX26 */}
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.25 }}>

              <div className="flex items-center gap-3 mb-4 px-4 py-3 rounded-2xl"
                style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)" }}>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: "rgba(239,68,68,0.12)", color: RED }}>
                  <X size={16} />
                </div>
                <div>
                  <p className="text-sm font-bold" style={{ color: RED }}>Without Pax26</p>
                  <p className="text-xs" style={{ color: pax26?.textSecondary, opacity: 0.5 }}>
                    Manual, slow, inconsistent
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {PROBLEMS.map((p, i) => (
                  <motion.div key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.4, delay: 0.3 + i * 0.07 }}>
                    <ProblemCard {...p} pax26={pax26} />
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* WITH PAX26 */}
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.35 }}>

              <div className="flex items-center gap-3 mb-4 px-4 py-3 rounded-2xl"
                style={{ background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.18)" }}>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: "rgba(34,197,94,0.12)", color: GREEN }}>
                  <CheckCircle2 size={16} />
                </div>
                <div>
                  <p className="text-sm font-bold" style={{ color: GREEN }}>With Pax26</p>
                  <p className="text-xs" style={{ color: pax26?.textSecondary, opacity: 0.5 }}>
                    Automated, instant, always-on
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {SOLUTIONS.map((s, i) => (
                  <motion.div key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.4, delay: 0.4 + i * 0.07 }}>
                    <SolutionCard {...s} pax26={pax26} />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* ── Bottom nudge ────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.75 }}
            className="mt-12 flex items-center justify-center">
            <div className="flex items-center gap-2 px-5 py-3 rounded-xl"
              style={{ background: `${primary}0C`, border: `1px solid ${primary}25` }}>
              <Zap size={14} style={{ color: primary }} />
              <span className="text-xs font-semibold" style={{ color: primary }}>
                Switch to Pax26 — setup takes under 5 minutes
              </span>
            </div>
          </motion.div>

        </div>
      </section>
    </>
  );
}