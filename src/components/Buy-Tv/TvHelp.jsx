"use client";

import React from "react";
import { useGlobalContext } from "../Context";
import {
  Tv, HelpCircle, CheckCircle2, Info, ShieldCheck,
  Wifi, Clock, CreditCard, ChevronRight
} from "lucide-react";

/* ── No extra CSS needed — uses same Syne/DM Mono from parent ── */

const PROVIDERS = {
  DSTV:      { color: "#0077C8", label: "DSTV",      hint: "Your DSTV smartcard number is printed on the card itself or found in Settings → My Account." },
  GOTV:      { color: "#E87722", label: "GOtv",      hint: "Your GOtv IUC number is on the decoder sticker or in the GOtv app under My Account." },
  STARTIMES: { color: "#D91C2A", label: "Startimes", hint: "Find your Startimes smartcard number on the decoder sticker or box." },
  SHOWMAX:   { color: "#E30613", label: "Showmax",   hint: "Your Showmax subscriber ID is in your account settings on the Showmax app or website." },
};

const STEPS = [
  { icon: <Tv size={14} />,         text: "Select your TV provider" },
  { icon: <CreditCard size={14} />, text: "Enter your smartcard / IUC number" },
  { icon: <Wifi size={14} />,       text: "Choose your preferred package" },
  { icon: <CheckCircle2 size={14} />,text: "Enter phone & PIN, then subscribe" },
];

const FAQS = [
  {
    q: "How long does activation take?",
    a: "Subscriptions are activated within 5 minutes after successful payment.",
  },
  {
    q: "What if I enter the wrong smartcard number?",
    a: "Double-check before subscribing. Wrong numbers cannot be reversed. Verify via the on-screen name before proceeding.",
  },
  {
    q: "Can I pay for someone else's decoder?",
    a: "Yes — just enter their smartcard number. The subscription will activate on their decoder.",
  },
  {
    q: "What happens if payment deducts but subscription fails?",
    a: "Contact support at info@pax26.com — we resolve failed transactions within 24 hours.",
  },
];

/* ── Accordion FAQ item ─────────────────────────────────────── */
function FaqItem({ q, a, pax26, open, onToggle }) {
  return (
    <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${pax26?.border}` }}>
      <button
        className="w-full flex items-center justify-between px-4 py-3 text-left gap-3"
        style={{ background: pax26?.secondaryBg }}
        onClick={onToggle}
      >
        <span className="text-xs font-semibold" style={{ color: pax26?.textPrimary }}>{q}</span>
        <ChevronRight size={13}
          style={{
            color: pax26?.textSecondary,
            opacity: 0.5,
            transform: open ? "rotate(90deg)" : "rotate(0deg)",
            transition: "transform 0.2s ease",
            flexShrink: 0,
          }} />
      </button>
      {open && (
        <div className="px-4 py-3" style={{ background: pax26?.bg }}>
          <p className="text-xs leading-relaxed" style={{ color: pax26?.textSecondary, opacity: 0.7 }}>{a}</p>
        </div>
      )}
    </div>
  );
}

/* ── Main component ─────────────────────────────────────────── */
const TvHelp = ({ data }) => {
  const { pax26 } = useGlobalContext();
  const [openFaq, setOpenFaq] = React.useState(null);

  const primary     = pax26?.primary;
  const GREEN       = "#22c55e";
  const providerKey = data?.provider?.toUpperCase();
  const provider    = PROVIDERS[providerKey];

  return (
    <div className="space-y-4" style={{ fontFamily: "'Syne', sans-serif" }}>

      {/* ── Provider spotlight (dynamic) ──────────────── */}
      {provider ? (
        <div className="rounded-2xl p-5 overflow-hidden relative"
          style={{ background: pax26?.bg, border: `1px solid ${pax26?.border}` }}>
          {/* colour accent strip */}
          <div className="absolute top-0 left-0 right-0 h-1"
            style={{ background: `linear-gradient(90deg, ${provider.color}, ${provider.color}44, transparent)` }} />

          <div className="flex items-center gap-3 mb-3 mt-1">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: `${provider.color}15`, color: provider.color }}>
              <Tv size={17} />
            </div>
            <div>
              <p className="text-sm font-bold" style={{ color: pax26?.textPrimary }}>{provider.label} Selected</p>
              <p style={{ fontFamily: "'DM Mono', monospace" }}
                className="text-[10px]" style={{ color: pax26?.textSecondary, opacity: 0.45 }}>
                Provider active
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-3 rounded-xl"
            style={{ background: `${provider.color}0C`, border: `1px solid ${provider.color}22` }}>
            <Info size={13} style={{ color: provider.color, flexShrink: 0, marginTop: 1 }} />
            <p className="text-xs leading-relaxed" style={{ color: pax26?.textPrimary, opacity: 0.75 }}>
              {provider.hint}
            </p>
          </div>
        </div>
      ) : (
        /* fallback when no provider selected */
        <div className="rounded-2xl p-5 flex items-center gap-4"
          style={{ background: pax26?.bg, border: `1px solid ${pax26?.border}` }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: `${primary}14`, color: primary }}>
            <Tv size={19} />
          </div>
          <div>
            <p className="text-sm font-bold mb-0.5" style={{ color: pax26?.textPrimary }}>
              TV Subscription
            </p>
            <p className="text-xs" style={{ color: pax26?.textSecondary, opacity: 0.55 }}>
              Select a provider on the left to see specific guidance.
            </p>
          </div>
        </div>
      )}

      {/* ── How it works ─────────────────────────────── */}
      <div className="rounded-2xl p-5"
        style={{ background: pax26?.bg, border: `1px solid ${pax26?.border}` }}>
        <div className="flex items-center gap-2 mb-4">
          <HelpCircle size={14} style={{ color: primary }} />
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: pax26?.textPrimary }}>
            How It Works
          </p>
        </div>

        <div className="space-y-1">
          {STEPS.map((s, i) => (
            <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
              style={{ background: pax26?.secondaryBg }}>
              <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold"
                style={{ background: `${primary}15`, color: primary }}>
                {i + 1}
              </div>
              <span style={{ color: pax26?.textSecondary }} className="flex items-center gap-2 text-xs">
                <span style={{ color: primary, opacity: 0.7 }}>{s.icon}</span>
                {s.text}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Quick facts ──────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl p-4 flex flex-col items-center text-center gap-2"
          style={{ background: pax26?.bg, border: `1px solid ${pax26?.border}` }}>
          <Clock size={18} style={{ color: primary }} />
          <p className="text-xs font-bold" style={{ color: pax26?.textPrimary }}>Instant</p>
          <p className="text-[10px]" style={{ color: pax26?.textSecondary, opacity: 0.5 }}>
            Activates within 5 mins
          </p>
        </div>
        <div className="rounded-2xl p-4 flex flex-col items-center text-center gap-2"
          style={{ background: pax26?.bg, border: `1px solid ${pax26?.border}` }}>
          <ShieldCheck size={18} style={{ color: GREEN }} />
          <p className="text-xs font-bold" style={{ color: pax26?.textPrimary }}>Secure</p>
          <p className="text-[10px]" style={{ color: pax26?.textSecondary, opacity: 0.5 }}>
            PIN-protected payments
          </p>
        </div>
      </div>

      {/* ── FAQs ─────────────────────────────────────── */}
      <div className="rounded-2xl p-5"
        style={{ background: pax26?.bg, border: `1px solid ${pax26?.border}` }}>
        <p className="text-xs font-bold uppercase tracking-widest mb-4"
          style={{ color: pax26?.textPrimary }}>
          FAQs
        </p>
        <div className="space-y-2">
          {FAQS.map((f, i) => (
            <FaqItem
              key={i} q={f.q} a={f.a} pax26={pax26}
              open={openFaq === i}
              onToggle={() => setOpenFaq(openFaq === i ? null : i)}
            />
          ))}
        </div>
      </div>

      {/* ── Support note ─────────────────────────────── */}
      <div className="flex items-start gap-3 p-4 rounded-2xl"
        style={{ background: `${GREEN}08`, border: "1px solid rgba(34,197,94,0.18)" }}>
        <ShieldCheck size={15} style={{ color: GREEN, flexShrink: 0, marginTop: 1 }} />
        <p className="text-xs leading-relaxed" style={{ color: pax26?.textSecondary, opacity: 0.7 }}>
          Having issues?{" "}
          <a href="mailto:info@pax26.com" className="font-bold underline" style={{ color: GREEN }}>
            info@pax26.com
          </a>{" "}
          — we resolve failed transactions within 24 hours.
        </p>
      </div>

    </div>
  );
};

export default TvHelp;