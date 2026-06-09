"use client";

import React, { useMemo, useCallback } from "react";
import { useFlutterwave, closePaymentModal } from "flutterwave-react-v3";
import { useGlobalContext } from "../Context";
import axios from "axios";

export default function PaymentButton({
  email,
  amount,
  phonenumber,
  name
}) {

  const { setPaymentId } = useGlobalContext();
  // Generate a unique reference for this transaction session
  const tx_ref = useMemo(() => `tx-${Date.now()}`, []);

  const saveTransactionToTDb = useCallback(async () => {
    try {
      const postData = {
        tx_ref,
        email,
        amount,
        name
      };
      const response = await axios.post("/api/save-payment-to-db", postData);
      console.log("Save payment response:", response.data);
    } catch (error) {
      console.error("Save payment error:", error.response?.data || error.message);
    }
  }, [tx_ref, email, amount, name]);

  const config = useMemo(() => ({
    public_key: process.env.NEXT_PUBLIC_FLW_PUBLIC_KEY,
    tx_ref,
    amount,
    currency: "NGN",
    payment_options: "card,mobilemoney,ussd",
    customer: {
      email,
      phonenumber,
      name,
    },
    customizations: {
      title: "Pax26 Top-Up",
      description: "Fund your Pax26 wallet",
      logo: "https://Pax26.vercel.app/favicon.ico",
    },
  }), [tx_ref, amount, email, phonenumber, name]);

  const handleFlutterPayment = useFlutterwave(config);

  const handlePaymentClick = () => {
    // 1. Save transaction in DB as pending BEFORE opening the modal
    saveTransactionToTDb();

    // 2. Open Flutterwave payment modal
    handleFlutterPayment({
      callback: (response) => {
        console.log("Flutterwave payment response:", response);
        if (response.status === "successful" || response.status === "completed") {
          setPaymentId(response.transaction_id);
        }
        closePaymentModal();
      },
      onClose: () => {
        console.log("Payment modal closed by user");
      },
    });
  };

  return (
    <button
      onClick={handlePaymentClick}
      className="w-full h-full bg-transparent border-none outline-none text-white font-bold cursor-pointer"
    >
      Fund Your Wallet
    </button>
  );
}
