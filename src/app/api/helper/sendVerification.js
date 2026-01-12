import sendpulse from "@/app/lib/sendpulse";

export function sendVerification(receiverEmail, code, link ) {
  return new Promise((resolve) => {
    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
        <h2>Confirm your email for PAX26</h2>

        <p>
          Welcome to <strong>PAX26</strong>.<br/>
          Use <strong>either</strong> the verification code <strong>or</strong> the button below to activate your account.
        </p>

        <p><strong>Here is your code:</strong></p>
        <h1 style="letter-spacing: 4px;">${code}</h1>

        <p>This code expires in <strong>15 minutes</strong>.</p>

        <p style="color:#d9534f; font-weight:bold;">
          This link is for your personal use.
        </p>

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
      subject: "Verify your PAX26 account",
      from: {
        name: "Pax26",
        email: "info@pax26.com",
      },
      to: [{ email: receiverEmail }],
      html,
    };

    console.log("Email payload:", JSON.stringify(email, null, 2));

    sendpulse.smtpSendMail(function (result) {
      if (result && result.result === true) {
        console.log("Verification email sent!");
        resolve(true);
      } else {
        console.error("SendPulse failed:", result);
        resolve(false);
      }
    }, email);
  });
}
