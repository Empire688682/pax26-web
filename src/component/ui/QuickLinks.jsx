"use client";
import React from 'react'
import { useGlobalContext } from '../Context';

const QuickLinks = ({link, title, icon, status}) => {
    const {router, pax26} = useGlobalContext();
    return (
        <div onClick={() => router.push(link)}
            style={{ backgroundColor: pax26.bg }} className="cursor-pointer p-4 rounded-lg shadow-md flex items-center justify-center flex-col">
            {icon}
            <p className="text-sm font-medium"
                style={{ color: pax26.textPrimary }}>{title}</p>
                <p className="text-sm animate-pulse text-red-500 font-bold text-center">{status}</p>
        </div>
    )
}

export default QuickLinks
