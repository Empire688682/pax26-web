import SellerOrderModel from "@/app/ults/models/SellerOrderModel";
import SellerProfileModel from "@/app/ults/models/SellerProfileModel";
import SellerProductModel from "@/app/ults/models/SellerProductModel";
import UserModel from "@/app/ults/models/UserModel";
import { sendWhatsAppAutomationReply } from "@/app/api/helper/WhatsAppAutomationReply";

/**
 * Sends a branded WhatsApp payment receipt to the customer when an order is confirmed.
 */
export async function sendCustomerOrderReceiptWhatsApp(orderId) {
    try {
        const order = await SellerOrderModel.findById(orderId)
            .populate({ path: "productId", model: SellerProductModel, select: "name price", strictPopulate: false })
            .lean();

        if (!order || !order.customerPhone) {
            console.warn(`[customerReceipt] Order ${orderId} not found or missing customer phone.`);
            return { success: false, message: "Order or customer phone missing" };
        }

        const sellerProfile = await SellerProfileModel.findById(order.sellerId).lean();
        if (!sellerProfile) {
            return { success: false, message: "Seller profile not found" };
        }

        const user = await UserModel.findById(sellerProfile.userId).select("whatsapp").lean();
        if (!user?.whatsapp?.connected || !user?.whatsapp?.phoneNumberId) {
            console.log(`[customerReceipt] WhatsApp not connected for seller ${sellerProfile.userId}`);
            return { success: false, message: "WhatsApp not connected for seller" };
        }

        const businessName = sellerProfile.businessName || "Our Store";
        const proofCode = order._id.toString().slice(-8).toUpperCase();
        const productName = order.productId?.name || "Ordered Item";
        const totalPaid = (order.totalPrice || 0).toLocaleString();
        const quantity = order.quantity || 1;
        const customerName = order.customerName || "Customer";
        const dateStr = new Date().toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });

        const receiptMessage =
`🧾 *ORDER CONFIRMATION & OFFICIAL RECEIPT*
━━━━━━━━━━━━━━━━━━━━━━━━━━
*Store:* ${businessName}
*Status:* PAYMENT VERIFIED & CONFIRMED ✅
*Order Proof ID:* #${proofCode}
*Date:* ${dateStr}

👤 *Customer Details:*
• Name: ${customerName}
• Phone: ${order.customerPhone}
${order.deliveryAddress ? `• Delivery Address: ${order.deliveryAddress}\n` : ""}
🛍️ *Order Details:*
• Item: ${productName} (x${quantity})
• Total Amount Paid: ₦${totalPaid}

🚚 *DELIVERY INSTRUCTIONS:*
Please present this receipt / Order Proof ID (*#${proofCode}*) to our delivery team upon arrival to confirm package handoff.

Thank you for shopping with *${businessName}*! 🎉`;

        let result;
        // Attempt sending image receipt with brand logo as caption if logoUrl exists
        if (sellerProfile.logoUrl) {
            result = await sendWhatsAppAutomationReply({
                phoneNumberId: user.whatsapp.phoneNumberId,
                to: order.customerPhone,
                imageUrl: sellerProfile.logoUrl,
                caption: receiptMessage,
            });

            // Fallback to text message if image delivery failed
            if (!result?.success) {
                console.warn("[customerReceipt] Image receipt failed, falling back to text receipt.");
                result = await sendWhatsAppAutomationReply({
                    phoneNumberId: user.whatsapp.phoneNumberId,
                    to: order.customerPhone,
                    text: receiptMessage,
                });
            }
        } else {
            result = await sendWhatsAppAutomationReply({
                phoneNumberId: user.whatsapp.phoneNumberId,
                to: order.customerPhone,
                text: receiptMessage,
            });
        }

        return result;
    } catch (error) {
        console.error("❌ Error in sendCustomerOrderReceiptWhatsApp:", error?.message || error);
        return { success: false, error: error?.message || error };
    }
}
