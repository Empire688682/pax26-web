// app/ClientWrapper.js
"use client";

import Sidebar from "@/component/Sidebar/Sidebar";
import { AppProvider } from "@/component/Context";
import Footer from "@/component/Footer/Footer";
import Header from "@/component/Header/Header";

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