"use client";

import React from "react";
import { FlutterWaveButton, closePaymentModal } from "flutterwave-react-v3";
import { useGlobalContext } from "../Context";
import axios from "axios";

export default function PaymentButton({
  email,
  amount,
  phonenumber,
  name
}) {

  const { setPaymentId } = useGlobalContext();
  const tx_ref = `tx-${Date.now()}`

  const saveTransactionToTDb = async () => {
    try {
      const postData = {
        tx_ref,
        email,
        amount,
        name
      }
      const response = await axios.post("https://monetrax.vercel.app/api/save-payment-to-db",
        postData,
        {
          headers: {
            "Authorization": `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODM0ZjE4ZGJmOTBmYzllNzA3MGNkNDMiLCJpYXQiOjE3NTY3MjYxOTMsImV4cCI6MTc1NjgxMjU5M30.Zfwk_qUorqxGDQBW8Ot8dD1HQbHTyn6urei83MRZSPM`
          }
        }
      );
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
      saveTransactionToTDb()
      closePaymentModal();
    },
    onClose: () => { },
  };

  return <FlutterWaveButton {...fwConfig} />;
}
