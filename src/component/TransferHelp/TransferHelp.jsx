"use client";
import React from "react";
import { useGlobalContext } from "../Context";

const TransferHelp = ({ data }) => {
  const { pax26 } = useGlobalContext();

  return (
    <div
      className="backdrop-blur-md shadow-2xl rounded-2xl p-8 border border-green-100 flex flex-col justify-between gap-8"
      style={{ backgroundColor: pax26.bg }}
    >
      {/* Help Section */}
      <div>
        <h2 className="text-xl font-bold text-green-700 mb-4">
          Need Help?
        </h2>
        <ul className="list-disc pl-5 text-sm text-gray-700 space-y-2">
          <li>Transfers are only allowed between Pax26 users.</li>
          <li>Ensure the recipient number is correct.</li>
          <li>Your transaction PIN must be valid.</li>
          <li>Wallet balance must be sufficient before transfer.</li>
        </ul>
      </div>

      {/* Transaction Summary */}
      <div>
        <h2 className="text-xl font-bold text-green-700 mb-4">
          Transaction Summary
        </h2>
        <div className="text-sm text-gray-400 space-y-2">
          <p>
            <strong>Recipient:</strong>{" "}
            {data.recipientName || "Not found"}
          </p>
          <p>
            <strong>Account Number:</strong>{" "}
            {data.accountNumber || "Not entered"}
          </p>
          <p>
            <strong>Amount:</strong>{" "}
            {data.amount ? `₦${Number(data.amount).toLocaleString()}` : "Not entered"}
          </p>
          <p>
            <strong>Fee:</strong> ₦0.00
          </p>
        </div>
      </div>

      {/* How it Works */}
      <div>
        <h2 className="text-xl font-bold text-green-700 mb-4">
          How It Works
        </h2>
        <ol className="list-decimal pl-5 text-sm text-gray-700 space-y-2">
          <li>Enter the recipient’s Pax26 number.</li>
          <li>Confirm the recipient name preview.</li>
          <li>Enter the amount you wish to transfer.</li>
          <li>Confirm the transaction with your PIN.</li>
        </ol>
      </div>

      {/* Security Notice */}
      <div
        className="border-l-4 border-green-500 p-4 rounded-lg text-sm text-gray-700"
        style={{ backgroundColor: pax26.publicBg }}
      >
        🔒 <strong>Security Notice:</strong> Your PIN is never stored or shared.
        All transfers are processed securely and instantly.
      </div>

      {/* Support */}
      <div className="text-sm text-gray-400">
        Having issues? Contact support at{" "}
        <a
          href="mailto:info@pax26.com"
          className="text-green-700 font-medium underline"
        >
          info@pax26.com
        </a>
      </div>

      {/* Optional Info */}
      <div
        style={{ backgroundColor: pax26.publicBg }}
        className="text-green-800 text-xs p-3 rounded-lg text-center"
      >
        💡 Tip: Pax26-to-Pax26 transfers are instant and completely free.
      </div>
    </div>
  );
};

export default TransferHelp;
