import { NextResponse } from "next/server";
import { connectDb } from "@/app/ults/db/ConnectDb";
import { verifyToken } from "@/app/api/helper/VerifyToken";
import { corsHeaders } from "@/app/ults/corsHeaders/corsHeaders";
import AIMessageModel from "@/app/ults/models/AIMessageModel";
import { uploadCustomerImageToCloudinary } from "@/app/lib/aiService/customerImageSearch";
import SellerProfileModel from "@/app/ults/models/SellerProfileModel";
import UserModel from "@/app/ults/models/UserModel";

async function resolveWhatsAppMediaUrl(imageId, accessToken) {
  const res = await fetch(`https://graph.facebook.com/v19.0/${imageId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error(`Meta media resolve failed: ${res.statusText}`);
  const data = await res.json();
  return { url: data.url };
}

export async function GET(req) {
  try {
    await connectDb();
    const userId = await verifyToken(req);
    if (!userId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401, headers: corsHeaders() });
    }

    const messageId = new URL(req.url).searchParams.get("messageId");
    if (!messageId) {
      return NextResponse.json({ success: false, message: "messageId required" }, { status: 400, headers: corsHeaders() });
    }

    const message = await AIMessageModel.findOne({ messageId, userId }).lean();
    if (!message) {
      return NextResponse.json({ success: false, message: "Message not found" }, { status: 404, headers: corsHeaders() });
    }

    if (message.mediaUrl) {
      return NextResponse.json({ success: true, mediaUrl: message.mediaUrl }, { headers: corsHeaders() });
    }

    if (!message.mediaId || message.mediaType !== "image") {
      return NextResponse.json({ success: false, message: "No image on this message" }, { status: 404, headers: corsHeaders() });
    }

    // Each user must have their own WhatsApp access token from Embedded Signup
    const user = await UserModel.findById(userId).select("whatsapp.accessToken").lean();
    const userAccessToken = user?.whatsapp?.accessToken;

    if (!userAccessToken) {
      return NextResponse.json(
        { success: false, message: "WhatsApp not connected. Please connect your WhatsApp account to view media." },
        { status: 403, headers: corsHeaders() }
      );
    }

    const sellerProfile = await SellerProfileModel.findOne({ userId }).lean();
    const sellerId = sellerProfile?._id || userId;

    const { url: metaUrl } = await resolveWhatsAppMediaUrl(message.mediaId, userAccessToken);
    const uploaded = await uploadCustomerImageToCloudinary(metaUrl, sellerId, message.from, "customer-images", userAccessToken);

    await AIMessageModel.updateOne({ messageId }, { $set: { mediaUrl: uploaded.url } });

    return NextResponse.json({ success: true, mediaUrl: uploaded.url }, { headers: corsHeaders() });
  } catch (error) {
    console.error("Inbox media resolve error:", error);
    return NextResponse.json({ success: false, message: "Failed to load image" }, { status: 500, headers: corsHeaders() });
  }
}
