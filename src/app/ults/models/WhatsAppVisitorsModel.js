// app/ults/models/WhatsAppVisitorsModel.js
import mongoose from "mongoose";

const VisitorsSchema = new mongoose.Schema(
  {
    number: { type: String, required: true, unique: true, index: true },
    lastTimeMessage: { type: Date, default: null },
    messagesSent: {type: Number, default:0},
    isNowUser: { type: Boolean, default: false },
    status: { type: String, enum: ["user", "visitor"], default: "visitor" },
  },
  { timestamps: true }
);

export default mongoose.models.Visitors ||
  mongoose.model("Visitors", VisitorsSchema);
