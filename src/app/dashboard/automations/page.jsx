"use client"
import AiAutomationLandingPage from '@/components/AiAutomationLandingPage/AiAutomationLandingPage'
import React from 'react';
import { useGlobalContext } from '@/components/Context';

const page = () => {
  const { pax26 } = useGlobalContext();
  return (
    <div className='px-6 py-10'>
      <AiAutomationLandingPage />
    </div>
  )
}

export default page

