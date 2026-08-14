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

function isPaymentStage(recentMessages = [], session = null) {
    if (session?.payment?.expectingPayment === true && session?.payment?.paymentProofReceived !== true) {
        return true;
    }
    if (session?.payment?.paymentDetailsSharedAt && session?.payment?.paymentProofReceived !== true) {
        return true;
    }

    // Only consider assistant's recent messages as payment stage indicator if assistant explicitly gave bank/payment details
    const assistantText = recentMessages
        .filter((m) => m.role === "assistant" || m.direction === "outbound")
        .slice(-6)
        .map((m) => m.content || m.text || "")
        .join(" ");

    const assistantSharedBankDetails = PAYMENT_STAGE_KEYWORDS.test(assistantText) || /\b\d{10}\b/.test(assistantText);
    return assistantSharedBankDetails;
}

function extractOrderTotalFromConversation(recentMessages = []) {
    const conversationText = recentMessages
        .map((m) => m.content || m.text || "")
        .join("\n");

    const grandTotalPatterns = [
        /(?:grand\s+total|total\s+amount|total|grandtotal)[\s:]*(?:₦|N|NGN)?\s*([\d,]+)/i,
        /once\s+you(?:'|’)?ve\s+transferred\s+the\s*(?:₦|N|NGN)?\s*([\d,]+)/i,
        /transferred\s+the\s*(?:₦|N|NGN)?\s*([\d,]+)/i,
        /pay\s+the\s+(?:sum\s+of\s+)?(?:₦|N|NGN)?\s*([\d,]+)/i,
    ];

    for (const pattern of grandTotalPatterns) {
        const match = conversationText.match(pattern);
        if (match && match[1]) {
            const cleanNum = parseInt(match[1].replace(/,/g, ""), 10);
            if (!isNaN(cleanNum) && cleanNum > 0) {
                return cleanNum;
            }
        }
    }
    return null;
}

async function findProductFromConversation(sellerId, recentMessages = []) {
    const products = await SellerProductModel.find({ sellerId }).lean();
    if (!products.length) return null;

    const conversationText = recentMessages
        .map((m) => m.content || m.text || "")
        .join(" ")
        .toLowerCase();

    // 1. Line pattern matching (e.g. "1x Shoe", "• Shoe", "- Shoe")
    for (const prod of products) {
        if (!prod.name) continue;
        const escaped = prod.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const itemLineRegex = new RegExp(`(?:\\d+x|•|·|-|\\*)\\s*${escaped}`, 'i');
        if (itemLineRegex.test(conversationText)) {
            return prod;
        }
    }

    // 2. Sort by name length descending so longer/more specific names match first
    const sortedProducts = [...products].sort((a, b) => (b.name?.length || 0) - (a.name?.length || 0));
    for (const prod of sortedProducts) {
        if (!prod.name) continue;
        const nameLower = prod.name.toLowerCase();
        const wordRegex = new RegExp(`\\b${prod.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
        if (wordRegex.test(conversationText) || conversationText.includes(nameLower)) {
            return prod;
        }
    }

    // 3. Price matching in text
    for (const prod of products) {
        if (prod.price && conversationText.includes(prod.price.toString())) {
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
    session = null,
    imageUrl = null,
    imagePublicId = null,
}) {
    const normalizedPhone = normalizePhone(customerPhone);

    const pendingOrder = await SellerOrderModel.findOne({
        sellerId,
        customerPhone: normalizedPhone,
        status: "pending",
    }).sort({ createdAt: -1 });

    const paymentStage = isPaymentStage(recentMessages, session);

    // Treat inbound images as payment proof ONLY when in an active payment stage (expectingPayment / bank details shared)
    if (!pendingOrder && !paymentStage) {
        console.log("ℹ️ No active payment stage or pending order expecting payment — ignoring image as payment receipt.");
        return { handled: false, noActivePaymentStage: true };
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
            url = "";
            publicId = "";
        }
    }

    // Verify using Groq vision model that the image is actually a payment receipt
    // BUT: if there's a pending order OR we're clearly in payment stage, trust the context
    // and skip AI verification — the conversation already told us payment was expected.
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

    const matchedProduct = await resolveProduct(sellerId, recentMessages);
    const parsedTotal = extractOrderTotalFromConversation(recentMessages);
    const orderTotalPrice = parsedTotal || matchedProduct?.price || 0;

    // If we're in payment stage (AI already asked for proof), handle it regardless
    // of whether we can identify a specific product — the payment context is enough.
    if (!pendingOrder && !matchedProduct?._id && !paymentStage) {
        console.warn("Payment receipt received but no seller products found and not in payment stage");
        return { handled: false };
    }

    let order = pendingOrder;
    // Check if this order already had payment proof submitted prior to this message
    const alreadyHadProof = Boolean(order?.paymentReceiptSubmittedAt || order?.paymentReceiptUrl);

    if (!order) {
        order = await SellerOrderModel.create({
            sellerId,
            productId: matchedProduct?._id || null,
            customerPhone: normalizedPhone,
            customerName: customerName || "WhatsApp Customer",
            quantity: 1,
            totalPrice: orderTotalPrice,
            status: "pending",
            paymentReceiptUrl: url || "",
            paymentReceiptPublicId: publicId || "",
            paymentReceiptSubmittedAt: new Date(),
        });
    } else {
        let orderChanged = false;
        if (url) {
            order.paymentReceiptUrl = url;
            order.paymentReceiptPublicId = publicId;
            orderChanged = true;
        }
        if (!order.paymentReceiptSubmittedAt) {
            order.paymentReceiptSubmittedAt = new Date();
            orderChanged = true;
        }
        if (parsedTotal && parsedTotal !== order.totalPrice) {
            order.totalPrice = parsedTotal;
            orderChanged = true;
        }
        if (orderChanged) {
            await order.save();
        }
    }

    // Since handlePaymentReceipt is executed ONLY when a customer submits an image payment receipt,
    // if this order has NOT sent a proof alert previously (!alreadyHadProof), trigger the sales alert now!
    const isFirstProofUpload = !alreadyHadProof;

    if (isFirstProofUpload) {
        try {
            await sendSalesNotification(sellerUserId, {
                orderId: order._id.toString(),
                customerName: order.customerName || order.customerPhone,
                productName: matchedProduct?.name || "Payment receipt received",
                amountPaid: order.totalPrice,
                isConfirmed: false,
            });
            console.log("🔔 Sales alert sent for payment proof upload (Order:", order._id, ")");
        } catch (err) {
            console.warn("Sales notification failed:", err.message);
        }
    } else {
        console.log("ℹ️ Order already had payment proof attached — skipping duplicate sales alert (Order:", order._id, ")");
    }

    return { handled: true, order, isNewProof: isFirstProofUpload };
}

function generateOrderCode() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "ORD-";
    for (let i = 0; i < 5; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

function parseMultiProductOrderFromText(inboundText = "", recentMessages = []) {
    const combinedText = inboundText + "\n" + recentMessages.map((m) => m.content || m.text || "").join("\n");

    // Extract Delivery Location if present (e.g. 📍 Delivery Location: Ikeja, Lagos)
    const locationMatch = combinedText.match(/(?:📍\s*Delivery\s*Location|Delivery\s*Address|Address|Location):\s*([^\n]+)/i);
    const deliveryLocation = locationMatch ? locationMatch[1].trim() : "";

    // Extract items list (e.g., • 2x Jordan 1 Retro High — ₦110,000)
    const itemLines = [];
    const lines = combinedText.split("\n");

    const itemRegex = /(?:[•·\-\*]|\d+\.)\s*(\d+)?x?\s*\*?([^\*\n—–\-]+)\*?\s*(?:\(Qty:\s*(\d+)\))?\s*[—–\-]?\s*(?:₦|N|NGN)?\s*([\d,]+)?/i;

    lines.forEach((line) => {
        const match = line.match(itemRegex);
        if (match) {
            const quantity = parseInt(match[1] || match[3] || "1", 10);
            const name = match[2]?.trim();
            const itemTotalPrice = match[4] ? parseInt(match[4].replace(/,/g, ""), 10) : 0;
            if (name && name.length > 2 && !/total|delivery|product page|hi! i'm interested/i.test(name)) {
                const qtyVal = isNaN(quantity) || quantity <= 0 ? 1 : quantity;
                itemLines.push({
                    name,
                    quantity: qtyVal,
                    price: itemTotalPrice > 0 ? Math.round(itemTotalPrice / qtyVal) : 0,
                });
            }
        }
    });

    return {
        deliveryLocation,
        items: itemLines,
    };
}

/** Create pending order when customer confirms payment via text (no image yet) */
export async function createPendingOrderFromText({
    sellerId,
    sellerUserId,
    customerPhone,
    customerName,
    recentMessages = [],
    inboundText = "",
    session = null,
}) {
    const normalizedPhone = normalizePhone(customerPhone);

    const existing = await SellerOrderModel.findOne({
        sellerId,
        customerPhone: normalizedPhone,
        status: "pending",
    });

    if (existing) return { created: false, order: existing };

    const paymentStage = isPaymentStage(recentMessages, session);
    const paidViaText = inboundText && PAYMENT_KEYWORDS.test(inboundText);

    // ONLY create pending order from text if an active payment stage exists (expectingPayment === true)
    if (!paymentStage || !paidViaText) {
        return { created: false, noActivePaymentStage: !paymentStage };
    }

    const matchedProduct = await resolveProduct(sellerId, recentMessages);
    if (!matchedProduct?._id) return { created: false };

    const parsedTotal = extractOrderTotalFromConversation(recentMessages);
    const orderTotalPrice = parsedTotal || matchedProduct.price || 0;
    const orderCode = generateOrderCode();
    const multiOrderData = parseMultiProductOrderFromText(inboundText, recentMessages);

    const order = await SellerOrderModel.create({
        orderCode,
        sellerId,
        productId: matchedProduct._id,
        customerPhone: normalizedPhone,
        customerName: customerName || "WhatsApp Customer",
        quantity: multiOrderData.items.reduce((sum, i) => sum + i.quantity, 0) || 1,
        totalPrice: orderTotalPrice,
        items: multiOrderData.items.length ? multiOrderData.items : [{
            productId: matchedProduct._id,
            name: matchedProduct.name,
            price: matchedProduct.price || orderTotalPrice,
            quantity: 1,
            imageUrl: matchedProduct.images?.[0]?.url || "",
        }],
        deliveryLocation: multiOrderData.deliveryLocation || "",
        status: "pending",
    });

    return { created: true, order };
}

export function buildPaymentReceiptContext() {
    return `[SYSTEM: Customer sent a payment proof / receipt screenshot.
The receipt has been recorded and sent to the seller team for verification.
Reply IMMEDIATELY to the customer with this exact response (or very close variant):
"Thank you for sending your payment proof! Our team is verifying your payment and will forward your official receipt once confirmed."
Do NOT ask for any further proof or images.]`;
}
