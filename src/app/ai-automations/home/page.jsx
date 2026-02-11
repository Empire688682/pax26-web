"use client"
import AiAutomationHomePage from '@/components/AiAutomationHomePage/AiAutomationHomePage'
import React from 'react';
import { useGlobalContext } from '@/components/Context';

const page = () => {
  const { pax26 } = useGlobalContext();
  return (
    <div className='px-6 py-10'
      style={{ backgroundColor: pax26.secondaryBg }}>
      <AiAutomationHomePage />
    </div>
  )
}

export default page



