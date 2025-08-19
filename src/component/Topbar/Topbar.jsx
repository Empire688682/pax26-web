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

const Topbar = () => {
    const { toggleMenu, isModalOpen, openModal, userData, route, pinModal, setPinModal } = useGlobalContext();
    const pathName = usePathname();

    const isHomePage = pathName === '/';
    const isProfile = pathName === '/profile';
    return (
        <div className="bg-gradient-to-r relative from-blue-500 to-green-400 shadow-md w-full sticky px-6 py-4 right-0 top-0 z-10 flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-white">
                <Image src="/Monetrax_logo.png" alt='Monetrax' width={120} height={100}/>
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
                        <div className='flex gap-3'>
                            <button className='cursor-pointer text-white font-semibold' onClick={() => openModal("login")}>Login</button>
                            <button className='cursor-pointer text-white font-semibold' onClick={() => openModal("register")}>Register</button>
                        </div>
                    )
                }
                {
                    userData && isHomePage && (
                        <div className='flex gap-2 items-center cursor-pointer' onClick={() => route.push("/dashboard")}>
                            <p className='text-[13px] font-bold text-white'>{userData.name}</p>
                            <Image src="/profile-img.png" alt="profile" width={30} height={50} className="rounded-full cursor-pointer" />
                        </div>
                    )
                }
                {
                    userData && !isHomePage && !isProfile && (
                        <div className='flex gap-2 items-center cursor-pointer' onClick={() => route.push("/profile")}>
                            <p className='text-[13px] font-bold text-white'>{userData.name}</p>
                            <Image src="/profile-img.png" alt="profile" width={30} height={50} className="rounded-full cursor-pointer" />
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
                        <X size={40} className='text-white absolute top-30 right-[50px] cursor-pointer' onClick={()=>setPinModal(false)} />
                        <div className=' top-30'>
                            <TransactionPin />
                        </div>
                    </div>
                )
            }
        </div>
    )
}

export default Topbar
