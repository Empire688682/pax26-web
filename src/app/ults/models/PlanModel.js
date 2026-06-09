import mongoose from "mongoose";

const PlanSchema = new mongoose.Schema({
  key:                     { type: String, required: true, unique: true },
  name:                    { type: String, required: true },
  label:                   { type: String }, // Keep for backward compatibility
  price:                   { type: Number, required: true },
  currency:                { type: String, default: "NGN" },
  period:                  { type: String, default: "month" },
  accentHex:               { type: String, default: "#3b82f6" },
  tagline:                 { type: String },
  messages:                { type: String }, // Human readable
  messagesLimit:           { type: Number, default: 0 },
  whatsappNumbersLimit:    { type: Number, default: 1 },
  broadcastContactsLimit:  { type: Number, default: null }, // null = unlimited
  bulkSequences:           { type: Boolean, default: false },
  scheduledBroadcast:      { type: Boolean, default: false },
  segmentation:            { type: Boolean, default: false },
  campaignReports:         { type: Boolean, default: false },
  removeBranding:          { type: Boolean, default: false },
  multiStaff:              { type: Number, default: 0 }, // max staff, 0 = no multi-staff
  webhookAccess:           { type: Boolean, default: false },
  whitelabel:              { type: Boolean, default: false },
  extraMessagePrice:       { type: Number, default: 0 },
  features:                [{ type: String }],
  popular:                 { type: Boolean, default: false },
  isActive:                { type: Boolean, default: true },
  referralReward:          { type: Number, default: 0 },

  // ── WhatsApp connection type this plan supports ────────────────
  connectionType: {
    type: String,
    enum: ["qr", "meta", "any"],
    default: "any",
  },

  // ── QR-specific limits (enforced backend-side) ─────────────────
  dailyMessageLimit: { type: Number, default: 200 },
  weeklyMessageLimit: { type: Number, default: 0 },
  banRiskThreshold: { type: Number, default: 500 },

}, { timestamps: true });

const PlanModel = mongoose.models.Plan || mongoose.model("Plan", PlanSchema);
export default PlanModel;
