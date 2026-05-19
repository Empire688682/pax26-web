import { NextResponse } from "next/server";
import { connectDb } from "@/app/ults/db/ConnectDb";
import { verifyToken } from "@/app/api/helper/VerifyToken";
import { corsHeaders } from "@/app/ults/corsHeaders/corsHeaders";
import SellerNotificationModel from "@/app/ults/models/SellerNotificationModel";

export async function OPTIONS() {
    return new NextResponse(null, { status: 200, headers: corsHeaders() });
}

export async function GET(req) {
    await connectDb();
    try {
        const userId = await verifyToken(req);
        if (!userId) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401, headers: corsHeaders() });
        }

        const notifications = await SellerNotificationModel.find({ userId })
            .sort({ createdAt: -1 })
            .limit(50); // Get last 50 notifications

        const unreadCount = await SellerNotificationModel.countDocuments({ userId, read: false });

        return NextResponse.json({ success: true, notifications, unreadCount }, { status: 200, headers: corsHeaders() });

    } catch (error) {
        console.error("Fetch Notifications Error:", error);
        return NextResponse.json({ success: false, message: "Internal error" }, { status: 500, headers: corsHeaders() });
    }
}

export async function PATCH(req) {
    await connectDb();
    try {
        const userId = await verifyToken(req);
        if (!userId) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401, headers: corsHeaders() });
        }

        const { notificationId } = await req.json();

        if (notificationId) {
            await SellerNotificationModel.findByIdAndUpdate(notificationId, { read: true });
        } else {
            // Mark all as read
            await SellerNotificationModel.updateMany({ userId, read: false }, { read: true });
        }

        return NextResponse.json({ success: true, message: "Notifications updated" }, { status: 200, headers: corsHeaders() });

    } catch (error) {
        console.error("Mark Notifications Read Error:", error);
        return NextResponse.json({ success: false, message: "Internal error" }, { status: 500, headers: corsHeaders() });
    }
}
