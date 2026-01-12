"use client"
import Image from 'next/image';
import Link from 'next/link';
import { useGlobalContext } from '../Context';

export default function Hero() {
  const {openModal, pax26} = useGlobalContext();
  return (
    <section
  className="relative overflow-hidden pt-32 pb-24"
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
        ⚡ Fast. Secure. Reliable
      </div>

      <h1
        className="text-5xl md:text-6xl font-extrabold leading-tight"
        style={{ color: pax26.textPrimary }}
      >
        Power Your Daily
        <br />
        <span
          className="bg-clip-text text-transparent"
          style={{
            backgroundImage: `linear-gradient(90deg, ${pax26.primary}, ${pax26.btn})`,
          }}
        >
          Digital Life
        </span>
      </h1>

      <p
        className="mt-6 text-xl max-w-xl"
        style={{ color: pax26.textSecondary }}
      >
        Buy airtime, data, electricity, TV subscriptions and gift cards — all in
        one fast, secure wallet.
      </p>

      {/* CTA */}
      <div className="mt-10 flex flex-wrap gap-5">
        <button
          onClick={() => openModal("register")}
          className="px-8 py-4 rounded-full font-semibold shadow-xl hover:scale-105 transition"
          style={{
            background: `linear-gradient(90deg, ${pax26.primary}, ${pax26.btn})`,
            color: "#fff",
          }}
        >
          Create Free Account
        </button>

        <Link
          href="#pricing"
          className="px-8 py-4 rounded-full border font-semibold hover:scale-105 transition"
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
          <span style={{ color: pax26.textSecondary }}>24/7 support</span>
        </div>
      </div>
    </div>

    {/* VISUAL SIDE */}
    <div className="relative flex justify-center">
      <div
        className="relative w-[320px] h-[620px] rounded-[40px] p-4 backdrop-blur-xl shadow-2xl border"
        style={{
          background: `${pax26.bg}aa`,
          borderColor: `${pax26.primary}30`,
        }}
      >
        <div
          className="w-full h-full rounded-[30px] p-6 flex flex-col justify-between"
          style={{ background: pax26.card }}
        >
          <div>
            <h3
              className="text-lg font-semibold"
              style={{ color: pax26.textPrimary }}
            >
              Pax26 Wallet
            </h3>
            <p
              className="mt-2 text-sm"
              style={{ color: pax26.textSecondary }}
            >
              Balance
            </p>
            <p
              className="text-3xl font-bold mt-1"
              style={{ color: pax26.primary }}
            >
              ₦24,500.00
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {["Airtime", "Data", "TV", "Electricity", "Crypto", "Betting", "Jamb", "More"].map((item) => (
              <div
                key={item}
                className="rounded-xl p-4 text-center text-sm font-medium shadow"
                style={{
                  background: `${pax26.primary}10`,
                  color: pax26.primary,
                }}
              >
                {item}
              </div>
            ))}
          </div>

          <div
            className="mt-6 p-4 rounded-xl text-sm"
            style={{
              background: `${pax26.btn}15`,
              color: pax26.btn,
            }}
          >
            Transaction successful 🎉
          </div>
        </div>
      </div>
    </div>

  </div>
</section>
  );
}
