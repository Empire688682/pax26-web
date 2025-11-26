"use client";
import React, { useEffect, useState } from "react";
import WalletBalance from "../WalletBalance/WalletBalance";
import { toast,  } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import TvHelp from "../TvHelp/TvHelp";
import axios from "axios";
import { FaSpinner } from "react-icons/fa";
import { useGlobalContext } from "../Context";

const BuyTv = () => {
  const {getUserRealTimeData, pax26, userData, setPinModal} = useGlobalContext();
  const allTvPackagesUrl = "https://www.nellobytesystems.com/APICableTVPackagesV2.asp";

  const initialFormState = {
    provider: "",
    smartcardNumber: "",
    tvPackage: "",
    phone: "",
    pin: "",
  };

  const [form, setForm] = useState(initialFormState);
  const [packagesData, setPackagesData] = useState({});
  const [packageAmount, setPackageAmount] = useState(null);
  const [availablePackages, setAvailablePackages] = useState([]);
  const [customerName, setCustomerName] = useState("");
  const [loading, setLoading] = useState(false);
  const [verifyingSmartcardNumber, setVerifyingSmartcardNumber] = useState(false);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const res = await fetch(allTvPackagesUrl);
        const data = await res.json();
        if (data && data.TV_ID) {
          setPackagesData(data.TV_ID);
        }
      } catch (error) {
        console.error("Failed to fetch packages:", error);
      }
    };

    fetchPackages();
  }, []);

  useEffect(() => {
    if (form.provider) {
      const providerData = packagesData[form.provider];
      if (providerData && providerData[0]?.PRODUCT) {
        setAvailablePackages(providerData[0].PRODUCT);
      } else {
        setAvailablePackages([]);
      }

      // Reset smartcard and package if provider changes
      setForm((prev) => ({ ...prev, smartcardNumber: "", tvPackage: "" }));
      setCustomerName("");
    }
  }, [form.provider]);

  useEffect(() => {
    if (!availablePackages.length || !form.tvPackage) return;

    const data = availablePackages.find((pk) => form.tvPackage === pk.PACKAGE_ID);
    if (data) {
      setPackageAmount(data.PACKAGE_AMOUNT);
    }
  }, [form.tvPackage, availablePackages]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const verifySmartcardNumber = async (smartcardNumber, provider) => {
    setVerifyingSmartcardNumber(true);
    try {
      const response = await axios.post("/api/verify-uic-tv-number", {
        smartcardNumber,
        provider,
      });

      if (response.data.success) {
        setCustomerName(response.data.data);
        return true;
      } else {
        setCustomerName("Verification failed.");
        return false;
      }
    } catch (error) {
      console.error("Verification error:", error);
      setCustomerName("Verification error occurred.");
      return false;
    } finally {
      setVerifyingSmartcardNumber(false);
    }
  };

    useEffect(()=>{
      const interval = setInterval(()=>{
        if(userData.pin === null){
          setPinModal(true);
        }
      },2000);
  
      return () => clearInterval(interval);
    }, [userData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { provider, smartcardNumber, tvPackage, phone, pin } = form;

    if (!provider || !smartcardNumber || !phone || !tvPackage || !pin) {
      toast.error("Please fill all fields correctly.");
      return;
    }

    const isVerified = await verifySmartcardNumber(smartcardNumber, provider);
    if (!isVerified) {
      toast.error("Smartcard verification failed.");
      return;
    }

    try {
      setLoading(true);
      toast.info("Processing...");

      const response = await axios.post("/api/provider/tv-subscribe-provider", {
        provider,
        smartcardNumber,
        amount: packageAmount,
        tvPackage,
        phone,
        pin,
      });

      if (response.data.success) {
        getUserRealTimeData();
        toast.success("TV subscription successful!");
        setForm(initialFormState);
        setCustomerName("");
        setAvailablePackages([]);
      } else {
        toast.error(response.data.message || "Subscription failed.");
      }
    } catch (error) {
      console.error("Subscription error:", error);
      toast.error(error?.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen px-6 py-10"
    style={{ backgroundColor: pax26.secondaryBg}}>
      
      <div className="grid md:grid-cols-2 grid-cols-1 gap-6">
        <div className="flex flex-col gap-6">
          <WalletBalance />
          <div 
          style={{ backgroundColor: pax26.bg}}
          className="max-w-2xl shadow-2xl rounded-2xl p-8 border border-blue-100">
            <h1 className="text-2xl font-bold text-center text-blue-700 mb-8">
              Buy TV Subscription
            </h1>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Provider */}
              <div>
                <label className="block mb-1 text-sm font-semibold text-gray-700">
                  TV Provider
                </label>
                <select
                  name="provider"
                  value={form.provider}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 text-gray-400 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-400"
                >
                  <option value="">-- Select Provider --</option>
                  {Object.keys(packagesData).map((p, i) => (
                    <option key={i} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              {/* Smartcard Number */}
              <div className="relative">
                <label className="block mb-1 text-sm font-semibold text-gray-700">
                  Smartcard Number
                </label>
                <input
                  type="tel"
                  name="smartcardNumber"
                  placeholder="Enter Smartcard Number"
                  value={form.smartcardNumber}
                  onChange={handleChange}
                  maxLength={12}
                  required
                  className="w-full border place-holder-gray-500 border-gray-300 text-gray-400 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-400"
                />
                {verifyingSmartcardNumber && (
                  <span className="absolute right-3 top-9">
                    <FaSpinner className="animate-spin text-blue-600 text-2xl" />
                  </span>
                )}
                {customerName && (
                  <p
                    className={`text-xs pt-2 font-bold ${
                      customerName.includes("fail") ? "text-red-500" : "text-green-500"
                    }`}
                  >
                    {customerName}
                  </p>
                )}
              </div>

              {/* Package */}
              <div>
                <label className="block mb-1 text-sm font-semibold text-gray-700">
                  TV Package
                </label>
                <select
                  name="tvPackage"
                  value={form.tvPackage}
                  onChange={handleChange}
                  required
                  disabled={!availablePackages.length}
                  className="w-full border border-gray-300 text-gray-400 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-400"
                >
                  <option value="" disabled>
                    -- Select Package --
                  </option>
                  {availablePackages.map((pkg, i) => (
                    <option key={i} value={pkg.PACKAGE_ID}>
                      {pkg.PACKAGE_NAME}
                    </option>
                  ))}
                </select>
              </div>

              {/* Amount */}
              {form.tvPackage && (
                <div>
                  <label className="block mb-1 text-sm font-semibold text-gray-700">
                    Amount
                  </label>
                  <p className="w-full border border-gray-300 text-gray-400 rounded-xl px-4 py-2 text-gray-700">
                    {packageAmount}
                  </p>
                </div>
              )}

              {/* Phone Number */}
              <div>
                <label className="block mb-1 text-sm font-semibold text-gray-700">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  required
                  placeholder="e.g. 08012345678"
                  className="w-full border border-gray-300 text-gray-400 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-400"
                />
              </div>

              {/* PIN */}
              <div>
                <label className="block mb-1 text-sm font-semibold text-gray-700">
                  Transaction PIN
                </label>
                <input
                  type="password"
                  name="pin"
                  value={form.pin}
                  onChange={handleChange}
                  required
                  maxLength={4}
                  placeholder="4-digit PIN"
                  className="w-full border border-gray-300 text-gray-400 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-400"
                />
              </div>

              <button
                type="submit"
                disabled={loading || verifyingSmartcardNumber}
                className="w-full bg-blue-600 text-white py-3 rounded-xl text-lg font-semibold hover:bg-blue-700 transition duration-300 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin" /> Processing...
                  </>
                ) : (
                  "Subscribe"
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right column help/info */}
        <TvHelp data={form} />
      </div>
    </div>
  );
};

export default BuyTv;
