"use client"
import Image from 'next/image';
import Link from 'next/link';
import { useGlobalContext } from '../Context';
import DemoApp from '../DemoApp/DemoApp';

export default function Hero() {
  const { openModal, pax26 } = useGlobalContext();
  return (
    <section
      style={{ backgroundColor: pax26.bg }}
      className="relative overflow-hidden"
    >
      {/* Gradient glow */}
      <div
          className="absolute -top-40 -left-40 w-[600px] min-h-[800px] rounded-full blur-[120px] opacity-30"
          style={{ background: pax26.primary }}
        />
      <DemoApp />
    </section>
  );
}
