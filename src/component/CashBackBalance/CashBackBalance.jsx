"use client";
import React, { useEffect } from 'react';
import { useGlobalContext } from '../Context';
import { Handshake } from 'lucide-react';

const CashBackBalance = () => {
    const {getUserRealTimeData, route, userCashBack} = useGlobalContext();

    useEffect(() => {
        getUserRealTimeData();
    }, []);

    return (
        <div className="bg-white max-h-[120px] p-4 rounded-lg shadow-md"
        >
            <p className="text-gray-500 text-sm">Cash Back</p>
            <div className="flex items-center justify-between mt-2 flex-wrap gap-2">
                <p className="text-xl font-bold">₦{userCashBack.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "**.**"}</p>
                <button className={` ${ userCashBack > 0? 'bg-blue-600': 'bg-blue-200'} text-white px-3 py-1 rounded`}>{userCashBack > 0 ? "Active" : "Inactive"}</button>
            </div>
        </div>
    )
}

export default CashBackBalance
