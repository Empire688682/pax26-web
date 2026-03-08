"use client";
import React, { useEffect, useState } from "react";
import {
  Bot,
  Phone,
  Wifi,
  Zap,
  Tv,
  ArrowRightLeft,
  Bell,
  ArrowRight
} from "lucide-react";

import { useGlobalContext } from "../Context";
import QuickLinks from "../ui/QuickLinks";
import WalletBalance from "../WalletBalance/WalletBalance";
import CashBackBalance from "../CashBackBalance/CashBackBalance";

const Dashboard = () => {
  const {
    userData,
    pax26,
    router,
    transactionHistory,
    getUserRealTimeData
  } = useGlobalContext();
  const [showWallet, setShowWallet] = useState(false);
  const [showMore, setShowMore] = useState(false);

  useEffect(() => {
    getUserRealTimeData();
  }, []);

  const firstName = userData?.name?.split(" ")[0] || "User";

  return (
    <div className="min-h-screen space-y-6">

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-gray-400">Welcome back</p>
          <h2
            className="text-xl font-bold"
            style={{ color: pax26.textPrimary }}
          >
            {firstName}
          </h2>
        </div>

        <button onClick={() => router.push("/notifications")}>
          <Bell className="text-gray-400 hover:text-white" />
        </button>
      </div>

      {/* AI Automation Hero */}
      <div
        style={{ backgroundColor: pax26.bg }}
        className="rounded-2xl p-6 relative overflow-hidden shadow-xl"
      >
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-blue-500/20 blur-3xl rounded-full" />

        <div className="flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Bot className="text-blue-400" />
              <p className="text-sm text-gray-400">
                AI Automation
              </p>
            </div>

            <h2
              className="text-xl font-bold mb-2"
              style={{ color: pax26.textPrimary }}
            >
              Automate your WhatsApp business
            </h2>

            <p className="text-gray-400 text-sm">
              Auto reply, capture leads and respond to customers instantly.
            </p>
          </div>

          <button
            onClick={() => router.push("dashboard/automations")}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm flex items-center text-white gap-2"
          >
            Setup
            <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* Automation Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

        <div
          style={{ backgroundColor: pax26.bg }}
          className="rounded-xl p-4"
        >
          <p className="text-xs text-gray-400">Automations</p>
          <p
            className="text-xl font-bold"
            style={{ color: pax26.textPrimary }}
          >
            0
          </p>
        </div>

        <div
          style={{ backgroundColor: pax26.bg }}
          className="rounded-xl p-4"
        >
          <p className="text-xs text-gray-400">Messages Handled</p>
          <p
            className="text-xl font-bold"
            style={{ color: pax26.textPrimary }}
          >
            0
          </p>
        </div>

        <div
          style={{ backgroundColor: pax26.bg }}
          className="rounded-xl p-4"
        >
          <p className="text-xs text-gray-400">Leads Captured</p>
          <p
            className="text-xl font-bold"
            style={{ color: pax26.textPrimary }}
          >
            0
          </p>
        </div>

        <div
          style={{ backgroundColor: pax26.bg }}
          className="rounded-xl p-4"
        >
          <p className="text-xs text-gray-400">Automation Revenue</p>
          <p
            className="text-xl font-bold"
            style={{ color: pax26.textPrimary }}
          >
            ₦0
          </p>
        </div>

      </div>

      <div
        style={{ backgroundColor: pax26.bg }}
        className="rounded-2xl p-5 shadow-xl"
      >
        <div className="flex items-center justify-between">

          <div>
            <p className="text-sm text-gray-400">
              Wallet
            </p>

            <p
              className="text-sm"
              style={{ color: pax26.textPrimary }}
            >
              Manage wallet balance & cashback
            </p>
          </div>

          <button
            onClick={() => setShowWallet(!showWallet)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs"
          >
            {showWallet ? "Hide Wallet" : "View Wallet"}
          </button>

        </div>
      </div>

      {/* Wallet Section */}
      {showWallet && (
        <div className="grid md:grid-cols-2 gap-4">

          <WalletBalance showMore={showMore} setShowMore={setShowMore} />

          <div
            style={{ backgroundColor: pax26.bg }}
            className="rounded-2xl p-5 shadow-xl"
          >
            <p className="text-sm text-gray-400">
              Cashback Balance
            </p>

            <CashBackBalance />
          </div>

        </div>
      )}

      {/* Services */}
      <div>

        <div className="flex justify-between mb-3">
          <h3
            className="text-sm font-semibold"
            style={{ color: pax26.textPrimary }}
          >
            Services
          </h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">

          <QuickLinks
            title="Airtime"
            link="/dashboard/services/buy-airtime"
            icon={<Phone style={{color:pax26.textPrimary}} />}
          />

          <QuickLinks
            title="Data"
            link="/dashboard/services/buy-data"
            icon={<Wifi style={{color:pax26.textPrimary}} />}
          />

          <QuickLinks
            title="Electricity"
            link="/dashboard/services/buy-electricity"
            icon={<Zap style={{color:pax26.textPrimary}} />}
          />

          <QuickLinks
            title="TV"
            link="/dashboard/services/buy-tv"
            icon={<Tv style={{color:pax26.textPrimary}} />}
          />

          <QuickLinks
            title="Transfer"
            link="/dashboard/services/transfer"
            icon={<ArrowRightLeft style={{color:pax26.textPrimary}} />}
          />

        </div>

      </div>

      {/* Recent Transactions */}
      <div>

        <div className="flex justify-between mb-3">
          <h3
            className="text-sm font-semibold"
            style={{ color: pax26.textPrimary }}
          >
            Recent Activity
          </h3>

          <button
            onClick={() => router.push("/transactions")}
            className="text-blue-400 text-xs flex items-center gap-1"
          >
            View all
            <ArrowRight size={14} />
          </button>
        </div>

        <div
          style={{ backgroundColor: pax26.bg }}
          className="rounded-xl p-4"
        >

          {transactionHistory?.length ? (
            transactionHistory
              .slice(0, 5)
              .map((tx) => (

                <div
                  key={tx._id}
                  className="flex justify-between border-b border-white/5 py-3"
                >

                  <div>
                    <p
                      className="text-sm"
                      style={{ color: pax26.textPrimary }}
                    >
                      {tx.description}
                    </p>

                    <p className="text-xs text-gray-400">
                      {new Date(tx.createdAt).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <p
                    className={`text-xs capitalize font-semibold text-green-500`}
                  >
                    {tx.type}
                  </p>
                    <p
                    className={`text-sm font-semibold ${tx.status === "success"
                        ? "text-green-500"
                        : "text-yellow-400"
                      }`}
                  >
                    ₦{tx.amount}
                  </p>
                  </div>

                </div>
              ))
          ) : (
            <p className="text-gray-400 text-sm">
              No recent activity
            </p>
          )}

        </div>

      </div>

    </div>
  );
};

export default Dashboard;