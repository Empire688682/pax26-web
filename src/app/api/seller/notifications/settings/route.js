import { NextResponse } from "next/server";
import { connectDb } from "@/app/ults/db/ConnectDb";
import { verifyToken } from "@/app/api/helper/VerifyToken";
import { corsHeaders } from "@/app/ults/corsHeaders/corsHeaders";
import SellerProfileModel from "@/app/ults/models/SellerProfileModel";
import UserModel from "@/app/ults/models/UserModel";

export async function OPTIONS() {
    return new NextResponse(null, { status: 200, headers: corsHeaders() });
}

export async function PATCH(req) {
    await connectDb();
    try {
        const userId = await verifyToken(req);
        if (!userId) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401, headers: corsHeaders() });
        }

        const { enabled, channel } = await req.json();

        const user = await UserModel.findById(userId);
        if (!user) return NextResponse.json({ success: false, message: "User not found" }, { status: 404, headers: corsHeaders() });

        const plan = user.paxAI?.plan || "free";
        // Use the plan flag rather than a hardcoded plan name check
        const salesAlertsEnabled = user.paxAI?.salesAlertsEnabled ?? true;
        if (!salesAlertsEnabled) {
            return NextResponse.json({
                success: false,
                message: "Sales alerts are not available on your current plan. Please upgrade to enable this feature.",
                upgradeRequired: true,
            }, { status: 403, headers: corsHeaders() });
        }

        // Channel access: business+ get WhatsApp+email; starter gets email+in-app; free gets in-app
        let actualChannel = channel;
        if (plan === "starter" && channel === "whatsapp") {
            actualChannel = "email"; // Starter: no WhatsApp channel for seller alerts
        } else if (plan === "free") {
            actualChannel = "in-app";
        }

        const sellerProfile = await SellerProfileModel.findOneAndUpdate(
            { userId },
            { 
                $set: { 
                    salesNotificationsEnabled: enabled, 
                    salesNotificationChannel: actualChannel 
                } 
            },
            { new: true }
        );

        if (!sellerProfile) {
            return NextResponse.json({ success: false, message: "Seller profile not found" }, { status: 404, headers: corsHeaders() });
        }

        return NextResponse.json({ success: true, settings: { enabled: sellerProfile.salesNotificationsEnabled, channel: sellerProfile.salesNotificationChannel } }, { status: 200, headers: corsHeaders() });

    } catch (error) {
        console.error("Settings Update Error:", error);
        return NextResponse.json({ success: false, message: "Internal error" }, { status: 500, headers: corsHeaders() });
    }
}
