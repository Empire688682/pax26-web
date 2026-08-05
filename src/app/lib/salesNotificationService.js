import UserModel from "@/app/ults/models/UserModel";
import SellerProfileModel from "@/app/ults/models/SellerProfileModel";
import SellerNotificationModel from "@/app/ults/models/SellerNotificationModel";
import { sendWhatsAppAutomationReply } from "@/app/api/helper/WhatsAppAutomationReply";
import { sendSalesAlertEmail } from "@/app/lib/salesAlertService";

export const sendSalesNotification = async (userId, orderData) => {
    try {
        const user = await UserModel.findById(userId);
        if (!user) return { success: false, message: "User not found" };

        // ── Plan gate: salesAlertsEnabled ─────────────────────────
        // If the plan explicitly disables sales alerts, skip silently.
        // Default true so legacy users (pre-flag) still receive notifications.
        const salesAlertsEnabled = user.paxAI?.salesAlertsEnabled ?? true;
        if (!salesAlertsEnabled) {
            console.log(`[salesNotification] Sales alerts disabled for plan '${user.paxAI?.plan}' — skipping`);
            return { success: false, message: "Sales alerts not available on this plan" };
        }

        const plan = user.paxAI?.plan || "free";

        const sellerProfile = await SellerProfileModel.findOne({ userId });
        if (!sellerProfile || !sellerProfile.salesNotificationsEnabled) {
            return { success: false, message: "Notifications disabled" };
        }

        // Determine allowed channels based on plan
        // business+ get WhatsApp + email. starter gets in-app + email. free gets in-app only.
        let allowedChannels = ["in-app"];
        if (plan === "business" || plan === "enterprise") {
            allowedChannels = ["in-app", "whatsapp", "email", "both"];
        } else if (plan === "starter") {
            allowedChannels = ["in-app", "email"];
        }

        const preferredChannel = sellerProfile.salesNotificationChannel || "in-app";
        const actualChannel = allowedChannels.includes(preferredChannel) ? preferredChannel : "in-app";

        // Save in-app notification
        const notification = new SellerNotificationModel({
            userId,
            orderId: orderData.orderId || "",
            customerName: orderData.customerName || "Unknown Customer",
            productName: orderData.productName || "Unknown Product",
            amountPaid: orderData.amountPaid || 0,
            channel: actualChannel,
            status: "pending",
        });

        await notification.save();

        let messageSent = false;
        const msgText = `🎉 *New Sale Alert!*\n\n*Customer:* ${notification.customerName}\n*Product:* ${notification.productName}\n*Amount:* ₦${notification.amountPaid.toLocaleString()}\n*Order ID:* ${notification.orderId}\n*Time:* ${new Date().toLocaleString()}`;

        if (actualChannel === "whatsapp" || actualChannel === "both") {
            // Send WhatsApp notification to seller's own phone number
            if (user.whatsapp?.connected && user.whatsapp?.displayPhone) {
                try {
                    await sendWhatsAppAutomationReply({ 
                        phoneNumberId: user.whatsapp.phoneNumberId, 
                        to: user.whatsapp.displayPhone, 
                        text: msgText 
                    });
                    messageSent = true;
                } catch (err) {
                    console.error("WhatsApp notification failed:", err.message);
                }
            }
        }

        // ── Send Email sales notification ────────────────────────
        // Fires for potential sales (to notify seller to log in & confirm) or confirmed sales
        if (actualChannel === "email" || actualChannel === "both" || sellerProfile.emailSalesAlerts !== false) {
            try {
                await sendSalesAlertEmail(userId, {
                    customerPhone: notification.customerName,
                    productName: notification.productName,
                    amountPaid: notification.amountPaid,
                    orderId: notification.orderId,
                    isConfirmed: orderData.isConfirmed ?? false,
                });
                messageSent = true;
            } catch (err) {
                console.error("Email sales notification failed:", err.message);
            }
        }

        notification.status = messageSent ? "sent" : (actualChannel === "in-app" ? "sent" : "failed");
        await notification.save();

        return { success: true, message: "Notification processed" };
    } catch (error) {
        console.error("Sales notification service error:", error);
        return { success: false, message: "Internal error" };
    }
};
