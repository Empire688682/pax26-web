"use client";
import { useGlobalContext } from '@/component/Context';
import CTA from '@/component/CTA/CTA';
import DownloadOurApp from '@/component/DownloadOurApp/DownloadOurApp';
import Hero from '@/component/Hero/Hero';
import HowItWorks from '@/component/HowItWork/HowItWork';
import PricingSec from '@/component/PricingSec/PricingSec';
import Services from '@/component/Services/Services';
import SignupPage from '@/component/SignupPage/SignupPage';
import Testimonials from '@/component/Testimonials/Testimonials';
import WhyChooseUs from '@/component/WhyChooseUs/WhyChooseUs';
import React, { useEffect } from 'react';

const Page = () => {
  const {isModalOpen, pax26} = useGlobalContext();
  useEffect(() => {
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      const refCode = searchParams.get("ref");

      if (refCode) {
        const expireIn = Date.now() + 3 * 24 * 60 * 60 * 1000; // 3 days
        localStorage.setItem(
          "ReferralCode",
          JSON.stringify({ refCode, expireIn })
        );
        console.log("Referral Code saved:", refCode); // For debugging
      }
    }
  }, []);

  return (
    <div>
       {
                isModalOpen && (<SignupPage />)
            }
      <Hero />
      <HowItWorks />
      <Services />
      <WhyChooseUs />
      <PricingSec />
      <Testimonials />
      <CTA />
      <DownloadOurApp />
    </div>
  );
};

export default Page;
