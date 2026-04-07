import SessionModel from "../../ults/models/SessionModel";

export const getOrCreateSession = async ({ visitorPhone, userId, phoneNumberId }) => {
  const SESSION_TTL_HOURS = 24;

  let session = await SessionModel.findOne({
    visitorPhone,
    userId,
    status: { $in: ["active", "waiting"] }
  });

  if (!session) {
    session = await SessionModel.create({
      sessionId: `sess_${Date.now()}_${visitorPhone}`,
      visitorPhone,
      userId,
      phoneNumberId,
      expiresAt: new Date(Date.now() + SESSION_TTL_HOURS * 60 * 60 * 1000)
    });
  }

  return session;
};