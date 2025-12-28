import { transporter } from "./transporter";

export async function sendVerification({ receiver, code, link }) {
  try {
    const html = `<div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
    <h2>Activate your PAX26 account</h2>
    <p>Welcome to <strong>PAX26</strong>.<br/>
       Use <strong>either</strong> the verification code <strong>or</strong> the button below to activate your account.</p>
    <p><strong>Your verification code:</strong></p>
    <h1 style="letter-spacing: 4px;">${code}</h1>
    <p>This code expires in <strong>15 minutes</strong>.</p>
    <p><a href="${link}" style="color:white; background-color:#007BFF; padding:12px 18px; text-decoration:none; border-radius:5px; display:inline-block;">Verify Account</a></p>
    <p>If the button doesn’t work, copy and paste this link:</p>
    <p style="word-break: break-all;"><a href="${link}">${link}</a></p>
    <p style="color:#d9534f; font-weight:bold;">Do not share this code or link with anyone.</p>
    <p>Thanks for choosing PAX26,<br/>The PAX26 Team</p>
  </div>`;

  const text = `Welcome to PAX26.
Your verification code: ${code}
Link: ${link}
Expires in 15 minutes.
Do not share this code or link with anyone.`;

 await transporter.sendMail({
      from: '"PAX26" <info@pax26.com>',
      to: receiver,
      subject: "Verify your PAX26 account",
      html,
      text,
    });
    return true;
  } catch (error) {
    console.error("Error sending verification email:", error);
    return false;
  }
}
