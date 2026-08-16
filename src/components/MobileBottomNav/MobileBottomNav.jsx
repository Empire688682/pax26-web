"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { LayoutDashboard, Layers, MessageSquare, Store, Menu } from "lucide-react";
import { useGlobalContext } from "../Context";

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { pax26, setIsOpen, userData } = useGlobalContext();

  // Show only on dashboard routes and when user is logged in
  const isDashboardRoute =
    pathname?.startsWith("/dashboard") ||
    pathname?.startsWith("/fund-wallet") ||
    pathname?.startsWith("/transactions") ||
    pathname?.startsWith("/profile");
  const isStoreView = pathname?.startsWith("/store");

  if (!isDashboardRoute || isStoreView || !userData) {
    return null;
  }

  /* ── Theme Detection ── */
  const isLightTheme =
    String(pax26?.card || pax26?.bg || "").toLowerCase().includes("fff") ||
    String(pax26?.bg || "").toLowerCase() === "#ffffff" ||
    String(pax26?.bg || "").toLowerCase() === "#f8fafc";
  const isDark = !isLightTheme;

  const primaryColor = pax26?.primary || "#34d399";

  const tabs = [
    {
      id: "dashboard",
      label: "Home",
      href: "/dashboard",
      icon: LayoutDashboard,
      isActive: pathname === "/dashboard",
    },
    {
      id: "marketplace",
      label: "Market",
      href: "/dashboard/automations/market-place",
      icon: Layers,
      isActive: pathname.includes("/market-place") || pathname.includes("/automations/home"),
    },
    {
      id: "inbox",
      label: "Inbox",
      href: "/dashboard/automations/whatsapp-inbox",
      icon: MessageSquare,
      isActive: pathname.includes("/whatsapp-inbox"),
    },
    {
      id: "store",
      label: "Store",
      href: "/dashboard/my-store",
      icon: Store,
      isActive: pathname.includes("/my-store"),
    },
  ];

  return (
    <div
      className="md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-[420px]"
      style={{
        paddingBottom: "max(0px, env(safe-area-inset-bottom))",
      }}
    >
      <nav
        className="flex items-center justify-around px-2 py-2.5 rounded-3xl transition-all duration-300 relative overflow-hidden"
        style={{
          background: isDark
            ? "rgba(12, 20, 40, 0.88)"
            : "rgba(255, 255, 255, 0.92)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border: `1px solid ${
            isDark ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.08)"
          }`,
          boxShadow: isDark
            ? "0 20px 50px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.1)"
            : "0 20px 40px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.8)",
        }}
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = tab.isActive;

          return (
            <Link
              key={tab.id}
              href={tab.href}
              className="flex flex-col items-center justify-center flex-1 py-1 relative group"
            >
              <div className="relative flex flex-col items-center gap-1">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200"
                  style={{
                    background: active ? `${primaryColor}20` : "transparent",
                    color: active
                      ? primaryColor
                      : isDark
                      ? "rgba(148, 163, 184, 0.7)"
                      : "rgba(100, 116, 139, 0.8)",
                  }}
                >
                  <Icon size={18} strokeWidth={active ? 2.5 : 2} />
                </div>
                <span
                  className="text-[10px] font-semibold tracking-tight transition-colors duration-200"
                  style={{
                    color: active
                      ? primaryColor
                      : isDark
                      ? "rgba(148, 163, 184, 0.7)"
                      : "rgba(100, 116, 139, 0.8)",
                  }}
                >
                  {tab.label}
                </span>
              </div>

              {active && (
                <motion.div
                  layoutId="mobile-nav-pill"
                  className="absolute -top-2 w-5 h-1 rounded-full"
                  style={{
                    background: primaryColor,
                    boxShadow: `0 0 12px ${primaryColor}`,
                  }}
                />
              )}
            </Link>
          );
        })}

        {/* Menu Tab (Triggers Slide-out Sidebar Drawer) */}
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="flex flex-col items-center justify-center flex-1 py-1 relative group cursor-pointer"
        >
          <div className="relative flex flex-col items-center gap-1">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200"
              style={{
                color: isDark
                  ? "rgba(148, 163, 184, 0.7)"
                  : "rgba(100, 116, 139, 0.8)",
              }}
            >
              <Menu size={18} strokeWidth={2} />
            </div>
            <span
              className="text-[10px] font-semibold tracking-tight transition-colors duration-200"
              style={{
                color: isDark
                  ? "rgba(148, 163, 184, 0.7)"
                  : "rgba(100, 116, 139, 0.8)",
              }}
            >
              Menu
            </span>
          </div>
        </button>
      </nav>
    </div>
  );
}
