"use client";
import React, { useState } from "react";
import { toast,  } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import WalletBalance from "../WalletBalance/WalletBalance";
import GiftcardHelp from "../GiftcardHelp/GiftcardHelp";
import axios from "axios";

const Giftcard = () => {
  const [form, setForm] = useState({
    cardType: "",
    amount: "",
    pin: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.cardType || !form.amount || form.pin.length < 4) {
      return toast.error("Please complete the form with valid data.");
    }

    try {
      setLoading(true);
      const res = await axios.post("/api/provider/giftcard", form);

      if (res.data.success) {
        toast.success("Giftcard submitted successfully!");
        setForm({ cardType: "", amount: "", pin: "" });
      } else {
        toast.error(res.data.message || "Something went wrong");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-10">
      
      <div className="grid md:grid-cols-2 grid-cols-1 gap-6 justify-start">
        <div className="flex flex-col gap-6">
          <WalletBalance />
          <div className="max-w-2xl bg-white/90 backdrop-blur-md shadow-2xl rounded-2xl p-8 border border-blue-100">
            <h1 className="text-2xl font-bold text-center text-blue-700 mb-8 tracking-tight">
              Submit Giftcard
            </h1>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Giftcard Type</label>
                <select
                  name="cardType"
                  onChange={handleChange}
                  value={form.cardType}
                  required
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <option disabled value="">-- Select Giftcard --</option>
                  <option value="amazon">Amazon</option>
                  <option value="itunes">iTunes</option>
                  <option value="google">Google Play</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Amount (₦)</label>
                <input
                  name="amount"
                  type="number"
                  onChange={handleChange}
                  value={form.amount}
                  placeholder="Enter amount"
                  required
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">PIN / Code</label>
                <input
                  name="pin"
                  type="text"
                  maxLength={16}
                  onChange={handleChange}
                  value={form.pin}
                  placeholder="Enter code"
                  required
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-xl text-lg font-semibold hover:bg-blue-700 transition duration-300"
              >
                {loading ? "Submitting..." : "Submit Giftcard"}
              </button>
            </form>
          </div>
        </div>

        <GiftcardHelp data={form} />
      </div>
    </div>
  );
};

export default Giftcard;
