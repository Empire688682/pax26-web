import SellerOrderModel from "@/app/ults/models/SellerOrderModel";
import SellerProfileModel from "@/app/ults/models/SellerProfileModel";
import SellerProductModel from "@/app/ults/models/SellerProductModel";
import UserModel from "@/app/ults/models/UserModel";
import AIMessageModel from "@/app/ults/models/AIMessageModel";
import { sendWhatsAppAutomationReply } from "@/app/api/helper/WhatsAppAutomationReply";

/**
 * Resolve the correct WhatsApp number to send a message to.
 *
 * RULE:
 *   - whatsappPhone = Meta inbound number (the customer's actual WhatsApp) → ALWAYS use this for messaging
 *   - customerPhone  = storefront delivery form phone → shown to the SELLER only (for delivery logistics)
 *
 * We fall back to customerPhone ONLY if whatsappPhone was never set (very old legacy orders).
 */
function resolveWaPhone(order) {
    return (order.whatsappPhone || "").trim() || (order.customerPhone || "").trim() || "";
}

/**
 * Sends a branded WhatsApp payment receipt to the customer when an order is confirmed.
 */
export async function sendCustomerOrderReceiptWhatsApp(orderId) {
    try {
        const order = await SellerOrderModel.findById(orderId)
            .populate({ path: "productId", model: SellerProductModel, select: "name price", strictPopulate: false })
            .lean();

        const waPhone = resolveWaPhone(order);
        if (!order || !waPhone) {
            console.warn(`[customerReceipt] Order ${orderId} not found or no WhatsApp phone available.`);
            return { success: false, message: "Order or customer WhatsApp phone missing" };
        }

        const sellerProfile = await SellerProfileModel.findById(order.sellerId).lean();
        if (!sellerProfile) {
            return { success: false, message: "Seller profile not found" };
        }

        const user = await UserModel.findById(sellerProfile.userId).select("whatsapp paxAI").lean();
        if (!user?.whatsapp?.connected || !user?.whatsapp?.phoneNumberId) {
            console.log(`[customerReceipt] WhatsApp not connected for seller ${sellerProfile.userId}`);
            return { success: false, message: "WhatsApp not connected for seller" };
        }

        const orderReceiptsEnabled = user.paxAI?.orderReceiptsEnabled ?? true;
        if (!orderReceiptsEnabled) {
            console.log(`[customerReceipt] Order receipts disabled on plan '${user.paxAI?.plan}'`);
            return { success: false, message: "Order receipts not available on this plan" };
        }

        const businessName = sellerProfile.businessName || "Our Store";
        const proofCode = order._id.toString().slice(-8).toUpperCase();
        const totalPaidVal = Number(order.totalPrice) || 0;
        const deliveryFeeVal = Number(order.deliveryFee) || 0;
        const customerName = order.customerName || "Customer";
        const dateStr = new Date().toLocaleDateString("en-US", {
            year: "numeric", month: "short", day: "numeric",
        });

        // ── Format items ─────────────────────────────────────────────────────
        let itemsSection = "";
        let calculatedSubtotal = 0;

        if (order.items && order.items.length > 0) {
            calculatedSubtotal = order.items.reduce(
                (sum, i) => sum + (Number(i.price) || 0) * (Number(i.quantity) || 1), 0
            );
            itemsSection = order.items.map(i => {
                const linePrice = (Number(i.price) || 0) * (Number(i.quantity) || 1);
                const variantStr = (i.selectedVariants || []).length > 0
                    ? ` [${i.selectedVariants.map(v => `${v.label}: ${v.value}`).join(", ")}]`
                    : "";
                return `• Item: ${i.name}${variantStr} (x${i.quantity || 1})${linePrice > 0 ? ` — ₦${linePrice.toLocaleString()}` : ""}`;
            }).join("\n");
        } else {
            const productName = order.productId?.name || "Ordered Item";
            const quantity = order.quantity || 1;
            const itemUnitPrice = Number(order.productId?.price) || (totalPaidVal > deliveryFeeVal ? totalPaidVal - deliveryFeeVal : totalPaidVal);
            calculatedSubtotal = itemUnitPrice * quantity;
            itemsSection = `• Item: ${productName} (x${quantity})${calculatedSubtotal > 0 ? ` — ₦${calculatedSubtotal.toLocaleString()}` : ""}`;
        }

        const subtotalVal = calculatedSubtotal > 0
            ? calculatedSubtotal
            : Math.max(0, totalPaidVal - deliveryFeeVal);

        const expectedTotal = subtotalVal + deliveryFeeVal;
        const finalTotalPaid = (totalPaidVal > 0 && Math.abs(totalPaidVal - expectedTotal) <= 100)
            ? totalPaidVal
            : expectedTotal > 0 ? expectedTotal : totalPaidVal;

        const deliveryLocStr = (order.deliveryLocation || order.deliveryAddress || "").trim();
        const zoneStr = order.selectedZoneName || "";
        const timeframeStr = order.deliveryZoneTimeframe || "";

        // ── Receipt message ───────────────────────────────────────────────────
        // NOTE: customerPhone (form phone) is intentionally NOT shown here.
        // It is only for the seller's delivery logistics and is visible in the admin/sales page.
        const receiptMessage =
`🧾 *ORDER CONFIRMATION & OFFICIAL RECEIPT*
━━━━━━━━━━━━━━━━━━━━━━━━━━
*Store:* ${businessName}
*Status:* PAYMENT VERIFIED & CONFIRMED ✅
*Order Proof ID:* #${proofCode}
*Date:* ${dateStr}

👤 *Customer:* ${customerName}
📍 *Delivery Address:* ${deliveryLocStr || "Not specified"}
${order.additionalInfo?.trim() ? `📝 *Note:* ${order.additionalInfo.trim()}` : ""}

🛍️ *Order Breakdown:*
${itemsSection}
${deliveryFeeVal > 0 ? `\n• Products Subtotal: ₦${subtotalVal.toLocaleString()}\n• Delivery Fee: ₦${deliveryFeeVal.toLocaleString()}${zoneStr ? ` (${zoneStr})` : ""}${timeframeStr ? ` · Est. ${timeframeStr}` : ""}` : ""}
• Total Amount Paid: ₦${finalTotalPaid.toLocaleString()}

🚚 *DELIVERY INSTRUCTIONS:*
Please present this receipt / Order Proof ID (*#${proofCode}*) to our delivery team upon arrival to confirm package handoff.

Thank you for shopping with *${businessName}*! 🎉`;

        // ── Send to customer's WhatsApp (Meta inbound number) ─────────────────
        let result;
        if (sellerProfile.logoUrl) {
            result = await sendWhatsAppAutomationReply({
                phoneNumberId: user.whatsapp.phoneNumberId,
                to: waPhone,
                imageUrl: sellerProfile.logoUrl,
                caption: receiptMessage,
            });
            if (!result?.success) {
                console.warn("[customerReceipt] Image receipt failed, falling back to text.");
                result = await sendWhatsAppAutomationReply({
                    phoneNumberId: user.whatsapp.phoneNumberId,
                    to: waPhone,
                    text: receiptMessage,
                });
            }
        } else {
            result = await sendWhatsAppAutomationReply({
                phoneNumberId: user.whatsapp.phoneNumberId,
                to: waPhone,
                text: receiptMessage,
            });
        }

        if (result?.success) {
            await _saveReceiptToInbox({
                userId: sellerProfile.userId,
                phoneNumberId: user.whatsapp.phoneNumberId,
                waPhone,
                receiptMessage,
                proofCode,
                orderId: order._id.toString(),
            });
        }

        return result;
    } catch (error) {
        console.error("❌ Error in sendCustomerOrderReceiptWhatsApp:", error?.message || error);
        return { success: false, error: error?.message || error };
    }
}

/**
 * Saves the sent receipt as an AIMessageModel record so it
 * appears in the WhatsApp Inbox for easy tracking.
 * Uses waPhone (Meta inbound number) as the conversation key.
 */
async function _saveReceiptToInbox({ userId, phoneNumberId, waPhone, receiptMessage, proofCode, orderId }) {
    try {
        await AIMessageModel.create({
            messageId: `receipt_${orderId}_${Date.now()}`,
            userId,
            platform: "whatsapp",
            phoneNumberId,
            from: phoneNumberId,
            to: waPhone,
            text: receiptMessage,
            direction: "outbound",
            senderType: "system",
            status: "sent",
            aiMeta: {
                isReceipt: true,
                receiptProofCode: proofCode,
                receiptOrderId: orderId,
            },
        });
    } catch (err) {
        console.warn("[customerReceipt] Could not save receipt to inbox:", err?.message || err);
    }
}

/**
 * Sends a delivery notification via WhatsApp when the seller marks an order delivered.
 */
export async function sendCustomerDeliveryNotificationWhatsApp(orderId) {
    try {
        const order = await SellerOrderModel.findById(orderId)
            .populate({ path: "productId", model: SellerProductModel, select: "name price", strictPopulate: false })
            .lean();

        const waPhone = resolveWaPhone(order);
        if (!order || !waPhone) {
            return { success: false, message: "Order or customer WhatsApp phone missing" };
        }

        const sellerProfile = await SellerProfileModel.findById(order.sellerId).lean();
        if (!sellerProfile) return { success: false, message: "Seller profile not found" };

        const user = await UserModel.findById(sellerProfile.userId).select("whatsapp paxAI").lean();
        if (!user?.whatsapp?.connected || !user?.whatsapp?.phoneNumberId) {
            return { success: false, message: "WhatsApp not connected for seller" };
        }

        const orderReceiptsEnabled = user.paxAI?.orderReceiptsEnabled ?? true;
        if (!orderReceiptsEnabled) {
            return { success: false, message: "Order receipts not available on this plan" };
        }

        const businessName = sellerProfile.businessName || "Our Store";
        const proofCode = order._id.toString().slice(-8).toUpperCase();
        const customerName = order.customerName || "Customer";

        let itemsSummary = "";
        if (order.items && order.items.length > 0) {
            itemsSummary = order.items.map(i => `• ${i.quantity > 1 ? `${i.quantity}x ` : ""}${i.name}`).join("\n");
        } else {
            itemsSummary = `• ${order.productId?.name || "Your order"}`;
        }

        const deliveryMessage =
`🚚 *YOUR ORDER HAS BEEN DELIVERED!*
━━━━━━━━━━━━━━━━━━━━━━━━━━
*Store:* ${businessName}
*Order Ref:* #${proofCode}
*Status:* DELIVERED ✅

Hi ${customerName}! Your order has been successfully delivered. 🎉

${itemsSummary}

We hope you love your purchase! If you have any issues or questions, simply reply to this message.

Thank you for shopping with *${businessName}*! 💙`;

        const result = await sendWhatsAppAutomationReply({
            phoneNumberId: user.whatsapp.phoneNumberId,
            to: waPhone,
            text: deliveryMessage,
        });

        if (result?.success) {
            await _saveReceiptToInbox({
                userId: sellerProfile.userId,
                phoneNumberId: user.whatsapp.phoneNumberId,
                waPhone,
                receiptMessage: deliveryMessage,
                proofCode,
                orderId: order._id.toString(),
            });
        }

        return result;
    } catch (error) {
        console.error("❌ Error in sendCustomerDeliveryNotificationWhatsApp:", error?.message || error);
        return { success: false, error: error?.message || error };
    }
}
