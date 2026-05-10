"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useGlobalContext } from "../Context";
import {
  ArrowRight, Zap, Bot, CreditCard, Smartphone, CheckCircle, Shield
} from "lucide-react";

/* ─── Injected styles ─────────────────────────────────────────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Playfair+Display:ital,wght@1,700&display=swap');

  .hr-root { font-family: 'Inter', sans-serif; }
  .hr-serif { font-family: 'Playfair Display', serif; font-style: italic; }

  @keyframes hr-float  { 0%,100%{transform:translateY(0)}   50%{transform:translateY(-14px)} }
  @keyframes hr-float2 { 0%,100%{transform:translateY(0)}   50%{transform:translateY(10px)}  }
  @keyframes hr-scroll { from{transform:translateX(0)} to{transform:translateX(-50%)} }
  @keyframes hr-pop    { from{opacity:0;transform:translateY(6px) scale(.96)} to{opacity:1;transform:none} }
  @keyframes hr-pulse  { 0%,100%{opacity:1} 50%{opacity:.35} }
  @keyframes hr-typing {
    0%,80%,100%{ transform:scale(1);   opacity:.35 }
    40%        { transform:scale(1.35); opacity:1   }
  }

  .hr-orb1 { animation: hr-float  8s ease-in-out infinite; }
  .hr-orb2 { animation: hr-float2 11s ease-in-out infinite; }
  .hr-scroll { animation: hr-scroll 28s linear infinite; width:max-content; }
  .hr-pulse  { animation: hr-pulse  1.8s ease-in-out infinite; }
  .hr-pop    { animation: hr-pop .35s ease both; }

  .hr-dot1 { animation: hr-typing 1.1s ease-in-out 0s   infinite; }
  .hr-dot2 { animation: hr-typing 1.1s ease-in-out .2s  infinite; }
  .hr-dot3 { animation: hr-typing 1.1s ease-in-out .4s  infinite; }

  .hr-cta {
    position:relative; overflow:hidden;
    transition: transform .22s ease, box-shadow .22s ease;
  }
  .hr-cta:hover { transform:translateY(-2px); }
  .hr-cta::after {
    content:''; position:absolute;
    inset:-50%; background:linear-gradient(45deg,transparent,rgba(255,255,255,.12),transparent);
    transform:rotate(45deg) translateX(-100%);
    transition: transform .55s ease;
  }
  .hr-cta:hover::after { transform:rotate(45deg) translateX(100%); }

  .hr-pill {
    transition: background .18s, border-color .18s, transform .18s;
  }
  .hr-pill:hover { transform:translateY(-2px); }
`;

/* ─── Chat demo messages ──────────────────────────────────────────────── */
const MSGS = [
  { role: "user", text: "Hi! I need Air Max 90 size 42." },
  { role: "bot", text: "Great pick! 🔥 Size 42 available.\nPrice: ₦55,000\n\nSend payment link? 💳", delay: 900 },
  { role: "user", text: "Yes please!", delay: 2100 },
  { role: "bot", text: "✅ Link sent! Ships in 2 hrs.\nThank you for ordering!", delay: 3000 },
];

/* ─── Animated WhatsApp mockup ────────────────────────────────────────── */
function ChatDemo() {
  const [shown, setShown] = useState(0);
  const refs = useRef([]);

  useEffect(() => {
    function run() {
      refs.current.forEach(clearTimeout);
      refs.current = [];
      setShown(0);
      let base = 400;
      MSGS.forEach((m, i) => {
        base += m.delay || 0;
        const t = setTimeout(() => setShown(i + 1), base);
        refs.current.push(t);
        base += 600;
      });
      const restart = setTimeout(run, base + 2800);
      refs.current.push(restart);
    }
    run();
    return () => refs.current.forEach(clearTimeout);
  }, []);

  const nextBot = shown < MSGS.length && MSGS[shown]?.role === "bot";

  return (
    <div className="w-full max-w-[300px] sm:max-w-[320px] rounded-3xl overflow-hidden shadow-2xl border border-white/10"
      style={{ background: "#ECE5DD" }}>
      {/* header */}
      <div className="flex items-center gap-2.5 px-4 py-3" style={{ background: "#075E54" }}>
        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
          <Bot size={15} color="#fff" />
        </div>
        <div>
          <p className="text-[13px] font-bold text-white leading-none">Pax26 Sales Agent</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="hr-pulse w-1.5 h-1.5 rounded-full bg-green-300 block" />
            <span className="text-[10px] text-white/70">online · instant replies</span>
          </div>
        </div>
        {/* WA icon */}
        <div className="ml-auto w-7 h-7 rounded-full bg-white/10 flex items-center justify-center">
          <svg viewBox="0 0 24 24" width="15" height="15" fill="#fff"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" /><path d="M11.999 2.003C6.476 2.003 2 6.479 2 12.003c0 1.843.484 3.57 1.33 5.065L2.004 22l5.074-1.329A9.935 9.935 0 0012 22.003c5.523 0 9.999-4.476 9.999-10s-4.476-9.997-10-9.997z" fillOpacity=".2" /></svg>
        </div>
      </div>
      {/* messages */}
      <div className="p-3 min-h-[200px] flex flex-col gap-2"
        style={{ backgroundImage: "url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')", backgroundSize: "contain" }}>
        {MSGS.slice(0, shown).map((m, i) => (
          <div key={i} className={`hr-pop flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className="max-w-[82%] px-3 py-2 text-[12.5px] leading-snug"
              style={{
                background: m.role === "user" ? "#DCF8C6" : "#fff",
                borderRadius: m.role === "user" ? "14px 14px 3px 14px" : "14px 14px 14px 3px",
                color: "#111", whiteSpace: "pre-line",
                boxShadow: "0 1px 3px rgba(0,0,0,.1)",
              }}>
              {m.text}
            </div>
          </div>
        ))}
        {nextBot && shown > 0 && (
          <div className="hr-pop flex justify-start">
            <div className="px-3.5 py-2.5 rounded-2xl flex gap-1 bg-white shadow-sm">
              <span className="hr-dot1 w-1.5 h-1.5 rounded-full bg-gray-400 block" />
              <span className="hr-dot2 w-1.5 h-1.5 rounded-full bg-gray-400 block" />
              <span className="hr-dot3 w-1.5 h-1.5 rounded-full bg-gray-400 block" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Service chip ────────────────────────────────────────────────────── */
function Chip({ icon: Icon, label, color, border }) {
  return (
    <div className="hr-pill flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold"
      style={{ background: `${color}12`, border: `1px solid ${border}`, color }}>
      <Icon size={11} />
      {label}
    </div>
  );
}

/* ─── Stat block ──────────────────────────────────────────────────────── */
function Stat({ value, label, primary }) {
  return (
    <div className="text-center">
      <p className="text-lg sm:text-xl font-black leading-none" style={{ color: primary }}>{value}</p>
      <p className="text-[10px] mt-0.5 opacity-50 font-medium uppercase tracking-wide">{label}</p>
    </div>
  );
}

/* ─── Floating badge ──────────────────────────────────────────────────── */
function Badge({ children, className = "", bg, border }) {
  return (
    <div className={`absolute z-20 flex items-center gap-2 px-3 py-2 rounded-xl shadow-lg text-xs font-bold ${className}`}
      style={{ background: bg, border: `1px solid ${border}` }}>
      {children}
    </div>
  );
}

/* ─── Marquee items ───────────────────────────────────────────────────── */
const TICKER = [
  "WhatsApp Agent", "·", "Airtime & Data", "·", "Electricity Bills", "·",
  "TV Subscriptions", "·", "No-Code Setup", "·", "24/7 Auto-Replies", "·",
  "Lead Follow-Up", "·", "Instant Activation", "·",
];

/* ═══════════════════════════════════════════════════════════════════════ */
export default function Hero() {
  const { openModal, pax26 } = useGlobalContext();
  const p = pax26?.primary || "#3b82f6";
  const WA = "#25D366";        // WhatsApp green
  const bg = pax26?.bg;
  const tp = pax26?.textPrimary;
  const ts = pax26?.textSecondary;
  const bdr = pax26?.border;

  const chips = [
    { icon: Bot, label: "WhatsApp Sales Agent", color: WA, border: `${WA}40` },
    { icon: CreditCard, label: "Bill Payments", color: p, border: `${p}40` },
    { icon: Smartphone, label: "Airtime & Data", color: "#a855f7", border: "#a855f740" },
  ];

  const stats = [
    { value: "24/7", label: "Always Online" },
    { value: "5 min", label: "Setup Time" },
    { value: "100%", label: "Auto-Reply" },
  ];

  return (
    <>
      <style>{CSS}</style>

      {/* ══ HERO SECTION ════════════════════════════════════════════ */}
      <section
        className="hr-root relative overflow-hidden"
        style={{ background: bg, minHeight: "100svh", display: "flex", flexDirection: "column" }}
      >

        {/* ── Ambient orbs ──────────────────────────────────────── */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="hr-orb1 absolute -top-24 -left-24 w-[380px] h-[380px] rounded-full"
            style={{ background: `radial-gradient(circle,${p}22 0%,transparent 70%)`, filter: "blur(60px)" }} />
          <div className="hr-orb2 absolute -bottom-16 -right-16 w-[320px] h-[320px] rounded-full"
            style={{ background: `radial-gradient(circle,${WA}18 0%,transparent 70%)`, filter: "blur(70px)" }} />
          {/* dot grid */}
          <div className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(${tp || "#000"} 1px, transparent 1px)`,
              backgroundSize: "32px 32px", opacity: .04,
            }} />
        </div>

        {/* ── Main content ──────────────────────────────────────── */}
        <div className="relative flex-1 max-w-8xl mx-auto w-full px-4 sm:px-6 lg:px-6
                        flex flex-col justify-center pt-24 pb-4 sm:pt-28">

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            {/* ══ LEFT ════════════════════════════════════════════ */}
            <div className="flex flex-col gap-4 sm:gap-5">

              {/* Eyebrow */}
              <motion.div
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .5 }}
                className="inline-flex items-center gap-2 self-start px-3.5 py-1.5 rounded-full"
                style={{ background: `${WA}14`, border: `1px solid ${WA}35` }}>
                <span className="hr-pulse w-2 h-2 rounded-full block" style={{ background: WA }} />
                <span className="text-[11px] font-bold tracking-widest uppercase" style={{ color: WA }}>
                  WhatsApp Automation
                </span>
              </motion.div>

              {/* Headline — WhatsApp is the star */}
              <motion.div
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: .65, delay: .08, ease: [.22, 1, .36, 1] }}>
                <h1 style={{ color: tp, lineHeight: 1.08 }}
                  className="text-[clamp(30px,6.5vw,58px)] font-black tracking-tight">
                  Your WhatsApp,<br />
                  <span className="hr-serif" style={{ color: p }}>Now Sells 24/7.</span>
                </h1>
              </motion.div>

              {/* Sub-text — punchy & short */}
              <motion.p
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .3 }}
                className="text-[13.5px] sm:text-[15px] leading-relaxed"
                style={{ color: ts, opacity: .78 }}>
                Pax26 Technologies — a registered Nigerian tech company — turns your WhatsApp into a{" "}
                <strong style={{ color: tp }}>24/7 sales agent</strong> that chats, converts, and closes deals while you sleep.{" "}
                Plus instant airtime, data, bills & TV subscriptions in one platform.
              </motion.p>

              {/* Service chips */}
              <motion.div
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .42 }}
                className="flex flex-wrap gap-2">
                {chips.map((c, i) => <Chip key={i} {...c} />)}
                <div className="hr-pill flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold"
                  style={{ background: `${p}10`, border: `1px solid ${p}30`, color: p }}>
                  <CheckCircle size={11} />
                  No-code setup
                </div>
              </motion.div>

              {/* CTA row */}
              <motion.div
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .54 }}
                className="flex flex-wrap gap-3">
                <button
                  onClick={() => openModal("register")}
                  className="hr-cta flex items-center gap-2 px-6 py-3.5 rounded-2xl text-[13.5px] font-bold text-white"
                  style={{
                    background: `linear-gradient(135deg,${p},${pax26?.btn || p})`,
                    boxShadow: `0 12px 30px ${p}40`,
                  }}>
                  <svg viewBox="0 0 24 24" width="15" height="15" fill="#fff"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" /><path d="M11.999 2.003C6.476 2.003 2 6.479 2 12.003c0 1.843.484 3.57 1.33 5.065L2.004 22l5.074-1.329A9.935 9.935 0 0012 22.003c5.523 0 9.999-4.476 9.999-10s-4.476-9.997-10-9.997z" fillOpacity=".25" /></svg>
                  Automate on WhatsApp
                  <ArrowRight size={15} />
                </button>
                <Link href="#pricing"
                  className="hr-cta flex items-center gap-2 px-6 py-3.5 rounded-2xl text-[13.5px] font-bold"
                  style={{ color: tp, border: `1px solid ${bdr}`, background: "transparent" }}>
                  View Plans
                </Link>
              </motion.div>

              {/* Stats row */}
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .68 }}
                className="flex items-center gap-5 sm:gap-7 pt-1" style={{ color: ts }}>
                {stats.map((s, i) => (
                  <div key={i} className="flex items-center gap-5 sm:gap-7">
                    {i > 0 && <div className="w-px h-8" style={{ background: bdr }} />}
                    <Stat {...s} primary={p} />
                  </div>
                ))}
                <div className="ml-auto flex items-center gap-1.5">
                  <Shield size={12} style={{ color: WA }} />
                  <span className="text-[10px] font-semibold opacity-50">Secure &amp; Trusted</span>
                </div>
              </motion.div>
            </div>

            {/* ══ RIGHT — Chat demo ════════════════════════════════ */}
            <motion.div
              initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: .75, delay: .22, ease: [.22, 1, .36, 1] }}
              className="flex justify-center lg:justify-end">
              <div className="relative">

                {/* floating badge — top left */}
                <motion.div
                  initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: .8 }}
                  style={{ top: "-14px", left: "-16px", background: bg, border: `1px solid ${bdr}` }}
                  className="absolute z-20 flex items-center gap-2 px-3 py-1.5 rounded-xl shadow-lg">
                  <div className="w-5 h-5 rounded-lg flex items-center justify-center"
                    style={{ background: `${WA}20` }}>
                    <Zap size={10} style={{ color: WA }} />
                  </div>
                  <span className="text-[11px] font-bold" style={{ color: tp }}>Agent responding…</span>
                </motion.div>

                <ChatDemo />

                {/* floating badge — bottom right */}
                <motion.div
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: .95 }}
                  style={{ bottom: "-14px", right: "-14px", background: bg, border: `1px solid ${bdr}` }}
                  className="absolute z-20 flex items-center gap-2 px-3 py-1.5 rounded-xl shadow-lg">
                  <span className="hr-pulse w-2 h-2 rounded-full block" style={{ background: WA }} />
                  <span className="text-[11px] font-bold" style={{ color: tp }}>5k+ msgs / day</span>
                </motion.div>
              </div>
            </motion.div>

          </div>{/* /grid */}
        </div>{/* /content */}

        {/* ── Scrolling ticker ──────────────────────────────────── */}
        <div className="relative overflow-hidden mt-auto"
          style={{ borderTop: `1px solid ${bdr}`, borderBottom: `1px solid ${bdr}`, padding: "10px 0" }}>
          <div className="flex hr-scroll select-none pointer-events-none">
            {[...TICKER, ...TICKER].map((item, i) => (
              <span key={i}
                className="px-5 text-[10px] font-bold tracking-widest uppercase whitespace-nowrap"
                style={{ color: item === "·" ? WA : ts, opacity: item === "·" ? 0.9 : 0.45 }}>
                {item}
              </span>
            ))}
          </div>
        </div>

      </section>
    </>
  );
}