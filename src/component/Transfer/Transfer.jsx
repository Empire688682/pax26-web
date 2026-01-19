"use client";
import React, { useEffect, useState } from "react";
import {
    Wallet,
    User,
    Lock,
    CheckCircle,
} from "lucide-react";
import { useGlobalContext } from "../Context";
import WalletBalance from "../WalletBalance/WalletBalance";
import TransferHelp from "../TransferHelp/TransferHelp";

const Transfer = () => {
    const { pax26, userWallet, getUserRealTimeData, router } = useGlobalContext();

    const [accountNumber, setAccountNumber] = useState("");
    const [recipientName, setRecipientName] = useState("");
    const [checkingUser, setCheckingUser] = useState(false);
    const [userChecked, setUserChecked] = useState(false)
    const [amount, setAmount] = useState("");
    const [pin, setPin] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    // API simulation
    useEffect(() => {
        if (accountNumber.length < 10) {
            setRecipientName("");
            return;
        }

        const timer = setTimeout(() => {
            VerifyAccountNumber()
        }, 800);

        return () => clearTimeout(timer);
    }, [accountNumber]);

    async function VerifyAccountNumber() {
        setCheckingUser(true);
        try {
            const response = await fetch("/api/verify-recipient-number", {
                method: "POST",
                body: JSON.stringify({ recipientNumber: accountNumber }),
            })
            if (!response.ok) {
                setRecipientName("");
                setUserChecked(false);
                setCheckingUser(false);
                return;
            }
            const data = await response.json();
            console.log("data: ", data);
            setRecipientName(data?.data?.name);
            setUserChecked(true);
        } catch (error) {
            console.log("VerifyAcctNumError: ", error);
            setCheckingUser(false);
        }
        finally {
            setCheckingUser(false);
        }
    }

    const handleTransfer = async () => {
        if (!accountNumber || !amount || !pin || !recipientName) {
            alert("Please complete all fields correctly");
            return;
        };

        if (!userChecked) {
            alert("Please wait for account verification");
        }

        try {
            setLoading(true);
            const response = await fetch("/api/transfer",
                {
                    method: "POST",
                    body: JSON.stringify({ accountNumber, amount, pin, recipientName })
                }

            );

            if (!response.ok) {
                const errorData = await response.json();
                alert(errorData.message || "Transfer failed");
                setLoading(false);
                return;
            }

            const data = await response.json();
            console.log("data: ", data)
            await getUserRealTimeData();
            setSuccess(true);
            setLoading(false);
            setPin("");
            setAmount("");
            setAccountNumber("");
            setRecipientName("");
            const { transactionId } = data.data;
            router.push(`/transaction-receipt/?id=${transactionId}`);

        } catch (error) {
            console.log("TransferErr: ", error);
            setLoading(false);
        }
        finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="min-h-screen py-12 px-4"
            style={{ backgroundColor: pax26.secondaryBg }}
        >
            {/* Layout Grid */}
            <div className="grid md:grid-cols-2 grid-cols-1 gap-6 justify-start">


                <div className="flex flex-col gap-6">
                    {/* Wallet Card */}
                    <WalletBalance />
                    <div className="bg-white rounded-2xl p-5 shadow space-y-5"
                        style={{ backgroundColor: pax26.bg }}>
                        <div className='flex justify-between items-center mb-8'>
                            <h1 className="text-2xl font-bold text-center text-blue-700 tracking-tight">Transfer to Pax26 User</h1>
                        </div>
                        {/* Form data */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                                Recipient Number
                            </label>
                            <div className="flex items-center border border-gray-300 focus:ring-2 focus:ring-blue-400 gap-2 border rounded-xl px-3">
                                <User size={18} className="text-gray-400" />
                                <input
                                    inputMode="numeric"
                                    maxLength={10}
                                    value={accountNumber}
                                    onChange={(e) => {
                                        const value = e.target.value.replace(/\D/g, "")
                                        setAccountNumber(value)
                                    }}
                                    placeholder="e.g. 9154358139"
                                    className="w-full text-gray-400 focus:outline-none rounded-xl px-4 py-3"
                                />
                            </div>

                            {/* Name Preview */}
                            {checkingUser && (
                                <p className="text-xs text-gray-400 mt-1">Checking user...</p>
                            )}

                            {!checkingUser && accountNumber && recipientName && (
                                <div className="flex items-center gap-2 mt-2 text-green-600 text-sm">
                                    <CheckCircle size={16} />
                                    <span>{recipientName}</span>
                                </div>
                            )}

                            {!checkingUser && accountNumber && !recipientName && (
                                <p className="text-xs text-red-500 mt-1">
                                    User not found on Pax26
                                </p>
                            )}
                        </div>

                        {/* Amount */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Amount(Min:50)</label>
                            <input
                                type="number"
                                value={amount}
                                min="50"
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="₦50.00"
                                className="w-full text-gray-400 border border-gray-300 focus:outline-none rounded-xl px-4 py-3"
                            />
                            {Number(amount) > userWallet && (
                                <p className="text-xs text-red-500 mt-1">
                                    Insufficient wallet balance
                                </p>
                            )}
                        </div>

                        {/* Fee */}
                        <div className="flex gap-3 text-sm text-gray-500">
                            <span>Transfer Fee</span>
                            <span>₦0.00</span>
                        </div>

                        {/* PIN */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                                Transaction PIN
                            </label>
                            <div className="flex items-center border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 gap-2 border rounded-xl px-3">
                                <Lock size={18} className="text-gray-400" />
                                <input
                                    type="password"
                                    value={pin}
                                    onChange={(e) => setPin(e.target.value)}
                                    placeholder="****"
                                    maxLength={4}
                                    className="w-full text-gray-400 focus:outline-none rounded-xl px-4 py-3"
                                />
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            onClick={handleTransfer}
                            disabled={
                                loading ||
                                !recipientName ||
                                Number(amount) > userWallet
                            }
                            className="w-full py-3 rounded-xl text-white font-medium transition"
                            style={{
                                backgroundColor:
                                    loading ||
                                        !recipientName ||
                                        Number(amount) > userWallet
                                        ? "#999"
                                        : pax26.primary,
                            }}
                        >
                            {loading ? "Processing..." : "Transfer"}
                        </button>

                        {/* Success */}
                        {success && (
                            <div className="bg-green-50 text-green-700 p-3 rounded-xl text-center text-sm">
                                ✅ ₦{Number(amount).toLocaleString()} sent to {recipientName}
                            </div>
                        )}
                    </div>
                </div>
                <TransferHelp data={{ accountNumber, recipientName, amount, }} />
            </div>
        </div>
    );
};

export default Transfer;
