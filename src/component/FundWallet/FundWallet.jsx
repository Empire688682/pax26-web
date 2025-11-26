"use client";
import React, { useEffect, useState } from "react";
import { toast,  } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useGlobalContext } from "../Context";
import PaymentButton from "../PaymentButton/PaymentButton";
import axios from "axios";
import { Copy } from "lucide-react";

const FundWallet = () => {
  const { userData, paymentId, setPaymentId, route, pax26 } = useGlobalContext();
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [moreOptions, setMoreOptions] = useState(true);

  console.log("UserAcct:", userData?.virtualAccount);

  const verifyPayment = async () => {
    if (!paymentId) return;
    setLoading(true);
    try {
      const response = await axios.post('/api/verify-payment', { transaction_id: paymentId });
      if (response.data.success) {
        setAmount("");
        toast.success("Payment verified successfully! Your wallet has been funded.");
        setTimeout(() => {
          route.push('/dashboard');
        }, 2000);
      } else {
        toast.error(response.data.message || "Payment verification failed.");
      }
    } catch (error) {
      console.log("verifyPaymentErr:", error);
      toast.error("An error occurred during payment verification.");
    } finally {
      setLoading(false);
      setPaymentId('');
    }
  };

  useEffect(() => {
    verifyPayment();
  }, [paymentId]);

  const copyVirtualAccount = () => {
    navigator.clipboard.writeText(userData?.virtualAccount)
      .then(() => {
        alert("Account number copied to clipboard");
      })
      .catch((error) => {
        alert("Failed to copy", error);
      })
  }


  return (
    <div className="min-h-screen py-10 px-6" style={{ backgroundColor: pax26.secondaryBg }}>
      
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 grid-cols-1 gap-10 items-start">

        {/* Left: Fund Wallet Form */}
        {loading ? (
          <div className="backdrop-blur-md p-8 text-center max-w-md rounded-2xl shadow-lg border border-blue-100 flex flex-col gap-4"
            style={{ backgroundColor: pax26.bg }}>
            <h2 className="text-xl font-semibold text-blue-600 mb-2">Payment Verification</h2>
            <div className="flex justify-center items-center mt-4">
              <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="ml-2" style={{ color: pax26.textPrimary }}>Verifying...</span>
            </div>
            <p>Please wait while we verify your payment</p>
            <p className="text-gray-400 text-sm">Transaction ID: <span className='font-semibold'>{paymentId}</span></p>
          </div>
        ) : (
          <div className="backdrop-blur-md p-8 rounded-2xl shadow-lg border border-blue-100 flex flex-col gap-6"
            style={{ backgroundColor: pax26.bg }}>

            {/* Transfer Options Section */}
            <div className="p-4 border rounded-lg border-blue-200"
            style={{ backgroundColor: pax26.secondaryBg }}
            >
              <h3 className="text-lg font-semibold text-blue-700">Transfer Options</h3>
              <p className="text-sm text-gray-600"
              style={{ color: pax26.textSecondary }}>Choose an account to transfer funds to:</p>

              <div className="mt-4 flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={!moreOptions}
                      onChange={() => setMoreOptions(false)}
                    />
                    <span style={{ color: pax26.textPrimary }}>Your Default Account: <strong>{userData?.virtualAccount || "Coming soon"}</strong></span>
                    <Copy size={20} className="cursor-pointer" name="Copy" onClick={copyVirtualAccount} />
                  </label>
                  {
                    // !moreOptions && (
                    //   <>
                    //     <p className="text-sm font-bold">Bank: {userData?.bank}<span></span></p>
                    //     <p className="text-sm font-bold">Name: {userData?.bankName}</p>
                    //   </>
                    // )
                  }
                </div>

                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={moreOptions}
                    onChange={() => {
                      setMoreOptions(true);
                    }}
                  />
                  <span
                  style={{ color: pax26.textPrimary }}
                  >Use Another Options</span>
                </label>
              </div>
            </div>

            {/* Top-Up Form */}
            {
              moreOptions && (
                <div>
                  <h3 className="text-xl font-semibold text-blue-600 mb-2">Top-Up Form</h3>
                  <div>
                    <label htmlFor="amount" className="block text-sm font-medium mb-1" style={{ color: pax26.textPrimary }}>
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
                      style={{ color: pax26.textPrimary }}
                    />
                  </div>

                  {amount && Number(amount) >= 100 && (
                    <span className="w-full flex items-center mt-4 justify-center bg-blue-600 text-white py-2 rounded-lg text-base font-semibold hover:bg-blue-700 transition duration-300 shadow-md">
                      <PaymentButton
                        email={userData?.email}
                        amount={parseInt(amount)}
                        name={userData?.name}
                        phonenumber={userData?.number}
                      />
                    </span>
                  )}
                </div>
              )
            }
          </div>
        )}

        {/* Info Section */}
        <div className="backdrop-blur-md p-8 rounded-2xl shadow-xl border border-blue-100 flex flex-col gap-6"
          style={{ backgroundColor: pax26.bg }}>
          <h2 className="text-3xl font-bold text-blue-700 mb-2">Fund Your Wallet</h2>
          <p className="text-gray-700 leading-relaxed text-sm">
            Easily top-up your <span className="font-semibold">Pax26</span>{" "}
            wallet using Flutterwave. Your wallet allows you to buy airtime,
            data, electricity, and much more — all in one place.
          </p>
          <div className="p-4 rounded-lg border-l-4 border-blue-500 text-sm text-blue-800"
            style={{ backgroundColor: pax26.secondaryBg }}>
            🔐 All transactions are secured using bank-grade encryption.
          </div>
          <div className="text-sm text-gray-400 mt-4">
            Need help? Contact{" "}
            <a href="mailto:info@pax26.com" className="text-blue-600 underline font-medium">
              info@pax26.com
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FundWallet;
