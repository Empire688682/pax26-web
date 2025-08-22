'use client';
import React, { useState, useEffect } from 'react';
import { LogOut, Camera, ShieldAlert, ShieldCheck, Bell, Moon, History, Pencil } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Image from 'next/image';
import { useGlobalContext } from '../Context';
import axios from "axios";
import uploadImage from '../utils/uplaodImage';

const Profile = () => {
  const [notify, setNotify] = useState(true);
  const { userData, logoutUser, setPinModal, transactionHistory, getUserRealTimeData } = useGlobalContext();
  const [userImage, setUserImage] = useState(null);
  const [processing, setProcessing] = useState(false);

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
      const response = await axios.post("/api/update-profileImage", profileImage);
      console.log("response:", response);
      if (response.data.success) {
        toast.success("Profile image updated!");
      }
    } catch (error) {
      console.log("ImageUploadError:", error);
      toast.error("Failed to update profile image.");
    }
    finally {
      setProcessing(false);
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
    avatar: '/profile-img.png'
  };

  const [pwdForm, setPwdForm] = useState({
    currentPwd: "",
    newPwd: "",
    repeatPwd: "",
  });

  const handleOnchange = (e) => {
    const { name, value } = e.target;
    setPwdForm((prev) => ({ ...prev, [name]: value }));
  }

  const [postLoading, setPostLoading] = useState(false)
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    const { currentPwd, newPwd, repeatPwd } = pwdForm;
    if (!currentPwd || !newPwd || !repeatPwd) {
      toast.error("All field required");
      return
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
        toast.success('Password updated!');
        setPwdForm({
          currentPwd: "",
          newPwd: "",
          repeatPwd: ""
        })
      }
    } catch (error) {
      console.log("PwdResetError:", error);
      toast.error(error.response.data.message)
    }
    finally {
      setPostLoading(false)
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <ToastContainer />
      <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6">
        { /* Left: Profile Overview */}
        <div className="bg-white/90 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-blue-100 flex flex-col items-center text-center">
          <div className="relative w-18 h-18 rounded-full overflow-hidden shadow-lg mb-4">
            <Image
              src={userImage? window.URL.createObjectURL(userImage) : user.avatar}
              alt="Profile"
              fill
              style={{ objectFit: "cover" }}
            />
            {
              !userImage && <label 
              htmlFor="profileImage"
              className='absolute bottom-[-3px] left-1/2 -translate-x-1/2 cursor-pointer'
              >
                <Camera size={30} />
              </label>
            }
          </div>
          <div>
            <input type="file" hidden name="profileImage" id="profileImage" onChange={(e) => setUserImage(e.target.files[0])} />
            {
              userImage && !processing && <div>
                <p 
                onClick={updateUserProfileImg}
                className="bottom-0 mx-auto w-[100px] bg-white border-1 p-2 rounded-sm text-xs cursor-pointer text-gray-900">
                  Save</p>
              </div>
            }
            {
              processing && <div>
                <p className="bottom-0 mx-auto w-[100px] bg-white border-1 p-2 rounded-sm text-xs cursor-pointer text-gray-900">
                  Saving.....</p>
              </div>
            }
          </div>
          <h2 className="text-xl font-bold text-blue-700">{user.name}</h2>
          <p className="text-sm text-gray-600">{user.email}</p>
          <p className="text-sm text-gray-600">{user.phone}</p>

          <div className="mt-3">
            {user.bvnVerified ? (
              <span className="text-green-600 flex items-center justify-center gap-2 text-sm">
                <ShieldCheck size={16} /> BVN Verified
              </span>
            ) : (
              <div className="text-red-500 flex flex-col items-center gap-1 text-sm">
                <span className="flex items-center gap-1">
                  <ShieldAlert size={16} /> BVN Not Verified
                </span>
                <button
                  onClick={() => toast.info('Comming soon...')}
                  className="bg-yellow-400 mt-2 px-3 py-1 rounded-md text-xs text-black hover:bg-yellow-500"
                >
                  Verify Now
                </button>
              </div>
            )}
          </div>

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
        <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-200 space-y-8">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">Settings</h3>
            <div className="flex items-center justify-between mb-4">
              <span className="flex items-center gap-2 text-sm text-gray-700"><Bell size={18} /> Notifications</span>
              <input
                type="checkbox"
                checked={notify}
                onChange={() => setNotify(!notify)}
                className="toggle toggle-primary"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm text-gray-700"><Moon size={18} /> Dark Mode</span>
              <button className="bg-gray-100 px-2 py-1 rounded text-xs" disabled>Coming soon</button>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">Change Password</h3>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <p className='text-sm font-bold text-center'>If not set before enter 123456789 as Current Password </p>
              <input
                onChange={handleOnchange}
                name='currentPwd'
                value={pwdForm.currentPwd}
                type="password"
                placeholder="Current Password"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
              <input
                onChange={handleOnchange}
                value={pwdForm.newPwd}
                name='newPwd'
                type="password"
                placeholder="New Password"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
              <input
                onChange={handleOnchange}
                value={pwdForm.repeatPwd}
                type="password"
                name='repeatPwd'
                placeholder="Repeat Password"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
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
        </div>

        {/* Right: Transaction History */}
        <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4 flex items-center gap-2">
            <History size={20} /> Transaction History
          </h3>
          {
            loading ? "Loading......." :
              <ul className="space-y-3 text-sm text-gray-700 max-h-72 overflow-y-auto">
                {transactionHistory.map((tx, id) => (
                  <li key={id} className="border-b pb-2 flex justify-between">
                    <div>
                      <p className="font-medium">{tx.type}</p>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>{tx.amount}</span>
                        <span>{tx.date}</span>
                      </div>
                    </div>
                    <div>
                      <p className={`${tx.status === "success" ? "text-green-600" : "text-red-500"}`}>{tx.status}</p>
                      <span>Id: {tx._id}</span>
                    </div>
                  </li>
                ))}
              </ul>
          }
        </div>
      </div>
    </div>
  );
};

export default Profile;
