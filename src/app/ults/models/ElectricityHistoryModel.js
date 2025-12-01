import mongoose from "mongoose";

const ElectricityHistorySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    meterNumber: { type: String, required: true },
    disco: { type: String, required: true },
    customerName: { type: String, required: true },
    serviceAddress: { type: String, required: true },
    meterType: { type: String, required: true },
    amount: { type: Number, required: true },
    token: { type: String, required: true },
    date: {type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.models.ElectricityHistory || mongoose.model("ElectricityHistory", ElectricityHistorySchema);