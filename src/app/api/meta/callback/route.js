import { NextResponse } from "next/server";
import { connectDb } from "@/app/ults/db/ConnectDb";
import UserModel from "@/app/ults/models/UserModel";
import { corsHeaders } from "@/app/ults/corsHeaders/corsHeaders";
import axios from "axios";
import jwt from "jsonwebtoken";

export async function OPTIONS() {
    return new NextResponse(null, { status: 200, headers: corsHeaders() });
}

/**
 * GET /api/meta/callback?code=XXXX
 */
export async function GET(req) {
    try {
        await connectDb();

        const { searchParams } = new URL(req.url);
        const code = searchParams.get("code");
        const state = searchParams.get("state");

        if (!code) {
            return NextResponse.json(
                { success: false, message: "Authorization code missing" },
                { status: 400, headers: corsHeaders() }
            );
        }

        // 🔐 Exchange code for access token
        const tokenRes = await axios.get(
            "https://graph.facebook.com/v19.0/oauth/access_token",
            {
                params: {
                    client_id: process.env.META_APP_ID,
                    client_secret: process.env.META_APP_SECRET,
                    redirect_uri: process.env.META_REDIRECT_URI,
                    code,
                },
            }
        );

        const accessToken = tokenRes.data.access_token;

        // 🏢 Fetch Business Managers
        const bizRes = await axios.get(
            "https://graph.facebook.com/v19.0/me/businesses",
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        );

        const business = bizRes.data?.data?.[0];
        if (!business) throw new Error("No business found");

        // 📱 Fetch WhatsApp Business Account
        const wabaRes = await axios.get(
            `https://graph.facebook.com/v19.0/${business.id}/owned_whatsapp_business_accounts`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        );

        const waba = wabaRes.data?.data?.[0];
        if (!waba) throw new Error("No WhatsApp Business Account found");

        // ☎️ Fetch phone numbers
        const phoneRes = await axios.get(
            `https://graph.facebook.com/v19.0/${waba.id}/phone_numbers`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        );

        const phone = phoneRes.data?.data?.[0];
        if (!phone) throw new Error("No WhatsApp phone number found");

        const decoded = jwt.verify(
            state,
            process.env.OAUTH_STATE_SECRET
        );

        const userId = decoded.userId;

        if (!userId) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401, headers: corsHeaders() }
            );
        }

        await UserModel.findByIdAndUpdate(
            userId,
            {
                whatsapp: {
                    connected: true,
                    accessToken,
                    wabaId: waba.id,
                    phoneNumberId: phone.id,
                    displayPhone: phone.display_phone_number,
                    connectedAt: new Date(),
                    permissions: {
                        messaging: true,
                        management: true,
                    },
                },

                whatsappConnected: true, // optional backward compatibility

                paxAI: {
                    enabled: true,
                },
            },
            { new: true }
        );


        // ✅ Redirect back to dashboard
        return NextResponse.redirect(
            `${process.env.BASE_URL}/ai-automations?whatsapp=connected`
        );

    } catch (error) {
        console.error("Meta OAuth error:", error?.response?.data || error.message);

        return NextResponse.redirect(
            `${process.env.BASE_URL}/ai-automations?whatsapp=failed`
        );
    }
}
