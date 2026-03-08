"use client";
import Link from "next/link";
import { useGlobalContext } from "../Context";

export default function Hero() {
  const { openModal, pax26 } = useGlobalContext();

  return (
    <section
      className="relative overflow-hidden pt-32 pb-24"
      style={{ backgroundColor: pax26.bg }}
    >
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
        <div>
          <span
            className="inline-flex px-4 py-2 rounded-full text-sm mb-6"
            style={{
              background: `${pax26.primary}15`,
              color: pax26.primary,
            }}
          >
            🤖 AI WhatsApp Automation
          </span>

          <h1
            className="text-4xl md:text-start md:text-6xl font-extrabold leading-tight"
            style={{ color: pax26.textPrimary }}
          >
            Turn WhatsApp Into  Your AI Sales Team
          </h1>

          <p
            className="mt-6 text-xl max-w-xl"
            style={{ color: pax26.textSecondary }}
          >
            Automate customer replies, send smart follow-ups and run AI
            chatbots 24/7. Pax26 also lets you manage airtime, data and
            bill payments in one platform.
          </p>

          <div className="mt-10 flex gap-4">
            <button
              onClick={() => openModal("register")}
              className="px-6 py-4 rounded-full text-sm font-semibold shadow-xl"
              style={{
                background: `linear-gradient(90deg, ${pax26.primary}, ${pax26.btn})`,
                color: "#fff",
              }}
            >
              Start Automating
            </button>

            <Link
              href="#pricing"
              className="px-6 py-4 rounded-full border text-sm font-semibold"
              style={{
                borderColor: pax26.primary,
                color: pax26.primary,
              }}
            >
              View Plans
            </Link>
          </div>
        </div>

        {/* Demo Chat */}
        <div className="rounded-3xl p-6 shadow-xl bg-white">
          <div className="space-y-4 text-sm">
            <div className="bg-gray-100 p-3 rounded-lg">
              Customer: Hi do you sell sneakers?
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              AI Bot: Yes 👟 <br />
              1️⃣ Air Max <br />
              2️⃣ Adidas <br />
              3️⃣ Jordan
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}