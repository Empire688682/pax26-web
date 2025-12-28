"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useGlobalContext } from "@/component/Context";

export default function VerifyAccountPage() {
  const {router, pax26} = useGlobalContext();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleVerifyCode = async (e) => {
    e.preventDefault();

    if (code.length !== 6) {
      setMessage("Please enter the 6-digit code.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");
      const res = await fetch("/api/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({code}),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Invalid verification code.");
        return;
      }

      // success
      router.push("/login");
    } catch (err) {
      setMessage("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const resendVerificationLink = async () => {
    try {
      setLoading(true);
      setMessage("");

      const res = await fetch("/api/auth/send-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Unable to resend link.");
        return;
      }

      setMessage("Verification link sent to your email.");
    } catch (err) {
      setMessage("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6">
        <h1 className="text-2xl font-bold text-center mb-2">
          Verify Your Account
        </h1>

        <p className="text-center text-gray-600 text-sm mb-6">
          Enter the 6-digit code sent to your email or use the verification link.
        </p>

        {/* OTP FORM */}
        <form onSubmit={handleVerifyCode} className="space-y-4">
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            placeholder="Enter 6-digit code"
            className="w-full text-center text-lg tracking-widest px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition disabled:opacity-50"
          >
            {loading ? "Verifying..." : "Verify Code"}
          </button>
        </form>

        {/* MESSAGE */}
        {message && (
          <p className="text-center text-sm text-red-500 mt-4">
            {message}
          </p>
        )}

        {/* DIVIDER */}
        <div className="flex items-center my-6">
          <div className="flex-1 h-px bg-gray-300" />
          <span className="px-3 text-sm text-gray-500">OR</span>
          <div className="flex-1 h-px bg-gray-300" />
        </div>

        {/* RESEND LINK */}
        <button
          onClick={resendVerificationLink}
          disabled={loading}
          className="w-full border border-gray-300 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition disabled:opacity-50"
        >
          Resend Verification Link
        </button>
      </div>
    </div>
  );
}
