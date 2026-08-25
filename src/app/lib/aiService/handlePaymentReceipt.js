import SellerOrderModel from "../../ults/models/SellerOrderModel.js";
import SellerProductModel from "../../ults/models/SellerProductModel.js";
import UserModel from "../../ults/models/UserModel.js";
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
    // Scan messages backwards (newest assistant payment messages first)
    const reversedMessages = [...recentMessages].reverse();
    const assistantText = reversedMessages
        .filter((m) => m.role === "assistant" || m.senderType === "ai" || m.direction === "outbound")
        .map((m) => m.content || m.text || "")
        .join("\n");

    const fullConversationText = recentMessages
        .map((m) => m.content || m.text || "")
        .join("\n");

    // Highest priority: Explicit grand total phrasing in assistant messages
    const grandTotalPatterns = [
        /(?:grand\s+total|making\s+your\s+grand\s+total|your\s+total\s+will\s+be|total\s+amount|making\s+it)[\s:]*(?:₦|N|NGN)?\s*([\d,]+)/i,
        /once\s+you(?:'|’)?ve\s+transferred\s+(?:the\s+)?(?:₦|N|NGN)?\s*([\d,]+)/i,
        /transferred\s+the\s*(?:₦|N|NGN)?\s*([\d,]+)/i,
        /pay\s+the\s+(?:sum\s+of\s+)?(?:₦|N|NGN)?\s*([\d,]+)/i,
    ];

    for (const pattern of grandTotalPatterns) {
        const match = assistantText.match(pattern) || fullConversationText.match(pattern);
        if (match && match[1]) {
            const cleanNum = parseInt(match[1].replace(/,/g, ""), 10);
            if (!isNaN(cleanNum) && cleanNum > 0) {
                return cleanNum;
            }
        }
    }

    // Fallback: If multiple ₦ amounts are present in assistant payment quote, pick the highest number (grand total)
    const allAmounts = [];
    const amountRegex = /(?:₦|N|NGN)\s*([\d,]+)/gi;
    let match;
    while ((match = amountRegex.exec(assistantText)) !== null) {
        const val = parseInt(match[1].replace(/,/g, ""), 10);
        if (!isNaN(val) && val > 0) {
            allAmounts.push(val);
        }
    }
    if (allAmounts.length > 0) {
        return Math.max(...allAmounts);
    }

    return null;
}

async function findAllProductsFromConversation(sellerId, recentMessages = []) {
    const products = await SellerProductModel.find({ sellerId }).lean();
    if (!products.length) return [];

    const conversationText = recentMessages
        .map((m) => m.content || m.text || "")
        .join(" ")
        .toLowerCase();

    const matchedProducts = [];
    const sortedProducts = [...products].sort((a, b) => (b.name?.length || 0) - (a.name?.length || 0));

    for (const prod of sortedProducts) {
        if (!prod.name) continue;
        const nameLower = prod.name.toLowerCase();
        const escaped = prod.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const wordRegex = new RegExp(`\\b${escaped}\\b`, 'i');

        if (wordRegex.test(conversationText) || conversationText.includes(nameLower)) {
            matchedProducts.push(prod);
        }
    }

    return matchedProducts;
}

async function findProductFromConversation(sellerId, recentMessages = []) {
    const allMatched = await findAllProductsFromConversation(sellerId, recentMessages);
    return allMatched.length > 0 ? allMatched[0] : null;
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

    // 🚀 Senior Architecture: Resolve order items & price dynamically
    // Check if customer sent a newer storefront order or changed product in recent messages
    const lastUserMessage = [...recentMessages].reverse().find(m => m.role === "user" || m.direction === "inbound");
    const lastUserText = lastUserMessage?.content || lastUserMessage?.text || "";

    const hasNewStorefrontOrder = /NEW ORDER FROM STOREFRONT/i.test(lastUserText) || /NEW ORDER FROM STOREFRONT/i.test(caption);
    const multiOrderFromRecent = parseMultiProductOrderFromText(caption || lastUserText, recentMessages);

    const matchedProducts = await findAllProductsFromConversation(sellerId, recentMessages);
    const matchedProduct = matchedProducts.length > 0 ? matchedProducts[0] : null;

    let orderItems = [];
    let orderTotalPrice = 0;

    if (hasNewStorefrontOrder && multiOrderFromRecent.items.length > 0) {
        // Customer sent a new storefront order string — use the fresh storefront items!
        orderItems = multiOrderFromRecent.items;
        orderTotalPrice = extractOrderTotalFromConversation(recentMessages) || orderItems.reduce((sum, i) => sum + ((i.price || 0) * (i.quantity || 1)), 0);
    } else if (matchedProducts.length > 0 && session?.payment?.pendingItems?.length > 0) {
        // Compare recent conversation product vs session pendingItems
        const sessionItemIds = new Set(session.payment.pendingItems.map(i => i.productId?.toString()).filter(Boolean));
        const hasDifferentProductInChat = matchedProducts.some(p => !sessionItemIds.has(p._id?.toString()));

        if (hasDifferentProductInChat) {
            orderItems = matchedProducts.map(p => ({
                productId: p._id,
                name: p.name,
                price: p.discountPrice || p.price,
                quantity: 1,
                imageUrl: p.images?.[0]?.url || "",
            }));
            orderTotalPrice = extractOrderTotalFromConversation(recentMessages) || orderItems.reduce((sum, i) => sum + i.price, 0);
        } else {
            orderItems = session.payment.pendingItems;
            orderTotalPrice = session?.payment?.pendingAmount || extractOrderTotalFromConversation(recentMessages) || matchedProduct?.price || 0;
        }
    } else if (session?.payment?.pendingItems && session.payment.pendingItems.length > 0) {
        orderItems = session.payment.pendingItems;
        orderTotalPrice = session?.payment?.pendingAmount || extractOrderTotalFromConversation(recentMessages) || matchedProduct?.price || 0;
    } else if (matchedProducts.length > 0) {
        orderItems = matchedProducts.map(p => ({
            productId: p._id,
            name: p.name,
            price: p.discountPrice || p.price,
            quantity: 1,
            imageUrl: p.images?.[0]?.url || "",
        }));
        orderTotalPrice = extractOrderTotalFromConversation(recentMessages) || orderItems.reduce((sum, i) => sum + i.price, 0);
    } else if (matchedProduct) {
        orderItems = [{
            productId: matchedProduct._id,
            name: matchedProduct.name,
            price: matchedProduct.price || 0,
            quantity: 1,
            imageUrl: matchedProduct.images?.[0]?.url || "",
        }];
        orderTotalPrice = extractOrderTotalFromConversation(recentMessages) || matchedProduct.price || 0;
    }

    // Format product summary name for alerts (e.g. "Bag 1 (1x), Bag 2 (1x)")
    const productSummaryName = orderItems.length > 0
        ? orderItems.map(i => `${i.name}${i.quantity > 1 ? ` (${i.quantity}x)` : ''}`).join(", ")
        : (matchedProduct?.name || "Payment receipt received");

    // If we're in payment stage (AI already asked for proof), handle it regardless
    // of whether we can identify a specific product — the payment context is enough.
    if (!pendingOrder && !matchedProduct?._id && !paymentStage && orderItems.length === 0) {
        console.warn("Payment receipt received but no seller products found and not in payment stage");
        return { handled: false };
    }

    let order = pendingOrder;
    // Check if this order already had payment proof submitted prior to this message
    const alreadyHadProof = Boolean(order?.paymentReceiptSubmittedAt || order?.paymentReceiptUrl);
    const calculatedDeliveryFee = extractDeliveryFeeFromConversation(recentMessages, matchedProducts);

    if (!order) {
        order = await SellerOrderModel.create({
            sellerId,
            productId: matchedProduct?._id || null,
            customerPhone: normalizedPhone,
            customerName: customerName || "WhatsApp Customer",
            quantity: orderItems.reduce((sum, i) => sum + i.quantity, 0) || 1,
            totalPrice: orderTotalPrice,
            deliveryFee: calculatedDeliveryFee,
            items: orderItems,
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
        if (orderTotalPrice && orderTotalPrice !== order.totalPrice) {
            order.totalPrice = orderTotalPrice;
            orderChanged = true;
        }
        if (calculatedDeliveryFee && !order.deliveryFee) {
            order.deliveryFee = calculatedDeliveryFee;
            orderChanged = true;
        }
        if (orderItems.length > 0 && (!order.items || order.items.length === 0)) {
            order.items = orderItems;
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
                productName: productSummaryName,
                amountPaid: order.totalPrice,
                deliveryFee: order.deliveryFee,
                deliveryLocation: order.deliveryLocation || order.deliveryAddress || "",
                isConfirmed: false,
            });
            console.log("🔔 Sales alert sent for payment proof upload (Order:", order._id, "| Product:", productSummaryName, ")");
        } catch (err) {
            console.warn("Sales notification failed:", err.message);
        }
    } else {
        console.log("ℹ️ Order already had payment proof attached — skipping duplicate sales alert (Order:", order._id, ")");
    }

    // Automatically update customer's leadStage to 'converted'
    try {
        await UserModel.updateOne(
            { _id: sellerUserId, "whatsapp.contacts.list.phone": normalizedPhone },
            { $set: { "whatsapp.contacts.list.$.leadStage": "converted" } }
        );
        console.log("✅ Customer leadStage automatically updated to 'converted' for:", normalizedPhone);
    } catch (leadErr) {
        console.warn("Failed to update leadStage to converted:", leadErr.message);
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

function extractDeliveryFeeFromConversation(recentMessages = [], matchedProducts = [], inboundText = "") {
    const combinedText = inboundText + "\n" + recentMessages.map((m) => m.content || m.text || "").join("\n");

    const feeMatch = combinedText.match(/(?:Estimated Delivery Fee|delivery fee is|delivery fee|delivery cost|shipping fee|delivery):\s*(?:₦|N|NGN)?\s*([\d,]+)/i);
    if (feeMatch) {
        const fee = parseInt(feeMatch[1].replace(/,/g, ""), 10);
        if (!isNaN(fee) && fee >= 0) return fee;
    }

    if (matchedProducts && matchedProducts.length > 0) {
        const fees = matchedProducts.map(p => Number(p.deliveryFee) || 0);
        return Math.max(0, ...fees);
    }

    return 0;
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
    const extractedDeliveryFee = extractDeliveryFeeFromConversation(recentMessages, matchedProduct ? [matchedProduct] : [], inboundText);

    const order = await SellerOrderModel.create({
        orderCode,
        sellerId,
        productId: matchedProduct._id,
        customerPhone: normalizedPhone,
        customerName: customerName || "WhatsApp Customer",
        quantity: multiOrderData.items.reduce((sum, i) => sum + i.quantity, 0) || 1,
        totalPrice: orderTotalPrice,
        deliveryFee: extractedDeliveryFee,
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
