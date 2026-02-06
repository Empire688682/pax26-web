import Contact from '@/components/Contact/Contact';
import React from 'react';
export const metadata = {
   title: "Contact - Pax26",
  description: "Get in touch with Pax26 for inquiries, support, or partnership opportunities.",
  alternates: {
    canonical: "https://pax26.com/about",
  },
};

const Page = () => {
  return (
    <div>
      <Contact />
    </div>
  );
};

export default Page;
