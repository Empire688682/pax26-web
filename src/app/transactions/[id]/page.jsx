"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import LoadingSpinner from "@/component/LoadingSpinner/LoadingSpinner";
import TransactionHistoryItem from "@/component/ui/TransactionHistoryItem";
import { useGlobalContext } from "@/component/Context";

export default function Page() {
  const { pax26, transactionHistory, getUserRealTimeData } = useGlobalContext();
  const { id } = useParams();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      // If no transaction history is available → fetch real-time data
      if (!transactionHistory || transactionHistory.length === 0) {
        await getUserRealTimeData();
      }

      // Find the history item using the id from params
      const item = transactionHistory?.find((t) => t._id === id);

      setData(item);
      setLoading(false);
    }

    loadData();
  }, [id, transactionHistory, getUserRealTimeData]);

  // ------------------------
  // 🟡 Loading UI
  // ------------------------
  if (loading) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <LoadingSpinner />
      </div>
    );
  }

  // ------------------------
  // 🔴 Not Found UI
  // ------------------------
  if (!data) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-lg font-medium">Transaction Not Found</h2>
        <p className="text-gray-500 mt-2">
          No transaction found with ID: {id}
        </p>
      </div>
    );
  }

  // ------------------------
  // 🟢 Success UI
  // ------------------------
  return (
    <div className="p-6"
     style={{backgroundColor:pax26.secondaryBg}}>
      <TransactionHistoryItem data={data} />
    </div>
  );
}
