import About from "@/components/About/About";
import React from "react";

export const metadata = {
  title: "About Pax26 – WhatsApp Commerce Platform for Small Businesses",

  description:
    "Learn about Pax26 — the platform that helps businesses create an online storefront, automate WhatsApp conversations using AI, and convert chats into real sales.",

  keywords: [
    "about pax26",
    "pax26 company",
    "whatsapp commerce platform",
    "whatsapp store builder",
    "ai sales assistant",
    "sell on whatsapp",
    "small business automation",
  ],

  alternates: {
    canonical: "https://pax26.com/about",
  },

  openGraph: {
    title: "About Pax26 – WhatsApp Commerce Platform",
    description:
      "Discover Pax26 — the platform that lets you build an online store, automate customer conversations, and sell on WhatsApp with AI.",
    url: "https://pax26.com/about",
    siteName: "Pax26",
    images: [
      {
        url: "/Pax26_single_logo.png",
        width: 1200,
        height: 630,
        alt: "About Pax26",
      },
    ],
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "About Pax26",
    description:
      "Learn how Pax26 helps businesses build online stores and sell more through WhatsApp using AI automation.",
    images: ["/Pax26_single_logo.png"],
  },
};

const Page = () => {
  return (
    <div>
      <About />
    </div>
  );
};

export default Page;