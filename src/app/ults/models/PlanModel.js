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
  messages:                { type: String }, // Human readable e.g. "2,000 AI messages / month"
  messagesLimit:           { type: Number, default: 0 },

  // ── WhatsApp & Broadcast ───────────────────────────────────────
  whatsappNumbersLimit:    { type: Number, default: 1 },
  broadcastContactsLimit:  { type: Number, default: null }, // null = unlimited
  bulkSequences:           { type: Boolean, default: false },
  scheduledBroadcast:      { type: Boolean, default: false },
  segmentation:            { type: Boolean, default: false },
  campaignReports:         { type: Boolean, default: false },

  // ── Storefront & Commerce ──────────────────────────────────────
  storefrontEnabled:       { type: Boolean, default: true },   // Can the user create a storefront?
  productsLimit:           { type: Number, default: 10 },      // Max products allowed (0 = unlimited)
  orderReceiptsEnabled:    { type: Boolean, default: true },   // Auto-generate WhatsApp order receipts
  salesAlertsEnabled:      { type: Boolean, default: true },   // Notify seller on new WhatsApp orders
  salesAnalyticsEnabled:   { type: Boolean, default: false },  // Access to sales analytics dashboard
  salesAnalyticsDays:      { type: Number, default: 7 },       // How many days of analytics history
  customStorefrontDomain:  { type: Boolean, default: false },  // Custom domain for storefront

  // ── AI & Automation ────────────────────────────────────────────
  aiAgentEnabled:          { type: Boolean, default: true },   // AI chatbot auto-replies
  leadFollowupEnabled:     { type: Boolean, default: false },  // Automated lead follow-up sequences
  leadQualificationEnabled:{ type: Boolean, default: false },  // AI lead qualification flows
  productRecommendations:  { type: Boolean, default: false },  // AI product recommendation in chat

  // ── Branding & Team ────────────────────────────────────────────
  multiStaff:              { type: Number, default: 0 }, // max staff inboxes, 0 = owner only
  whitelabel:              { type: Boolean, default: false },

  // ── Pricing & Billing ──────────────────────────────────────────
  extraMessagePrice:       { type: Number, default: 0 },
  referralReward:          { type: Number, default: 0 },

  // ── Display ────────────────────────────────────────────────────
  features:                [{ type: String }],
  popular:                 { type: Boolean, default: false },
  isActive:                { type: Boolean, default: true },

  // ── WhatsApp connection type this plan supports ────────────────
  connectionType: {
    type: String,
    enum: ["qr", "meta", "any"],
    default: "any",
  },

  // ── QR-specific limits (enforced backend-side) ─────────────────
  dailyMessageLimit:   { type: Number, default: 200 },
  weeklyMessageLimit:  { type: Number, default: 0 },
  banRiskThreshold:    { type: Number, default: 500 },

}, { timestamps: true });

const PlanModel = mongoose.models.Plan || mongoose.model("Plan", PlanSchema);
export default PlanModel;
