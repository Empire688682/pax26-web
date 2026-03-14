"use client";

import React, { useState } from "react";
import Image from "next/image";
import { toast } from "react-toastify";
import { Mail, Phone, MapPin, Send, ArrowRight, MessageCircle } from "lucide-react";
import SocialIcons from "../SocialIcons/SocialIcons";
import { useGlobalContext } from "../Context";

/* ── Keyframes + font ─────────────────────────────────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@1,700&family=Syne:wght@400;600;700;800&family=DM+Mono:wght@400;500&display=swap');

  .cn-root  { font-family: 'Syne', sans-serif; }
  .cn-serif { font-family: 'Playfair Display', serif; font-style: italic; }
  .cn-mono  { font-family: 'DM Mono', monospace; }

  @keyframes cn-slide { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
  @keyframes cn-glow  { 0%,100%{opacity:0.12} 50%{opacity:0.22} }
  @keyframes cn-spin  { to{transform:rotate(360deg)} }

  .cn-s1 { animation: cn-slide 0.4s ease both; }
  .cn-s2 { animation: cn-slide 0.4s ease 0.08s both; }
  .cn-glow { animation: cn-glow 5s ease-in-out infinite; }
  .cn-spin { animation: cn-spin 0.75s linear infinite; }

  .cn-input { transition: border-color 0.18s ease, box-shadow 0.18s ease; }
  .cn-input:focus { outline: none; }

  .cn-btn { transition: opacity 0.16s ease, transform 0.16s ease; }
  .cn-btn:hover:not(:disabled) { opacity: 0.87; transform: translateY(-1px); }
  .cn-btn:disabled { opacity: 0.5; cursor: not-allowed; }

  .cn-contact-row { transition: background 0.18s ease; }
  .cn-contact-row:hover { background: rgba(255,255,255,0.03) !important; }
`;

/* ── Contact info row ─────────────────────────────────────────── */
function ContactRow({ icon: Icon, color, label, value, pax26 }) {
  return (
    <div className="cn-contact-row flex items-center gap-4 p-3.5 rounded-xl -mx-1">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: `${color}14`, color }}>
        <Icon size={16} />
      </div>
      <div>
        <p className="cn-mono text-[10px] uppercase tracking-widest mb-0.5"
          style={{ color: pax26?.textSecondary, opacity: 0.4 }}>
          {label}
        </p>
        <p className="text-sm font-semibold" style={{ color: pax26?.textPrimary }}>
          {value}
        </p>
      </div>
    </div>
  );
}

/* ── Main component ───────────────────────────────────────────── */
const Contact = () => {
  const { pax26 } = useGlobalContext();
  const [form, setForm]         = useState({ name: "", email: "", message: "" });
  const [focused, setFocused]   = useState("");
  const [loading, setLoading]   = useState(false);

  const primary = pax26?.primary || "#3b82f6";

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message)
      return toast.error("All fields are required!");
    setLoading(true);
    await new Promise(r => setTimeout(r, 800)); // simulate send
    toast.success("Message sent successfully!");
    setForm({ name: "", email: "", message: "" });
    setLoading(false);
  };

  const inputStyle = (field) => ({
    background: pax26?.secondaryBg,
    color: pax26?.textPrimary,
    border: `1px solid ${focused === field ? primary : pax26?.border}`,
    boxShadow: focused === field ? `0 0 0 3px ${primary}15` : "none",
  });

  return (
    <>
      <style>{CSS}</style>
      <div className="cn-root min-h-screen px-5 py-16" style={{ background: pax26?.secondaryBg }}>
        <div className="max-w-5xl mx-auto">

          {/* ── Page header ─────────────────────────────── */}
          <div className="cn-s1 mb-12">
            <div className="flex items-center gap-2 mb-3">
              <span className="cn-mono text-[10px] font-medium uppercase tracking-widest"
                style={{ color: pax26?.textSecondary, opacity: 0.4 }}>
                Contact
              </span>
              <div className="h-px flex-1 max-w-12" style={{ background: pax26?.border }} />
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold leading-tight"
              style={{ color: pax26?.textPrimary }}>
              Get in{" "}
              <span className="cn-serif" style={{ color: primary }}>touch</span>
            </h1>
            <p className="text-sm mt-3 max-w-md"
              style={{ color: pax26?.textSecondary, opacity: 0.6 }}>
              We're always here to help. Have a question, a feature request, or just want to say hello? Reach out.
            </p>
          </div>

          {/* ── Main grid ───────────────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">

            {/* ── LEFT: info + image ──────────────────── */}
            <div className="cn-s1 space-y-5">

              {/* contact details card */}
              <div className="rounded-2xl p-5"
                style={{ background: pax26?.bg, border: `1px solid ${pax26?.border}` }}>
                <p className="cn-mono text-[10px] font-medium uppercase tracking-widest mb-3"
                  style={{ color: pax26?.textSecondary, opacity: 0.4 }}>
                  Contact Details
                </p>
                <div className="space-y-1">
                  <ContactRow icon={Mail}   color="#3b82f6" label="Email"    value="info@pax26.com"    pax26={pax26} />
                  <ContactRow icon={Phone}  color="#22c55e" label="Phone"    value="+234 905 091 0758" pax26={pax26} />
                  <ContactRow icon={MapPin} color="#ef4444" label="Location" value="Lagos, Nigeria"    pax26={pax26} />
                </div>
              </div>

              {/* social card */}
              <div className="rounded-2xl p-5"
                style={{ background: pax26?.bg, border: `1px solid ${pax26?.border}` }}>
                <p className="cn-mono text-[10px] font-medium uppercase tracking-widest mb-4"
                  style={{ color: pax26?.textSecondary, opacity: 0.4 }}>
                  Follow Us
                </p>
                <SocialIcons />
              </div>

              {/* response time badge */}
              <div className="flex items-center gap-3 px-5 py-4 rounded-2xl"
                style={{ background: `${primary}08`, border: `1px solid ${primary}20` }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${primary}15`, color: primary }}>
                  <MessageCircle size={16} />
                </div>
                <div>
                  <p className="text-sm font-bold" style={{ color: pax26?.textPrimary }}>
                    Typically replies in 2 hours
                  </p>
                  <p className="text-xs" style={{ color: pax26?.textSecondary, opacity: 0.55 }}>
                    Monday – Friday · 9am – 6pm WAT
                  </p>
                </div>
              </div>

              {/* image */}
              <div className="relative w-full h-52 rounded-2xl overflow-hidden shadow-lg">
                <Image
                  src="/contact-img.png"
                  alt="Contact Illustration"
                  fill
                  style={{ objectFit: "cover" }}
                  priority
                />
              </div>
            </div>

            {/* ── RIGHT: form ─────────────────────────── */}
            <div className="cn-s2 rounded-2xl overflow-hidden"
              style={{ background: pax26?.bg, border: `1px solid ${pax26?.border}` }}>

              {/* top strip */}
              <div className="h-1 w-full"
                style={{ background: `linear-gradient(90deg, ${primary}, ${primary}55, transparent)` }} />

              {/* form header */}
              <div className="flex items-center gap-3 px-6 py-5"
                style={{ borderBottom: `1px solid ${pax26?.border}` }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: `${primary}15`, color: primary }}>
                  <Send size={16} />
                </div>
                <div>
                  <p className="text-sm font-bold" style={{ color: pax26?.textPrimary }}>Send us a message</p>
                  <p className="cn-mono text-[10px]" style={{ color: pax26?.textSecondary, opacity: 0.45 }}>
                    We'll respond within 2 hours
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5">

                {/* Name */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-widest mb-2"
                    style={{ color: pax26?.textSecondary, opacity: 0.5 }}>
                    Full Name
                  </label>
                  <input
                    type="text" name="name" value={form.name}
                    onChange={handleChange} placeholder="John Doe" required
                    className="cn-input w-full px-4 py-3 rounded-xl text-sm"
                    style={inputStyle("name")}
                    onFocus={() => setFocused("name")} onBlur={() => setFocused("")}
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-widest mb-2"
                    style={{ color: pax26?.textSecondary, opacity: 0.5 }}>
                    Email Address
                  </label>
                  <input
                    type="email" name="email" value={form.email}
                    onChange={handleChange} placeholder="you@example.com" required
                    className="cn-input w-full px-4 py-3 rounded-xl text-sm"
                    style={inputStyle("email")}
                    onFocus={() => setFocused("email")} onBlur={() => setFocused("")}
                  />
                </div>

                {/* Message */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-widest mb-2"
                    style={{ color: pax26?.textSecondary, opacity: 0.5 }}>
                    Message
                  </label>
                  <textarea
                    name="message" value={form.message} rows={5}
                    onChange={handleChange}
                    placeholder="Write your message here…"
                    required
                    className="cn-input w-full px-4 py-3 rounded-xl text-sm resize-none"
                    style={inputStyle("message")}
                    onFocus={() => setFocused("message")} onBlur={() => setFocused("")}
                  />
                </div>

                <div className="h-px" style={{ background: pax26?.border }} />

                <button
                  type="submit"
                  disabled={loading}
                  className="cn-btn w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl text-sm font-bold text-white"
                  style={{
                    background: loading ? `${primary}70` : primary,
                    boxShadow: loading ? "none" : `0 10px 28px ${primary}38`,
                  }}>
                  {loading
                    ? <><div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white cn-spin" />Sending…</>
                    : <><Send size={15} /> Send Message</>
                  }
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Contact;