import ApiDocs from '@/component/ApiDocs/ApiDocs'
import React from 'react'
export const metadata = {
  title: "API Documentation - Pax26",
  description: "Explore Pax26 API documentation for integrating airtime, data, electricity, TV subscriptions, gift cards, and more into your applications.",
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
