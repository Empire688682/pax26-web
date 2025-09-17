import React from "react";

const GiftcardHelp = ({ data }) => {
  return (
    <div className="bg-white/90 backdrop-blur-md shadow-2xl rounded-2xl p-8 border border-purple-200 flex flex-col justify-between gap-8">
      {/* Help Section */}
      <div>
        <h2 className="text-xl font-bold text-green-800 mb-4">Need Help?</h2>
        <ul className="list-disc pl-5 text-sm text-gray-700 space-y-2">
          <li>Select the correct giftcard type before uploading.</li>
          <li>Ensure the card code and amount are accurate.</li>
          <li>Double-check the uploaded card image for clarity.</li>
          <li>Your wallet must be funded before submitting a redemption request.</li>
        </ul>
      </div>

      {/* Transaction Summary */}
      <div>
        <h2 className="text-xl font-bold text-green-800 mb-4">Transaction Summary</h2>
        <div className="text-sm text-gray-400 space-y-2">
          <p><strong>Card Type:</strong> {data.cardType || "Not selected"}</p>
          <p><strong>Amount:</strong> {data.amount ? `₦${data.amount}` : "Not entered"}</p>
          <p><strong>Card Code:</strong> {data.pin ? "••••••••" : "Not entered"}</p>
        </div>
      </div>

      {/* How it Works */}
      <div>
        <h2 className="text-xl font-bold text-green-800 mb-4">How It Works</h2>
        <ol className="list-decimal pl-5 text-sm text-gray-700 space-y-2">
          <li>Select your giftcard type (e.g., iTunes, Amazon, Steam, etc).</li>
          <li>Enter the card code, amount, and upload the card image if required.</li>
          <li>Enter your PIN and submit for review.</li>
          <li>We’ll verify and credit your wallet if successful.</li>
        </ol>
      </div>

      {/* Security Notice */}
      <div className="bg-purple-50 border-l-4 border-green-800 p-4 rounded-lg text-sm text-gray-700">
        🔒 <strong>Security Notice:</strong> Your giftcard redemption is encrypted and manually verified to prevent fraud.
      </div>

      {/* Support */}
      <div className="text-sm text-gray-400">
        Having issues? Contact support at{" "}
        <a href="mailto:usePax26@gmail.com" className="text-green-800 font-medium underline">
          usePax26@gmail.com
        </a>
      </div>

      {/* Optional Promo */}
      <div className="bg-purple-100 text-green-800 text-xs p-3 rounded-lg text-center">
        🎁 Tip: Get higher payout rates on verified physical card uploads!
      </div>
    </div>
  );
};

export default GiftcardHelp;
