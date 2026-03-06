"use client";

import CTA from '@/components/CTA/CTA';
import DownloadOurApp from '@/components/DownloadOurApp/DownloadOurApp';
import Hero from '@/components/Hero/Hero';
import Pricing from '@/components/Pricing/Pricing';
import Services from '@/components/Services/Services';
import SignupPage from '@/components/SignupPage/SignupPage';
import Testimonials from '@/components/Testimonials/Testimonials';
import WhyChooseUs from '@/components/WhyChooseUs/WhyChooseUs';
import React, { useEffect } from 'react';
import { motion } from "framer-motion";
import { useGlobalContext } from '@/components/Context';
import Trusted from '@/components/Trusted/Trusted';
import Problem from '@/components/Problem/Problem';
import AutomationFeatures from '@/components/AutomationFeatures/AutomationFeatures';
import HowItWorks from '@/components/HowItWorks/HowItWorks';
import Demo from '@/components/Demo/Demo';
import Utilities from '@/components/Utilities/Utilities';
import HomeFooter from '@/components/HomeFooter/HomeFooter';

const fadeInUp = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0 },
};

const Page = () => {
  const {openModal} = useGlobalContext();
  useEffect(() => {
     const searchParams = new URLSearchParams(window.location.search);
    if (typeof window !== "undefined") {
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

  useEffect(() => {
     const searchParams = new URLSearchParams(window.location.search);
    const authQuery = searchParams.get("auth");
  if (authQuery === "login") {
    openModal("login");
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
        <Trusted />
      </motion.div>

      {/* Problem */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        variants={fadeInUp}
      >
        <Problem />
      </motion.div>

      {/* AutomationFeatures */}
      <motion.div
        initial={{opacity:0, x:100 }}
        whileInView={{opacity:1, x:0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        variants={fadeInUp}
      >
        <AutomationFeatures />
      </motion.div>

      {/* HowItWorks */}
      <motion.div
        initial={{opacity:0, y:50}}
        whileInView={{opacity:1, y:0}}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        variants={fadeInUp}
      >
        <HowItWorks />
      </motion.div>

      {/* Demo */}
      <motion.div
        initial={{opacity:0, y:50}}
        whileInView={{opacity:1, y:0}}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        variants={fadeInUp}
      >
        <Demo />
      </motion.div>

      {/* Pricing */}
      <motion.div
        initial={{opacity:0, y:50}}
        whileInView={{opacity:1, y:0}}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        variants={fadeInUp}
      >
        <Pricing />
      </motion.div>

      {/* Utilities */}
      <motion.div
        initial={{opacity:0, y:50}}
        whileInView={{opacity:1, y:0}}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6, delay: 0.7 }}
        variants={fadeInUp}
      >
        <Utilities />
      </motion.div>

      {/* Testimonials */}
      <motion.div
        initial={{opacity:0, y:50}}
        whileInView={{opacity:1, y:0}}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6, delay: 0.7 }}
        variants={fadeInUp}
      >
        <Testimonials />
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{opacity:0, y:50}}
        whileInView={{opacity:1, y:0}}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6, delay: 0.7 }}
        variants={fadeInUp}
      >
        <CTA />
      </motion.div>
    </div>
  );
};

export default Page;
