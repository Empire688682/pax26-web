"use client";

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
import { motion } from "framer-motion";

const fadeInUp = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0 },
};

const Page = () => {

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
    <div className='overflow-hidden'>
      <SignupPage />

      {/* Hero Section */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6 }}
        variants={fadeInUp}
      >
        <Hero />
      </motion.div>

      {/* How it Works */}
      <motion.div
        initial={{opacity:0, x:-100 }}
        whileInView={{opacity:1, x:0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        variants={fadeInUp}
      >
        <HowItWorks />
      </motion.div>

      {/* Services */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        variants={fadeInUp}
      >
        <Services />
      </motion.div>

      {/* Why Choose Us */}
      <motion.div
        initial={{opacity:0, x:100 }}
        whileInView={{opacity:1, x:0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        variants={fadeInUp}
      >
        <WhyChooseUs />
      </motion.div>

      {/* Pricing */}
      <motion.div
        initial={{opacity:0, y:50}}
        whileInView={{opacity:1, y:0}}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        variants={fadeInUp}
      >
        <PricingSec />
      </motion.div>

      {/* Testimonials */}
      <motion.div
        initial={{opacity:0, y:50}}
        whileInView={{opacity:1, y:0}}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        variants={fadeInUp}
      >
        <Testimonials />
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{opacity:0, y:50}}
        whileInView={{opacity:1, y:0}}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        variants={fadeInUp}
      >
        <CTA />
      </motion.div>

      {/* Download App */}
      <motion.div
        initial={{opacity:0, y:50}}
        whileInView={{opacity:1, y:0}}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6, delay: 0.7 }}
        variants={fadeInUp}
      >
        <DownloadOurApp />
      </motion.div>
    </div>
  );
};

export default Page;
