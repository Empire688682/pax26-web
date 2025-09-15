"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import {
    Menu,
    X,
} from 'lucide-react';
import { useGlobalContext } from '../Context';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import TransactionPin from '../TransactionPin/TransactionPin';

const Header = () => {
    const { toggleMenu, openModal, pax26, userData, route, pinModal, setPinModal } = useGlobalContext();
    const pathName = usePathname();

    const isHomePage = pathName === '/';
    const isProfile = pathName === '/profile';
    return (
        <div 
        className="relative shadow-md w-full sticky px-6 py-4 right-0 top-0 z-10 flex items-center justify-between"
        style={{ backgroundColor: pax26.header }}>
            <Link href="/" className="text-2xl md:text-3xl font-bold text-white">
                <h1
                style={{ color: pax26.textPrimary }}
                >Pax26</h1>
            </Link>
            <div className='md:block hidden'>
                {
                    isHomePage && (
                        <a href='#downloadApp' 
                        style={{ color: pax26.textPrimary }}>
                            Download App
                        </a>
                    )
                }
            </div>
            <div className='flex items-center gap-4'>
                {
                    isHomePage && !userData && (

                        <button 
                        className='cursor-pointer font-semibold'
                         onClick={() => openModal("login")}
                         style={{ color: pax26.textPrimary }}
                         >Signup</button>

                    )
                }
                {
                    userData && !isHomePage && !isProfile && (
                        <div className='relative overflow-hidden w-10 h-10 items-center rounded-full border-2 border-gray-500 cursor-pointer' onClick={() => route.push("/profile")}>
                            <Image src={userData?.profileImage} alt="profile" fill style={{ objectFit: "cover" }} />
                        </div>
                    )
                }
                {
                    !isHomePage && <Menu onClick={toggleMenu} size={30} color={pax26.textPrimary} className='cursor-pointer' />
                }
            </div>
            {
                pinModal && (
                    <div className='w-full h-full bg-white/70 flex items-center justify-center fixed top-0 left-0'>
                        <X size={40} className='text-white absolute top-30 right-[50px] cursor-pointer' onClick={() => setPinModal(false)} />
                        <div className=' top-30'>
                            <TransactionPin />
                        </div>
                    </div>
                )
            }
        </div>
    )
}

export default Header
