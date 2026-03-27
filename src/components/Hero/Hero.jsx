"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useGlobalContext } from "../Context";
import { ArrowRight, CheckCircle2, Zap, Bot } from "lucide-react";

/* ── Keyframes + fonts ─────────────────────────────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@1,700;1,900&family=Syne:wght@400;600;700;800&display=swap');

  .hr-root  { font-family: 'Syne', sans-serif; }
  .hr-serif { font-family: 'Playfair Display', serif; font-style: italic; }

  @keyframes hr-float  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-18px)} }
  @keyframes hr-float2 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(14px)} }
  @keyframes hr-marquee{ from{transform:translateX(0)} to{transform:translateX(-50%)} }
  @keyframes hr-bubble {
    from { opacity:0; transform:translateY(8px) scale(0.95); }
    to   { opacity:1; transform:translateY(0)   scale(1); }
  }
  @keyframes hr-blink  { 0%,100%{opacity:1} 50%{opacity:0.3} }
  @keyframes hr-glow   { 0%,100%{opacity:0.18} 50%{opacity:0.32} }
  @keyframes hr-typing {
    0%,80%,100% { transform: scale(1); opacity: 0.4; }
    40%         { transform: scale(1.3); opacity: 1; }
  }

  .hr-orb1    { animation: hr-float  7s  ease-in-out infinite; }
  .hr-orb2    { animation: hr-float2 9s  ease-in-out infinite; }
  .hr-orb3    { animation: hr-float  11s ease-in-out -3s infinite; }
  .hr-glow    { animation: hr-glow   4s  ease-in-out infinite; }
  .hr-marquee { animation: hr-marquee 22s linear infinite; width: max-content; }
  .hr-marquee:hover { animation-play-state: paused; }
  .hr-bubble  { animation: hr-bubble 0.3s ease both; }
  .hr-blink   { animation: hr-blink  1.8s ease-in-out infinite; }

  .hr-dot-1 { animation: hr-typing 1s ease-in-out 0s   infinite; }
  .hr-dot-2 { animation: hr-typing 1s ease-in-out 0.2s infinite; }
  .hr-dot-3 { animation: hr-typing 1s ease-in-out 0.4s infinite; }

  .hr-cta-primary { transition: opacity 0.18s ease, transform 0.18s ease; }
  .hr-cta-primary:hover { opacity: 0.88; transform: translateY(-2px); }
  .hr-cta-ghost   { transition: background 0.18s ease; }
  .hr-cta-ghost:hover { background: rgba(255,255,255,0.05) !important; }
`;

/* ── Chat messages ──────────────────────────────────────────── */
const MSGS = [
  { from: "user", text: "Hi! Do you sell sneakers?", t: 0 },
  { from: "bot", text: "Yes! \ud83d\udc5f We have:\n\n1\ufe0f\u20e3 Air Max 90\n2\ufe0f\u20e3 Adidas Ultraboost\n3\ufe0f\u20e3 Jordan 1\n\nWhich interests you?", t: 900 },
  { from: "user", text: "Air Max 90 in size 42", t: 2200 },
  { from: "bot", text: "Great choice! \ud83d\udd25 We have size 42 in stock.\nPrice: \u20a655,000\n\nShould I send a payment link? \ud83d\udcb3", t: 3200 },
  { from: "user", text: "Yes please!", t: 4500 },
  { from: "bot", text: "Done \u2705 Payment link sent!\nYour order ships within 2hrs. Thank you!", t: 5400 },
];

/* ── Live WhatsApp chat ─────────────────────────────────────── */
function ChatMockup() {
  const GREEN = "#25D366";
  const [visible, setVisible] = useState(0);
  const timersRef = useRef([]);

  useEffect(() => {
    function startLoop() {
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
      setVisible(0);

      MSGS.forEach((m, i) => {
        const t = setTimeout(() => setVisible(i + 1), m.t + 400);
        timersRef.current.push(t);
      });

      // pause 3s after last message then restart
      const loopDelay = MSGS[MSGS.length - 1].t + 400 + 3000;
      const restart = setTimeout(startLoop, loopDelay);
      timersRef.current.push(restart);
    }

    startLoop();
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  // next message is from bot and not yet visible → show typing
  const nextIsBot = visible < MSGS.length && MSGS[visible]?.from === "bot";

  return (
    <div className="w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl"
      style={{ background: "#ECE5DD", border: "1px solid rgba(0,0,0,0.08)" }}>

      {/* WhatsApp header */}
      <div className="flex items-center gap-3 px-4 py-3" style={{ background: GREEN }}>
        <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: "rgba(255,255,255,0.2)" }}>
          <Bot size={17} color="#fff" />
        </div>
        <div>
          <p className="text-sm font-bold text-white leading-none mb-1">Pax26 AI Bot</p>
          <div className="flex items-center gap-1.5">
            <span className="hr-blink w-1.5 h-1.5 rounded-full block bg-green-200" />
            <span className="text-xs text-white/70">online · replies instantly</span>
          </div>
        </div>
      </div>

      {/* messages */}
      <div className="p-3 flex flex-col gap-2 min-h-[240px]">
        {MSGS.slice(0, visible).map((m, i) => (
          <div key={i}
            className={`hr-bubble flex ${m.from === "user" ? "justify-end" : "justify-start"}`}>
            <div className="max-w-[80%] px-3 py-2 text-sm leading-snug"
              style={{
                background: m.from === "user" ? "#DCF8C6" : "#ffffff",
                borderRadius: m.from === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                color: "#111827",
                whiteSpace: "pre-line",
                boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
              }}>
              {m.text}
            </div>
          </div>
        ))}

        {/* typing indicator — shown when next message is from bot */}
        {visible > 0 && nextIsBot && (
          <div className="hr-bubble flex justify-start">
            <div className="px-4 py-3 rounded-2xl flex items-center gap-1"
              style={{ background: "#fff", boxShadow: "0 1px 2px rgba(0,0,0,0.1)" }}>
              <span className="hr-dot-1 w-2 h-2 rounded-full block bg-gray-400" />
              <span className="hr-dot-2 w-2 h-2 rounded-full block bg-gray-400" />
              <span className="hr-dot-3 w-2 h-2 rounded-full block bg-gray-400" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Marquee items ──────────────────────────────────────────── */
const TRUST = [
  "24/7 AI Replies", "·", "WhatsApp Cloud API", "·",
  "Lead Follow-up", "·", "Airtime & Data", "·",
  "Electricity Bills", "·", "TV Subscriptions", "·",
  "No Code Setup", "·", "Instant Activation", "·",
];

/* ── Main Hero ──────────────────────────────────────────────── */
export default function Hero() {
  const { openModal, pax26 } = useGlobalContext();
  const primary = pax26?.primary || "#3b82f6";
  const GREEN = "#22c55e";

  const stats = [
    { value: "24/7", label: "AI Availability" },
    { value: "5min", label: "Setup Time" },
    { value: "100%", label: "Auto Replies" },
  ];

  return (
    <>
      <style>{CSS}</style>
      <section className="hr-root relative overflow-hidden pt-28 pb-20"
        style={{ background: pax26?.bg }}>

        {/* ── Background ──────────────────────────────── */}
        <div className="absolute inset-0 pointer-events-none">
          {/* dot grid */}
          <div className="absolute inset-0 opacity-[0.035]"
            style={{
              backgroundImage: `radial-gradient(${pax26?.textPrimary || "#000"} 1px, transparent 1px)`,
              backgroundSize: "28px 28px",
            }} />
          {/* orbs */}
          <div className="hr-orb1 hr-glow absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full"
            style={{ background: primary, filter: "blur(100px)", opacity: 0.18 }} />
          <div className="hr-orb2 hr-glow absolute top-20 -right-40 w-[400px] h-[400px] rounded-full"
            style={{ background: pax26?.btn || primary, filter: "blur(90px)", opacity: 0.13 }} />
          <div className="hr-orb3 hr-glow absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[280px] rounded-full"
            style={{ background: GREEN, filter: "blur(120px)", opacity: 0.07 }} />
        </div>

        <div className="relative max-w-6xl mx-auto px-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

            {/* ── Left: copy ──────────────────────────── */}
            <div>
              {/* eyebrow pill */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
                style={{ background: `${primary}12`, border: `1px solid ${primary}28` }}>
                <span className="hr-blink w-2 h-2 rounded-full block" style={{ background: GREEN }} />
                <span className="text-xs font-bold tracking-widest capitalized" style={{ color: primary }}>
                  PAX26 TECHNOLOGIES,
                  a registered Nigerian technology company.
                </span>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
                style={{ background: `${primary}12`, border: `1px solid ${primary}28` }}>
                <span className="hr-blink w-2 h-2 rounded-full block" style={{ background: GREEN }} />
                <span className="text-xs font-bold tracking-widest uppercase" style={{ color: primary }}>
                  AI WhatsApp Automation
                </span>
              </motion.div>

              {/* headline */}
              <div className="mb-6 space-y-1">
                {[
                  { text: "Turn WhatsApp", serif: false, delay: 0.05 },
                  { text: "Into Your AI", serif: false, delay: 0.15 },
                  { text: "Sales Machine.", serif: true, delay: 0.25 },
                ].map((l, i) => (
                  <motion.span key={i} className="block"
                    initial={{ opacity: 0, y: 32 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.65, delay: l.delay, ease: [0.22, 1, 0.36, 1] }}
                    style={{
                      fontSize: "clamp(36px, 6vw, 62px)",
                      fontWeight: l.serif ? 700 : 800,
                      fontFamily: l.serif
                        ? "'Playfair Display', serif"
                        : "'Syne', sans-serif",
                      fontStyle: l.serif ? "italic" : "normal",
                      lineHeight: 1.1,
                      color: l.serif ? primary : pax26?.textPrimary,
                    }}>
                    {l.text}
                  </motion.span>
                ))}
              </div>

              {/* sub */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.45 }}
                className="text-base leading-relaxed mb-8 max-w-lg"
                style={{ color: pax26?.textSecondary, opacity: 0.7 }}>
                Automate customer replies, send smart follow-ups, and run AI chatbots 24/7.
                PAX26 TECHNOLOGIES also handles airtime, data, bills and TV subs — all in one platform.
              </motion.p>

              {/* CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55 }}
                className="flex flex-wrap gap-3 mb-10">
                <button
                  onClick={() => openModal("register")}
                  className="hr-cta-primary flex items-center gap-2 px-7 py-4 rounded-2xl text-sm font-bold text-white"
                  style={{
                    background: `linear-gradient(135deg, ${primary}, ${pax26?.btn || primary})`,
                    boxShadow: `0 14px 36px ${primary}40`,
                  }}>
                  Start Automating <ArrowRight size={16} />
                </button>

                <Link href="#pricing"
                  className="hr-cta-ghost flex items-center gap-2 px-7 py-4 rounded-2xl text-sm font-bold"
                  style={{
                    color: pax26?.textPrimary,
                    border: `1px solid ${pax26?.border}`,
                    background: "transparent",
                  }}>
                  View Plans
                </Link>
              </motion.div>

              {/* stats */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="flex items-center gap-6 flex-wrap">
                {stats.map((s, i) => (
                  <div key={i} className="flex items-center gap-3">
                    {i > 0 && <div className="w-px h-8" style={{ background: pax26?.border }} />}
                    <div>
                      <p className="text-xl font-extrabold leading-none" style={{ color: primary }}>{s.value}</p>
                      <p className="text-xs mt-0.5" style={{ color: pax26?.textSecondary, opacity: 0.55 }}>{s.label}</p>
                    </div>
                  </div>
                ))}
                <div className="flex items-center gap-1.5 ml-auto">
                  <CheckCircle2 size={13} style={{ color: GREEN }} />
                  <span className="text-xs font-medium" style={{ color: pax26?.textSecondary, opacity: 0.5 }}>
                    No code needed
                  </span>
                </div>
              </motion.div>
            </div>

            {/* ── Right: animated chat ─────────────────── */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="flex justify-center lg:justify-end">
              <div className="relative">

                {/* badge top */}
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.75 }}
                  className="absolute -top-4 -left-5 z-10 flex items-center gap-2 px-3 py-2 rounded-xl shadow-lg"
                  style={{ background: pax26?.bg, border: `1px solid ${pax26?.border}` }}>
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center"
                    style={{ background: `${GREEN}18`, color: GREEN }}>
                    <Zap size={12} />
                  </div>
                  <span className="text-xs font-bold" style={{ color: pax26?.textPrimary }}>
                    AI responding…
                  </span>
                </motion.div>

                <ChatMockup />

                {/* badge bottom */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                  className="absolute -bottom-4 -right-4 z-10 flex items-center gap-2 px-3 py-2 rounded-xl shadow-lg"
                  style={{ background: pax26?.bg, border: `1px solid ${pax26?.border}` }}>
                  <span className="hr-blink w-2 h-2 rounded-full block" style={{ background: GREEN }} />
                  <span className="text-xs font-bold" style={{ color: pax26?.textPrimary }}>
                    5,000+ messages/day
                  </span>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* ── Marquee strip ───────────────────────────── */}
        <div className="mt-20 overflow-hidden -mx-4"
          style={{
            borderTop: `1px solid ${pax26?.border}`,
            borderBottom: `1px solid ${pax26?.border}`,
            padding: "14px 0",
          }}>
          <div className="flex hr-marquee">
            {[...TRUST, ...TRUST].map((item, i) => (
              <span key={i}
                className="px-5 text-xs font-bold tracking-widest uppercase whitespace-nowrap"
                style={{ color: item === "·" ? primary : pax26?.textSecondary, opacity: item === "·" ? 1 : 0.4 }}>
                {item}
              </span>
            ))}
          </div>
        </div>

      </section>
    </>
  );
}