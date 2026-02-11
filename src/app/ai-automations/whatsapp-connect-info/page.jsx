"use client"
import React from 'react';
import { useGlobalContext } from '@/components/Context';
import AiWhatsappConnectInfo from '@/components/AiWhatsappConnectInfo/AiWhatsappConnectInfo';

const page = () => {
    const { pax26 } = useGlobalContext();
  return (
    <div style={{ backgroundColor: pax26.secondaryBg }}>
      <div className="p-5">
        <AiWhatsappConnectInfo />
      </div>
    </div>
  )
}

export default page
