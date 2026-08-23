"use client";

import { useState, useRef, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import { useGlobalContext } from "../Context";
import { Play, Youtube, Clock, Sparkles, CheckCircle2, Layers } from "lucide-react";

/**
 * Configure YouTube IDs here:
 * Replace with your actual YouTube Video IDs or URLs when ready.
 */
export const PART1_YOUTUBE_ID = "XWufgjpl2q4"; // Part 1: How to Sign Up & Connect WhatsApp
export const PART2_YOUTUBE_ID = "C-SO1_9XkX0"; // Part 2: Setup Seller Business, Storefront & Sales Demo

/* ── Keyframes + Styling ───────────────────────────────────────── */
const CSS = `
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

  .mc-tab-btn {
    transition: all 0.25s ease;
    cursor: pointer;
  }
  .mc-tab-btn:hover {
    transform: translateY(-2px);
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

const VIDEO_PARTS = [
  {
    id: "part1",
    partNumber: "Part 1",
    youtubeId: PART1_YOUTUBE_ID,
    badge: "Account & WhatsApp",
    title: "How to Sign Up & Connect WhatsApp to Pax26 | Complete Setup Guide",
    description: "Learn step-by-step how to create your Pax26 account and connect your WhatsApp Business number using Meta Cloud API or QR code.",
  },
  {
    id: "part2",
    partNumber: "Part 2",
    youtubeId: PART2_YOUTUBE_ID,
    badge: "Storefront & Live Sales",
    title: "Setup Seller Business, Online Storefront, Add Products & Live Sales Demo",
    description: "In Part 2, set up your seller business account, create your Online Storefront, upload products, and see a live customer WhatsApp conversation turn into an actual sale.",
  },
];

export default function MasterclassVideo() {
  const { pax26 } = useGlobalContext();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const primary = pax26?.primary || "#3b82f6";
  const [activePartId, setActivePartId] = useState("part1");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const part = new URLSearchParams(window.location.search).get("part");
    if (part === "part2" || part === "part1") setActivePartId(part);
  }, []);

  const currentVideo = VIDEO_PARTS.find((v) => v.id === activePartId) || VIDEO_PARTS[0];

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
          <div className="text-center mb-10">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-5"
              style={{ background: `${primary}15`, border: `1px solid ${primary}30` }}>
              <Youtube size={14} className="text-red-500" />
              <span className="text-xs font-bold tracking-widest uppercase" style={{ color: primary }}>
                Official 2-Part Setup Series
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
                Pax26 Setup Guide
              </span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-base max-w-2xl mx-auto"
              style={{ color: pax26?.textSecondary || "rgba(255,255,255,0.7)", opacity: 0.8 }}>
              Our step-by-step masterclass is split into two easy-to-follow videos covering signup, WhatsApp connection, storefront setup, product catalog, and live AI sales automation.
            </motion.p>
          </div>

          {/* ── Part Selector Tabs ───────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
            {VIDEO_PARTS.map((part) => {
              const isActive = part.id === activePartId;
              return (
                <button
                  key={part.id}
                  onClick={() => setActivePartId(part.id)}
                  className="mc-tab-btn w-full sm:w-auto flex items-center justify-between sm:justify-start gap-4 px-6 py-3.5 rounded-2xl text-left border"
                  style={{
                    background: isActive ? `${primary}20` : (pax26?.card || "rgba(17, 24, 39, 0.6)"),
                    borderColor: isActive ? primary : (pax26?.border || "rgba(255,255,255,0.1)"),
                    boxShadow: isActive ? `0 10px 30px ${primary}25` : "none",
                  }}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center font-extrabold text-xs"
                      style={{
                        background: isActive ? primary : "rgba(255,255,255,0.1)",
                        color: "#fff",
                      }}>
                      {part.partNumber === "Part 1" ? "1" : "2"}
                    </div>
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider text-gray-400">
                        {part.partNumber}
                      </div>
                      <div className="text-sm font-bold" style={{ color: pax26?.textPrimary || "#fff" }}>
                        {part.badge}
                      </div>
                    </div>
                  </div>
                  {isActive && <CheckCircle2 size={16} style={{ color: primary }} />}
                </button>
              );
            })}
          </motion.div>

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
                key={currentVideo.id}
                className="absolute top-0 left-0 w-full h-full border-0"
                src={`https://www.youtube.com/embed/${currentVideo.youtubeId}?rel=0&modestbranding=1`}
                title={currentVideo.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>

            {/* Video Footer info */}
            <div className="mt-6 pt-5 border-t grid grid-cols-1 lg:grid-cols-3 gap-6 items-center"
              style={{ borderColor: pax26?.border || "rgba(255,255,255,0.1)" }}>

              {/* Title & Badges */}
              <div className="lg:col-span-2 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="mc-mono text-xs px-3 py-1 rounded-full font-semibold flex items-center gap-1.5"
                    style={{ background: "rgba(239,68,68,0.15)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.3)" }}>
                    <Layers size={12} />
                    {currentVideo.partNumber}
                  </span>
                  <span className="mc-mono text-xs px-3 py-1 rounded-full font-semibold"
                    style={{ background: `${primary}18`, color: primary, border: `1px solid ${primary}35` }}>
                    {currentVideo.badge}
                  </span>
                  <span className="mc-mono text-xs px-3 py-1 rounded-full font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30">
                    No-Code Setup
                  </span>
                </div>
                <h3 className="text-lg font-bold" style={{ color: pax26?.textPrimary || "#fff" }}>
                  {currentVideo.title}
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  {currentVideo.description}
                </p>
              </div>

              {/* Direct YouTube Link CTA */}
              <div className="flex lg:justify-end">
                <a
                  href={`https://youtu.be/${currentVideo.youtubeId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl font-bold text-sm text-white transition-all duration-200 hover:opacity-90 hover:scale-105"
                  style={{
                    background: "linear-gradient(135deg, #ef4444, #dc2626)",
                    boxShadow: "0 8px 25px rgba(239,68,68,0.35)",
                  }}>
                  <Youtube size={18} />
                  Watch {currentVideo.partNumber} on YouTube
                </a>
              </div>
            </div>

          </motion.div>

        </div>
      </section>
    </>
  );
}
