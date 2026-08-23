"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Sidebar from "@/components/Sidebar/Sidebar";
import { usePathname } from "next/navigation";
import { AppProvider, useGlobalContext } from "@/components/Context";
import Footer from "@/components/Footer/Footer";
import Header from "@/components/Header/Header";
import BackgroundFX from "@/components/BackgroundFX";
import LaunchGate from "@/components/LaunchGate/LaunchGate";
import MobileBottomNav from "@/components/MobileBottomNav/MobileBottomNav";

// Lazy-load signup modal — splits its JS into a separate async chunk.
// This removes ~150 KB from the critical initial mobile JS bundle.
const SignupPage = dynamic(() => import("@/components/SignupPage/SignupPage"), {
  ssr: false,
  loading: () => null,
});

// Inner component so it can access context for theme/pax26
const AppShell = ({ children }) => {
  const { pax26 } = useGlobalContext();
  const pathname = usePathname();
  const isDashboardRoute = pathname.startsWith("/dashboard") || pathname.startsWith("/fund-wallet") || pathname.startsWith("/transactions") || pathname.startsWith("/profile") || pathname.startsWith("/notifications");
  const isInbox = pathname === "/dashboard/automations/whatsapp-inbox";
  const isStore = pathname.startsWith("/store");
  // Hide global footer on ALL dashboard routes — MobileBottomNav replaces it on mobile,
  // and dashboard app-pages don't need a marketing footer.
  const hideFooter = isDashboardRoute || isInbox || isStore;
  const hideHeader = isInbox || isStore;

  return (
    <LaunchGate>
      {!isStore && <BackgroundFX pax26={pax26} />}
      {!isStore && <SignupPage />}
      <div style={{ position: "relative", zIndex: 1 }}>
        <div className="flex items-start shadow-md justify-start w-full">
          {!isStore && <Sidebar />}
          <div className={`w-full overflow-hidden ${isDashboardRoute && !isInbox ? "pb-28 md:pb-0" : ""}`}>
            {!hideHeader && (
              <div className={isDashboardRoute ? "hidden md:block" : ""}>
                <Header />
              </div>
            )}
            {children}
          </div>
        </div>
        {!hideFooter && <Footer />}
        <MobileBottomNav />
      </div>
    </LaunchGate>
  );
};

export default function ClientWrapper({ children }) {
  return (
    <AppProvider>
      <AppShell>{children}</AppShell>
    </AppProvider>
  );
}