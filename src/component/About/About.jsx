"use client";
import React from "react";

const About = () => {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 px-4 py-10 sm:px-10">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Hero Section */}
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-blue-600 mb-4">About Monetrax</h1>
          <p className="text-gray-600 text-lg">
            Monetrax is a trusted digital platform helping users buy airtime, data, electricity, and more—seamlessly and securely.
          </p>
        </div>

        {/* Mission & Vision */}
        <div className="grid sm:grid-cols-2 gap-10">
          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-xl font-semibold text-blue-600 mb-2">Our Mission</h2>
            <p className="text-gray-700">
              To empower Nigerians with simple, fast, and reliable digital services for everyday utility purchases.
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-xl font-semibold text-blue-600 mb-2">Our Vision</h2>
            <p className="text-gray-700">
              To become the leading one-stop digital service provider in Africa, delivering convenience with every tap.
            </p>
          </div>
        </div>

        {/* Why Choose Us */}
        <div className="bg-white p-6 rounded-xl shadow text-center">
          <h2 className="text-2xl font-semibold text-blue-600 mb-4">Why Choose Monetrax?</h2>
          <ul className="space-y-2 text-gray-700 text-left max-w-md mx-auto">
            <li>✅ Instant airtime & data delivery</li>
            <li>✅ Reliable electricity token generation</li>
            <li>✅ Affordable prices with cashback commissions</li>
            <li>✅ Secure wallet for easy transactions</li>
            <li>✅ Excellent user support</li>
          </ul>
        </div>

        {/* Our Team */}
        <div className="bg-white p-6 rounded-xl shadow text-center">
          <h2 className="text-2xl font-semibold text-blue-600 mb-4">Meet the Team</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8">
            <div className="space-y-2">
              <img
                src="/team-1.png"
                alt="Founder"
                className="w-32 h-32 mx-auto rounded-full object-cover"
              />
              <h3 className="text-lg font-semibold">Juwon Asehinde</h3>
              <p className="text-sm text-gray-500">Founder & CEO</p>
            </div>
            <div className="space-y-2">
              <img
                src="/team-2.png"
                alt="CTO"
                className="w-32 h-32 mx-auto rounded-full object-cover"
              />
              <h3 className="text-lg font-semibold">Jane Smith</h3>
              <p className="text-sm text-gray-500">Co-Founder & CTO</p>
            </div>
            <div className="space-y-2">
              <img
                src="/team-3.png"
                alt="Support"
                className="w-32 h-32 mx-auto rounded-full object-cover"
              />
              <h3 className="text-lg font-semibold">Tobi Ojo</h3>
              <p className="text-sm text-gray-500">Customer Success</p>
            </div>
          </div>
        </div>

        {/* Contact CTA */}
        <div className="text-center">
          <h3 className="text-xl text-gray-800 font-medium mb-2">Want to reach us?</h3>
          <p className="text-gray-600">
            Email us at <span className="text-blue-600 font-semibold">support@Monetrax.com</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;
