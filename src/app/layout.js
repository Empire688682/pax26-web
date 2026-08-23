// app/layout.js
import "./globals.css";
import ClientWrapper from "./ClientWrapper";
import { ThemeProvider } from "next-themes";
import { Analytics } from "@vercel/analytics/next";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Inter, Playfair_Display, Syne, DM_Mono } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  display: "swap",
});

const dmMono = DM_Mono({
  weight: ["400", "500"],
  subsets: ["latin"],
  variable: "--font-dm-mono",
  display: "swap",
});

export const metadata = {
  metadataBase: new URL("https://www.pax26.com"),

  title: {
    default: "Pax26 — Build Your Online Store & Sell on WhatsApp with AI",
    template: "%s | Pax26",
  },

  description:
    "Create your online storefront, showcase products, automate customer conversations and convert WhatsApp chats into sales using AI. Pax26 is the WhatsApp Commerce platform for small businesses.",

  keywords: [
    "whatsapp business",
    "whatsapp store",
    "ai sales assistant",
    "whatsapp commerce",
    "online store builder",
    "whatsapp storefront",
    "ai customer support",
    "small business automation",
    "whatsapp shopping",
    "social commerce",
    "local business store",
    "ai whatsapp agent",
    "sell on whatsapp",
    "whatsapp chatbot",
    "pax26",
  ],

  authors: [{ name: "Pax26 Team" }],
  creator: "Pax26 Team",
  publisher: "Pax26",

  applicationName: "Pax26",
  category: "WhatsApp Commerce Platform",

  icons: {
    icon: "/icon.ico",
    shortcut: "/icon.ico",
    apple: "/icon.ico",
  },

  alternates: {
    canonical: "https://www.pax26.com",
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
    title: "Pax26 — Build Your Online Store & Sell on WhatsApp with AI",
    description:
      "Create your online storefront, showcase products, automate customer conversations and convert WhatsApp chats into sales using AI.",
    url: "https://www.pax26.com",
    siteName: "Pax26",
    locale: "en_US",
    type: "website",

    images: [
      {
        url: "/Pax26_single_logo.webp",
        width: 1200,
        height: 630,
        alt: "Pax26 — WhatsApp Commerce Platform",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Pax26 — Build Your Online Store & Sell on WhatsApp with AI",
    description:
      "Create your storefront, automate WhatsApp conversations, and let AI sell for you 24/7. Built for small businesses.",
    images: ["/Pax26_single_logo.webp"],
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${playfair.variable} ${syne.variable} ${dmMono.variable}`}
    >
      <head>
        {/* ─── AI Agent Discovery Headers (3/3 Agentic Browsing) ────────── */}
        <link rel="agent-manifest" type="application/json" href="/.well-known/agent.json" />
        <link rel="llms-txt" type="text/markdown" href="/llms.txt" />
        <meta name="ai-agent" content="enabled" />
        <meta name="web-mcp" content="v1" />

        {/* ─── Structured Data (JSON-LD) ──────────────────────────────────
            MUST use a native <script> tag (NOT next/script) so it is
            server-rendered into the initial HTML that Lighthouse and AI
            crawlers read. Using next/script with strategy="afterInteractive"
            deferred it past the crawl window, hiding it from audits.
        ──────────────────────────────────────────────────────────────────── */}
        <script
          id="pax26-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [

                {
                  "@type": "Organization",
                  name: "Pax26",
                  url: "https://pax26.com",
                  logo: "https://www.pax26.com/Pax26_single_logo.webp",
                  sameAs: [
                    "https://www.pax26.com",
                    "https://facebook.com/pax26",
                    "https://twitter.com/pax26",
                    "https://instagram.com/pax26",
                  ],
                },

                {
                  "@type": "SoftwareApplication",
                  name: "Pax26",
                  url: "https://pax26.com",
                  applicationCategory: "BusinessApplication",
                  operatingSystem: "Web",
                  description:
                    "Pax26 is a WhatsApp Commerce platform that helps businesses create an online storefront, automate customer conversations using AI, and convert WhatsApp chats into sales.",
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
                  name: "Pax26 WhatsApp Commerce Platform",
                  description:
                    "Build your online store, connect WhatsApp, and let AI sell for you 24/7. Pax26 provides AI-powered WhatsApp automation, product catalog management, and smart lead follow-up for small businesses.",
                  provider: {
                    "@type": "Organization",
                    name: "Pax26",
                  },
                },

                {
                  "@type": "WebSite",
                  name: "Pax26",
                  url: "https://pax26.com",
                  potentialAction: [
                    {
                      "@type": "SearchAction",
                      target: {
                        "@type": "EntryPoint",
                        urlTemplate: "https://pax26.com/store/{search_term_string}",
                      },
                      "query-input": "required name=search_term_string",
                    },
                  ],
                },

              ],
            }),
          }}
        />

      </head>

      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <ClientWrapper>

            {children}
            <ToastContainer />

          </ClientWrapper>
        </ThemeProvider>

        <Analytics />
      </body>
    </html>
  );
}