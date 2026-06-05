/**
 * QRUsageModel
 *
 * Tracks weekly outbound message volume for QR-connected WhatsApp numbers.
 * Used for ban-risk warnings (≥500 msgs/week) and daily limit enforcement.
 * Separate from paxAI.messagesUsedThisMonth (which tracks AI monthly quota).
 */

import mongoose from "mongoose";

const QRUsageSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // ISO week start (Monday 00:00:00 UTC) — used as the rolling window key
    weekStart: {
      type: Date,
      required: true,
      index: true,
    },

    // Total outbound automated messages sent this week via QR connection
    weeklyCount: {
      type: Number,
      default: 0,
    },

    // Today's date (YYYY-MM-DD) and count — for daily limit enforcement
    dailyDate: {
      type: String, // "2025-06-05"
      default: "",
    },
    dailyCount: {
      type: Number,
      default: 0,
    },

    // Snapshot of the plan's daily limit at record creation time
    // (refreshed on each upsert from the live plan)
    dailyLimit: {
      type: Number,
      default: 200,
    },

    // Flag: has the ban-risk warning been shown this week?
    warningShown: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Compound unique index: one record per user per week
QRUsageSchema.index({ userId: 1, weekStart: 1 }, { unique: true });

const QRUsageModel =
  mongoose.models.QRUsage || mongoose.model("QRUsage", QRUsageSchema);

export default QRUsageModel;
