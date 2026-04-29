'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Wifi, DollarSign, LayoutDashboard, FileCode, Wallet,
  Phone, LogOut, Info, History, Settings, Bell, X,
  ChevronRight, Zap, Tv, Database, Lightbulb, Gift,
  ChevronDown, Home, Shield, Users,
} from 'lucide-react';
import { useGlobalContext } from '../Context';
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
`;

/* ── VTU services config ──────────────────────────────────────── */
const VTU_SERVICES = [
  { href: "/dashboard/services/buy-airtime", icon: Phone, label: "Airtime", color: "#f97316" },
  { href: "/dashboard/services/buy-data", icon: Database, label: "Data", color: "#38bdf8" },
  { href: "/dashboard/services/buy-tv", icon: Tv, label: "TV Sub", color: "#a78bfa" },
  { href: "/dashboard/services/buy-electricity", icon: Lightbulb, label: "Electricity", color: "#fbbf24" },
  { href: "/dashboard#VTU", icon: Gift, label: "Gift Cards", color: "#f472b6" },
];

/* ── Plain nav item ───────────────────────────────────────────── */
const NavItem = ({ href, icon: Icon, label, onClick, danger = false, pax26 }) => (
  <Link
    href={href || '#'}
    onClick={onClick}
    className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group"
    style={{ color: danger ? '#f87171' : pax26?.textSecondary }}
    onMouseEnter={e => {
      e.currentTarget.style.background = pax26?.secondaryBg;
      e.currentTarget.style.color = danger ? '#f87171' : pax26?.primary;
    }}
    onMouseLeave={e => {
      e.currentTarget.style.background = 'transparent';
      e.currentTarget.style.color = danger ? '#f87171' : pax26?.textSecondary;
    }}
  >
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-200"
        style={{ background: pax26?.secondaryBg }}>
        <Icon size={15} />
      </div>
      <span className="text-sm font-medium">{label}</span>
    </div>
    <ChevronRight size={13} className="opacity-0 group-hover:opacity-40 transition-opacity" />
  </Link>
);

/* ── VTU nav item with expandable submenu ─────────────────────── */
const VtuNavItem = ({ pax26, onClose }) => {
  const [open, setOpen] = useState(false);
  const primary = pax26?.primary;

  return (
    <div>
      {/* trigger row */}
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl w-full transition-all duration-200"
        style={{
          color: open ? primary : pax26?.textSecondary,
          background: open ? `${primary}08` : 'transparent'
        }}
        onMouseEnter={e => {
          if (!open) { e.currentTarget.style.background = pax26?.secondaryBg; e.currentTarget.style.color = primary; }
        }}
        onMouseLeave={e => {
          if (!open) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = pax26?.textSecondary; }
        }}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: open ? `${primary}18` : pax26?.secondaryBg, color: open ? primary : 'inherit' }}>
            <DollarSign size={15} />
          </div>
          <span className="text-sm font-medium">VTU Services</span>
        </div>
        <ChevronDown size={13}
          style={{
            color: pax26?.textSecondary,
            opacity: 0.5,
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease',
          }}
        />
      </button>

      {/* submenu */}
      {open && (
        <div className="sb-submenu-open ml-4 mt-1 pl-3 space-y-0.5"
          style={{ borderLeft: `2px solid ${primary}25` }}>
          {VTU_SERVICES.map(({ href, icon: Icon, label, color }) => (
            <Link
              key={label}
              href={href}
              onClick={onClose}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group"
              style={{ color: pax26?.textSecondary }}
              onMouseEnter={e => {
                e.currentTarget.style.background = `${color}0D`;
                e.currentTarget.style.color = color;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = pax26?.textSecondary;
              }}
            >
              <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: `${color}15`, color }}>
                <Icon size={13} />
              </div>
              <span className="text-sm font-medium">{label}</span>
              <ChevronRight size={11} className="ml-auto opacity-0 group-hover:opacity-40 transition-opacity" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

/* ── Section label ────────────────────────────────────────────── */
const SectionLabel = ({ label, pax26 }) => (
  <p className="text-xs font-semibold uppercase tracking-widest px-3 mb-1 mt-2"
    style={{ color: pax26?.textSecondary, opacity: 0.4 }}>
    {label}
  </p>
);

/* ── Divider ──────────────────────────────────────────────────── */
const Divider = ({ pax26 }) => (
  <div className="my-3 mx-3" style={{ height: '1px', background: pax26?.border }} />
);

/* ── Main Sidebar ─────────────────────────────────────────────── */
export default function Sidebar() {
  const { isOpen, setIsOpen, logoutUser, pax26, userData, router } = useGlobalContext();
  const close = () => setIsOpen(false);

  return (
    <>
      <style>{CSS}</style>
      <nav
        className={`fixed h-screen flex top-0 right-0 w-full z-80 transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* ── Panel ─────────────────────────────────────── */}
        <div
          className="w-[78%] max-w-[300px] h-screen flex flex-col overflow-hidden"
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
              </>
            ) : (
              /* Authenticated menu */
              <>
                <SectionLabel label="Overview" pax26={pax26} />
                <NavItem href="/dashboard" icon={LayoutDashboard} label="Dashboard" onClick={close} pax26={pax26} />
                <NavItem href="/dashboard/automations" icon={Wifi} label="Agent Automation" onClick={close} pax26={pax26} />
                <NavItem href="/dashboard/automations/whatsapp#connect" icon={Wifi} label="Connect Whatsapp" onClick={close} pax26={pax26} />
                <NavItem href="/dashboard/automations/market-place" icon={Zap} label="Automations Home" onClick={close} pax26={pax26} />
                <NavItem href="/dashboard/automations/ai-business-dashboard" icon={Zap} label="Train Agent" onClick={close} pax26={pax26} />
                <NavItem href="/dashboard/automations/whatsapp-contacts" icon={Users} label="Contacts" onClick={close} pax26={pax26} />

                <Divider pax26={pax26} />
                <SectionLabel label="Finance" pax26={pax26} />
                <NavItem href="/fund-wallet" icon={Wallet} label="Fund Wallet" onClick={close} pax26={pax26} />
                <NavItem href="/transactions" icon={History} label="Transactions" onClick={close} pax26={pax26} />

                {/* VTU with submenu */}
                <VtuNavItem pax26={pax26} onClose={close} />

                <Divider pax26={pax26} />
                <SectionLabel label="Account" pax26={pax26} />
                <NavItem href="/profile" icon={Settings} label="Profile & Settings" onClick={close} pax26={pax26} />
                <NavItem href="/notifications" icon={Bell} label="Notifications" onClick={close} pax26={pax26} />
                <NavItem href="/contact" icon={Phone} label="Contact Support" onClick={close} pax26={pax26} />
                <NavItem href="/about" icon={Info} label="About" onClick={close} pax26={pax26} />
                <NavItem href="/terms" icon={Shield} label="Terms & Conditions" onClick={close} pax26={pax26} />
                <NavItem href="/privacy" icon={Shield} label="Privacy Policy" onClick={close} pax26={pax26} />
                <NavItem href="/survey" icon={Info} label="Your Feedback" onClick={close} pax26={pax26} />

                <Divider pax26={pax26} />
                <button
                  onClick={() => { close(); logoutUser(); }}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl w-full transition-all duration-200"
                  style={{ color: '#f87171' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(248,113,113,0.08)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: 'rgba(248,113,113,0.1)' }}>
                    <LogOut size={15} className="text-red-400" />
                  </div>
                  <span className="text-sm font-medium">Logout</span>
                </button>
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
          className="flex-1 h-screen"
          style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(2px)' }}
        />
      </nav>
    </>
  );
}