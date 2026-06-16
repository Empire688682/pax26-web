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
    number: { type: String, unique: true, sparse: true },
    profileImage: { type: String, default: "/profile-img.png" },
    authTimestamp: { type: Date, default: Date.now },

    provider: { type: String, default: "credentials" },
    providerId: { type: String, default: null },

    isAdmin: { type: Boolean, default: false },

    country: { type: String, default: null }, // e.g. "Nigeria", "Ghana", "Kenya"

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
    referralCode: { type: String, default: "", unique: true, sparse: true },
    referralHostId: { type: String, default: "" },  // legacy field — kept for compat

    // Who referred this user (ObjectId of the referrer)
    referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

    // Referral counters
    totalReferrals: { type: Number, default: 0 },       // total sign-ups via this user's code
    successfulReferrals: { type: Number, default: 0 },  // referrals who became paying subscribers

    /* ── Referral Wallet (separate from main VTU wallet) ─────────── */
    referralWalletBalance: { type: Number, default: 0 },   // spendable balance (₦)
    pendingReferralBonus: { type: Number, default: 0 },    // awaiting payment confirmation
    releasedReferralBonus: { type: Number, default: 0 },   // lifetime total credited

    // Withdrawal eligibility
    canWithdraw: { type: Boolean, default: false },
    withdrawalEligibleAt: { type: Date, default: null },   // 14-day lock from last reward

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
        type: {
          list: {
            type: [
              {
                phone: { type: String, required: true },
                status: {
                  type: String,
                  enum: ["whitelist", "blacklist", "pending"],
                  default: "whitelist"
                },
                tags: [{ type: String }],
                notes: { type: String, default: "" },
                lastMessageAt: { type: Date, default: null },
                messageCount: { type: Number, default: 0 },
                inboundCount: { type: Number, default: 0 },
                outboundCount: { type: Number, default: 0 },
                createdAt: { type: Date, default: Date.now },
                leadStage: {
                  type: String,
                  enum: ["new", "contacted", "qualified", "converted", "lost"],
                  default: "new"
                },
                leadSource: { type: String, default: "whatsapp" }, // whatsapp, website, referral
                followUpAt: { type: Date, default: null },  // scheduled follow-up date
                assignedTo: { type: String, default: null }, // which sales rep
                updatedAt: { type: Date, default: Date.now },
                _id: false
              }
            ],
            _id: false,
            default: [] // ✅ THIS is key
          },

          unknownContactPolicy: {
            type: String,
            enum: ["allow", "block", "ask"],
            default: "allow"
          },
          _id: false // prevent automatic _id generation for contacts subdocuments
        },
        default: {} // ✅ THIS ensures contacts always exists
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
      maxMonthlyMessages: { type: Number, default: 200 },
      messagesUsedThisMonth: { type: Number, default: 0 },
      broadcastContactsLimit: { type: Number, default: 0 },
      broadcastContactsUsedThisMonth: { type: Number, default: 0 },
      scheduledBroadcast: { type: Boolean, default: false },
      segmentation: { type: Boolean, default: false },
      bulkSequences: { type: Boolean, default: false },
      removeBranding: { type: Boolean, default: false },
      multiStaff: { type: Number, default: 0 },
      webhookAccess: { type: Boolean, default: false },
      plan: {
        type: String,
        enum: ["free", "starter", "business", "enterprise"],
        default: "free"
      },
      planStartedAt: { type: Date, default: Date.now }, // when the current plan period began (signup / upgrade / monthly reset)
      lastUpdated: { type: Date, default: Date.now },
    },
    /* =====================
       PLAN ANALYTICS (Profitability Tracking)
    ====================== */
    planAnalytics: {
      aiMessagesUsed: { type: Number, default: 0 }, // Total AI messages sent
      broadcastSent: { type: Number, default: 0 },  // Total broadcasts sent
      planRevenue: { type: Number, default: 0 },    // Total revenue from this user
      metaCost: { type: Number, default: 0 },       // Estimated cost from Meta (WhatsApp API)
    }
  }, { timestamps: true });

const UserModel =
  mongoose.models.User || mongoose.model("User", UserSchema);

export default UserModel;
