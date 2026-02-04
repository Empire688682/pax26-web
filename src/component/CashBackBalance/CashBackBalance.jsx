"use client";
import React, { useEffect } from 'react';
import { useGlobalContext } from '../Context';
import { Handshake } from 'lucide-react';

const CashBackBalance = () => {
    const { getUserRealTimeData, pax26, userCashBack } = useGlobalContext();

    useEffect(() => {
        getUserRealTimeData();
    }, []);

    return (
        <div className="p-y rounded-lg flex flex-wrap justify-between shadow-md"
            style={{ backgroundColor: pax26.bg }}
        >
            <div>
                <p className="text-sm"
                    style={{ color: pax26.textPrimary }}>Cash Back</p>
                <div className="items-center mt-2 gap-2">
                    <p className="text-xl font-bold"
                        style={{ color: pax26.textPrimary }}>₦{userCashBack.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "**.**"}</p>
                    <span className='text-xs text-gray-600'>Useable earnings</span>
                </div>
            </div>
            <button className={` text-white px-3`}
                >{userCashBack > 0 ? "Low" : "High"}</button>
        </div>
    )
}

export default CashBackBalance
