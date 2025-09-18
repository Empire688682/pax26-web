'use client';

import { X } from 'lucide-react';
import { useGlobalContext } from '../Context';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import GoogleLoginButton from '../GoogleSignUp/googleSignUp';

export default function SignupPage() {
    const {
        isModalOpen,
        setIsModalOpen,
        authType,
        setAuthType,
        openModal,
        setUserData,
        route,
        data,
        setData,
        refHostCode } = useGlobalContext();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("")

    const handleOnchange = (e) => {
        const { name, value } = e.target;
        setData((prev) => ({ ...prev, [name]: value }));
    }

    const baseUrl = authType === "login" ? "/api/auth/login" : authType === "register" ? "/api/auth/register": ""
    const userAuthHandler = async (e) => {
        if(authType === "reset password"){
           handlePasswordReset();
           return;
        }
        setLoading(true);
        try {
            const response = await axios.post(baseUrl, { ...data, refHostCode });
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
            setData({
                name: "",
                email: "",
                number: "",
                password: "",
                provider: "credentials"
            });
            setIsModalOpen(false);
        } catch (error) {
            console.error("Auth Error:", error);
            setError(error?.response?.data?.message);
        }
        finally {
            setLoading(false)
        }
    }

    const handleFormSubmission = (e) => {
        e.preventDefault();
        userAuthHandler();
    }

    useEffect(() => {
        setTimeout(() => {
            setError("");
        }, 3000);
    }, [error]);

    const handlePasswordReset = async () => {
        try {
          setLoading(true);
          const response = await axios.post("api/auth/forgottenPwd", { email:data.email });
          console.log("response:", response)
          if (response.data.success) {
            console.log("response:", response)
            toast.success("Password reset link sent to: " + data.email);
            setInterval(()=>{
                setIsModalOpen(false);
            },5000);
          }
        } catch (error) {
          toast.error("Error sending email to: " + data.email);
          console.log("ERROR sending email:", error);
        } finally {
          setLoading(false);
        }
      };

    return (
        <div className="min-h-screen absolute w-full flex items-center justify-center text-black px-4">
        <ToastContainer />
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center px-6 z-70">
                    <div className="bg-white rounded-xl shadow-lg w-full md:max-w-md max-w:[300px] p-8 relative">
                        <button
                            className="absolute top-4 right-4 text-gray-400 hover:text-red-500"
                            onClick={() => setIsModalOpen(false)}
                        >
                            <X size={24} />
                        </button>

                        <h2 className="text-2xl font-bold mb-4 text-blue-600">
                            {authType === 'register'
                                ? 'Create Account'
                                : authType === 'login'
                                    ? 'Login to Pax26'
                                    : authType === 'reset password'
                                        ? 'Reset Password'
                                        : ''
                            }
                        </h2>

                        <form onSubmit={handleFormSubmission} className="space-y-4">
                            {authType === 'register' && (
                                <input
                                    onChange={handleOnchange}
                                    value={data.name}
                                    name="name"
                                    type="text"
                                    required
                                    placeholder="Full Name"
                                    className="w-full border rounded-lg outline-none border-gray-500 px-4 py-2"
                                />
                            )}
                            <input
                                onChange={handleOnchange}
                                value={data.email}
                                name="email"
                                type="email"
                                required
                                placeholder="Email"
                                className="w-full border rounded-lg outline-none border-gray-500 px-4 py-2"
                            />
                            {
                                authType === "register" &&
                                <input
                                    onChange={handleOnchange}
                                    value={data.number}
                                    name="number"
                                    type="tel"
                                    required
                                    placeholder="Phone"
                                    className="w-full border rounded-lg outline-none border-gray-500 px-4 py-2"
                                />
                            }
                            {
                                authType !== "reset password" && (
                                    <input
                                        onChange={handleOnchange}
                                        value={data.password}
                                        name="password"
                                        type="password"
                                        required
                                        placeholder="Password"
                                        className="w-full border rounded-lg outline-none border-gray-500 px-4 py-2"
                                    />
                                )
                            }
                            {
                                error && <p className='text-red-600 text-center'>
                                    {error}
                                </p>
                            }

                            {authType === 'login' && (
                                <p onClick={() => setAuthType("reset password")} className='cursor-pointer underline text-center'>Forgot Password</p>
                            )}

                            <button
                                disabled={loading}
                                type="submit"
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold"
                            >
                                {
                                    loading ? "Processing"
                                        :
                                        <p className='capitalize'>
                                            {authType}
                                        </p>
                                }
                            </button>
                            {
                                authType === 'register' && <p className='text-center'>Already have an account? <span onClick={() => openModal("login")} className='text-blue-600 underline cursor-pointer'>Login</span></p>
                            }
                            {
                                authType === 'login' && <p className='text-center'>Don't have an account? <span onClick={() => openModal("register")} className='text-blue-600 underline cursor-pointer'>Register</span></p>
                            }
                        </form>
                        
                        {
                            authType !== "reset password" &&  (
                                <GoogleLoginButton />
                            )
                        }

                    </div>
                </div>
            )}
        </div>
    );
}
