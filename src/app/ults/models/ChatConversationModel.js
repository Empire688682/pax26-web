import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema(
  {
    role:      { type: String, enum: ["user", "assistant"], required: true },
    text:      { type: String, required: true, maxlength: 1000 },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const ChatConversationSchema = new mongoose.Schema(
  {
    sessionId:    { type: String, required: true, unique: true, index: true },
    ipAddress:    { type: String },
    userId:       { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    messages:     [MessageSchema],
    messageCount: { type: Number, default: 0 },
    windowStart:  { type: Date },
  },
  { timestamps: true }
);

const ChatConversationModel =
  mongoose.models.ChatConversation ||
  mongoose.model("ChatConversation", ChatConversationSchema);

export default ChatConversationModel;
