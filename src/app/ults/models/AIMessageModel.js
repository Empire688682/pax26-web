import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
  messageId: { type: String, unique: true, required: true },

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  platform: {
    type: String,
    enum: ["whatsapp", "web", "sms"],
    default: "whatsapp"
  },

  phoneNumberId: String,
  providerMessageId: String,

  from: { type: String, required: true },
  to: String,

  text: { type: String, required: true },

  direction: {
    type: String,
    enum: ["inbound", "outbound"],
    required: true
  },

  senderType: {
    type: String,
    enum: ["user", "ai", "admin"],
    default: "user"
  },

  status: {
    type: String,
    enum: ["received", "processing", "sent", "failed"],
    default: "received"
  },

  automation: {
    isAutoReply: Boolean,
    workflowId: String,
    followUpAt: Date
  },

  sessionId: String,

  aiMeta: {
    model: String,
    tokensUsed: Number,
    cost: Number
  }
}, { timestamps: true });

/* ✅ ADD INDEXES HERE */
MessageSchema.index({ userId: 1, createdAt: -1 });
MessageSchema.index({ phoneNumberId: 1 });
MessageSchema.index({ sessionId: 1 });

/* ✅ THEN EXPORT */
export default mongoose.models.Message ||
  mongoose.model("Message", MessageSchema);
