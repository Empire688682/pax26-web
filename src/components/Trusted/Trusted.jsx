"use client";

import { useRef, useEffect, useState } from "react";
import { useInView } from "framer-motion";
import { useGlobalContext } from "../Context";
import { MessageCircle, Building2, Clock, TrendingUp, Star, ShieldCheck } from "lucide-react";

/* ── Keyframes + font ─────────────────────────────────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@1,700&family=Syne:wght@400;600;700;800&display=swap');

  .tr-root  { font-family: 'Syne', sans-serif; }
  .tr-serif { font-family: 'Playfair Display', serif; font-style: italic; }

  @keyframes tr-slide {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes tr-glow {
    0%,100% { opacity: 0.12; }
    50%     { opacity: 0.22; }
  }
  @keyframes tr-float {
    0%,100% { transform: translateY(0); }
    50%     { transform: translateY(-8px); }
  }

  .tr-s1 { animation: tr-slide 0.5s ease both; }
  .tr-s2 { animation: tr-slide 0.5s ease 0.1s both; }
  .tr-s3 { animation: tr-slide 0.5s ease 0.2s both; }
  .tr-glow  { animation: tr-glow  5s ease-in-out infinite; }
  .tr-float { animation: tr-float 6s ease-in-out infinite; }

  .tr-stat-card {
    transition: transform 0.25s ease, box-shadow 0.25s ease;
  }
  .tr-stat-card:hover {
    transform: translateY(-4px);
  }
`;

/* ── Animated counter ─────────────────────────────────────────── */
function useCounter(target, duration = 1800, started = false) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!started) return;
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      // ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [started, target, duration]);

  return count;
}

/* ── Stat card ────────────────────────────────────────────────── */
function StatCard({ icon: Icon, color, countTarget, suffix, prefix, label, sub, delay, pax26, started }) {
  const count = useCounter(countTarget, 1800, started);
  const displayValue = countTarget === null
    ? suffix   // static value like "24/7"
    : `${prefix || ""}${count.toLocaleString()}${suffix || ""}`;

  return (
    <div
      className="tr-stat-card relative rounded-2xl p-7 overflow-hidden"
      style={{
        background: pax26?.bg,
        border: `1px solid ${pax26?.border}`,
        animationDelay: delay,
      }}
    >
      {/* corner glow */}
      <div className="tr-glow absolute -top-6 -right-6 w-28 h-28 rounded-full pointer-events-none"
        style={{ background: color, filter: "blur(30px)" }} />

      {/* icon */}
      <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-5"
        style={{ background: `${color}15`, color }}>
        <Icon size={20} />
      </div>

      {/* number */}
      <p className="text-4xl font-extrabold leading-none mb-2"
        style={{ color: pax26?.textPrimary, fontFamily: "'Syne', sans-serif" }}>
        {displayValue}
      </p>

      {/* label */}
      <p className="text-sm font-semibold mb-1" style={{ color: pax26?.textPrimary }}>
        {label}
      </p>

      {/* sub */}
      {sub && (
        <p className="text-xs leading-relaxed" style={{ color: pax26?.textSecondary, opacity: 0.55 }}>
          {sub}
        </p>
      )}
    </div>
  );
}

/* ── Trust badge ──────────────────────────────────────────────── */
function TrustBadge({ icon: Icon, text, color, pax26 }) {
  return (
    <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl"
      style={{ background: pax26?.bg, border: `1px solid ${pax26?.border}` }}>
      <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: `${color}14`, color }}>
        <Icon size={14} />
      </div>
      <span className="text-xs font-semibold" style={{ color: pax26?.textSecondary }}>
        {text}
      </span>
    </div>
  );
}

/* ── Main component ───────────────────────────────────────────── */
export default function Trusted() {
  const { pax26 } = useGlobalContext();
  const sectionRef = useRef(null);
  const inView = useInView(sectionRef, { once: true, margin: "-80px" });

  const primary = pax26?.primary || "#3b82f6";
  const GREEN   = "#22c55e";
  const AMBER   = "#f59e0b";
  const TEAL    = "#38bdf8";
  const VIOLET  = "#a78bfa";

  const stats = [
    {
      icon: MessageCircle, color: GREEN,
      countTarget: 10000, suffix: "+",
      label: "Automated Conversations",
      sub: "Messages handled by AI every day without human intervention",
      delay: "0s",
    },
    {
      icon: Building2, color: primary,
      countTarget: 2000, suffix: "+",
      label: "Businesses Onboarded",
      sub: "From solo shops to growing SMEs across Nigeria",
      delay: "0.1s",
    },
    {
      icon: Clock, color: AMBER,
      countTarget: null, suffix: "24/7",
      label: "AI Customer Support",
      sub: "Replies don't stop when you sleep — your AI stays live",
      delay: "0.2s",
    },
    {
      icon: TrendingUp, color: TEAL,
      countTarget: 98, suffix: "%",
      label: "Response Rate",
      sub: "Near-perfect reply rate on every incoming WhatsApp message",
      delay: "0.3s",
    },
  ];

  const badges = [
    { icon: ShieldCheck, text: "WhatsApp Cloud API",  color: GREEN   },
    { icon: Star,        text: "5-star rated",         color: AMBER   },
    { icon: ShieldCheck, text: "Bank-grade security",  color: primary },
    { icon: TrendingUp,  text: "99.9% uptime",         color: TEAL    },
  ];

  return (
    <>
      <style>{CSS}</style>
      <section
        ref={sectionRef}
        className="tr-root relative overflow-hidden py-24 px-5"
        style={{ background: pax26?.secondaryBg }}
      >
        {/* ── Background orb ──────────────────────────── */}
        <div className="tr-glow absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] rounded-full pointer-events-none"
          style={{ background: primary, filter: "blur(120px)", opacity: 0.1 }} />

        <div className="relative max-w-5xl mx-auto">

          {/* ── Header ────────────────────────────────── */}
          <div className="text-center mb-14">
            <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-5 ${inView ? "tr-s1" : "opacity-0"}`}
              style={{ background: `${primary}12`, border: `1px solid ${primary}28` }}>
              <span className="text-xs font-bold tracking-widest uppercase" style={{ color: primary }}>
                Trusted by businesses
              </span>
            </div>

            <h2 className={`text-3xl md:text-5xl font-extrabold leading-tight mb-4 ${inView ? "tr-s2" : "opacity-0"}`}
              style={{ color: pax26?.textPrimary }}>
              Built for{" "}
              <span className="tr-serif" style={{ color: primary }}>modern businesses</span>
            </h2>

            <p className={`text-base max-w-xl mx-auto ${inView ? "tr-s3" : "opacity-0"}`}
              style={{ color: pax26?.textSecondary, opacity: 0.65 }}>
              Thousands of Nigerian businesses use Pax26 to automate customer
              conversations, manage payments, and grow revenue around the clock.
            </p>
          </div>

          {/* ── Stats grid ────────────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            {stats.map((s, i) => (
              <StatCard key={i} {...s} pax26={pax26} started={inView} />
            ))}
          </div>

          {/* ── Trust badges strip ────────────────────── */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            {badges.map((b, i) => (
              <TrustBadge key={i} {...b} pax26={pax26} />
            ))}
          </div>

        </div>
      </section>
    </>
  );
}