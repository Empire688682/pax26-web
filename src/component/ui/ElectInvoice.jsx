"use client";

import { useRef } from "react";
import * as htmlToImage from "html-to-image";
import jsPDF from "jspdf";

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
  const receiptRef = useRef(null);

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
            <p className="text-sm text-gray-500 mt-1">{date}</p>
          </div>

          {/* Info rows */}
          <div className="space-y-3 text-sm">
            <ReceiptRow title="Provider" value={provider} />
            <ReceiptRow title="Meter Number" value={meterNumber} />
            <ReceiptRow title="Customer Name" value={customerName} />
            <ReceiptRow title="Service Address" value={serviceAddress} />
            <ReceiptRow title="Meter Type" value={meterType} />
            <ReceiptRow title="Units" value={`${units} kWh`} />
            <ReceiptRow title="Token" value={token} highlight />
            <ReceiptRow title="Transaction No." value={transactionNo} />
          </div>

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
