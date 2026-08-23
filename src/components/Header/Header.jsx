"use client";
import React from 'react';
import Link from 'next/link';
import {
    Menu,
} from 'lucide-react';
import { useGlobalContext } from '../Context';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import TransactionPin from '../TransactionPin/TransactionPin';

const Header = () => {
    const { toggleMenu, openModal, pax26, userData, router, pinModal } = useGlobalContext();
    const pathName = usePathname();

    const isHomePage = pathName === '/';
    const isProfile = pathName === '/profile';

    const handleLoginClick = () => {
        if (openModal) {
            openModal("login");
        }
        if (isHomePage) {
            // Already on homepage, openModal handles modal state
        } else {
            router.push("/?auth=login");
        }
    };
    
    return (
        <>
        <header
            role="banner"
            aria-label="Main Navigation Bar"
            className={`shadow-md w-full sticky right-0 top-0 z-10 flex items-center justify-between`}
            style={{ 
              backgroundColor: pax26.header,
              padding: "clamp(12px,3vw,16px) clamp(14px,4vw,24px)",
            }}>

            <Link href={userData ? "/dashboard" : "/"} aria-label="Pax26 Home" className="text-xl md:text-2xl font-bold text-white flex-shrink-0">
                <span className="text-xl md:text-2xl font-bold" style={{ color: pax26.textPrimary }}>Pax26</span>
            </Link>

            <nav role="navigation" aria-label="Header Actions" className='flex items-center gap-4'>
                {
                    !userData && (
                        <button
                            aria-label="Sign in to your account"
                            className='cursor-pointer font-semibold px-4 py-1.5 rounded-xl text-sm transition-all duration-200 hover:opacity-90'
                            onClick={handleLoginClick}
                            style={{
                                color: pax26.primary || '#3b82f6',
                                background: `${pax26.primary || '#3b82f6'}15`,
                                border: `1px solid ${pax26.primary || '#3b82f6'}35`
                            }}
                        >
                            Sign in
                        </button>
                    )
                }


                <button aria-label="Toggle navigation menu" onClick={toggleMenu} className="p-1 rounded-lg hover:opacity-80 transition-opacity">
                    <Menu size={28} color={pax26.textPrimary} />
                </button>
            </nav>
        </header>
        {
            pinModal && (
                <div className='w-full h-full bg-black/80 flex items-center justify-center fixed top-0 left-0 z-[100]'>
                    <TransactionPin />
                </div>
            )
        }
        </>
    )
}

export default Header;

