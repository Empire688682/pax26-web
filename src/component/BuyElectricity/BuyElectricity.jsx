"use client";
import React, { useState, useEffect } from 'react';
import { toast,  } from "react-toastify";
import WalletBalance from '../WalletBalance/WalletBalance';
import ElectricityHelp from '../ElectricityHelp/ElectricityHelp';
import axios from 'axios';
import { FaSpinner } from "react-icons/fa";
import { useGlobalContext } from '../Context';

const BuyElectricity = () => {
  const { getUserRealTimeData, pax26, userData, route, setPinModal, setElectReceiptData } = useGlobalContext();
  const [electricityCompany, setElectricityCompany] = useState({});
  const [loading, setLoading] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [isMeterVerified, setIsMeterVerified] = useState(false);
  const [verifyingMeter, setVerifyingMeter] = useState(false);
  const [responseData, setResponseData] = useState(null);

  const electricityUrl = "https://www.nellobytesystems.com/APIElectricityDiscosV1.asp"

  useEffect(() => {
    const getElectricityCompany = async () => {
      try {
        const response = await fetch(electricityUrl, {
          method: "GET",
        });
        const data = await response.json();

        if (data?.ELECTRIC_COMPANY) {
          setElectricityCompany(data.ELECTRIC_COMPANY);
        }
      } catch (error) {
        console.error(error);
      }
    };
    getElectricityCompany();
  }, []);

    useEffect(()=>{
      const interval = setInterval(()=>{
        if(userData.pin === null){
          setPinModal(true);
        }
      },2000);
  
      return () => clearInterval(interval);
    }, [userData]);

  const [formData, setFormData] = useState({
    disco: '',
    meterNumber: '',
    meterType: '',
    amount: '',
    phone: '',
    pin: '',
    customerName: '',
  });

  const handleChange = (e) => {
   const { name, value } = e.target
  

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const verifyMeterNumber = async (meterNumber, disco) => {

    if (meterNumber.length && disco) {
      setVerifyingMeter(true);
      try {
        const response = await axios.post('/api/verify-meter-number',
          { meterNumber, disco },
        );

        console.log("Verify Meter Response:", response);

        if (response.data.success) {
        const name = response.data.data;
          setCustomerName(name);
          setFormData((prev) =>({...prev, customerName: name}));
          localStorage.setItem("verifiedMeterName", name);
          return true
        }
        else {
          return false
        }
      } catch (error) {
        console.log("Verify Meter Number Error:", error);
        setCustomerName("Invalid provider or meter number");
      }
      finally {
        setVerifyingMeter(false);
      }
    }

  };

  useEffect(()=>{
    const { disco, meterNumber } = formData;
    if (meterNumber.length >= 7 && disco) {
      verifyMeterNumber(meterNumber, disco).then((isVerified)=>{
        setIsMeterVerified(isVerified);
      });
    }
  },[formData.disco, formData.meterNumber]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { disco, meterNumber, meterType, amount, phone, pin } = formData;

    if (!disco || !meterNumber || !meterType || !amount || !phone || !pin) {
      return toast.error("All fields are required!");
    }

    if (+amount < 1000) {
      return toast.error("Minimum amount is ₦100");
    }

    if (pin.length < 4) {
      return toast.error("Pin most be 4 digit");
    }

    if (!isMeterVerified) {
      return toast.error("Meter not verified");
    };

    setLoading(true);

    console.log("Form Data Submitted:", formData);
    try {
      const response = await axios.post("/api/provider/electricity-provider", formData);
      console.log("Response:", response);
      if (response.data.success) {
        getUserRealTimeData();
        console.log("Response:", response.data.data);
        setElectReceiptData(response.data.data);
        route.push("/electricity-receipt");
        toast.success(response.data.message);
      }
    } catch (error) {
      console.log("Elect-Error:", error);
      toast.error(error.response.data.message);
    }
    finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (loading) {
      toast.info("Proccessing....")
    }
  })

  return (
    <div className="min-h-screen px-6 py-10"
    style={{ backgroundColor: pax26.secondaryBg }}>
      
      <div className='grid md:grid-cols-2 grid-cols-1 gap-6 justify-start '>
        <div className='flex flex-col gap-6'>

          <WalletBalance />

          <div className="max-w-2xl backdrop-blur-md shadow-2xl rounded-2xl p-8 border border-blue-100"
          style={{ backgroundColor: pax26.bg}}>
            <h1 className="text-2xl font-bold text-center text-blue-700 mb-8 tracking-tight">
              Buy Electricity
            </h1>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Disco Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Select Provider</label>
                <select
                  name="disco"
                  onChange={handleChange}
                  value={formData.disco}
                  required
                  className="w-full border border-gray-300 rounded-xl text-gray-400 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <option disabled value="">-- Choose Provider --</option>
                  {Object.keys(electricityCompany).map((merchant, id) => (
                    <option key={id} value={merchant}>
                      {merchant}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Select Meter Type</label>
                <select
                  name="meterType"
                  onChange={handleChange}
                  value={formData.meterType}
                  required
                  className="w-full border border-gray-300 rounded-xl text-gray-400 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <option disabled value="">-- Choose Meter Type --</option>
                 <option  value="Prepaid">Prepaid</option>
                 <option  value="Postpaid">Postpaid</option>
                </select>
              </div>

              {/* Meter Number */}
              <div className='relative'>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Meter Number</label>
                <input
                  type="text"
                  name="meterNumber"
                  value={formData.meterNumber}
                  onChange={handleChange}
                  placeholder="e.g. 1234567890"
                  className="w-full border border-gray-300 rounded-xl text-gray-400 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
                  maxLength={11}
                />
                {
                  verifyingMeter && <span className="absolute right-[10px] top-[40px]">
                    <FaSpinner className="animate-spin text-blue-600 text-2xl" />
                  </span>
                }
                {
                  customerName && customerName !== "Invalid provider or meter number" ? <p className='text-xs pt-2 font-bold text-green-500'>{customerName}</p>
                    :
                    <p className='text-xs pt-2 font-bold text-red-500'>{customerName}</p>
                }
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Amount (₦)</label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  placeholder="Minimum ₦1000"
                  className="w-full border border-gray-300 rounded-xl text-gray-400 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
                />
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="e.g. 08012345678"
                  className="w-full border border-gray-300 rounded-xl text-gray-400 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
                />
              </div>

              {/* Pin */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Transaction PIN</label>
                <input
                  type="password"
                  name="pin"
                  value={formData.pin}
                  onChange={handleChange}
                  maxLength={4}
                  placeholder="Enter your PIN"
                  className="w-full border border-gray-300 rounded-xl text-gray-400 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading || verifyingMeter}
                className="w-full bg-blue-600 text-white py-3 rounded-xl text-lg font-semibold hover:bg-blue-700 cursor-pointer transition duration-300"
              >
                {
                  loading ? "Proccessing..." : verifyingMeter ? "Verifying Meter..." : "Buy Now"
                }
              </button>
            </form>
          </div>

        </div>

        <ElectricityHelp data={formData} />

      </div>
    </div>
  );
};

export default BuyElectricity;
