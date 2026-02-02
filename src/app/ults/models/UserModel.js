import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    /* =====================
       CORE USER INFO
    ====================== */
    name: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String, default: null },
    isPasswordSet: { type: Boolean, default: true },
    pin: { type: String, default: null },
    number: { type: String, default: "", unique: true },
    profileImage: { type: String, default: "/profile-img.png" },

    provider: { type: String, default: "credentials" },
    providerId: { type: String, default: null },

    isAdmin: { type: Boolean, default: false },

    /* =====================
       VERIFICATION
    ====================== */
    bvn: { type: String, default: "" },
    userVerify: { type: Boolean, default: false },
    verifyToken: { type: String, default: "" },
    verifyTokenExpires: { type: Date },
    forgottenPasswordToken: { type: String, default: "" },
    otpRequestimes: { type: Number, default: 0 },
    phoneVerifyToken: { type: String, default: "" },
    phoneVerifyTokenExpires: { type: Date },
    phoneVerified: { type: Boolean, default: false },

    /* =====================
       FINANCIALS
    ====================== */
    walletBalance: { type: Number, default: 0 },
    cashBackBalance: { type: Number, default: 0 },
    commissionBalance: { type: Number, default: 0 },

    bank: { type: String, default: "" },
    bankName: { type: String, default: "" },
    virtualAccount: { type: String, default: "" },

    /* =====================
       REFERRALS
    ====================== */
    referralCode: { type: String, default: "", unique: true },
    referralHostId: { type: String, default: "" },

    /* =====================
       🔥 PAX AI CORE
    ====================== */
    paxAI: {
      enabled: { type: Boolean, default: false },

      plan: {
        type: String,
        enum: ["free", "starter", "business", "enterprise"],
        default: "free",
      },

      businessProfile: {
        businessName: { type: String, default: "" },
        description: { type: String, default: "" },
        tone: {
          type: String,
          enum: ["friendly", "professional", "sales", "support"],
          default: "friendly",
        },
        fallbackMessage: {
          type: String,
          default: "A human agent will get back to you shortly.",
        },
      },

      /* =====================
         WHATSAPP
      ====================== */
      whatsapp: {
        connected: { type: Boolean, default: false },
        phoneNumberId: { type: String, default: "" },
        businessAccountId: { type: String, default: "" },
        webhookVerified: { type: Boolean, default: false },
      },

      /* =====================
         AI USAGE (💰 MONEY)
      ====================== */
      usage: {
        messagesThisMonth: { type: Number, default: 0 },
        automationsTriggered: { type: Number, default: 0 },
        lastReset: { type: Date, default: Date.now },
      },
    },
  },
  {
    timestamps: true,
  }
);

const UserModel =
  mongoose.models.User || mongoose.model("User", UserSchema);

export default UserModel;
