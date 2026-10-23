import mongoose from "mongoose";

/**
 * BannedEmail
 * Written by admin when a user is deleted with a ban.
 * Checked on every new signup attempt — banned emails are rejected.
 */
const BannedEmailSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    userName:          { type: String, default: "" },
    reason:            { type: String, default: "Account permanently banned" },
    bannedBy:          { type: String, default: "Admin" },
    originalUserId:    { type: String, default: "" },
    bannedAt:          { type: Date,   default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.models.BannedEmail ||
  mongoose.model("BannedEmail", BannedEmailSchema);
