"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { useGlobalContext } from "../Context";
import { Play, Youtube, CheckCircle2, Clock, Sparkles } from "lucide-react";

/* ── Keyframes + Styling ───────────────────────────────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@1,700&family=Syne:wght@400;600;700;800&family=DM+Mono:wght@400;500&display=swap');

  .mc-root  { font-family: 'Syne', sans-serif; }
  .mc-serif { font-family: 'Playfair Display', serif; font-style: italic; }
  .mc-mono  { font-family: 'DM Mono', monospace; }

  @keyframes mc-glow { 0%,100%{opacity:0.12} 50%{opacity:0.25} }
  .mc-glow { animation: mc-glow 5s ease-in-out infinite; }

  .mc-video-card {
    position: relative;
    border-radius: 24px;
    overflow: hidden;
    box-shadow: 0 20px 50px rgba(0,0,0,0.3);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }
  .mc-video-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 30px 60px rgba(59,130,246,0.2);
  }

  .mc-chapter {
    transition: all 0.2s ease;
    cursor: pointer;
  }
  .mc-chapter:hover {
    background: rgba(255,255,255,0.08);
    transform: translateX(4px);
  }
`;

const CHAPTERS = [
  { time: "00:00", title: "Introduction & Storefront Creation" },
  { time: "08:30", title: "Product Catalog & Image Uploads" },
  { time: "15:20", title: "Connecting WhatsApp via Meta API" },
  { time: "24:10", title: "Training PaxAI Sales Agent" },
  { time: "35:00", title: "Automated Follow-ups & Orders" },
];

export default function MasterclassVideo() {
  const { pax26 } = useGlobalContext();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const primary = pax26?.primary || "#3b82f6";

  return (
    <>
      <style>{CSS}</style>
      <section id="masterclass-video" ref={ref} className="mc-root relative overflow-hidden py-24 px-5"
        style={{ background: pax26?.secondaryBg || "#0b0f17" }}>

        {/* Glowing backdrop orb */}
        <div className="mc-glow absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[750px] h-[450px] rounded-full pointer-events-none"
          style={{ background: primary, filter: "blur(140px)", opacity: 0.12 }} />

        <div className="relative max-w-5xl mx-auto">

          {/* ── Header ──────────────────────────────────── */}
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-5"
              style={{ background: `${primary}15`, border: `1px solid ${primary}30` }}>
              <Youtube size={14} className="text-red-500" />
              <span className="text-xs font-bold tracking-widest uppercase" style={{ color: primary }}>
                Official Video Masterclass
              </span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-3xl md:text-5xl font-extrabold leading-tight mb-4"
              style={{ color: pax26?.textPrimary || "#ffffff" }}>
              Watch the complete{" "}
              <span className="mc-serif" style={{ color: primary }}>
                43-minute guide
              </span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-base max-w-2xl mx-auto"
              style={{ color: pax26?.textSecondary || "rgba(255,255,255,0.7)", opacity: 0.8 }}>
              Learn step-by-step how to set up your online storefront, upload products, connect WhatsApp Business via Meta Cloud API, and train your PaxAI sales agent to automate sales 24/7.
            </motion.p>
          </div>

          {/* ── Main Video Card ─────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mc-video-card p-3 md:p-5"
            style={{
              background: pax26?.card || "rgba(17, 24, 39, 0.9)",
              border: `1px solid ${pax26?.border || "rgba(255,255,255,0.1)"}`,
            }}>

            {/* Video Player (16:9 Aspect Ratio) */}
            <div className="relative w-full rounded-2xl overflow-hidden shadow-2xl bg-black" style={{ paddingTop: "56.25%" }}>
              <iframe
                className="absolute top-0 left-0 w-full h-full border-0"
                src="https://www.youtube.com/embed/4aa5bBJkZ1Y?rel=0&modestbranding=1"
                title="How to Use Pax26 — Complete Storefront & WhatsApp AI Automation Masterclass"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>

            {/* Video Footer info + Chapters */}
            <div className="mt-6 pt-5 border-t grid grid-cols-1 lg:grid-cols-3 gap-6 items-center"
              style={{ borderColor: pax26?.border || "rgba(255,255,255,0.1)" }}>

              {/* Title & Badges */}
              <div className="lg:col-span-2 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="mc-mono text-xs px-3 py-1 rounded-full font-semibold flex items-center gap-1.5"
                    style={{ background: "rgba(239,68,68,0.15)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.3)" }}>
                    <Clock size={12} />
                    43 mins
                  </span>
                  <span className="mc-mono text-xs px-3 py-1 rounded-full font-semibold"
                    style={{ background: `${primary}18`, color: primary, border: `1px solid ${primary}35` }}>
                    Full Walkthrough
                  </span>
                  <span className="mc-mono text-xs px-3 py-1 rounded-full font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30">
                    No-Code Setup
                  </span>
                </div>
                <h3 className="text-lg font-bold" style={{ color: pax26?.textPrimary || "#fff" }}>
                  How to Use Pax26 — Complete Storefront & WhatsApp AI Automation Masterclass
                </h3>
              </div>

              {/* Direct YouTube Link CTA */}
              <div className="flex lg:justify-end">
                <a
                  href="https://youtu.be/4aa5bBJkZ1Y"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl font-bold text-sm text-white transition-all duration-200 hover:opacity-90 hover:scale-105"
                  style={{
                    background: "linear-gradient(135deg, #ef4444, #dc2626)",
                    boxShadow: "0 8px 25px rgba(239,68,68,0.35)",
                  }}>
                  <Youtube size={18} />
                  Watch on YouTube
                </a>
              </div>
            </div>

            {/* Chapters Grid */}
            <div className="mt-6 pt-5 border-t" style={{ borderColor: pax26?.border || "rgba(255,255,255,0.08)" }}>
              <p className="text-xs font-bold uppercase tracking-wider mb-3 text-gray-400">
                Video Chapters & Key Topics
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {CHAPTERS.map((ch, idx) => (
                  <a
                    key={idx}
                    href={`https://youtu.be/4aa5bBJkZ1Y?t=${parseTimeToSeconds(ch.time)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mc-chapter p-3 rounded-xl flex flex-col justify-between"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <span className="mc-mono text-xs font-bold text-blue-400 mb-1 flex items-center gap-1">
                      <Play size={10} className="fill-current" />
                      {ch.time}
                    </span>
                    <span className="text-xs font-medium text-gray-200 leading-snug">
                      {ch.title}
                    </span>
                  </a>
                ))}
              </div>
            </div>

          </motion.div>

        </div>
      </section>
    </>
  );
}

function parseTimeToSeconds(timeStr) {
  const [m, s] = timeStr.split(":").map(Number);
  return m * 60 + s;
}
