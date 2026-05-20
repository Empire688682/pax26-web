import SellerOrderModel from "../../ults/models/SellerOrderModel.js";
import SellerProductModel from "../../ults/models/SellerProductModel.js";
import { uploadCustomerImageToCloudinary } from "./customerImageSearch.js";
import { sendSalesNotification } from "../salesNotificationService.js";
import Groq from "groq-sdk";

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

const PAYMENT_KEYWORDS = /payment|paid|transfer|receipt|screenshot|proof|sent|done|completed|txn|transaction|have paid|i paid/i;

const PAYMENT_STAGE_KEYWORDS =
    /account number|bank name|account name|transfer|make payment|pay to|payment details|screenshot of your payment|payment confirmation|once you.?ve transferred|send.*receipt|send.*proof|payment proof/i;

function normalizePhone(phone) {
    if (!phone) return "";
    const digits = phone.replace(/\D/g, "");
    return digits ? `+${digits}` : "";
}

function isLikelyPaymentReceipt(caption, recentMessages = []) {
    if (caption && PAYMENT_KEYWORDS.test(caption)) return true;

    const recentText = recentMessages
        .slice(-8)
        .map((m) => m.content || m.text || "")
        .join(" ")
        .toLowerCase();

    return PAYMENT_KEYWORDS.test(recentText);
}

function isPaymentStage(recentMessages = []) {
    const recentText = recentMessages
        .slice(-12)
        .map((m) => m.content || m.text || "")
        .join(" ");

    return PAYMENT_STAGE_KEYWORDS.test(recentText);
}

async function findProductFromConversation(sellerId, recentMessages) {
    const products = await SellerProductModel.find({ sellerId }).lean();
    if (!products.length) return null;

    const conversationText = recentMessages.map((m) => m.content || m.text || "").join(" ").toLowerCase();

    for (const prod of products) {
        if (prod.name && conversationText.includes(prod.name.toLowerCase())) {
            return prod;
        }
    }
    return products[0];
}

async function resolveProduct(sellerId, recentMessages) {
    return findProductFromConversation(sellerId, recentMessages);
}

async function verifyReceiptWithGroq({ imageUrl, mediaUrl }) {
    try {
        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) {
            console.warn("⚠️ GROQ_API_KEY is not set, falling back to text heuristics");
            return true; // Fallback to true to preserve existing behavior if API key is missing
        }

        let buffer;
        let mimeType = "image/jpeg";

        if (imageUrl) {
            console.log("Fetching image from Cloudinary for Groq check:", imageUrl);
            const res = await fetch(imageUrl);
            if (!res.ok) throw new Error(`Failed to fetch Cloudinary image: ${res.statusText}`);
            const arrayBuffer = await res.arrayBuffer();
            buffer = Buffer.from(arrayBuffer);
            mimeType = res.headers.get("content-type") || "image/jpeg";
        } else if (mediaUrl) {
            console.log("Fetching image from WhatsApp CDN for Groq check:", mediaUrl);
            const res = await fetch(mediaUrl, {
                headers: {
                    Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
                },
            });
            if (!res.ok) throw new Error(`Failed to fetch WhatsApp media: ${res.statusText}`);
            const arrayBuffer = await res.arrayBuffer();
            buffer = Buffer.from(arrayBuffer);
            mimeType = res.headers.get("content-type") || "image/jpeg";
        } else {
            console.warn("No imageUrl or mediaUrl provided for Groq check");
            return false;
        }

        const prompt = `Analyze this image. Determine if it is a bank transfer receipt, payment proof, transaction confirmation screenshot, deposit slip, or billing receipt.
Respond with a JSON object containing:
- "isPaymentReceipt": boolean (true if it is a proof of payment, false otherwise)
- "confidence": number (between 0 and 1)
- "reason": string (brief explanation of why)

Return ONLY the raw JSON object, without any markdown formatting blocks (like \`\`\`json) or extra text.`;

        const chatCompletion = await groq.chat.completions.create({
            model: "meta-llama/llama-4-scout-17b-16e-instruct",
            messages: [
                {
                    role: "user",
                    content: [
                        { type: "text", text: prompt },
                        {
                            type: "image_url",
                            image_url: {
                                url: `data:${mimeType};base64,${buffer.toString("base64")}`,
                            },
                        },
                    ],
                },
            ],
            response_format: { type: "json_object" },
            temperature: 0.1,
            max_tokens: 300,
        });

        const text = chatCompletion.choices[0].message.content.trim();
        console.log("Groq Payment Receipt verification response:", text);

        const json = JSON.parse(text);
        return json.isPaymentReceipt === true && json.confidence > 0.65;
    } catch (err) {
        console.error("❌ Error verifying payment receipt with Groq:", err);
        // Fallback: in case of API/parsing failure, we default to true to avoid blocking payment receipt processing
        return true;
    }
}

/**
 * Attach a customer payment receipt to a pending order (or create one).
 */
export async function handlePaymentReceipt({
    sellerId,
    sellerUserId,
    mediaUrl,
    customerPhone,
    customerName,
    caption = "",
    recentMessages = [],
    imageUrl = null,
    imagePublicId = null,
}) {
    const normalizedPhone = normalizePhone(customerPhone);

    const pendingOrder = await SellerOrderModel.findOne({
        sellerId,
        customerPhone: normalizedPhone,
        status: "pending",
    }).sort({ createdAt: -1 });

    const likelyReceipt = isLikelyPaymentReceipt(caption, recentMessages);
    const paymentStage = isPaymentStage(recentMessages);

    // Treat inbound images as payment proof when in payment stage, keywords match, or pending order exists
    if (!pendingOrder && !likelyReceipt && !paymentStage) {
        return { handled: false };
    }

    let url = imageUrl;
    let publicId = imagePublicId;

    if (!url && mediaUrl) {
        try {
            const uploaded = await uploadCustomerImageToCloudinary(
                mediaUrl,
                sellerId,
                normalizedPhone,
                "payment-receipts"
            );
            url = uploaded.url;
            publicId = uploaded.publicId;
        } catch (err) {
            console.error("Payment receipt upload failed:", err.message);
            if (!pendingOrder) return { handled: false };
        }
    }

    // Verify using Groq vision model that the image is actually a payment receipt
    const isVerifiedReceipt = await verifyReceiptWithGroq({ imageUrl: url, mediaUrl });
    if (!isVerifiedReceipt) {
        console.log("🤖 Groq verified image is NOT a payment receipt. Proceeding to product/conversation handling.");
        return { handled: false };
    }

    const matchedProduct = await resolveProduct(sellerId, recentMessages);
    if (!pendingOrder && !matchedProduct?._id) {
        console.warn("Payment receipt received but no seller products found");
        return { handled: false };
    }

    let order = pendingOrder;

    if (!order) {
        order = await SellerOrderModel.create({
            sellerId,
            productId: matchedProduct._id,
            customerPhone: normalizedPhone,
            customerName: customerName || "WhatsApp Customer",
            quantity: 1,
            totalPrice: matchedProduct.price || 0,
            status: "pending",
            paymentReceiptUrl: url || "",
            paymentReceiptPublicId: publicId || "",
            paymentReceiptSubmittedAt: url ? new Date() : undefined,
        });
    } else if (url) {
        order.paymentReceiptUrl = url;
        order.paymentReceiptPublicId = publicId;
        order.paymentReceiptSubmittedAt = new Date();
        await order.save();
    }

    try {
        await sendSalesNotification(sellerUserId, {
            orderId: order._id.toString(),
            customerName: order.customerName || order.customerPhone,
            productName: "Payment receipt received — review required",
            amountPaid: order.totalPrice,
        });
    } catch (err) {
        console.warn("Sales notification failed:", err.message);
    }

    return { handled: true, order };
}

/** Create pending order when customer confirms payment via text (no image yet) */
export async function createPendingOrderFromText({
    sellerId,
    sellerUserId,
    customerPhone,
    customerName,
    recentMessages = [],
    inboundText = "",
}) {
    const normalizedPhone = normalizePhone(customerPhone);

    const existing = await SellerOrderModel.findOne({
        sellerId,
        customerPhone: normalizedPhone,
        status: "pending",
    });

    if (existing) return { created: false, order: existing };

    const paidViaText = inboundText && PAYMENT_KEYWORDS.test(inboundText);
    if (!isPaymentStage(recentMessages) && !paidViaText) return { created: false };

    const matchedProduct = await resolveProduct(sellerId, recentMessages);
    if (!matchedProduct?._id) return { created: false };

    const order = await SellerOrderModel.create({
        sellerId,
        productId: matchedProduct._id,
        customerPhone: normalizedPhone,
        customerName: customerName || "WhatsApp Customer",
        quantity: 1,
        totalPrice: matchedProduct.price || 0,
        status: "pending",
    });

    try {
        await sendSalesNotification(sellerUserId, {
            orderId: order._id.toString(),
            customerName: order.customerName || order.customerPhone,
            productName: "New pending order — awaiting payment proof",
            amountPaid: order.totalPrice,
        });
    } catch (err) {
        console.warn("Sales notification failed:", err.message);
    }

    return { created: true, order };
}

export function buildPaymentReceiptContext() {
    return `[SYSTEM: Customer sent a payment receipt screenshot.
The receipt has been saved and forwarded to the seller for manual verification.
Do NOT confirm the order yourself.
Reply briefly: thank them for the payment proof, say the team will verify it shortly, and they will receive a confirmation once approved.]`;
}
