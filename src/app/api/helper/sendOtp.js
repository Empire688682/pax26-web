import axios from "axios";

export const sendOtpViaWhatsApp = async ({ phoneNumber, otp }) => {
  try {
    const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;

    const validPhoneNumber = "234" + phoneNumber.slice(-10) // Get last 10 digits;
    console.log("Valid Phone Number:", validPhoneNumber);
    const url = `https://graph.facebook.com/v22.0/${PHONE_NUMBER_ID}/messages`;

    const payload = {
      messaging_product: "whatsapp",
      to: validPhoneNumber, // must be in international format e.g. 2348012345678
      type: "template",
      template: {
        name: "hello_world", // otp_verification // 👈 your approved template name
        language: {
          code: "en_US",
        }
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
