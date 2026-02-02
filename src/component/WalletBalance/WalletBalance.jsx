"use client";
import React, { useEffect } from 'react';
import { useGlobalContext } from '../Context';
import { usePathname } from 'next/navigation';
import { PiHandWithdraw } from "react-icons/pi";
import { Copy } from "lucide-react";

const WalletBalance = ({ setShowMore, showMore }) => {
    const { getUserRealTimeData, router, pax26, userWallet, userData } = useGlobalContext();
    const pathName = usePathname();
    const last10Digits = userData?.number ? userData.number.slice(-10) : null;

    useEffect(() => {
        const timeout = setTimeout(() => {
            getUserRealTimeData();
        }, 5000);

        return () => clearTimeout(timeout);
    }, []);

    const handleCopy = () => {
    navigator.clipboard.writeText(last10Digits)
      .then(() => {
        alert("Number copied to clipboard!");
      })
      .catch((err) => {
        console.error("Failed to copy:", err);
      });
  };

    return (
        <div
            style={{ backgroundColor: pax26.bg }}
            className="max-h-[120px] p-4 rounded-lg mb-6 md:mb-0 relative"
        >
            <p className="text-gray-400 text-sm"
                style={{ color: pax26.textPrimary }}>Wallet Balance</p>
            <div className="flex items-center justify-between mt-2 flex-wrap gap-2">
                <p className="text-xl font-bold"
                    style={{ color: pax26.textPrimary }}>₦{userWallet.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "**.**"}</p>
                <div className='flex flex-col gap-2'>
                    <div className='grid gap-3 col-2'>
                        <button className="bg-blue-600 cursor-pointer text-sm text-white px-2 py-1 rounded" onClick={() => router.push("/fund-wallet")}>Fun Wallet +</button>
                        {
                            userData?.number ? (
                                <button title='Account number' className="bg-blue-600 flex gap-3 cursor-pointer text-sm text-white px-2 py-1 rounded" onClick={handleCopy}> Acct <Copy size={16} />{last10Digits}</button>
                            ):(
                                <button title='Account number' className="bg-blue-600 flex gap-3 cursor-pointer text-sm text-white px-2 py-1 rounded"> Acct <Copy size={16} />**********</button>
                            )
                        }
                    </div>
                    {
                        pathName === "/dashboard" && (
                            <p className="cursor-pointer absolute left-0 bottom-[-23px] md:hidden items-center flex text-blue-400 text-xs px-3 py-1"
                                style={{ backgroundColor: pax26.bg }}
                                onClick={() => setShowMore(!showMore)}>
                                <PiHandWithdraw size={20} />
                                {showMore ? "Show Less" : "Show More"} {
                                }</p>
                        )
                    }
                </div>
            </div>
        </div>
    )
}

export default WalletBalance
