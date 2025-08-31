import mongoose from "mongoose";

const TransactionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    type: { type: String, required: true },
    amount: { type: Number, required: true },
    status: { type: String, enum: ["pending", "success", "failed"], default: "pending" },
    transactionId: { type: String, required: true, unique: true },

    reference: { type: String, unique: true, sparse: true },
    metadata: {
      network: { type: String },
      number: { type: String },
    },
  },
  {
    timestamps: true,
  }
);

const TransactionModel = mongoose.models.Transaction || mongoose.model("Transaction", TransactionSchema);

export default TransactionModel;
