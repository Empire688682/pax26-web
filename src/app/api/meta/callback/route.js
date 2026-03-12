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

        // 🔐 Verify state JWT first (before any API calls)
        let decoded;
        try {
            decoded = jwt.verify(state, process.env.OAUTH_STATE_SECRET);
        } catch {
            return NextResponse.json(
                { success: false, message: "Invalid or expired OAuth state" },
                { status: 401 }
            );
        }

        const userId = decoded.userId;
        if (!userId) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401, headers: corsHeaders() }
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
            { headers: { Authorization: `Bearer ${accessToken}` } }
        );

        const business = bizRes.data?.data?.[0];
        if (!business) throw new Error("No business found");

        // 📱 Fetch all WABAs
        const wabaRes = await axios.get(
            `https://graph.facebook.com/v19.0/${business.id}/owned_whatsapp_business_accounts`,
            { headers: { Authorization: `Bearer ${accessToken}` } }
        );

        const allWabas = wabaRes.data?.data;
        if (!allWabas?.length) throw new Error("No WhatsApp Business Account found");

        // ☎️ Collect all phones across all WABAs
        const allPhones = [];

        for (const w of allWabas) {
            const phoneRes = await axios.get(
                `https://graph.facebook.com/v19.0/${w.id}/phone_numbers`,
                { headers: { Authorization: `Bearer ${accessToken}` } }
            );

            const phones = phoneRes.data?.data || [];

            phones.forEach(p => {
                allPhones.push({
                    id: p.id,
                    display: p.display_phone_number,
                    name: p.verified_name,
                    quality: p.quality_rating,
                    wabaId: w.id,
                    wabaName: w.name,
                });
            });
        }

        if (allPhones.length === 0) {
            throw new Error("No WhatsApp phone number found in any WABA");
        }

        // ✅ Single phone — auto connect
        if (allPhones.length === 1) {
            const phone = allPhones[0];

            await UserModel.findByIdAndUpdate(
                userId,
                {
                    whatsapp: {
                        connected: true,
                        accessToken,
                        wabaId: phone.wabaId,
                        phoneNumberId: phone.id,
                        displayPhone: phone.display,
                        connectedAt: new Date(),
                        permissions: {
                            messaging: true,
                            management: true,
                        },
                    },
                    whatsappConnected: true,
                    paxAI: { enabled: true },
                },
                { new: true }
            );

            return NextResponse.redirect(
                `${process.env.BASE_URL}/dashboard/automations/market-place?whatsapp=connected`
            );
        }

        // 📲 Multiple phones — redirect to selection page
        const tempToken = jwt.sign(
            {
                userId,
                accessToken,
                phones: allPhones,
            },
            process.env.OAUTH_STATE_SECRET,
            { expiresIn: "10m" }
        );

        return NextResponse.redirect(
            `${process.env.BASE_URL}/dashboard/automations/select-phone?token=${tempToken}`
        );

    } catch (error) {
        console.error("Meta OAuth error:", error?.response?.data || error.message);

        return NextResponse.redirect(
            `${process.env.BASE_URL}/dashboard/automations?whatsapp=failed`
        );
    }
}