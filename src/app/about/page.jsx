import About from '@/components/About/About'
import React from 'react'
export const metadata = {
  title: "About Us - Pax26",
  description: "Learn more about Pax26...",
  alternates: {
    canonical: "https://pax26.com/about",
  },
};

const page = () => {
  return (
    <div>
    <About />
    </div>
  )
}

export default page
