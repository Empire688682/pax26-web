import sendpulse from "@/app/lib/sendpulse";

export const sendPasswordResettingEmail = (receiverEmail, resetingPwdLink, mailType) => {
  return new Promise((resolve) => {
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

      const htmlData = messageType[mailType];
      const subject = subjectMap[mailType] || "Notification";

      if (!htmlData) {
        console.log("Invalid mail type provided.");
        resolve(false)
      }

      const senderName =
        mailType === "PasswordReset"
          ? "Pax26 Team Support"
          : mailType === "EmailSubscriber"
            ? "Pax26 Newsletter"
            : "Pax26";

      const email = {
        subject,
        from: {
          name: senderName,
          email: "info@pax26.com",
        },
        to: [{ email: receiverEmail }],
        html,
      };

      console.log("Email payload:", JSON.stringify(email, null, 2));

      sendpulse.smtpSendMail(function (result) {
        console.log("result: ", result)
        if (result && result.result === true) {
          console.log("Email sent");
          resolve(true);
        }
        else {
          console.error("SendPulse failed:", result);
          resolve(false);
        }
      }, email)
    } catch (error) {
      console.log("ERROR Sending Email:", error);
      resolve(false);
    }
  })
};
