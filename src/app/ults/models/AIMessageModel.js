import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
  messageId: { type: String, unique: true, required: true },

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
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

  mediaType: {
    type: String,
    enum: ["image", "document", "audio", "video"],
  },
  mediaId: String,
  mediaUrl: String,
  mediaCaption: String,

  direction: {
    type: String,
    enum: ["inbound", "outbound"],
    required: true
  },

  senderType: {
    type: String,
    enum: ["user", "ai", "visitor", "admin", "system",],
    default: "user"
  },

  status: {
    type: String,
    enum: ["received", "read", "processing", "sent", "failed"],
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
    cost: Number,
    imagesSent: Number,
    imageUrls: [String],
    wasImageSearch: Boolean,
  }
}, { timestamps: true });

/* ✅ THEN EXPORT */
const AIMessageModel = mongoose.models.Message ||
  mongoose.model("Message", MessageSchema);

  export default AIMessageModel;
