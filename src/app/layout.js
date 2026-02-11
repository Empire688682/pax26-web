// app/layout.js
import "./globals.css";
import Script from "next/script";
import ClientWrapper from "./ClientWrapper";
import { ThemeProvider } from "next-themes";
import { Analytics } from "@vercel/analytics/next";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const metadata = {
  title: "Pax26 – Digital Payments & AI Automation Platform",
  description:
    "Pax26 combines fast digital payments with powerful AI automation. Buy airtime, data, pay bills, manage utilities, and automate workflows, messaging, and business operations with AI.",
  keywords: [
    "buy airtime nigeria",
    "buy data online",
    "electricity bill payment",
    "tv subscription nigeria",
    "gift cards nigeria",
    "digital payments",
    "ai automation",
    "business automation",
    "workflow automation",
    "whatsapp automation",
    "ai agents",
    "saas nigeria",
    "pax26",
  ],
  authors: [{ name: "Jayempire" }],
  creator: "Pax26 Team",
  publisher: "Pax26",
  icons: {
    icon: "/icon.ico",
  },
  openGraph: {
    title: "Pax26 – Payments, Utilities & AI Automation",
    description:
      "Pay bills, buy airtime & data, and automate your business with AI. Pax26 powers smart payments and intelligent automation in one platform.",
    url: "https://pax26.com",
    siteName: "Pax26",
    images: [
      {
        url: "/Pax26_single_logo.png",
        width: 1200,
        height: 630,
        alt: "Pax26 Payments & AI Automation",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pax26 – Payments & AI Automation",
    description:
      "Digital payments meet AI automation. Airtime, data, bills, gift cards, and smart workflows — all on Pax26.",
    images: ["/Pax26_single_logo.png"],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* JSON-LD Structured Data */}
        <Script
          id="pax26-schema"
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "Organization",
                  name: "Pax26",
                  url: "https://pax26.com",
                  logo: "https://pax26.com/icon.ico",
                  sameAs: [
                    "https://facebook.com/pax26",
                    "https://twitter.com/pax26",
                    "https://instagram.com/pax26",
                  ],
                },
                {
                  "@type": "SoftwareApplication",
                  name: "Pax26",
                  applicationCategory: "BusinessApplication",
                  operatingSystem: "Web",
                  offers: {
                    "@type": "Offer",
                    price: "0",
                    priceCurrency: "NGN",
                  },
                },
                {
                  "@type": "Service",
                  name: "Pax26 AI Automation",
                  description:
                    "AI-powered automation services including workflow automation, WhatsApp messaging automation, AI agents, and smart business processes.",
                  provider: {
                    "@type": "Organization",
                    name: "Pax26",
                  },
                },
              ],
            }),
          }}
        />
      </head>

      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <ClientWrapper>
            {/* Tawk.to Live Chat Script */}
            <Script
              id="tawk-to-live-chat"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  var Tawk_API = Tawk_API || {}, Tawk_LoadStart = new Date();
                  (function(){
                    var s1 = document.createElement("script"),
                        s0 = document.getElementsByTagName("script")[0];
                    s1.async = true;
                    s1.src = 'https://embed.tawk.to/6965d586c6fd22197dd5a8e3/1jeqsk619';
                    s1.charset = 'UTF-8';
                    s1.setAttribute('crossorigin','*');
                    s0.parentNode.insertBefore(s1, s0);
                  })();
                `,
              }}
            />

            {children}
            <ToastContainer />
          </ClientWrapper>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
