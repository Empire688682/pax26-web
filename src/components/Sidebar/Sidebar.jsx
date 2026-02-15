'use client';

import Link from 'next/link';
import {
  Wifi,
  DollarSign,
  LayoutDashboard,
  FileCode,
  Wallet,
  Phone,
  Newspaper,
  LogOut,
  Info
} from 'lucide-react';
import { useGlobalContext } from '../Context';
import { Button } from '../ui/Button';
import ThemeToggle from '../ThemeToogle/ThemeToogle';

export default function Sidebar() {
  const { isOpen, setIsOpen, logoutUser, pax26, userData, router } = useGlobalContext();

  if (!userData) {
    return (<nav
      className={`fixed flex top-0 right-0 w-full shadow-md bg-black/50 z-50 transform transition-transform duration-400 ease-in-out
      ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
    >
      <div className='w-[50%] h-screen p-4'
        style={{ backgroundColor: pax26.publicBg }}>
        <div className='flex justify-between gap-3'>
          <Link onClick={() => setIsOpen(false)} href="/" className="text-2xl font-bold text-blue-600">
            <h1>Pax26</h1>
          </Link>
          <div onClick={() => {setIsOpen(false); router.push("/?auth=login")}} className="text-sm font-bold text-white">
            <Button>
              Sign-up
            </Button>
          </div>
        </div>
        <div className="flex flex-col gap-6 pt-6">
          <Link onClick={() => setIsOpen(false)} href="/about" className="flex items-center gap-2 hover:text-blue-600"
            style={{ color: pax26.textSecondary }}>
            <Info size={18} className="hidden md:block" />
            About
          </Link>
          <Link onClick={() => setIsOpen(false)} href="terms" className="flex items-center gap-2 hover:text-blue-600"
            style={{ color: pax26.textSecondary }}>
            <FileCode size={18} className="hidden md:block" />
            Terms & Conditions
          </Link>
          <Link onClick={() => setIsOpen(false)} href="/fund-wallet" className="flex items-center gap-2 hover:text-blue-600"
            style={{ color: pax26.textSecondary }}>
            <Wallet size={18} className="hidden md:block" />
            Fund Wallet
          </Link>
          <Link onClick={() => setIsOpen(false)} href="/contact" className="flex items-center gap-2 hover:text-blue-600"
            style={{ color: pax26.textSecondary }}>
            <Phone size={18} className="hidden md:block" />
            Contact
          </Link>
          <Link onClick={() => setIsOpen(false)} href="/survey" className="flex items-center gap-2 hover:text-blue-600"
            style={{ color: pax26.textSecondary }}>
            <Info size={18} className="hidden md:block" />
            Your Feedback
          </Link>
          <div className="flex items-center gap-2 hover:text-blue-600 gap-5"
          onClick={() => setIsOpen(false)}>
            <p 
            style={{ color: pax26.textSecondary }}>Theme</p>
            <ThemeToggle />
          </div>
        </div>
      </div>
      <div onClick={() => setIsOpen(false)} className='w-[50%] h-screen'>
      </div>
    </nav>)
  }

  return (
    <nav
      className={`fixed flex top-0 right-0 w-full shadow-md bg-black/50 z-50 transform transition-transform duration-400 ease-in-out
      ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
    >
      <div className='w-[50%] h-screen pl-6 pt-4'
        style={{ backgroundColor: pax26.publicBg }}>
        <Link onClick={() => setIsOpen(false)} href="/dashboard" className="text-2xl font-bold text-blue-600">
          <h1>Pax26</h1>
        </Link>
        <div className="flex flex-col gap-6 pt-6">
          <Link onClick={() => setIsOpen(false)} href="/dashboard" className="flex items-center gap-2 hover:text-blue-600"
            style={{ color: pax26.textSecondary }}>
            <LayoutDashboard size={18} className="hidden md:block" />
            Dashboard
          </Link>
          <Link onClick={() => setIsOpen(false)} href="/dashboard/buy-data" className="flex items-center gap-2 hover:text-blue-600"
            style={{ color: pax26.textSecondary }}>
            <Wifi size={18} className="hidden md:block" />
            Buy Data
          </Link>
          <Link onClick={() => setIsOpen(false)} href="/profile" className="flex items-center gap-2 hover:text-blue-600"
            style={{ color: pax26.textSecondary }}>
            <DollarSign size={18} className="hidden md:block" />
            Profile
          </Link>
          <Link onClick={() => setIsOpen(false)} href="terms" className="flex items-center gap-2 hover:text-blue-600"
            style={{ color: pax26.textSecondary }}>
            <FileCode size={18} className="hidden md:block" />
            Terms & Conditions
          </Link>
          <Link onClick={() => setIsOpen(false)} href="/fund-wallet" className="flex items-center gap-2 hover:text-blue-600"
            style={{ color: pax26.textSecondary }}>
            <Wallet size={18} className="hidden md:block" />
            Fund Wallet
          </Link>
          <Link onClick={() => setIsOpen(false)} href="/contact" className="flex items-center gap-2 hover:text-blue-600"
            style={{ color: pax26.textSecondary }}>
            <Phone size={18} className="hidden md:block" />
            Contact
          </Link>
          <Link onClick={() => setIsOpen(false)} href="/about" className="flex items-center gap-2 hover:text-blue-600"
            style={{ color: pax26.textSecondary }}>
            <Info size={18} className="hidden md:block" />
            About
          </Link>
          <Link onClick={() => setIsOpen(false)} href="/survey" className="flex items-center gap-2 hover:text-blue-600"
            style={{ color: pax26.textSecondary }}>
            <Info size={18} className="hidden md:block" />
            Your Feedback
          </Link>
          <div onClick={logoutUser} className="flex items-center cursor-pointer gap-2 hover:text-blue-600"
            style={{ color: pax26.textSecondary }}>
            <LogOut size={18} />
            Logout
          </div>
          <div className="flex items-center gap-2 hover:text-blue-600 gap-5"
          onClick={() => setIsOpen(false)}>
            <p 
            style={{ color: pax26.textSecondary }}>Theme</p>
            <ThemeToggle />
          </div>
        </div>
      </div>
      <div className='w-[50%] h-screen'>
      </div>
    </nav>
  );
}
