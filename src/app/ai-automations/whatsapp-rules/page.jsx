"use client"
import WhatsAppAutomationRulesPage from '@/components/AiWhatsappRules/AiWhatsappRules'
import React from 'react';
import { useGlobalContext } from '@/components/Context';

const page = () => {
    const { pax26 } = useGlobalContext();
  return (
    <div style={{ backgroundColor: pax26.secondaryBg }}>
      <div className="px-6 py-10">
        <WhatsAppAutomationRulesPage />
      </div>
    </div>
  )
}

export default page
