import { sendWhatsAppReply } from "../api/helper/ReplyWhatsappMessage.js";
import AIMessageModel from "../ults/models/AIMessageModel.js";
import SessionModel from "../ults/models/SessionModel.js";

// ============================
// HAND OFF TO HUMAN
// ============================
export const handOffToHuman = async ({ 
  sessionId, 
  handedOffBy,  // admin userId
  reason = "manual",
  notify = true  // send message to visitor
}) => {

  const session = await SessionModel.findOneAndUpdate(
    { sessionId },
    {
      status: "handed_off",
      "handoff.isHandedOff": true,
      "handoff.handedOffAt": new Date(),
      "handoff.handedOffBy": handedOffBy,
      "handoff.reason": reason,
      // Auto resume after 2 hours if admin forgets to hand back
      "handoff.autoResumeAt": new Date(Date.now() + 2 * 60 * 60 * 1000)
    },
    { new: true }
  );

  if (!session) throw new Error("Session not found");

  // Notify visitor that a human has joined
  if (notify) {
    const notifyText = reason === "user_requested"
      ? "You've been connected to a live agent. Please hold on."
      : "A team member has joined the conversation.";

    await sendWhatsAppReply({
      phoneNumberId: session.phoneNumberId,
      to: session.visitorPhone,
      text: notifyText
    });

    // Save as system message
    await AIMessageModel.create({
      messageId: `handoff_${Date.now()}`,
      userId: session.userId,
      sessionId: session.sessionId,
      platform: session.platform,
      phoneNumberId: session.phoneNumberId,
      from: "system",
      to: session.visitorPhone,
      text: notifyText,
      direction: "outbound",
      senderType: "system",
      status: "sent"
    });
  }

  return session;
};

// ============================
// HAND BACK TO AI
// ============================
export const handBackToAI = async ({ 
  sessionId,
  notify = true
}) => {

  const session = await SessionModel.findOneAndUpdate(
    { sessionId },
    {
      status: "active",
      "handoff.isHandedOff": false,
      "handoff.handedBackAt": new Date(),
      "handoff.autoResumeAt": null
    },
    { new: true }
  );

  if (!session) throw new Error("Session not found");

  if (notify) {
    const notifyText = "You're now back with our AI assistant. How can I help?";

    await sendWhatsAppReply({
      phoneNumberId: session.phoneNumberId,
      to: session.visitorPhone,
      text: notifyText
    });

    await AIMessageModel.create({
      messageId: `handback_${Date.now()}`,
      userId: session.userId,
      sessionId: session.sessionId,
      platform: session.platform,
      phoneNumberId: session.phoneNumberId,
      from: "system",
      to: session.visitorPhone,
      text: notifyText,
      direction: "outbound",
      senderType: "system",
      status: "sent"
    });
  }

  return session;
};

// ============================
// AUTO RESUME CHECK (run on cron)
// ============================
export const autoResumeExpiredHandoffs = async () => {
  const expiredSessions = await Session.find({
    "handoff.isHandedOff": true,
    "handoff.autoResumeAt": { $lte: new Date() }
  });

  for (const session of expiredSessions) {
    console.log(`Auto-resuming AI for session: ${session.sessionId}`);
    await handBackToAI({ 
      sessionId: session.sessionId, 
      notify: true 
    });
  }

  console.log(`Auto-resumed ${expiredSessions.length} sessions`);
};