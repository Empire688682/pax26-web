"use client";

import { useGlobalContext } from "@/component/Context";
import React, { useEffect, useState } from "react";

const Page = () => {
  const { transactionHistory, pax26, getUserRealTimeData } = useGlobalContext();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Turn off loading once context data is available
    getUserRealTimeData().then(() => setLoading(false));
  }, []);

  console.log("Transaction History:", transactionHistory);

  return (
    <div className={`min-h-screen px-3`}
    style={{ backgroundColor: pax26?.publicBg }}>
      <h3 className="text-md font-medium mb-2 pt-6"
      style={{ color: pax26?.textPrimary }}
      >Transaction History</h3>
      <div className="py-10 px-3 shadow-md">
        {loading ? (
          <p style={{ color: pax26?.textPrimary }}>
            Loading...
          </p>
        ) : (
          <div className="space-y-4">
            {transactionHistory.length > 0 ? (
              <>
                {[...transactionHistory]
                  .reverse()
                  .map((transaction) => (
                    <div
                      key={transaction._id}
                      className="flex cursor-pointer justify-between items-center"
                    >
                      <div>
                        <p className="text-sm text-gray-400">
                          {new Date(transaction.createdAt)
                            .toISOString()
                            .replace("T", " ")
                            .split(".")[0]}
                        </p>
                        <p className="font-medium">{transaction.description}</p>
                      </div>
                      <div className="flex flex-col md:flex-row md:gap-4 justify-center">
                        <p
                          className={`text-sm ${
                            transaction.status === "success"
                              ? "text-green-600"
                              : transaction.status === "pending"
                              ? "text-yellow-700"
                              : "text-red-600"
                          }`}
                        >
                          ₦{transaction.amount}
                        </p>
                        <p
                          className={`text-sm ${
                            transaction.status === "success"
                              ? "text-green-600"
                              : transaction.status === "pending"
                              ? "text-yellow-700"
                              : "text-red-600"
                          }`}
                        >
                          {transaction.type}
                        </p>
                        <p
                          className={`text-sm font-semibold ${
                            transaction.status === "success"
                              ? "bg-green-100 text-green-700"
                              : transaction.status === "pending"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {transaction.status.charAt(0).toUpperCase() +
                            transaction.status.slice(1)}
                        </p>
                      </div>
                    </div>
                  ))}
              </>
            ) : (
              <p className="text-gray-400 text-sm py-6"
              style={{ color: pax26?.textSecondary || "#6b7280" }}>
                No transaction history found.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;
