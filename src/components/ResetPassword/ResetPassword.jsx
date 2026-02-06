"use client";
import { useState } from "react";
import styles from "./ResetPassword.module.css";
import axios from "axios";
import { useGlobalContext } from "../Context";

export default function ResetPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { setShowSignup } = useGlobalContext();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await axios.post("api/auth/forgettenPwd", { email });
      if (response.data.success) {
        alert("Password reset link sent to: " + email);
        setShowSignup(false);
      }
    } catch (error) {
      console.log("ERROR sending email:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Reset Your Password</h1>
      <form onSubmit={handleSubmit} className={styles.form}>
        <label htmlFor="email" className={styles.label}>
          Email Address:
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={styles.input}
          required
        />
        <button type="submit" className={styles.button}>
          {loading ? "Sending..." : "Send Reset Link"}
        </button>
      </form>
      <p className={styles.infoText}>
        If you don't receive the reset email within a few minutes, please check
        your spam folder or ensure that you entered the correct email address.
        For further assistance, contact our support team.
      </p>
    </div>
  );
}
