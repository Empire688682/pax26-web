"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { useGlobalContext } from "../Context";
import { Bot, MessageCircle, Zap, Users2, Play, RotateCcw } from "lucide-react";

/* ── Keyframes + font ─────────────────────────────────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@1,700&family=Syne:wght@400;600;700;800&display=swap');

  .dm-root  { font-family: 'Syne', sans-serif; }
  .dm-serif { font-family: 'Playfair Display', serif; font-style: italic; }

  @keyframes dm-glow   { 0%,100%{opacity:0.1} 50%{opacity:0.2} }
  @keyframes dm-blink  { 0%,100%{opacity:1}   50%{opacity:0.3} }
  @keyframes dm-typing {
    0%,80%,100% { transform:scale(0.85); opacity:0.4; }
    40%         { transform:scale(1.2);  opacity:1; }
  }

  .dm-glow  { animation: dm-glow   5s ease-in-out infinite; }
  .dm-blink { animation: dm-blink  1.8s ease-in-out infinite; }
  .dm-dot-1 { animation: dm-typing 1s ease-in-out 0s   infinite; }
  .dm-dot-2 { animation: dm-typing 1s ease-in-out 0.2s infinite; }
  .dm-dot-3 { animation: dm-typing 1s ease-in-out 0.4s infinite; }

  .dm-tab { transition: all 0.2s ease; }
  .dm-replay { transition: opacity 0.15s ease, transform 0.15s ease; }
  .dm-replay:hover { opacity: 0.8; transform: rotate(-20deg); }
`;

const GREEN_WA = "#25D366";

/* ── Scenario data ────────────────────────────────────────────── */
const SCENARIOS = [
  {
    id: "support",
    icon: MessageCircle,
    color: "#22c55e",
    label: "Auto Reply",
    tagline: "Customer enquiry handled in seconds",
    points: [
      "Instant AI reply within 300ms",
      "Product catalogue delivered automatically",
      "Payment link sent without human involvement",
    ],
    messages: [
      { from: "user", text: "Hi! Do you sell shoes?",                                                      t: 0    },
      { from: "bot",  text: "Yes! \uD83D\uDC5F We have:\n\n1\uFE0F\u20E3 Nike Air Max — \u20A655,000\n2\uFE0F\u20E3 Adidas Ultraboost — \u20A648,000\n3\uFE0F\u20E3 Jordan 1 — \u20A662,000\n\nWhich do you want?", t: 900  },
      { from: "user", text: "Nike please, size 42",                                                         t: 2400 },
      { from: "bot",  text: "Great choice! \uD83D\uDD25 Size 42 is in stock.\n\nShall I send a payment link? \uD83D\uDCB3", t: 3400 },
      { from: "user", text: "Yes!",                                                                          t: 4600 },
      { from: "bot",  text: "Done \u2705 Payment link sent. Your order ships within 2 hrs!",                 t: 5500 },
    ],
  },
  {
    id: "followup",
    icon: Zap,
    color: "#f59e0b",
    label: "Follow-up",
    tagline: "Re-engaging a cold lead automatically",
    points: [
      "Sent automatically 24hrs after cart abandon",
      "AI knows what the customer viewed",
      "Urgency created with reserved stock tactic",
    ],
    messages: [
      { from: "bot",  text: "Hi \uD83D\uDC4B You checked out Air Max 270 yesterday but didn't complete your order.", t: 0    },
      { from: "bot",  text: "We held the last pair in your size — it's still available! \uD83D\uDE4C",               t: 1000 },
      { from: "user", text: "Oh really? I thought it was sold out",                                                    t: 2800 },
      { from: "bot",  text: "Not at all! We reserved it for you \uD83D\uDE0A\n\nWant me to send a payment link?",     t: 3800 },
      { from: "user", text: "Yes please, let's do it",                                                                 t: 5200 },
      { from: "bot",  text: "Sent! \uD83C\uDF89 Complete within 30 mins and we'll add free delivery.",                t: 6100 },
    ],
  },
  {
    id: "qualify",
    icon: Users2,
    color: "#a78bfa",
    label: "Lead Qualify",
    tagline: "AI qualifies the lead before you step in",
    points: [
      "AI collects budget and team size",
      "Scores the lead before human sees it",
      "Routes hot leads to sales team instantly",
    ],
    messages: [
      { from: "user", text: "I want to buy data in bulk for my company",                                    t: 0    },
      { from: "bot",  text: "Awesome! \uD83D\uDE80 Quick questions:\n\nHow many staff need data?",          t: 900  },
      { from: "user", text: "About 50 employees",                                                           t: 2400 },
      { from: "bot",  text: "Got it. What's your monthly budget?",                                          t: 3300 },
      { from: "user", text: "Around \u20A6500,000 a month",                                                 t: 4700 },
      { from: "bot",  text: "You qualify for our Business Plan \uD83D\uDCBC\n\nConnecting you with our sales team now — they'll reach you in under 5 mins!", t: 5700 },
    ],
  },
];

/* ── Chat window component ────────────────────────────────────── */
function ChatWindow({ scenario, pax26 }) {
  const [visible, setVisible]   = useState(0);
  const [running, setRunning]   = useState(false);
  const timersRef               = useRef([]);

  function start() {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    setVisible(0);
    setRunning(true);

    scenario.messages.forEach((m, i) => {
      const t = setTimeout(() => setVisible(i + 1), m.t + 400);
      timersRef.current.push(t);
    });

    const lastT = scenario.messages[scenario.messages.length - 1].t + 1200;
    const done  = setTimeout(() => setRunning(false), lastT);
    timersRef.current.push(done);
  }

  // auto-start on mount / scenario change
  useEffect(() => {
    const t = setTimeout(start, 200);
    return () => clearTimeout(t);
  }, [scenario.id]);

  // cleanup on unmount
  useEffect(() => {
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const nextIsBot  = visible < scenario.messages.length && scenario.messages[visible]?.from === "bot";
  const showTyping = running && visible > 0 && nextIsBot;

  return (
    <div className="w-full rounded-3xl overflow-hidden shadow-2xl"
      style={{ background: "#ECE5DD", border: "1px solid rgba(0,0,0,0.08)", maxWidth: "420px", margin: "0 auto" }}>

      {/* WA header */}
      <div className="flex items-center justify-between gap-3 px-4 py-3" style={{ background: GREEN_WA }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.2)" }}>
            <Bot size={17} color="#fff" />
          </div>
          <div>
            <p className="text-sm font-bold text-white leading-none mb-0.5">Pax26 AI Bot</p>
            <div className="flex items-center gap-1.5">
              <span className="dm-blink w-1.5 h-1.5 rounded-full block bg-green-200" />
              <span className="text-xs text-white/70">online · replies instantly</span>
            </div>
          </div>
        </div>

        <button onClick={() => setTimeout(start, 50)}
          className="dm-replay w-8 h-8 rounded-full flex items-center justify-center"
          style={{ background: "rgba(255,255,255,0.2)", color: "#fff" }}
          title="Replay">
          <RotateCcw size={14} />
        </button>
      </div>

      {/* messages */}
      <div className="p-3 flex flex-col gap-2 overflow-y-auto" style={{ minHeight: "280px", maxHeight: "340px" }}>
        <AnimatePresence>
          {scenario.messages.slice(0, visible).map((m, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.25 }}
              className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}>
              <div className="max-w-[80%] px-3 py-2 text-sm leading-snug"
                style={{
                  background:   m.from === "user" ? "#DCF8C6" : "#ffffff",
                  borderRadius: m.from === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                  color:        "#111827",
                  whiteSpace:   "pre-line",
                  boxShadow:    "0 1px 2px rgba(0,0,0,0.1)",
                }}>
                {m.text}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {showTyping && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex justify-start">
            <div className="px-4 py-3 rounded-2xl flex gap-1 items-center"
              style={{ background: "#ffffff", boxShadow: "0 1px 2px rgba(0,0,0,0.1)" }}>
              <span className="dm-dot-1 w-2 h-2 rounded-full block bg-gray-400" />
              <span className="dm-dot-2 w-2 h-2 rounded-full block bg-gray-400" />
              <span className="dm-dot-3 w-2 h-2 rounded-full block bg-gray-400" />
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

/* ── Context panel component ──────────────────────────────────── */
function ContextPanel({ scenario, pax26 }) {
  const Icon = scenario.icon;
  return (
    <div className="space-y-4">
      {/* scenario card */}
      <div className="rounded-2xl p-6"
        style={{ background: pax26?.bg, border: `1px solid ${pax26?.border}` }}>

        {/* header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: `${scenario.color}18`, color: scenario.color }}>
            <Icon size={20} />
          </div>
          <div>
            <p className="text-sm font-bold" style={{ color: pax26?.textPrimary }}>
              {scenario.label}
            </p>
            <p className="text-xs" style={{ color: pax26?.textSecondary, opacity: 0.55 }}>
              {scenario.tagline}
            </p>
          </div>
        </div>

        <div className="h-px mb-4" style={{ background: pax26?.border }} />

        {/* bullet points */}
        <div className="space-y-2">
          {scenario.points.map((point, i) => (
            <div key={i} className="flex items-center gap-2.5">
              <div className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ background: scenario.color }} />
              <span className="text-xs" style={{ color: pax26?.textSecondary, opacity: 0.7 }}>
                {point}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* stats row */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Response time", value: "< 1s"   },
          { label: "Availability",  value: "24 / 7" },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-xl p-4"
            style={{ background: `${scenario.color}08`, border: `1px solid ${scenario.color}20` }}>
            <p className="text-lg font-extrabold" style={{ color: scenario.color }}>{value}</p>
            <p className="text-xs mt-0.5" style={{ color: pax26?.textSecondary, opacity: 0.55 }}>{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Main Demo section ────────────────────────────────────────── */
export default function Demo() {
  const { pax26 }   = useGlobalContext();
  const ref         = useRef(null);
  const inView      = useInView(ref, { once: true, margin: "-80px" });
  const [activeTab, setActiveTab] = useState(0);
  const primary     = pax26?.primary || "#3b82f6";

  return (
    <>
      <style>{CSS}</style>
      <section ref={ref} className="dm-root relative overflow-hidden py-24 px-5"
        style={{ background: pax26?.secondaryBg }}>

        {/* bg orb */}
        <div className="dm-glow absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full pointer-events-none"
          style={{ background: primary, filter: "blur(140px)", opacity: 0.09 }} />

        <div className="relative max-w-5xl mx-auto">

          {/* ── Header ──────────────────────────────────── */}
          <div className="text-center mb-14">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-5"
              style={{ background: `${primary}12`, border: `1px solid ${primary}28` }}>
              <Play size={11} style={{ color: primary }} />
              <span className="text-xs font-bold tracking-widest uppercase" style={{ color: primary }}>
                Live Demo
              </span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-3xl md:text-5xl font-extrabold leading-tight mb-4"
              style={{ color: pax26?.textPrimary }}>
              See Pax26 AI{" "}
              <span className="dm-serif" style={{ color: primary }}>in action</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-base max-w-xl mx-auto"
              style={{ color: pax26?.textSecondary, opacity: 0.65 }}>
              Watch real AI conversations across three common business scenarios — auto-reply, follow-up and lead qualification.
            </motion.p>
          </div>

          {/* ── Tabs ────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex justify-center gap-3 mb-10 flex-wrap">
            {SCENARIOS.map((s, i) => {
              const TabIcon = s.icon;
              const active  = activeTab === i;
              return (
                <button key={i}
                  onClick={() => setActiveTab(i)}
                  className="dm-tab flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold"
                  style={{
                    background: active ? s.color : pax26?.bg,
                    color:      active ? "#fff"  : pax26?.textSecondary,
                    border:    `1px solid ${active ? s.color : pax26?.border}`,
                    boxShadow:  active ? `0 6px 20px ${s.color}40` : "none",
                  }}>
                  <TabIcon size={15} />
                  {s.label}
                </button>
              );
            })}
          </motion.div>

          {/* ── Chat + context panel ────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">

            {/* chat */}
            <AnimatePresence mode="wait">
              <motion.div key={`chat-${activeTab}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}>
                <ChatWindow scenario={SCENARIOS[activeTab]} pax26={pax26} />
              </motion.div>
            </AnimatePresence>

            {/* context */}
            <AnimatePresence mode="wait">
              <motion.div key={`ctx-${activeTab}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}>
                <ContextPanel scenario={SCENARIOS[activeTab]} pax26={pax26} />
              </motion.div>
            </AnimatePresence>
          </motion.div>

        </div>
      </section>
    </>
  );
}