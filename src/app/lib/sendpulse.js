import "server-only";
import sendpulse from "sendpulse-api";

sendpulse.init(
  process.env.SENDPULSE_API_ID,
  process.env.SENDPULSE_API_SECRET,
  "/tmp/sendpulse_token.json"
);

export default sendpulse;
