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
import SignupPage from '../SignupPage/SignupPage';
import TransactionPin from '../TransactionPin/TransactionPin';

const Header = () => {
    const { toggleMenu, isModalOpen, openModal, userData, route, pinModal, setPinModal } = useGlobalContext();
    const pathName = usePathname();

    const isHomePage = pathName === '/';
    const isProfile = pathName === '/profile';
    return (
        <div className="bg-gradient-to-r relative from-blue-500 to-green-400 shadow-md w-full sticky px-6 py-4 right-0 top-0 z-10 flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-white">
                <Image src="/Pax26_log.png" alt='Pax26' width={90} height={90} />
            </Link>
            <div className='md:block hidden'>
                {
                    isHomePage && (
                        <a href='#downloadApp' className='text-white'>
                            Download App
                        </a>
                    )
                }
            </div>
            <div className='flex items-center gap-4'>
                {
                    isHomePage && !userData && (

                        <button className='cursor-pointer text-white font-semibold' onClick={() => openModal("login")}>Signup</button>

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
                    !isHomePage && <Menu onClick={toggleMenu} size={30} className='cursor-pointer text-white' />
                }
            </div>
            {
                isModalOpen && (<SignupPage />)
            }
            {
                pinModal && (
                    <div className='w-full h-full bg-black/70 flex items-center justify-center fixed top-0 left-0'>
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
