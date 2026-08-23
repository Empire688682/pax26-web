"use client";

import { Store, Bot, MessageSquare, Package, Users, BarChart2, Bell, Zap } from 'lucide-react';
import { useGlobalContext } from '../Context';

export default function Services() {
  const { pax26 } = useGlobalContext();

  return (
    <section
      className="py-16"
      style={{ backgroundColor: pax26.secondaryBg }}
    >
      <div className="max-w-7xl mx-auto px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4"
          style={{ color: pax26.textPrimary }}>
          Everything You Need to Sell on WhatsApp
        </h2>
        <p className="mb-12 max-w-2xl mx-auto text-sm leading-relaxed"
          style={{ color: pax26.textSecondary }}>
          Pax26 gives you a complete set of tools to build your store, automate conversations,
          and turn WhatsApp chats into real sales — no coding required.
        </p>

        <div className="grid md:grid-cols-4 gap-8">
          <ServiceCard
            Icon={Store}
            title="Online Storefront"
            description="Display your products beautifully and let customers order directly on WhatsApp."
          />
          <ServiceCard
            Icon={Bot}
            title="AI Customer Replies"
            description="Reply to customers instantly even while you sleep. Your Smart Agent handles it all."
          />
          <ServiceCard
            Icon={MessageSquare}
            title="WhatsApp Automation"
            description="Set up smart conversation flows that guide customers from interest to order."
          />
          <ServiceCard
            Icon={Package}
            title="Product Catalog"
            description="Add unlimited products with images, prices, and descriptions in minutes."
          />
          <ServiceCard
            Icon={Users}
            title="Customer Management"
            description="Keep track of every lead and customer in one clean, organised inbox."
          />
          <ServiceCard
            Icon={Zap}
            title="Smart Lead Follow-up"
            description="Automatically follow up with interested customers so no sale slips through."
          />
          <ServiceCard
            Icon={Bell}
            title="Order Notifications"
            description="Get instant alerts for every new order placed through your WhatsApp store."
          />
          <ServiceCard
            Icon={BarChart2}
            title="Business Analytics"
            description="See how your store is performing — conversations, orders, and revenue at a glance."
          />
        </div>
      </div>
    </section>
  );
}

function ServiceCard({ Icon, title, description }) {
  const { pax26 } = useGlobalContext();
  return (
    <div
      className="p-6 rounded-xl shadow hover:shadow-md transition"
      style={{ backgroundColor: pax26.card }}
    >
      <div className="flex justify-center mb-4" style={{ color: pax26.primary || '#3b82f6' }}>
        <Icon size={32} />
      </div>
      <h3
        className="text-lg font-semibold mb-2"
        style={{ color: pax26.textPrimary }}
      >{title}</h3>
      <p className="text-sm leading-relaxed" style={{ color: pax26.textSecondary }}>{description}</p>
    </div>
  );
}
