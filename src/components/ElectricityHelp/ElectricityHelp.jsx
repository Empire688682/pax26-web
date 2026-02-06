"use client"
import React from 'react'
import { useGlobalContext } from '../Context'

const ElectricityHelp = ({ data}) => {
  const {pax26} = useGlobalContext();
  return (
    <div className='backdrop-blur-md shadow-2xl rounded-2xl p-8 border border-yellow-200 flex flex-col justify-between gap-8'
    style={{ backgroundColor: pax26.bg }}>
      {/* Help Section */}
      <div>
        <h2 className="text-xl font-bold text-yellow-600 mb-4">Need Help?</h2>
        <ul className="list-disc pl-5 text-sm text-gray-700 space-y-2">
          <li>Ensure the meter number is correct before payment.</li>
          <li>Select the appropriate DISCO (electricity provider) for your region.</li>
          <li>Prepaid and postpaid meters have different formats — choose correctly.</li>
          <li>Confirm wallet balance before proceeding with payment.</li>
        </ul>
      </div>

      {/* Transaction Summary */}
      <div>
        <h2 className="text-xl font-bold text-yellow-600 mb-4">Transaction Summary</h2>
        <div className="text-sm text-gray-400 space-y-2">
          <p><strong>DISCO:</strong> {data.disco || 'Not selected'}</p>
          <p><strong>Meter Number:</strong> {data.meterNumber || 'Not entered'}</p>
          <p><strong>Amount:</strong> {data.amount ? `₦${data.amount}` : 'Not entered'}</p>
          <p><strong>Meter Type:</strong> {data.meterType || 'Not selected'}</p>
        </div>
      </div>

      {/* How it Works */}
      <div>
        <h2 className="text-xl font-bold text-yellow-600 mb-4">How It Works</h2>
        <ol className="list-decimal pl-5 text-sm text-gray-700 space-y-2">
          <li>Select your electricity provider and meter type.</li>
          <li>Enter your meter number and the amount to pay.</li>
          <li>Input your wallet PIN and submit.</li>
          <li>You'll receive a token (for prepaid) or confirmation (for postpaid).</li>
        </ol>
      </div>

      {/* Security Notice */}
      <div 
      style={{ backgroundColor: pax26.secondaryBg }}
      className="border-l-4 border-yellow-500 p-4 rounded-lg text-sm text-gray-700">
        ⚡ <strong>Security Notice:</strong> All meter details and transactions are processed securely and encrypted end-to-end.
      </div>

      {/* Support */}
      <div className="text-sm text-gray-400">
        Need help? Reach us at <a href="mailto:info@pax26.com" className="text-yellow-700 font-medium underline">info@pax26.com</a>
      </div>

      {/* Optional Promo */}
      <div 
      style={{ backgroundColor: pax26.secondaryBg }}
      className=" text-yellow-800 text-xs p-3 rounded-lg text-center">
        💡 Tip: Tokens for prepaid meters are delivered instantly after payment.
      </div>
    </div>
  )
}

export default ElectricityHelp
