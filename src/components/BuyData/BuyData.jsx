"use client";
import React, { useState, useEffect } from "react";
import { toast, } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import DataHelp from "../DataHelp/DataHelp";
import WalletBalance from "../WalletBalance/WalletBalance";
import { useGlobalContext } from "../Context";
import axios from "axios";
import { applyMarkup } from "../utils/helper";
import CashBackOption from '../ui/CashBackOption';
import { FaTimes } from 'react-icons/fa';
import { phoneCarrierDetector } from '../utils/phoneCarrierDetector';

const BuyData = () => {
  const { dataPlan, getUserRealTimeData, userData, setPinModal, profitConfig, pax26, userCashBack } = useGlobalContext();

  const [form, setForm] = useState({
    network: "",
    plan: "",
    planId: "",
    amount: "",
    number: "",
    pin: ""
  });
  const [checked, setChecked] = useState(false);
  const [phoneCarrier, setPhoneCarrier] = useState("");
  const [phoneNumberValid, setPhoneNumberValid] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const networks = {
    "01": "MTN",
    "02": "Glo",
    "04": "Airtel",
    "03": "m_9mobile"
  };

  function updateAvailablePlan(code) {
    const network = networks[code];

    const plans = dataPlan?.MOBILE_NETWORK?.[network]?.[0]?.PRODUCT || [];

    const enhancedPlans = plans.map((item) => {
      const basePrice = Number(item.PRODUCT_AMOUNT);
      const priceWithMarkup = applyMarkup(basePrice, profitConfig.type, profitConfig.value);
      const roundedPrice = roundToNearestTen(priceWithMarkup);

      return {
        name: item.PRODUCT_NAME,
        code: item.PRODUCT_ID,
        price: basePrice,
        sellingPrice: roundedPrice,
      };
    });
    setAvailablePlans(enhancedPlans);
  }

  useEffect(() => {
      if (!form.number || form.number.length < 11) {
    setForm(prev => ({
      ...prev,
      network: "",
      plan: "",
      planId: "",
      amount: ""
    }));

    setAvailablePlans([]);
    setPhoneCarrier("");
    setPhoneNumberValid(false);
  }
    if (form.number.length < 11) return;
    const carrier = phoneCarrierDetector(form.number);
    if (!carrier) {
      setPhoneNumberValid(false);
      return;
    }
    setPhoneCarrier(carrier);
    setPhoneNumberValid(true);
    setForm((prev) => ({ ...prev, network: carrier }));

    updateAvailablePlan(carrier);

  }, [form.number, form.network]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (userData.pin === null) {
        setPinModal(true);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [userData]);

  const [availablePlans, setAvailablePlans] = useState([]);
  const [loading, setLoading] = useState(false);

  // Helper function for your rounding rule (nearest 10, rounding .5 and up)
  function roundToNearestTen(num) {
    const remainder = num % 10;
    if (remainder >= 5) {
      return num + (10 - remainder); // round up
    } else {
      return num - remainder; // round down
    }
  }

  const handleNetworkChange = (e) => {
    const selected = e.target.value;
    setForm({
      ...form,
      network: selected,
      plan: "",
      amount: ""
    });

    updateAvailablePlan(selected);
  };

  const handlePlanChange = (e) => {
    const selected = e.target.value;
    const plan = availablePlans.find((p) => p.name === selected);
    if (plan) {
      setForm({ ...form, plan: selected, planId: plan.code, amount: plan.sellingPrice.toString() });
    }
  };

  
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.network) return toast.error("Please select a network");
    if (!form.plan) return toast.error("Please choose a data plan");
    if (!/^\d{11}$/.test(form.number)) return toast.error("Enter a valid 11-digit phone number");
    if (!phoneNumberValid) return toast.error("Enter a valid phone number");
    if (form.pin.length < 4) return toast.error("PIN must be 4 digits");

    setLoading(true);
    try {
      const usedCashBack = checked ? true : false;
      const res = await axios.post("/api/provider/data-provider",
        { ...form, usedCashBack, network:networks[form.network] });

      if (res.data.success) {
        getUserRealTimeData();
        toast.success("Data purchase successful!");

        setForm({
          network: "",
          plan: "",
          amount: "",
          number: "",
          pin: ""
        });
        setAvailablePlans([]);
      }
    } catch (error) {
      console.log("Error:", error);
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-12 px-6"
      style={{ backgroundColor: pax26.secondaryBg }}>

      {dataPlan ? (
        <div className="grid md:grid-cols-2 grid-cols-1 gap-6 justify-start">
          <div className="flex flex-col gap-6">
            <WalletBalance />
            <div
              style={{ backgroundColor: pax26.bg }}
              className="max-w-2xl backdrop-blur-md shadow-2xl rounded-2xl p-8">
              <div className='flex justify-between items-center mb-8'>
                <h1 className="text-2xl font-bold text-center text-blue-700 tracking-tight">
                  Buy Data
                </h1>
                <CashBackOption
                  userCashBack={userCashBack}
                  setChecked={setChecked}
                  checked={checked}
                />
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Phone Number */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Phone Number</label>
                  <input
                    name="number"
                    type="tel"
                    onChange={handleChange}
                    value={form.number}
                    placeholder="e.g. 08012345678"
                    required
                    className="w-full border border-gray-300 text-gray-400 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  {
                  form.number.length > 10 && phoneCarrier === "99" && (
                    <p className="text-red-500 text-sm pt-1">Invalid Phone Number</p>
                  )
                }
                </div>

                {/* Network */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Select Network
                  </label>
                  <select
                    name="network"
                    onChange={handleNetworkChange}
                    value={form.network}
                    required
                    className="w-full border border-gray-300 rounded-xl text-gray-400 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    <option disabled value="">
                      -- Choose Network --
                    </option>
                    {Object.entries(networks).map(([code, name]) => (
                      <option value={code} key={code}>
                        {name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Data Plan */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Choose Data Plan
                  </label>
                  <select
                    name="plan"
                    onChange={handlePlanChange}
                    value={form.plan}
                    required
                    className="w-full border border-gray-300 text-gray-400 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    <option disabled value="">
                      -- Choose Plan --
                    </option>
                    {availablePlans.map((p, i) => (
                      <option key={i} value={p.name}>
                        {p.name} - ₦{p.sellingPrice}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Auto Amount (readonly) */}
                <div className="relative">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Amount</label>
                  <input
                    name="amount"
                    type="text"
                    readOnly
                    placeholder="Amount will be auto-filled"
                    value={form.amount}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-400"
                    style={{ backgroundColor: pax26.publicBg, color: pax26.textPrimary }}
                  />
                  {
                    checked && form.amount && Number(form.amount) >= 50 && (
                      <span className='text-green-500 font-bold absolute right-6 top-10'>
                        {
                          Number(form.amount) < userCashBack && (
                            0
                          )
                        }
                        {
                          Number(form.amount) > userCashBack && (
                            Number(form.amount) - userCashBack
                          )
                        }
                        {
                          Number(form.amount) === userCashBack && (
                            0
                          )
                        }
                      </span>
                    )
                  }
                  {
                    checked && form.amount && Number(form.amount) >= 50 && (
                      <span className='text-green-500 font-bold'>
                        - ₦
                        {
                          Number(form.amount) < userCashBack ?
                            `${form.amount}`
                            :
                            `${userCashBack}`
                        }
                      </span>
                    )
                  }
                  {
                    checked && form.amount && Number(form.amount) >= 50 && (
                      <span className='text-red-500 font-bold absolute left-0 top-10'>
                        <FaTimes />
                      </span>
                    )
                  }
                </div>

                {/* PIN */}
                <div>
                  <label className="block text-sm font-semibold text-gray-400 mb-1">Enter PIN</label>
                  <input
                    name="pin"
                    type="password"
                    onChange={handleChange}
                    value={form.pin}
                    placeholder="4 digit PIN"
                    required
                    maxLength={4}
                    className="w-full border border-gray-300 text-gray-400 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-3 rounded-xl text-lg font-semibold hover:bg-blue-700 transition duration-300"
                >
                  {loading ? "Processing..." : "Buy Now"}
                </button>
              </form>
            </div>
          </div>

          <DataHelp data={form} />
        </div>
      ) : (
        <div>Loading.....</div>
      )}
    </div>
  );
};

export default BuyData;
