"use client";
import React, { useState } from 'react'
import { useGlobalContext } from '../Context';
import axios from 'axios';
import { toast,  } from 'react-toastify';

import { usePathname } from 'next/navigation';

const PasswordReset = () => {
    const { pax26, userData, setUserData } = useGlobalContext();
    const pathName = usePathname();
    const [pwdForm, setPwdForm] = useState({
        currentPwd: "",
        newPwd: "",
        repeatPwd: "",
    });
    const [postLoading, setPostLoading] = useState(false);

    const handleOnchange = (e) => {
        const { name, value } = e.target;
        setPwdForm((prev) => ({ ...prev, [name]: value }));
    }

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        const { currentPwd, newPwd, repeatPwd } = pwdForm;

        if (pathName === "/profile") {
            if (!currentPwd || !newPwd || !repeatPwd) {
                toast.error("All field required");
                return
            }
        }
        else {
            if (!newPwd || !repeatPwd) {
                toast.error("All field required");
                return
            }
        }

        if (newPwd.length < 8) {
            toast.error("Password too short");
            return
        }

        if (newPwd !== repeatPwd) {
            toast.error("Password did not match");
        };

        setPostLoading(true)
        try {
            const response = await axios.post("/api/auth/password-reset", pwdForm);
            if (response.data.success) {
                if (typeof window !== "undefined") {
                    const savedData = localStorage.getItem("userData");

                    if (!savedData) {
                        toast.error("An error occured try again");
                        return
                    }
                    const parseData = JSON.parse(savedData);
                    parseData.isPasswordSet = true;
                    localStorage.setItem("userData", JSON.stringify(parseData));
                    setUserData(parseData);
                }
                toast.success('Password updated!');
                setPwdForm({
                    currentPwd: "",
                    newPwd: "",
                    repeatPwd: ""
                });
            }
        } catch (error) {
            console.log("PwdResetError:", error);
            toast.error(error.response.data.message)
        }
        finally {
            setPostLoading(false)
        }
    };

    const title = pathName === "/profile" ? "Change Password" : "Set Your Password"

    return (
        <div>
            
            <h3 className="text-lg font-semibold text-gray-400 pb-2 mb-4">{title}</h3>
            <form onSubmit={handlePasswordChange} className="space-y-4">
                {
                    pathName === "/profile" && (
                        <input
                            onChange={handleOnchange}
                            name='currentPwd'
                            value={pwdForm.currentPwd}
                            type="password"
                            placeholder="Current Password"
                            className="w-full border placeholder-gray-400 border-gray-300 rounded-lg px-3 py-2 text-sm"
                            style={{ color: pax26.textPrimary }}
                        />
                    )
                }
                <input
                    onChange={handleOnchange}
                    value={pwdForm.newPwd}
                    name='newPwd'
                    type="password"
                    placeholder="New Password"
                    className="w-full border placeholder-gray-400 border-gray-300 rounded-lg px-3 py-2 text-sm"
                    style={{ color: pax26.textPrimary }}
                />
                <input
                    onChange={handleOnchange}
                    value={pwdForm.repeatPwd}
                    type="password"
                    name='repeatPwd'
                    placeholder="Repeat Password"
                    className="w-full border placeholder-gray-400 border-gray-300 rounded-lg px-3 py-2 text-sm"
                    style={{ color: pax26.textPrimary }}
                />
                <button
                    type="submit"
                    className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 text-sm"
                >
                    {
                        postLoading ? "Updating....." : "Update Password"
                    }
                </button>
            </form>
        </div>
    )
}

export default PasswordReset
