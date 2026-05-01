"use client";

import React from "react";
import { useGlobalContext } from "../Context";
import {
  ShieldCheck,
  Database,
  Share2,
  Lock,
  Clock,
  UserCheck,
  Cookie,
  ExternalLink,
  RefreshCw,
  Mail,
  ArrowRight,
  Eye,
  Info,
} from "lucide-react";

/* ── Keyframes + fonts ────────────────────────────────────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@1,700&family=Syne:wght@400;600;700;800&family=DM+Mono:wght@400;500&display=swap');

  .pp-root  { font-family: 'Syne', sans-serif; }
  .pp-serif { font-family: 'Playfair Display', serif; font-style: italic; }
  .pp-mono  { font-family: 'DM Mono', monospace; }

  @keyframes pp-slide { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
  @keyframes pp-glow  { 0%,100%{opacity:0.1} 50%{opacity:0.2} }
  @keyframes pp-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }

  .pp-s1 { animation: pp-slide 0.45s ease both; }
  .pp-s2 { animation: pp-slide 0.45s ease 0.1s both; }
  .pp-s3 { animation: pp-slide 0.45s ease 0.2s both; }

  .pp-glow  { animation: pp-glow  5s ease-in-out infinite; }
  .pp-float { animation: pp-float 6s ease-in-out infinite; }

  .pp-card { transition: transform 0.22s ease, box-shadow 0.22s ease; }
  .pp-card:hover { transform: translateY(-3px); }
`;

/* ── Section label (same as About) ───────────────────────────────── */
function SectionLabel({ text, primary }) {
  return (
    <div className="flex items-center gap-3 mb-3">
      <div className="h-0.5 w-8 rounded-full" style={{ background: primary }} />
      <span className="pp-mono text-[10px] font-medium uppercase tracking-widest" style={{ color: primary }}>
        {text}
      </span>
    </div>
  );
}

/* ── Privacy sections data ───────────────────────────────────────── */
const SECTIONS = [
  {
    num: "01",
    icon: Database,
    label: "Data Collection",
    title: "Information We Collect",
    color: "primary",
    body: "We may collect the following types of information when you use Pax26:",
    list: [
      "Personal Information — name, email address, phone number, and details provided at registration.",
      "Verification Data — OTPs, phone verification status, and authentication tokens.",
      "Usage Information — app interactions, device info, IP address, and log data.",
      "Financial Data — wallet transaction history, payment references, and billing records.",
    ],
  },
  {
    num: "02",
    icon: Eye,
    label: "Data Use",
    title: "How We Use Your Information",
    color: "primary",
    body: "Your information helps us deliver and improve our services:",
    list: [
      "Provide and maintain Pax26 services",
      "Verify your identity and secure your account",
      "Process transactions and service requests",
      "Send important notifications and updates",
      "Improve app performance and user experience",
      "Comply with legal and regulatory obligations",
    ],
  },
  {
    num: "03",
    icon: Share2,
    label: "Data Sharing",
    title: "Sharing of Information",
    color: "amber",
    body: "We do not sell or rent your personal data. We may only share your information with:",
    list: [
      "Trusted service providers (e.g. payment gateways or messaging services)",
      "Legal authorities when required by law",
      "Security or fraud prevention partners",
    ],
  },
  {
    num: "04",
    icon: Lock,
    label: "Security",
    title: "Data Security",
    color: "primary",
    body: "We use industry-standard security measures including encryption, authentication, and access controls to protect your data. No system is 100% secure — we encourage using a strong, unique password and notifying us immediately of any suspected unauthorized access.",
  },
  {
    num: "05",
    icon: Clock,
    label: "Retention",
    title: "Data Retention",
    color: "green",
    body: "We retain your information only for as long as necessary to fulfill the purposes outlined in this policy, or as required by law. When your data is no longer needed, we securely delete or anonymize it.",
  },
  {
    num: "06",
    icon: UserCheck,
    label: "Your Rights",
    title: "Your Rights",
    color: "primary",
    body: "You have the following rights regarding your personal data:",
    list: [
      "Access and update your personal information at any time",
      "Request deletion of your account and associated data",
      "Withdraw consent where applicable",
      "Object to or restrict certain processing of your data",
      "Lodge a complaint with the relevant data protection authority",
    ],
  },
  {
    num: "07",
    icon: Cookie,
    label: "Tracking",
    title: "Cookies & Tracking",
    color: "amber",
    body: "Pax26 may use cookies and similar tracking technologies to improve your experience. You can control cookie preferences through your browser settings. Disabling cookies may affect certain platform features.",
  },
  {
    num: "08",
    icon: ExternalLink,
    label: "Third Parties",
    title: "Third-Party Services",
    color: "primary",
    body: "Pax26 integrates with third-party services such as payment gateways and telecom providers. We are not responsible for the privacy practices of those services. We encourage you to review their privacy policies independently.",
  },
  {
    num: "09",
    icon: RefreshCw,
    label: "Updates",
    title: "Changes to This Policy",
    color: "green",
    body: "We may update this Privacy Policy from time to time. Any changes will be posted on this page with a revised effective date. Continued use of the platform after changes are posted constitutes your acceptance of the revised policy.",
  },
];

/* ── Main component ──────────────────────────────────────────────── */
export default function PrivacyPage() {
  const { pax26 } = useGlobalContext();
  const primary = pax26?.primary || "#3b82f6";
  const GREEN   = "#22c55e";
  const AMBER   = "#f59e0b";

  const colorMap = { primary, green: GREEN, amber: AMBER };

  return (
    <>
      <style>{CSS}</style>
      <div className="pp-root min-h-screen px-5 py-16" style={{ background: pax26?.secondaryBg }}>
        <div className="max-w-5xl mx-auto space-y-10">

          {/* ── Hero ──────────────────────────────────────────── */}
          <div
            className="pp-s1 relative rounded-3xl overflow-hidden px-8 py-14 text-center"
            style={{ background: pax26?.bg, border: `1px solid ${pax26?.border}` }}
          >
            {/* Glow orbs */}
            <div
              className="pp-glow absolute -top-16 -left-16 w-64 h-64 rounded-full pointer-events-none"
              style={{ background: primary, filter: "blur(80px)" }}
            />
            <div
              className="pp-glow absolute -bottom-12 -right-12 w-52 h-52 rounded-full pointer-events-none"
              style={{ background: GREEN, filter: "blur(70px)", animationDelay: "2s" }}
            />

            {/* Dot-grid texture */}
            <div
              className="absolute inset-0 pointer-events-none opacity-[0.03]"
              style={{
                backgroundImage: `radial-gradient(${pax26?.textPrimary || "#000"} 1px, transparent 1px)`,
                backgroundSize: "24px 24px",
              }}
            />

            <div className="relative z-10">
              {/* Badge */}
              <div
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6"
                style={{ background: `${primary}12`, border: `1px solid ${primary}28` }}
              >
                <ShieldCheck size={12} style={{ color: primary }} />
                <span className="pp-mono text-[10px] font-bold uppercase tracking-widest" style={{ color: primary }}>
                  Privacy Policy · PAX26 TECHNOLOGIES
                </span>
              </div>

              <h1
                className="text-4xl md:text-6xl font-extrabold leading-tight mb-5"
                style={{ color: pax26?.textPrimary }}
              >
                Your data,{" "}
                <span className="pp-serif" style={{ color: primary }}>our responsibility</span>
              </h1>

              <p
                className="text-base md:text-lg leading-relaxed max-w-2xl mx-auto mb-2"
                style={{ color: pax26?.textSecondary, opacity: 0.7 }}
              >
                Pax26 is committed to protecting your privacy. This policy explains how we collect,
                use, and safeguard your information when you use our platform.
              </p>

              {/* Meta chips */}
              <div className="flex flex-wrap justify-center gap-3 mt-8">
                {[
                  { label: "Effective", value: "January 2025" },
                  { label: "Sections",  value: `${SECTIONS.length}`     },
                  { label: "Scope",     value: "All Users"    },
                  { label: "Contact",   value: "info@pax26.com" },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl"
                    style={{
                      background: pax26?.secondaryBg,
                      border: `1px solid ${pax26?.border}`,
                    }}
                  >
                    <span className="pp-mono text-[9px] uppercase tracking-widest" style={{ color: pax26?.textSecondary, opacity: 0.5 }}>
                      {label}
                    </span>
                    <div style={{ width: "1px", height: "10px", background: pax26?.border }} />
                    <span className="pp-mono text-[10px] font-medium" style={{ color: pax26?.textPrimary }}>
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Intro blurb ───────────────────────────────────── */}
          <div
            className="pp-s2 rounded-2xl p-8"
            style={{ background: pax26?.bg, border: `1px solid ${pax26?.border}` }}
          >
            <SectionLabel text="Introduction" primary={primary} />
            <h2 className="text-2xl font-extrabold mb-4" style={{ color: pax26?.textPrimary }}>
              We take privacy{" "}
              <span className="pp-serif" style={{ color: primary }}>seriously</span>
            </h2>
            <p className="text-sm leading-relaxed max-w-3xl" style={{ color: pax26?.textSecondary, opacity: 0.7 }}>
              Pax26 ("we", "our", "us") is a product of PAX26 TECHNOLOGIES, a registered Nigerian technology company.
              By accessing or using Pax26, you agree to the practices described in this Privacy Policy.
              If you do not agree, please discontinue use of our platform.
            </p>
          </div>

          {/* ── Section cards grid ────────────────────────────── */}
          <div className="pp-s3 space-y-5">
            {SECTIONS.map((s, idx) => {
              const Icon  = s.icon;
              const color = colorMap[s.color] || primary;
              const hasList = !!s.list;

              return (
                <div
                  key={s.num}
                  className="pp-card rounded-2xl overflow-hidden"
                  style={{
                    background: pax26?.bg,
                    border: `1px solid ${pax26?.border}`,
                    animationDelay: `${idx * 0.04}s`,
                  }}
                >
                  {/* Colored top strip */}
                  <div
                    style={{
                      height: "3px",
                      background: `linear-gradient(90deg, ${color}, ${color}55, transparent)`,
                    }}
                  />

                  <div className="p-7 relative overflow-hidden">
                    {/* Subtle corner orb */}
                    <div
                      className="pp-glow absolute -top-6 -right-6 w-24 h-24 rounded-full pointer-events-none"
                      style={{ background: color, filter: "blur(30px)", animationDelay: `${idx * 0.5}s` }}
                    />

                    <div className="relative z-10">
                      {/* Icon + label row */}
                      <div className="flex items-center gap-4 mb-4">
                        <div
                          className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ background: `${color}14`, color }}
                        >
                          <Icon size={20} />
                        </div>
                        <div>
                          <SectionLabel text={`${s.num} · ${s.label}`} primary={color} />
                        </div>
                      </div>

                      {/* Title */}
                      <h2 className="text-xl font-extrabold mb-3" style={{ color: pax26?.textPrimary }}>
                        {s.title}
                      </h2>

                      {/* Body */}
                      {s.body && (
                        <p className="text-sm leading-relaxed mb-4" style={{ color: pax26?.textSecondary, opacity: 0.72 }}>
                          {s.body}
                        </p>
                      )}

                      {/* List */}
                      {hasList && (
                        <div
                          className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-2"
                          style={s.list.length <= 3 ? { gridTemplateColumns: "1fr" } : undefined}
                        >
                          {s.list.map((item, li) => (
                            <div
                              key={li}
                              className="flex items-start gap-3 px-4 py-3 rounded-xl"
                              style={{ background: pax26?.secondaryBg }}
                            >
                              <div
                                className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-[6px]"
                                style={{ background: color }}
                              />
                              <span className="text-sm leading-relaxed" style={{ color: pax26?.textSecondary, opacity: 0.8 }}>
                                {item}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── Contact nudge (same pattern as About) ─────────── */}
          <div
            className="flex flex-col sm:flex-row items-center justify-between gap-5 px-7 py-5 rounded-2xl"
            style={{ background: pax26?.bg, border: `1px solid ${pax26?.border}` }}
          >
            <div className="flex items-center gap-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${primary}14`, color: primary }}
              >
                <Mail size={18} />
              </div>
              <div>
                <p className="text-sm font-bold" style={{ color: pax26?.textPrimary }}>
                  Questions about this policy?
                </p>
                <p className="text-xs" style={{ color: pax26?.textSecondary, opacity: 0.55 }}>
                  We respond within 2 hours
                </p>
              </div>
            </div>
            <a
              href="mailto:info@pax26.com"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white"
              style={{ background: primary, boxShadow: `0 8px 24px ${primary}35` }}
            >
              info@pax26.com <ArrowRight size={14} />
            </a>
          </div>

          {/* ── Last updated footer note ───────────────────────── */}
          <div className="flex items-center gap-2 pb-4 justify-center">
            <Info size={12} style={{ color: pax26?.textSecondary, opacity: 0.4 }} />
            <p className="pp-mono text-[10px] uppercase tracking-widest" style={{ color: pax26?.textSecondary, opacity: 0.4 }}>
              Last updated: January 2025 · © 2025 PAX26 Technologies · All rights reserved
            </p>
          </div>

        </div>
      </div>
    </>
  );
}