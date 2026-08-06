import UserModel from "@/app/ults/models/UserModel";
import SellerProfileModel from "@/app/ults/models/SellerProfileModel";
import SellerNotificationModel from "@/app/ults/models/SellerNotificationModel";
import { sendWhatsAppAutomationReply } from "@/app/api/helper/WhatsAppAutomationReply";
import { sendSalesAlertEmail } from "@/app/lib/salesAlertService";

export const sendSalesNotification = async (userId, orderData) => {
    console.log(`[salesNotification] 🔔 Triggered for userId=${userId} | order=${JSON.stringify(orderData)}`);
    try {
        const user = await UserModel.findById(userId);
        if (!user) {
            console.warn(`[salesNotification] ❌ User not found for userId=${userId}`);
            return { success: false, message: "User not found" };
        }
        console.log(`[salesNotification] ✅ User found: ${user.email} | plan=${user.paxAI?.plan}`);

        // ── Plan gate: salesAlertsEnabled ─────────────────────────
        // If the plan explicitly disables sales alerts, skip silently.
        // Default true so legacy users (pre-flag) still receive notifications.
        const salesAlertsEnabled = user.paxAI?.salesAlertsEnabled ?? true;
        if (!salesAlertsEnabled) {
            console.log(`[salesNotification] 🚫 Sales alerts disabled for plan '${user.paxAI?.plan}' — skipping`);
            return { success: false, message: "Sales alerts not available on this plan" };
        }
        console.log(`[salesNotification] ✅ Plan gate passed (salesAlertsEnabled=${salesAlertsEnabled})`);

        const plan = user.paxAI?.plan || "free";

        const sellerProfile = await SellerProfileModel.findOne({ userId });
        if (!sellerProfile) {
            console.warn(`[salesNotification] ❌ No seller profile found for userId=${userId}`);
            return { success: false, message: "Notifications disabled" };
        }
        if (!sellerProfile.salesNotificationsEnabled) {
            console.warn(`[salesNotification] 🚫 salesNotificationsEnabled=false on seller profile (userId=${userId}). Set it to true in seller settings to receive alerts.`);
            return { success: false, message: "Notifications disabled" };
        }
        console.log(`[salesNotification] ✅ Seller profile OK | salesNotificationsEnabled=${sellerProfile.salesNotificationsEnabled} | emailSalesAlerts=${sellerProfile.emailSalesAlerts} | channel=${sellerProfile.salesNotificationChannel}`);

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
        console.log(`[salesNotification] 📢 plan=${plan} | preferredChannel=${preferredChannel} | allowedChannels=${allowedChannels.join(",")} | actualChannel=${actualChannel}`);

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
        console.log(`[salesNotification] ✅ In-app notification saved (id=${notification._id})`);

        let messageSent = false;
        const msgText = `🎉 *New Sale Alert!*\n\n*Customer:* ${notification.customerName}\n*Product:* ${notification.productName}\n*Amount:* ₦${notification.amountPaid.toLocaleString()}\n*Order ID:* ${notification.orderId}\n*Time:* ${new Date().toLocaleString()}`;

        if (actualChannel === "whatsapp" || actualChannel === "both") {
            console.log(`[salesNotification] 📱 Attempting WhatsApp notification to seller phone...`);
            // Send WhatsApp notification to seller's own phone number
            if (user.whatsapp?.connected && user.whatsapp?.displayPhone) {
                try {
                    await sendWhatsAppAutomationReply({ 
                        phoneNumberId: user.whatsapp.phoneNumberId, 
                        to: user.whatsapp.displayPhone, 
                        text: msgText 
                    });
                    messageSent = true;
                    console.log(`[salesNotification] ✅ WhatsApp notification sent to ${user.whatsapp.displayPhone}`);
                } catch (err) {
                    console.error(`[salesNotification] ❌ WhatsApp notification failed:`, err.message);
                }
            } else {
                console.warn(`[salesNotification] ⚠️ WhatsApp not connected or displayPhone missing (connected=${user.whatsapp?.connected}, displayPhone=${user.whatsapp?.displayPhone})`);
            }
        }

        // ── Send Email sales notification ────────────────────────
        // Fires for potential sales (to notify seller to log in & confirm) or confirmed sales
        const shouldEmail = actualChannel === "email" || actualChannel === "both" || sellerProfile.emailSalesAlerts !== false;
        console.log(`[salesNotification] 📧 Email check: shouldEmail=${shouldEmail} | actualChannel=${actualChannel} | emailSalesAlerts=${sellerProfile.emailSalesAlerts}`);
        if (shouldEmail) {
            try {
                await sendSalesAlertEmail(userId, {
                    customerPhone: notification.customerName,
                    productName: notification.productName,
                    amountPaid: notification.amountPaid,
                    orderId: notification.orderId,
                    isConfirmed: orderData.isConfirmed ?? false,
                });
                messageSent = true;
                console.log(`[salesNotification] ✅ Email alert dispatched for userId=${userId}`);
            } catch (err) {
                console.error(`[salesNotification] ❌ Email sales notification threw:`, err.message);
            }
        } else {
            console.log(`[salesNotification] ⏭️ Email skipped (shouldEmail=false)`);
        }

        notification.status = messageSent ? "sent" : (actualChannel === "in-app" ? "sent" : "failed");
        await notification.save();
        console.log(`[salesNotification] 🏁 Done — notification.status=${notification.status}`);

        return { success: true, message: "Notification processed" };
    } catch (error) {
        console.error("[salesNotification] 💥 Unexpected error:", error);
        return { success: false, message: "Internal error" };
    }
};
