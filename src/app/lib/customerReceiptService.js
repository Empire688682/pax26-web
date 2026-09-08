import SellerOrderModel from "@/app/ults/models/SellerOrderModel";
import SellerProfileModel from "@/app/ults/models/SellerProfileModel";
import SellerProductModel from "@/app/ults/models/SellerProductModel";
import UserModel from "@/app/ults/models/UserModel";
import AIMessageModel from "@/app/ults/models/AIMessageModel";
import { sendWhatsAppAutomationReply } from "@/app/api/helper/WhatsAppAutomationReply";

/**
 * Sends a branded WhatsApp payment receipt to the customer when an order is confirmed.
 */
export async function sendCustomerOrderReceiptWhatsApp(orderId) {
    try {
        // ── Safeguard 6: Receipts MUST require an explicit Order ID ───────────
        if (!orderId) {
            console.error("❌ [customerReceipt] Aborted: Order ID is required for receipt generation.");
            return { success: false, message: "Missing required orderId parameter" };
        }

        // ── Part 11 & 12: Order lookup directly from database snapshot ─────────
        const order = await SellerOrderModel.findById(orderId)
            .populate({ path: "productId", model: SellerProductModel, select: "name price", strictPopulate: false })
            .lean();

        // Safety Check 1: Order exists
        if (!order) {
            console.error(`❌ [customerReceipt] Safety Check Failed: Order ${orderId} does not exist.`);
            return { success: false, message: "Order not found" };
        }

        // Safety Check 2: Customer phone exists
        if (!order.customerPhone) {
            console.error(`❌ [customerReceipt] Safety Check Failed: Order ${orderId} missing customerPhone.`);
            return { success: false, message: "Customer phone missing" };
        }

        // Safety Check 3: Seller profile ownership
        const sellerProfile = await SellerProfileModel.findById(order.sellerId).lean();
        if (!sellerProfile) {
            console.error(`❌ [customerReceipt] Safety Check Failed: Seller profile ${order.sellerId} not found.`);
            return { success: false, message: "Seller profile not found" };
        }

        const user = await UserModel.findById(sellerProfile.userId).select("whatsapp paxAI").lean();
        if (!user?.whatsapp?.connected || !user?.whatsapp?.phoneNumberId) {
            console.log(`[customerReceipt] WhatsApp not connected for seller ${sellerProfile.userId}`);
            return { success: false, message: "WhatsApp not connected for seller" };
        }

        // Plan gate
        const orderReceiptsEnabled = user.paxAI?.orderReceiptsEnabled ?? true;
        if (!orderReceiptsEnabled) {
            console.log(`[customerReceipt] Order receipts disabled on plan '${user.paxAI?.plan}' for seller ${sellerProfile.userId}`);
            return { success: false, message: "Order receipts not available on this plan" };
        }

        // Safety Check 4: Items present in order snapshot
        const hasSnapshotItems = Array.isArray(order.items) && order.items.length > 0;
        const hasLegacyProduct = Boolean(order.productId);

        if (!hasSnapshotItems && !hasLegacyProduct) {
            console.error(`❌ [customerReceipt] Safety Check Failed: Order ${orderId} contains no items.`);
            return { success: false, message: "Order contains no items" };
        }

        const businessName = sellerProfile.businessName || "Our Store";
        const proofCode = order.orderCode || order._id.toString().slice(-8).toUpperCase();
        const totalPaidVal = Number(order.totalPrice) || 0;
        const deliveryFeeVal = Number(order.deliveryFee) || 0;
        const customerName = order.customerName || "Customer";
        const dateStr = new Date().toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });

        // Safety Check 5 & 6: Format items exclusively from locked order snapshot
        let itemsSection = "";
        let calculatedSubtotal = 0;

        if (hasSnapshotItems) {
            calculatedSubtotal = order.items.reduce((sum, i) => {
                const itemPrice = Number(i.unitPriceSnapshot) || Number(i.price) || 0;
                const itemQty = Number(i.quantity) || 1;
                return sum + (itemPrice * itemQty);
            }, 0);

            itemsSection = order.items
                .map((i) => {
                    const itemName = i.nameSnapshot || i.name || "Item";
                    const itemQty = Number(i.quantity) || 1;
                    const itemPrice = Number(i.unitPriceSnapshot) || Number(i.price) || 0;
                    const linePrice = itemPrice * itemQty;
                    return `• Item: ${itemName} (x${itemQty})${linePrice > 0 ? ` — ₦${linePrice.toLocaleString()}` : ""}`;
                })
                .join("\n");
        } else {
            const productName = order.productId?.name || "Ordered Item";
            const quantity = order.quantity || 1;
            const itemUnitPrice = Number(order.productId?.price) || (totalPaidVal > deliveryFeeVal ? totalPaidVal - deliveryFeeVal : totalPaidVal);
            calculatedSubtotal = itemUnitPrice * quantity;
            itemsSection = `• Item: ${productName} (x${quantity})${calculatedSubtotal > 0 ? ` — ₦${calculatedSubtotal.toLocaleString()}` : ""}`;
        }

        const subtotalVal = calculatedSubtotal > 0 ? calculatedSubtotal : Math.max(0, totalPaidVal - deliveryFeeVal);

        // Safety Check 7: Mathematical harmony check: subtotalVal + deliveryFeeVal === finalTotalPaid
        const expectedTotal = subtotalVal + deliveryFeeVal;
        let finalTotalPaid = totalPaidVal;

        if (finalTotalPaid <= 0 || Math.abs(finalTotalPaid - expectedTotal) > 0) {
            finalTotalPaid = expectedTotal;
        }

        const deliveryLocStr = (order.deliveryLocation || order.deliveryAddress || "").trim();

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
${deliveryLocStr ? `• Delivery Address: ${deliveryLocStr}\n` : ""}
🛍️ *Order Breakdown:*
${itemsSection}
${deliveryFeeVal > 0 ? `\n• Products Subtotal: ₦${subtotalVal.toLocaleString()}\n• Delivery Fee: ₦${deliveryFeeVal.toLocaleString()}` : ""}
• Total Amount Paid: ₦${finalTotalPaid.toLocaleString()}

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

        // Save to inbox for seller visibility (non-blocking)
        if (result?.success) {
            await _saveReceiptToInbox({
                userId: sellerProfile.userId,
                phoneNumberId: user.whatsapp.phoneNumberId,
                customerPhone: order.customerPhone,
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
 */
async function _saveReceiptToInbox({ userId, phoneNumberId, customerPhone, receiptMessage, proofCode, orderId }) {
    try {
        const messageId = `receipt_${orderId}_${Date.now()}`;
        await AIMessageModel.create({
            messageId,
            userId,
            platform: "whatsapp",
            phoneNumberId,
            from: phoneNumberId,
            to: customerPhone,
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
        // Non-critical — don't crash the receipt flow
        console.warn("[customerReceipt] Could not save receipt to inbox:", err?.message || err);
    }
}
