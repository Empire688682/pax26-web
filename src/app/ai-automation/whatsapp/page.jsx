"use client"
import WhatsAppAutomationPage from '@/component/AiWhatsapp/AiWhatsapp'
import React from 'react';
import { useGlobalContext } from '@/component/Context';

const page = () => {
    const { pax26 } = useGlobalContext();
  return (
    <div style={{ backgroundColor: pax26.secondaryBg }}>
      <div className="p-5">
        <WhatsAppAutomationPage />
      </div>
    </div>
  )
}

export default page
