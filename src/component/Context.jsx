"use client";
import { useRouter } from 'next/navigation';
import React, { useContext, useEffect, useState } from 'react';
import axios from "axios";
import { toast } from "react-toastify";
import { useTheme } from 'next-themes';

// Create React Context for global app state
const AppContext = React.createContext();

export const AppProvider = ({ children }) => {
  // State to control mobile menu toggle
  const [isOpen, setIsOpen] = useState(false);
  const {theme} = useTheme();

  // State to control visibility of auth modal (register/login)
  const [isModalOpen, setIsModalOpen] = useState(false);

  // State to track current auth modal type: "register" or "login"
  const [authType, setAuthType] = useState('register');

  useEffect(() => {
    setData({
      name: "",
      email: "",
      number: "",
      password: "",
    });
  }, [authType])

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
  const [userCommission, setUserCommission] = useState(0);
  const [userCashBack, setUserCashBack] = useState(0);

  // Stores referral host ID, probably for referral tracking
  const [refHostCode, setRefHostCode] = useState(null);

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
        password: "",
        provider: "credentials"
      });
    }
  };

  const isUserAuthenticated = () =>{
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
  }

  // On mount, check if user data is stored in localStorage and still valid
  useEffect(() => {
    isUserAuthenticated();
  }, []);

  // Toggle mobile menu open/close
  const toggleMenu = () => setIsOpen(!isOpen);

  // Logout user by calling backend and clearing local data
  const logoutUser = async () => {
    try {
      await axios.get("/api/auth/logout");
      toast.success("Logged out successfully");
      clearLocalStorage();
      setIsOpen(false);
      route.push("/");
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
        setUserCommission(res.data.data.commissionBalance);
        setUserCashBack(res.data.data.cashBackBalance);
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
      localStorage.clear("Username");
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
      const storedId = localStorage.getItem("ReferralCode");
      const now = new Date().getTime();
      if (storedId) {
        const parsedId = JSON.parse(storedId);
        const expiresAt = Number(parsedId.expireIn);
        if (expiresAt > now) {
          setRefHostCode(parsedId.refCode);
        } else {
          localStorage.removeItem("ReferralCode");
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

 //CSS Variables
 const [pax26, setPax26] = useState({});
 useEffect(()=>{
   const pax26 = {
    bg: `${theme === 'light' ? '#ffffff' : '#01050f'}`,
    secondaryBg: `${theme === 'light' ? '#f1f5f9' : '#131b2f'}`,
    ctBg: `${theme === 'light' ? '#64748b' : '#01050f'}`,
    footerBg: `${theme === 'light' ? '#64748b' : '#01050f'}`,
    publicBg: `${theme === 'light' ? '#d4d9e0ff' : '#10172bff'}`,
    header: `${theme === 'light' ? '#f1f5f9' : '#01050f'}`,
    card: `${theme === 'light' ? '#f1f5f9' : '#01050f'}`,
    primary: theme === 'light' ? '#2563eb' : '#3b82f6',
    textPrimary: theme === 'light' ? '#1e293b' : '#f1f5f9',
    textSecondary: theme === 'light' ? '#64748b' : '#94a3b8',
    border: theme === 'light' ? '#131b2f' : '#f1f5f9',
    toTopColor: theme === 'light' ? '#f1f5f9' : '#131b2f',
    btn: theme === 'light' ? '#3b82f6' : '#2563eb',
    btnHover: theme === 'light' ? '#2563eb' : '#e2e6eeff',
  }
  setPax26(pax26);
 },[theme]);

  // Provide all state and handlers via context to children components
  return (
    <AppContext.Provider
      value={{
        isOpen,
        pax26,
        toggleMenu,
        setIsOpen,
        isUserAuthenticated,
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
        setUserData,
        setPinModal,
        getUserRealTimeData,
        transactionHistory,
        loading,
        dataPlan,
        electricityMerchants,
        userWallet,
        userCommission,
        userCashBack,
        paymentId,
        setPaymentId,
        setRefHostCode,
        refHostCode,
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
