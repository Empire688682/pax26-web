"use client";
import { useRouter } from 'next/navigation';
import React, { useContext, useEffect, useState } from 'react';
import axios from "axios";
import { toast } from "react-toastify";

// Create React Context for global app state
const AppContext = React.createContext();

export const AppProvider = ({ children }) => {
  // State to control mobile menu toggle
  const [isOpen, setIsOpen] = useState(false);

  // State to control visibility of auth modal (register/login)
  const [isModalOpen, setIsModalOpen] = useState(false);

  // State to track current auth modal type: "register" or "login"
  const [authType, setAuthType] = useState('register');

  // Form data for auth inputs (name, email, phone number, password)
  const [data, setData] = useState({
    name: "",
    email: "",
    number: "",
    password: ""
  });

  // Holds currently logged-in user's data (from localStorage or API)
  const [userData, setUserData] = useState("");

  // Next.js router for programmatic navigation
  const route = useRouter();

  // Controls visibility of a PIN entry modal (e.g. for sensitive actions)
  const [pinModal, setPinModal] = useState(false);

  // Stores the user's transaction history fetched from backend
  const [transactionHistory, setTransactionHistory] = useState([]);

  // Loading state for API calls that fetch user data
  const [loading, setLoading] = useState(true);

  // User's current wallet balance
  const [userWallet, setUserWallet] = useState(0);

  // User's commission balance (if applicable)
  const [userCommision, setUserCommision] = useState(0);

  // Stores referral host ID, probably for referral tracking
  const [refHostId, setRefHostId] = useState(null);

  //Wallet funding ID state
  const [paymentId, setPaymentId] = useState('');

  // Function to open auth modal or redirect if user already logged in
  const openModal = (type) => {
    if (userData) {
      // If logged in, redirect to dashboard instead of showing modal
      route.push("/dashboard");
    }
    else {
      // Set auth modal type and open modal for user to login/register
      setAuthType(type);
      setIsModalOpen(true);

      // Reset auth form data
      setData({
        name: "",
        email: "",
        number: "",
        password: ""
      });
    }
  };

  // Effect to lock body scroll when modal is open, unlock when closed
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
    }
    else {
      document.body.style.overflow = "auto";
    }
  }, [isModalOpen]);

  // On mount, check if user data is stored in localStorage and still valid
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedData = localStorage.getItem("userData");
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        const twentyFourHours = 24 * 60 * 60 * 1000; // ms in 24 hours
        const now = new Date().getTime();

        // If stored user data expired after 24 hours, remove it
        if (now - parsedData.timestamp > twentyFourHours) {
          localStorage.removeItem("userData");
        } else {
          // Otherwise, load user data into state
          setUserData(parsedData);
        }
      }
    }
  }, []);

  // Toggle mobile menu open/close
  const toggleMenu = () => setIsOpen(!isOpen);

  // Logout user by calling backend and clearing local data
  const logoutUser = async () => {
    try {
      await axios.get("/api/auth/logout");
      toast.success("Logged out successfully");
      clearLocalStorage();
      setIsOpen(false); // close menu on logout
      window.location.reload(); // reload page to reset state
    } catch (error) {
      console.log("Logout Error:", error);
      toast.error("Something went wrong logging out");
    }
  };

  // Fetch user's real-time transaction, wallet and commission data from backend
  const getUserRealTimeData = async () => {
    setLoading(true);
    try {
       const res = await axios.get("/api/real-time-data");
      if (res.data.success) {
        setTransactionHistory(res.data.data.transactions);
        setUserWallet(res.data.data.walletBalance);
        setUserCommision(res.data.data.commisionBalance);
      }
    } catch (error) {
      console.log("ERROR:", error);
    } finally {
      setLoading(false);
    }
  };

  // Clear localStorage for user data on logout
  const clearLocalStorage = () => {
    if (typeof window !== "undefined") {
      localStorage.clear("Username"); // This only clears the "Username" key (might want to clear all userData keys?)
    }
  };

  // State to store data plans fetched from backend API
  const [dataPlan, setDataPlan] = useState([]);

  // On mount, fetch available data plans from backend API
  useEffect(() => {
    const fetchDataPlan = async () => {
      try {
        const res = await axios.get("/api/data-plan");
        if (res.data.success) {
          setDataPlan(res.data.data);
        }
      } catch (error) {
        console.log("Error:", error);
      }
    };
    fetchDataPlan();
  }, []);

  // On every render, check if referral ID stored locally is still valid and load it
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedId = localStorage.getItem("ReferralID");
      const now = new Date().getTime();
      if (storedId) {
        const parsedId = JSON.parse(storedId);
        const expiresAt = Number(parsedId.expireIn);
        if (expiresAt > now) {
          setRefHostId(parsedId.refId);
        } else {
          localStorage.removeItem("ReferralID");
        }
      }
    }
  });

  // State to store profit configuration for pricing (type and value)
  const [profitConfig, setProfitConfig] = useState({
    type: "percentage", 
    value: 3.5,          
  });

   const [electricityMerchants] = useState([
    { name: "Abuja Electricity (AEDC)", serviceID: "abuja-electric" },
    { name: "Ikeja Electricity (IKEDC)", serviceID: "ikeja-electric" },
    { name: "Eko Electricity (EKEDC)", serviceID: "eko-electric" },
    { name: "Ibadan Electricity (IBEDC)", serviceID: "ibadan-electric" },
    { name: "Jos Electricity (JED)", serviceID: "jos-electric" },
    { name: "Kaduna Electric", serviceID: "kaduna-electric" },
    { name: "Kano Electricity (KEDCO)", serviceID: "kano-electric" },
    { name: "Benin Electricity (BEDC)", serviceID: "benin-electric" },
    { name: "Enugu Electricity (EEDC)", serviceID: "enugu-electric" },
    { name: "Port Harcourt Electric (PHED)", serviceID: "portharcourt-electric" },
    { name: "Yola Electricity (YEDC)", serviceID: "yola-electric" }
  ]);

  // Provide all state and handlers via context to children components
  return (
    <AppContext.Provider
      value={{
        isOpen,
        toggleMenu,
        setIsOpen,
        isModalOpen,
        setIsModalOpen,
        authType,
        setAuthType,
        openModal,
        userData,
        data,
        setData,
        route,
        logoutUser,
        pinModal,
        setPinModal,
        getUserRealTimeData,
        transactionHistory,
        loading,
        dataPlan,
        electricityMerchants,
        userWallet,
        userCommision,
        paymentId, 
        setPaymentId,
        setRefHostId,
        refHostId,
        profitConfig,
        setProfitConfig,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

// Custom hook to easily access context in other components
export const useGlobalContext = () => {
  return useContext(AppContext);
};
