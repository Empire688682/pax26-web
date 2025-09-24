"use client";
import React from 'react'
import { useGlobalContext } from '../Context';

const AirtimeHelp = ({ data }) => {
  const {pax26} = useGlobalContext();
  return (
    <div className='backdrop-blur-md shadow-2xl rounded-2xl p-8 border border-green-100 flex flex-col justify-between gap-8'
    style={{backgroundColor:pax26.bg}}>
      {/* Help Section */}
      <div>
        <h2 className="text-xl font-bold text-green-700 mb-4">Need Help?</h2>
        <ul className="list-disc pl-5 text-sm text-gray-700 space-y-2">
          <li>Ensure your PIN is correct before proceeding.</li>
          <li>Minimum airtime amount is ₦50.</li>
          <li>Double-check the phone number before submission.</li>
          <li>Your wallet must be funded before making a purchase.</li>
        </ul>
      </div>

      {/* Transaction Summary */}
      <div>
        <h2 className="text-xl font-bold text-green-700 mb-4">Transaction Summary</h2>
        <div className="text-sm text-gray-400 space-y-2">
          <p><strong>Network:</strong> {data.network ? data.network.toUpperCase() : 'Not selected'}</p>
          <p><strong>Amount:</strong> {data.amount ? `₦${data.amount}` : 'Not entered'}</p>
          <p><strong>Phone:</strong> {data.number || 'Not entered'}</p>
        </div>
      </div>

      {/* How it Works */}
      <div>
        <h2 className="text-xl font-bold text-green-700 mb-4">How It Works</h2>
        <ol className="list-decimal pl-5 text-sm text-gray-700 space-y-2">
          <li>Select a network and enter amount.</li>
          <li>Provide the recipient’s phone number.</li>
          <li>Enter your secure 6-digit PIN.</li>
          <li>Hit "Buy Now" — and you're done!</li>
        </ol>
      </div>

      {/* Security Notice */}
      <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg text-sm text-gray-700"
      style={{backgroundColor:pax26.publicBg}}>
        🔒 <strong>Security Notice:</strong> We do not store your PIN. All transactions are encrypted for your safety.
      </div>

      {/* Support */}
      <div className="text-sm text-gray-400">
        Having issues? Contact support at <a href="mailto:info@pax26.com" className="text-green-700 font-medium underline">info@pax26.com</a>
      </div>

      {/* Optional Promo/Info */}
      <div 
      style={{backgroundColor:pax26.publicBg}}
      className="bg-green-100 text-green-800 text-xs p-3 rounded-lg text-center">
        💡 Tip: You earn cashback when you buy airtime above ₦500!
      </div>
    </div>
  )
}

export default AirtimeHelp
