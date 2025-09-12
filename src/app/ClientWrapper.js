// app/ClientWrapper.js
"use client";

import Sidebar from "@/component/Sidebar/Sidebar";
import { AppProvider } from "@/component/Context";
import Footer from "@/component/Footer/Footer";
import Header from "@/component/Header/Header";
import { SessionProvider } from "next-auth/react";

export default function ClientWrapper({ children }) {
  return (
    <AppProvider>
      <div className="flex items-center bg-white shadow-md justify-start w-full">
        <Sidebar />
        <div className="w-full">
          <Header />
          <SessionProvider>
            {children}
          </SessionProvider>
        </div>
      </div>
      <Footer />
    </AppProvider>
  );
}