"use client";

import React, { useEffect, useState } from "react";
import Receipt from "@/components/ui/Receipt";
import { useGlobalContext } from "@/components/Context";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import LoadingSpinner from "@/components/LoadingSpinner/LoadingSpinner";

export default function TransactionReceiptWrapper() {
  const { router } = useGlobalContext();

  const [receiptData, setReceiptData] = useState(null);
  const [loading, setLoading] = useState(true);

  const searchParams = useSearchParams();
  const transactionId = searchParams.get("id");

  useEffect(() => {
    if (!transactionId) {
      router.push("/dashboard");
      return;
    }

    const fetchTransaction = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `/api/get-transaction-by-id/${transactionId}`
        );

        if (res.data.success) {
          setReceiptData(res.data.data);
        } else {
          console.log("Transaction not found");
        }
      } catch (error) {
        console.log("Fetch Transaction Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransaction();
  }, [transactionId, router]);

  console.log("receiptData: ", receiptData)

  // -------- LOADING OR NO DATA --------
  if (loading || !receiptData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  // -------- FINAL RENDER --------
  return (
    <div
      className="p-6 min-h-screen"
    >
      <Receipt
        amount={receiptData.amount}
        receiptType={receiptData.type}
        meta={receiptData?.meta}
        status={receiptData.status}
        date={receiptData.createdAt}
        transactionId={receiptData._id}
      />
    </div>
  );
}
