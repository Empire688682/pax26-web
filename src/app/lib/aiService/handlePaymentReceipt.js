import SellerOrderModel from "../../ults/models/SellerOrderModel.js";
import SellerProductModel from "../../ults/models/SellerProductModel.js";
import SellerProfileModel from "../../ults/models/SellerProfileModel.js";
import { uploadCustomerImageToCloudinary } from "./customerImageSearch.js";
import { sendSalesNotification } from "../salesNotificationService.js";
import Groq from "groq-sdk";

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

const PAYMENT_KEYWORDS = /payment|paid|transfer|receipt|screenshot|proof|sent|done|completed|txn|transaction|have paid|i paid/i;

const PAYMENT_STAGE_KEYWORDS =
    /account number|bank name|account name|transfer|make payment|pay to|payment details|screenshot of your payment|payment confirmation|once you.?ve transferred|send.*receipt|send.*proof|payment proof|gtbank|zenith|access|kuda|opay|palmpay|moniepoint|firstbank|ubabank|wema|sterling|stanbic|fidelity|fidelitybank|sterlingbank|wemabank|acct|acc\/num|bank:/i;

function normalizePhone(phone) {
    if (!phone) return "";
    const digits = phone.replace(/\D/g, "");
    return digits ? `+${digits}` : "";
}

function isLikelyPaymentReceipt(caption, recentMessages = []) {
    if (caption && PAYMENT_KEYWORDS.test(caption)) return true;

    const recentText = recentMessages
        .slice(-10)
        .map((m) => m.content || m.text || "")
        .join(" ")
        .toLowerCase();

    return PAYMENT_KEYWORDS.test(recentText);
}

function isPaymentStage(recentMessages = []) {
    const recentText = recentMessages
        .slice(-15)
        .map((m) => m.content || m.text || "")
        .join(" ");

    const has10DigitNum = /\b\d{10}\b/.test(recentText);
    const hasPaymentKeyword = PAYMENT_STAGE_KEYWORDS.test(recentText);
    const hasGeneralPaymentWord = /bank|account|transfer|payment|receipt|proof|pay|naira|₦/i.test(recentText);

    return has10DigitNum || hasPaymentKeyword || (hasGeneralPaymentWord && recentMessages.length > 0);
}

async function resolveProductsFromConversation(sellerId, recentMessages) {
    const [products, profile] = await Promise.all([
        SellerProductModel.find({ sellerId }).lean(),
        SellerProfileModel.findById(sellerId).lean(),
    ]);

    if (!products.length) return { items: [], subtotal: 0, deliveryFee: 0, total: 0 };

    const conversationText = recentMessages
        .map((m) => m.content || m.text || "")
        .join(" ")
        .toLowerCase();

    const matchedItems = [];
    let subtotal = 0;
    let extraDeliverySum = 0;

    for (const prod of products) {
        if (prod.name && conversationText.includes(prod.name.toLowerCase())) {
            // Check for quantity hints near product name e.g. "2 shirts", "3x shoes"
            let qty = 1;
            const nameEscaped = prod.name.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const qtyRegex = new RegExp(`(\\d+)\\s*(?:x\\s*)?${nameEscaped}|${nameEscaped}\\s*(?:x\\s*)?(\\d+)`, 'i');
            const match = conversationText.match(qtyRegex);
            if (match) {
                const parsed = parseInt(match[1] || match[2], 10);
                if (!isNaN(parsed) && parsed > 0) qty = parsed;
            }

            const itemPrice = prod.discountPrice || prod.price || 0;
            subtotal += itemPrice * qty;
            extraDeliverySum += (prod.extraShippingFee || 0) * qty;

            matchedItems.push({
                productId: prod._id,
                name: prod.name,
                price: itemPrice,
                quantity: qty,
                extraShippingFee: prod.extraShippingFee || 0,
            });
        }
    }

    // Fallback if no specific product name matched
    if (!matchedItems.length && products.length > 0) {
        const fallback = products[0];
        const price = fallback.discountPrice || fallback.price || 0;
        matchedItems.push({
            productId: fallback._id,
            name: fallback.name,
            price: price,
            quantity: 1,
            extraShippingFee: fallback.extraShippingFee || 0,
        });
        subtotal = price;
        extraDeliverySum = fallback.extraShippingFee || 0;
    }

    const baseDeliveryFee = profile?.defaultDeliveryFee || 0;
    const deliveryFee = matchedItems.length > 0 ? baseDeliveryFee + extraDeliverySum : 0;
    const total = subtotal + deliveryFee;

    return { items: matchedItems, subtotal, deliveryFee, total };
}

async function verifyReceiptWithGroq({ imageUrl, mediaUrl }) {
    try {
        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) {
            console.warn("⚠️ GROQ_API_KEY is not set, falling back to text heuristics");
            return true;
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

    const skipVerification = !!pendingOrder || paymentStage;
    if (!skipVerification) {
        const isVerifiedReceipt = await verifyReceiptWithGroq({ imageUrl: url, mediaUrl });
        if (!isVerifiedReceipt) {
            console.log("🤖 Groq verified image is NOT a payment receipt. Proceeding to product/conversation handling.");
            return { handled: false };
        }
    } else {
        console.log("✅ Payment stage detected — skipping Groq verification, treating as payment receipt.");
    }

    const { items, subtotal, deliveryFee, total } = await resolveProductsFromConversation(sellerId, recentMessages);

    if (!pendingOrder && items.length === 0 && !paymentStage) {
        console.warn("Payment receipt received but no seller products found and not in payment stage");
        return { handled: false };
    }

    const isNewOrder = !pendingOrder;
    const isFirstTimeReceiptImage = url && (!pendingOrder || !pendingOrder.paymentReceiptUrl);

    let order = pendingOrder;

    if (!order) {
        order = await SellerOrderModel.create({
            sellerId,
            productId: items[0]?.productId || null,
            items,
            customerPhone: normalizedPhone,
            customerName: customerName || "WhatsApp Customer",
            quantity: items.reduce((acc, i) => acc + i.quantity, 0) || 1,
            subtotalPrice: subtotal,
            deliveryFee,
            totalPrice: total,
            status: "pending",
            paymentReceiptUrl: url || "",
            paymentReceiptPublicId: publicId || "",
            paymentReceiptSubmittedAt: url ? new Date() : undefined,
            paymentProofAlertSent: !!url,
        });
    } else if (url) {
        order.paymentReceiptUrl = url;
        order.paymentReceiptPublicId = publicId;
        order.paymentReceiptSubmittedAt = new Date();
    }

    const itemSummaryStr = items.length > 1
        ? items.map(i => `${i.quantity}x ${i.name}`).join(", ")
        : (items[0]?.name || "Payment receipt received");

    // Only notify seller if a payment proof image is attached AND alert hasn't been sent for payment proof yet
    if (url && !order.paymentProofAlertSent) {
        try {
            await sendSalesNotification(sellerUserId, {
                orderId: order._id.toString(),
                customerName: order.customerName || order.customerPhone,
                productName: itemSummaryStr,
                amountPaid: order.totalPrice,
                isConfirmed: false,
            });
            order.paymentProofAlertSent = true;
            await order.save();
        } catch (err) {
            console.warn("Sales notification failed:", err.message);
        }
    } else if (order.isModified()) {
        await order.save();
    } else {
        console.log(`[handlePaymentReceipt] ⏭️ Sales alert already sent for order ${order._id} — suppressing duplicate.`);
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

    const { items, subtotal, deliveryFee, total } = await resolveProductsFromConversation(sellerId, recentMessages);

    if (existing) {
        // If customer updated their cart or items, update existing pending order
        if (items.length > 0) {
            existing.items = items;
            existing.subtotalPrice = subtotal;
            existing.deliveryFee = deliveryFee;
            existing.totalPrice = total;
            existing.quantity = items.reduce((acc, i) => acc + i.quantity, 0) || 1;
            await existing.save();
        }
        return { created: false, order: existing };
    }

    const paidViaText = inboundText && PAYMENT_KEYWORDS.test(inboundText);
    if (!isPaymentStage(recentMessages) && !paidViaText) return { created: false };

    if (items.length === 0) return { created: false };

    const order = await SellerOrderModel.create({
        sellerId,
        productId: items[0]?.productId || null,
        items,
        customerPhone: normalizedPhone,
        customerName: customerName || "WhatsApp Customer",
        quantity: items.reduce((acc, i) => acc + i.quantity, 0) || 1,
        subtotalPrice: subtotal,
        deliveryFee,
        totalPrice: total,
        status: "pending",
    });

    console.log(`[createPendingOrderFromText] 📝 Created pending order draft ${order._id} — awaiting payment proof before sending sales alert.`);
    return { created: true, order };

    return { created: true, order };
}

export function buildPaymentReceiptContext() {
    return `[SYSTEM: Customer sent a payment proof / receipt screenshot.
The receipt has been recorded and sent to the seller team for verification.
Reply IMMEDIATELY to the customer with this exact response (or very close variant):
"Thank you for sending your payment proof! Our team is verifying your payment and will forward your official receipt once confirmed."
Do NOT ask for any further proof or images.]`;
}
