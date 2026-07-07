import UserModel from "@/app/ults/models/UserModel";
import { connectDb } from "@/app/ults/db/ConnectDb";

const WHATSAPP_API_VERSION = "v19.0";
const WHATSAPP_API_BASE = "https://graph.facebook.com";

export async function sendWhatsAppImageReply({
    phoneNumberId,
    to,
    imageUrl,
    caption = "",
}) {
    if (!phoneNumberId || !to || !imageUrl) {
        console.warn("⚠️ sendWhatsAppImageReply: missing required fields");
        return { success: false, error: "Missing phoneNumberId, to, or imageUrl" };
    }

    try {
        await connectDb();

        // Always use the user's own access token — never the global env token
        const user = await UserModel.findOne({ "whatsapp.phoneNumberId": phoneNumberId })
            .select("whatsapp.accessToken");

        const token = user?.whatsapp?.accessToken;

        if (!token) {
            console.error(`❌ No accessToken found for phoneNumberId: ${phoneNumberId}`);
            return {
                success: false,
                error: `No WhatsApp access token found for phoneNumberId: ${phoneNumberId}`,
            };
        }

        const url = `${WHATSAPP_API_BASE}/${WHATSAPP_API_VERSION}/${phoneNumberId}/messages`;

        const res = await fetch(url, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                messaging_product: "whatsapp",
                recipient_type: "individual",
                to,
                type: "image",
                image: {
                    link: imageUrl,
                    ...(caption ? { caption } : {}),
                },
            }),
        });

        const data = await res.json();

        if (!res.ok || data.error) {
            console.error("❌ WhatsApp image send failed:", data.error || data);
            return {
                success: false,
                error: data.error,
                messageId: null,
            };
        }

        const messageId = data.messages?.[0]?.id || null;
        console.log("✅ WhatsApp image sent, messageId:", messageId);

        return { success: true, messageId };
    } catch (err) {
        console.error("❌ sendWhatsAppImageReply network error:", err.message);
        return { success: false, error: err.message, messageId: null };
    }
}
