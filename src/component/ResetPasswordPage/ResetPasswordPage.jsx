"use client";
import React, { useEffect, useState } from "react";
import styles from "./ResetPasswordPage.module.css";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import { useGlobalContext } from "../Context";
import { toast,  } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ResetPasswordPage = () => {
  const{setIsModalOpen, setAuthType, route} =useGlobalContext();
  const searchParams = useSearchParams();
  const token = searchParams.get("Emailtoken");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    password: "",
    confirmPassword: "",
  });

  const handleOnchange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

 const resetPassword = async () => {
  try {
    setLoading(true);
    const response = await axios.post("/api/auth/resetForgottenPassword", {
      password: data.password,
      confirmPassword: data.confirmPassword,
      token: token,
    });

    console.log("response:", response);

    if (response.data.success) {
      toast.success("Password changed please login");
      setData({ 
        password: "", 
        confirmPassword: "" 
      });
      setIsModalOpen(true);
      setAuthType("login");
    }
  } catch (error) {
    console.log("Error resetingPwd:", error);
    toast.error(error.response?.data?.message || "Something went wrong");
  } finally {
    setLoading(false);
  }
};

  function handleFormSubmission(e) {
    e.preventDefault();
    if (data.password.length < 8) {
      toast.error("Password too short");
      return;
    }
    if (data.password !== data.confirmPassword) {
      toast.error("Password did not match");
      return;
    }
    resetPassword();
  };

  useEffect(()=>{
    if(!token){
      router.push("/dashboard");
    }
  }, []);

  return (
    <div className={styles.resetPassword }>
      
        <div className={styles.card}>
          <h2 className={styles.title}>Reset Your Password</h2>
          <p className={styles.subtitle}>
            Please enter your new password below.
          </p>
          <form className={styles.form} onSubmit={handleFormSubmission}>
            <label htmlFor="password" className={styles.label}>
              New Password
            </label>
            <input
              type="password"
              name="password"
              className={styles.input}
              onChange={handleOnchange}
              placeholder="Enter new password"
              required
              value={data.password}
            />
            <label htmlFor="confirmPassword" className={styles.label}>
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              onChange={handleOnchange}
              className={styles.input}
              placeholder="Confirm new password"
              required
              value={data.confirmPassword}
            />
            <button disabled={loading} type="submit" className={styles.button}>
              {loading ? "Loading..." : "Reset Password"}
            </button>
          </form>
        </div>
    </div>
  );
};

export default ResetPasswordPage;
