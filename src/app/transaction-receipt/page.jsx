"use client";
import React, { useEffect } from "react";
import Receipt from "@/component/ui/Receipt";
import { useGlobalContext } from "@/component/Context";

export default function Page() {
  const { pax26, route, receiptData } = useGlobalContext();

  console.log("Electricity Receipt Data:", receiptData);

  useEffect(() =>{
    if (!receiptData) {
      route.push("/dashboard");
    }
  }, [receiptData]);

  return (
    <div className="p-6 min-h-screen" style={{ backgroundColor: pax26.secondaryBg }}>
      <Receipt
        amount={receiptData.amount}
        receiptType={receiptData?.type}
        metadata={receiptData?.metadata}
        status={receiptData?.status}
        date={receiptData?.date}
        meterType={receiptData?.meterType}
        units={120}
        transactionId={receiptData._id || "251120090100718263727070"}
      />
    </div>
  );
}
