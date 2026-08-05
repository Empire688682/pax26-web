import React from 'react';

const ApiDocs = () => {
  return (
    <div className="min-h-screen px-6 py-12 bg-gray-50 text-black">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-blue-600 mb-4">Pax26 API Documentation</h1>
        <p className="text-gray-700 mb-8">
          Welcome to the Pax26 developer docs. Use the endpoints below to integrate WhatsApp automation,
          storefront management, and AI conversation features into your own applications.
        </p>

        {/* Authentication */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-400 mb-2">Authentication</h2>
          <p className="text-sm text-gray-400 mb-4">Use your API key in the header:</p>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
            {`Authorization: Bearer YOUR_API_KEY`}
          </pre>
        </section>

        {/* WhatsApp Automation */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-400 mb-2">Send WhatsApp Message</h2>
          <p className="text-sm text-gray-400 mb-4">Send a WhatsApp message to a contact via your connected number.</p>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
            {`POST /api/v1/whatsapp/send`}
          </pre>
          <p className="text-sm font-medium text-gray-700 mt-4">Request Body:</p>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
            {`{
  "to": "2348123456789",
  "message": "Hello! Your order has been confirmed.",
  "ref": "unique_message_id"
}`}
          </pre>
        </section>

        {/* Store endpoints */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-400 mb-2">Core Endpoints</h2>
          <ul className="list-disc list-inside text-sm text-gray-700 space-y-2">
            <li>Get Store Products — <code>GET /api/v1/store/products</code></li>
            <li>Create Product — <code>POST /api/v1/store/products</code></li>
            <li>Get Contacts — <code>GET /api/v1/contacts</code></li>
            <li>Get Conversations — <code>GET /api/v1/conversations</code></li>
            <li>Trigger Automation — <code>POST /api/v1/automations/trigger</code></li>
            <li>Get Analytics — <code>GET /api/v1/analytics</code></li>
          </ul>
        </section>

        <p className="text-sm text-gray-400">
          Full API reference coming soon. Contact <a href="mailto:info@pax26.com" className="text-blue-500">info@pax26.com</a> for early developer access.
        </p>
      </div>
    </div>
  );
};

export default ApiDocs;
