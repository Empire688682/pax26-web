"use client";
import React, { useEffect, useState } from "react";
import { useGlobalContext } from "../Context";
import { Bell, Heart, ArrowRight, Wallet, TrendingUp, Link2, PiHandWithdraw } from "lucide-react";
import WalletBalance from "../WalletBalance/WalletBalance";
import { FaSpinner } from 'react-icons/fa';
import CashBackBalance from "../CashBackBalance/CashBackBalance";
import QuickLinks from "../ui/QuickLinks";

const Dashboard = () => {
  const {
    userData,
    pax26,
    getUserRealTimeData,
    router,
    transactionHistory,
    loading,
    userCommission
  } = useGlobalContext();

  const [showMore, setShowMore] = useState(false);
  const [withdrawLoading, setWithrawLoading] = useState(false);
  const referralLink = `${process.env.NEXT_PUBLIC_URL}?ref=${userData?.referralCode}`;

  useEffect(() => {
    getUserRealTimeData();
  }, []);

  const copyText = async (link) => {
    if (!userData?.number) return;
    await navigator.clipboard.writeText(link);
    alert(`Referral link copied to clipboard!`);
  };

 

  const withdrawCommission = async () => {
    if (!userData?._id) {
      alert("No Id found")
      return
    }

    setWithrawLoading(true)
    try {
      const response = await axios.post("/api/withdraw-commission");
      if (response.data.success) {
        getUserRealTimeData();
        alert("Commission added to wallet balance");
      }
    } catch (error) {
      console.log("WithdrawError:", error);
      alert(error.response.data.message);
    }
    finally {
      setWithrawLoading(false);
    };
  };

  useEffect(() => {
    const timeOut = setTimeout(() => {
      if (!userData?.number) {
        router.push("/verify-number");
      };
    }, 200);

    return () => clearTimeout(timeOut);
  }, [userData, router])

  return (
    <div className="min-h-screen space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-pink-500/20">
            <Heart className="text-pink-400" size={18} />
          </div>
          <p className="text-sm font-medium" style={{ color: pax26.textPrimary }}>
            Welcome back, <span className="font-bold">{firstName}</span>
          </p>
        </div>
        <button onClick={() => router.push("/notifications")}>
          <Bell className="text-gray-400 hover:text-gray-200 transition" />
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <WalletBalance setShowMore={setShowMore} showMore={showMore} />

        {/* Commission */}
        <div
          style={{ backgroundColor: pax26.bg }}
          className="relative hidden overflow-hidden md:flex flex-col gap-4 rounded-2xl p-5 shadow-xl"
        >
          <div className="absolute -top-10 -right-10 h-32 w-32 bg-blue-500/20 blur-2xl rounded-full" />

          <div className="flex flex-wrap justify-between">
            <div>
              <p className="text-sm" style={{ color: pax26.textPrimary }}>Commission</p>
              <p className="mt-2 text-2xl font-bold" style={{ color: pax26.textPrimary }}>
                ₦{userCommission?.toFixed?.(2) || "0.00"}
              </p>
              <p className="text-xs text-gray-400 mt-1">Withdrawable earnings</p>
            </div>
            <div>
              {
                withdrawLoading && <FaSpinner style={{ color: pax26.textPrimary }} className='text-2xl animate-spin' />
              }
              <button onClick={withdrawCommission} className="bg-blue-600 flex gap-2 text-sm itmens-center cursor-pointer text-white flex-wrap px-3 py-1 rounded">Withdraw</button>
            </div>
          </div>

          <CashBackBalance />

        </div>

        {/* Show more section Mobile */}
        {
          showMore && <div
            style={{ backgroundColor: pax26.bg }}
            className="relative overflow-hidden flex flex-col gap-4 rounded-2xl p-5 shadow-xl"
          >
            <div className="absolute -top-10 -right-10 h-32 w-32 bg-blue-500/20 blur-2xl rounded-full" />

            <div className="flex flex-wrap justify-between">
              <div>
                <p className="text-sm" style={{ color: pax26.textPrimary }}>Commission</p>
                <p className="mt-2 text-2xl font-bold" style={{ color: pax26.textPrimary }}>
                  ₦{userCommission?.toFixed?.(2) || "0.00"}
                </p>
                <p className="text-xs text-gray-400 mt-1">Withdrawable earnings</p>
              </div>
              <div>
                {
                  withdrawLoading && <FaSpinner style={{ color: pax26.textPrimary }} className='text-2xl animate-spin' />
                }
                <button onClick={withdrawCommission} className="bg-blue-600 flex gap-2 text-sm itmens-center cursor-pointer text-white flex-wrap px-3 py-1 rounded">Withdraw</button>
              </div>
            </div>

            <CashBackBalance />

          </div>
        }

        {/* Activity */}
        <div
          style={{ backgroundColor: pax26.bg }}
          className="relative overflow-hidden rounded-2xl p-5 shadow-xl"
        >
          <div className="absolute -top-10 -right-10 h-32 w-32 bg-green-500/20 blur-2xl rounded-full" />
          <p className="text-sm" style={{ color: pax26.textPrimary }}>Activity</p>
          <div className="mt-4 flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold" style={{ color: pax26.textPrimary }}>
                {transactionHistory?.length || 0}
              </p>
              <p className="text-xs text-gray-400">Total transactions</p>
            </div>
            <TrendingUp className="text-green-400" size={28} />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold" style={{ color: pax26.textPrimary }}>
            Quick Actions
          </h3>
          <button
            onClick={() => setShowMore(!showMore)}
            className="text-xs text-blue-400"
          >
            {showMore ? "Less" : "More"}
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <QuickLinks title="Fund Wallet" link="/fund-wallet" icon={<Wallet size={26} style={{color:pax26?.textPrimary}} />} />
          <QuickLinks title="Transfer" link="/dashboard/transfer" icon={<ArrowRight size={26} style={{color:pax26?.textPrimary}}/>} />
          <QuickLinks title="Buy Airtime" link="/dashboard/buy-airtime" />
          <QuickLinks title="Buy Data" link="/dashboard/buy-data" />
          {showMore && (
            <>
              <QuickLinks title="Electricity" link="/dashboard/buy-electricity" />
              <QuickLinks title="TV" link="/dashboard/buy-tv" />
              <QuickLinks title="AI Auto" link="/ai" status="Inactive" />
              <QuickLinks title="Betting" link="/dashboard/betting" status="Inactive" />
            </>
          )}
        </div>
      </div>

      {/* Referral Link */}
      <div
        style={{ backgroundColor: pax26.bg }}
        className="p-4 rounded-2xl shadow-md"
      >
        <p className="text-sm text-gray-400 mb-2">Referral Link</p>
        <div className="flex items-center gap-2 bg-gray-900 rounded-xl px-3 py-2">
          <Link2 size={16} className="text-blue-400" />
          <p className="text-xs truncate flex-1 text-gray-300">{referralLink}</p>
          <button
            onClick={() => copyText(referralLink)}
            className="text-blue-400 text-xs"
          >
            Copy
          </button>
        </div>
      </div>

      {/* Recent Transactions */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold" style={{ color: pax26.textPrimary }}>
            Recent Activity
          </h3>
          <button
            onClick={() => router.push("/transactions")}
            className="text-xs text-blue-400 flex items-center gap-1"
          >
            View all <ArrowRight size={14} />
          </button>
        </div>

        <div
          style={{ backgroundColor: pax26.bg }}
          className="rounded-2xl p-4 shadow-md"
        >
          {loading ? (
            <p className="text-sm" style={{ color: pax26.textPrimary }}>Loading...</p>
          ) : transactionHistory?.length ? (
            <div className="space-y-3">
              {[...transactionHistory]
                .reverse()
                .slice(0, 5)
                .map((tx) => (
                  <div
                    key={tx._id}
                    onClick={() => router.push(`/transaction-receipt/?id=${tx._id}`)}
                    className="flex items-center justify-between cursor-pointer rounded-xl p-3 hover:bg-white/5 transition"
                  >
                    <div>
                      <p className="text-xs text-gray-400">
                        {new Date(tx.createdAt).toLocaleString()}
                      </p>
                      <p className="text-sm font-medium" style={{ color: pax26.textPrimary }}>
                        {tx.description}
                      </p>
                      <span className="text-[11px] text-blue-400 capitalize">
                        {tx.type}
                      </span>
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-sm font-semibold ${tx.status === "success"
                          ? "text-green-500"
                          : tx.status === "pending"
                            ? "text-yellow-400"
                            : "text-red-500"}`}
                      >
                        ₦{tx.amount}
                      </p>
                      <span
                        className={`text-[11px] px-2 py-0.5 rounded-full capitalize ${tx.status === "success"
                          ? "bg-green-500/10 text-green-500"
                          : tx.status === "pending"
                            ? "bg-yellow-500/10 text-yellow-500"
                            : "bg-red-500/10 text-red-500"}`}
                      >
                        {tx.status}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">No recent transactions</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;