"use cloient";
import ElectricityReceipt from "@/component/ui/ElectInvoice";

export default function Page() {
  return (
    <div className="p-6">
      <ElectricityReceipt
        amount={9000}
        status="Successful"
        date="Nov 20th, 2025 21:16:08"
        provider="Ikeja Electricity"
        meterNumber="45053973181"
        customerName="AJAYI SUNDAY OGUNLUSI"
        serviceAddress="11 ARIGBEDU ROAD, MOKORE WAREWA OLOWORA"
        meterType="Prepaid"
        units="139.20"
        token="1234 5678 9012 3456 7890"
        transactionNo="251120090100718263727070"
      />
    </div>
  );
}
