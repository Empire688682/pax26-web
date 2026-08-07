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
            return { success: false, message: "No seller profile" };
        }
        console.log(`[salesNotification] ✅ Seller profile OK | emailSalesAlerts=${sellerProfile.emailSalesAlerts} | channel=${sellerProfile.salesNotificationChannel}`);

        // Determine allowed channels based on seller preference
        const preferredChannel = sellerProfile.salesNotificationChannel || "both";
        const actualChannel = preferredChannel;
        console.log(`[salesNotification] 📢 plan=${plan} | preferredChannel=${preferredChannel} | actualChannel=${actualChannel}`);

        let messageSent = false;

        // ── In-app notification ──────────────────────────────────────
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

        const msgText = `🎉 *New Sale Alert!*\n\n*Customer:* ${notification.customerName}\n*Product:* ${notification.productName}\n*Amount:* ₦${notification.amountPaid.toLocaleString()}\n*Order ID:* ${notification.orderId}\n*Time:* ${new Date().toLocaleString()}`;

        // ── WhatsApp channel ─────────────────────────────────────────
        if (actualChannel === "whatsapp" || actualChannel === "both") {
            const recipientPhone = sellerProfile?.phone || sellerProfile?.whatsappNumber || user.number || user.whatsapp?.displayPhone;
            console.log(`[salesNotification] 📱 Attempting WhatsApp notification to: ${recipientPhone}...`);
            if (user.whatsapp?.connected && user.whatsapp?.phoneNumberId && recipientPhone) {
                try {
                    await sendWhatsAppAutomationReply({
                        phoneNumberId: user.whatsapp.phoneNumberId,
                        to: recipientPhone,
                        text: msgText,
                    });
                    messageSent = true;
                    console.log(`[salesNotification] ✅ WhatsApp notification sent to ${recipientPhone}`);
                } catch (err) {
                    console.error(`[salesNotification] ❌ WhatsApp notification failed:`, err.message);
                }
            } else {
                console.warn(`[salesNotification] ⚠️ WhatsApp not connected or recipientPhone missing (connected=${user.whatsapp?.connected}, recipientPhone=${recipientPhone})`);
            }
        }

        notification.status = messageSent ? "sent" : (actualChannel === "in-app" ? "sent" : "failed");
        await notification.save();

        // ── Email alert — gated ONLY by emailSalesAlerts field ──────
        // This fires regardless of salesNotificationsEnabled because it is
        // controlled by a separate toggle: AI Business Dashboard → "Payment Email Alerts".
        const shouldEmail = sellerProfile.emailSalesAlerts !== false;
        console.log(`[salesNotification] 📧 Email check: shouldEmail=${shouldEmail} | emailSalesAlerts=${sellerProfile.emailSalesAlerts}`);
        if (shouldEmail) {
            try {
                await sendSalesAlertEmail(userId, {
                    customerPhone: orderData.customerName,
                    productName: orderData.productName,
                    amountPaid: orderData.amountPaid,
                    orderId: orderData.orderId,
                    isConfirmed: orderData.isConfirmed ?? false,
                });
                messageSent = true;
                console.log(`[salesNotification] ✅ Email alert dispatched for userId=${userId}`);
            } catch (err) {
                console.error(`[salesNotification] ❌ Email sales notification threw:`, err.message);
            }
        } else {
            console.log(`[salesNotification] ⏭️ Email skipped (emailSalesAlerts=false)`);
        }

        console.log(`[salesNotification] 🏁 Done — messageSent=${messageSent}`);
        return { success: true, message: "Notification processed" };
    } catch (error) {
        console.error("[salesNotification] 💥 Unexpected error:", error);
        return { success: false, message: "Internal error" };
    }
};
