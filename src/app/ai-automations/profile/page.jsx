"use client"
import AiBusinessProfile from '@/components/AiBusinessProfile/AiBusinessProfile'
import React from 'react';
import { useGlobalContext } from '@/components/Context';

const page = () => {
  const { pax26 } = useGlobalContext();
  return (
    <div style={{ backgroundColor: pax26.secondaryBg }}>
      <div className='px-6 py-10'>
        <AiBusinessProfile />
      </div>
    </div>
  )
}

export default page
