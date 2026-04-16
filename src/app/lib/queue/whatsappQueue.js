import { Queue } from "bullmq";
import IORedis from "ioredis";

const connection = new IORedis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
  tls: process.env.REDIS_URL?.startsWith("rediss://") ? {} : undefined,
});

connection.on("connect", () => {
  console.log("✅ Redis connected");
});

connection.on("error", (err) => {
  console.error("❌ Redis error:", err);
});

connection.on("close", () => {
  console.warn("⚠️ Redis connection closed");
});

export const whatsappQueue = new Queue("whatsapp-ai", {
  connection,
});