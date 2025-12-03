"use client";
import React, { useEffect } from "react";
import ElectricityReceipt from "@/component/ui/ElectInvoice";
import { useGlobalContext } from "@/component/Context";

export default function Page() {
  const { pax26, route, electReceiptData } = useGlobalContext();

  console.log("Electricity Receipt Data:", electReceiptData);

  useEffect(() =>{
    if (!electReceiptData) {
      route.push("/dashboard/buy-electricity");
    }
  }, [electReceiptData]);

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
