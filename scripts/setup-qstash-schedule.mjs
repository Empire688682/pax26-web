// scripts/setup-qstash-schedule.mjs
//
// Run this ONCE after deploying to Vercel to register the hourly
// lead-followup schedule with Upstash QStash.
//
// Usage:
//   node scripts/setup-qstash-schedule.mjs
//
// Prerequisites:
//   1. Set QSTASH_TOKEN in your .env (or export it in your shell)
//   2. Set PRODUCTION_URL to your Vercel deployment URL (e.g. https://yourapp.vercel.app)
//      OR pass it as a CLI argument: node scripts/setup-qstash-schedule.mjs https://yourapp.vercel.app

import { config } from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, "../.env") });

const QSTASH_TOKEN = process.env.QSTASH_TOKEN;
const PRODUCTION_URL = process.argv[2] || process.env.NEXT_PUBLIC_URL;

// ── Validation ──────────────────────────────────────────────────
if (!QSTASH_TOKEN || QSTASH_TOKEN === "your_qstash_token_here") {
  console.error("❌  QSTASH_TOKEN is not set. Get it from https://console.upstash.com → QStash → Keys");
  process.exit(1);
}

if (!PRODUCTION_URL || PRODUCTION_URL.includes("localhost")) {
  console.error(
    "❌  PRODUCTION_URL must be your live Vercel URL (e.g. https://yourapp.vercel.app).\n" +
    "    Pass it as: node scripts/setup-qstash-schedule.mjs https://yourapp.vercel.app"
  );
  process.exit(1);
}

const ENDPOINT = `${PRODUCTION_URL.replace(/\/$/, "")}/api/cron/lead-followup`;
const SCHEDULE = "0 * * * *"; // every hour — no Vercel plan restrictions with QStash

// ── Register schedule ───────────────────────────────────────────
console.log(`\n🚀 Registering QStash schedule...`);
console.log(`   Endpoint : ${ENDPOINT}`);
console.log(`   Schedule : ${SCHEDULE} (every hour)\n`);

const res = await fetch("https://qstash.upstash.io/v2/schedules", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${QSTASH_TOKEN}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    destination: ENDPOINT,
    cron: SCHEDULE,
    // QStash will POST to your endpoint — no body needed
  }),
});

const data = await res.json();

if (!res.ok) {
  console.error("❌  Failed to create schedule:", JSON.stringify(data, null, 2));
  process.exit(1);
}

console.log("✅  Schedule created successfully!");
console.log(`   Schedule ID : ${data.scheduleId}`);
console.log(`\n📌  Save this Schedule ID — you can use it to update or delete the schedule later.`);
console.log(`   Dashboard   : https://console.upstash.com/qstash\n`);
