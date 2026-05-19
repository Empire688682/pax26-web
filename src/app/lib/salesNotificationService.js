import UserModel from "@/app/ults/models/UserModel";
import SellerProfileModel from "@/app/ults/models/SellerProfileModel";
import SellerNotificationModel from "@/app/ults/models/SellerNotificationModel";
import { sendWhatsAppAutomationReply } from "@/app/api/helper/WhatsAppAutomationReply";

export const sendSalesNotification = async (userId, orderData) => {
    try {
        const user = await UserModel.findById(userId);
        if (!user) return { success: false, message: "User not found" };

        const plan = user.paxAI?.plan || "free";
        // Free plan = no sales notifications
        if (plan === "free") return { success: false, message: "Not available on free plan" };

        const sellerProfile = await SellerProfileModel.findOne({ userId });
        if (!sellerProfile || !sellerProfile.salesNotificationsEnabled) {
            return { success: false, message: "Notifications disabled" };
        }

        // Determine allowed channels based on plan
        let allowedChannels = ["in-app"];
        if (plan === "business" || plan === "enterprise") {
            allowedChannels = ["in-app", "whatsapp", "email", "both"];
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

        notification.status = messageSent ? "sent" : (actualChannel === "in-app" ? "sent" : "failed");
        await notification.save();

        return { success: true, message: "Notification processed" };
    } catch (error) {
        console.error("Sales notification service error:", error);
        return { success: false, message: "Internal error" };
    }
};
