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
}, { timestamps: true });

const PlanModel = mongoose.models.Plan || mongoose.model("Plan", PlanSchema);
export default PlanModel;
