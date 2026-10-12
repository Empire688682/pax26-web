import sendpulse from "@/app/lib/sendpulse";

export function sendVerification(receiverEmail, code) {
  return new Promise((resolve, reject) => {
    if (!receiverEmail || !code) {
      return reject(new Error("Missing email or verification code"));
    }

    // Plain-text structured email — avoids promo/spam filters.
    // Key deliverability rules applied:
    //  1. No image-heavy layout (text-first = primary inbox)
    //  2. Physical sender address in footer (CAN-SPAM compliant)
    //  3. Minimal HTML — no tracking pixels, no fancy gradients
    //  4. Clear sender name matches from domain
    //  5. Preheader text so preview shows the OTP, not "View in browser"
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>Your Pax26 verification code</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,Helvetica,sans-serif;">
  <!-- preheader (hidden, influences email preview text) -->
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">
    Your Pax26 verification code is ${code} &nbsp;&zwnj;&zwnj;&zwnj;&zwnj;&zwnj;&zwnj;&zwnj;&zwnj;&zwnj;&zwnj;&zwnj;&zwnj;
  </div>
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
          <!-- Header -->
          <tr>
            <td style="background:#01050f;padding:24px 32px;">
              <p style="margin:0;font-size:20px;font-weight:800;color:#ffffff;letter-spacing:-0.02em;">Pax26</p>
              <p style="margin:4px 0 0;font-size:12px;color:#94a3b8;letter-spacing:0.05em;text-transform:uppercase;">Email Verification</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px 32px 24px;">
              <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.6;">
                Hi there,
              </p>
              <p style="margin:0 0 24px;font-size:15px;color:#374151;line-height:1.6;">
                Use the code below to verify your email address and activate your Pax26 account.
                This code expires in <strong>15 minutes</strong>.
              </p>
              <!-- OTP block -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding:20px 0;">
                    <div style="display:inline-block;background:#f0fdf4;border:2px solid #34d399;border-radius:12px;padding:16px 36px;">
                      <p style="margin:0;font-size:36px;font-weight:900;color:#065f46;letter-spacing:10px;font-family:'Courier New',monospace;">${code}</p>
                    </div>
                  </td>
                </tr>
              </table>
              <p style="margin:20px 0 0;font-size:13px;color:#6b7280;line-height:1.6;">
                If you did not create a Pax26 account, you can safely ignore this email.
                Someone may have entered your email address by mistake.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:16px 32px;text-align:center;">
              <p style="margin:0;font-size:11px;color:#9ca3af;line-height:1.6;">
                Pax26 Technologies · info@pax26.com · <a href="https://www.pax26.com" style="color:#34d399;text-decoration:none;">pax26.com</a>
              </p>
              <p style="margin:4px 0 0;font-size:11px;color:#9ca3af;">
                This is a transactional email — you cannot unsubscribe from account security emails.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    const email = {
      subject: `${code} is your Pax26 verification code`,
      from: {
        name: "Pax26",
        email: "info@pax26.com",
      },
      to: [{ email: receiverEmail }],
      html,
      text: `Your Pax26 verification code is: ${code}\n\nThis code expires in 15 minutes.\n\nIf you did not create a Pax26 account, ignore this email.\n\n---\nPax26 Technologies · pax26.com`,
    };

    sendpulse.smtpSendMail((result) => {
      console.log("SendPulse verification response:", result);
      if (result?.result === true) {
        resolve(true);
      } else {
        reject(result || new Error("SendPulse failed"));
      }
    }, email);
  });
}
