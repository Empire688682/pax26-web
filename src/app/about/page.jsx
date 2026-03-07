import About from "@/components/About/About";
import React from "react";

export const metadata = {
  title: "About Pax26 – AI Automation Platform & Digital Services",

  description:
    "Learn about Pax26, an AI automation platform that helps businesses automate WhatsApp replies, capture leads, and streamline workflows while also providing digital services like airtime, data, and bill payments.",

  keywords: [
    "about pax26",
    "pax26 company",
    "ai automation platform",
    "whatsapp automation",
    "business automation tools",
    "digital services nigeria",
  ],

  alternates: {
    canonical: "https://pax26.com/about",
  },

  openGraph: {
    title: "About Pax26 – AI Automation Platform",
    description:
      "Discover Pax26, the platform combining AI automation with digital services to help businesses and individuals operate smarter.",
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
      "Learn how Pax26 helps businesses automate operations with AI while offering fast digital services.",
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