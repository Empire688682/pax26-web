"use client";
import React from "react";
import { useGlobalContext } from "../Context";

const Survey = () => {
    const {pax26} = useGlobalContext();
  return (
    <div 
    style={{ backgroundColor: pax26.secondaryBg }}
    className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl p-8 md:p-12 text-center">
        {/* Header Section */}
        <h1 className="text-3xl md:text-4xl font-bold mb-3"
        style={{color:pax26.textPrimary}}>
          Pax26 User Experience Survey 🧠
        </h1>
        <p className="text-gray-400 mb-8 max-w-2xl mx-auto leading-relaxed">
          We’d love your feedback to help us improve Pax26.  
          This short survey takes less than 2 minutes.  
          Your voice helps us build a better platform for everyone.
        </p>

        {/* Embedded Google Form */}
        <div className="overflow-hidden rounded-xl shadow-lg border border-white/10">
          <iframe
            src="https://docs.google.com/forms/d/e/1FAIpQLScQIoW12lHz8pC_Ps_9rliuh0j1Tjnny2aLyt46S7wL7NozWg/viewform?embedded=true"
            width="100%"
            height="700"
            frameBorder="0"
            marginHeight="0"
            marginWidth="0"
            className="w-full"
          >
            Loading…
          </iframe>
        </div>

        {/* Footer Note */}
        <p className="text-gray-400 text-sm mt-6">
          Thank you for taking the time to share your thoughts 💙
        </p>
      </div>
    </div>
  );
};

export default Survey;
