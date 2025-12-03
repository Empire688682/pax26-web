"use client";
import React from "react";
import ElectricityReceipt from "@/component/ui/ElectInvoice";
import LoadingSpinner from "@/component/LoadingSpinner/LoadingSpinner";
import { useGlobalContext } from "@/component/Context";

export default function Page() {
  const { pax26, electReceiptData } = useGlobalContext();

  console.log("Electricity Receipt Data:", electReceiptData);

  if (!electReceiptData) {
    return (
      <div className="flex items-center justify-center pt-32" style={{ color: pax26.textPrimary }}>
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen" style={{ backgroundColor: pax26.secondaryBg }}>
      <ElectricityReceipt
        amount={electReceiptData.amount}
        status="Successful"
        date={electReceiptData.date}
        disco={electReceiptData.disco}
        meterNumber={electReceiptData.meterNumber}
        customerName={electReceiptData.customerName}
        serviceAddress={electReceiptData.serviceAddress}
        meterType={electReceiptData.meterType}
        units={120}
        token={electReceiptData.metertoken}
        transactionNo="251120090100718263727070"
      />
    </div>
  );
}
