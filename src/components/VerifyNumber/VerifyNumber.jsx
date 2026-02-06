"use client";

import React, { useState } from "react";
import { useGlobalContext } from "../Context";

const VerifyNumber = () => {
    const {pax26} = useGlobalContext();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState("enterNumber"); // enterNumber | enterOtp
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // 1️⃣ Send OTP
  const handleSendOtp = async () => {
    if (!phoneNumber) {
      return setMessage("Please enter your phone number");
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/auth/initiate-verify-number", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phoneNumber }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Failed to send OTP");
        setLoading(false);
        return;
      }

      setStep("enterOtp");
      setMessage("OTP sent successfully");
    } catch (err) {
      setMessage("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // 2️⃣ Verify OTP
  const handleVerifyOtp = async () => {
    if (!otp) {
      return setMessage("Please enter the OTP");
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/verify-phone/confirm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ otp }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Invalid OTP");
        setLoading(false);
        return;
      }

      setMessage("✅ Phone number added successfully");
    } catch (err) {
      setMessage("Verification failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className='px-6 min-h-[80vh] items-center flex'
    style={{backgroundColor:pax26.secondaryBg}}>
        <div className="max-w-md mx-auto p-6 bg-white rounded-xl shadow">
      <h2 className="text-xl font-semibold mb-4">Add Phone Number</h2>

      {message && (
        <p className="mb-4 text-sm text-center text-gray-700">
          {message}
        </p>
      )}

      {step === "enterNumber" && (
        <>
          <input
            type="tel"
            placeholder="e.g. 2348012345678"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="w-full border rounded-md px-3 py-2 mb-4 focus:outline-none focus:ring"
          />

          <button
            onClick={handleSendOtp}
            disabled={loading}
            className="w-full bg-black text-white py-2 rounded-md hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Sending OTP..." : "Add Number"}
          </button>
        </>
      )}

      {step === "enterOtp" && (
        <>
          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="w-full border rounded-md px-3 py-2 mb-4 focus:outline-none focus:ring"
          />

          <button
            onClick={handleVerifyOtp}
            disabled={loading}
            className="w-full bg-green-600 text-white py-2 rounded-md hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </>
      )}
    </div>
    </section>
  );
};

export default VerifyNumber;
