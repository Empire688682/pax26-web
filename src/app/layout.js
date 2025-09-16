// app/layout.js
import "./globals.css";
import Script from "next/script";
import ClientWrapper from "./ClientWrapper";
import { ThemeProvider } from "next-themes";

export const metadata = {
  title: "Pax26 - Simplifying Digital Payments & Utility Services",
  description:
    "Pax26 is your all-in-one platform for airtime, data, electricity, TV subscriptions, gift cards, and more. Enjoy fast, secure, and reliable digital transactions anytime, anywhere.",
  author: "Jayempire",
  icons: {
    icon: "/icon.ico",
  },
};


export default function RootLayout({ children }) {
  return (
    <html lang="en" 
    suppressHydrationWarning
    >
      <body>
        <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem = {true}
        >
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
                  s1.src = 'https://embed.tawk.to/681cca35fd6aa2190e6ef074/1iqo7bolo';
                  s1.charset = 'UTF-8';
                  s1.setAttribute('crossorigin','*');
                  s0.parentNode.insertBefore(s1, s0);
                })();
              `,
            }}
          />
          {children}
        </ClientWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}