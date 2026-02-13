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
    forgottenPasswordToken: { type: String, default: "" },
    emailVerification: {
      isVerified: { type: Boolean, default: false },
      requestCount: { type: Number, default: 0 },
      firstRequestAt: { type: Date, default: null },
      token: { type: String },
      expiresAt: { type: Date }
    },
    phoneVerification: {
      isVerified: { type: Boolean, default: false },
      requestCount: { type: Number, default: 0 },
      firstRequestAt: { type: Date, default: null },
      token: { type: String },
      expiresAt: { type: Date },
      incomingNumber: { type: Date, default: null }
    },

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
       WHATSAPP CONFIG
    ====================== */
    whatsappNumber: {
      type: String,
      default: "",
      unique: true, // no two users can have same WhatsApp number
      index: true   // fast lookup
    },
    whatsappConnected: { type: Boolean, default: false },
    whatsappWebhookVerified: { type: Boolean, default: false },

    /* =====================
       PAX AI PLAN & USAGE
    ====================== */
    paxAI: {
      enabled: { type: Boolean, default: false },
      plan: {
        type: String,
        enum: ["free", "starter", "business", "enterprise"],
        default: "free"
      },
      businessProfile: {
        businessName: { type: String, default: "" },
        description: { type: String, default: "" },
        tone: {
          type: String,
          enum: ["friendly", "professional", "sales", "support"],
          default: "friendly"
        },
        fallbackMessage: {
          type: String,
          default: "A human agent will get back to you shortly."
        }
      },
      usage: {
        messagesThisMonth: { type: Number, default: 0 },
        automationsTriggered: { type: Number, default: 0 },
        lastReset: { type: Date, default: Date.now }
      }
    }
  }, { timestamps: true });

UserSchema.index({ whatsappNumber: 1 }, { unique: true });
UserSchema.index({ number: 1 }, { unique: true });
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ referralCode: 1 }, { unique: true });

const UserModel =
  mongoose.models.User || mongoose.model("User", UserSchema);

export default UserModel;
