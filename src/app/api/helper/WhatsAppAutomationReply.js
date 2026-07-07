import axios from "axios";
import UserModel from "@/app/ults/models/UserModel";
import { connectDb } from "@/app/ults/db/ConnectDb";

export const sendWhatsAppAutomationReply = async ({ phoneNumberId, to, text, imageUrl, caption }) => {
    try {
        await connectDb();

        // Always use the user's own WhatsApp access token — never a global fallback.
        const user = await UserModel.findOne({ "whatsapp.phoneNumberId": phoneNumberId })
            .select("whatsapp.accessToken");

        const token = user?.whatsapp?.accessToken;

        if (!token) {
            console.error(`❌ No accessToken found for phoneNumberId: ${phoneNumberId}`);
            return {
                success: false,
                error: `No WhatsApp access token found for phoneNumberId: ${phoneNumberId}`
            };
        }

        const url = `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`;

        // Build payload — image or text
        const payload = imageUrl
            ? {
                messaging_product: "whatsapp",
                recipient_type: "individual",
                to,
                type: "image",
                image: {
                    link: imageUrl,
                    ...(caption ? { caption } : {}),
                },
            }
            : {
                messaging_product: "whatsapp",
                recipient_type: "individual",
                to,
                type: "text",
                text: { body: text },
            };

        const headers = {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        };

        console.log("Sending to:", to);
        console.log("Using phoneNumberId:", phoneNumberId);

        const response = await axios.post(url, payload, { headers });

        const messageId = response.data?.messages?.[0]?.id;

        return {
            success: true,
            messageId,
            raw: response.data
        };

    } catch (error) {
        console.error("Error sending WhatsApp reply:", error.response?.data || error.message);

        return {
            success: false,
            error: error.response?.data || error.message
        };
    }
};