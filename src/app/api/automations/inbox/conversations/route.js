// src/app/api/inbox/conversations/route.js
import { NextResponse } from "next/server";
import { connectDb } from "@/app/ults/db/ConnectDb";
import { corsHeaders } from "@/app/ults/corsHeaders/corsHeaders";
import AIMessageModel from "@/app/ults/models/AIMessageModel";
import SessionModel from "@/app/ults/models/SessionModel";
import UserModel from "@/app/ults/models/UserModel";
import { verifyToken } from "@/app/api/helper/VerifyToken";
import mongoose from "mongoose";

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders() });
}

export async function GET(req) {
  try {
    await connectDb();
    const userId = await verifyToken(req);
    const user = await UserModel.findById(userId).lean();
    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    const businessNumber = user.whatsapp?.displayPhone?.replace(/\D/g, "");
    const personalNumber = user.number?.replace(/\D/g, "");

    // Get all unique conversations grouped by the conversation partner (the visitor)
    const conversations = await AIMessageModel.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      { $sort: { createdAt: -1 } },
      {
        $project: {
          partner: {
            $cond: [
              { $eq: ["$direction", "inbound"] },
              "$from",
              "$to"
            ]
          },
          text: 1,
          createdAt: 1,
          direction: 1,
          senderType: 1,
          status: 1,
          sessionId: 1,
          phoneNumberId: 1,
        }
      },
      {
        $group: {
          _id: "$partner",
          lastMessage: { $first: "$text" },
          lastMessageAt: { $first: "$createdAt" },
          lastDirection: { $first: "$direction" },
          lastSenderType: { $first: "$senderType" },
          unreadCount: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ["$direction", "inbound"] }, { $eq: ["$status", "received"] }] },
                1, 0
              ]
            }
          },
          totalMessages: { $sum: 1 },
          sessionId: { $first: "$sessionId" },
          phoneNumberId: { $first: "$phoneNumberId" },
        }
      },
      { $sort: { lastMessageAt: -1 } }
    ]);

    // Enrich with session handoff status
    const enriched = await Promise.all(
      conversations.map(async (conv) => {
        const session = await SessionModel.findOne({
          visitorPhone: conv._id,
          userId,
          status: { $in: ["active", "waiting"] }
        }).lean();

        return {
          phone: conv._id,
          lastMessage: conv.lastMessage,
          lastMessageAt: conv.lastMessageAt,
          lastDirection: conv.lastDirection,
          lastSenderType: conv.lastSenderType,
          unreadCount: conv.unreadCount,
          totalMessages: conv.totalMessages,
          sessionId: conv.sessionId,
          phoneNumberId: conv.phoneNumberId,
          isHandedOff: session?.handoff?.isHandedOff || false,
          sessionStatus: session?.status || "expired",
        };
      })
    );

    // Filter out self-conversations (where partner is the user's own business or personal number)
    const filtered = enriched.filter(conv => {
      const cleanedPartner = conv.phone?.replace(/\D/g, "");
      if (!cleanedPartner) return true;
      if (cleanedPartner === businessNumber) return false;
      if (personalNumber && cleanedPartner.endsWith(personalNumber)) return false;
      return true;
    });

    return NextResponse.json(
      { success: true, data: filtered },
      { status: 200, headers: corsHeaders() }
    );
  } catch (error) {
    console.log("InboxConversationsErr:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch conversations" },
      { status: 500, headers: corsHeaders() }
    );
  }
}