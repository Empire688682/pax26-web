/**
 * Migration: Update productsLimit for all existing users
 *
 * New limits:
 *   free       → 20
 *   starter    → 100
 *   business   → 500
 *   enterprise → 0 (unlimited)
 *
 * Run once with:
 *   node scripts/migrate-products-limit.mjs
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

// Load env vars from project root
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("❌  No MongoDB URI found in environment. Set MONGODB_URI in .env");
  process.exit(1);
}

const PLAN_LIMITS = {
  free:       20,
  starter:    100,
  business:   500,
  enterprise: 0,   // 0 = unlimited
};

async function run() {
  await mongoose.connect(MONGO_URI);
  console.log("✅  Connected to MongoDB");

  const db = mongoose.connection.db;
  const users = db.collection("users");

  let totalUpdated = 0;

  for (const [plan, newLimit] of Object.entries(PLAN_LIMITS)) {
    const result = await users.updateMany(
      { "paxAI.plan": plan },
      { $set: { "paxAI.productsLimit": newLimit } }
    );
    console.log(`   ${plan.padEnd(12)} → limit ${String(newLimit).padStart(3)}  |  ${result.modifiedCount} users updated`);
    totalUpdated += result.modifiedCount;
  }

  // Catch users with no plan set (defaults to free)
  const noplan = await users.updateMany(
    { "paxAI.plan": { $exists: false } },
    { $set: { "paxAI.productsLimit": PLAN_LIMITS.free } }
  );
  console.log(`   (no plan)    → limit  ${PLAN_LIMITS.free}  |  ${noplan.modifiedCount} users updated`);
  totalUpdated += noplan.modifiedCount;

  console.log(`\n🎉  Migration complete. Total users updated: ${totalUpdated}`);
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error("❌  Migration failed:", err);
  process.exit(1);
});
