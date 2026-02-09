import sendpulse from "@/app/lib/sendpulse";

export function sendVerification(receiverEmail, code) {
  return new Promise((resolve, reject) => {
    if (!receiverEmail || !code) {
      return reject(new Error("Missing email or verification code"));
    }

    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
        <h2>Confirm your email for PAX26</h2>

        <p>
          Welcome to <strong>PAX26</strong>.<br/>
          Use the verification code below to activate your account.
        </p>

        <p><strong>Here is your code:</strong></p>
        <h1 style="letter-spacing: 4px;">${code}</h1>

        <p>This code expires in <strong>15 minutes</strong>.</p>

        <p style="color:#d9534f; font-weight:bold;">
          If you did not create a PAX26 account, you can ignore this email.
        </p>

        <p>
          Thanks for choosing PAX26,<br/>
          The PAX26 Team
        </p>
      </div>
    `;

    const email = {
      subject: "Confirm your email for PAX26",
      from: {
        name: "PAX26",
        email: "info@pax26.com", // MUST be verified in SendPulse
      },
      to: [
        {
          email: receiverEmail,
        },
      ],
      html,
      text: `Your PAX26 verification code is ${code}. It expires in 15 minutes.`,
    };

    console.log("Email payload:", email);

    sendpulse.smtpSendMail((result) => {
      console.log("SendPulse response:", result);

      if (result?.result === true) {
        resolve(true);
      } else {
        reject(result || new Error("SendPulse failed"));
      }
    }, email);
  });
}
