"use client";

import { useState, useEffect } from "react";
import { TagInput } from "@/components/ui/TagInput";
import { FaqBuilder } from "@/components/ui/FaqBuilder";
import { motion, AnimatePresence } from "framer-motion";
import { useGlobalContext } from "../Context";

/* ── Icons ───────────────────────────────────────────────── */
const BrainIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-1.96-3 2.5 2.5 0 0 1-1.32-4.24 3 3 0 0 1 .34-5.58 2.5 2.5 0 0 1 1.32-4.24A2.5 2.5 0 0 1 9.5 2"/>
    <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 1.96-3 2.5 2.5 0 0 0 1.32-4.24 3 3 0 0 0-.34-5.58 2.5 2.5 0 0 0-1.32-4.24A2.5 2.5 0 0 0 14.5 2"/>
  </svg>
);
const BuildingIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 9h1"/><path d="M14 9h1"/><path d="M9 14h1"/><path d="M14 14h1"/><path d="M9 19v-5"/><path d="M15 19v-5"/><path d="M3 9h18"/>
  </svg>
);
const PackageIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
  </svg>
);
const HelpCircleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);
const SlidersIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/>
  </svg>
);
const MessageCircleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);
const ClipboardIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
  </svg>
);
const RocketIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>
  </svg>
);
const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const ChevronRight = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
);
const ChevronLeft = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
);

/* ── Step config ─────────────────────────────────────────── */
const STEPS = [
  { label: "Business Info",  icon: BuildingIcon,      desc: "Tell us about your business" },
  { label: "Services",       icon: PackageIcon,       desc: "What do you offer?" },
  { label: "FAQs",           icon: HelpCircleIcon,    desc: "Common customer questions" },
  { label: "Tone & Hours",   icon: SlidersIcon,       desc: "Your communication style" },
  { label: "WhatsApp",       icon: MessageCircleIcon, desc: "Connect your number" },
  { label: "Review",         icon: ClipboardIcon,     desc: "Confirm your details" },
  { label: "Train AI",       icon: RocketIcon,        desc: "Launch your AI assistant" },
];

/* ── Themed primitives (replaces external Input/Select/Textarea) ── */
const fieldBase = (pax26) => ({
  width: "100%",
  background: pax26?.secondaryBg,
  color: pax26?.textPrimary,
  border: `1px solid ${pax26?.border}`,
  borderRadius: "10px",
  padding: "10px 14px",
  fontSize: "14px",
  fontFamily: "inherit",
  outline: "none",
  transition: "border-color 0.2s",
  boxSizing: "border-box",
});

const FieldLabel = ({ children, pax26 }) => (
  <label
    style={{
      display: "block",
      fontSize: "11px",
      fontWeight: 600,
      letterSpacing: "0.07em",
      textTransform: "uppercase",
      color: pax26?.textPrimary,
      opacity: 0.7,
      marginBottom: "6px",
    }}
  >
    {children}
  </label>
);

const ThemedInput = ({ label, pax26, style, ...props }) => {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom: "4px" }}>
      {label && <FieldLabel pax26={pax26}>{label}</FieldLabel>}
      <input
        {...props}
        style={{
          ...fieldBase(pax26),
          borderColor: focused ? pax26?.primary : pax26?.border,
          boxShadow: focused ? `0 0 0 3px ${pax26?.primary}18` : "none",
          ...style,
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
    </div>
  );
};

const ThemedTextarea = ({ label, pax26, rows = 4, style, ...props }) => {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom: "4px" }}>
      {label && <FieldLabel pax26={pax26}>{label}</FieldLabel>}
      <textarea
        {...props}
        rows={rows}
        style={{
          ...fieldBase(pax26),
          resize: "vertical",
          borderColor: focused ? pax26?.primary : pax26?.border,
          boxShadow: focused ? `0 0 0 3px ${pax26?.primary}18` : "none",
          ...style,
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
    </div>
  );
};

const ThemedSelect = ({ label, pax26, options = [], value, onChange, style }) => {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom: "4px" }}>
      {label && <FieldLabel pax26={pax26}>{label}</FieldLabel>}
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          ...fieldBase(pax26),
          cursor: "pointer",
          appearance: "none",
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23888' strokeWidth='2.5' xmlns='http://www.w3.org/2000/svg'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 12px center",
          paddingRight: "36px",
          borderColor: focused ? pax26?.primary : pax26?.border,
          boxShadow: focused ? `0 0 0 3px ${pax26?.primary}18` : "none",
          ...style,
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      >
        {options.map(opt => (
          <option
            key={opt}
            value={opt}
            style={{ background: pax26?.secondaryBg, color: pax26?.textPrimary }}
          >
            {opt.charAt(0).toUpperCase() + opt.slice(1)}
          </option>
        ))}
      </select>
    </div>
  );
};

/* ── Review row ──────────────────────────────────────────── */
const ReviewRow = ({ label, value, pax26 }) => (
  <div className="flex gap-3 py-3" style={{ borderBottom: `1px solid ${pax26?.border}` }}>
    <span style={{ color: pax26?.textPrimary, opacity: 0.5, fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", width: "7rem", flexShrink: 0, marginTop: 2 }}>
      {label}
    </span>
    <span style={{ color: pax26?.textPrimary, fontSize: "14px", flex: 1 }}>{value || "—"}</span>
  </div>
);

/* ── Spinner ─────────────────────────────────────────────── */
const Spinner = () => (
  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
);

export default function AiTrainingPage() {
  const { pax26, router, setAIsPaxAiBusinessTrained } = useGlobalContext();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [form, setForm] = useState({
    businessName: "",
    industry: "",
    businessUrl: "",
    description: "",
    services: [],
    faqs: [],
    tone: "professional",
    workingHours: "",
    whatsappBusiness: { phoneNumber: "", businessId: "" },
  });

  const fetchBusinessProfile = async () => {
    try {
      const res = await fetch("/api/automations/get-business-profile", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      const profile = data?.profile || {};
      if (data.success) {
        setAIsPaxAiBusinessTrained(profile.aiTrained || false);
        setForm(f => ({
          ...f,
          businessName: profile.businessName || "",
          industry: profile.industry || "",
          businessUrl: profile.businessUrl || "",
          description: profile.description || "",
          services: profile.services || [],
          faqs: profile.faqs || [],
          tone: profile.tone || "professional",
          workingHours: profile.workingHours || "",
          whatsappBusiness: {
            phoneNumber: profile.whatsappBusiness?.phoneNumber || "",
            businessId: profile.whatsappBusiness?.businessId || "",
          },
        }));
      }
    } catch (error) {
      console.error("Error fetching business profile:", error);
    }
  };

  useEffect(() => { fetchBusinessProfile(); }, []);

  const nextDisabled = () => {
    switch (step) {
      case 0: return !form.businessName.trim() || !form.industry.trim() || !form.description.trim();
      case 1: return form.services.length === 0;
      case 2: return form.faqs.length === 0;
      case 3: return !form.tone || !form.workingHours.trim();
      case 4: return !form.whatsappBusiness.phoneNumber.trim();
      default: return false;
    }
  };

  const go = (dir) => {
    setDirection(dir);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const next = () => {
    go(1);
    if (step === STEPS.length - 1) {
      handleTrain();
    } else {
      setStep(s => Math.min(s + 1, STEPS.length - 1));
    }
  };

  const back = () => {
    go(-1);
    setStep(s => Math.max(s - 1, 0));
  };

  const handleTrain = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/automations/train", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        await fetchBusinessProfile();
        setStep(0);
        router.push("/dashboard/automations/home");
      }
    } catch (error) {
      console.log("TrainErr:", error);
    } finally {
      setLoading(false);
    }
  };

  const StepIcon = STEPS[step].icon;
  const progress = (step / (STEPS.length - 1)) * 100;

  return (
    <div className="min-h-screen pb-20 pt-6 max-w-2xl mx-auto">

      {/* ── Page header ── */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: `${pax26?.primary}22`, color: pax26?.textPrimary }}>
            <BrainIcon />
          </div>
          <p className="text-xs font-semibold uppercase tracking-widest opacity-50"
            style={{ color: pax26?.textPrimary }}>
            AI Training
          </p>
        </div>
        <h1 className="text-2xl font-black tracking-tight" style={{ color: pax26?.textPrimary }}>
          Train your business AI
        </h1>
        <p className="text-sm mt-1 opacity-60" style={{ color: pax26?.textPrimary }}>
          Complete all steps to launch your intelligent assistant
        </p>
      </div>

      {/* ── Progress bar ── */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold opacity-50" style={{ color: pax26?.textPrimary }}>
            Step {step + 1} of {STEPS.length}
          </span>
          <span className="text-xs font-bold" style={{ color: pax26?.textPrimary }}>
            {Math.round(progress)}%
          </span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: pax26?.secondaryBg }}>
          <div
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%`, background: pax26?.primary }}
          />
        </div>
      </div>

      {/* ── Step pills ── */}
      <div className="flex gap-1.5 mb-8 overflow-x-auto pb-1 scrollbar-none">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          const done = i < step;
          const active = i === step;
          return (
            <button
              key={i}
              onClick={() => { if (i < step) { go(-1); setStep(i); } }}
              disabled={i > step}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold flex-shrink-0 transition-all duration-200"
              style={
                active ? { background: pax26?.primary, color: "#fff" }
                : done  ? { background: `${pax26?.primary}18`, color: pax26?.textPrimary, cursor: "pointer" }
                : { background: pax26?.secondaryBg, color: pax26?.textPrimary, opacity: 0.4, cursor: "not-allowed" }
              }
            >
              {done ? <CheckIcon /> : <Icon />}
              <span className="hidden sm:inline">{s.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── Step card ── */}
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={step}
          custom={direction}
          initial={{ opacity: 0, x: direction * 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: direction * -30 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
        >
          {/* Card header */}
          <div
            className="rounded-t-2xl px-6 py-5 flex items-center gap-4"
            style={{ background: `${pax26?.primary}12`, borderBottom: `1px solid ${pax26?.primary}22` }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: pax26?.primary, color: "#fff" }}
            >
              <StepIcon />
            </div>
            <div>
              <h2 className="font-black text-lg leading-tight" style={{ color: pax26?.textPrimary }}>
                {STEPS[step].label}
              </h2>
              <p className="text-xs opacity-60" style={{ color: pax26?.textPrimary }}>
                {STEPS[step].desc}
              </p>
            </div>
          </div>

          {/* Card body */}
          <div
            className="px-6 py-6 space-y-4 rounded-b-2xl"
            style={{
              background: pax26?.card || pax26?.bg,
              border: `1px solid ${pax26?.border}`,
            }}
          >
            {renderStep(step, form, setForm, pax26)}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* ── Navigation ── */}
      <div className="flex items-center justify-between mt-6 gap-3">
        {step > 0 ? (
          <button
            onClick={back}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-200"
            style={{
              background: pax26?.secondaryBg,
              color: pax26?.textPrimary,
              border: `1px solid ${pax26?.border}`,
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = pax26?.primary + "44"}
            onMouseLeave={e => e.currentTarget.style.borderColor = pax26?.border}
          >
            <ChevronLeft />
            Back
          </button>
        ) : <div />}

        <button
          onClick={next}
          disabled={nextDisabled() || loading}
          className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-200 ml-auto"
          style={
            nextDisabled() || loading
              ? { background: pax26?.secondaryBg, color: pax26?.textPrimary, cursor: "not-allowed", opacity: 0.5, border: `1px solid ${pax26?.border}` }
              : { background: pax26?.primary, color: "#fff", boxShadow: `0 8px 24px ${pax26?.primary}40` }
          }
          onMouseEnter={e => { if (!nextDisabled() && !loading) e.currentTarget.style.opacity = "0.9"; }}
          onMouseLeave={e => { if (!nextDisabled() && !loading) e.currentTarget.style.opacity = "1"; }}
        >
          {loading ? (
            <><Spinner />Processing...</>
          ) : step === STEPS.length - 1 ? (
            <><RocketIcon />Launch AI</>
          ) : (
            <>Save & Continue<ChevronRight /></>
          )}
        </button>
      </div>
    </div>
  );
}

/* ── Step renderer ───────────────────────────────────────── */
function renderStep(step, form, setForm, pax26) {
  switch (step) {

    case 0:
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <ThemedInput
            label="Business Name"
            pax26={pax26}
            value={form.businessName}
            onChange={e => setForm({ ...form, businessName: e.target.value })}
            placeholder="e.g. Acme Corp"
          />
          <ThemedInput
            label="Industry"
            pax26={pax26}
            value={form.industry}
            onChange={e => setForm({ ...form, industry: e.target.value })}
            placeholder="e.g. E-commerce, Fintech, Health"
          />
          <ThemedInput
            label="Business URL (optional)"
            pax26={pax26}
            value={form.businessUrl}
            onChange={e => setForm({ ...form, businessUrl: e.target.value })}
            placeholder="https://yourbusiness.com"
          />
          <ThemedTextarea
            label="Business Description"
            pax26={pax26}
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
            placeholder="Briefly describe what your business does..."
            rows={4}
          />
        </div>
      );

    case 1:
      return (
        <TagInput
          example="e.g. Web Design, SEO, Consulting"
          label="Services You Offer"
          tags={form.services}
          onChange={services => setForm({ ...form, services })}
          pax26={pax26}
        />
      );

    case 2:
      return (
        <FaqBuilder
          faqs={form.faqs}
          onChange={faqs => setForm({ ...form, faqs })}
          pax26={pax26}
        />
      );

    case 3:
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <ThemedSelect
            label="Conversation Tone"
            pax26={pax26}
            value={form.tone}
            options={["friendly", "professional", "salesy"]}
            onChange={tone => setForm({ ...form, tone })}
          />
          <ThemedInput
            label="Working Hours"
            pax26={pax26}
            placeholder="e.g. Mon–Fri 9am–6pm"
            value={form.workingHours}
            onChange={e => setForm({ ...form, workingHours: e.target.value })}
          />
        </div>
      );

    case 4:
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {/* Info banner */}
          <div
            style={{
              display: "flex", alignItems: "flex-start", gap: "10px",
              padding: "12px 14px", borderRadius: "12px",
              background: `${pax26?.primary}12`,
              border: `1px solid ${pax26?.primary}22`,
            }}
          >
            <div style={{ color: pax26?.textPrimary, marginTop: 1, flexShrink: 0 }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <p style={{ fontSize: "12px", color: pax26?.textPrimary, lineHeight: 1.6 }}>
              Enter your WhatsApp Business number in international format, e.g. <strong>+2348012345678</strong>
            </p>
          </div>
          <ThemedInput
            label="WhatsApp Business Number"
            pax26={pax26}
            placeholder="+2348012345678"
            value={form.whatsappBusiness.phoneNumber}
            onChange={e => setForm({
              ...form,
              whatsappBusiness: { ...form.whatsappBusiness, phoneNumber: e.target.value },
            })}
          />
        </div>
      );

    case 5:
      return (
        <div>
          <p style={{ fontSize: "14px", fontWeight: 600, color: pax26?.textPrimary, marginBottom: "16px" }}>
            Review before training
          </p>
          <ReviewRow label="Business"    value={form.businessName}                 pax26={pax26} />
          <ReviewRow label="Industry"    value={form.industry}                      pax26={pax26} />
          <ReviewRow label="URL"         value={form.businessUrl}                   pax26={pax26} />
          <ReviewRow label="Description" value={form.description}                   pax26={pax26} />
          <ReviewRow label="Services"    value={form.services.join(", ")}           pax26={pax26} />
          <ReviewRow label="FAQs"        value={`${form.faqs.length} question${form.faqs.length !== 1 ? "s" : ""}`} pax26={pax26} />
          <ReviewRow label="Tone"        value={form.tone.charAt(0).toUpperCase() + form.tone.slice(1)} pax26={pax26} />
          <ReviewRow label="Hours"       value={form.workingHours}                  pax26={pax26} />
          <ReviewRow label="WhatsApp"    value={form.whatsappBusiness.phoneNumber}  pax26={pax26} />
          <p style={{ fontSize: "12px", color: pax26?.textPrimary, opacity: 0.5, marginTop: "16px", lineHeight: 1.6 }}>
            Everything look good? Hit Launch AI on the next step to train your assistant.
          </p>
        </div>
      );

    case 6:
      return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "24px 0", gap: "20px" }}>
          {/* Animated ring */}
          <div style={{ position: "relative", width: "80px", height: "80px" }}>
            <div
              className="animate-ping"
              style={{
                position: "absolute", inset: 0, borderRadius: "50%",
                background: pax26?.primary, opacity: 0.2,
              }}
            />
            <div
              style={{
                position: "relative", width: "80px", height: "80px", borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                background: `${pax26?.primary}22`,
                border: `2px solid ${pax26?.primary}44`,
                color: pax26?.textPrimary,
                transform: "scale(1.5)",
              }}
            >
              <RocketIcon />
            </div>
          </div>

          <div>
            <h3 style={{ fontSize: "20px", fontWeight: 900, color: pax26?.textPrimary, marginBottom: "8px" }}>
              Ready to launch{form.businessName ? ` ${form.businessName}'s` : " your"} AI
            </h3>
            <p style={{ fontSize: "14px", color: pax26?.textPrimary, opacity: 0.6, maxWidth: "340px", lineHeight: 1.6 }}>
              Your AI assistant will learn your business profile, services, FAQs, and communication style — ready to handle customers 24/7.
            </p>
          </div>

          {/* Summary pills */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", justifyContent: "center" }}>
            {[
              `${form.services.length} services`,
              `${form.faqs.length} FAQs`,
              form.tone,
              form.workingHours || "hours not set",
            ].map((pill, i) => (
              <span
                key={i}
                style={{
                  fontSize: "12px", fontWeight: 600, padding: "4px 12px", borderRadius: "999px",
                  background: `${pax26?.primary}15`, color: pax26?.textPrimary,
                }}
              >
                {pill}
              </span>
            ))}
          </div>
        </div>
      );

    default:
      return null;
  }
}