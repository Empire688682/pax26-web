import "server-only";
import sendpulse from "sendpulse-api";

sendpulse.init(
  process.env.SENDPULSE_API_ID,
  process.env.SENDPULSE_API_SECRET,
  "/tmp/sendpulse_token.json"
);

console.log("SENDPULSE_API_ID:", process.env.SENDPULSE_API_ID);
console.log("SENDPULSE_API_SECRET:", process.env.SENDPULSE_API_SECRET);

export default sendpulse;
