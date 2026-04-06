import { triggerAIResponse } from "@/app/lib/aiService/triggerAIResponse";
import AIMessageModel from "@/app/ults/models/AIMessageModel";
import SessionModel from "@/app/ults/models/SessionModel";
import UserModel from "@/app/ults/models/UserModel";

// The revised webhook flow
export const handleIncomingWhatsApp = async (payload) => {
  const message = payload.entry[0].changes[0].value.messages[0];
  const metadata = payload.entry[0].changes[0].value.metadata;
  const contact = payload.entry[0].changes[0].value.contacts[0];

  // 1. DEDUPLICATE — your logs show same message hitting 4+ times
  const existing = await AIMessageModel.findOne({ messageId: message.id });
  if (existing) return { skipped: true };

  // 2. Find which user owns this phoneNumberId
  const user = await UserModel.findOne({ "whatsapp.phoneNumberId": metadata.phone_number_id });
  if (!user) return { error: "No user for this phoneNumberId" };

  // 3. Get or create session
  const session = await getOrCreateSession({
    visitorPhone: message.from,
    userId: user._id,
    phoneNumberId: metadata.phone_number_id
  });

  // 4. Save inbound message
  await AIMessageModel.create({
    messageId: message.id,
    userId: user._id,
    sessionId: session.sessionId,
    platform: "whatsapp",
    phoneNumberId: metadata.phone_number_id,
    from: message.from,
    to: metadata.display_phone_number,
    text: message.text.body,
    direction: "inbound",
    senderType: "visitor",
    status: "received"
  });

  // 5. Update session
  await SessionModel.findByIdAndUpdate(session._id, {
    lastMessageAt: new Date(),
    $inc: { "context.messageCount": 1 },
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // reset TTL
  });

  // 6. Trigger AI response (next step)
  await triggerAIResponse({ session, user, inboundText: message.text.body });
};