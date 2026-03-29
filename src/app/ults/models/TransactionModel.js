import mongoose from "mongoose";

// ─── Reusable sub-schemas ───────────────────────────────────────────

const TransferMetaSchema = new mongoose.Schema({
  direction:       { type: String, enum: ["debit", "credit"] },
  senderName:      String,
  senderNumber:    String,
  recipientName:   String,
  recipientNumber: String,
  bankName:        { type: String, default: "Pax26" },
  accountNumber:   String,
  balanceBefore:   Number,
  balanceAfter:    Number,
}, { _id: false });

const AirtimeDataMetaSchema = new mongoose.Schema({
  network:     { type: String, enum: ["MTN", "AIRTEL", "GLO", "9MOBILE"] },
  phoneNumber: String,
  dataPlan:    String, // e.g. "1GB - 30 days" (data only)
}, { _id: false });

// Covers: electricity, tv-subscription, betting, waste-levy
const UtilityMetaSchema = new mongoose.Schema({
  provider:       String,  // e.g. "IKEDC", "DSTV", "GOtv", "Sportybet", "LAWMA"
  customerName:   String,
  accountNumber:  String,  // meter no, smartcard no, betting ID
  tokenGenerated: String,  // electricity token (if applicable)
  address:        String,
  meterType:      String,  // electricity only: "prepaid" | "postpaid"
}, { _id: false });

// Covers: WAEC, JAMB, NECO, GCE, and any future exam board
const ExamMetaSchema = new mongoose.Schema({
  board:           { type: String, enum: ["WAEC", "JAMB", "NECO", "NABTEB", "GCE"] },
  candidateNumber: String,  // registration / candidate number
  examYear:        Number,  // e.g. 2025
  examType:        String,  // e.g. "WASSCE", "BECE", "UTME", "DE", "GCE"
  subjects:        [String], // e.g. ["Mathematics", "Physics"]
  pinGenerated:    String,  // scratch-card PIN or result-checker PIN
  serialNumber:    String,  // companion serial for the PIN
}, { _id: false });

// Covers: Spectranet, Smile, ipNX, Swift, IPNX, etc.
const InternetMetaSchema = new mongoose.Schema({
  provider:    String,  // e.g. "Spectranet", "Smile", "ipNX"
  accountId:   String,  // subscriber / account ID
  plan:        String,  // e.g. "Unlimited 10 Mbps"
  dataVolume:  String,  // e.g. "100GB" (for capped plans)
  expiresAt:   Date,
}, { _id: false });

// Covers: health, auto, life, device insurance
const InsuranceMetaSchema = new mongoose.Schema({
  provider:    String,  // e.g. "AXA Mansard", "Leadway"
  policyType:  { type: String, enum: ["health", "auto", "life", "device", "travel", "other"] },
  policyNumber: String,
  insuredName:  String,
  coverageStart: Date,
  coverageEnd:   Date,
}, { _id: false });

// Covers: Itunes, Google Play, Amazon, Steam, etc.
const GiftCardMetaSchema = new mongoose.Schema({
  brand:       String,  // e.g. "iTunes", "Amazon", "Steam"
  denomination: Number, // face value in card's native currency
  cardCurrency: String, // e.g. "USD", "GBP"
  pinCode:     String,  // the redeemable PIN
  claimCode:   String,  // some brands issue a separate claim code
}, { _id: false });

// Platform / AI-automation subscriptions
const SubscriptionMetaSchema = new mongoose.Schema({
  plan:         String,  // e.g. "Pro", "Basic"
  billingCycle: { type: String, enum: ["monthly", "yearly"] },
  featureTag:   String,  // e.g. "ai-automation", "analytics"
  expiresAt:    Date,
}, { _id: false });

// Wallet / funding meta
const WalletMetaSchema = new mongoose.Schema({
  channel:     { type: String, enum: ["card", "bank-transfer", "ussd", "crypto"] },
  providerRef: String,  // Paystack / Flutterwave reference
  balanceBefore: Number,
  balanceAfter:  Number,
}, { _id: false });

// ─── Core Transaction Schema ────────────────────────────────────────

const TransactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Strict enum — add every new product type here
    type: {
      type: String,
      enum: [
        // Telecoms
        "airtime",
        "data",
        "internet",            // ISP broadband (Spectranet, Smile, etc.)

        // Wallet & transfers
        "transfer",
        "wallet-funding",

        // Utilities
        "electricity",
        "tv-subscription",     // DStv, GOtv, StarTimes, etc.
        "waste-levy",          // e.g. LAWMA, state sanitation charges

        // Exams
        "waec",                // WAEC / GCE result checker & registration
        "jamb",                // UTME / Direct Entry / JAMB mock

        // Finance & lifestyle
        "betting",
        "insurance",
        "gift-card",

        // Platform-internal subscriptions
        "ai-automation-subscription",
        "platform-subscription",
      ],
      required: true,
      index: true,
    },

    amount:    { type: Number, required: true },
    currency:  { type: String, default: "NGN" },
    fee:       { type: Number, default: 0 },     // platform's charge
    netAmount: { type: Number },                  // amount - fee (set pre-save)

    status: {
      type: String,
      enum: ["pending", "success", "failed", "reversed"],
      default: "pending",
      index: true,
    },

    reference:         { type: String, unique: true, sparse: true },
    providerReference: { type: String }, // 3rd-party provider's ref

    // Type-specific metadata — only the relevant block is populated
    meta: {
      transfer:     TransferMetaSchema,
      airtimeData:  AirtimeDataMetaSchema,   // shared by airtime + data
      utility:      UtilityMetaSchema,        // electricity, tv-subscription, betting, waste-levy
      exam:         ExamMetaSchema,           // waec, jamb
      internet:     InternetMetaSchema,       // ISP broadband
      insurance:    InsuranceMetaSchema,      // health, auto, life, etc.
      giftCard:     GiftCardMetaSchema,       // iTunes, Amazon, etc.
      subscription: SubscriptionMetaSchema,   // platform / AI subs
      wallet:       WalletMetaSchema,         // wallet-funding
    },

    // For failed / reversed transactions
    failureReason: { type: String },
    reversedAt:    { type: Date },
  },
  {
    timestamps: true,
  }
);

// ─── Model ──────────────────────────────────────────────────────────
const TransactionModel =
  mongoose.models.Transaction ||
  mongoose.model("Transaction", TransactionSchema);

export default TransactionModel;