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

        // console.log("TOKEN: ", process.env.NEXT_PUBLIC_WHATSAPP_ACCESS_TOKEN);
        // console.log("payload: ", payload);

        const headers = {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_WHATSAPP_ACCESS_TOKEN}`,
            "Content-Type": "application/json",
        };

        const response = await axios.post(url, payload, { headers });
        // console.log("Res: ", response);
        return response.data;
    } catch (error) {
        console.log("SendWhatsappErr: ", error)
    }
};
