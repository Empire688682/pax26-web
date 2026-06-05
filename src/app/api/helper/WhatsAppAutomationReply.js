import axios from "axios";
import UserModel from "@/app/ults/models/UserModel";
import { connectDb } from "@/app/ults/db/ConnectDb";

export const sendWhatsAppAutomationReply = async ({ phoneNumberId, to, text }) => {
    try {
        await connectDb();
        const user = await UserModel.findOne({ "whatsapp.phoneNumberId": phoneNumberId });

        if (user && user.whatsapp?.connectionType === "qr") {
            const qrUrl = process.env.QR_SERVICE_URL || "http://localhost:3001";
            const qrSecret = process.env.QR_SERVICE_SECRET || "pax26_qr_service_secret_688682";

            const response = await axios.post(`${qrUrl}/api/message/send`, {
                userId: user._id.toString(),
                to,
                text
            }, {
                headers: { "Authorization": `Bearer ${qrSecret}` }
            });

            return {
                success: true,
                messageId: response.data?.messageId,
                raw: response.data
            };
        }

        const url = `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`;

        const payload = {
            messaging_product: "whatsapp",
            recipient_type: "individual",
            to,
            type: "text",
            text: {
                body: text
            }
        };

        const headers = {
            Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
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