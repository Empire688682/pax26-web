"use client";
import React, { useEffect } from 'react';
import { useGlobalContext } from '../Context';
import { usePathname } from 'next/navigation';
import { ArrowBigDown } from 'lucide-react';

const WalletBalance = ({setShowMore, showMore}) => {
    const {getUserRealTimeData, route, userWallet} = useGlobalContext();
    const pathName = usePathname();

    useEffect(() => {
        getUserRealTimeData();
    }, []);

    return (
        <div className="bg-white max-h-[120px] p-4 rounded-lg shadow-md"
        >
            <p className="text-gray-500 text-sm">Wallet Balance</p>
            <div className="flex items-center justify-between mt-2 flex-wrap gap-2">
                <p className="text-xl font-bold">₦{userWallet.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "**.**"}</p>
                <div className='flex flex-col gap-2'>
                    <button className="bg-blue-600 cursor-pointer text-white px-3 py-1 rounded" onClick={()=>route.push("/fund-wallet")}>Fun Wallet +</button>
                    {
                        pathName === "/dashboard" && (
                            <p className="cursor-pointer md:hidden items-center flex text-gray-400 font-bold text-sm px-3 py-1" onClick={()=>setShowMore(!showMore)}>{showMore? "Show Less":"Show More"} <ArrowBigDown/></p>
                        )
                    }
                </div>
            </div>
        </div>
    )
}

export default WalletBalance
