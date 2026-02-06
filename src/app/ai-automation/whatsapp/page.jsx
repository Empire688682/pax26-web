"use client"
import AiWhatsAppConnectionPage from '@/components/AiWhatsappRules/AiWhatsappRules'
import React from 'react';
import { useGlobalContext } from '@/components/Context';

const page = () => {
    const { pax26 } = useGlobalContext();
  return (
    <div style={{ backgroundColor: pax26.secondaryBg }}>
      <div className="p-5">
        <AiWhatsAppConnectionPage />
      </div>
    </div>
  )
}

export default page

