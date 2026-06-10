import mongoose from "mongoose";

// Cache the connection across serverless function invocations.
// Without this, every Vercel cold start opens a brand new connection,
// exhausting the MongoDB Atlas M0 free tier limit (500 total connections).
let cached = global._mongoose;

if (!cached) {
  cached = global._mongoose = { conn: null, promise: null };
}

export const connectDb = async () => {
  // If a connection is already established, reuse it immediately.
  if (cached.conn) {
    return cached.conn;
  }

  // If a connection is in progress, wait for it instead of opening another.
  if (!cached.promise) {
    cached.promise = mongoose
      .connect(process.env.MONGODB_URI, {
        // M0 free tier: keep pool small to avoid exhausting the 500-connection limit.
        // With Vercel serverless, each warm instance reuses this pool.
        // 5 connections per serverless instance is safe for M0.
        maxPoolSize: 5,
        minPoolSize: 1,
        // Close idle connections after 30s to free up slots for other instances.
        maxIdleTimeMS: 30000,
        // Fail fast if Atlas is unreachable rather than queuing forever.
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 10000,
      })
      .then((mongoose) => {
        console.log("DB connected successfully");
        return mongoose;
      })
      .catch((error) => {
        cached.promise = null; // Reset so the next call retries
        console.error("DB-Error:", error);
        throw error;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
};