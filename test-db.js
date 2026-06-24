import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({ path: "./.env" });

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB");

  const db = mongoose.connection.db;

  const usersCollection = db.collection("users");
  const users = await usersCollection.find({ "whatsapp": { $exists: true } }).toArray();
  console.log("Users with whatsapp:", JSON.stringify(users.map(u => ({
    id: u._id,
    name: u.name,
    email: u.email,
    whatsapp: u.whatsapp
  })), null, 2));

  // Let's also search for temp sessions
  const tempSessionsCollection = db.collection("tempsessions");
  if (tempSessionsCollection) {
    const sessions = await tempSessionsCollection.find({}).toArray();
    console.log("Temp sessions:", JSON.stringify(sessions, null, 2));
  }

  await mongoose.disconnect();
}

run().catch(console.error);
