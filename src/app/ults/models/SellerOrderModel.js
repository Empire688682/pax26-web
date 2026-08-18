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

    deliveryFee: {
        type: Number,
        default: 0,
    },

    status: {
        type: String,
        enum: ["pending", "confirmed", "paid", "delivered", "cancelled"],
        default: "pending",
    },

    orderCode: {
        type: String,
        index: true,
    },

    items: [{
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "SellerProduct",
        },
        name: String,
        price: Number,
        quantity: { type: Number, default: 1 },
        imageUrl: String,
    }],

    deliveryLocation: String,

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