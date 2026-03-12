import { NextResponse } from "next/server";
import { connectDb } from "@/app/ults/db/ConnectDb";
import UserModel from "@/app/ults/models/UserModel";
import TempSessionModel from "@/app/ults/models/TempSessionModel";
import { corsHeaders } from "@/app/ults/corsHeaders/corsHeaders";
import axios from "axios";
import jwt from "jsonwebtoken";
import crypto from "crypto";

export async function OPTIONS() {
    return new NextResponse(null, { status: 200, headers: corsHeaders() });
}

export async function GET(req) {
    try {
        await connectDb();

        const { searchParams } = new URL(req.url);
        const code = searchParams.get("code");
        const state = searchParams.get("state");

        if (!code) {
            return NextResponse.redirect(
                `${process.env.BASE_URL}/dashboard/automations?whatsapp=failed&reason=missing_code`
            );
        }

        // 🔐 Verify state JWT first
        let decoded;
        try {
            decoded = jwt.verify(state, process.env.OAUTH_STATE_SECRET);
        } catch {
            return NextResponse.redirect(
                `${process.env.BASE_URL}/dashboard/automations?whatsapp=failed&reason=expired_state`
            );
        }

        const userId = decoded.userId;
        if (!userId) {
            return NextResponse.redirect(
                `${process.env.BASE_URL}/dashboard/automations?whatsapp=failed&reason=unauthorized`
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

        // 🏢 Fetch Business
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
            phones.forEach((p) => {
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

        if (allPhones.length === 0) throw new Error("No phone numbers found");

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
                        permissions: { messaging: true, management: true },
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

        // 📲 Multiple phones — save server-side, pass only sessionId to browser
        const sessionId = crypto.randomUUID();

        await TempSessionModel.create({
            sessionId,
            userId,
            accessToken,  // ✅ never exposed to browser
            phones: allPhones,
            expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 min TTL
        });

        return NextResponse.redirect(
            `${process.env.BASE_URL}/dashboard/automations/select-phone?session=${sessionId}`
        );

    } catch (error) {
        console.error("Meta OAuth error:", error?.response?.data || error.message);
        return NextResponse.redirect(
            `${process.env.BASE_URL}/dashboard/automations?whatsapp=failed`
        );
    }
}