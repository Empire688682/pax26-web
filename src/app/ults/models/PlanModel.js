import mongoose from "mongoose";

const PlanSchema = new mongoose.Schema({
  key:      { type: String, required: true, unique: true },
  label:    { type: String, required: true },
  price:    { type: Number, required: true },
  period:   { type: String, default: "month" },
  accentHex: { type: String, default: "#3b82f6" },
  tagline:  { type: String },
  messages: { type: String }, // Human readable: "500 AI messages / month"
  messagesLimit: { type: Number, default: 0 }, // Machine readable: 500 (0 = unlimited)
  extraMessagePrice: { type: Number, default: 0 },
  features: [{ type: String }],
  popular:  { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  referralReward: { type: Number, default: 0 },

  // ── WhatsApp connection type this plan supports ────────────────
  // "qr"    → QR scan (unofficial Baileys bridge, Starter tier)
  // "meta"  → Official Meta Cloud API (Growth/paid tier)
  // "any"   → Either method (legacy / admin-override)
  connectionType: {
    type: String,
    enum: ["qr", "meta", "any"],
    default: "any",
  },

  // ── QR-specific limits (enforced backend-side) ─────────────────
  // Daily outbound message limit for QR users on this plan (0 = unlimited)
  dailyMessageLimit: { type: Number, default: 200 },

  // Weekly outbound message limit for QR users — ban-risk threshold
  // When weeklyMessageLimit > 0 AND usage >= banRiskThreshold → warning triggered
  weeklyMessageLimit: { type: Number, default: 0 }, // 0 = no weekly cap

  // Weekly usage count at which a ban-risk warning is shown
  banRiskThreshold: { type: Number, default: 500 },

}, { timestamps: true });

const PlanModel = mongoose.models.Plan || mongoose.model("Plan", PlanSchema);
export default PlanModel;
