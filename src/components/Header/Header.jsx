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
        <div
            className={`shadow-md w-full sticky px-6 py-4 right-0 top-0 z-10 flex items-center justify-between`}
            style={{ backgroundColor: pax26.header }}>

            <Link href={userData ? "/dashboard" : "/"} className="text-2xl md:text-3xl font-bold text-white">
                <h1 style={{ color: pax26.textPrimary }}>Pax26</h1>
            </Link>

            <div className='flex items-center gap-4'>
                {
                    !userData && (
                        <button
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

                {
                    userData && !isHomePage && (
                        <div className='relative overflow-hidden w-10 h-10 items-center rounded-full border-2 border-gray-500 cursor-pointer' onClick={() => router.push("/profile")}>
                            <Image src={userData?.profileImage} alt="profile" fill style={{ objectFit: "cover" }} />
                        </div>
                    )
                }

                <Menu onClick={toggleMenu} size={28} color={pax26.textPrimary} className='cursor-pointer hover:opacity-80 transition-opacity' />
            </div>
        </div>
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

