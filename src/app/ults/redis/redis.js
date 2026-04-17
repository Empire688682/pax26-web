// src/app/ults/redis/redis.js
import IORedis from "ioredis";

export const redis = new IORedis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
  tls: process.env.REDIS_URL?.startsWith("rediss://") ? {} : undefined,
});