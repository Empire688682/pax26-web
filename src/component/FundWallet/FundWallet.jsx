"use client";
import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useGlobalContext } from "../Context";
import PaymentButton from "../PaymentButton/PaymentButton";
import axios from "axios";

const FundWallet = () => {
  const { userData, paymentId, setPaymentId, route, pax26 } = useGlobalContext();
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const verifyPayment = async () => {
    if (!paymentId) return;
    setLoading(true);
    try {
      const response = await axios.post('/api/verify-payment',
        { transaction_id: paymentId },
       );
      if (response.data.success) {
        setAmount("");
        toast.success("Payment verified successfully! Your wallet has been funded.");
        setTimeout(() => {
          route.push('/dashboard');
        }, 2000);
      }
      else {
        toast.error(response.data.message || "Payment verification failed.");
      }
    } catch (error) {
      console.log("verifyPaymentErr:", error);
      toast.error("An error occurred during payment verification.");
    }
    finally {
      setLoading(false);
      setPaymentId('');
    }
  }

  useEffect(() => {
    verifyPayment();
  }, [paymentId]);

  return (
    <div className="min-h-screen py-10 px-6 "
    style={{backgroundColor:pax26.secondaryBg}}>
      <ToastContainer />
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 grid-cols-1 gap-10 items-center">
        {
          loading ?
            <div className="backdrop-blur-md p-8 text-center max-w-md rounded-2xl shadow-lg border border-blue-100 flex flex-col gap-4"
            style={{backgroundColor:pax26.bg}}>
              <h2 className="text-xl font-semibold text-blue-600 mb-2">Payment Verification</h2>
              <div className="flex justify-center items-center mt-4">
                <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="ml-2"
                style={{color:pax26.textPrimary}}>Verifying...</span>
              </div>
              {
                loading ?
                  <p>Please wait while we verify your payment</p>
                  :
                  <p>Verification process complete</p>
              }
              <p className="text-gray-500 text-sm">Transaction ID: <span className='font-semibold'>{paymentId}</span></p>
            </div>
            :
            <div
              className="backdrop-blur-md p-8 rounded-2xl shadow-lg border border-blue-100 flex flex-col gap-6"
              style={{backgroundColor:pax26.bg}}
            >
              <h3 className="text-xl font-semibold text-blue-600 mb-2">Top-Up Form</h3>

              <div>
                <label
                  htmlFor="amount"
                  className="block text-sm font-medium mb-1"
                  style={{color:pax26.textPrimary}}
                >
                  Amount (₦)
                </label>
                <input
                  type="number"
                  id="amount"
                  value={amount ?? ""}
                  onChange={(e) => setAmount(e.target.value)}
                  min="100"
                  placeholder="Minimum ₦100"
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400`}
                  style={{color:pax26.textPrimary}}
                />
              </div>

              {
                amount && Number(amount) >= 100 && (
                  <span className="w-full flex items-center justify-center bg-blue-600 text-white py-2 rounded-lg text-base font-semibold hover:bg-blue-700 transition duration-300 shadow-md disabled:opacity-50">
                    <PaymentButton
                      email={userData?.email}
                      amount={parseInt(amount)}
                      name={userData?.name}
                      phonenumber={userData?.number}
                    />
                  </span>
                )
              }
            </div>
        }

        {/* Info Section */}
        <div className="backdrop-blur-md p-8 rounded-2xl shadow-xl border border-blue-100 flex flex-col gap-6"
        style={{backgroundColor:pax26.bg}}>
          <h2 className="text-3xl font-bold text-blue-700 mb-2">
            Fund Your Wallet
          </h2>
          <p className="text-gray-700 leading-relaxed text-sm">
            Easily top-up your <span className="font-semibold">Pax26</span>{" "}
            wallet using Flutterwave. Your wallet allows you to buy airtime,
            data, electricity, and much more — all in one place.
          </p>
          <div className="p-4 rounded-lg border-l-4 border-blue-500 text-sm text-blue-800"
          style={{backgroundColor:pax26.secondaryBg}}>
            🔐 All transactions are secured using bank-grade encryption.
          </div>
          <div className="text-sm text-gray-600 mt-4">
            Need help? Contact{" "}
            <a
              href="mailto:support@Pax26.com"
              className="text-blue-600 underline font-medium"
            >
              support@Pax26.com
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FundWallet;
