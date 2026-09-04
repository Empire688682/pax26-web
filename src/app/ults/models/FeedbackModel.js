import mongoose from "mongoose";

const FeedbackSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["survey", "contact"], required: true },
    user: { type: String, required: true },
    email: { type: String },
    subject: { type: String },
    text: { type: String, required: true },
    rating: { type: Number }, // For survey
    status: { type: String, enum: ["new", "read", "pending", "resolved"], default: "new" },
  },
  { timestamps: true }
);

export const FeedbackModel =
  mongoose.models.Feedback || mongoose.model("Feedback", FeedbackSchema);
