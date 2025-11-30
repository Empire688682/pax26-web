"use client";

export default function ElectricityReceipt({
  amount,
  status,
  date,
  provider,
  meterNumber,
  customerName,
  serviceAddress,
  meterType,
  units,
  transactionNo,
  token
}) {
  const handleShare = async () => {
    const text = `
Pax26 Receipt
Amount: ₦${Number(amount).toLocaleString()}
Status: ${status}
Provider: ${provider}
Meter Number: ${meterNumber}
Customer: ${customerName}
Units: ${units} kWh
Token: ${token}
Transaction No: ${transactionNo}
Date: ${date}
    `;

    try {
      if (navigator.share) {
        await navigator.share({
          title: "Pax26 Electricity Receipt",
          text,
        });
      } else {
        alert("Sharing not supported on this device");
      }
    } catch (error) {
      console.log("Share cancelled");
    }
  };

  return (
    <div
      className="max-w-md mx-auto bg-white shadow-lg rounded-xl p-6 border border-gray-200 relative overflow-hidden"
    >
      {/* Watermark Layer */}
      <div className="absolute inset-0 opacity-10 pointer-events-none select-none flex items-center justify-center">
        <div className="text-7xl font-bold text-gray-700 tracking-widest -rotate-45">
          PAX26
        </div>
      </div>

      {/* Content Above Watermark */}
      <div className="relative z-5">

        {/* Header */}
        <div className="flex items-center justify-between mt-2 mb-4">
          <h1 className="text-2xl font-bold text-[#00A85A]">Pax26</h1>
          <p className="text-gray-600 text-sm">Transaction Receipt</p>
        </div>

        {/* Amount */}
        <div className="text-center mb-6">
          <p className="text-3xl font-semibold text-green-600">
            ₦{Number(amount).toLocaleString()}
          </p>
          <p className="text-lg font-medium text-gray-800">{status}</p>
          <p className="text-sm text-gray-500 mt-1">{date}</p>
        </div>

        {/* Details */}
        <div className="space-y-3 text-sm">
          <ReceiptRow title="Provider" value={provider} />
          <ReceiptRow title="Meter Number" value={meterNumber} />
          <ReceiptRow title="Customer Name" value={customerName} />
          <ReceiptRow title="Service Address" value={serviceAddress} />
          <ReceiptRow title="Meter Type" value={meterType} />
          <ReceiptRow title="Units Purchased" value={`${units} kWh`} />
          <ReceiptRow title="Token" value={token} highlight />
          <ReceiptRow title="Transaction No." value={transactionNo} />
        </div>

        {/* Share Button */}
        <button
          onClick={handleShare}
          className="w-full bg-[#00A85A] text-white py-3 mt-6 rounded-lg font-semibold shadow hover:bg-green-700 transition"
        >
          Share Receipt
        </button>

        {/* Footer */}
        <p className="text-[11px] text-gray-500 text-center mt-4">
          Powered by Pax26 • Secure payments & instant delivery.
        </p>
      </div>
    </div>
  );
}

function ReceiptRow({ title, value, highlight }) {
  return (
    <div className="flex justify-between border-b pb-2">
      <span className="font-medium text-gray-600">{title}</span>
      <span
        className={`text-gray-800 ${
          highlight ? "font-bold text-green-600" : ""
        }`}
      >
        {value}
      </span>
    </div>
  );
}
