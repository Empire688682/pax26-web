import mongoose from 'mongoose';

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
        handedBackAt: { type: Date },
        handedOffBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        reason: {
            type: String,
            enum: [
                "manual",          // admin jumped in from dashboard
                "ai_confused",     // ai triggered it itself
                "user_requested",  // visitor typed "human" or "agent"
                "keyword_trigger"  // specific word detected
            ]
        },
        autoResumeAt: { type: Date }, // AI auto-resumes after X hours if admin forgets
    },

    context: {
        // rolling AI memory — last N messages summary
        summary: { type: String, default: "" },
        lastIntent: { type: String },
        messageCount: { type: Number, default: 0 },
        inboundCount: { type: Number, default: 0 },
        outboundCount: { type: Number, default: 0 },
        totalTokens: { type: Number, default: 0 } // for AI cost tracking
    },

    lastMessageAt: { type: Date, default: Date.now },
    expiresAt: { type: Date } // TTL — auto-close after X hours of inactivity

}, { timestamps: true });

const SessionModel = mongoose.models.Session || mongoose.model("Session", SessionSchema);

export default SessionModel;