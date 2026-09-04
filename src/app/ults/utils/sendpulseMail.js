import axios from "axios";

let cachedToken = null;
let cachedTokenExpiresAt = 0;

async function getAccessToken() {
  const clientId = process.env.SENDPULSE_API_ID;
  const clientSecret = process.env.SENDPULSE_API_SECRET;

  if (!clientId || !clientSecret) {
    console.warn("SENDPULSE_API_ID and SENDPULSE_API_SECRET are not set in environment variables");
    return null;
  }

  if (cachedToken && Date.now() < cachedTokenExpiresAt) {
    return cachedToken;
  }

  try {
    const { data } = await axios.post("https://api.sendpulse.com/oauth/access_token", {
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret,
    });

    cachedToken = data.access_token;
    cachedTokenExpiresAt = Date.now() + Math.max(60, (data.expires_in || 3600) - 120) * 1000;
    return cachedToken;
  } catch (err) {
    console.error("SendPulse OAuth token error:", err.response?.data || err.message);
    return null;
  }
}

export async function sendTransactionalEmail({ toEmail, toName, subject, html, text, fromEmail = "info@pax26.com", fromName = "Pax26 Support", replyToEmail, replyToName }) {
  try {
    const token = await getAccessToken();
    if (!token) {
      console.error("SendPulse email skipped: No access token available.");
      return false;
    }

    const htmlBase64 = Buffer.from(html, "utf8").toString("base64");

    const emailPayload = {
      email: {
        html: htmlBase64,
        text: text || "",
        subject,
        from: { name: fromName, email: fromEmail },
        to: [{ email: toEmail, name: toName || toEmail }],
        reply_to: {
          name: replyToName || fromName,
          email: replyToEmail || fromEmail,
        },
      },
    };

    const response = await axios.post(
      "https://api.sendpulse.com/smtp/emails",
      emailPayload,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (response.data && (response.data.result === true || response.data.id)) {
      return true;
    } else {
      console.error("SendPulse API error response:", response.data);
      return false;
    }
  } catch (err) {
    const apiMessage = err.response?.data?.message || err.response?.data || err.message;
    console.error("SendPulse Send Mail Exception:", apiMessage);
    return false;
  }
}
