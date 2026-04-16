// worker.js
import { config } from "dotenv";
config();

console.log("🚀 Worker file loaded...");
import("./src/app/lib/queue/worker.js").then(() => {
  console.log("🚀 Pax26 WhatsApp worker running...");
}).catch((err) => {
  console.log("❌ Worker failed to start:", err);
  process.exit(1);
});