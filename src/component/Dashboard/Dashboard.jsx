"use client";
import React, { useEffect, useState } from 'react';
import { useGlobalContext } from '../Context';
import { PiHandWithdraw } from "react-icons/pi";
import { Wallet, Phone, Wifi, Zap, Bell, Heart, Copy, Tv, Gift, TrendingDown } from "lucide-react";
import WalletBalance from '../WalletBalance/WalletBalance';
import { FaSpinner } from 'react-icons/fa';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import CashBackBalance from '../CashBackBalance/CashBackBalance';

const Dashboard = () => {
  const { userData, userCommission, getUserRealTimeData, route, transactionHistory, loading } = useGlobalContext();
  const [showMore, setShowMore] = useState(false)
  const referralLink = `${process.env.NEXT_PUBLIC_URL}?ref=${userData.referralCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink)
      .then(() => {
        alert("Referral link copied to clipboard!");
      })
      .catch((err) => {
        console.error("Failed to copy:", err);
      });
  };

  useEffect(() => {
    getUserRealTimeData();
  }, []);

  const fullName = userData?.name || "User";
  const firstName = fullName.split(" ")[0];

  const [withdrawLoading, setWithrawLoading] = useState(false);
  const withdrawCommission = async () => {
    if (!userData._id) {
      toast.error("No Id found")
      return
    }

    setWithrawLoading(true)
    try {
      const response = await axios.post("/api/withdraw-commission");
      if (response.data.success) {
        getUserRealTimeData();
        toast.success("Commission added to wallet balance");
      }
    } catch (error) {
      console.log("WithdrawError:", error);
      toast.error(error.response.data.message);
    }
    finally {
      setWithrawLoading(false);
    };
  };

  return (
    <div className="min-h-screen">
      <ToastContainer />
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-gray-700 font-medium text-lg flex text-sm items center gap-2">
          <Heart /> Welcome back, <span className="font-bold">{firstName}</span>
        </h2>
        <Bell className="text-gray-500 cursor-pointer" onClick={() => route.push("/notifications")} />
      </div>

     {/* big screen */}
      <div className='hidden md:block'>
        <div className=" grid grid-cols-2 sm:grid-cols-3 gap-4">
        <WalletBalance />

        <div className="bg-white max-h-[120px] p-4 rounded-lg shadow-md"
        >
          <p className="text-gray-500 text-sm">Commission</p>
          <div className="flex items-center justify-between mt-2 flex-wrap gap-2">
            {
              withdrawLoading ? <FaSpinner className='text-2xl animate-spin' />
                :
                <p className="text-xl font-bold">₦{userCommission?.toFixed(2) || "**.**"}</p>
            }
            <button onClick={withdrawCommission} className="bg-blue-600 flex gap-2 itmens-center cursor-pointer text-white flex-wrap px-3 py-1 rounded">Withdraw <PiHandWithdraw className='text-[20px]' /></button>
          </div>
        </div>

        <CashBackBalance />

        <div className="bg-white p-4 rounded-lg shadow-md">
          <p className="text-gray-500 text-sm mb-2">Referral Link</p>
          <div className="flex items-center flex-wrap gap-2">
            <input
              value={referralLink}
              readOnly
              className="flex-1 border rounded px-2 py-1 text-sm"
            />
            <button onClick={handleCopy} className="ml-2 cursor-pointer bg-blue-600 text-white px-3 py-1 rounded flex items-center gap-1">
              <Copy size={16} /> Copy
            </button>
          </div>
        </div>
      </div>
      </div>

      {/* small screen */}
      <div className="md:hidden md:block flex flex-col gap-4 mb-6">
        <WalletBalance setShowMore={setShowMore} showMore={showMore} />

        {/* drop down */}
        {
          showMore && (
            <div className='grid grid-cols-2 gap-2'>
          <div className="bg-white max-h-[120px] p-4 rounded-lg shadow-md"
        >
          <p className="text-gray-500 text-sm">Commission Balance</p>
          <div className="flex items-center justify-between mt-2 flex-wrap gap-2">
            {
              withdrawLoading ? <FaSpinner className='text-2xl animate-spin' />
                :
                <p className="text-xl font-bold">₦{userCommission?.toFixed(2) || "**.**"}</p>
            }
            <button onClick={withdrawCommission} className="bg-blue-600 flex gap-2 itmens-center cursor-pointer text-white flex-wrap px-3 py-1 rounded">Withdraw <PiHandWithdraw className='text-[20px]' /></button>
          </div>
        </div>

        <CashBackBalance />
        </div>
          )
        }
        

        <div className="bg-white p-4 rounded-lg shadow-md">
          <p className="text-gray-500 text-sm mb-2">Referral Link</p>
          <div className="flex items-center flex-wrap gap-2">
            <input
              value={referralLink}
              readOnly
              className="flex-1 border rounded px-2 py-1 text-sm"
            />
            <button onClick={handleCopy} className="ml-2 cursor-pointer bg-blue-600 text-white px-3 py-1 rounded flex items-center gap-1">
              <Copy size={16} /> Copy
            </button>
          </div>
        </div>
      </div>

      <h3 className="text-md font-medium mb-2">Quick Links</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div onClick={() => route.push("/fund-wallet")} className="bg-white cursor-pointer p-4 rounded-lg shadow-md flex items-center justify-center flex-col">
          <Wallet className="text-blue-600 mb-2" size={28} />
          <p className="text-sm font-medium">Fund Wallet</p>
        </div>

        <div onClick={() => route.push("/dashboard/buy-airtime")} className="bg-white cursor-pointer p-4 rounded-lg shadow-md flex items-center justify-center flex-col">
          <Phone className="text-blue-600 mb-2" size={28} />
          <p className="text-sm font-medium">Buy Airtime</p>
        </div>

        <div onClick={() => route.push("/dashboard/buy-data")} className="bg-white cursor-pointer p-4 rounded-lg shadow-md flex items-center justify-center flex-col">
          <Wifi className="text-blue-600 mb-2" size={28} />
          <p className="text-sm font-medium">Buy Data</p>
        </div>

        <div onClick={() => route.push("/dashboard/buy-electricity")} className="bg-white cursor-pointer p-4 rounded-lg shadow-md flex items-center justify-center flex-col">
          <Zap className="text-blue-600 mb-2" size={28} />
          <p className="text-sm font-medium">Electricity</p>
        </div>

        <div onClick={() => route.push("/dashboard/buy-tv")} className="bg-white cursor-pointer p-4 rounded-lg shadow-md flex items-center justify-center flex-col">
          <Tv className="text-blue-600 mb-2" size={28} />
          <p className="text-sm font-medium">TV Subscription</p>
        </div>
        <div className="bg-white cursor-pointer p-4 rounded-lg shadow-md flex items-center justify-center flex-col">
          <Gift className="text-blue-600 mb-2" size={28} />
          <p className="text-sm font-medium text-center">Gift Card</p>
          <p className="text-sm animate-pulse font-bold text-center">Comming Soon</p>
        </div>
        <div className="bg-white cursor-pointer p-4 rounded-lg shadow-md flex items-center justify-center flex-col">
          <TrendingDown className="text-blue-600 mb-2" size={28} />
          <p className="text-sm font-medium text-center">Crypto</p>
          <p className="text-sm animate-pulse font-bold text-center">Comming Soon</p>
        </div>
      </div>

      <h3 className="text-md font-medium mb-2 mt-6">Recent Activities</h3>
      <div className="bg-white p-4 rounded-lg shadow-md">
        {
          loading ? "Loading...." :
            <div className="space-y-4">
              {
                transactionHistory.length > 0 ? (
                  <>
                    {[...transactionHistory].reverse().slice(0, 5).map((transaction) => (
                      <div key={transaction._id} className="flex cursor-pointer justify-between items-center">
                        <div>
                          <p className="text-sm text-gray-500">{new Date(transaction.createdAt).toISOString().replace("T", " ").split(".")[0]}</p>
                          <p className="font-medium">{transaction.description}</p>
                        </div>
                        <div className='flex flex-col md:flex-row md:gap-4 justify-center'>
                          <p className={`text-sm ${transaction.status === 'success' ? 'text-green-600' : transaction.status === 'pending' ? 'text-yellow-700' : 'text-red-600'}`}>
                            ₦{transaction.amount}
                          </p>
                          <p className={`text-sm ${transaction.status === 'success' ? 'text-green-600' : transaction.status === 'pending' ? 'text-yellow-700' : 'text-red-600'}`}>
                            {transaction.type}
                          </p>
                          <p className={`text-sm font-semibold
                      ${transaction.status === 'success'
                              ? 'bg-green-100 text-green-700'
                              : transaction.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-red-100 text-red-700'}
                    `}>
                            {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                          </p>
                        </div>
                      </div>
                    ))}

                    {
                      transactionHistory.length > 5 &&
                      <div className="text-center mt-4">
                        <button
                          onClick={() => router.push("/transactions")}
                          className="text-blue-600 hover:underline font-medium text-sm"
                        >
                          See More →
                        </button>
                      </div>
                    }
                  </>
                ) :
                  <p className="text-gray-500 text-sm">No transaction history found.</p>
              }
            </div>
        }
      </div>

    </div>
  );
};

export default Dashboard;
