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

  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const nanoid = customAlphabet(alphabet, 6);
  const plainCode = nanoid();

  const hashedCode = await bcrypt.hash(plainCode, 10);
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  user.verifyToken = hashedCode;
  user.verifyTokenExpires = expiresAt;
  await user.save();

  const link = `${process.env.BASE_URL}verify-user?token=${plainCode}`;

  const sent = await sendVerification(user.email, plainCode, link);

  return { sent };
}
