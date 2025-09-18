"use client";

import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../utils/firebase";
import { FcGoogle } from "react-icons/fc";
import axios from "axios";
import { useGlobalContext } from "../Context";
import { useState } from "react";

export default function GoogleLoginButton() {
  const { refHostCode, setIsModalOpen, route, setUserData, authType } = useGlobalContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const apiUrl = authType === "register"? "/api/auth/register" : "/api/auth/login"

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await signInWithPopup(auth, provider);
      const resultData = result.user;

      const data = {
        name: resultData.displayName,
        email: resultData.email,
        providerId: resultData.uid,
        number: resultData.phoneNumber,
        profileImage: resultData.photoURL,
        refHostCode,
        provider:resultData.providerData[0]?.providerId
      };

      const response = await axios.post(apiUrl, data);
      const { success, message, finalUserData } = response.data;

      if (!success) {
        setError(message || "Authentication failed");
        return;
      }

      const now = new Date().getTime();
      const userDataWithTimestamp = { ...finalUserData, timestamp: now };
      localStorage.setItem("userData", JSON.stringify(userDataWithTimestamp));

      setUserData(userDataWithTimestamp);
      route.push("/dashboard");
      setIsModalOpen(false)
    } catch (err) {
      console.error("GoogleErr:", err);
      setError(err.message || "Something went wrong with Google login.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {error && (
        <p className="text-red-600 text-sm font-medium text-center mt-2">
          ⚠️ {error}
        </p>
      )}

      <div className="mt-6 flex items-center justify-between">
        <hr className="w-full border-t border-gray-300" />
        <span className="mx-2 text-gray-400 text-sm">OR</span>
        <hr className="w-full border-t border-gray-300" />
      </div>

      <button
        onClick={handleGoogleLogin}
        disabled={loading}
        className="w-full mt-4 flex items-center justify-center gap-3 border border-gray-400 py-2 rounded-lg hover:bg-gray-100 transition-colors shadow-sm disabled:opacity-50"
      >
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span>Signing in...</span>
          </>
        ) : (
          <>
            <FcGoogle size={22} />
            <span className="text-sm">Continue with Google</span>
          </>
        )}
      </button>
    </div>
  );
}
