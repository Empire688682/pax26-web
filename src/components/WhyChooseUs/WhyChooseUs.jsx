"use client";
import {
  Bot,
  Zap,
  ShieldCheck,
  Store,
  Users,
  TrendingUp,
} from 'lucide-react';
import { useGlobalContext } from '../Context';

export default function WhyChooseUs() {
  const { pax26 } = useGlobalContext();
  return (
    <section
      className="py-16"
      style={{ backgroundColor: pax26.bg }}
    >
      <div className="max-w-7xl mx-auto px-6 text-center">
        <h2
          className="text-3xl md:text-4xl font-bold mb-4"
          style={{ color: pax26.textPrimary }}>
          Why Businesses Choose Pax26
        </h2>
        <p className="mb-12 max-w-2xl mx-auto text-sm leading-relaxed"
          style={{ color: pax26.textSecondary }}>
          Pax26 is built for one purpose — helping you sell more on WhatsApp
          without working harder.
        </p>

        <div className="grid md:grid-cols-3 gap-10 text-left">
          <BenefitCard
            Icon={Store}
            title="Your Store, Always Open"
            description="Your online storefront works 24/7 so customers can browse and order anytime, even while you sleep."
          />
          <BenefitCard
            Icon={Bot}
            title="AI That Sells For You"
            description="Your Smart Agent answers questions, shares product details, and closes sales — automatically."
          />
          <BenefitCard
            Icon={Zap}
            title="Instant Order Notifications"
            description="Get notified the moment a customer places an order so you can fulfil it fast."
          />
          <BenefitCard
            Icon={ShieldCheck}
            title="Secure & Reliable"
            description="Built on the official WhatsApp Business API, so your conversations are safe and deliverable."
          />
          <BenefitCard
            Icon={Users}
            title="Smart Lead Follow-ups"
            description="Never lose a warm lead again. Pax26 automatically re-engages customers who showed interest."
          />
          <BenefitCard
            Icon={TrendingUp}
            title="Real Business Analytics"
            description="See how many chats turn into orders, track your best products, and grow with confidence."
          />
        </div>
      </div>
    </section>
  );
}

function BenefitCard({ Icon, title, description }) {
  const { pax26 } = useGlobalContext();
  return (
    <div
      className="rounded-xl p-6 shadow-sm hover:shadow-md transition"
      style={{ backgroundColor: pax26.secondaryBg }}
    >
      <div className="flex items-center mb-4" style={{ color: pax26.primary || '#3b82f6' }}>
        <Icon size={28} className="mr-2" />
        <h3
          className="text-lg font-semibold"
          style={{ color: pax26.textPrimary }}
        >{title}</h3>
      </div>
      <p className="text-sm leading-relaxed" style={{ color: pax26.textSecondary }}>{description}</p>
    </div>
  );
}
