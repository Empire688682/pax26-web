"use client";

import React from "react";
import { useGlobalContext } from "../Context";
import { CheckCircle2, Target, Eye, Zap, Mail, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

/* ── Keyframes + font ─────────────────────────────────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@1,700&family=Syne:wght@400;600;700;800&family=DM+Mono:wght@400;500&display=swap');

  .ab-root  { font-family: 'Syne', sans-serif; }
  .ab-serif { font-family: 'Playfair Display', serif; font-style: italic; }
  .ab-mono  { font-family: 'DM Mono', monospace; }

  @keyframes ab-slide { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
  @keyframes ab-glow  { 0%,100%{opacity:0.1} 50%{opacity:0.2} }
  @keyframes ab-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }

  .ab-s1 { animation: ab-slide 0.45s ease both; }
  .ab-s2 { animation: ab-slide 0.45s ease 0.1s both; }
  .ab-s3 { animation: ab-slide 0.45s ease 0.2s both; }

  .ab-glow  { animation: ab-glow  5s ease-in-out infinite; }
  .ab-float { animation: ab-float 6s ease-in-out infinite; }

  .ab-card { transition: transform 0.22s ease; }
  .ab-card:hover { transform: translateY(-3px); }
`;

const WHY = [
  "AI automation for WhatsApp and business messaging",
  "Automatic lead capture and smart follow-up workflows",
  "Fast and reliable digital utility payments",
  "Secure wallet for seamless transactions",
  "Affordable plans with cashback opportunities",
  "Built for both businesses and individuals",
];

/* ── Section label ────────────────────────────────────────────── */
function SectionLabel({ text, primary }) {
  return (
    <div className="flex items-center gap-3 mb-3">
      <div className="h-0.5 w-8 rounded-full" style={{ background: primary }} />
      <span className="ab-mono text-[10px] font-medium uppercase tracking-widest" style={{ color: primary }}>
        {text}
      </span>
    </div>
  );
}

/* ── Main component ───────────────────────────────────────────── */
const About = () => {
  const { pax26 } = useGlobalContext();
  const primary = pax26?.primary || "#3b82f6";
  const GREEN   = "#22c55e";
  const AMBER   = "#f59e0b";

  return (
    <>
      <style>{CSS}</style>
      <div className="ab-root min-h-screen px-5 py-16" style={{ background: pax26?.secondaryBg }}>
        <div className="max-w-5xl mx-auto space-y-10">

          {/* ── Hero ──────────────────────────────────────── */}
          <div className="ab-s1 relative rounded-3xl overflow-hidden px-8 py-14 text-center"
            style={{ background: pax26?.bg, border: `1px solid ${pax26?.border}` }}>

            {/* orbs */}
            <div className="ab-glow absolute -top-16 -left-16 w-64 h-64 rounded-full pointer-events-none"
              style={{ background: primary, filter: "blur(80px)" }} />
            <div className="ab-glow absolute -bottom-12 -right-12 w-52 h-52 rounded-full pointer-events-none"
              style={{ background: GREEN, filter: "blur(70px)", animationDelay: "2s" }} />

            {/* grid texture */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
              style={{
                backgroundImage: `radial-gradient(${pax26?.textPrimary || "#000"} 1px, transparent 1px)`,
                backgroundSize: "24px 24px",
              }} />

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6"
                style={{ background: `${primary}12`, border: `1px solid ${primary}28` }}>
                <Zap size={12} style={{ color: primary }} />
                <span className="ab-mono text-[10px] font-bold uppercase tracking-widest" style={{ color: primary }}>
                  About Pax26
                </span>
              </div>

              <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-5"
                style={{ color: pax26?.textPrimary }}>
                We're building{" "}
                <span className="ab-serif" style={{ color: primary }}>Africa's AI future</span>
              </h1>

              <p className="text-base md:text-lg leading-relaxed max-w-2xl mx-auto"
                style={{ color: pax26?.textSecondary, opacity: 0.7 }}>
                Pax26 is an AI automation platform that helps businesses automate customer interactions,
                capture leads, and streamline digital operations — alongside seamless VTU services for everyday needs.
              </p>
            </div>
          </div>

          {/* ── What we do ──────────────────────────────── */}
          <div className="ab-s2 rounded-2xl p-8"
            style={{ background: pax26?.bg, border: `1px solid ${pax26?.border}` }}>
            <SectionLabel text="What We Do" primary={primary} />
            <h2 className="text-2xl font-extrabold mb-4" style={{ color: pax26?.textPrimary }}>
              AI automation{" "}
              <span className="ab-serif" style={{ color: primary }}>meets digital services</span>
            </h2>
            <p className="text-sm leading-relaxed max-w-3xl"
              style={{ color: pax26?.textSecondary, opacity: 0.7 }}>
              Pax26 combines artificial intelligence with digital utility services to help businesses
              operate smarter. Our AI tools automatically respond to customers, capture leads, and manage
              conversations on WhatsApp — while our digital services give instant access to airtime, data,
              electricity payments, TV subscriptions and more.
            </p>
          </div>

          {/* ── Mission & Vision ─────────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {[
              {
                icon: Target, color: primary,
                label: "Mission",
                title: "Our Mission",
                text: "To empower businesses and individuals with intelligent automation tools that simplify communication, improve efficiency, and make digital services more accessible across Africa.",
              },
              {
                icon: Eye, color: AMBER,
                label: "Vision",
                title: "Our Vision",
                text: "To become Africa's leading AI automation platform — helping businesses automate operations, engage customers smarter, and scale faster without needing technical expertise.",
              },
            ].map(({ icon: Icon, color, label, title, text }, i) => (
              <div key={i} className="ab-card rounded-2xl p-7 overflow-hidden relative"
                style={{ background: pax26?.bg, border: `1px solid ${pax26?.border}` }}>
                <div className="ab-glow absolute -top-4 -right-4 w-24 h-24 rounded-full pointer-events-none"
                  style={{ background: color, filter: "blur(28px)" }} />
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-5"
                  style={{ background: `${color}14`, color }}>
                  <Icon size={20} />
                </div>
                <SectionLabel text={label} primary={color} />
                <h3 className="text-lg font-extrabold mb-3" style={{ color: pax26?.textPrimary }}>{title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: pax26?.textSecondary, opacity: 0.7 }}>{text}</p>
              </div>
            ))}
          </div>

          {/* ── Why Pax26 ───────────────────────────────── */}
          <div className="ab-s3 rounded-2xl p-8"
            style={{ background: pax26?.bg, border: `1px solid ${pax26?.border}` }}>
            <SectionLabel text="Why Pax26" primary={primary} />
            <h2 className="text-2xl font-extrabold mb-6" style={{ color: pax26?.textPrimary }}>
              Why choose{" "}
              <span className="ab-serif" style={{ color: primary }}>Pax26?</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {WHY.map((item, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-xl"
                  style={{ background: pax26?.secondaryBg }}>
                  <CheckCircle2 size={14} style={{ color: GREEN, flexShrink: 0 }} />
                  <span className="text-sm" style={{ color: pax26?.textSecondary, opacity: 0.8 }}>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Founder ─────────────────────────────────── */}
          <div className="rounded-2xl overflow-hidden"
            style={{ background: pax26?.bg, border: `1px solid ${pax26?.border}` }}>

            <div className="h-1 w-full"
              style={{ background: `linear-gradient(90deg, ${primary}, ${primary}55, transparent)` }} />

            <div className="p-8 flex flex-col sm:flex-row items-center sm:items-start gap-7">
              {/* avatar */}
              <div className="relative flex-shrink-0">
                <div className="ab-float w-28 h-28 rounded-2xl overflow-hidden shadow-xl"
                  style={{ border: `2px solid ${primary}30` }}>
                  <img
                    src="/team-1.png"
                    alt="Juwon Asehinde - Founder of Pax26"
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* live badge */}
                <div className="absolute -bottom-2 -right-2 flex items-center gap-1.5 px-2.5 py-1 rounded-full shadow-sm"
                  style={{ background: pax26?.secondaryBg, border: `1px solid ${pax26?.border}` }}>
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: GREEN }} />
                  <span className="ab-mono text-[9px] font-bold" style={{ color: GREEN }}>CEO</span>
                </div>
              </div>

              {/* info */}
              <div className="flex-1 text-center sm:text-left">
                <SectionLabel text="Founder" primary={primary} />
                <h3 className="text-xl font-extrabold mb-1" style={{ color: pax26?.textPrimary }}>
                  Juwon Asehinde
                </h3>
                <p className="ab-mono text-xs mb-4" style={{ color: pax26?.textSecondary, opacity: 0.5 }}>
                  Founder & Chief Executive Officer
                </p>
                <p className="text-sm leading-relaxed max-w-lg"
                  style={{ color: pax26?.textSecondary, opacity: 0.7 }}>
                  Juwon founded Pax26 with a clear mission: build a platform where AI automation
                  and digital services come together to simplify business operations and everyday
                  transactions for Nigerians and Africans everywhere.
                </p>
              </div>
            </div>
          </div>

          {/* ── Contact nudge ───────────────────────────── */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-5 px-7 py-5 rounded-2xl"
            style={{ background: pax26?.bg, border: `1px solid ${pax26?.border}` }}>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${primary}14`, color: primary }}>
                <Mail size={18} />
              </div>
              <div>
                <p className="text-sm font-bold" style={{ color: pax26?.textPrimary }}>Want to reach us?</p>
                <p className="text-xs" style={{ color: pax26?.textSecondary, opacity: 0.55 }}>
                  We respond within 2 hours
                </p>
              </div>
            </div>
            <a
              href="mailto:info@pax26.com"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white"
              style={{ background: primary, boxShadow: `0 8px 24px ${primary}35` }}>
              info@pax26.com <ArrowRight size={14} />
            </a>
          </div>

        </div>
      </div>
    </>
  );
};

export default About;