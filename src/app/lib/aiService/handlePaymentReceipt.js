import cloudinary from "cloudinary";
import SellerOrderModel from "../../ults/models/SellerOrderModel.js";

cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
import SellerProductModel from "../../ults/models/SellerProductModel.js";
import { sendSalesNotification } from "../salesNotificationService.js";

const PAYMENT_KEYWORDS = /payment|paid|transfer|receipt|screenshot|proof|sent|done|completed|txn|transaction/i;

async function uploadPaymentReceipt(mediaUrl, sellerId, customerPhone) {
    const response = await fetch(mediaUrl, {
        headers: { Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}` },
    });
    if (!response.ok) {
        throw new Error(`Failed to fetch WhatsApp media: ${response.statusText}`);
    }

    const buffer = Buffer.from(await response.arrayBuffer());

    const uploadResult = await new Promise((resolve, reject) => {
        const stream = cloudinary.v2.uploader.upload_stream(
            {
                folder: `pax26/${sellerId}/payment-receipts`,
                tags: [`seller-${sellerId}`, `customer-${customerPhone}`, "payment-receipt"],
                resource_type: "image",
            },
            (error, result) => (error ? reject(error) : resolve(result))
        );
        stream.end(buffer);
    });

    return { url: uploadResult.secure_url, publicId: uploadResult.public_id };
}

function isLikelyPaymentReceipt(caption, recentMessages = []) {
    if (caption && PAYMENT_KEYWORDS.test(caption)) return true;

    const recentText = recentMessages
        .slice(-6)
        .map((m) => m.content || m.text || "")
        .join(" ")
        .toLowerCase();

    return (
        PAYMENT_KEYWORDS.test(recentText) ||
        /screenshot of your payment|payment confirmation|send.*receipt|transfer.*account/i.test(recentText)
    );
}

async function findProductFromConversation(sellerId, recentMessages) {
    const products = await SellerProductModel.find({ sellerId }).lean();
    const conversationText = recentMessages.map((m) => m.content || m.text || "").join(" ").toLowerCase();

    for (const prod of products) {
        if (prod.name && conversationText.includes(prod.name.toLowerCase())) {
            return prod;
        }
    }
    return products[0] || null;
}

/**
 * Attach a customer payment receipt to a pending order (or create one).
 * Returns { handled: true, order } when treated as payment proof, else { handled: false }.
 */
export async function handlePaymentReceipt({
    sellerId,
    sellerUserId,
    mediaUrl,
    customerPhone,
    customerName,
    caption = "",
    recentMessages = [],
}) {
    const pendingOrder = await SellerOrderModel.findOne({
        sellerId,
        customerPhone,
        status: "pending",
    }).sort({ createdAt: -1 });

    const likelyReceipt = isLikelyPaymentReceipt(caption, recentMessages);

    if (!pendingOrder && !likelyReceipt) {
        return { handled: false };
    }

    const { url, publicId } = await uploadPaymentReceipt(mediaUrl, sellerId, customerPhone);

    let order = pendingOrder;

    if (!order) {
        const matchedProduct = await findProductFromConversation(sellerId, recentMessages);
        if (!matchedProduct?._id) {
            return { handled: false };
        }

        order = await SellerOrderModel.create({
            sellerId,
            productId: matchedProduct._id,
            customerPhone,
            customerName: customerName || "WhatsApp Customer",
            quantity: 1,
            totalPrice: matchedProduct.price || 0,
            status: "pending",
            paymentReceiptUrl: url,
            paymentReceiptPublicId: publicId,
            paymentReceiptSubmittedAt: new Date(),
        });
    } else {
        order.paymentReceiptUrl = url;
        order.paymentReceiptPublicId = publicId;
        order.paymentReceiptSubmittedAt = new Date();
        await order.save();
    }

    await sendSalesNotification(sellerUserId, {
        orderId: order._id.toString(),
        customerName: order.customerName || order.customerPhone,
        productName: "Payment receipt received — review required",
        amountPaid: order.totalPrice,
    });

    return { handled: true, order };
}

export function buildPaymentReceiptContext() {
    return `[SYSTEM: Customer sent a payment receipt screenshot.
The receipt has been saved and forwarded to the seller for manual verification.
Do NOT confirm the order yourself.
Reply briefly: thank them for the payment proof, say the team will verify it shortly, and they will receive a confirmation once approved.]`;
}
