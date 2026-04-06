// models/Session.model.js
const SessionSchema = new mongoose.Schema({
  sessionId: { type: String, unique: true, required: true },
  
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  visitorPhone: { type: String, required: true, index: true },
  
  platform: { type: String, enum: ["whatsapp", "web", "sms"], default: "whatsapp" },
  phoneNumberId: { type: String },

  status: {
    type: String,
    enum: ["active", "waiting", "closed", "handed_off"],
    default: "active"
  },

  handoff: {
    isHandedOff: { type: Boolean, default: false },
    handedOffAt: { type: Date },
    reason: { type: String } // "user_requested", "ai_confused", "complex_query"
  },

  context: {
    // rolling AI memory — last N messages summary
    summary: { type: String, default: "" },
    lastIntent: { type: String },
    messageCount: { type: Number, default: 0 }
  },

  lastMessageAt: { type: Date, default: Date.now },
  expiresAt: { type: Date } // TTL — auto-close after X hours of inactivity

}, { timestamps: true });

const SessionModel = mongoose.models.Session || mongoose.model("Session", SessionSchema);

export default SessionModel;