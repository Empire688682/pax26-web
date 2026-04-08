import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    /* =====================
       CORE USER INFO
    ====================== */
    name: { type: String },
    email: { type: String, required: true, unique: true, index: true },
    password: { type: String, default: null },
    isPasswordSet: { type: Boolean, default: false },
    transactionPin: { type: String, default: null },
    isTransactionPinSet: { type: Boolean, default: false },
    number: { type: String, default: "", unique: true, index: true },
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
   WHATSAPP CONFIG WHATSAPP (META)
    ===================== */
    whatsapp: {
      connected: { type: Boolean, default: false },

      accessToken: { type: String, default: "" }, // encrypted ideally
      tokenExpiresAt: { type: Date, default: null },

      wabaId: { type: String, default: "" },
      phoneNumberId: { type: String, default: "" },

      displayPhone: { type: String, default: "" },

      permissions: {
        messaging: { type: Boolean, default: false },
        management: { type: Boolean, default: false }
      },

      connectedAt: { type: Date, default: null },
      contacts: {
        list: [
          {
            phone: { type: String, required: true }, // "+234..."
            status: {
              type: String,
              enum: ["whitelist", "blacklist", "pending"],
              default: "pending"
            },
            name: { type: String, default: "" }, // optional (for UI only)
            tags: [{ type: String }], // e.g. ["VIP", "Supplier"]
            notes: { type: String, default: "" }, // free-form notes about the contact
            lastMessageAt: { type: Date, default: null }, // when they last messaged or were messaged
            createdAt: { type: Date, default: Date.now },
            updatedAt: { type: Date, default: Date.now }
          }
        ],

        unknownContactPolicy: {
          type: String,
          enum: [
            "allow",   // AI replies to everyone (default)
            "block",   // AI ignores unknown contacts
            "ask"      // AI asks user to whitelist/blacklist
          ],
          default: "allow"
        }
      }
    },

    /* =====================
       PAX AI PLAN & USAGE
    ====================== */
    paxAI: {
      enabled: { type: Boolean, default: false },
      trained: { type: Boolean, default: false },
      systemPrompt: { type: String, default: "" }, // their custom AI personality
      knowledgeBase: [{ type: String }],           // URLs or text chunks
      maxMonthlyMessages: { type: Number, default: 100 },
      messagesUsedThisMonth: { type: Number, default: 0 },
      plan: {
        type: String,
        enum: ["free", "starter", "business", "enterprise"],
        default: "free"
      },
    }
  }, { timestamps: true });

const UserModel =
  mongoose.models.User || mongoose.model("User", UserSchema);

export default UserModel;
