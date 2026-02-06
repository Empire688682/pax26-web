// app/ClientWrapper.js
"use client";

import Sidebar from "@/components/Sidebar/Sidebar";
import { AppProvider } from "@/components/Context";
import Footer from "@/components/Footer/Footer";
import Header from "@/components/Header/Header";

export default function ClientWrapper({ children }) {
  return (
    <AppProvider>
      <div className="flex items-center shadow-md justify-start w-full">
        <Sidebar />
        <div className="w-full ovflow-hidden">
          <Header />
          {children}
        </div>
      </div>
      <Footer />
    </AppProvider>
  );
}