"use client";
import React, { useEffect, useState } from 'react';
import { toast, } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import WalletBalance from '../WalletBalance/WalletBalance';
import AirtimeHelp from '../AirtimeHelp/AirtimeHelp';
import { FaSpinner } from "react-icons/fa";
import axios from 'axios';
import { useGlobalContext } from '../Context';

const BettingSub = () => {
  const { setPinModal, getUserRealTimeData, userData, pax26 } = useGlobalContext();
  const [data, setData] = useState({
    platform: "",
    amount: "",
    customerId: "",
    pin: "",
  });
  const [loading, setLoading] = useState(false);
  const [bettingPlatform, setBettingPlatform] = useState([]);
  const [customerVerified, setCustomerVerified] = useState(false);
  const [verifyingId, setVerifyingId] = useState(false);
  const [customerName, setcustomerName] = useState("");

  useEffect(() => {
    function fetchBettingPlatforms() {
      axios.get(`${process.env.NEXT_PUBLIC_BETTING_COMPANY_URL}`)
        .then((response) => {
          const platforms = response.data.BETTING_COMPANY;
          setBettingPlatform(platforms);
        })
        .catch((error) => {
          console.log("Error fetching betting platforms:", error);
        })
    };
    fetchBettingPlatforms();
  }, []);

  useEffect(() => {
    if(!data.platform || data.customerId.length < 5 ){
      return;
    };
    async function checkUserVerification() {
      setVerifyingId(true);
      try {
        const response = await axios.post(`/api/verify-betting-user`, data );
        if (response.data.success && response.data.data.status === 200) {
          setcustomerName(response.data.data.customer_name);
          setCustomerVerified(true);
          return;
        }
        setcustomerName(response.data.data.customer_name);
        setCustomerVerified(false);

      } catch (error) {
        console.log("Error verifying customer:", error);
      }
      finally {
        setVerifyingId(false);
      }
    };
    checkUserVerification();
  }, [data.customerId, data.platform]);

  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  async function fundBetting() {
    if(!customerVerified) return toast.error("CustomerId not verified");
    if(!data.platform || !data.amount || !data.customerId || !data.pin) {
      toast.error("All fields are required");
      return;
    }
    if(data.pin === "1234") {
      toast.error("1234 is not allowed");
    }
    try {

      const response = await axios.post("/api/provider/betting-provider", { data });
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
      console.log("Error funding betting wallet:", error);
      toast.error(error.response.data.message);
      if (error.response.data.message === "1234 is not allowed") {
        setTimeout(() => {
          setPinModal(true)
        }, 2000)
      }
    }
    finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const interval = setInterval(() => {
      if (userData.pin === null) {
        setPinModal(true);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [userData]);

  const handleFormSubmission = (e) => {
    e.preventDefault();

    if (data.pin === "1234") {
      toast.error("1234 is not allowed");
      setTimeout(() => {
        setPinModal(true)
      }, 2000);
      return null
    }

    fundBetting();
  };


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
                  className="w-full border capitalize border-gray-300 rounded-lg px-2 py-2 text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <option disabled value="">-- Choose platform --</option>
                  {
                    bettingPlatform?.map((platform, i) => (
                      <option key={i} value={platform.PRODUCT_CODE}>{platform?.PRODUCT_CODE}</option>
                    ))
                  }
                </select>
              </div>

              {/* CustomerId */}
              <div className='relative'>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Customer Id
                </label>
                <input
                  onChange={handleChange}
                  value={data.customerId}
                  name="customerId"
                  type="tel"
                  placeholder="e.g. 0154358139"
                  required
                  className="w-full border border-gray-300 rounded-lg px-2 py-2 text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />

                {
                  verifyingId && <span className="absolute right-[10px] top-[40px]">
                    <FaSpinner className="animate-spin text-blue-600 text-2xl" />
                  </span>
                }
                {
                    <p className={`text-xs pt-2 font-bold ${customerVerified ? 'text-green-500':'text-red-500'}`}>{customerName}</p>
                }
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

