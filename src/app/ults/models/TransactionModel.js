import mongoose from "mongoose";

// ─── Reusable sub-schemas ───────────────────────────────────────────
const TransferMetaSchema = new mongoose.Schema({
  direction: { type: String, enum: ["debit", "credit"] },
  senderName: String,
  senderNumber: String,
  recipientName: String,
  recipientNumber: String,
  bankName: String,
  accountNumber: String,
  balanceBefore: Number,
  balanceAfter: Number,
}, { _id: false });

const AirtimeDataMetaSchema = new mongoose.Schema({
  network: { type: String, enum: ["MTN", "AIRTEL", "GLO", "9MOBILE"] },
  phoneNumber: String,
  dataPlan: String,       // e.g. "1GB - 30 days" (data only)
}, { _id: false });

const UtilityMetaSchema = new mongoose.Schema({
  provider: String,       // e.g. "IKEDC", "DSTV", "Sportybet"
  customerName: String,
  accountNumber: String,  // meter no, smartcard no, betting ID
  tokenGenerated: String, // electricity token (if applicable)
}, { _id: false });

const SubscriptionMetaSchema = new mongoose.Schema({
  plan: String,           // e.g. "Pro", "Basic"
  billingCycle: { type: String, enum: ["monthly", "yearly"] },
  featureTag: String,     // e.g. "ai-automation", "analytics"
  expiresAt: Date,
}, { _id: false });

const WalletMetaSchema = new mongoose.Schema({
  channel: { type: String, enum: ["card", "bank-transfer", "ussd", "crypto"] },
  providerRef: String,    // Paystack/Flutterwave reference
  balanceBefore: Number,
  balanceAfter: Number,
}, { _id: false });

// ─── Core Transaction Schema ────────────────────────────────────────
const TransactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      indext:true
    },

    // Strict enum — every new product type gets added here
    type: {
      type: String,
      enum: [
        "airtime",
        "data",
        "transfer",
        "wallet-funding",
        "electricity",
        "tv-subscription",
        "betting",
        "ai-automation-subscription",
        "platform-subscription",
      ],
      required: true,
      indext:true
    },

    amount: { type: Number, required: true },
    currency: { type: String, default: "NGN" },
    fee: { type: Number},       //platform's charge
    netAmount: { type: Number },             // amount - fee (set pre-save)

    status: {
      type: String,
      enum: ["pending", "success", "failed", "reversed"],
      default: "pending",
      indext:true
    },

    reference: { type: String, unique: true, sparse: true },
    providerReference: { type: String },     // 3rd-party provider's ref

    // Type-specific metadata — only the relevant block is populated
    meta: {
      transfer: TransferMetaSchema,
      airtimeData: AirtimeDataMetaSchema,    // shared by airtime + data
      utility: UtilityMetaSchema,            // electricity, tv, betting
      subscription: SubscriptionMetaSchema,
      wallet: WalletMetaSchema,
    },

    // For failed/reversed transactions
    failureReason: { type: String },
    reversedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

const TransactionModel =
  mongoose.models.Transaction ||
  mongoose.model("Transaction", TransactionSchema);

export default TransactionModel;