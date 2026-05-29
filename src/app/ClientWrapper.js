"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar/Sidebar";
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

  return (
    <>
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