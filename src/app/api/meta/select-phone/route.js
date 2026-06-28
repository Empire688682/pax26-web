import { NextResponse } from "next/server";
import { connectDb } from "@/app/ults/db/ConnectDb";
import UserModel from "@/app/ults/models/UserModel";
import TempSessionModel from "@/app/ults/models/TempSessionModel";
import { corsHeaders } from "@/app/ults/corsHeaders/corsHeaders";
import crypto from "crypto";

export async function OPTIONS() {
    return new NextResponse(null, { status: 200, headers: corsHeaders() });
}

/**
 * POST /api/meta/select-phone
 * Body: { sessionId, phoneId }
 */
export async function POST(req) {
    try {
        await connectDb();

        const { sessionId, phoneId } = await req.json();

        if (!sessionId || !phoneId) {
            return NextResponse.json(
                { success: false, message: "Missing sessionId or phoneId" },
                { status: 400, headers: corsHeaders() }
            );
        }

        // 🔍 Look up session — must exist (expiry is handled by MongoDB TTL index)
        const session = await TempSessionModel.findOne({ sessionId });


        if (!session) {
            return NextResponse.json(
                { success: false, message: "Session expired. Please reconnect WhatsApp." },
                { status: 401, headers: corsHeaders() }
            );
        }

        // 📱 Find the selected phone
        const phone = session.phones.find((p) => p.id === phoneId);

        if (!phone) {
            return NextResponse.json(
                { success: false, message: "Invalid phone selection." },
                { status: 400, headers: corsHeaders() }
            );
        }

        // 🔒 Uniqueness check — prevent two accounts from sharing the same number
        const existingOwner = await UserModel.findOne({
            "whatsapp.phoneNumberId": phone.id,
            "whatsapp.connected": true,
            _id: { $ne: session.userId }, // exclude the current user (reconnect case)
        }).select("_id email").lean();

        if (existingOwner) {
            return NextResponse.json(
                {
                    success: false,
                    message: "This WhatsApp number is already connected to another Pax26 account. Please disconnect it from that account first, or use a different number.",
                },
                { status: 409, headers: corsHeaders() }
            );
        }

        // ── Confirm activation via Graph API ─────────────────────
        // Verify the number actually flipped to VERIFIED / CONNECTED
        // before marking it active in our DB.
        let confirmedStatus = phone.verificationStatus || "UNKNOWN";
        try {
            const statusRes = await fetch(
                `https://graph.facebook.com/v22.0/${phone.id}?fields=code_verification_status,status&access_token=${session.accessToken}`
            );
            const statusData = await statusRes.json();
            if (statusData.error) {
                console.error(`❌ Status confirmation failed for ${phone.id}:`, JSON.stringify(statusData.error));
            } else {
                confirmedStatus = statusData.code_verification_status || confirmedStatus;
                console.log(`✅ Phone ${phone.id} status confirmed: code_verification_status=${confirmedStatus}, status=${statusData.status}`);
            }
        } catch (err) {
            console.error(`❌ Status confirmation exception for ${phone.id}:`, err.message);
        }

        // If the status is VERIFIED, register the number to ensure it gets activated on Meta
        if (confirmedStatus === "VERIFIED") {
            let pin;
            let encryptedPin = phone.registrationPin;
            if (!encryptedPin) {
                // Generate a fresh PIN
                const rawPin = String(Math.floor(100000 + Math.random() * 900000));
                const key = crypto.scryptSync(process.env.SECRET_KEY || "pax26", "pax26salt", 32);
                const iv = crypto.randomBytes(16);
                const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
                const encrypted = Buffer.concat([cipher.update(rawPin, "utf8"), cipher.final()]);
                encryptedPin = `${iv.toString("hex")}:${encrypted.toString("hex")}`;
                phone.registrationPin = encryptedPin;
                pin = rawPin;
            } else {
                try {
                    const key = crypto.scryptSync(process.env.SECRET_KEY || "pax26", "pax26salt", 32);
                    const [ivHex, encHex] = encryptedPin.split(":");
                    const decipher = crypto.createDecipheriv("aes-256-cbc", key, Buffer.from(ivHex, "hex"));
                    pin = Buffer.concat([decipher.update(Buffer.from(encHex, "hex")), decipher.final()]).toString("utf8");
                } catch (decErr) {
                    console.error("❌ Decrypt existing PIN failed in select-phone, generating fresh:", decErr.message);
                    const rawPin = String(Math.floor(100000 + Math.random() * 900000));
                    const key = crypto.scryptSync(process.env.SECRET_KEY || "pax26", "pax26salt", 32);
                    const iv = crypto.randomBytes(16);
                    const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
                    const encrypted = Buffer.concat([cipher.update(rawPin, "utf8"), cipher.final()]);
                    encryptedPin = `${iv.toString("hex")}:${encrypted.toString("hex")}`;
                    phone.registrationPin = encryptedPin;
                    pin = rawPin;
                }
            }

            try {
                const regRes = await fetch(
                    `https://graph.facebook.com/v22.0/${phone.id}/register`,
                    {
                        method: "POST",
                        headers: {
                            Authorization: `Bearer ${session.accessToken}`,
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ messaging_product: "whatsapp", pin }),
                    }
                );
                const regData = await regRes.json();
                console.log("✅ select-phone register response:", regData);
                if (regData.error) {
                    console.error(`❌ Registration failed during select-phone for ${phone.id}:`, regData.error);
                } else {
                    confirmedStatus = "REGISTERED";
                    console.log(`✅ Phone ${phone.id} registered successfully during select-phone`);
                }
            } catch (regErr) {
                console.error("❌ Registration API call failed in select-phone route:", regErr.message);
            }
        }

        // 💾 Save to user — additive fields only, no existing field renamed or removed
        await UserModel.findByIdAndUpdate(
            session.userId,
            {
                $set: {
                    "whatsapp.connected": true,
                    "whatsapp.accessToken": session.accessToken,
                    "whatsapp.wabaId": phone.wabaId,
                    "whatsapp.phoneNumberId": phone.id,
                    "whatsapp.displayPhone": phone.display,
                    "whatsapp.connectedAt": new Date(),
                    "whatsapp.permissions": {
                        messaging: true,
                        management: true,
                    },
                    // NEW additive fields — safe to add
                    "whatsapp.codeVerificationStatus": confirmedStatus,
                    ...(phone.registrationPin && { "whatsapp.registrationPin": phone.registrationPin }),
                    "paxAI.enabled": true,
                }
            },
            { new: true }
        );

        // 🗑️ Delete session after use (one-time use)
        await TempSessionModel.deleteOne({ sessionId });

        return NextResponse.json(
            { success: true, message: "WhatsApp connected successfully." },
            { status: 200, headers: corsHeaders() }
        );

    } catch (error) {
        console.error("select-phone error:", error.message);
        return NextResponse.json(
            { success: false, message: "Server error. Please try again." },
            { status: 500, headers: corsHeaders() }
        );
    }
}