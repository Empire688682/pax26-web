"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { useGlobalContext } from "../Context";
import { ArrowRight, CheckCircle2, Bot, Zap, MessageCircle } from "lucide-react";

/* ── Keyframes + font ─────────────────────────────────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@1,700;1,900&family=Syne:wght@400;600;700;800&display=swap');

  .ct-root  { font-family: 'Syne', sans-serif; }
  .ct-serif { font-family: 'Playfair Display', serif; font-style: italic; }

  @keyframes ct-float-1 { 0%,100%{transform:translateY(0) rotate(0deg)}   50%{transform:translateY(-14px) rotate(3deg)} }
  @keyframes ct-float-2 { 0%,100%{transform:translateY(0) rotate(0deg)}   50%{transform:translateY(12px) rotate(-2deg)} }
  @keyframes ct-float-3 { 0%,100%{transform:translateY(0)}                  50%{transform:translateY(-10px)} }
  @keyframes ct-pulse   { 0%,100%{opacity:0.18; transform:scale(1)}        50%{opacity:0.32; transform:scale(1.05)} }
  @keyframes ct-blink   { 0%,100%{opacity:1} 50%{opacity:0.3} }
  @keyframes ct-shine   {
    0%   { left:-100%; }
    100% { left: 200%; }
  }

  .ct-orb-1  { animation: ct-float-1 8s ease-in-out infinite; }
  .ct-orb-2  { animation: ct-float-2 10s ease-in-out infinite; }
  .ct-orb-3  { animation: ct-float-3 6s ease-in-out infinite; }
  .ct-pulse  { animation: ct-pulse 4s ease-in-out infinite; }
  .ct-blink  { animation: ct-blink 1.8s ease-in-out infinite; }

  .ct-btn-primary {
    position: relative;
    overflow: hidden;
    transition: opacity 0.18s ease, transform 0.18s ease, box-shadow 0.18s ease;
  }
  .ct-btn-primary::after {
    content: '';
    position: absolute;
    top: 0; left: -100%; width: 60%; height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent);
    transform: skewX(-20deg);
  }
  .ct-btn-primary:hover { opacity: 0.9; transform: translateY(-2px); }
  .ct-btn-primary:hover::after { animation: ct-shine 0.6s ease forwards; }

  .ct-btn-ghost {
    transition: background 0.18s ease, transform 0.18s ease;
  }
  .ct-btn-ghost:hover { transform: translateY(-2px); }

  /* floating badge */
  .ct-badge {
    transition: transform 0.22s ease;
  }
  .ct-badge:hover { transform: translateY(-3px) scale(1.03); }
`;

/* ── Floating icon badge ──────────────────────────────────────── */
function FloatingBadge({ icon: Icon, label, color, className, style }) {
  return (
    <div
      className={`ct-badge absolute hidden lg:flex items-center gap-2 px-3 py-2 rounded-xl shadow-lg pointer-events-none ${className}`}
      style={{ background: "rgba(255,255,255,0.92)", backdropFilter: "blur(8px)", border: "1px solid rgba(0,0,0,0.06)", ...style }}>
      <div className="w-6 h-6 rounded-lg flex items-center justify-center"
        style={{ background: `${color}18`, color }}>
        <Icon size={13} />
      </div>
      <span style={{ fontFamily: "'Syne',sans-serif", fontSize: "11px", fontWeight: 700, color: "#111827" }}>
        {label}
      </span>
    </div>
  );
}

/* ── Main CTA ─────────────────────────────────────────────────── */
export default function CTA() {
  const { openModal, pax26 } = useGlobalContext();
  const ref    = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const primary = pax26?.primary || "#3b82f6";
  const GREEN   = "#22c55e";

  return (
    <>
      <style>{CSS}</style>
      <section ref={ref}
        className="ct-root relative overflow-hidden py-28 px-5"
        style={{ background: pax26?.secondaryBg }}>

        {/* ── Atmospheric background ──────────────────── */}
        <div className="absolute inset-0 pointer-events-none">
          {/* grid */}
          <div className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `linear-gradient(${pax26?.textPrimary || "#000"} 1px, transparent 1px),
                                linear-gradient(90deg, ${pax26?.textPrimary || "#000"} 1px, transparent 1px)`,
              backgroundSize: "48px 48px",
            }} />
          {/* orbs */}
          <div className="ct-orb-1 ct-pulse absolute -top-24 -left-24 w-[500px] h-[500px] rounded-full"
            style={{ background: primary, filter: "blur(100px)", opacity: 0.18 }} />
          <div className="ct-orb-2 ct-pulse absolute -bottom-24 -right-24 w-[400px] h-[400px] rounded-full"
            style={{ background: GREEN, filter: "blur(90px)", opacity: 0.14 }} />
          <div className="ct-orb-3 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[300px] rounded-full"
            style={{ background: primary, filter: "blur(130px)", opacity: 0.07 }} />
        </div>

        {/* ── Floating badges (decorative) ────────────── */}
        <FloatingBadge icon={Bot}           label="AI is replying…"     color={primary} className="ct-orb-1 top-16 left-16" />
        <FloatingBadge icon={MessageCircle} label="124 chats handled"   color={GREEN}   className="ct-orb-3 top-24 right-20" />
        <FloatingBadge icon={Zap}           label="0.3s response time"  color="#f59e0b" className="ct-orb-2 bottom-20 left-20" />

        {/* ── Content ─────────────────────────────────── */}
        <div className="relative max-w-3xl mx-auto text-center">

          {/* eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-7"
            style={{ background: `${primary}12`, border: `1px solid ${primary}28` }}>
            <span className="ct-blink w-2 h-2 rounded-full block" style={{ background: GREEN }} />
            <span className="text-xs font-bold tracking-widest uppercase" style={{ color: primary }}>
              Start today — it's free
            </span>
          </motion.div>

          {/* headline */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}>
            <h2 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6"
              style={{ color: pax26?.textPrimary }}>
              Let AI handle your{" "}
              <span className="ct-serif block" style={{ color: primary }}>
                customer conversations
              </span>
            </h2>
          </motion.div>

          {/* sub */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="text-base md:text-lg leading-relaxed mb-10 max-w-xl mx-auto"
            style={{ color: pax26?.textSecondary, opacity: 0.7 }}>
            Join 2,000+ Nigerian businesses that automated their WhatsApp with Pax26.
            Set up in under 5 minutes. No code required.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.55, delay: 0.35 }}
            className="flex flex-wrap gap-4 justify-center mb-10">
            <button
              onClick={() => openModal("register")}
              className="ct-btn-primary flex items-center gap-2 px-8 py-4 rounded-2xl text-base font-bold text-white"
              style={{
                background: `linear-gradient(135deg, ${primary}, ${pax26?.btn || primary})`,
                boxShadow: `0 16px 48px ${primary}45`,
              }}>
              Create Free Account <ArrowRight size={17} />
            </button>

            <button
              onClick={() => openModal("login")}
              className="ct-btn-ghost flex items-center gap-2 px-7 py-4 rounded-2xl text-sm font-bold"
              style={{
                color: pax26?.textPrimary,
                border: `1px solid ${pax26?.border}`,
                background: "transparent",
              }}>
              I already have an account
            </button>
          </motion.div>

          {/* reassurance chips */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="flex flex-wrap items-center justify-center gap-5">
            {[
              "No credit card required",
              "Cancel anytime",
              "Live in 5 minutes",
              "Nigerian Naira billing",
            ].map((t) => (
              <div key={t} className="flex items-center gap-1.5">
                <CheckCircle2 size={13} style={{ color: GREEN }} />
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