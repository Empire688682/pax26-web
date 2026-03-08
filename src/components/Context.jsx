"use client";

/* ================================
   IMPORTS
================================ */
import React, { useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import axios from "axios";
import { toast } from "react-toastify";

/* ================================
   CONTEXT CREATION
================================ */
const AppContext = React.createContext();

/* ============================
   PROVIDER COMPONENT
================================ */
export const AppProvider = ({ children }) => {

  /* ================================
     NAVIGATION & THEME
  =================================*/
  const router = useRouter();
  const { theme } = useTheme();


  /* ================================
     UI STATES
  =================================*/
  const [isOpen, setIsOpen] = useState(false); // mobile menu
  const [authModalOpen, setAuthModalOpen] = useState(false); // login/register modal
  const [pinModal, setPinModal] = useState(false); // pin verification modal


  /* ================================
     AUTH STATES
  =================================*/
  const [authType, setAuthType] = useState("register");

  const [data, setData] = useState({
    name: "",
    email: "",
    number: "",
    password: "",
  });


  /* ================================
     USER STATES
  =================================*/
  const [userData, setUserData] = useState("");
  const [loading, setLoading] = useState(true);

  const [transactionHistory, setTransactionHistory] = useState([]);

  const [userWallet, setUserWallet] = useState(0);
  const [userCommission, setUserCommission] = useState(0);
  const [userCashBack, setUserCashBack] = useState(0);

  const [paymentId, setPaymentId] = useState("");

  const [refHostCode, setRefHostCode] = useState(null);

  const [isPaxAiBusinessTrained, setAIsPaxAiBusinessTrained] = useState(false);
  const [isWhatsappNumberConnected, setIsWhatsappNumberConnected] = useState(false);


  /* ================================
     DATA STATES
  =================================*/
  const [dataPlan, setDataPlan] = useState([]);

  const [profitConfig, setProfitConfig] = useState({
    type: "percentage",
    value: 3.5,
  });


  /* ================================
     STATIC CONFIG
  =================================*/
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
    { name: "Yola Electricity (YEDC)", serviceID: "yola-electric" },
  ]);


  /* ================================
     AUTH FUNCTIONS
  =================================*/

  // Open login/register modal
  const openModal = (type) => {
    if (userData) {
      router.push("/dashboard");
    } else {
      setAuthType(type);
      setAuthModalOpen(true);

      setData({
        name: "",
        email: "",
        number: "",
        password: "",
        provider: "credentials",
      });
    }
  };


  // Logout user
  const logoutUser = async () => {
    try {
      await axios.get("/api/auth/logout");

      clearLocalStorage();

      setIsOpen(false);
      setUserData(null);
      setTransactionHistory([]);
      setUserWallet(0);
      setUserCommission(0);

      window.location.reload();
    } catch (error) {
      console.log("Logout Error:", error);
      toast.error("Something went wrong logging out");
    }
  };


  /* ================================
     USER AUTHENTICATION CHECK
  =================================*/

  const isUserAuthenticated = () => {
    if (typeof window !== "undefined") {

      const storedData = localStorage.getItem("userData");

      if (storedData) {

        const parsedData = JSON.parse(storedData);

        const twentyFourHours = 24 * 60 * 60 * 1000;
        const now = new Date().getTime();

        if (now - parsedData.timestamp > twentyFourHours) {
          logoutUser();
        } else {
          setUserData(parsedData);
        }

      }
    }
  };


  /* ================================
     USER DATA FETCHING
  =================================*/

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

  const fetchUser = async () => {
  try {
    const res = await axios.get("/api/user/profile");
    const profile = res.data?.profile;
    console.log("profile: ", profile);
    if (profile) {
      setUserData(profile);
      setIsWhatsappNumberConnected(!!profile.whatsappConnected);
      localStorage.setItem("userData", JSON.stringify(res.data.profile));
    }
  } catch (error) {
    console.log(error);
  }
};


  /* ================================
     LOCAL STORAGE UTILS
  =================================*/

  const clearLocalStorage = () => {
    if (typeof window !== "undefined") {
      localStorage.clear("Username");
    }
  };


  /* ================================
     MENU HANDLER
  =================================*/

  const toggleMenu = () => setIsOpen(!isOpen);


  /* ================================
     EFFECTS
  =================================*/

  // Reset auth form when switching login/register
  useEffect(() => {

    setData({
      name: "",
      email: "",
      number: "",
      password: "",
    });

  }, [authType]);


  // Check stored authentication on app load
  useEffect(() => {
    isUserAuthenticated();
  }, []);


  // Redirect user if email not verified
  useEffect(() => {

    if (!userData) return;

    if (userData && !userData.userVerify) {
      router.push("/verify-user?action=verify");
    }

  }, [userData, router]);


  // Fetch available data plans
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


  // Load referral code from localStorage
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


  /* ================================
     THEME / CSS VARIABLES
  =================================*/

  const [pax26, setPax26] = useState({});

  useEffect(() => {

    const pax26 = {

      bg: theme === "light" ? "#ffffff" : "#01050f",
      secondaryBg: theme === "light" ? "#f1f5f9" : "#131b2f",
      ctBg: theme === "light" ? "#64748b" : "#01050f",
      footerBg: theme === "light" ? "#91c3f5" : "#01050f",
      publicBg: theme === "light" ? "#d4d9e0ff" : "#10172bff",
      header: theme === "light" ? "#91c3f5" : "#01050f",
      card: theme === "light" ? "#f1f5f9" : "#01050f",

      primary: theme === "light" ? "#2563eb" : "#3b82f6",

      textPrimary: theme === "light" ? "#1e293b" : "#f1f5f9",
      textSecondary: theme === "light" ? "#64748b" : "#94a3b8",

      border: theme === "light" ? "#131b2f" : "#f1f5f9",

      toTopColor: theme === "light" ? "#f1f5f9" : "#131b2f",

      btn: theme === "light" ? "#3b82f6" : "#a5bef3",
      btnHover: theme === "light" ? "#2563eb" : "#e2e6eeff",

    };

    setPax26(pax26);

  }, [theme]);


  /* ================================
     PROVIDER VALUE
  =================================*/

  return (

    <AppContext.Provider
      value={{

        isOpen,
        pax26,

        toggleMenu,
        setIsOpen,

        isUserAuthenticated,

        authModalOpen,
        setAuthModalOpen,

        authType,
        setAuthType,

        openModal,

        userData,
        setUserData,

        data,
        setData,

        router,

        logoutUser,

        pinModal,
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

        refHostCode,
        setRefHostCode,

        profitConfig,
        setProfitConfig,

        isPaxAiBusinessTrained,
        setAIsPaxAiBusinessTrained,

        isWhatsappNumberConnected, 
        setIsWhatsappNumberConnected,

        fetchUser

      }}
    >

      {children}

    </AppContext.Provider>

  );
};


/* ================================
   CUSTOM HOOK
================================ */

export const useGlobalContext = () => {
  return useContext(AppContext);
};