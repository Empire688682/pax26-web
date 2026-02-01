import { nanoid } from "nanoid";

export function generateOTP(length = 6) {
  const otp = nanoid(length).toUpperCase().replace(/[^0-9]/g, '').slice(0, length);
  return otp.padEnd(length, '0'); // Ensure OTP is of the desired length
}