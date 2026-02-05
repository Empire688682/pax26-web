"use client";
import AISettingsPage from '@/component/AiSettings/AiSettings'
import { useGlobalContext } from '@/component/Context';
import React from 'react'

const page = () => {
    const { pax26 } = useGlobalContext();
    return (
        <div style={{ backgroundColor: pax26.secondaryBg }}>
            <div className='p-6'>
                < AISettingsPage />
            </div>
        </div>
    )
}

export default page
