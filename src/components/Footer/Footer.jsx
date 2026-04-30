"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import SocialIcons from "../SocialIcons/SocialIcons";
import { useGlobalContext } from "../Context";
import { ArrowUp, Bot, Zap, Wifi, Tv, CreditCard, Phone, Database } from "lucide-react";
import { usePathname } from "next/navigation";

/* ── Keyframes + font only ───────────────────────────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Syne:wght@600;700;800&display=swap');

  .ft-root { font-family: 'Syne', sans-serif; }
  .ft-mono { font-family: 'DM Mono', monospace; }

  @keyframes ft-slide-up {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes ft-spin { to { transform: rotate(360deg); } }
  @keyframes ft-bounce-in {
    0%   { transform: translateY(20px); opacity: 0; }
    60%  { transform: translateY(-4px); opacity: 1; }
    100% { transform: translateY(0); }
  }
  @keyframes ft-pulse {
    0%,100% { opacity: 1; }
    50%     { opacity: 0.5; }
  }

  .ft-spin      { animation: ft-spin 0.7s linear infinite; }
  .ft-bounce-in { animation: ft-bounce-in 0.4s cubic-bezier(0.22,1,0.36,1) both; }
  .ft-pulse     { animation: ft-pulse 2s ease-in-out infinite; }

  .ft-link {
    transition: color 0.15s ease, padding-left 0.15s ease;
    display: flex; align-items: center; gap: 6px;
  }
  .ft-link:hover { padding-left: 4px; }

  .ft-input:focus { outline: none; border-color: #3b82f6 !important; box-shadow: 0 0 0 3px rgba(59,130,246,0.15); }

  .ft-back-top {
    transition: transform 0.2s ease, opacity 0.2s ease;
  }
  .ft-back-top:hover { transform: translateY(-3px); }

  .ft-sub-btn { transition: opacity 0.15s ease, transform 0.15s ease; }
  .ft-sub-btn:hover:not(:disabled) { opacity: 0.85; transform: translateY(-1px); }
  .ft-sub-btn:disabled { opacity: 0.5; cursor: not-allowed; }
`;

/* ── Nav link ─────────────────────────────────────────────────── */
function FootLink({ href, icon, children, textColor, textColorHover }) {
  return (
    <li>
      <a href={href}
        className="ft-link text-sm"
        style={{ color: textColor }}>
        {icon && <span className="opacity-50 flex-shrink-0">{icon}</span>}
        {children}
      </a>
    </li>
  );
}

/* ── Section heading ──────────────────────────────────────────── */
function ColHead({ children, textColor }) {
  return (
    <h3 className="ft-mono text-xs font-medium uppercase tracking-widest mb-5"
      style={{ color: textColor }}>
      {children}
    </h3>
  );
}

/* ── Main footer ──────────────────────────────────────────────── */
const Footer = () => {
  const { pax26 } = useGlobalContext();
  const pathName = usePathname();

  // Derive semi-transparent variants from the theme
  const linkColor      = pax26.textSecondary;
  const headingColor   = pax26.textSecondary;
  const mutedColor     = pax26.textSecondary;
  const chipBg         = pax26.border;
  const dividerColor   = pax26.border;
  const inputBg        = pax26.secondaryBg;
  const inputBorder    = pax26.border;

  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [message, setMsg] = useState("");
  const [atTop, setAtTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setAtTop(window.scrollY > 400);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const backTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const handleSubscribe = async (e) => {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await axios.post("/api/newsletter", { email });
      setStatus("success");
      setMsg(res.data.message);
      setEmail("");
    } catch (err) {
      setStatus("error");
      setMsg(err.response?.data?.message || "Something went wrong. Try again.");
    }
  };

  if (pathName === "/reset-password" ||
      pathName === "/automations/pax" ||
      pathName === "/verify-user"
    ) return null;

  const year = new Date().getFullYear();

  return (
    <>
      <style>{CSS}</style>

      {/* ── Back-to-top FAB ───────────────────────────────── */}
      {atTop && (
        <button
          onClick={backTop}
          className="ft-back-top ft-bounce-in fixed bottom-6 left-4 z-50 w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
          style={{ background: pax26.secondaryBg, border: `1px solid ${pax26.border}` }}
          aria-label="Back to top"
        >
          <ArrowUp size={16} style={{ color: pax26.textSecondary }} />
        </button>
      )}

      <footer className="ft-root relative overflow-hidden" style={{ backgroundColor: pax26.header }}>

        {/* ── Subtle grid texture ────────────────────────── */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.025]"
          style={{
            backgroundImage: `linear-gradient(${pax26.textPrimary} 1px, transparent 1px), linear-gradient(90deg, ${pax26.textPrimary} 1px, transparent 1px)`,
            backgroundSize: "48px 48px",
          }} />

        {/* ── Top gradient accent ────────────────────────── */}
        <div className="h-px w-full"
          style={{ background: "linear-gradient(90deg, transparent, rgba(59,130,246,0.5), rgba(99,102,241,0.4), transparent)" }} />

        <div className="relative max-w-6xl mx-auto px-5 py-16 lg:px-8">

          {/* ── Main grid ─────────────────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">

            {/* ── Brand col ─────────────────────────────── */}
            <div className="sm:col-span-2 lg:col-span-1">
              {/* logo wordmark */}
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
                  <Bot size={16} className="text-blue-400" />
                </div>
                <span className="font-extrabold text-lg tracking-tight" style={{ color: pax26.textPrimary }}>Pax26</span>
              </div>

              <p className="text-sm leading-relaxed mb-5" style={{ color: mutedColor }}>
                AI-powered WhatsApp automation and digital services for Nigerian businesses.
                Smart follow-ups, chatbots, and instant VTU — all in one place.
              </p>

              {/* tag chips */}
              <div className="flex flex-wrap gap-2">
                {["AI Automation", "Digital Services", "WhatsApp API"].map(t => (
                  <span key={t}
                    className="ft-mono text-[10px] font-medium px-2.5 py-1 rounded-lg"
                    style={{ background: inputBg, border: `1px solid ${pax26.border}`, color: mutedColor }}>
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* ── AI Automation col ─────────────────────── */}
            <div>
              <ColHead textColor={headingColor}>AI Automation</ColHead>
              <ul className="space-y-3">
                <FootLink href="/dashboard/automations" icon={<Wifi size={13} />} textColor={linkColor}>WhatsApp Automation</FootLink>
                <FootLink href="/dashboard/automations" icon={<Bot size={13} />} textColor={linkColor}>AI Business Chatbot</FootLink>
                <FootLink href="/dashboard/automations" icon={<Zap size={13} />} textColor={linkColor}>Automated Follow-ups</FootLink>
                <FootLink href="/dashboard/automations" icon={<Zap size={13} />} textColor={linkColor}>Lead Qualification</FootLink>
              </ul>
            </div>

            {/* ── Digital Services col ──────────────────── */}
            <div>
              <ColHead textColor={headingColor}>Digital Services</ColHead>
              <ul className="space-y-3">
                <FootLink href="/dashboard/services/buy-data" icon={<Database size={13} />} textColor={linkColor}>Buy Data</FootLink>
                <FootLink href="/dashboard/services/buy-airtime" icon={<Phone size={13} />} textColor={linkColor}>Airtime Recharge</FootLink>
                <FootLink href="/dashboard" icon={<Zap size={13} />} textColor={linkColor}>Electricity Bills</FootLink>
                <FootLink href="/dashboard/services/buy-tv" icon={<Tv size={13} />} textColor={linkColor}>TV Subscription</FootLink>
                <FootLink href="/dashboard#VTU" icon={<CreditCard size={13} />} textColor={linkColor}>Gift Cards</FootLink>
              </ul>
            </div>

            {/* ── Legal & Company col ─────────────────────── */}
            <div>
              <ColHead textColor={headingColor}>Company</ColHead>
              <ul className="space-y-3">
                <FootLink href="/about" textColor={linkColor}>About Us</FootLink>
                <FootLink href="/blog" textColor={linkColor}>Blog</FootLink>
                <FootLink href="/contact" textColor={linkColor}>Contact</FootLink>
              </ul>

              <ColHead textColor={headingColor}>Legal</ColHead>
              <ul className="space-y-3">
                <FootLink href="/terms" textColor={linkColor}>Terms of Service</FootLink>
                <FootLink href="/privacy" textColor={linkColor}>Privacy Policy</FootLink>
              </ul>
            </div>

            {/* ── Newsletter col ────────────────────────── */}
            <div>
              <ColHead textColor={headingColor}>Stay Updated</ColHead>
              <p className="text-sm leading-relaxed mb-5" style={{ color: mutedColor }}>
                New AI tools, product features and exclusive offers — straight to your inbox.
              </p>

              <form onSubmit={handleSubscribe} className="space-y-2">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="ft-input w-full px-4 py-2.5 rounded-xl text-sm"
                  style={{ background: inputBg, border: `1px solid ${inputBorder}`, color: pax26.textPrimary }}
                />
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="ft-sub-btn w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white bg-blue-600"
                  style={{ boxShadow: "0 8px 24px rgba(59,130,246,0.3)" }}
                >
                  {status === "loading"
                    ? <><span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white ft-spin" />Subscribing…</>
                    : "Subscribe"
                  }
                </button>
              </form>

              {status !== "idle" && (
                <p className={`mt-2.5 ft-mono text-xs leading-relaxed ${status === "success" ? "text-green-400" : "text-red-400"}`}>
                  {status === "success" ? "✓ " : "✕ "}{message}
                </p>
              )}
            </div>
          </div>

          {/* ── Divider ───────────────────────────────────── */}
          <div className="h-px w-full mb-8"
            style={{ background: dividerColor }} />

          {/* ── Bottom row: social + copyright ────────────── */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            {/* social icons */}
            <div className="flex items-center gap-3">
              <SocialIcons />
            </div>

            {/* live status dot + copyright */}
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
                style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.15)" }}>
                <span className="ft-pulse w-1.5 h-1.5 rounded-full block bg-green-500" />
                <span className="ft-mono text-[10px] text-green-400">All systems operational</span>
              </div>

              <p className="ft-mono text-[11px]" style={{ color: mutedColor }}>
                © {year} PAX26 TECHNOLOGIES. All rights reserved.
              </p>
            </div>
          </div>

        </div>
      </footer>
    </>
  );
};

export default Footer;