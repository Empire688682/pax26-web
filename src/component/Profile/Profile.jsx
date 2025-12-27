'use client';
import React, { useState, useEffect } from 'react';
import { LogOut, CameraIcon, ShieldAlert, ShieldCheck, Bell, Moon, History, Pencil } from 'lucide-react';
import { toast} from 'react-toastify'; 
import Image from 'next/image';
import { useGlobalContext } from '../Context';
import axios from "axios";
import uploadImage from '../utils/uplaodImage';
import PasswordReset from '../PasswordReset/PasswordReset';

const Profile = () => {
  const [notify, setNotify] = useState(true);
  const { userData, setUserData, pax26, logoutUser, setPinModal, transactionHistory, getUserRealTimeData } = useGlobalContext();
  const [userImage, setUserImage] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [bvn, setBvn] = useState("");
  const [userBvn, setUserBvn] = useState(false);

  // add another loading state for BVN
  const [bvnLoading, setBvnLoading] = useState(false);

  const submityBvn = async (e) => {
    e.preventDefault();

    if (bvn.length !== 11) {
      toast.error("BVN must be exactly 11 digits");
      return;
    }

    setBvnLoading(true);
    try {
      const response = await axios.post(
        `/api/bvn`, {bvn}
      );

      if (response.data?.success) {
        toast.success("BVN Submitted successfully ✅");
        if (typeof window !== "undefined") {
          const savedData = localStorage.getItem("userData");

          if (!savedData) {
            toast.error("An error occured try again");
            return
          }
          const parseData = JSON.parse(savedData);
          parseData.bvnVerify = true;
          parseData.virtualAccount = response.data.virtualAccount;
          localStorage.setItem("userData", JSON.stringify(parseData));
          setUserData(parseData);
        }
        setUserBvn(false);
      } else {
        toast.error("Failed to verify BVN ❌");
      }

      console.log("BVN Submission response:", response.data);
    } catch (error) {
      console.log("BVN Submission Error:", error.response?.data || error.message);
      console.log("BVN Submission Error:", error);
      toast.error("Error Submit BVN. Try again.");
    } finally {
      setBvnLoading(false);
    }
  };


  const updateUserProfileImg = async () => {
    setProcessing(true);
    const profileImage = await uploadImage(userImage);
    if (!profileImage) {
      toast.error("An error occured, try again");
      setProcessing(false);
      setUserImage(null);
      return;
    }
    try {
      const response = await axios.post("/api/update-profileImage", { profileImage });
      console.log("response:", response);
      if (response.data.success) {
        if (typeof window !== "undefined") {
          const savedData = localStorage.getItem("userData");

          if (!savedData) {
            toast.error("An error occured try again");
            return
          }
          const parseData = JSON.parse(savedData);
          parseData.profileImage = profileImage;
          localStorage.setItem("userData", JSON.stringify(parseData));
          setUserData(parseData);
        }
        toast.success("Profile image updated!");
        setUserImage(profileImage);
      }
    } catch (error) {
      console.log("ImageUploadError:", error);
      toast.error("Failed to update profile image.");
    }
    finally {
      setProcessing(false);
      setUserImage(null);
    }
  }

  useEffect(() => {
    getUserRealTimeData();
    if (transactionHistory) {
      setLoading(false);
    }
  }, []);

  const [loading, setLoading] = useState(true);

  const user = {
    name: `${userData.name}` || "",
    email: `${userData.email}` || "",
    phone: `${userData.number}` || "",
    bvnVerified: userData.bvnVerify,
  };

  return (
    <div className="min-h-screen py-12 px-6"
      style={{ backgroundColor: pax26.secondaryBg }}>
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-6">
        { /* Left: Profile Overview */}
        <div className="backdrop-blur-md p-6 rounded-2xl shadow-xl flex flex-col items-center text-center"
          style={{ backgroundColor: pax26.bg }}>
          <div className="relative w-18 h-18 rounded-full overflow-hidden shadow-lg mb-2">
            <Image
              src={userImage ? window.URL.createObjectURL(userImage) : userData.profileImage || "/profile-img.png"}
              alt="Profile"
              fill
              style={{ objectFit: "cover" }}
            />
            {
              !userImage && <label
                htmlFor="profileImage"
                className='absolute bottom-[-3px] bg-gray-100 rounded-full left-1/2 -translate-x-1/2 cursor-pointer'
              >
                <CameraIcon size={30} />
              </label>
            }
          </div>
          <div>
            <input
              type="file"
              hidden
              name="profileImage"
              id="profileImage"
              accept='image/*'
              onChange={(e) => setUserImage(e.target.files[0])} />
            {
              userImage && !processing && <div>
                <p
                  onClick={updateUserProfileImg}
                  className="bottom-0 mx-auto w-[100px] bg-white border-1 p-1 rounded-sm text-xs cursor-pointer text-gray-900">
                  Save</p>
              </div>
            }
            {
              processing && <div>
                <p className="bottom-0 mx-auto w-[100px] bg-white border-1 p-1 rounded-sm text-xs cursor-pointer text-gray-900">
                  Saving.....</p>
              </div>
            }
          </div>
          <h2 className="text-xl font-bold text-blue-700">{user.name}</h2>
          <p className="text-sm text-gray-400">{user.email}</p>
          {
            user.phone && <p className="text-sm text-gray-400">{user.phone}</p>
          }

          <div className="mt-3">
            {user.bvnVerified ? (
              <span className="text-green-600 flex items-center justify-center gap-2 text-sm">
                <ShieldCheck size={16} />Email Verified
              </span>
            ) : <>
              {
                !userBvn ? <div className="text-red-500 flex flex-col items-center gap-1 text-sm">
                  <span className="flex items-center gap-1">
                    <ShieldAlert size={16} /> Email Not Verified
                  </span>
                  <button
                    onClick={() => setUserBvn(()=>alert("Coming soon"))}
                    className="bg-yellow-400 mt-2 px-3 py-1 rounded-md text-xs text-black hover:bg-yellow-500"
                  >
                    Verify Now
                  </button>
                </div>:null
              }
            </>}
          </div>

          {userBvn && (
            <form
              onSubmit={submityBvn}
              style={{ backgroundColor: pax26.secondaryBg }}
              className="w-full max-w-md mx-auto shadow-md rounded-lg p-6"
            >
              <label className="block text-sm font-medium mb-2"
                style={{ color: pax26.textPrimary }}>
                Bank Verification Number (BVN)
              </label>

              <input
                type="text"
                value={bvn}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, ""); // only numbers
                  if (val.length <= 11) setBvn(val);
                }}
                maxLength={11}
                placeholder="Enter your 11-digit BVN"
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg 
                 focus:outline-none focus:ring-2 focus:ring-blue-500 
                 focus:border-blue-500 transition"
                style={{ color: pax26.textPrimary }}
              />

              {bvn && bvn.length < 11 && (
                <p className="text-red-500 text-xs mt-1">BVN must be 11 digits</p>
              )}

              <button
                type="submit"
                disabled={bvnLoading}
                className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-lg
                 hover:bg-blue-700 disabled:opacity-50 transition"
              >
                {bvnLoading ? "Verifying..." : "Verify BVN"}
              </button>
            </form>
          )}

          <div className="mt-6 space-y-3 w-full">
            <button
              onClick={logoutUser}
              className="w-full flex items-center justify-center gap-2 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600"
            >
              <LogOut size={16} /> Logout
            </button>

            <button
              onClick={() => setPinModal(true)}
              className="w-full flex items-center justify-center gap-2 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600"
            >
              <Pencil size={16} /> Set Pin
            </button>
          </div>
        </div>

        {/* Middle: Settings & Change Password */}
        <div
          style={{ backgroundColor: pax26.bg }}
          className="p-6 rounded-2xl shadow-xl space-y-8">
          <div>
            <h3 className="text-lg font-semibold text-gray-400 border-b pb-2 mb-4"
              style={{ color: pax26.textPrimary }}>Settings</h3>
            <div className="flex items-center justify-between mb-4">
              <span className="flex items-center gap-2 text-sm"
                style={{ color: pax26.textSecondary }}><Bell size={18} /> Notifications</span>
              <input
                type="checkbox"
                checked={notify}
                onChange={() => setNotify(!notify)}
                className="toggle toggle-primary"
              />
            </div>
          </div>

          <div>
            <PasswordReset />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
