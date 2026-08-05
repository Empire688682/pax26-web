import Blog from '@/components/Blog/Blog'
import React from 'react'

export const metadata = {
  title: "Pax26 Blog – WhatsApp Commerce, AI Automation & Selling Tips",
  description:
    "Read the Pax26 blog for practical guides on selling through WhatsApp, building your online storefront, automating customer conversations with AI, and growing your business.",
  keywords: [
    "pax26 blog",
    "whatsapp commerce tips",
    "sell on whatsapp",
    "whatsapp store guide",
    "ai sales automation",
    "small business whatsapp",
    "online store tips",
    "whatsapp chatbot guide",
  ],
  alternates: {
    canonical: "https://pax26.com/blog",
  },
  openGraph: {
    title: "Pax26 Blog – WhatsApp Commerce & AI Selling Tips",
    description:
      "Practical guides and insights on selling through WhatsApp, building your online store, and automating customer conversations with AI.",
    url: "https://pax26.com/blog",
    siteName: "Pax26",
    images: [
      {
        url: "/Pax26_single_logo.png",
        width: 1200,
        height: 630,
        alt: "Pax26 Blog",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pax26 Blog",
    description:
      "Learn how to sell more on WhatsApp, automate customer conversations with AI, and grow your business with Pax26.",
    images: ["/Pax26_single_logo.png"],
  },
};

const Page = () => {
  return (
    <div>
      <Blog />
    </div>
  )
}

export default Page