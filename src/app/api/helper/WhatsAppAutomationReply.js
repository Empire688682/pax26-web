import axios from "axios";

export const sendWhatsAppAutomationReply = async ({ phoneNumberId, to, text, accessToken }) => {
    try {
        const url = `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`;

        const payload = {
            messaging_product: "whatsapp",
            to,
            type: "text",
            text: {
                body: text,
            },
        };

        console.log("Token: ", process.env.WHATSAPP_ACCESS_TOKEN)

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