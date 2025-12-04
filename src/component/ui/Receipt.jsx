"use client";

import { useRef } from "react";
import * as htmlToImage from "html-to-image";
import jsPDF from "jspdf";

export default function Receipt({
  amount,
  status,
  date,
  transactionId,
  receiptType,
  metadata,
}) {
  console.log("Receipt metadata:", metadata);
  console.log("Receipt amount:", amount);
  console.log("Receipt status:", status);
  console.log("Receipt date:", date);
  console.log("Receipt transactionId:", transactionId);
  const receiptRef = useRef(null);
  const networks = {
    "01": "MTN",
    "02": "GLO",
    "03": "AIRTEL",
    "04": "9MOBILE"
  };

  // ---------------------------------------------
  // SHARE AS IMAGE
  // ---------------------------------------------
  const handleShareImage = async () => {
    try {
      const dataUrl = await htmlToImage.toPng(receiptRef.current);
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], "receipt.png", { type: "image/png" });

      if (navigator.share) {
        await navigator.share({
          title: "Pax26 Receipt",
          files: [file],
        });
      } else {
        alert("Sharing not supported on this device");
      }
    } catch (error) {
      console.log("Image share error", error);
    }
  };

  // ---------------------------------------------
  // SHARE AS PDF
  // ---------------------------------------------
  const handleSharePDF = async () => {
    try {
      const dataUrl = await htmlToImage.toPng(receiptRef.current);

      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      // Add image to PDF
      pdf.addImage(dataUrl, "PNG", 0, 0, pdfWidth, 0); // auto height

      const pdfBlob = pdf.output("blob");
      const file = new File([pdfBlob], "receipt.pdf", {
        type: "application/pdf",
      });

      if (navigator.share) {
        await navigator.share({
          title: "Pax26 Receipt PDF",
          files: [file],
        });
      } else {
        alert("PDF sharing not supported on this device");
      }
    } catch (error) {
      console.log("PDF share error", error);
    }
  };

  return (
    <div className="p-4">

      {/* Receipt container */}
      <div
        ref={receiptRef}
        className="max-w-md mx-auto bg-white shadow-lg rounded-xl p-6 border border-gray-200 relative overflow-hidden"
      >
        {/* Watermark */}
        <div className="absolute inset-0 opacity-10 pointer-events-none select-none flex items-center justify-center">
          <div className="text-7xl font-bold text-gray-700 tracking-widest -rotate-45">
            PAX26
          </div>
        </div>

        {/* Content */}
        <div className="relative z-8">
          {/* Header */}
          <div className="flex items-center justify-between mt-2 mb-4">
            <h1 className="text-2xl font-bold text-blue-700">Pax26</h1>
            <p className="text-gray-600 text-sm">Transaction Receipt</p>
          </div>

          {/* Amount */}
          <div className="text-center mb-6">
            <p className="text-3xl font-semibold text-blue-700">
              ₦{Number(amount).toLocaleString()}
            </p>
            <p className="text-lg font-medium text-gray-700">{status}</p>
            <p className="text-sm text-gray-500 mt-1">{new Date(date).toLocaleString()}</p>
          </div>

          {/* Info rows */}
          {
            // Electricity Receipt Details
            receiptType === "electricity" && (
              <div className="space-y-3 text-sm">
                <ReceiptRow title="Transaction Type" value={receiptType} />
                <ReceiptRow title="Provider" value={metadata?.network} />
                <ReceiptRow title="Meter Number" value={metadata?.number} />
                <ReceiptRow title="Customer Name" value={metadata?.customerName || "Mock name"} />
                <ReceiptRow title="Service Address" value={metadata?.address|| "Mock address NO.123."} />
                <ReceiptRow title="Meter Type" value={metadata?.meterType || "Mock prepaid"} />
                <ReceiptRow title="Units" value={`${metadata?.units || "mock 120"} kWh`} />
                <ReceiptRow title="Token" value={metadata?.token || "mock 1234567890"} highlight />
                <ReceiptRow title="Transaction ID." value={transactionId} />
              </div>
            )
          }

          {
            // Electricity Receipt Details
            (receiptType === "airtime" || receiptType === "data")  && (
              <div className="space-y-3 text-sm">
                <ReceiptRow title="Mobile Network" value={networks[metadata?.network]} />
                <ReceiptRow title="Recipient Number" value={metadata?.number} />
                <ReceiptRow title="Transaction Type" value={receiptType} />
                <ReceiptRow title="Transaction ID" value={transactionId} />
              </div>
            )
          }

          <p className="text-[11px] text-gray-500 text-center mt-6">
            Powered by Pax26 — Reliable Bills, Every Time.
          </p>
        </div>
      </div>

      {/* Buttons */}
      <div className="max-w-md mx-auto mt-5 space-y-3">
        <button
          onClick={handleShareImage}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium"
        >
          Share as Image
        </button>

        <button
          onClick={handleSharePDF}
          className="w-full bg-red-600 text-white py-3 rounded-lg font-medium"
        >
          Share as PDF
        </button>
      </div>
    </div>
  );
}

// Reusable Row Component
function ReceiptRow({ title, value, highlight }) {
  return (
    <div className="flex justify-between gap-15 border-b border-gray-200 pb-1">
      <span className="text-gray-600 text-xs">{title}</span>
      <span className={` ${highlight ? "text-blue-700 text-xs" : ""}`}>
        {value}
      </span>
    </div>
  );
}
