"use client";
import React, { useEffect, useState } from 'react';
import { useGlobalContext } from '../Context';
import { PiHandWithdraw } from "react-icons/pi";
import { Wallet, Phone, Wifi, Zap, Bell, Heart, Copy, Tv, Gift, TrendingDown, Pin, BetweenVerticalEndIcon } from "lucide-react";
import WalletBalance from '../WalletBalance/WalletBalance';
import { FaSpinner } from 'react-icons/fa';
import { toast, } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import CashBackBalance from '../CashBackBalance/CashBackBalance';
import PasswordReset from '../PasswordReset/PasswordReset';
import QuickLinks from '../ui/QuickLinks';

const Dashboard = () => {
  const {
    userData,
    pax26,
    userCommission,
    getUserRealTimeData,
    router,
    transactionHistory,
    loading,
  } = useGlobalContext();
  const [showMore, setShowMore] = useState(false);
  const [isPasswordSet, setIsPasswordSet] = useState(true);
  const referralLink = `${process.env.NEXT_PUBLIC_URL}?ref=${userData?.referralCode}`;

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

  useEffect(() => {
    const interval = setInterval(() => {
      setIsPasswordSet(!!userData?.isPasswordSet);
    }, 5000);

    return () => clearInterval(interval);
  }, [userData]);
  useEffect(() => {
    const interval = setInterval(() => {
      setIsPasswordSet(!!userData?.isPasswordSet);
    }, 5000);

    return () => clearInterval(interval);
  }, [userData]);


  return (
    <div className="min-h-screen">
      {
        !isPasswordSet && (
          <div className=" fixed top-0 left-0 w-full h-screen px-6 flex items-center justify-center bg-black/95 z-10 p-4 shadow-md">
            <PasswordReset />
          </div>
        )
      }

      <div className="flex justify-between items-center mb-4">
        <h2 className="font-medium text-lg flex text-sm items center gap-2"
          style={{ color: pax26.textPrimary }}>
          <Heart /> Welcome back, <span className="font-bold">{firstName}</span>
        </h2>
        <Bell className="text-gray-400 cursor-pointer" onClick={() => router.push("/notifications")} />
      </div>

      {/* big screen */}
      <div className='hidden md:block'>
        <div className=" grid grid-cols-2 sm:grid-cols-3 gap-4">
          <WalletBalance />

          <div
            style={{ backgroundColor: pax26.bg }} className="max-h-[120px] p-4 rounded-lg shadow-md"
          >
            <p className="text-sm"
              style={{ color: pax26.textPrimary }}>Commission</p>
            <div className="flex items-center justify-between mt-2 flex-wrap gap-2">
              {
                withdrawLoading ? <FaSpinner style={{ color: pax26.textPrimary }} className='text-2xl animate-spin' />
                  :
                  <p className="text-xl font-bold"
                    style={{ color: pax26.textPrimary }}>₦{userCommission?.toFixed(2) || "**.**"}</p>
              }
              <button onClick={withdrawCommission} className="bg-blue-600 flex gap-2 itmens-center cursor-pointer text-white flex-wrap px-3 py-1 rounded">Withdraw <PiHandWithdraw className='text-[20px]' /></button>
            </div>
          </div>

          <CashBackBalance />

          <div
            style={{ backgroundColor: pax26.bg }} className="p-4 rounded-lg shadow-md">
            <p className="text-gray-400 text-sm mb-2"
              style={{ color: pax26.textPrimary }}>Referral Link</p>
            <div className="flex items-center flex-wrap gap-2">
              <input
                value={referralLink}
                readOnly
                className="flex-1 border rounded px-2 py-1 text-sm"
                style={{ color: pax26.textPrimary }}
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
              <div
                style={{ backgroundColor: pax26.bg }} className="max-h-[120px] p-4 rounded-lg shadow-md"
              >
                <p className="text-sm"
                  style={{ color: pax26.textPrimary }}>Commission</p>
                <div className="flex items-center justify-between mt-2 flex-wrap gap-2">
                  {
                    withdrawLoading ? <FaSpinner style={{ color: pax26.textPrimary }} className='text-2xl animate-spin' />
                      :
                      <p className="text-xl font-bold"
                        style={{ color: pax26.textPrimary }}>₦{userCommission?.toFixed(2) || "**.**"}</p>
                  }
                  <button onClick={withdrawCommission} className="bg-blue-600 flex gap-2 itmens-center cursor-pointer text-white flex-wrap px-3 py-1 rounded">Withdraw <PiHandWithdraw className='text-[20px]' /></button>
                </div>
              </div>

              <CashBackBalance />
            </div>
          )
        }


        <div
          style={{ backgroundColor: pax26.bg }} className="p-4 rounded-lg shadow-md">
          <p className="text-sm mb-2"
            style={{ color: pax26.textPrimary }}>Referral Link</p>
          <div className="flex items-center flex-wrap gap-2">
            <input
              value={referralLink}
              readOnly
              className="flex-1 border rounded px-2 py-1 text-sm"
              style={{ color: pax26.textPrimary }}
            />
            <button onClick={handleCopy} className="ml-2 cursor-pointer bg-blue-600 text-white px-3 py-1 rounded flex items-center gap-1">
              <Copy size={16} /> Copy
            </button>
          </div>
        </div>
      </div>

      <h3 className="text-md font-medium mb-2"
        style={{ color: pax26.textPrimary }}>Quick Links</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">

        <QuickLinks title="Fund Wallet" link="/fund-wallet" status="" icon={<Wallet
          style={{ color: pax26.textPrimary }} className="mb-2" size={28} />} />

        <QuickLinks title="Buy Airtime" link="/dashboard/buy-airtime" status="" icon={<Phone
          style={{ color: pax26.textPrimary }} className="mb-2" size={28} />} />

        <QuickLinks title="Buy Data" link="/dashboard/buy-data" status="" icon={<Wifi
          style={{ color: pax26.textPrimary }} className="mb-2" size={28} />} />

        <QuickLinks title="Electricity" link="/dashboard/buy-electricity" status="" icon={<Zap
          style={{ color: pax26.textPrimary }} className="mb-2" size={28} />} />

        <QuickLinks title="TV Subscription" link="/dashboard/buy-tv" status="" icon={<Tv
          style={{ color: pax26.textPrimary }} className="mb-2" size={28} />} />

        <QuickLinks title="Gift Card" link="/dashboard" status="Comming Soon" icon={<Gift
          style={{ color: pax26.textPrimary }} className="mb-2" size={28} />} />

        <QuickLinks title="Crypto" link="/dashboard" status="Comming Soon" icon={<TrendingDown
          style={{ color: pax26.textPrimary }} className="mb-2" size={28} />} />

        <QuickLinks title="Gamb Pin" link="/dashboard" status="Comming Soon" icon={<Pin
          style={{ color: pax26.textPrimary }} className="mb-2" size={28} />} />

        <QuickLinks title="Betting" link="/dashboard" status="Comming Soon" icon={<BetweenVerticalEndIcon
          style={{ color: pax26.textPrimary }} className="mb-2" size={28} />} />

        <QuickLinks title="Weac Pin" link="/dashboard" status="Comming Soon" icon={<Pin
          style={{ color: pax26.textPrimary }} className="mb-2" size={28} />} />
      </div>

      <h3 className="text-md font-medium mb-2 mt-6"
        style={{ color: pax26.textPrimary }}>Recent Activities</h3>
      <div
        style={{ backgroundColor: pax26.bg }} className="p-4 rounded-lg shadow-md">
        {
          loading ? <p style={{ color: pax26.textPrimary }}>
            Loading....
          </p> :
            <div className="space-y-4">
              {
                transactionHistory.length > 0 ? (
                  <>
                    {[...transactionHistory].reverse().slice(0, 5).map((transaction) => (
                      <div key={transaction._id}
                        onClick={() => router.push(`transaction-receipt/?id=${transaction._id}`)}
                        className="flex cursor-pointer justify-between items-center">
                        <div>
                          <p className="text-sm text-gray-400">{new Date(transaction.createdAt).toISOString().replace("T", " ").split(".")[0]}</p>
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
                          style={{ color: pax26.textPrimary }} className="hover:underline font-medium text-sm"
                        >
                          See More →
                        </button>
                      </div>
                    }
                  </>
                ) :
                  <p className="text-sm"
                    style={{ color: pax26.textPrimary }}>No transaction history found.</p>
              }
            </div>
        }
      </div>

    </div>
  );
};

export default Dashboard;
