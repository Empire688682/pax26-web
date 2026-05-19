import mongoose from "mongoose";

const SellerNotificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
    orderId: {
        type: String,
        default: "",
    },
    customerName: {
        type: String,
        default: "Unknown Customer",
    },
    productName: {
        type: String,
        required: true,
    },
    amountPaid: {
        type: Number,
        required: true,
    },
    channel: {
        type: String,
        enum: ["in-app", "whatsapp", "email", "both"],
        default: "in-app",
    },
    status: {
        type: String,
        enum: ["pending", "sent", "failed"],
        default: "pending",
    },
    read: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });

export default mongoose.models.SellerNotification ||
    mongoose.model("SellerNotification", SellerNotificationSchema);
