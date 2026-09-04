import UserModel from "@/app/ults/models/UserModel";
import SellerProfileModel from "@/app/ults/models/SellerProfileModel";
import SellerNotificationModel from "@/app/ults/models/SellerNotificationModel";
import { sendWhatsAppAutomationReply } from "@/app/api/helper/WhatsAppAutomationReply";
import { sendMobilePush } from "@/app/lib/pushNotificationService";
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
        console.log(`[salesNotification] ✅ Seller profile OK | salesNotificationsEnabled=${sellerProfile.salesNotificationsEnabled} | emailSalesAlerts=${sellerProfile.emailSalesAlerts} | channel=${sellerProfile.salesNotificationChannel}`);

        // ── salesNotificationsEnabled gates in-app + WhatsApp ONLY ─
        // emailSalesAlerts is a SEPARATE toggle (AI Business Dashboard → "Payment Email Alerts")
        // and must never be blocked by salesNotificationsEnabled.
        const inAppEnabled = sellerProfile.salesNotificationsEnabled !== false;
        if (!inAppEnabled) {
            console.log(`[salesNotification] ⚠️ salesNotificationsEnabled=false — in-app & WhatsApp notifications skipped. Email will still be checked separately.`);
        }

        // Determine allowed channels based on plan
        let allowedChannels = ["in-app"];
        if (plan === "business" || plan === "enterprise") {
            allowedChannels = ["in-app", "whatsapp", "email", "both"];
        } else if (plan === "starter") {
            allowedChannels = ["in-app", "email"];
        }

        const preferredChannel = sellerProfile.salesNotificationChannel || "in-app";
        const actualChannel = allowedChannels.includes(preferredChannel) ? preferredChannel : "in-app";
        console.log(`[salesNotification] 📢 plan=${plan} | preferredChannel=${preferredChannel} | allowedChannels=${allowedChannels.join(",")} | actualChannel=${actualChannel}`);

        let messageSent = false;

        // ── In-app notification (only if salesNotificationsEnabled) ─
        if (inAppEnabled) {
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

            const deliveryFeeVal = Number(orderData.deliveryFee) || 0;
            const amountPaidVal = Number(notification.amountPaid) || 0;
            const subtotalVal = amountPaidVal > deliveryFeeVal ? amountPaidVal - deliveryFeeVal : amountPaidVal;

            const msgText = deliveryFeeVal > 0
                ? `🎉 *New Sale Alert!*\n\n*Customer:* ${notification.customerName}\n*Products:* ${notification.productName}\n*Products Total:* ₦${subtotalVal.toLocaleString()}\n*Delivery Fee:* ₦${deliveryFeeVal.toLocaleString()}\n*Grand Total:* ₦${amountPaidVal.toLocaleString()}\n*Order ID:* ${notification.orderId}\n*Time:* ${new Date().toLocaleString()}`
                : `🎉 *New Sale Alert!*\n\n*Customer:* ${notification.customerName}\n*Product:* ${notification.productName}\n*Amount:* ₦${amountPaidVal.toLocaleString()}\n*Order ID:* ${notification.orderId}\n*Time:* ${new Date().toLocaleString()}`;

            // ── WhatsApp channel ─────────────────────────────────────
            if (actualChannel === "whatsapp" || actualChannel === "both") {
                console.log(`[salesNotification] 📱 Attempting WhatsApp notification to seller phone...`);
                if (user.whatsapp?.connected && user.whatsapp?.displayPhone) {
                    try {
                        await sendWhatsAppAutomationReply({
                            phoneNumberId: user.whatsapp.phoneNumberId,
                            to: user.whatsapp.displayPhone,
                            text: msgText,
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

            notification.status = messageSent ? "sent" : (actualChannel === "in-app" ? "sent" : "failed");
            await notification.save();
        }

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
                    deliveryFee: orderData.deliveryFee,
                    deliveryLocation: orderData.deliveryLocation || orderData.deliveryAddress || "",
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

        // ── Mobile push (fires regardless of channel preference) ──
        const custName = orderData.customerName || "Customer";
        const prodName = orderData.productName || "Item";
        const amtPaid = Number(orderData.amountPaid) || 0;
        await sendMobilePush(userId, {
            type:  "new_order",
            title: "🛍️ New Sale!",
            body:  `${custName} ordered ${prodName} · ₦${amtPaid.toLocaleString()}`,
            data:  { orderId: orderData.orderId || "" },
        });

        return { success: true, message: "Notification processed" };
    } catch (error) {
        console.error("[salesNotification] 💥 Unexpected error:", error);
        return { success: false, message: "Internal error" };
    }
};
