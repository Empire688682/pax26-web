"use client"
import React from 'react';
import { useGlobalContext } from '@/components/Context';
import AiWhatsappConnectInfo from '@/components/AiWhatsappConnectInfo/AiWhatsappConnectInfo';

const page = () => {
    const { pax26 } = useGlobalContext();
  return (
    <div style={{ backgroundColor: pax26.secondaryBg }}>
      <div className="px-6 py-10">
        <AiWhatsappConnectInfo />
      </div>
    </div>
  )
}

export default page
