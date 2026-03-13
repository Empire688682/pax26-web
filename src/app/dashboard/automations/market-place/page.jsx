
"use client"
import AiMarket from '@/components/AiMarket/AiMarket'
import React from 'react';
import { useGlobalContext } from '@/components/Context';

const page = () => {
  const { pax26 } = useGlobalContext();
  return (
    <div>
      <div className='px-6 py-10'>
        <AiMarket />
      </div>
    </div>
  )
}

export default page
