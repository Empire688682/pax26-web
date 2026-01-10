import sendpulse from "sendpulse-api";

sendpulse.init(
  process.env.SENDPULSE_API_ID,
  process.env.SENDPULSE_API_SECRET,
  "/tmp/"
);

export default sendpulse;
