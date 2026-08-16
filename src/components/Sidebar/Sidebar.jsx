'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wifi, LayoutDashboard, FileCode,
  Phone, LogOut, Info, History, Settings, Bell, X,
  ChevronRight, Zap, Crown, ArrowUpRight,
  Home, Shield, Users, ShieldAlert,
  MessageSquare, Cpu, Bot, Sparkles, CreditCard, Layers, BadgeDollarSign, BarChart2,
  Radio, Send, Store, Package
} from 'lucide-react';
import { useGlobalContext } from '../Context';
import { usePlanLimits } from '@/app/hooks/usePlanLimits';
import { Button } from '../ui/Button';
import ThemeToggle from '../ThemeToogle/ThemeToogle';

/* ── Minimal CSS — only keyframe Tailwind can't do ────────────── */
const CSS = `
  @keyframes sb-submenu {
    from { opacity: 0; transform: translateY(-6px); max-height: 0; }
    to   { opacity: 1; transform: translateY(0);    max-height: 400px; }
  }
  .sb-submenu-open {
    animation: sb-submenu 0.25s cubic-bezier(0.22,1,0.36,1) both;
    overflow: hidden;
  }

  /* Use dynamic viewport height so mobile browser chrome doesn't
     push the pinned footer off-screen */
  .sb-nav  { height: 100vh; height: 100dvh; }
  .sb-panel { height: 100vh; height: 100dvh; }
  .sb-backdrop { height: 100vh; height: 100dvh; }
`;

/* ── Plain nav item ───────────────────────────────────────────── */
const NavItem = ({ href, icon: Icon, label, onClick, danger = false, pax26, isNew = false }) => {
  const pathname = usePathname();
  const isActive = pathname === href;
  const primary = pax26?.primary || '#3b82f6';

  return (
    <motion.div
      whileHover={{ x: 4 }}
      whileTap={{ scale: 0.98 }}
    >
      <Link
        href={href || '#'}
        onClick={onClick}
        className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 group relative"
        style={{
          color: isActive ? primary : (danger ? '#f87171' : pax26?.textSecondary),
          background: isActive ? `${primary}12` : 'transparent'
        }}
        onMouseEnter={e => {
          if (!isActive) {
            e.currentTarget.style.background = pax26?.secondaryBg;
            e.currentTarget.style.color = danger ? '#f87171' : pax26?.primary;
          }
        }}
        onMouseLeave={e => {
          if (!isActive) {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = danger ? '#f87171' : pax26?.textSecondary;
          }
        }}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-300"
            style={{
              background: isActive ? `${primary}20` : pax26?.secondaryBg,
              color: isActive ? primary : 'inherit',
              boxShadow: isActive ? `0 0 15px ${primary}30` : 'none'
            }}>
            <Icon size={15} strokeWidth={isActive ? 2.5 : 2} />
          </div>
          <div className="flex flex-col">
            <span className={`text-sm ${isActive ? 'font-bold' : 'font-medium'}`}>{label}</span>
          </div>
          {isNew && (
            <span className="ml-1 px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider animate-pulse"
              style={{ background: primary, color: '#fff' }}>
              New
            </span>
          )}
        </div>

        {isActive && (
          <motion.div
            layoutId="active-pill"
            className="absolute left-0 w-1 h-5 rounded-r-full"
            style={{ background: primary }}
          />
        )}

        <ChevronRight size={13} className={`transition-all duration-300 ${isActive ? 'opacity-40' : 'opacity-0 group-hover:opacity-40'}`} />
      </Link>
    </motion.div>
  );
};

/* ── Section label ────────────────────────────────────────────── */
const SectionLabel = ({ label, pax26 }) => (
  <div className="flex items-center gap-2 px-3 mb-1.5 mt-5 first:mt-1">
    <p className="text-[10px] font-bold uppercase tracking-[0.15em] whitespace-nowrap"
      style={{ color: pax26?.textSecondary, opacity: 0.5 }}>
      {label}
    </p>
    <div className="h-[1px] w-full" style={{ background: pax26?.border, opacity: 0.3 }} />
  </div>
);

/* ── Divider ──────────────────────────────────────────────────── */
const Divider = ({ pax26 }) => (
  <div className="my-3 mx-3" style={{ height: '1px', background: pax26?.border }} />
);

/* ── Main Sidebar ─────────────────────────────────────────────── */
export default function Sidebar() {
  const { isOpen, setIsOpen, logoutUser, pax26, userData, router } = useGlobalContext();
  const limits = usePlanLimits();
  const close = () => setIsOpen(false);

  return (
    <>
      <style>{CSS}</style>
      <nav
        className={`sb-nav fixed flex top-0 right-0 w-full z-80 transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* ── Panel ─────────────────────────────────────── */}
        <div
          className="sb-panel w-[78%] max-w-[300px] flex flex-col overflow-hidden"
          style={{
            background: pax26?.card ? `${pax26.card}ee` : pax26?.bg,
            backdropFilter: 'blur(24px)',
            borderRight: `1px solid ${pax26?.border}`,
            boxShadow: '8px 0 40px rgba(0,0,0,0.25)',
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-4"
            style={{ borderBottom: `1px solid ${pax26?.border}` }}>
            <Link href={userData ? '/dashboard' : '/'} onClick={close}>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-500 flex items-center justify-center">
                  <Zap size={15} className="text-white" />
                </div>
                <span className="font-black text-lg" style={{ color: pax26?.textPrimary }}>
                  Pax26
                </span>
              </div>
            </Link>
            <button
              onClick={close}
              className="w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200"
              style={{ background: pax26?.secondaryBg, color: pax26?.textSecondary }}
            >
              <X size={15} />
            </button>
          </div>

          {/* ── Scrollable nav ─────────────────────────── */}
          <div className="flex-1 overflow-y-auto px-3 py-2 flex flex-col gap-0.5">

            {!userData ? (
              /* Guest menu */
              <>
                <SectionLabel label="Menu" pax26={pax26} />
                <NavItem href="/" icon={Home} label="Home" onClick={close} pax26={pax26} />
                <NavItem href="/about" icon={Info} label="About" onClick={close} pax26={pax26} />
                <NavItem href="/blog" icon={FileCode} label="Blog" onClick={close} pax26={pax26} />
                <NavItem href="/contact" icon={Phone} label="Contact" onClick={close} pax26={pax26} />
                <NavItem href="/survey" icon={Info} label="Your Feedback" onClick={close} pax26={pax26} />
                <NavItem href="/terms" icon={Shield} label="Terms & Conditions" onClick={close} pax26={pax26} />
                <NavItem href="/privacy" icon={Shield} label="Privacy Policy" onClick={close} pax26={pax26} />
                <div className="h-4 shrink-0" />
              </>
            ) : (
              /* Authenticated menu */
              <>
                <SectionLabel label="General" pax26={pax26} />
                <NavItem href="/dashboard" icon={LayoutDashboard} label="Dashboard" onClick={close} pax26={pax26} />
                <NavItem href="/dashboard/automations/market-place" icon={Layers} label="AI Marketplace" onClick={close} pax26={pax26} />

                <SectionLabel label="Automations" pax26={pax26} />
                <NavItem href="/dashboard/automations/whatsapp-inbox" icon={MessageSquare} label="WhatsApp Inbox" onClick={close} pax26={pax26} />
                <NavItem href="/dashboard/automations/whatsapp#connect" icon={Wifi} label="Connect WhatsApp" onClick={close} pax26={pax26} />
                <NavItem href="/dashboard/automations/ai-business-dashboard" icon={Bot} label="AI Agent Setup" onClick={close} pax26={pax26} />
                {userData?.paxAI?.businessType === "seller" && (
                  <NavItem href="/dashboard/my-store" icon={Store} label="My Storefront" onClick={close} pax26={pax26} isNew />
                )}
                {userData?.paxAI?.businessType === "seller" && (
                  <NavItem href="/dashboard/automations/products" icon={Package} label="Product Manager" onClick={close} pax26={pax26} />
                )}
                <NavItem href="/dashboard/automations/whatsapp-contacts" icon={Users} label="Leads & Contacts" onClick={close} pax26={pax26} />
                <NavItem href="/dashboard/automations/staff" icon={Users} label="Team & Staff Inboxes" onClick={close} pax26={pax26} />
                <NavItem href="/dashboard/prevent-ban" icon={ShieldAlert} label="WhatsApp Safety" onClick={close} pax26={pax26} />
                <NavItem href="/dashboard/automations/market-place" icon={Cpu} label="Automation Rules" onClick={close} pax26={pax26} />
                <NavItem href="/dashboard/automations/sales" icon={BarChart2} label="Sales Analytics" onClick={close} pax26={pax26} />
                <NavItem href="/dashboard/automations/broadcast" icon={Radio} label="Send Broadcast" onClick={close} pax26={pax26} />
                <NavItem href="/dashboard/automations/broadcast/campaigns" icon={Send} label="Broadcast Reports" onClick={close} pax26={pax26} />

                <SectionLabel label="Financials" pax26={pax26} />
                <NavItem href="/fund-wallet" icon={CreditCard} label="Fund Wallet" onClick={close} pax26={pax26} />
                <NavItem href="/dashboard/referral" icon={BadgeDollarSign} label="Referral Program" onClick={close} pax26={pax26} />
                <NavItem href="/transactions" icon={History} label="Transaction History" onClick={close} pax26={pax26} />

                <SectionLabel label="Preferences" pax26={pax26} />
                <NavItem href="/profile" icon={Settings} label="Account Settings" onClick={close} pax26={pax26} />
                <NavItem href="/notifications" icon={Bell} label="Notifications" onClick={close} pax26={pax26} />
                <NavItem href="/contact" icon={Phone} label="Help & Support" onClick={close} pax26={pax26} />

                {/* Plan status widget */}
                <div className="mx-1 my-3 p-3 rounded-xl border flex flex-col gap-2"
                  style={{
                    background: pax26?.secondaryBg || 'rgba(255,255,255,0.03)',
                    borderColor: pax26?.border || 'rgba(255,255,255,0.1)',
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Crown size={13} className="text-amber-400" />
                      <span className="text-[11px] font-extrabold uppercase tracking-wider" style={{ color: pax26?.textPrimary }}>
                        {limits.plan} Plan
                      </span>
                    </div>
                    {!limits.isEnterprise && (
                      <Link href="/dashboard/billing" onClick={close}
                        className="text-[10px] font-bold flex items-center gap-0.5"
                        style={{ color: pax26?.primary || '#3b82f6' }}>
                        Upgrade <ArrowUpRight size={10} />
                      </Link>
                    )}
                  </div>

                  {/* AI messages progress */}
                  <div>
                    <div className="flex justify-between items-center text-[9px] mb-1" style={{ color: pax26?.textSecondary, opacity: 0.7 }}>
                      <span>AI Replies</span>
                      <span className="font-mono">
                        {`${limits.messagesUsed.toLocaleString()}/${limits.messagesLimit.toLocaleString()}`}
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: pax26?.border }}>
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${limits.messagesPct}%`,
                          background: limits.messagesPct >= 90 ? "#ef4444" : limits.messagesPct >= 70 ? "#f97316" : (pax26?.primary || "#3b82f6")
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-auto pt-2">
                  <button
                    onClick={() => { close(); logoutUser(); }}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl w-full transition-all duration-200 group"
                    style={{ color: '#f87171' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(248,113,113,0.08)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200"
                      style={{ background: 'rgba(248,113,113,0.1)' }}>
                      <LogOut size={15} className="text-red-400 group-hover:scale-110 transition-transform" />
                    </div>
                    <span className="text-sm font-medium">Logout</span>
                  </button>
                </div>

                {/* Bottom padding so last item clears the pinned footer */}
                <div className="h-4 shrink-0" />
              </>
            )}
          </div>

          {/* ── Footer — pinned at bottom of sidebar ──── */}
          <div className="shrink-0 px-4 py-4 flex items-center justify-between"
            style={{ borderTop: `1px solid ${pax26?.border}`, background: pax26?.card }}>
            {userData ? (
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{ background: pax26?.primary + '33', color: pax26?.primary }}>
                  {userData?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold truncate" style={{ color: pax26?.textPrimary }}>
                    {userData?.name || 'User'}
                  </p>
                  <p className="text-xs truncate" style={{ color: pax26?.textSecondary, opacity: 0.6 }}>
                    {userData?.email || ''}
                  </p>
                </div>
              </div>
            ) : (
              <div onClick={() => { close(); router.push('/?auth=login'); }} className="cursor-pointer">
                <Button>Sign up</Button>
              </div>
            )}
            <ThemeToggle />
          </div>

        </div>

        {/* ── Backdrop ──────────────────────────────────── */}
        <div
          onClick={close}
          className="sb-backdrop flex-1"
          style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(2px)' }}
        />
      </nav>
    </>
  );
}