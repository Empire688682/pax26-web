"use client";
import React, { useEffect, useState } from 'react';
import { toast,  } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import WalletBalance from '../WalletBalance/WalletBalance';
import AirtimeHelp from '../AirtimeHelp/AirtimeHelp';
import axios from 'axios';

const BettingSub = () => {
  const { setPinModal, getUserRealTimeData, userData, pax26 } = useGlobalContext();
  const [data, setData] = useState({
    platform: "",
    amount: "",
    userId: "",
    pin: "",
  });
  const [loading, setLoading] = useState(false)
  const [bettingPlatform, setBettingPlatform] = useState({});

  useEffect(()=>{
    function fetchBettingPlatforms(){
    axios.get(`${process.env.NEXT_PUBLIC_BETTING_COMPANY_URL}`)
    .then((response)=>{
      const platforms = response.data.data;
        const platformMap = {};
        platforms.forEach((platform) => {
          platformMap[platform.code] = platform.name;
        });
        console.log("platformMap:", platformMap);
        setBettingPlatform(platformMap);
    })
    .catch((error)=>{
      console.log("Error fetching betting platforms:", error);
    })
  };
  fetchBettingPlatforms();
  }, []);

  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  useEffect(()=>{
    const interval = setInterval(()=>{
      if(userData.pin === null){
        setPinModal(true);
      }
    },2000);

    return () => clearInterval(interval);
  }, [userData]);

  const handleFormSubmission = (e) => {
    e.preventDefault();

    // ✅ Validation
    if (!data.platform) return toast.error("Please select a platform");
    if (!data.amount || parseInt(data.amount) < 50) return toast.error("Amount must be at least ₦50");
    if (!/^\d{11}$/.test(data.userId)) return toast.error("Enter a valid 11-digit phone userId");
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
      const response = await axios.post("/api/provider/betting-provider",
        {data}
      );
      if (response.data.success) {
        getUserRealTimeData();
        toast.success(response.data.message);
        setData({
          platform: "",
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
    <div className="min-h-screen py-10 overflow-x-hidden px-6"
      style={{ backgroundColor: pax26.secondaryBg }}>
      
      <div className='grid md:grid-cols-2 grid-cols-1 gap-6 justify-start '>
        <div className='flex flex-col gap-6'>

          <WalletBalance />

          <div className="max-w-2xl backdrop-blur-md shadow-2xl rounded-2xl p-8 border border-blue-100"
            style={{ backgroundColor: pax26.card }}>
            <div className='flex justify-between items-center mb-8'>
              <h1 className="text-2xl font-bold text-center text-blue-700 tracking-tight">
                Betting Funding
              </h1>
            </div>

            <form onSubmit={handleFormSubmission} className="space-y-6">
              {/* Platform */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Select Betting Platform
                </label>
                <select
                  name="platform"
                  onChange={handleChange}
                  value={data.platform}
                  required
                  className="w-full border border-gray-300 rounded-lg px-2 py-2 text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <option disabled value="">-- Choose platform --</option>
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
                  min="100"
                  required
                  placeholder='Enter Amount / Min: 100'
                  className="w-full pl-7 pr-12 border border-gray-300 rounded-lg px-2 py-2 text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  UserId
                </label>
                <input
                  onChange={handleChange}
                  value={data.userId}
                  name="userId"
                  type="tel"
                  placeholder="e.g. 0154358139"
                  required
                  className="w-full border border-gray-300 rounded-lg px-2 py-2 text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
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
                  className="w-full border border-gray-300 rounded-lg px-2 py-2 text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
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

export default BettingSub;

