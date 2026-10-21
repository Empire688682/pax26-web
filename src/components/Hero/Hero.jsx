"use client";

import { useEffect, useState, useRef } from "react";
import { useGlobalContext } from "../Context";
import {
  ArrowRight, Bot, Shield
} from "lucide-react";

/* ─── Injected styles ─────────────────────────────────────────────────── */
const CSS = `
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

  /* Headline — prevent overflow on very narrow screens */
  .hr-headline {
    font-size: clamp(28px, 8vw, 58px);
    line-height: 1.1;
    word-break: break-word;
    overflow-wrap: break-word;
    hyphens: manual;
  }
  /* Slightly larger once we have real breathing room */
  @media (min-width: 400px) { .hr-headline { font-size: clamp(30px, 7vw, 58px); } }
  @media (min-width: 640px) { .hr-headline { font-size: clamp(34px, 6.5vw, 58px); } }

  /* Primary CTA: full-width on narrow screens, auto width on larger */
  .hr-cta-primary {
    width: 100%;
  }
  @media (min-width: 480px) { .hr-cta-primary { width: auto; } }

  /* CTA row: stack on narrow, side-by-side on 480px+ */
  .hr-cta-row {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  @media (min-width: 480px) {
    .hr-cta-row {
      flex-direction: row;
      flex-wrap: wrap;
      gap: 12px;
    }
  }

  @keyframes hr-fade-up {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .hr-fade-up { animation: hr-fade-up 0.5s ease both; }

  /* Chat demo: hidden on very small screens to keep hero compact */
  .hr-chat-demo-wrap {
    display: none;
  }
  @media (min-width: 380px) {
    .hr-chat-demo-wrap {
      display: flex;
    }
  }
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
    <div
      role="region"
      aria-label="Pax26 AI WhatsApp Sales Agent Demo"
      className="w-full max-w-[300px] sm:max-w-[320px] rounded-3xl overflow-hidden shadow-2xl border border-white/10"
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
        style={{ backgroundImage: "url('/images/whatsapp-bg.webp')", backgroundSize: "contain" }}>
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

/* ─── Marquee items ───────────────────────────────────────────────────── */
const TICKER = [
  "Pax26 × WhatsApp", "·", "WhatsApp Business API", "·", "Online Store Builder", "·",
  "AI Sales Agent", "·", "WhatsApp Commerce", "·", "CAC Registered RC 9411144", "·",
  "Most Affordable in NG 🇳🇬", "·", "24/7 Auto-Replies", "·",
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

  return (
    <>
      <style>{CSS}</style>

      {/* ══ HERO SECTION ════════════════════════════════════════════ */}
      <section
        className="hr-root relative overflow-hidden"
        style={{ background: bg, minHeight: "100svh", display: "flex", flexDirection: "column" }}
      >

        {/* ── Ambient orbs (radial-gradient, no GPU blur cost) ────── */}
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="hr-orb1 absolute -top-24 -left-24 w-[380px] h-[380px] rounded-full"
            style={{ background: `radial-gradient(circle at 40% 40%, ${p}28 0%, transparent 70%)` }} />
          <div className="hr-orb2 absolute -bottom-16 -right-16 w-[320px] h-[320px] rounded-full"
            style={{ background: `radial-gradient(circle at 60% 60%, ${WA}22 0%, transparent 70%)` }} />
          {/* dot grid */}
          <div className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(${tp || "#000"} 1px, transparent 1px)`,
              backgroundSize: "32px 32px", opacity: .04,
            }} />
        </div>

        {/* ── Main content ──────────────────────────────────────── */}
        <div className="relative flex-1 max-w-8xl mx-auto w-full px-4 sm:px-6 lg:px-6
                        flex flex-col justify-center pt-20 pb-6 sm:pt-28 sm:pb-4">

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">

            {/* ══ LEFT ════════════════════════════════════════════ */}
            <div className="flex flex-col gap-3 sm:gap-5">

              {/* Eyebrow — Audience indicator */}
              <div className="self-start hr-fade-up">
                <div
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-md border text-[10px] sm:text-[11px] font-bold tracking-wider uppercase"
                  style={{
                    background: `${WA}08`,
                    borderColor: `${WA}25`,
                    color: WA,
                  }}
                >
                  <span className="relative flex h-2 w-2 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  Built for WhatsApp Sellers
                </div>
              </div>

              {/* Headline */}
              <div className="hr-fade-up" style={{ animationDelay: "0.08s" }}>
                <h1
                  className="hr-headline font-black tracking-tight"
                  style={{ color: tp }}
                >
                  Sell More on WhatsApp.{" "}
                  <span className="hr-serif block sm:inline" style={{ color: p }}>
                    Even When You&apos;re Busy.
                  </span>
                </h1>
              </div>

              {/* Sub-text */}
              <p className="hr-fade-up text-[13.5px] sm:text-[15px] leading-relaxed max-w-[540px]"
                style={{ color: ts, opacity: .78, animationDelay: "0.2s" }}>
                Create your online storefront, showcase your products, and let your{" "}
                <strong style={{ color: tp }}>Pax26 sales agent</strong> help customers with
                inquiries and orders — right on{" "}
                <strong style={{ color: tp }}>WhatsApp</strong>.
              </p>

              {/* CTA row */}
              <div className="hr-fade-up flex flex-col gap-2" style={{ animationDelay: "0.4s" }}>
                <div className="hr-cta-row">
                  <button
                    onClick={() => openModal("register")}
                    className="hr-cta hr-cta-primary flex items-center justify-center gap-2 px-6 py-4 sm:py-3.5 rounded-2xl text-[14px] sm:text-[13.5px] font-bold text-white"
                    style={{
                      background: `linear-gradient(135deg,${p},${pax26?.btn || p})`,
                      boxShadow: `0 12px 30px ${p}40`,
                    }}>
                    <svg viewBox="0 0 24 24" width="15" height="15" fill="#fff" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" /><path d="M11.999 2.003C6.476 2.003 2 6.479 2 12.003c0 1.843.484 3.57 1.33 5.065L2.004 22l5.074-1.329A9.935 9.935 0 0012 22.003c5.523 0 9.999-4.476 9.999-10s-4.476-9.997-10-9.997z" fillOpacity=".25" /></svg>
                    Start Selling Free
                    <ArrowRight size={15} />
                  </button>

                  <a
                    href="#masterclass-video"
                    onClick={(e) => {
                      e.preventDefault();
                      const el = document.getElementById("masterclass-video");
                      if (el) el.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="hr-cta flex items-center justify-center gap-2 px-6 py-4 sm:py-3.5 rounded-2xl text-[14px] sm:text-[13.5px] font-bold"
                    style={{ color: tp, border: `1px solid ${bdr}`, background: "transparent" }}>
                    View Demo
                  </a>
                </div>
              </div>

              {/* Trust row */}
              <div className="hr-fade-up flex items-center gap-1.5"
                style={{ animationDelay: "0.5s" }}>
                <Shield size={12} style={{ color: WA }} aria-hidden="true" />
                <span className="text-[11px] font-semibold" style={{ color: ts, opacity: 0.55 }}>
                  Powered by WhatsApp Business API · CAC Registered RC 9411144
                </span>
              </div>
            </div>

            {/* ══ RIGHT — Chat demo ════════════════════════════════ */}
            <div className="hr-chat-demo-wrap hr-fade-up justify-center lg:justify-end" style={{ animationDelay: "0.15s" }}>
              <div className="relative">
                <ChatDemo />
              </div>
            </div>

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