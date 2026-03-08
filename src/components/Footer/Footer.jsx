"use client"
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import SocialIcons from '../SocialIcons/SocialIcons';
import { useGlobalContext } from '../Context';
import { ArrowUpToLine } from 'lucide-react';
import { usePathname } from 'next/navigation';

const Footer = () => {

  const { pax26 } = useGlobalContext();

  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');
  const [showBackToTop, setShowBackToTop] = useState(false);

  const pathName = usePathname();

  useEffect(() => {

    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowBackToTop(true)
      } else {
        setShowBackToTop(false)
      }
    }

    window.addEventListener("scroll", handleScroll)

    return () => window.removeEventListener("scroll", handleScroll)

  }, [])

  const backTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }


  const handleSubscribe = async (e) => {

    e.preventDefault()

    setStatus("loading")

    try {

      const res = await axios.post("/api/newsletter", { email })

      setStatus("success")
      setMessage(res.data.message)
      setEmail("")

    } catch (error) {

      setStatus("error")

      setMessage(
        error.response?.data?.message || "Something went wrong. Please try again."
      )

    }

  }

  if (pathName === "/reset-password" || pathName === "/automations/pax") {
    return null
  }

  return (
    <footer className="z-50 bg-gray-900 text-gray-400">

      {/* BACK TO TOP */}

      {
        showBackToTop &&
        <div
          style={{ backgroundColor: pax26.border }}
          onClick={backTop}
          className="p-3 rounded-full left-3 fixed border border-white bottom-6 flex items-center cursor-pointer"
        >
          <ArrowUpToLine size={25} color={pax26.toTopColor} />
        </div>
      }

      <div className="max-w-7xl mx-auto px-4 py-14 sm:px-6 lg:px-8">

        {/* GRID */}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">

          {/* COMPANY */}

          <div className="text-center md:text-start">

            <h3 className="text-white font-bold text-lg mb-4">
              Pax26
            </h3>

            <p className="text-white/80 text-sm leading-relaxed mb-4">
              Pax26 helps businesses automate WhatsApp conversations with
              AI-powered chatbots, smart follow-ups and customer engagement
              tools — while also providing fast digital services like
              airtime, data and bill payments.
            </p>

            <p className="text-white/60 text-xs">
              AI Automation + Digital Services Platform
            </p>

          </div>


          {/* AI AUTOMATION */}

          <div className="text-center md:text-start">

            <h3 className="text-white font-bold text-lg mb-4">
              AI Automation
            </h3>

            <ul className="space-y-2">

              <li>
                <a href="/automations"
                  className="text-white hover:text-blue-200 transition">
                  WhatsApp Automation
                </a>
              </li>

              <li>
                <a href="/automations"
                  className="text-white hover:text-blue-200 transition">
                  AI Business Chatbot
                </a>
              </li>

              <li>
                <a href="/automations"
                  className="text-white hover:text-blue-200 transition">
                  Automated Follow-ups
                </a>
              </li>

              <li>
                <a href="/automations"
                  className="text-white hover:text-blue-200 transition">
                  Lead Qualification
                </a>
              </li>

            </ul>

          </div>


          {/* DIGITAL SERVICES */}

          <div className="text-center md:text-start">

            <h3 className="text-white font-bold text-lg mb-4">
              Digital Services
            </h3>

            <ul className="space-y-2">

              <li>
                <a href="/dashboard/buy-data"
                  className="text-white hover:text-blue-200 transition">
                  Buy Data
                </a>
              </li>

              <li>
                <a href="/dashboard"
                  className="text-white hover:text-blue-200 transition">
                  Airtime Recharge
                </a>
              </li>

              <li>
                <a href="/dashboard"
                  className="text-white hover:text-blue-200 transition">
                  Electricity Bills
                </a>
              </li>

              <li>
                <a href="/dashboard"
                  className="text-white hover:text-blue-200 transition">
                  TV Subscription
                </a>
              </li>

              <li>
                <a href="/dashboard"
                  className="text-white hover:text-blue-200 transition">
                  Gift Cards
                </a>
              </li>

            </ul>

          </div>


          {/* NEWSLETTER */}

          <div className="text-center md:text-start">

            <h3 className="text-white font-bold text-lg mb-4">
              Stay Updated
            </h3>

            <p className="text-white/80 mb-4 text-sm">
              Get updates about new AI automation tools,
              product features and special offers.
            </p>

            <form
              onSubmit={handleSubscribe}
              className="flex flex-col sm:flex-row gap-2"
            >

              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email"
                className="px-4 py-2 border-white text-white border outline-none rounded-md w-full bg-transparent"
              />

              <button
                type="submit"
                disabled={status === "loading"}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-md transition"
              >

                {status === "loading" ? "Subscribing..." : "Subscribe"}

              </button>

            </form>

            {
              status !== "idle" && (
                <p className={`mt-2 text-sm ${status === "success"
                  ? "text-green-200"
                  : "text-red-200"
                  }`}>
                  {message}
                </p>
              )
            }

          </div>

        </div>


        {/* SOCIAL MEDIA */}

        <div
          className="mt-12 flex justify-center pb-4 rounded-md space-x-6"
          style={{ backgroundColor: pax26.border }}
        >

          <SocialIcons />

        </div>


        {/* COPYRIGHT */}

        <div className="mt-8 border-t border-white/20 pt-8">

          <p className="text-center text-white/80 text-sm">
            © {new Date().getFullYear()} Pax26. All rights reserved.
          </p>

        </div>

      </div>
    </footer>
  )

}

export default Footer