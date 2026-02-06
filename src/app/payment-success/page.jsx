"use client";
import LoadingSpinner from '@/components/LoadingSpinner/LoadingSpinner';
import PaymentSuccess from '@/components/PaymentSuccess/PaymentSuccess'
import React from 'react'
import { Suspense } from 'react';

const page = () => {
  return (
    <div className='flex items-center justify-center h-[90vh]'>
        <Suspense fallback={<div><LoadingSpinner /></div>}>
        <PaymentSuccess />
        </Suspense>
    </div>
  )
}

export default page
