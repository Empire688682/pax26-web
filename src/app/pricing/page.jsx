import React from "react";
import PricingClient from "./PricingClient";

export const metadata = {
  title: "Pricing – Pax26 WhatsApp Commerce Plans",
  description:
    "Start free and scale as you grow. Every Pax26 plan includes your online storefront, WhatsApp connection, and AI sales agent. Simple, transparent pricing in Nigerian Naira.",
  keywords: [
    "pax26 pricing",
    "whatsapp store pricing",
    "whatsapp commerce plans",
    "ai sales agent pricing",
    "sell on whatsapp price",
    "online store builder pricing",
    "small business whatsapp plan",
  ],
  alternates: {
    canonical: "https://pax26.com/pricing",
  },
  openGraph: {
    title: "Pax26 Pricing – WhatsApp Commerce Plans",
    description:
      "Simple, transparent plans. Start free — your store, WhatsApp, and AI agent included on every plan.",
    url: "https://pax26.com/pricing",
    siteName: "Pax26",
    images: [
      {
        url: "/Pax26_single_logo.png",
        width: 1200,
        height: 630,
        alt: "Pax26 Pricing",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pax26 Pricing",
    description:
      "Start free. Every plan includes your online store, WhatsApp connection, and AI sales agent.",
    images: ["/Pax26_single_logo.png"],
  },
};

export default function PricingPage() {
  return (
    <div className="min-h-screen pt-20">
      <PricingClient />
    </div>
  );
}
