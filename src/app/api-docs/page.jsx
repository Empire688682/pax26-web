import ApiDocs from '@/components/ApiDocs/ApiDocs'
import React from 'react'
export const metadata = {
  title: "API Documentation – Pax26 WhatsApp Commerce",
  description: "Pax26 developer API documentation for integrating WhatsApp automation, storefront management, AI conversations, and sales analytics into your applications.",
  alternates: {
    canonical: "https://pax26.com/api-docs",
  },
};

const Page = () => {
  return (
    <div className='py-12 px-6'>
      <ApiDocs />
    </div>
  )
}

export default Page
