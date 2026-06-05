import Contact from "@/components/Contact/Contact";
import React from "react";
import Script from "next/script";

export const metadata = {
  title: "Contact Pax26 – Support, Partnerships & Business Inquiries",

  description:
    "Contact Pax26 for support, partnerships, or business inquiries. Our team is ready to help you with AI automation, digital services, and platform assistance.",

  keywords: [
    "contact pax26",
    "pax26 support",
    "ai automation support",
    "pax26 customer support",
    "whatsapp automation support",
    "digital services nigeria support",
  ],

  alternates: {
    canonical: "https://pax26.com/contact",
  },

  openGraph: {
    title: "Contact Pax26 – AI Automation & Digital Services Support",
    description:
      "Need help or want to partner with Pax26? Contact our team for support with AI automation and digital services.",
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
      "Reach out to Pax26 for support, partnerships, or questions about our AI automation platform.",
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
                  "Contact Pax26 for support, partnerships, and inquiries about AI automation and digital services.",
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