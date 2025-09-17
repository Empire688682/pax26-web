import React from 'react';

const ApiDocs = () => {
  return (
    <div className="min-h-screen px-6 py-12 bg-gray-50 text-black">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-blue-600 mb-4">Pax26 API Documentation</h1>
        <p className="text-gray-700 mb-8">
          Welcome to the Pax26 developer docs. Use the endpoints below to integrate airtime, data, wallet, and payment features.
        </p>

        {/* Authentication */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-400 mb-2">Authentication</h2>
          <p className="text-sm text-gray-400 mb-4">Use your API key in the header:</p>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
            {`Authorization: Bearer YOUR_API_KEY`}
          </pre>
        </section>

        {/* Sample Endpoint */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-400 mb-2">Buy Data</h2>
          <p className="text-sm text-gray-400 mb-4">Endpoint to buy data for any network.</p>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
            {`POST /api/v1/data/buy`}
          </pre>
          <p className="text-sm font-medium text-gray-700 mt-4">Request Body:</p>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
            {`{
  "network": "MTN",
  "phone": "08123456789",
  "plan": "1GB",
  "ref": "unique_transaction_id"
}`}
          </pre>
        </section>

        {/* More Endpoints Placeholder */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-400 mb-2">Other Endpoints</h2>
          <ul className="list-disc list-inside text-sm text-gray-700">
            <li>Fund Wallet - <code>POST /api/v1/wallet/fund</code></li>
            <li>Check Wallet Balance - <code>GET /api/v1/wallet/balance</code></li>
            <li>Transaction History - <code>GET /api/v1/transactions</code></li>
            <li>Verify BVN - <code>POST /api/v1/verify/bvn</code></li>
          </ul>
        </section>
      </div>
    </div>
  );
};

export default ApiDocs;
