import nodemailer from "nodemailer";

export const sendPasswordResettingEmail = async (toEmail, resetingPwdLink, mailType) => {
  const messageType = {
    "PasswordReset": `
      <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
        <h2>Password Reset</h2>
        <p>We received a request to reset your password. Click the button below to choose a new password:</p>
        <p>
          <a href="${resetingPwdLink}" style="color: white; background-color: #007BFF; padding: 10px 15px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Reset Password
          </a>
        </p>
        <p>If the button above doesn't work, copy and paste this link into your browser:</p>
        <p style="word-break: break-all;"><a href="${resetingPwdLink}">${resetingPwdLink}</a></p>
        <p style="color: red; font-weight: bold;">Note: This link expires in 15 minutes.</p>
        <p>If you didn't request this, you can safely ignore this email.</p>
        <p>Thanks,<br/>The Team</p>
      </div>
    `,
    "EmailSubscriber": `
      <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9f9f9;">
        <h2>Welcome to Our Newsletter!</h2>
        <p>Thank you for subscribing to our newsletter. We're excited to keep you updated with our latest news, updates, and exclusive offers.</p>
        <p>If you have any questions, feel free to reply to this email.</p>
        <p>Thanks again,<br/>The Team</p>
      </div>
    `,
  };

  const subjectMap = {
    "PasswordReset": "Password Reset Request",
    "EmailSubscriber": "Thanks for Subscribing!",
  };

  try {
    console.log("Email Data: ", process.env.EMAIL_USER, process.env.EMAIL_PASS);
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT),
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    const htmlData = messageType[mailType];
    const subject = subjectMap[mailType] || "Notification";

    if (!htmlData) {
        console.log("Invalid mail type provided.");
        return false
    }

    const senderName =
      mailType === "PasswordReset"
        ? "Pax26 Team Support"
        : mailType === "EmailSubscriber"
          ? "Pax26 Newsletter"
          : "Pax26";


    const mailOptions = {
      from: `"${senderName}" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject,
      html: htmlData,
    };

    await transporter.sendMail(mailOptions);
    console.log("Email sent");
    return true

  } catch (error) {
    console.log("ERROR Sending Email:", error);
    return false
  }
};
