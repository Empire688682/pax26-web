import Blog from '@/components/Blog/Blog'
import React from 'react'

export const metadata = {
  title: "Pax26 Blog – AI Automation & Digital Services Insights",
  description:
    "Read the Pax26 blog for the latest tips and guides on AI automation, WhatsApp auto-replies, lead follow-ups, chatbots, and digital services like airtime, data, and bill payments.",
  keywords: [
    "pax26 blog",
    "ai automation tips",
    "whatsapp automation",
    "lead follow-up",
    "digital services nigeria",
    "chatbots",
  ],
  alternates: {
    canonical: "https://pax26.com/blog",
  },
  openGraph: {
    title: "Pax26 Blog – AI Automation & Digital Services",
    description:
      "Stay updated with Pax26 blog posts on AI automation, WhatsApp automation, chatbots, and other digital services for businesses in Nigeria.",
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
      "Get insights from Pax26 on AI automation, WhatsApp bots, lead follow-ups, and digital services in Nigeria.",
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