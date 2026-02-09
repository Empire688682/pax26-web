import axios from "axios";

const normalizePhone = (phone) => {
  const cleaned = phone.replace(/\D/g, "");

  if (cleaned.startsWith("234")) return cleaned;
  if (cleaned.startsWith("0")) return "234" + cleaned.slice(1);

  return "234" + cleaned.slice(-10);
};

export const sendOtpViaWhatsApp = async ({ phoneNumber, otp }) => {
  try {
    const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;

    if (!PHONE_NUMBER_ID || !ACCESS_TOKEN) {
      throw new Error("WhatsApp API credentials missing");
    }

    const validPhoneNumber = normalizePhone(phoneNumber);
    console.log("Valid Phone Number:", validPhoneNumber);

    const url = `https://graph.facebook.com/v22.0/${PHONE_NUMBER_ID}/messages`;

    const payload = {
      messaging_product: "whatsapp",
      to: validPhoneNumber,
      type: "template",
      template: {
        name: "otp_verification", // 👈 YOUR APPROVED TEMPLATE
        language: { code: "en_US" },
        components: [
          {
            type: "body",
            parameters: [
              {
                type: "text",
                text: otp,
              },
            ],
          },
        ],
      },
    };

    const response = await axios.post(url, payload, {
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error(
      "WhatsApp OTP Error:",
      error?.response?.data || error.message
    );

    return {
      success: false,
      error: error?.response?.data || error.message,
    };
  }
};
