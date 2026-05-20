import SellerOrderModel from "../../ults/models/SellerOrderModel.js";
import SellerProductModel from "../../ults/models/SellerProductModel.js";
import { uploadCustomerImageToCloudinary } from "./customerImageSearch.js";
import { sendSalesNotification } from "../salesNotificationService.js";

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
