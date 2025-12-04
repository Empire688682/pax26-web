"use client";
import React, { useEffect , useState} from "react";
import Receipt from "@/component/ui/Receipt";
import { useGlobalContext } from "@/component/Context";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import LoadingSpinner from "@/component/LoadingSpinner/LoadingSpinner";

export default function Page() {
  const { pax26, router } = useGlobalContext();
  //Instance electricity data on purchase receipt page
  const [receiptData, setReceiptData] = useState(null);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const transactionId = searchParams.get("id");

  console.log("Electricity Receipt Data:", receiptData);

  useEffect(() =>{
    if (!transactionId) {
      router.push("/dashboard");
    }
    //Fetch transaction by receipt ID
    const getTransaction = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`/api/get-transaction-by-id/${transactionId}`);
        console.log("Fetch Transaction By ID Response:", res);
        if (res.data.success) {
          console.log("Fetched Transaction Data:", res.data.data);
          setReceiptData(res.data.data);
        }
      } catch (error) {
        console.log("Fetch Transaction By ID Error:", error);
      }
      finally {
        setLoading(false);
      }
    };
    getTransaction();
  }, [transactionId, router]);

  if (loading || !receiptData) {
    return (
      <LoadingSpinner/>
    )
  }

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
