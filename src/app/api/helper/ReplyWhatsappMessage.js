import axios from "axios";

export const sendWhatsAppReply = async ({ phoneNumberId, to, text }) => {
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

        const headers = {
            Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
            "Content-Type": "application/json",
        };

        console.log("Sending to:", to);
        console.log("Using phoneNumberId:", phoneNumberId);

        const response = await axios.post(url, payload, { headers });
        
        return response.data;

    } catch (error) {
        console.error("Error sending WhatsApp reply:", error.response?.data || error.message);
        return null;
    }
};