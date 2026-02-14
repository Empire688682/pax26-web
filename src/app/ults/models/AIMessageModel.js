import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
  messageId: { type: String, unique: true, required: true },

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index:true
  },

  platform: {
    type: String,
    enum: ["whatsapp", "web", "sms"],
    default: "whatsapp"
  },

  phoneNumberId: {type: String, index:true},
  providerMessageId: String,

  from: { type: String, required: true },
  to: { type: String, required: true },

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

  sessionId: {type: String, index:true},

  aiMeta: {
    model: String,
    tokensUsed: Number,
    cost: Number
  }
}, { timestamps: true });

/* ✅ THEN EXPORT */
export default mongoose.models.Message ||
  mongoose.model("Message", MessageSchema);
