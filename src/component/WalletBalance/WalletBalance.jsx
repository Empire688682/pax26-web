"use client";
import React, { useEffect } from 'react';
import { useGlobalContext } from '../Context';

const WalletBalance = () => {
    const {getUserRealTimeData, route, userWallet} = useGlobalContext();

    useEffect(() => {
        getUserRealTimeData();
    }, []);

    return (
        <div className="bg-white max-h-[100px] p-4 rounded-lg shadow-md"
        >
            <p className="text-gray-500 text-sm">Wallet Balance</p>
            <div className="flex items-center justify-between mt-2">
                <p className="text-xl font-bold">₦{userWallet.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "**.**"}</p>
                <button className="bg-blue-600 cursor-pointer text-white px-3 py-1 rounded" onClick={()=>route.push("/fund-wallet")}>Fund +</button>
            </div>
        </div>
    )
}

export default WalletBalance
