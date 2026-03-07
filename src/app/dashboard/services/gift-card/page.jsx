"use client";
import { useGlobalContext } from '@/components/Context';
import React from 'react'

const Page = () => {
  const {route} = useGlobalContext()
  return (
    <div className='px-6 py-12 min-h-screen bg-gray-100 text-center md:text-start'>
      <h1 className='text-3xl text-blue-500 font-semibold pb-2'>Gift Card</h1>
      <p>You want to?</p>
      <div className='flex flex-col gap-4 mt-5'>
        <div onClick={()=>router.push("/dashboard/gift-card/buy")} className='bg-white cursor-pointer md:max-w-[600px] p-4 rounded-lg shadow-md flex items-center justify-center flex-col'>
        <h2 className='font-bold'>Buy Gift Cards</h2>
        <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Totam facilis doloribus voluptates iusto nobis, dolorum aspernatur officiis adipisci molestias.</p>
      </div>
      <div onClick={()=>router.push("/dashboard/gift-card/sell")} className='bg-white cursor-pointer md:max-w-[600px] p-4 rounded-lg shadow-md flex items-center justify-center flex-col'>
        <h2 className='font-bold'>Sell Gift Cards</h2>
        <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Totam facilis doloribus voluptates iusto nobis, dolorum aspernatur officiis adipisci molestias.</p>
      </div>
      </div>
    </div>
  )
}

export default Page
