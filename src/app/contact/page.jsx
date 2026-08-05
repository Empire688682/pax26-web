import Contact from "@/components/Contact/Contact";
import React from "react";
import Script from "next/script";

export const metadata = {
  title: "Contact Pax26 – Support, Partnerships & Business Inquiries",

  description:
    "Contact Pax26 for support, partnerships, or business inquiries. Our team is ready to help you build your WhatsApp store and automate your customer conversations.",

  keywords: [
    "contact pax26",
    "pax26 support",
    "whatsapp store support",
    "pax26 customer support",
    "whatsapp commerce help",
    "sell on whatsapp support",
  ],

  alternates: {
    canonical: "https://pax26.com/contact",
  },

  openGraph: {
    title: "Contact Pax26 – WhatsApp Commerce Support",
    description:
      "Need help or want to partner with Pax26? Contact our team for support with your WhatsApp store and AI automation.",
    url: "https://pax26.com/contact",
    siteName: "Pax26",
    images: [
      {
        url: "/Pax26_single_logo.png",
        width: 1200,
        height: 630,
        alt: "Contact Pax26",
      },
    ],
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Contact Pax26",
    description:
      "Reach out to Pax26 for support, partnerships, or questions about building your WhatsApp store.",
    images: ["/Pax26_single_logo.png"],
  },
};

const Page = () => {
  return (
    <>
      {/* Contact Page Structured Data */}
      <Script
        id="contact-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "ContactPage",
                name: "Contact Pax26",
                url: "https://pax26.com/contact",
                description:
                  "Contact Pax26 for support, partnerships, and inquiries about building your WhatsApp store and AI automation.",
              },
              {
                "@type": "Organization",
                name: "Pax26",
                url: "https://pax26.com",
                contactPoint: {
                  "@type": "ContactPoint",
                  contactType: "customer support",
                  email: "info@pax26.com",
                  availableLanguage: ["English"],
                },
              },
            ],
          }),
        }}
      />

      <div>
        <Contact />
      </div>
    </>
  );
};

export default Page;