"use client";
import React, { useEffect, useState } from "react";
import ElectricityReceipt from "@/component/ui/ElectInvoice";
import { useParams } from "next/navigation";
import { mockElectData } from "@/component/MockData/mockElectData";
import LoadingSpinner from "@/component/LoadingSpinner/LoadingSpinner";
import { useGlobalContext } from "@/component/Context";

export default function Page() {
  const {pax26} = useGlobalContext();
  const {id} = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    // Fetch real data here using the id param
    // For now, we'll use mock data
    const fetchData = async () => {
      // Simulate fetching data
      const electData = mockElectData.find(item => item.id === id);
      setData(electData);
      const interval = setTimeout(() => {
        setLoading(false);
      }, 4000);
      return () => clearTimeout(interval);
    };
      fetchData();
}, []);

if(loading){
  return <div className="p-6"><LoadingSpinner /></div>;
}
  
  return (
    <div className="p-6 min-h-screen " 
     style={{backgroundColor:pax26.secondaryBg}}
  >
      {data ? (
        <ElectricityReceipt
        amount={data.amount}
        status="Successful"
        date={data.date}
        disco={data.disco}
        meterNumber={data.meterNumber}
        customerName={data.customerName}
        serviceAddress={data.serviceAddress}
        meterType={data.meterType}
        units={120}
        token={data.token}
        transactionNo="251120090100718263727070"
      />
      ) : <div className="flex item-center justify-center pt-32"
      style={{color:pax26.textPrimary}}> No data found for ID: {id}</div>}
    </div>
  );
}
