"use client";

import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../utils/firebase";
import { FcGoogle } from "react-icons/fc";
import axios from "axios";
import { useGlobalContext } from "../Context";
import { useState } from "react";
import LoadingSpinner from "../LoadingSpinner/LoadingSpinner";

export default function GoogleLoginButton() {
    const { refHostCode } = useGlobalContext();
    const [loading, setLoading] = useState(false)
    const handleGoogleLogin = async () => {
        setLoading(true)
        try {
            const result = await signInWithPopup(auth, provider);
            const resultData = result.user;
            const data = {
                name: resultData.displayName,
                email: resultData.email,
                providerId: resultData.providerId,
                number: resultData.phoneNumber,
                profileImage: resultData.photoURL,
                refHostCode
            }
            const response = await axios.post("/api/auth/register", data);
            const { success, message, finalUserData } = response.data;

            if (!success) {
                setError(message || "Authentication failed");
                return;
            }

            const now = new Date().getTime();
            const userDataWithTimestamp = { ...finalUserData, timestamp: now };
            localStorage.setItem("userData", JSON.stringify(userDataWithTimestamp));
            window.location.reload();
        } catch (error) {
            console.error("GoogleErr:", error);
        }finally{
            setLoading(false)
        }
    };

    return (
        <div>
            {
                loading ? 
                <LoadingSpinner/>
                :
                <>
                <div className="mt-6 flex items-center justify-between">
                <hr className="w-full border-t border-gray-500" />
                <span className="mx-2 text-gray-400 text-sm">OR</span>
                <hr className="w-full border-t border-gray-500" />
            </div>

            <button
                onClick={handleGoogleLogin}  // ✅ call the right function
                className="w-full mt-4 flex items-center justify-center gap-3 border border-gray-500 py-2 rounded-lg hover:bg-gray-100"
            >
                <FcGoogle size={22} />
                <span className="text-sm">Continue with Google</span>
            </button>
                </>
            }
        </div>
    );
}
