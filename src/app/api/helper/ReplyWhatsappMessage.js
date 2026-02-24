import axios from "axios";

export const sendWhatsAppReply = async ({ phoneNumberId, to, text }) => {
    try {
        const url = `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`;

        const payload = {
            messaging_product: "whatsapp",
            to,
            text: {
                body: text,
            },
        };

        const headers = {
            Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
            "Content-Type": "application/json",
        };

        const response = await axios.post(url, payload, { headers });
        return response.data;
    } catch (error) {
        console.log("SendWhatsappErr:", error.response?.data || error.message);
        return null;
    }
};
