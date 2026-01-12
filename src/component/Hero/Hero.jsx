"use client"
import Image from 'next/image';
import Link from 'next/link';
import { useGlobalContext } from '../Context';

export default function Hero() {
  const {openModal, pax26} = useGlobalContext();
  return (
    <section
  className="pt-24 pb-16"
  style={{ backgroundColor: pax26.bg }}
>
  <div className="max-w-7xl mx-auto px-6 flex flex-col-reverse md:flex-row items-center justify-between gap-10">
    
    {/* Text Content */}
    <div className="md:w-1/2">
      <h1
        className="text-4xl md:text-5xl font-bold leading-tight"
        style={{ color: pax26.textPrimary }}
      >
        Power Your Everyday Life with{" "}
        <span style={{ color: pax26.primary }}>Pax26</span>
      </h1>
      <p className="mt-4 text-lg" style={{ color: pax26.textSecondary }}>
        Airtime, data, TV, electricity, and gift cards—instant, affordable, and stress-free.
      </p>

      <div className="mt-6 flex gap-4">
        <div
          onClick={() => openModal("register")}
          className="px-6 py-3 rounded-full transition"
          style={{
            backgroundColor: pax26.btn,
            color: "#fff",
          }}
        >
          Get Started
        </div>
        <Link
          href="#pricing"
          className="border px-6 py-3 rounded-full transition"
          style={{
            borderColor: pax26.btn,
            color: pax26.btn,
          }}
        >
          See Pricing
        </Link>
      </div>
    </div>

    {/* Hero Image */}
    <div className="md:w-1/2 flex justify-center">
      <Image
        src="/Pax26_hero.png"
        alt="Pax26 Hero"
        width={500}
        height={400}
        priority
        className="w-full h-auto rounded-lg shadow-lg"
      />
    </div>
  </div>
</section>
  );
}
