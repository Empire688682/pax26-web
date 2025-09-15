"use client";
import React, { useEffect } from 'react';
import { useGlobalContext } from '../Context';
import { Handshake } from 'lucide-react';

const CashBackBalance = () => {
    const { getUserRealTimeData, route, pax26, userCashBack } = useGlobalContext();

    useEffect(() => {
        getUserRealTimeData();
    }, []);

    return (
        <div className="
        max-h-[120px] p-4 rounded-lg shadow-md"
            style={{ backgroundColor: pax26.bg }}
        >
            <p className="text-sm"
                style={{ color: pax26.textPrimary }}>Cash Back</p>
            <div className="flex items-center justify-between mt-2 flex-wrap gap-2">
                <p className="text-xl font-bold"
                    style={{ color: pax26.textPrimary }}>₦{userCashBack.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "**.**"}</p>
                <button className={` ${userCashBack > 0 ? 'bg-blue-600' : 'bg-blue-200'} text-white px-3 py-1 rounded`}
                >{userCashBack > 0 ? "Active" : "Inactive"}</button>
            </div>
        </div>
    )
}

export default CashBackBalance
