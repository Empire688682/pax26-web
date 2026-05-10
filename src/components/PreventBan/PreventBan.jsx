"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck, AlertTriangle, Clock, UserX, Fingerprint,
  BookUser, MessageSquareHeart, BatteryLow, HeartHandshake,
  ChevronDown, ArrowRight, Bot, Zap,
} from "lucide-react";
import { useGlobalContext } from "../Context";

/* ─── Styles ────────────────────────────────────────────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
  .pb-root { font-family:'Inter',sans-serif; }

  @keyframes pb-up   { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
  @keyframes pb-dot  { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(.6)} }
  @keyframes pb-glow { 0%,100%{opacity:.5} 50%{opacity:1} }

  .pb-s1{animation:pb-up .5s cubic-bezier(.16,1,.3,1) both}
  .pb-s2{animation:pb-up .5s cubic-bezier(.16,1,.3,1) .07s both}
  .pb-s3{animation:pb-up .5s cubic-bezier(.16,1,.3,1) .14s both}
  .pb-s4{animation:pb-up .5s cubic-bezier(.16,1,.3,1) .21s both}
  .pb-s5{animation:pb-up .5s cubic-bezier(.16,1,.3,1) .28s both}

  .pb-dot  { animation:pb-dot 2s ease-in-out infinite; }
  .pb-glow { animation:pb-glow 3s ease-in-out infinite; }

  .pb-tip {
    border-radius:20px;
    transition: transform .22s cubic-bezier(.16,1,.3,1), box-shadow .22s ease;
    cursor:pointer;
  }
  .pb-tip:hover { transform:translateY(-3px); }

  .pb-btn {
    transition: opacity .15s ease, transform .15s ease;
    cursor:pointer;
  }
  .pb-btn:hover { opacity:.85; transform:translateY(-1px); }

  .pb-tag {
    display:inline-flex; align-items:center; gap:5px;
    padding:3px 10px; border-radius:999px;
    font-size:10px; font-weight:700; letter-spacing:1.2px; text-transform:uppercase;
  }
`;

/* ─── Tip Card ──────────────────────────────────────────────────── */
function TipCard({ number, icon: Icon, color, title, children, pax26, delay = "0s" }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="pb-tip"
      onClick={() => setOpen(o => !o)}
      style={{
        background: pax26?.bg,
        border: `1px solid ${open ? color + "35" : pax26?.border}`,
        boxShadow: open ? `0 8px 32px ${color}14` : "none",
        animationDelay: delay,
        animation: "pb-up .5s cubic-bezier(.16,1,.3,1) both",
      }}
    >
      {/* Accent top bar (only when open) */}
      {open && (
        <div style={{ height: 2, borderRadius: "20px 20px 0 0", background: `linear-gradient(90deg,${color},${color}44,transparent)` }} />
      )}

      <div style={{ padding: "18px 20px" }}>
        {/* Header row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {/* Number + icon */}
            <div style={{
              width: 44, height: 44, borderRadius: 14, flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              background: `${color}16`, color,
              border: `1px solid ${color}25`,
            }}>
              <Icon size={20} />
            </div>
            <div>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.4, textTransform: "uppercase", color, opacity: .8 }}>
                Tip #{number}
              </span>
              <p style={{ fontSize: 14, fontWeight: 700, color: pax26?.textPrimary, marginTop: 1, lineHeight: 1.3 }}>
                {title}
              </p>
            </div>
          </div>
          <ChevronDown size={16} style={{
            color: pax26?.textSecondary, opacity: .5, flexShrink: 0,
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform .25s ease",
          }} />
        </div>

        {/* Body */}
        {open && (
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${pax26?.border}` }}>
            <div style={{ fontSize: 13, lineHeight: 1.8, color: pax26?.textSecondary }}>
              {children}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Highlight box ─────────────────────────────────────────────── */
function InfoBox({ color, icon: Icon, children, pax26 }) {
  return (
    <div style={{
      display: "flex", gap: 12, padding: "14px 16px", borderRadius: 14, margin: "14px 0",
      background: `${color}0e`, border: `1px solid ${color}25`,
    }}>
      <div style={{ color, marginTop: 2, flexShrink: 0 }}>
        <Icon size={16} />
      </div>
      <p style={{ fontSize: 13, lineHeight: 1.75, color: pax26?.textSecondary, margin: 0 }}>
        {children}
      </p>
    </div>
  );
}

/* ═══ MAIN PAGE ════════════════════════════════════════════════════ */
export default function PreventBan() {
  const { pax26, router } = useGlobalContext();

  const P  = pax26?.primary || "#3b82f6";
  const G  = "#22c55e";
  const Am = "#f59e0b";
  const R  = "#ef4444";
  const T  = "#06b6d4";
  const Vi = "#a78bfa";
  const Co = "#f97316";

  const TIPS = [
    {
      number: 1, icon: Clock, color: Am,
      title: "Never Use a Fresh WhatsApp Number Immediately",
      content: (
        <>
          <p>Brand-new WhatsApp numbers have <strong style={{ color: Am }}>zero trust score</strong> with WhatsApp's algorithm. Jumping straight into automation with a fresh number is one of the fastest ways to get banned.</p>
          <InfoBox color={Am} icon={AlertTriangle} pax26={pax26}>
            <strong>Warm-up protocol:</strong> Save real contacts and have genuine conversations for at least <strong>15 days</strong> before activating any automation.
          </InfoBox>
          <ul style={{ paddingLeft: 18, marginTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
            <li>Days 1–15: Manual conversations only — no bulk messages</li>
            <li>Days 1–5 of automation: Max <strong style={{ color: G }}>50 messages/day</strong></li>
            <li>Days 5–60: Gradually increase to <strong style={{ color: G }}>100 messages/day</strong></li>
            <li>First 60 days: Never exceed <strong style={{ color: R }}>200 messages/day</strong> under any circumstance</li>
          </ul>
        </>
      ),
    },
    {
      number: 2, icon: Zap, color: R,
      title: "Never Blast Messages All At Once",
      content: (
        <>
          <p>Mass messaging in rapid succession is a textbook spam signal. WhatsApp's AI can detect unusual message velocity and will flag or ban your number.</p>
          <InfoBox color={P} icon={Bot} pax26={pax26}>
            <strong>Pax26 recommendation:</strong> Use the <strong>Pacing Settings</strong> in your Pax26 Automation dashboard to send in batches of <strong>10–30 messages every 3 minutes</strong>. Slow and steady keeps your number alive.
          </InfoBox>
          <p style={{ marginTop: 10 }}>Prioritise account safety over speed. A banned number means zero messages reach anyone.</p>
        </>
      ),
    },
    {
      number: 3, icon: UserX, color: Vi,
      title: "Always Respect Your Audience's Opt-Out",
      content: (
        <>
          <p>When recipients feel they cannot escape your messages, they report you. Enough reports = permanent ban.</p>
          <InfoBox color={Vi} icon={ShieldCheck} pax26={pax26}>
            Use Pax26's <strong>Chatbot Builder</strong> to create a trigger word like <strong>"STOP"</strong> or <strong>"REMOVE ME"</strong> that automatically unsubscribes the contact from your list.
          </InfoBox>
          <p style={{ marginTop: 10 }}>Always add a visible opt-out line at the bottom of your broadcast messages, e.g.:</p>
          <div style={{ padding: "10px 16px", borderRadius: 10, background: `${Vi}0e`, border: `1px solid ${Vi}25`, marginTop: 8, fontStyle: "italic", fontSize: 12 }}>
            "To stop receiving messages, reply <strong>STOP</strong> and we'll remove you instantly."
          </div>
        </>
      ),
    },
    {
      number: 4, icon: Fingerprint, color: T,
      title: "Personalise Every Message You Send",
      content: (
        <>
          <p>Identical messages sent to hundreds of people is a spam pattern. WhatsApp looks for this. Personalisation breaks that pattern and dramatically reduces ban risk.</p>
          <InfoBox color={T} icon={MessageSquareHeart} pax26={pax26}>
            Pax26 supports the <strong>[name]</strong> shortcode inside your broadcast and automation messages. Use it to address each contact by their first name — making every message unique.
          </InfoBox>
          <p style={{ marginTop: 10 }}>Go beyond names — personalise based on their interest, last product viewed, or location whenever possible.</p>
        </>
      ),
    },
    {
      number: 5, icon: BookUser, color: G,
      title: "Encourage Contact Saving — Both Ways",
      content: (
        <>
          <p>WhatsApp's algorithm is more lenient when you are messaging contacts who have your number saved. It signals a pre-existing relationship rather than cold outreach.</p>
          <InfoBox color={G} icon={HeartHandshake} pax26={pax26}>
            <strong>Ask your leads to save your number</strong> in their first interaction. Pax26's auto-save feature also lets you automatically save incoming contacts to your CRM.
          </InfoBox>
          <p style={{ marginTop: 10 }}>A simple message like <em>"Save this number to always receive our exclusive updates"</em> goes a long way.</p>
        </>
      ),
    },
    {
      number: 6, icon: MessageSquareHeart, color: Co,
      title: "Encourage Two-Way Conversation",
      content: (
        <>
          <p>WhatsApp's AI rewards <strong>conversations</strong>, not broadcasts. When your messages receive replies, the platform classifies your number as a legitimate communicator.</p>
          <InfoBox color={Co} icon={ArrowRight} pax26={pax26}>
            End every broadcast with a question or call-to-action that invites a reply — "Which offer interests you most? Reply A or B" works better than a passive announcement.
          </InfoBox>
          <p style={{ marginTop: 10 }}>With Pax26 automations, you can create smart reply flows that keep conversations going automatically after the first response.</p>
        </>
      ),
    },
    {
      number: 7, icon: BatteryLow, color: "#94a3b8",
      title: "Take It Slow After Recovering From a Ban",
      content: (
        <>
          <p>Getting unbanned is not permission to return to business as usual. Your number's trust score has been reset to near zero.</p>
          <InfoBox color={R} icon={AlertTriangle} pax26={pax26}>
            <strong>Post-ban protocol:</strong> No automation for the first <strong>5–7 days</strong> after recovery. After day 7, stay under <strong>50 messages/day</strong> for the next 2–5 days before gradually scaling back up.
          </InfoBox>
          <p style={{ marginTop: 10 }}>
            Need to pause your Pax26 subscription while you recover? Our team can freeze your plan with the days remaining intact. Just reach out via{" "}
            <Link href="/contact" style={{ color: P, fontWeight: 600, textDecoration: "underline" }}>
              our contact page
            </Link>
            .
          </p>
        </>
      ),
    },
  ];

  return (
    <>
      <style>{CSS}</style>
      <div className="pb-root" style={{ maxWidth: 720, margin: "0 auto", padding: "28px 16px 100px" }}>

        {/* ── Hero header ─────────────────────────────────────────── */}
        <div className="pb-s1" style={{ marginBottom: 32 }}>
          {/* Eyebrow badge */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "6px 14px", borderRadius: 999,
              background: `${R}12`, border: `1px solid ${R}28` }}>
              <ShieldCheck size={13} color={R} />
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.4, textTransform: "uppercase", color: R }}>
                Safety Guide
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "6px 14px", borderRadius: 999,
              background: `${P}10`, border: `1px solid ${P}25` }}>
              <span className="pb-dot" style={{ width: 7, height: 7, borderRadius: "50%", background: G, display: "block" }} />
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.4, textTransform: "uppercase", color: P }}>
                Pax26 Official
              </span>
            </div>
          </div>

          <h1 style={{ fontSize: 28, fontWeight: 900, color: pax26?.textPrimary, lineHeight: 1.15, marginBottom: 12 }}>
            How To Prevent Your{" "}
            <span style={{ color: P }}>WhatsApp From Getting Banned</span>
          </h1>
          <p style={{ fontSize: 14, lineHeight: 1.8, color: pax26?.textSecondary, maxWidth: 580 }}>
            WhatsApp's messaging policies are strict. Running automation without following these rules risks losing your number permanently. These are Pax26's official best practices to keep your account safe and your campaigns running.
          </p>
        </div>

        {/* ── Quick stat strip ─────────────────────────────────────── */}
        <div className="pb-s2" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 28 }}>
          {[
            { label: "Tips Covered", value: "7", color: P },
            { label: "Risk Level Reduced", value: "High", color: G },
            { label: "Estimated Read", value: "4 min", color: Am },
          ].map(s => (
            <div key={s.label} style={{ borderRadius: 16, padding: "14px 16px",
              background: pax26?.bg, border: `1px solid ${pax26?.border}` }}>
              <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: 1.2, textTransform: "uppercase",
                color: pax26?.textSecondary, opacity: .45, marginBottom: 4 }}>{s.label}</p>
              <p style={{ fontSize: 22, fontWeight: 900, color: s.color }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* ── Tip cards ────────────────────────────────────────────── */}
        <div className="pb-s3" style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
          {TIPS.map((tip) => (
            <TipCard
              key={tip.number}
              number={tip.number}
              icon={tip.icon}
              color={tip.color}
              title={tip.title}
              pax26={pax26}
            >
              {tip.content}
            </TipCard>
          ))}
        </div>

        {/* ── PS note ─────────────────────────────────────────────── */}
        <div className="pb-s4" style={{ borderRadius: 18, padding: "18px 20px", marginBottom: 24,
          background: `${G}0a`, border: `1px solid ${G}22` }}>
          <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
            <div style={{ color: G, marginTop: 2, flexShrink: 0 }}>
              <ShieldCheck size={18} />
            </div>
            <div>
              <p style={{ fontSize: 12, fontWeight: 700, color: G, marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>
                Good News for Group Users
              </p>
              <p style={{ fontSize: 13, lineHeight: 1.75, color: pax26?.textSecondary }}>
                If you primarily use WhatsApp Groups for your classes or community, you carry the <strong>lowest ban risk</strong> of all. Group-based messaging is viewed far more favourably by WhatsApp's algorithm than broadcast-style outreach.
              </p>
            </div>
          </div>
        </div>

        {/* ── Subscription pause CTA ──────────────────────────────── */}
        <div className="pb-s5" style={{ borderRadius: 20, overflow: "hidden",
          background: pax26?.bg, border: `1px solid ${pax26?.border}` }}>
          <div style={{ height: 2, background: `linear-gradient(90deg,${P},${T},transparent)` }} />
          <div style={{ padding: "24px 24px" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
              <div style={{ width: 46, height: 46, borderRadius: 14, flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: `${P}15`, color: P }}>
                <HeartHandshake size={22} />
              </div>
              <div style={{ flex: 1, minWidth: 240 }}>
                <p style={{ fontSize: 15, fontWeight: 800, color: pax26?.textPrimary, marginBottom: 6 }}>
                  Got banned? We've got you covered.
                </p>
                <p style={{ fontSize: 13, lineHeight: 1.75, color: pax26?.textSecondary, marginBottom: 16 }}>
                  At Pax26, we believe you should only pay for the days you can actually use the platform. If WhatsApp bans your number, simply contact our support team and we'll <strong>pause your subscription</strong> with all your remaining days kept intact — resumed the moment you're back online.
                </p>
                <Link
                  href="/contact"
                  style={{ display: "inline-flex", alignItems: "center", gap: 8,
                    padding: "11px 22px", borderRadius: 12,
                    background: `linear-gradient(135deg,${P},${T})`,
                    color: "#fff", fontWeight: 700, fontSize: 13,
                    textDecoration: "none",
                    boxShadow: `0 8px 24px ${P}40` }}
                >
                  Contact Pax26 Support <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}
