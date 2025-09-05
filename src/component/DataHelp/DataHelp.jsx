import React from 'react'

const DataHelp = ({ data}) => {
  return (
    <div className='bg-white/90 backdrop-blur-md shadow-2xl rounded-2xl p-8 border border-purple-200 flex flex-col justify-between gap-8'>
      {/* Help Section */}
      <div>
        <h2 className="text-xl font-bold text-green-800 mb-4">Need Help?</h2>
        <ul className="list-disc pl-5 text-sm text-gray-700 space-y-2">
          <li>Make sure your phone number is correct before purchasing data.</li>
          <li>Select the correct network that matches the recipient’s SIM.</li>
          <li>Some plans may have different data caps or validity. Choose wisely.</li>
          <li>Your wallet must be funded to process a data purchase.</li>
        </ul>
      </div>

      {/* Transaction Summary */}
      <div>
        <h2 className="text-xl font-bold text-green-800 mb-4">Transaction Summary</h2>
        <div className="text-sm text-gray-800 space-y-2">
          <p><strong>Network:</strong> {data.network ? data.network.toUpperCase() : 'Not selected'}</p>
          <p><strong>Plan:</strong> {data.plan || 'Not selected'}</p>
          <p><strong>Phone:</strong> {data.number || 'Not entered'}</p>
        </div>
      </div>

      {/* How it Works */}
      <div>
        <h2 className="text-xl font-bold text-green-800 mb-4">How It Works</h2>
        <ol className="list-decimal pl-5 text-sm text-gray-700 space-y-2">
          <li>Select a network and data plan.</li>
          <li>Enter the recipient’s phone number.</li>
          <li>Confirm your PIN and submit the request.</li>
          <li>You'll receive a confirmation once the data is delivered.</li>
        </ol>
      </div>

      {/* Security Notice */}
      <div className="bg-purple-50 border-l-4 border-green-800 p-4 rounded-lg text-sm text-gray-700">
        🔒 <strong>Security Notice:</strong> For your protection, all data transactions are encrypted and processed securely.
      </div>

      {/* Support */}
      <div className="text-sm text-gray-600">
        Having issues? Contact support at <a href="usePax26@gmail.com" className="text-green-800 font-medium underline">usePax26@gmail.com</a>
      </div>

      {/* Optional Promo */}
      <div className="bg-purple-100 text-green-800 text-xs p-3 rounded-lg text-center">
        🚀 Tip: Buy monthly plans and get bonus MBs on select networks!
      </div>
    </div>
  )
}

export default DataHelp
