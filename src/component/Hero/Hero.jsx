"use client"
import Image from 'next/image';
import Link from 'next/link';
import { useGlobalContext } from '../Context';

export default function Hero() {
  const { openModal, pax26 } = useGlobalContext();
  return (
    <section
      className="relative overflow-hidden pt-32 pb-24 px-16"
      style={{ backgroundColor: pax26.bg }}
    >
      {/* Gradient glow */}
      <div className="absolute inset-0">
        <div
          className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full blur-[120px] opacity-30"
          style={{ background: pax26.primary }}
        />
        <div
          className="absolute top-40 -right-40 w-[500px] h-[500px] rounded-full blur-[120px] opacity-20"
          style={{ background: pax26.btn }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">

        {/* TEXT SIDE */}
        <div>
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm mb-6 backdrop-blur-md"
            style={{
              background: `${pax26.primary}15`,
              color: pax26.primary,
            }}
          >
            🤖 Payments + AI Automation
          </div>

          <h1
            className="text-5xl md:text-6xl text-center md:text-left font-extrabold leading-tight"
            style={{ color: pax26.textPrimary }}
          >
            One Platform.
            <br />
            <span className="bg-clip-text">
              Payments, Utilities & AI
            </span>
          </h1>

          <p
            className="mt-6 text-xl max-w-xl"
            style={{ color: pax26.textSecondary }}
          >
            Pay bills, buy airtime, data, electricity, TV subscriptions and gift cards —
            now enhanced with AI-powered automation to save time and reduce stress.
          </p>

          {/* CTA */}
          <div className="mt-10 flex flex-wrap items-center md:justify-start justify-center gap-5">
            <button
              onClick={() => openModal("register")}
              className="px-6 py-4 rounded-full text-sm font-semibold shadow-xl hover:scale-105 transition"
              style={{
                background: `linear-gradient(90deg, ${pax26.primary}, ${pax26.btn})`,
                color: "#fff",
              }}
            >
              Create Account
            </button>

            <Link
              href="#pricing"
              className="px-8 py-4 rounded-full border text-sm font-semibold hover:scale-105 transition"
              style={{
                borderColor: pax26.primary,
                color: pax26.primary,
              }}
            >
              View Pricing
            </Link>
          </div>

          {/* Trust badges */}
          <div className="mt-10 flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-green-500">✔</span>
              <span style={{ color: pax26.textSecondary }}>Instant delivery</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-500">✔</span>
              <span style={{ color: pax26.textSecondary }}>Secure payments</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-500">✔</span>
              <span style={{ color: pax26.textSecondary }}>AI-powered automation</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-500">✔</span>
              <span style={{ color: pax26.textSecondary }}>24/7 support</span>
            </div>
          </div>
        </div>

{/* VISUAL SIDE */}
<div className="relative flex justify-center">
  <div
    className="relative w-[320px] h-[560px] rounded-[40px] p-4 backdrop-blur-xl shadow-2xl border"
    style={{
      background: `${pax26.bg}aa`,
      borderColor: `${pax26.primary}90`,
    }}
  >
    <div
      className="w-full h-full rounded-[30px] p-4 flex flex-col gap-4"
      style={{ background: pax26.card }}
    >

      {/* Header */}
      <div>
        <h3
          className="text-lg font-semibold"
          style={{ color: pax26.textPrimary }}
        >
          Pax26
        </h3>
        <p
          className="text-xs"
          style={{ color: pax26.textSecondary }}
        >
          Powered by Pax AI 🤖
        </p>
      </div>

      {/* Balance */}
      <div>
        <p
          className="text-sm"
          style={{ color: pax26.textSecondary }}
        >
          Wallet Balance
        </p>
        <p
          className="text-2xl font-bold"
          style={{ color: pax26.primary }}
        >
          ₦24,500.00
        </p>
      </div>

      {/* Services */}
      <div className="grid grid-cols-2 gap-3">
        {["Airtime", "Data", "TV", "Electricity"].map((item) => (
          <div
            key={item}
            className="rounded-xl p-2 text-center text-xs font-medium shadow"
            style={{
              background: `${pax26.primary}10`,
              color: pax26.primary,
            }}
          >
            {item}
          </div>
        ))}
      </div>

      {/* Pax AI Assistant */}
      <div
        className="p-3 rounded-xl text-sm shadow"
        style={{
          background: `${pax26.primary}12`,
          color: pax26.textPrimary,
        }}
      >
        🤖 <strong>Pax AI</strong>
        <p className="mt-1 text-xs" style={{ color: pax26.textSecondary }}>
          Your data plan expires tomorrow.
          I can auto-renew it for you.
        </p>
      </div>

      {/* Automation Status */}
      <div
        className="p-3 rounded-xl text-xs"
        style={{
          background: `${pax26.btn}12`,
          color: pax26.btn,
        }}
      >
        ⚡ Automation Active  
        <p className="mt-1">
          Monthly data renewal enabled
        </p>
      </div>

      {/* AI Action Result */}
      <div
        className="p-3 rounded-xl text-xs"
        style={{
          background: `#22c55e15`,
          color: "#22c55e",
        }}
      >
        ✅ Pax AI completed your last payment successfully
      </div>

    </div>
  </div>
</div>

      </div>
    </section>
  );
}
