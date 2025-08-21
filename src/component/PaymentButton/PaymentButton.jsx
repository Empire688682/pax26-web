"use client";

import React from "react";
import { FlutterWaveButton, closePaymentModal } from "flutterwave-react-v3";
import { useGlobalContext } from "../Context";
import axios from "axios";

export default function PaymentButton({
    email,
    amount,
    phonenumber,
    name,
    setAmount
}) {

 const {setPaymentId} = useGlobalContext();
 const tx_ref =  `tx-${Date.now()}`

 const saveTransactionToTDb = async()=>{
    try {
        const postData = {
            tx_ref,
            email,
            amount,
            name
        }
        const response = await axios.post("/api/save-payment-to-db", postData);
        console.log("response:", response)
    } catch (error) {
        console.log("SaveErr:", error)
    }
 }
  const config = {
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
      title: "Monetrax Top-Up",
      description: "Fund your Monetrax wallet",
      logo: "https://Monetrax.vercel.app/favicon.ico",
    },
  };

  const fwConfig = {
    ...config,
    text: "Fund Your Wallet",
    callback: (response) => {
      console.log("response:", response);
      setPaymentId(response.transaction_id);
      setAmount("");
      saveTransactionToTDb()
      closePaymentModal();
    },
    onClose: () => {},
  };

  return <FlutterWaveButton {...fwConfig} />;
}
