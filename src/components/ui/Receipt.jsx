"use client";

import { useRef, useState } from "react";
import * as htmlToImage from "html-to-image";
import jsPDF from "jspdf";
import {
  Share2, FileDown, CheckCircle2, Zap, Wifi,
  Bolt, Smartphone, Wallet, ArrowLeftRight,
} from "lucide-react";
import { useGlobalContext } from "../Context";

/* ── Keyframes + font ─────────────────────────────────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Syne:wght@600;700;800&display=swap');

  .rc-root { font-family: 'Syne', sans-serif; }
  .rc-mono { font-family: 'DM Mono', monospace; }

  @keyframes rc-slide {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes rc-spin { to { transform: rotate(360deg); } }
  @keyframes rc-check {
    0%   { transform: scale(0) rotate(-45deg); opacity: 0; }
    60%  { transform: scale(1.2) rotate(5deg); opacity: 1; }
    100% { transform: scale(1) rotate(0deg); }
  }

  .rc-s1   { animation: rc-slide 0.4s ease both; }
  .rc-s2   { animation: rc-slide 0.4s ease 0.08s both; }
  .rc-spin { animation: rc-spin 0.8s linear infinite; }
  .rc-check{ animation: rc-check 0.45s cubic-bezier(0.22,1,0.36,1) both; }

  .rc-btn { transition: opacity 0.15s ease, transform 0.15s ease; }
  .rc-btn:hover:not(:disabled) { opacity: 0.87; transform: translateY(-1px); }
  .rc-btn:disabled { opacity: 0.5; cursor: not-allowed; }

  /* receipt-specific (white bg for PDF capture) */
  .rc-paper {
    background: #ffffff;
    font-family: 'Syne', sans-serif;
  }

  /* perforated edge */
  .rc-perforated {
    position: relative;
    height: 20px;
  }
  .rc-perforated::before, .rc-perforated::after {
    content: '';
    position: absolute;
    top: 50%;
    width: 20px; height: 20px;
    border-radius: 50%;
    background: #f1f5f9;
    transform: translateY(-50%);
  }
  .rc-perforated::before { left: -10px; }
  .rc-perforated::after  { right: -10px; }
`;

/* ── Networks map ─────────────────────────────────────────────── */
const NETWORKS = { "01": "MTN", "02": "Glo", "03": "9Mobile", "04": "Airtel" };

/* ── Receipt type config ──────────────────────────────────────── */
const TYPE_CONFIG = {
  airtime: { icon: <Smartphone size={18} />, color: "#f97316", label: "Airtime" },
  data: { icon: <Wifi size={18} />, color: "#38bdf8", label: "Data" },
  electricity: { icon: <Zap size={18} />, color: "#fbbf24", label: "Electricity" },
  transfer: { icon: <ArrowLeftRight size={18} />, color: "#a78bfa", label: "Transfer" },
  "wallet funding": { icon: <Wallet size={18} />, color: "#22c55e", label: "Wallet Funding" },
};

/* ── Row helpers ──────────────────────────────────────────────── */
function Row({ label, value, highlight, mono }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5"
      style={{ borderBottom: "1px solid #f1f5f9" }}>
      <span style={{ color: "#6b7280", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", flexShrink: 0 }}>
        {label}
      </span>
      <span className={mono ? "rc-mono" : ""}
        style={{
          color: highlight ? "#2563eb" : "#111827",
          fontSize: "12px", fontWeight: highlight ? 700 : 500,
          textAlign: "right", wordBreak: "break-all", maxWidth: "60%",
        }}>
        {value || "—"}
      </span>
    </div>
  );
}

function DoubleRow({ label, top, bottom }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5"
      style={{ borderBottom: "1px solid #f1f5f9" }}>
      <span style={{ color: "#6b7280", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", flexShrink: 0 }}>
        {label}
      </span>
      <div style={{ textAlign: "right", maxWidth: "60%" }}>
        <p style={{ color: "#111827", fontSize: "12px", fontWeight: 700 }}>{top || "—"}</p>
        <p style={{ color: "#6b7280", fontSize: "11px" }}>{bottom ? `Pax26 | ${bottom}` : "—"}</p>
      </div>
    </div>
  );
}

/* ── Main component ───────────────────────────────────────────── */
export default function Receipt({ amount, status, date, transactionId, receiptType, meta }) {
  const { pax26 } = useGlobalContext();
  const receiptRef = useRef(null);
  const [sharingImg, setSharingImg] = useState(false);
  const [sharingPdf, setSharingPdf] = useState(false);
  const [imgDone, setImgDone] = useState(false);
  const [pdfDone, setPdfDone] = useState(false);

  const primary = pax26?.primary || "#3b82f6";
  const cfg = TYPE_CONFIG[receiptType] || { icon: <Wallet size={18} />, color: primary, label: receiptType };
  const isSuccess = status?.toLowerCase() === "success" || status?.toLowerCase() === "successful";

  /* ── Share as image ── */
  const handleShareImage = async () => {
    setSharingImg(true);
    try {
      const dataUrl = await htmlToImage.toPng(receiptRef.current, { pixelRatio: 2 });
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], "pax26-receipt.png", { type: "image/png" });
      if (navigator.share) {
        await navigator.share({ title: "Pax26 Receipt", files: [file] });
      } else {
        const link = document.createElement("a");
        link.href = dataUrl; link.download = "pax26-receipt.png"; link.click();
      }
      setImgDone(true); setTimeout(() => setImgDone(false), 2500);
    } catch (err) { console.log("Image share error", err); }
    finally { setSharingImg(false); }
  };

  /* ── Share as PDF ── */
  const handleSharePDF = async () => {
    setSharingPdf(true);
    try {
      const dataUrl = await htmlToImage.toPng(receiptRef.current, { pixelRatio: 2 });
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      pdf.addImage(dataUrl, "PNG", 0, 0, pdfWidth, 0);
      const pdfBlob = pdf.output("blob");
      const file = new File([pdfBlob], "pax26-receipt.pdf", { type: "application/pdf" });
      if (navigator.share) {
        await navigator.share({ title: "Pax26 Receipt PDF", files: [file] });
      } else {
        pdf.save("pax26-receipt.pdf");
      }
      setPdfDone(true); setTimeout(() => setPdfDone(false), 2500);
    } catch (err) { console.log("PDF share error", err); }
    finally { setSharingPdf(false); }
  };

  return (
    <>
      <style>{CSS}</style>
      <div className="rc-root min-h-screen px-4 py-10" style={{ background: pax26?.secondaryBg }}>
        <div className="max-w-md mx-auto space-y-5">

          {/* ── Page header ─────────────────────────────── */}
          <div className="rc-s1">
            <div className="flex items-center gap-2 mb-2">
              <span className="rc-mono text-[10px] font-medium uppercase tracking-widest"
                style={{ color: pax26?.textSecondary, opacity: 0.4 }}>Pax26</span>
              <div className="h-px flex-1" style={{ background: pax26?.border }} />
            </div>
            <h1 className="text-2xl font-extrabold" style={{ color: pax26?.textPrimary }}>
              Transaction Receipt
            </h1>
            <p className="text-sm" style={{ color: pax26?.textSecondary, opacity: 0.55 }}>
              {new Date(date).toLocaleString("en-NG", { dateStyle: "full", timeStyle: "short" })}
            </p>
          </div>

          {/* ── Printable receipt card ───────────────────── */}
          <div ref={receiptRef}
            className="rc-s2 rc-paper rounded-2xl overflow-hidden shadow-lg"
            style={{ border: "1px solid #e2e8f0" }}>

            {/* coloured top strip */}
            <div style={{ height: "4px", background: `linear-gradient(90deg, ${cfg.color}, ${cfg.color}66, #e2e8f0)` }} />

            {/* header */}
            <div style={{ padding: "24px 24px 20px", borderBottom: "1px solid #f1f5f9" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div style={{ width: "32px", height: "32px", borderRadius: "10px", background: "#3b82f6", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Zap size={16} color="#fff" />
                  </div>
                  <span style={{ fontFamily: "'Syne', sans-serif", fontSize: "18px", fontWeight: 800, color: "#111827" }}>Pax26</span>
                </div>
                <div style={{
                  display: "flex", alignItems: "center", gap: "6px", padding: "4px 10px", borderRadius: "20px",
                  background: isSuccess ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
                  border: `1px solid ${isSuccess ? "rgba(34,197,94,0.25)" : "rgba(239,68,68,0.25)"}`
                }}>
                  <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: isSuccess ? "#22c55e" : "#ef4444" }} />
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "10px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: isSuccess ? "#22c55e" : "#ef4444" }}>
                    {status}
                  </span>
                </div>
              </div>

              {/* amount hero */}
              <div style={{ textAlign: "center" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", marginBottom: "8px" }}>
                  <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: `${cfg.color}18`, display: "flex", alignItems: "center", justifyContent: "center", color: cfg.color }}>
                    {cfg.icon}
                  </div>
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#9ca3af" }}>
                    {cfg.label}
                  </span>
                </div>
                <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "36px", fontWeight: 700, color: "#111827", letterSpacing: "-0.02em", lineHeight: 1 }}>
                  ₦{Number(amount).toLocaleString("en-NG", { minimumFractionDigits: 2 })}
                </p>
                {isSuccess && (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "5px", marginTop: "8px" }}>
                    <CheckCircle2 size={14} color="#22c55e" />
                    <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "11px", color: "#22c55e", fontWeight: 600 }}>
                      Payment Successful
                    </span>
                  </div>
                )}
                <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "11px", color: "#9ca3af", marginTop: "10px", textAlign: "center" }}>
                  {new Date(date).toLocaleDateString("en-NG", { day: "2-digit", month: "short", year: "numeric" })}
                  {" · "}
                  {new Date(date).toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit", hour12: true })}
                </p>
              </div>
            </div>

            {/* perforated divider */}
            <div style={{ position: "relative", height: "20px", background: "#f8fafc" }}>
              <div style={{ position: "absolute", top: "50%", left: "-10px", width: "20px", height: "20px", borderRadius: "50%", background: "#f1f5f9", transform: "translateY(-50%)" }} />
              <div style={{ position: "absolute", top: "50%", right: "-10px", width: "20px", height: "20px", borderRadius: "50%", background: "#f1f5f9", transform: "translateY(-50%)" }} />
              <div style={{ position: "absolute", top: "50%", left: "10px", right: "10px", borderBottom: "1.5px dashed #e2e8f0", transform: "translateY(-50%)" }} />
            </div>

            {/* detail rows */}
            <div style={{ padding: "12px 24px 20px" }}>

              {/* Transfer */}
              {receiptType === "transfer" && (<>
                <Row label="Type" value={receiptType} />
                <DoubleRow label="Recipient" top={meta?.transfer?.recipientName} bottom={meta?.transfer?.recipientNumber} />
                <DoubleRow label="Sender" top={meta?.transfer?.senderName} bottom={meta?.transfer?.senderNumber} />
                <Row label="Transaction ID" value={transactionId} mono />
              </>)}

              {/* Electricity */}
              {receiptType === "electricity" && (<>
                <Row label="Type" value={receiptType} />
                <Row label="Provider" value={meta?.utility?.provider} />
                <Row label="Meter Number" value={meta?.utility?.accountNumber} mono />
                <Row label="Customer" value={meta?.utility?.customerName} />
                <Row label="Address" value={meta?.utility?.address} />
                <Row label="Meter Type" value={meta?.utility?.meterType} />
                <Row label="Units" value={`${meta?.utility?.units || "—"} kWh`} />
                <Row label="Token" value={meta?.utility?.tokenGenerated} highlight mono />
                <Row label="Transaction ID" value={transactionId} mono />
              </>)}

              {/* Tv subscription */}
              {receiptType === "tv-subscription" && (<>
                <Row label="Type" value={receiptType} />
                <Row label="Provider" value={meta?.utility?.provider} />
                <Row label="Package" value={meta?.utility?.package} />
                <Row label="Smartcard no" value={meta?.utility?.accountNumber} mono />
                <Row label="Customer Name" value={meta?.utility?.customerName} />
                <Row label="Transaction ID" value={transactionId} mono />
              </>)}

              {/* Airtime / Data */}
              {(receiptType === "airtime" || receiptType === "data") && (<>
                <Row label="Network" value={NETWORKS[meta?.airtimeData?.network]} />
                <Row label="Recipient" value={meta?.airtimeData?.phoneNumber} mono />
                <Row label="Type" value={receiptType} />
                <Row label="Transaction ID" value={transactionId} mono />
              </>)}

              {/* Wallet funding */}
              {receiptType === "wallet-funding" && (<>
                <Row label="Type" value={receiptType} />
                <Row label="Channel" value={meta?.wallet?.channel} />
                <Row label="Ref" value={meta?.wallet?.providerRef} />
                <Row label="Transaction ID" value={transactionId} mono />
              </>)}

              {/* footer note */}
              <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "10px", color: "#9ca3af", textAlign: "center", marginTop: "20px", letterSpacing: "0.04em" }}>
                Powered by Pax26 · Reliable Bills, Every Time.
              </p>
            </div>

            {/* watermark */}
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none", userSelect: "none", opacity: 0.04, zIndex: 0 }}>
              <span style={{ fontSize: "80px", fontWeight: 900, color: "#1e40af", transform: "rotate(-30deg)", letterSpacing: "0.1em" }}>PAX26</span>
            </div>
          </div>

          {/* ── Action buttons ───────────────────────────── */}
          <div className="rc-s2 grid grid-cols-2 gap-3">
            <button
              onClick={handleShareImage}
              disabled={sharingImg}
              className="rc-btn flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-bold text-white"
              style={{
                background: imgDone ? "#22c55e" : primary,
                boxShadow: sharingImg ? "none" : `0 8px 24px ${imgDone ? "rgba(34,197,94,0.35)" : primary + "38"}`,
              }}>
              {sharingImg
                ? <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white rc-spin" />
                : imgDone
                  ? <><CheckCircle2 size={15} className="rc-check" /> Shared!</>
                  : <><Share2 size={15} /> Share Image</>
              }
            </button>

            <button
              onClick={handleSharePDF}
              disabled={sharingPdf}
              className="rc-btn flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-bold"
              style={{
                background: pdfDone ? "rgba(34,197,94,0.1)" : pax26?.bg,
                color: pdfDone ? "#22c55e" : pax26?.textPrimary,
                border: `1px solid ${pdfDone ? "rgba(34,197,94,0.3)" : pax26?.border}`,
                boxShadow: sharingPdf ? "none" : "none",
              }}>
              {sharingPdf
                ? <div className="w-4 h-4 rounded-full border-2 border-t-transparent rc-spin"
                  style={{ borderColor: `${pax26?.border}`, borderTopColor: pax26?.primary }} />
                : pdfDone
                  ? <><CheckCircle2 size={15} /> Saved!</>
                  : <><FileDown size={15} /> Save PDF</>
              }
            </button>
          </div>

          {/* ── Transaction ID chip ──────────────────────── */}
          <div className="rc-s2 flex items-center gap-2 justify-center">
            <p className="rc-mono text-[10px]" style={{ color: pax26?.textSecondary, opacity: 0.4 }}>
              TXN ID · {transactionId}
            </p>
          </div>

        </div>
      </div>
    </>
  );
}