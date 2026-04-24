"use client"
import AiBusinessDashboard from '@/components/AiBusinessDashboard/AiBusinessDashboard'
import React from 'react';
import { useGlobalContext } from '@/components/Context';

const page = () => {
  const { pax26 } = useGlobalContext();
  return (
    <div>
      <div className='px-6 py-10'>
        <AiBusinessDashboard />
      </div>
    </div>
  )
}

export default page
