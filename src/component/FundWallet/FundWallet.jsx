"use client";
import React, { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useGlobalContext } from "../Context";

const FundWallet = () => {
  const { userData } = useGlobalContext();
  const [form, setForm] = useState({ amount: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const amount = parseInt(form.amount);

    if (!form.amount || isNaN(amount) || amount < 100) {
      return toast.error("Enter a valid amount (min ₦100)");
    }

    setLoading(true);
    toast.info("Initializing payment...");

    try {
      const res = await fetch("/api/initiate-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          amount,
          email: userData.email,
          name: userData.name
        })
      });

      const response = await res.json();

      console.log("response:", response)

      if (response.success && response.link) {
        toast.success("Redirecting to Flutterwave...");
        window.location.href = response.link;
      } else {
        console.log(response?.data);
        toast.error(response?.data?.message || "Payment failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen px-4 py-10 bg-gradient-to-br from-blue-50 to-white">
      <ToastContainer />
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 grid-cols-1 gap-10 items-center">
        <form
          onSubmit={handleSubmit}
          className="bg-white/90 backdrop-blur-md p-8 rounded-2xl shadow-[rgba(0,_0,_0,_0.1)_0px_10px_20px] border border-blue-100 flex flex-col gap-6"
        >
          <h3 className="text-xl font-semibold text-blue-600 mb-2">Top-Up Form</h3>

          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
              Amount (₦)
            </label>
            <input
              type="number"
              name="amount"
              id="amount"
              value={form.amount}
              onChange={handleChange}
              min="100"
              placeholder="Minimum ₦100"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg text-base font-semibold hover:bg-blue-700 transition duration-300 shadow-md disabled:opacity-50"
          >
            {loading ? "Processing..." : "Proceed to Payment"}
          </button>
        </form>

        <div className="bg-white/70 backdrop-blur-md p-8 rounded-2xl shadow-[rgba(0,_0,_0,_0.1)_0px_10px_20px] border border-blue-100 flex flex-col gap-6">
          <h2 className="text-3xl font-bold text-blue-700 mb-2">Fund Your Wallet</h2>
          <p className="text-gray-700 leading-relaxed text-sm">
            Easily top-up your Monetrax wallet using Flutterwave. Your wallet allows you to buy airtime, data, electricity, and more — all in one place.
          </p>
          <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500 text-sm text-blue-800">
            🔐 All transactions are secured using end-to-end encryption.
          </div>
          <div className="text-sm text-gray-600 mt-4">
            Need help? Reach out to {" "}
            <a href="mailto:support@Monetrax.com" className="text-blue-600 underline font-medium">
              support@Monetrax.com
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FundWallet;
