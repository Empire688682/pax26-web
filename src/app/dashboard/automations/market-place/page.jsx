
"use client"
import AutomationMarket from '@/components/AutomationMarket/AutomationMarket'
import React from 'react';
import { useGlobalContext } from '@/components/Context';

const page = () => {
  const { pax26 } = useGlobalContext();
  return (
    <div>
      <div className='px-6 py-10'>
        <AutomationMarket />
      </div>
    </div>
  )
}

export default page
