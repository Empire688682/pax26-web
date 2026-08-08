import mongoose from "mongoose";

const SellerOrderSchema = new mongoose.Schema({
    sellerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SellerProfile",
        required: true,
    },

    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SellerProduct",
    },

    customerPhone: {
        type: String,
        required: true,
    },

    customerName: String,

    quantity: {
        type: Number,
        default: 1,
    },

    totalPrice: Number,

    status: {
        type: String,
        enum: ["pending", "confirmed", "paid", "delivered", "cancelled"],
        default: "pending",
    },

    deliveryAddress: String,

    paymentReceiptUrl: String,
    paymentReceiptPublicId: String,
    paymentReceiptSubmittedAt: Date,

    confirmedAt: Date,
    confirmedBy: {
        type: mongoose.Schema.Types.Mixed,
    },

}, { timestamps: true });

if (mongoose.models.SellerOrder) {
    delete mongoose.models.SellerOrder;
}

export default mongoose.model("SellerOrder", SellerOrderSchema);