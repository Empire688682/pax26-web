"use client";
import React, { useState } from 'react';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import WalletBalance from '../WalletBalance/WalletBalance';
import AirtimeHelp from '../AirtimeHelp/AirtimeHelp';
import axios from 'axios';
import { useGlobalContext } from '../Context';
import CashBackOption from '../ui/CashBackOption';
import { FaTimes } from 'react-icons/fa';

const BuyAirtime = () => {
  const { setPinModal, getUserRealTimeData, userCashBack } = useGlobalContext();
  const [data, setData] = useState({
    network: "",
    amount: "",
    number: "",
    pin: "",
  });
  const [loading, setLoading] = useState(false)
  const [checked, setChecked] = useState(false)

  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const handleFormSubmission = (e) => {
    e.preventDefault();

    // ✅ Validation
    if (!data.network) return toast.error("Please select a network");
    if (!data.amount || parseInt(data.amount) < 50) return toast.error("Amount must be at least ₦50");
    if (!/^\d{11}$/.test(data.number)) return toast.error("Enter a valid 11-digit phone number");
    if (data.pin.length < 4) return toast.error("PIN must be at least 4 digits");
    if (data.pin === "1234") {
      toast.error("1234 is not allowed");
      setTimeout(() => {
        setPinModal(true)
      }, 2000);
      return null
    }

    buyAirtime();
  };

  const buyAirtime = async () => {
    setLoading(true);
    try {
      const usedCashBack = checked ? true : false;
      const response = await axios.post("/api/provider/airtime-provider",
        { ...data, usedCashBack }
      );
      if (response.data.success) {
        getUserRealTimeData();
        toast.success(response.data.message);
        setData({
          network: "",
          amount: "",
          number: "",
          pin: "",
        });
      }
    } catch (error) {
      toast.error(error.response.data.message);
      console.log(error.response.data.details);
      if (error.response.data.message === "1234 is not allowed") {
        setTimeout(() => {
          setPinModal(true)
        }, 2000)
      }
      if (error.response.data.message === "Pin not activated yet!") {
        setTimeout(() => {
          setPinModal(true)
        }, 2000)
      }
    }
    finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen py-10 overflow-x-hidden">
      <ToastContainer />
      <div className='grid md:grid-cols-2 grid-cols-1 gap-6 justify-start '>
        <div className='flex flex-col gap-6'>

          <WalletBalance />

          <div className="max-w-2xl bg-white/90 backdrop-blur-md shadow-2xl rounded-2xl p-8 border border-blue-100">
            <div className='flex justify-between items-center mb-8'>
              <h1 className="text-2xl font-bold text-center text-blue-700 tracking-tight">
                Buy Airtime
              </h1>
              <CashBackOption
                userCashBack={userCashBack}
                setChecked={setChecked}
                checked={checked}
              />
            </div>

            <form onSubmit={handleFormSubmission} className="space-y-6">
              {/* Network */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Select Network
                </label>
                <select
                  name="network"
                  onChange={handleChange}
                  value={data.network}
                  required
                  className="w-full border border-gray-300 rounded-lg px-2 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <option disabled value="">-- Choose Network --</option>
                  <option value="01">MTN</option>
                  <option value="02">GLO</option>
                  <option value="04">Airtel</option>
                  <option value="03">9Mobile</option>
                </select>
              </div>

              {/* Amount */}
              <div className='relative'>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Enter Amount
                </label>
                <input
                  onChange={handleChange}
                  value={data.amount}
                  type="number"
                  name="amount"
                  min="50"
                  required
                  placeholder='Enter Amount / Min: 50'
                  className="w-full pl-7 pr-12 border border-gray-300 rounded-lg px-2 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                {
                  checked && data.amount && Number(data.amount) >= 50 && (
                    <span className='text-green-500 font-bold absolute right-6 top-8'>
                      {
                        Number(data.amount) < userCashBack && (
                          0
                        )
                      }
                      {
                        Number(data.amount) > userCashBack && (
                           Number(data.amount) - userCashBack 
                        )
                      }
                      {
                        Number(data.amount) === userCashBack && (
                          0
                        )
                      }
                    </span>
                  )
                }
                {
                  checked && data.amount && Number(data.amount) >= 50 && (
                    <span className='text-green-500 font-bold'>
                      - ₦
                      {
                        Number(data.amount) < userCashBack ?
                          `${data.amount}`
                          :
                          `${userCashBack}`
                      }
                    </span>
                  )
                }
                {
                  checked && data.amount && Number(data.amount) >= 50 && (
                    <span className='text-red-500 font-bold absolute left-2 top-9'>
                      <FaTimes />
                    </span>
                  )
                }
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  onChange={handleChange}
                  value={data.number}
                  name="number"
                  type="tel"
                  placeholder="e.g. 09154358139"
                  required
                  className="w-full border border-gray-300 rounded-lg px-2 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              {/* Pin */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Pin
                </label>
                <input
                  name="pin"
                  type="password"
                  onChange={handleChange}
                  value={data.pin}
                  placeholder="Enter Pin"
                  required
                  maxLength={4}
                  className="w-full border border-gray-300 rounded-lg px-2 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              {/* Submit Button */}
              <button
                disabled={loading}
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-lg text-base font-semibold hover:bg-blue-700 transition duration-300"
              >
                {
                  loading ? "Processing...." : "Buy Now"
                }
              </button>
            </form>
          </div>

        </div>

        <AirtimeHelp data={data} />

      </div>
    </div>
  );
};

export default BuyAirtime;
