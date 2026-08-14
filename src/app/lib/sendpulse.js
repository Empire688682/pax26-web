import "server-only";
import sendpulse from "sendpulse-api";
import path from "path";
import os from "os";

const tokenPath = path.join(os.tmpdir(), "sendpulse_token.json");

sendpulse.init(
  process.env.SENDPULSE_API_ID,
  process.env.SENDPULSE_API_SECRET,
  tokenPath
);

export default sendpulse;

