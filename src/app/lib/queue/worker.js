import { Worker } from "bullmq";
import IORedis from "ioredis";

import SessionModel from "../../ults/models/SessionModel.js";
import UserModel from "../../ults/models/UserModel.js";
import { connectDb } from "../../ults/db/ConnectDb.js";
import { triggerAIResponse } from "../aiService/triggerAIResponse.js";

const connection = new IORedis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
  tls: process.env.REDIS_URL?.startsWith("rediss://") ? {} : undefined,
});

console.log("🚀 WhatsApp Worker booting...");

connection.on("connect", () => {
  console.log("✅ Worker Redis connected");
});

connection.on("error", (err) => {
  console.log("❌ Worker Redis error:", err);
});

const worker = new Worker(
  "whatsapp-ai",
  async (job) => {
    try {
      console.log("🔥 JOB RECEIVED:", job.data);

      await connectDb();

      const { sessionId, userId, inboundText } = job.data;

      const session = await SessionModel.findOne({ sessionId });
      const user = await UserModel.findById(userId);

      if (!session || !user) {
        console.log("❌ Missing session or user");
        return;
      }

      await triggerAIResponse({ session, user, inboundText });

      console.log("✅ Job completed");
    } catch (err) {
      console.error("❌ Worker job error:", err);
      throw err; // important for BullMQ retry
    }
  },
  { connection }
);

worker.on("completed", (job) => {
  console.log(`✅ Job ${job.id} completed`);
});

worker.on("failed", (job, err) => {
  console.error(`❌ Job ${job.id} failed:`, err);
});