"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { useGlobalContext } from "../Context";
import { Star, Quote } from "lucide-react";

/* ── Keyframes + font ─────────────────────────────────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@1,700&family=Syne:wght@400;600;700;800&family=DM+Mono:wght@400;500&display=swap');

  .tm-root  { font-family: 'Syne', sans-serif; }
  .tm-serif { font-family: 'Playfair Display', serif; font-style: italic; }
  .tm-mono  { font-family: 'DM Mono', monospace; }

  @keyframes tm-glow   { 0%,100%{opacity:0.1} 50%{opacity:0.2} }
  @keyframes tm-marquee{ from{transform:translateX(0)} to{transform:translateX(-50%)} }

  .tm-glow { animation: tm-glow 5s ease-in-out infinite; }

  .tm-scroll {
    animation: tm-marquee 28s linear infinite;
    width: max-content;
  }
  .tm-scroll:hover { animation-play-state: paused; }

  .tm-card {
    transition: transform 0.22s ease, box-shadow 0.22s ease;
  }
  .tm-card:hover { transform: translateY(-4px); }
`;

/* ── Testimonial data ─────────────────────────────────────────── */
const TESTIMONIALS = [
  {
    name:   "Adaeze Okonkwo",
    role:   "Online Fashion Store Owner",
    avatar: "AO",
    color:  "#f472b6",
    stars:  5,
    text:   "Pax26 AI replies my customers automatically on WhatsApp. It saves me hours every day and I've never missed a sale since I activated it.",
  },
  {
    name:   "Chukwuemeka Nwosu",
    role:   "Electronics Retailer, Lagos",
    avatar: "CN",
    color:  "#38bdf8",
    stars:  5,
    text:   "The follow-up automation is insane. Leads that ghosted me started responding after the AI sent them a personalised message. My conversion rate went up 40%.",
  },
  {
    name:   "Fatima Aliyu",
    role:   "Real Estate Agent, Abuja",
    avatar: "FA",
    color:  "#f59e0b",
    stars:  5,
    text:   "I was spending 6 hours a day on WhatsApp. Now my AI handles all enquiries and I only step in when there's a serious buyer. It changed my business completely.",
  },
  {
    name:   "Tunde Babatunde",
    role:   "Digital Marketing Agency",
    avatar: "TB",
    color:  "#a78bfa",
    stars:  5,
    text:   "We use Pax26 for all our clients. The lead qualification flow alone is worth the subscription — it pre-screens prospects so our sales calls are actually useful.",
  },
  {
    name:   "Blessing Eze",
    role:   "Restaurant & Catering Business",
    avatar: "BE",
    color:  "#22c55e",
    stars:  5,
    text:   "Customers book tables and place catering orders through WhatsApp 24/7 now. The AI handles reservations perfectly and sends confirmation messages automatically.",
  },
  {
    name:   "Ibrahim Musa",
    role:   "Logistics Company, Kano",
    avatar: "IM",
    color:  "#f97316",
    stars:  5,
    text:   "Tracking updates, pickup confirmations, delivery notifications — all automated via WhatsApp. Our customer complaints dropped by 60% in the first month.",
  },
];

/* ── Stars ────────────────────────────────────────────────────── */
function Stars({ count, color }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} size={13} fill={i < count ? color : "transparent"}
          style={{ color: i < count ? color : "rgba(0,0,0,0.15)" }} />
      ))}
    </div>
  );
}

/* ── Single testimonial card ──────────────────────────────────── */
function TestimonialCard({ t, pax26, style }) {
  return (
    <div className="tm-card rounded-2xl p-6 flex flex-col gap-4 w-80 flex-shrink-0"
      style={{ background: pax26?.bg, border: `1px solid ${pax26?.border}`, ...style }}>

      {/* quote icon */}
      <div className="w-8 h-8 rounded-xl flex items-center justify-center"
        style={{ background: `${t.color}12`, color: t.color }}>
        <Quote size={14} />
      </div>

      {/* text */}
      <p className="text-sm leading-relaxed flex-1"
        style={{ color: pax26?.textSecondary, opacity: 0.8 }}>
        "{t.text}"
      </p>

      {/* divider */}
      <div className="h-px" style={{ background: pax26?.border }} />

      {/* author */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
          style={{ background: `${t.color}20`, color: t.color }}>
          {t.avatar}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold truncate" style={{ color: pax26?.textPrimary }}>{t.name}</p>
          <p className="text-[10px] truncate" style={{ color: pax26?.textSecondary, opacity: 0.5 }}>{t.role}</p>
        </div>
        <div className="ml-auto flex-shrink-0">
          <Stars count={t.stars} color={t.color} />
        </div>
      </div>
    </div>
  );
}

/* ── Main section ─────────────────────────────────────────────── */
export default function Testimonials() {
  const { pax26 } = useGlobalContext();
  const ref    = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const primary = pax26?.primary || "#3b82f6";

  // duplicate for seamless loop
  const row1 = [...TESTIMONIALS.slice(0, 3), ...TESTIMONIALS.slice(0, 3)];
  const row2 = [...TESTIMONIALS.slice(3, 6), ...TESTIMONIALS.slice(3, 6)];

  return (
    <>
      <style>{CSS}</style>
      <section ref={ref}
        className="tm-root relative overflow-hidden py-24"
        style={{ background: pax26?.bg }}>

        {/* bg orb */}
        <div className="tm-glow absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] rounded-full pointer-events-none"
          style={{ background: primary, filter: "blur(140px)", opacity: 0.08 }} />

        {/* ── Header ────────────────────────────────────── */}
        <div className="relative max-w-5xl mx-auto px-5 text-center mb-14">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-5"
            style={{ background: `${primary}12`, border: `1px solid ${primary}28` }}>
            <Star size={12} fill={primary} style={{ color: primary }} />
            <span className="text-xs font-bold tracking-widest uppercase" style={{ color: primary }}>
              Testimonials
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl md:text-5xl font-extrabold leading-tight mb-4"
            style={{ color: pax26?.textPrimary }}>
            Businesses{" "}
            <span className="tm-serif" style={{ color: primary }}>love Pax26</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-base max-w-xl mx-auto"
            style={{ color: pax26?.textSecondary, opacity: 0.65 }}>
            Real Nigerian businesses, real results. Here's what our customers
            say after switching to Pax26 AI automation.
          </motion.p>
        </div>

        {/* ── Scrolling rows ────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="space-y-4">

          {/* Row 1 — scrolls left */}
          <div className="overflow-hidden -mx-4">
            <div className="flex gap-4 tm-scroll px-4">
              {row1.map((t, i) => (
                <TestimonialCard key={i} t={t} pax26={pax26} />
              ))}
            </div>
          </div>

          {/* Row 2 — scrolls right (reversed direction) */}
          <div className="overflow-hidden -mx-4">
            <div className="flex gap-4 px-4"
              style={{
                animation: "tm-marquee 32s linear infinite reverse",
                width: "max-content",
              }}>
              {row2.map((t, i) => (
                <TestimonialCard key={i} t={t} pax26={pax26} />
              ))}
            </div>
          </div>
        </motion.div>

        {/* ── Summary stats strip ───────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="relative max-w-5xl mx-auto px-5 mt-14">
          <div className="flex flex-wrap items-center justify-center gap-8">
            {[
              { value: "2,000+", label: "Happy businesses",   color: primary   },
              { value: "4.9/5",  label: "Average rating",      color: "#f59e0b" },
              { value: "10K+",   label: "Conversations/month", color: "#22c55e" },
            ].map(({ value, label, color }) => (
              <div key={label} className="text-center">
                <p className="tm-mono text-2xl font-bold" style={{ color }}>{value}</p>
                <p className="text-xs mt-1" style={{ color: pax26?.textSecondary, opacity: 0.5 }}>{label}</p>
              </div>
            ))}
          </div>
        </motion.div>

      </section>
    </>
  );
}