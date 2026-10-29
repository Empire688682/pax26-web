/**
 * CashoutRequestModel
 *
 * Tracks every request a user makes to withdraw their referral wallet balance
 * as a real bank payment (not a transfer to main VTU wallet).
 *
 * Status flow:
 *   pending  → admin sees it in the panel, email sent
 *   paid     → admin has confirmed payment, user notified by email
 *   rejected → admin declined (e.g. insufficient verification)
 */

import mongoose from "mongoose";

const CashoutRequestSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Amount at the time of request (snapshot — balance may change later)
    amount: { type: Number, required: true },

    // User's bank details at time of request (snapshot)
    bankDetails: {
      bankName:      { type: String, default: "" },
      accountNumber: { type: String, default: "" },
      accountName:   { type: String, default: "" },
    },

    status: {
      type: String,
      enum: ["pending", "paid", "rejected"],
      default: "pending",
      index: true,
    },

    // Set by admin when marking paid or rejected
    adminNote: { type: String, default: "" },
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    processedAt: { type: Date, default: null },

    // Reference for the matching WalletTransaction debit
    walletTxId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WalletTransaction",
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.models.CashoutRequest ||
  mongoose.model("CashoutRequest", CashoutRequestSchema);
