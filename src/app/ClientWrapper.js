"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar/Sidebar";
import Script from "next/script";
import { usePathname } from "next/navigation";
import { AppProvider, useGlobalContext } from "@/components/Context";
import Footer from "@/components/Footer/Footer";
import Header from "@/components/Header/Header";
import BackgroundFX from "@/components/BackgroundFX";

// Inner component so it can access context for theme/pax26
const AppShell = ({ children }) => {
  const { pax26 } = useGlobalContext();
  const pathname = usePathname();
  const isInbox = pathname === "/dashboard/automations/whatsapp-inbox";
  const hideFooter = isInbox;
  const hideHeader = isInbox;

  // Tawk.to restricted routes
  const showTawk = ["/", "/dashboard", "/contact"].includes(pathname);

  // Handle Tawk.to visibility on route change
  useEffect(() => {
    if (typeof Tawk_API !== 'undefined') {
      try {
        if (showTawk) {
          Tawk_API.show();
        } else {
          Tawk_API.hide();
        }
      } catch (e) {
        console.error("Tawk.to error:", e);
      }
    }
  }, [pathname, showTawk]);

  return (
    <>
      {showTawk && (
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
      )}
      <BackgroundFX pax26={pax26} />
      <div style={{ position: "relative", zIndex: 1 }}>
        <div className="flex items-start shadow-md justify-start w-full">
          <Sidebar />
          <div className="w-full overflow-hidden">
            {!hideHeader && <Header />}
            {children}
          </div>
        </div>
        {!hideFooter && <Footer />}
      </div>
    </>
  );
};

export default function ClientWrapper({ children }) {
  return (
    <AppProvider>
      <AppShell>{children}</AppShell>
    </AppProvider>
  );
}