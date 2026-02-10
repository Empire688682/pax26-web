"use client"
import NewAutomationPage from '@/components/NewAutomationPage/NewAutomationPage'
import React from 'react';
import { useGlobalContext } from '@/components/Context';

const page = () => {
  const { pax26 } = useGlobalContext();
  return (
    <div style={{ backgroundColor: pax26.secondaryBg }}>
      <div className='p-5'>
        <NewAutomationPage />
      </div>
    </div>
  )
}

export default page
