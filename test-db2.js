import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({ path: "./.env" });

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB");

  const db = mongoose.connection.db;
  const usersCollection = db.collection("users");

  const allUsersWithAnyWhatsappInfo = await usersCollection.find({
    $or: [
      { "whatsapp.phoneNumberId": { $ne: "" } },
      { "whatsapp.wabaId": { $ne: "" } },
      { "whatsapp.displayPhone": { $ne: "" } },
      { "whatsapp.connected": true }
    ]
  }).toArray();

  console.log("Found", allUsersWithAnyWhatsappInfo.length, "users with any whatsapp info.");
  for (const u of allUsersWithAnyWhatsappInfo) {
    console.log(`- ID: ${u._id}, Name: ${u.name}, Email: ${u.email}`);
    console.log(`  whatsapp:`, JSON.stringify(u.whatsapp, null, 2));
  }

  await mongoose.disconnect();
}

run().catch(console.error);
