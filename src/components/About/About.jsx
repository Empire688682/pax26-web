"use client";
import React from "react";
import { useGlobalContext } from "../Context";

const About = () => {
  const { pax26 } = useGlobalContext();

  return (
    <div
      className="min-h-screen px-6 py-14"
      style={{ backgroundColor: pax26.secondaryBg }}
    >
      <div className="max-w-6xl mx-auto space-y-14">

        {/* Hero */}
        <div className="text-center space-y-4">
          <h1
            className="text-4xl sm:text-5xl font-bold text-blue-600"
          >
            About Pax26
          </h1>

          <p
            className="max-w-3xl mx-auto text-lg"
            style={{ color: pax26.textPrimary }}
          >
            Pax26 is an AI automation platform designed to help businesses
            automate customer interactions, capture leads, and streamline
            digital operations. Alongside intelligent automation, Pax26 also
            provides seamless digital services including airtime, data,
            electricity payments, and more.
          </p>
        </div>

        {/* What We Do */}
        <div
          style={{ backgroundColor: pax26.bg }}
          className="p-8 rounded-xl shadow-lg"
        >
          <h2 className="text-2xl font-semibold text-blue-600 mb-4 text-center">
            What Pax26 Does
          </h2>

          <p
            className="text-center max-w-3xl mx-auto"
            style={{ color: pax26.textPrimary }}
          >
            Pax26 combines artificial intelligence with digital services to
            help individuals and businesses operate smarter. Our AI automation
            tools allow businesses to automatically respond to customers,
            capture leads, and manage conversations on platforms like WhatsApp,
            while our digital services provide quick access to essential
            utilities.
          </p>
        </div>

        {/* Mission & Vision */}
        <div className="grid sm:grid-cols-2 gap-10">

          <div
            style={{ backgroundColor: pax26.bg }}
            className="p-6 rounded-xl shadow"
          >
            <h2 className="text-xl font-semibold text-blue-600 mb-3">
              Our Mission
            </h2>

            <p style={{ color: pax26.textPrimary }}>
              To empower businesses and individuals with intelligent automation
              tools that simplify communication, improve efficiency, and make
              digital services more accessible.
            </p>
          </div>

          <div
            style={{ backgroundColor: pax26.bg }}
            className="p-6 rounded-xl shadow"
          >
            <h2 className="text-xl font-semibold text-blue-600 mb-3">
              Our Vision
            </h2>

            <p style={{ color: pax26.textPrimary }}>
              To become a leading AI automation platform helping businesses
              across Africa and beyond automate operations, engage customers
              smarter, and scale faster.
            </p>
          </div>

        </div>

        {/* Why Pax26 */}
        <div
          style={{ backgroundColor: pax26.bg }}
          className="p-8 rounded-xl shadow-lg"
        >
          <h2 className="text-2xl font-semibold text-blue-600 mb-6 text-center">
            Why Choose Pax26?
          </h2>

          <ul
            className="grid sm:grid-cols-2 gap-4 max-w-3xl mx-auto"
            style={{ color: pax26.textPrimary }}
          >
            <li>✅ AI automation for WhatsApp and business messaging</li>
            <li>✅ Automatic lead capture and smart workflows</li>
            <li>✅ Fast and reliable digital service payments</li>
            <li>✅ Secure wallet for seamless transactions</li>
            <li>✅ Affordable services with cashback opportunities</li>
            <li>✅ Built for businesses and individuals</li>
          </ul>
        </div>

        {/* Founder */}
        <div
          style={{ backgroundColor: pax26.bg }}
          className="p-8 rounded-xl shadow-lg text-center"
        >
          <h2 className="text-2xl font-semibold text-blue-600 mb-6">
            Founder
          </h2>

          <div className="space-y-3">
            <img
              src="/team-1.png"
              alt="Juwon Asehinde - Founder of Pax26"
              className="w-32 h-32 mx-auto rounded-full object-cover"
            />

            <h3
              className="text-lg font-semibold"
              style={{ color: pax26.textPrimary }}
            >
              Juwon Asehinde
            </h3>

            <p className="text-sm text-gray-400">
              Founder & CEO
            </p>

            <p
              className="max-w-xl mx-auto text-sm"
              style={{ color: pax26.textPrimary }}
            >
              Juwon founded Pax26 to build a platform where AI automation and
              digital services come together to simplify business operations and
              everyday transactions.
            </p>
          </div>
        </div>

        {/* Contact */}
        <div className="text-center space-y-2">
          <h3 className="text-xl font-medium text-gray-400">
            Want to reach us?
          </h3>

          <p className="text-gray-400">
            Email us at{" "}
            <span className="text-blue-600 font-semibold">
              info@pax26.com
            </span>
          </p>
        </div>

      </div>
    </div>
  );
};

export default About;