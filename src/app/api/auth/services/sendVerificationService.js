import bcrypt from "bcryptjs";
import { customAlphabet } from "nanoid";
import { sendVerification } from "../../helper/sendVerification";

export async function sendUserVerification(user) {
  if (!user) {
    throw new Error("User document is required");
  }

  if (user.userVerify) {
    return { sent: false, reason: "Already verified" };
  }

  const COOLDOWN_MS = 60 * 1000;
  const now = new Date();

  if (user.emailVerification?.lastSentAt) {
    const elapsed = now - new Date(user.emailVerification.lastSentAt);
    if (elapsed < COOLDOWN_MS) {
      const waitSeconds = Math.ceil((COOLDOWN_MS - elapsed) / 1000);
      return { sent: false, reason: `Please wait ${waitSeconds} seconds before requesting another verification email.` };
    }
  }

  const alphabet = "0123456789";
  const nanoid = customAlphabet(alphabet, 6);
  const plainCode = nanoid();

  const hashedCode = await bcrypt.hash(plainCode, 10);
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  if (!user.emailVerification) user.emailVerification = {};
  user.verifyToken = hashedCode;
  user.emailVerification.token = hashedCode;
  user.emailVerification.expiresAt = expiresAt;
  user.emailVerification.lastSentAt = now;
  await user.save();

  const sent = await sendVerification(user.email, plainCode);

  return { sent };
}
