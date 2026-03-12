// app/layout.js
import "./globals.css";
import Script from "next/script";
import ClientWrapper from "./ClientWrapper";
import { ThemeProvider } from "next-themes";
import { Analytics } from "@vercel/analytics/next";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const metadata = {
  metadataBase: new URL("https://pax26.com"),

  title: {
    default: "Pax26 Technologies – AI Automation Platform for WhatsApp & Business Workflows",
    template: "%s | Pax26",
  },

  description:
    "Pax26 Technologies is an AI automation platform that helps businesses automate WhatsApp replies, capture leads, and manage workflows. It also supports airtime, data, electricity payments and digital services.",

  keywords: [
    "ai automation platform",
    "whatsapp ai automation",
    "ai chatbot for business",
    "business automation tools",
    "workflow automation",
    "ai agents",
    "saas automation platform",
    "buy airtime nigeria",
    "buy data online nigeria",
    "pay electricity bills nigeria",
    "tv subscription nigeria",
    "digital payments nigeria",
    "pax26",
  ],

  authors: [{ name: "Jayempire" }],
  creator: "Pax26 Team",
  publisher: "Pax26",

  applicationName: "Pax26 Technologies",
  category: "AI Automation Platform",

  icons: {
    icon: "/icon.ico",
    shortcut: "/icon.ico",
    apple: "/icon.ico",
  },

  alternates: {
    canonical: "https://pax26.com",
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  openGraph: {
    title: "Pax26 Technologies – AI Automation for WhatsApp & Business Workflows",
    description:
      "Automate your business with AI. Pax26 enables WhatsApp automation, lead capture, and workflow automation while supporting digital payments.",
    url: "https://pax26.com",
    siteName: "Pax26",
    locale: "en_US",
    type: "website",

    images: [
      {
        url: "/Pax26_single_logo.png",
        width: 1200,
        height: 630,
        alt: "Pax26 AI Automation Platform",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Pax26 Pax26 Technologies – AI Automation Platform",
    description:
      "Automate WhatsApp replies, capture leads and run workflows with AI. Pax26 also supports digital payments and utilities.",
    images: ["/Pax26_single_logo.png"],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>

        {/* Structured Data for SEO */}
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
                  name: "Pax26 Technologies",
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
                  name: "Pax26 Technologies",
                  url: "https://pax26.com",
                  applicationCategory: "BusinessApplication",
                  operatingSystem: "Web",
                  description:
                    "Pax26 is an AI automation platform that helps businesses automate WhatsApp replies, capture leads, and manage workflows.",
                  creator: {
                    "@type": "Organization",
                    name: "Pax26",
                  },
                  offers: {
                    "@type": "Offer",
                    price: "0",
                    priceCurrency: "NGN",
                  },
                },

                {
                  "@type": "Service",
                  name: "Pax26 Technologies AI Automation",
                  description:
                    "AI powered automation services including WhatsApp messaging automation, AI agents, workflow automation and lead capture.",
                  provider: {
                    "@type": "Organization",
                    name: "Pax26 Technologies",
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

            {/* Live Chat */}
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