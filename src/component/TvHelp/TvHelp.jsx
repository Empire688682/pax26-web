"use client";
import React from 'react';
import { useGlobalContext } from '../Context';

const TvHelp = ({ data }) => {
  const {pax26} = useGlobalContext();
  return (
    <div 
    style={{ backgroundColor: pax26.bg }}
    className='backdrop-blur-md shadow-2xl rounded-2xl p-8 border border-blue-100 flex flex-col justify-between gap-8'>
      {/* Help Section */}
      <div>
        <h2 className="text-xl font-bold text-blue-700 mb-4">Need Help?</h2>
        <ul className="list-disc pl-5 text-sm text-gray-700 space-y-2">
          <li>Ensure your PIN is correct before proceeding.</li>
          <li>Enter the correct smartcard or decoder number.</li>
          <li>Select the right provider and package for your decoder.</li>
          <li>Your wallet must be funded before making a purchase.</li>
        </ul>
      </div>

      {/* Transaction Summary */}
      <div>
        <h2 className="text-xl font-bold text-blue-700 mb-4">Transaction Summary</h2>
        <div className="text-sm text-gray-400 space-y-2">
          <p><strong>Provider:</strong> {data.provider || 'Not selected'}</p>
          <p><strong>Smartcard Number:</strong> {data.smartcardNumber || 'Not entered'}</p>
          <p><strong>Package:</strong> {data.packageCode || 'Not selected'}</p>
          <p><strong>Phone:</strong> {data.phone || 'Not entered'}</p>
        </div>
      </div>

      {/* How it Works */}
      <div>
        <h2 className="text-xl font-bold text-blue-700 mb-4">How It Works</h2>
        <ol className="list-decimal pl-5 text-sm text-gray-700 space-y-2">
          <li>Select your TV provider and package.</li>
          <li>Enter your smartcard/decoder number and phone.</li>
          <li>Enter your secure 4-digit PIN.</li>
          <li>Click "Subscribe Now" — and you're set!</li>
        </ol>
      </div>

      {/* Security Notice */}
      <div 
      style={{ backgroundColor: pax26.secondaryBg }}
      className="border-l-4 border-blue-500 p-4 rounded-lg text-sm text-gray-700">
        🔒 <strong>Security Notice:</strong> Your PIN is never stored. Transactions are securely encrypted.
      </div>

      {/* Support */}
      <div className="text-sm text-gray-400">
        Need help? Contact us at <a href="mailto:info@pax26.com" className="text-blue-700 font-medium underline">info@pax26.com</a>
      </div>

      {/* Optional Tip */}
      <div 
      style={{ backgroundColor: pax26.secondaryBg }}
      className="text-blue-800 text-xs p-3 rounded-lg text-center">
        📺 Tip: Subscribing before your due date ensures uninterrupted service!
      </div>
    </div>
  );
};

export default TvHelp;
