import { corsHeaders } from "@/app/ults/corsHeaders/corsHeaders";
import { connectDb } from "@/app/ults/db/ConnectDb";
import UserModel from "@/app/ults/models/UserModel";
import { NextResponse } from "next/server";
import { verifyToken } from "../../helper/VerifyToken";
import { fetchUrl } from "@/app/lib/fetchUrl";
import AIMessageModel from "@/app/ults/models/AIMessageModel";
import mongoose from "mongoose";

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders() });
}

export async function GET(req) {
  try {
    await connectDb();

    const userId = await verifyToken(req);

    const user = await UserModel.findById(userId)
      .select("whatsapp.contacts")
      .lean();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not authenticated" },
        { status: 401, headers: corsHeaders() }
      );
    };

    const contacts = user?.whatsapp?.contacts?.list ?? [];

    // 🔥 AUTO-SYNC: Find numbers in message history that aren't in the contacts list
    const messageStats = await AIMessageModel.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: "$from",
          messageCount: { $sum: 1 },
          lastMessageAt: { $max: "$createdAt" }
        }
      }
    ]);

    // Filter out numbers already in contacts and create "virtual" contacts for them
    const existingPhones = new Set(contacts.map(c => c.phone));
    const unknownContacts = messageStats
      .filter(stat => stat._id && !existingPhones.has(stat._id) && stat._id.startsWith("+"))
      .map(stat => ({
        phone: stat._id,
        status: "whitelist", // default for new visitors
        messageCount: stat.messageCount,
        lastMessageAt: stat.lastMessageAt,
        leadStage: "new",
        isVirtual: true // Mark as not yet formally saved in UserModel but visible
      }));

    const finalContacts = [...contacts, ...unknownContacts];

    return NextResponse.json(
      { success: true, data: finalContacts },
      { status: 200, headers: corsHeaders() }
    );

  } catch (error) {
    console.log("FetchingContactsErr:", error);

    return NextResponse.json(
      { success: false, message: "Failed to fetch contacts" },
      { status: 500, headers: corsHeaders() }
    );
  }
}