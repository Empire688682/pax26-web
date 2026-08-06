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
        required: false,
    },

    items: [
        {
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "SellerProduct",
            },
            name: String,
            price: Number,
            quantity: {
                type: Number,
                default: 1,
            },
            extraShippingFee: {
                type: Number,
                default: 0,
            },
        },
    ],

    customerPhone: {
        type: String,
        required: true,
    },

    customerName: String,

    quantity: {
        type: Number,
        default: 1,
    },

    subtotalPrice: Number,

    deliveryFee: {
        type: Number,
        default: 0,
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
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },

}, { timestamps: true });

export default mongoose.models.SellerOrder ||
    mongoose.model("SellerOrder", SellerOrderSchema);