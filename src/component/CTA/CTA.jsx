"use client"
import React from "react";
import { useGlobalContext } from "../Context";

export default function CTA() {
  const {openModal} = useGlobalContext()
    return (
      <section className="py-20 bg-blue-600 text-white text-center">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Start Saving on Data & Bills Today
          </h2>
          <p className="text-blue-100 mb-8 text-lg">
            Join thousands of Nigerians already enjoying affordable data, airtime, and utility payments on Monetrax.
          </p>
  
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <div
              onClick={()=>openModal("register")}
              className="bg-white text-blue-600 cursor-pointer font-semibold px-6 py-3 rounded-lg hover:bg-gray-100 transition"
            >
              Create Account
            </div>
            <a
              href="#"
              className="border border-white px-6 py-3 rounded-lg hover:bg-white hover:text-blue-600 transition"
            >
              Learn More
            </a>
          </div>
        </div>
      </section>
    );
  }
  