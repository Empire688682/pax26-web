"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import { useGlobalContext } from "../Context";

/* ─── Minimal CSS — only what Tailwind can't do ───────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@1,700;1,900&family=Syne:wght@400;600;700;800&display=swap');

  .al-root { font-family: 'Syne', sans-serif; }
  .al-serif { font-family: 'Playfair Display', serif; font-style: italic; }

  @keyframes al-float  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-18px)} }
  @keyframes al-marquee{ from{transform:translateX(0)} to{transform:translateX(-50%)} }
  @keyframes al-bubble { from{opacity:0;transform:translateY(8px) scale(0.95)} to{opacity:1;transform:translateY(0) scale(1)} }
  @keyframes al-spin   { to{transform:rotate(360deg)} }
  @keyframes al-ping   { 0%,100%{opacity:.3;transform:scale(1)} 50%{opacity:.08;transform:scale(1.15)} }

  .al-orb      { animation: al-float   7s ease-in-out       infinite; }
  .al-orb-b    { animation: al-float   7s ease-in-out -3.5s infinite; }
  .al-marquee  { animation: al-marquee 20s linear           infinite; width:max-content; }
  .al-marquee:hover { animation-play-state:paused; }
  .al-spin     { animation: al-spin    14s linear           infinite; }
  .al-ping     { animation: al-ping    2s  ease-in-out      infinite; }
  .al-bubble   { animation: al-bubble  0.3s ease both; }

  .al-card { transition: transform .22s ease, box-shadow .22s ease; }
  .al-card:hover { transform: translateY(-4px); }
  .al-pill { transition: transform .2s ease; }
  .al-pill:hover { transform: translateX(5px); }
  .al-btn  { transition: transform .18s ease, opacity .18s ease; }
  .al-btn:hover  { transform: translateY(-2px); opacity: .88; }
`;

/* ─── Icons ───────────────────────────────────────────────────── */
const IcoMsg    = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;
const IcoBot    = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" y1="16" x2="8.01" y2="16"/><line x1="16" y1="16" x2="16.01" y2="16"/></svg>;
const IcoZap    = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>;
const IcoCal    = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const IcoShield = () => <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>;
const IcoArrow  = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>;
const IcoCheck  = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;

/* ─── Scroll reveal ───────────────────────────────────────────── */
function Reveal({ children, delay = 0 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}>
      {children}
    </motion.div>
  );
}

/* ─── Section eyebrow label ───────────────────────────────────── */
function Label({ text, primary }) {
  return (
    <div className="flex items-center gap-3 mb-3">
      <div className="h-0.5 w-8 rounded-full" style={{ background: primary }} />
      <span className="text-xs font-bold tracking-widest uppercase" style={{ color: primary }}>{text}</span>
    </div>
  );
}

/* ─── Live WhatsApp chat mockup ───────────────────────────────── */
const MSGS = [
  { from: "user", text: "Hi! Do you have the red sneakers in size 42?",              t: 0    },
  { from: "bot",  text: "Hey! 👋 Yes, in stock! Want me to reserve a pair?",         t: 900  },
  { from: "user", text: "Yes please! How much?",                                      t: 1800 },
  { from: "bot",  text: "₦18,500. I can send a payment link right now 🔗",           t: 2700 },
  { from: "user", text: "Perfect!",                                                   t: 3400 },
  { from: "bot",  text: "Done ✅ Order ready in 2 hrs. Thanks for shopping with us!", t: 4300 },
];

function ChatMockup({ pax26 }) {
  const GREEN = "#22C55E";
  const [visible, setVisible] = useState(0);

  useEffect(() => {
    const timers = MSGS.map((m, i) => setTimeout(() => setVisible(i + 1), m.t + 500));
    const reset  = setTimeout(() => setVisible(0), 8600);
    return () => { timers.forEach(clearTimeout); clearTimeout(reset); };
  }, [visible]);

  return (
    <div className="w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl"
      style={{ background: pax26?.bg, border: `1px solid ${pax26?.border}` }}>

      {/* top bar */}
      <div className="flex items-center gap-3 px-4 py-3.5" style={{ background: GREEN }}>
        <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: "rgba(255,255,255,0.2)", color: "#fff" }}>
          <IcoBot />
        </div>
        <div>
          <p className="text-sm font-bold text-white leading-none mb-1">PaxAI Assistant</p>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full al-ping block bg-green-200" />
            <span className="text-xs text-white/70">Online · replies instantly</span>
          </div>
        </div>
      </div>

      {/* messages */}
      <div className="p-4 flex flex-col gap-2.5 min-h-64">
        {MSGS.slice(0, visible).map((m, i) => (
          <div key={i} className={`flex al-bubble ${m.from === "user" ? "justify-end" : "justify-start"}`}>
            <div className="max-w-[78%] px-3 py-2 text-sm leading-relaxed"
              style={{
                borderRadius: m.from === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                background: m.from === "user" ? GREEN : pax26?.secondaryBg,
                color: m.from === "user" ? "#fff" : pax26?.textPrimary,
                border: m.from === "bot" ? `1px solid ${pax26?.border}` : "none",
              }}>
              {m.text}
            </div>
          </div>
        ))}
        {visible > 0 && visible < MSGS.length && (
          <div className="flex gap-1 pl-1 items-center">
            {[0, 1, 2].map(i => (
              <div key={i} className="w-1.5 h-1.5 rounded-full"
                style={{ background: pax26?.textSecondary, opacity: 0.35,
                  animation: `al-bubble 0.6s ease ${i * 0.15}s infinite alternate` }} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Page ────────────────────────────────────────────────────── */
export default function AiAutomationLandingPage() {
  const { pax26, router } = useGlobalContext();
  const primary = pax26?.primary || "#3B82F6";

  const GREEN = "#22C55E";
  const AMBER = "#F59E0B";
  const TEAL  = "#06B6D4";
  const ROSE  = "#F43F5E";

  const features = [
    { icon: <IcoMsg />, color: GREEN, title: "WhatsApp Auto-Replies", desc: "Instantly respond to every customer, 24/7. Never miss a lead — even at 3am." },
    { icon: <IcoBot />, color: TEAL,  title: "AI Chatbot Brain",      desc: "Your AI learns your tone, services and FAQs, then replies exactly like your brand." },
    { icon: <IcoZap />, color: AMBER, title: "Lead Follow-up",        desc: "Auto-follow warm leads, send reminders, and re-engage cold prospects hands-free." },
    { icon: <IcoCal />, color: ROSE,  title: "Appointment Reminders", desc: "Send booking confirmations, reminders and post-visit messages automatically." },
  ];

  const steps = [
    { n: "01", title: "Train Your AI",       desc: "Feed the bot your business info, tone, and FAQs in under 5 minutes." },
    { n: "02", title: "Set Your Rules",      desc: "Define triggers — new message, keyword, payment — and what happens next." },
    { n: "03", title: "Go Live",             desc: "Activate and watch your AI handle conversations and follow-ups around the clock." },
  ];

  const usecases = [
    { icon: <IcoMsg />, color: GREEN, text: "WhatsApp Customer Support & Auto-Replies"    },
    { icon: <IcoZap />, color: AMBER, text: "Lead Capture & Intelligent Follow-Ups"       },
    { icon: <IcoBot />, color: TEAL,  text: "Order, Payment & Subscription Notifications" },
    { icon: <IcoCal />, color: ROSE,  text: "Appointment Booking & Reminder Automation"   },
  ];

  const marquee = ["WhatsApp AI", "·", "Lead Follow-up", "·", "24/7 Replies", "·", "Smart Automation", "·", "Business Growth", "·", "Zero Missed Leads", "·"];

  return (
    <>
      <style>{CSS}</style>
      <div className="al-root max-w-7xl mx-auto">

        {/* ════════════════════════════ HERO ════════════════════════════ */}
        <section className="relative pt-20 pb-16 overflow-hidden">
          {/* decorative orbs */}
          <div className="al-orb absolute -top-16 -right-24 w-80 h-80 rounded-full pointer-events-none"
            style={{ background: `${primary}15`, filter: "blur(72px)" }} />
          <div className="al-orb-b absolute bottom-0 -left-16 w-56 h-56 rounded-full pointer-events-none"
            style={{ background: `${GREEN}10`, filter: "blur(60px)" }} />

          <div className="relative z-10 flex flex-col lg:flex-row gap-14 items-center">
            {/* left: copy */}
            <div className="flex-1">
              {/* eyebrow pill */}
              <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full mb-6"
                style={{ background: `${primary}12`, border: `1px solid ${primary}28` }}>
                <span className="w-2 h-2 rounded-full block al-ping" style={{ background: GREEN }} />
                <span className="text-xs font-bold tracking-widest uppercase" style={{ color: primary }}>
                  AI-Powered WhatsApp Automation
                </span>
              </motion.div>

              {/* headline — 3-line stagger */}
              <div className="mb-6 space-y-1">
                {[
                  { text: "Your Business,",  serif: false },
                  { text: "Always On.",      serif: false },
                  { text: "Always Closing.", serif: true  },
                ].map((l, i) => (
                  <motion.span key={i} className="block"
                    initial={{ opacity: 0, y: 28 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: i * 0.13, ease: [0.22, 1, 0.36, 1] }}
                    style={{
                      fontSize: "clamp(32px, 6vw, 58px)",
                      fontWeight: l.serif ? 700 : 800,
                      fontFamily: l.serif ? "'Playfair Display',serif" : "'Syne',sans-serif",
                      fontStyle: l.serif ? "italic" : "normal",
                      lineHeight: 1.1,
                      color: l.serif ? primary : pax26?.textPrimary,
                    }}>
                    {l.text}
                  </motion.span>
                ))}
              </div>

              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                className="text-base leading-relaxed mb-8 max-w-md"
                style={{ color: pax26?.textSecondary, opacity: 0.7 }}>
                Automatically reply to customers, capture leads, and convert conversations into revenue — powered by AI trained on your business.
              </motion.p>

              {/* CTA row */}
              <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
                className="flex flex-wrap gap-3 mb-6">
                <button className="al-btn flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold text-white"
                  onClick={() => router.push("market-place")}
                  style={{ background: primary, boxShadow: `0 12px 32px ${primary}40` }}>
                  Start Free Automation <IcoArrow />
                </button>
                <button className="al-btn flex items-center gap-2 px-5 py-3.5 rounded-xl text-sm font-semibold"
                  onClick={() => router.push("/dashboard/automations/training")}
                  style={{ background: pax26?.secondaryBg, color: pax26?.textPrimary, border: `1px solid ${pax26?.border}` }}>
                  Train Your AI
                </button>
              </motion.div>

              {/* micro trust */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
                className="flex flex-wrap gap-4">
                {["✓ No technical skills", "✓ Live in 5 minutes", "✓ Active 24/7"].map(t => (
                  <span key={t} className="text-xs font-medium" style={{ color: pax26?.textSecondary, opacity: 0.5 }}>{t}</span>
                ))}
              </motion.div>
            </div>

            {/* right: animated chat */}
            <motion.div className="w-full lg:w-auto flex justify-center"
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}>
              <ChatMockup pax26={pax26} />
            </motion.div>
          </div>
        </section>

        {/* ════════════════════════════ MARQUEE ════════════════════════ */}
        <div className="overflow-hidden -mx-5 py-4"
          style={{ borderTop: `1px solid ${pax26?.border}`, borderBottom: `1px solid ${pax26?.border}` }}>
          <div className="flex al-marquee">
            {[...marquee, ...marquee].map((item, i) => (
              <span key={i} className="px-5 text-xs font-bold tracking-widest uppercase whitespace-nowrap"
                style={{ color: item === "·" ? primary : pax26?.textSecondary, opacity: item === "·" ? 1 : 0.4 }}>
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* ════════════════════════════ FEATURES ═══════════════════════ */}
        <section className="py-20">
          <Reveal>
            <Label text="What You Get" primary={primary} />
            <h2 className="text-3xl md:text-4xl font-extrabold leading-tight mb-12 max-w-xl"
              style={{ color: pax26?.textPrimary }}>
              Everything your business needs to{" "}
              <span className="al-serif" style={{ color: primary }}>automate and grow</span>
            </h2>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((f, i) => (
              <Reveal key={i} delay={i * 0.08}>
                <div className="al-card relative rounded-2xl p-6 h-full overflow-hidden"
                  style={{ background: pax26?.bg, border: `1px solid ${pax26?.border}` }}>
                  <div className="absolute -top-5 -right-5 w-24 h-24 rounded-full pointer-events-none"
                    style={{ background: `${f.color}14`, filter: "blur(28px)" }} />
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-5"
                    style={{ background: `${f.color}14`, color: f.color }}>
                    {f.icon}
                  </div>
                  <h3 className="text-sm font-bold mb-2" style={{ color: pax26?.textPrimary }}>{f.title}</h3>
                  <p className="text-xs leading-relaxed" style={{ color: pax26?.textSecondary, opacity: 0.65 }}>{f.desc}</p>
                  <div className="flex items-center gap-1.5 mt-5 text-xs font-semibold" style={{ color: f.color }}>
                    Learn more <IcoArrow />
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ════════════════════════════ HOW IT WORKS ═══════════════════ */}
        <section className="relative rounded-3xl p-10 md:p-14 mb-20 overflow-hidden"
          style={{ background: pax26?.secondaryBg, border: `1px solid ${pax26?.border}` }}>
          <div className="al-orb absolute -top-20 -right-20 w-96 h-96 rounded-full pointer-events-none"
            style={{ background: `${primary}08`, filter: "blur(80px)" }} />

          <Reveal>
            <Label text="How It Works" primary={primary} />
            <h2 className="text-3xl md:text-4xl font-extrabold mb-12" style={{ color: pax26?.textPrimary }}>
              Up and running in{" "}
              <span className="al-serif" style={{ color: primary }}>3 steps</span>
            </h2>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative z-10">
            {steps.map((s, i) => (
              <Reveal key={i} delay={i * 0.1}>
                <div>
                  <div className="al-serif font-black mb-2 select-none"
                    style={{ fontSize: "52px", lineHeight: 1, color: primary, opacity: 0.12 }}>
                    {s.n}
                  </div>
                  <h3 className="text-lg font-bold mb-2" style={{ color: pax26?.textPrimary }}>{s.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: pax26?.textSecondary, opacity: 0.65 }}>{s.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ════════════════════════════ USE CASES ══════════════════════ */}
        <section className="mb-20">
          <Reveal>
            <Label text="Use Cases" primary={primary} />
            <h2 className="text-3xl md:text-4xl font-extrabold mb-10" style={{ color: pax26?.textPrimary }}>
              What you can{" "}
              <span className="al-serif" style={{ color: primary }}>automate today</span>
            </h2>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {usecases.map((u, i) => (
              <Reveal key={i} delay={i * 0.07}>
                <div className="al-pill flex items-center gap-4 p-4 rounded-2xl"
                  style={{ background: pax26?.bg, border: `1px solid ${pax26?.border}` }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${u.color}14`, color: u.color }}>
                    {u.icon}
                  </div>
                  <p className="text-sm font-semibold" style={{ color: pax26?.textPrimary }}>{u.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ════════════════════════════ SECURITY ═══════════════════════ */}
        <Reveal>
          <section className="flex flex-col sm:flex-row items-center gap-10 rounded-3xl p-10 mb-20"
            style={{ background: pax26?.bg, border: `1px solid ${pax26?.border}` }}>
            {/* spinning shield ring */}
            <div className="relative w-24 h-24 flex-shrink-0">
              <svg className="al-spin absolute inset-0 w-full h-full" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="46" fill="none" stroke={`${primary}22`} strokeWidth="2" strokeDasharray="8 6" />
              </svg>
              <div className="absolute inset-3.5 rounded-full flex items-center justify-center"
                style={{ background: `${primary}10`, border: `2px solid ${primary}28`, color: primary }}>
                <IcoShield />
              </div>
            </div>

            <div className="flex-1">
              <h3 className="text-xl font-extrabold mb-2" style={{ color: pax26?.textPrimary }}>
                Secure, Reliable & Scalable
              </h3>
              <p className="text-sm leading-relaxed mb-5 max-w-lg"
                style={{ color: pax26?.textSecondary, opacity: 0.65 }}>
                Enterprise-grade infrastructure protects your data and conversations. All automation rules stay fully under your control — no black boxes.
              </p>
              <div className="flex flex-wrap gap-2">
                {["End-to-end encrypted", "GDPR compliant", "99.9% uptime SLA", "You own your data"].map(t => (
                  <span key={t} className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full"
                    style={{ background: `${primary}10`, color: primary, border: `1px solid ${primary}20` }}>
                    <IcoCheck /> {t}
                  </span>
                ))}
              </div>
            </div>
          </section>
        </Reveal>

        {/* ════════════════════════════ FINAL CTA ══════════════════════ */}
        <Reveal>
          <section className="relative rounded-3xl overflow-hidden text-center p-14 md:p-20 mb-24"
            style={{ background: pax26?.secondaryBg, border: `1px solid ${pax26?.border}` }}>
            {/* orbs */}
            <div className="al-orb absolute -top-16 -left-12 w-72 h-72 rounded-full pointer-events-none"
              style={{ background: `${primary}16`, filter: "blur(72px)" }} />
            <div className="al-orb-b absolute -bottom-12 -right-10 w-60 h-60 rounded-full pointer-events-none"
              style={{ background: `${GREEN}10`, filter: "blur(60px)" }} />
            {/* subtle grid */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.035]"
              style={{
                backgroundImage: `linear-gradient(${pax26?.textPrimary} 1px, transparent 1px), linear-gradient(90deg, ${pax26?.textPrimary} 1px, transparent 1px)`,
                backgroundSize: "40px 40px",
              }} />

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full mb-6"
                style={{ background: `${primary}12`, border: `1px solid ${primary}28` }}>
                <span className="w-2 h-2 rounded-full al-ping block" style={{ background: GREEN }} />
                <span className="text-xs font-bold tracking-widest uppercase" style={{ color: primary }}>
                  Ready in under 5 minutes
                </span>
              </div>

              <h2 className="text-4xl md:text-5xl font-black leading-tight mb-4"
                style={{ color: pax26?.textPrimary }}>
                Start Automating{" "}
                <span className="al-serif" style={{ color: primary }}>Your WhatsApp</span>
                <br />Today
              </h2>
              <p className="text-base leading-relaxed max-w-md mx-auto mb-10"
                style={{ color: pax26?.textSecondary, opacity: 0.65 }}>
                Respond faster, capture more leads, and grow your business automatically. No tech skills required.
              </p>

              <div className="flex flex-wrap gap-3 justify-center">
                <button className="al-btn flex items-center gap-2 px-8 py-4 rounded-xl text-base font-bold text-white"
                  onClick={() => router.push("/dashboard/automations/market-place")}
                  style={{ background: primary, boxShadow: `0 14px 40px ${primary}42` }}>
                  Create Automation <IcoArrow />
                </button>
                <button className="al-btn flex items-center gap-2 px-6 py-4 rounded-xl text-sm font-semibold"
                  onClick={() => router.push("/dashboard/automations/training")}
                  style={{ background: pax26?.bg, color: pax26?.textPrimary, border: `1px solid ${pax26?.border}` }}>
                  Train Your AI First
                </button>
              </div>
            </div>
          </section>
        </Reveal>

      </div>
    </>
  );
}