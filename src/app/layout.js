// app/layout.js
import "./globals.css";
import Script from "next/script";
import ClientWrapper from "./ClientWrapper";
import { ThemeProvider } from "next-themes";
import { Analytics } from "@vercel/analytics/next";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const metadata = {
  title: "Pax26 - Simplifying Digital Payments & Utility Services",
  description:
    "Pax26 is your all-in-one platform for airtime, data, electricity, TV subscriptions, gift cards, and more. Enjoy fast, secure, and reliable digital transactions anytime, anywhere.",
  keywords: [
    "buy airtime",
    "buy airtime online in nigeria",
    "buy data",
    "electricity bills",
    "TV subscription",
    "gift cards",
    "digital payments",
    "Nigeria",
  ],
  authors: [{ name: "Jayempire" }],
  creator: "Pax26 Team",
  publisher: "Pax26",
  icons: {
    icon: "/icon.ico",
  },
  openGraph: {
    title: "Pax26 - Fast & Reliable Digital Transactions",
    description:
      "Top up airtime, buy data, pay electricity & TV bills, and purchase gift cards securely on Pax26.",
    url: "https://pax26.com",
    siteName: "Pax26",
    images: [
      {
        url: "/Pax26_single_logo.png",
        width: 1200,
        height: 630,
        alt: "Pax26 Digital Payments",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pax26 - Simplifying Digital Payments",
    description:
      "Airtime, data, bills & gift cards in one platform. Fast, secure, and reliable.",
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
              "@type": "Organization",
              name: "Pax26",
              url: "https://pax26.com",
              logo: "https://pax26.com/icon.ico",
              sameAs: [
                "https://facebook.com/pax26",
                "https://twitter.com/pax26",
                "https://instagram.com/pax26",
              ],
            }),
          }}
        />
      </head>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem={true}>
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
