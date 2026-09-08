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

    orderStage: {
        type: String,
        enum: [
            "DRAFT",
            "CHECKOUT",
            "AWAITING_PAYMENT",
            "PAYMENT_PROOF_RECEIVED",
            "AWAITING_SELLER_VERIFICATION",
            "PAYMENT_VERIFIED",
            "ORDER_CONFIRMED",
            "CANCELLED",
            "REFUND_REQUESTED"
        ],
        default: "DRAFT",
    },

    isSnapshotLocked: {
        type: Boolean,
        default: false,
    },

    items: [{
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "SellerProduct",
        },
        name: String,
        nameSnapshot: String,
        price: Number,
        unitPriceSnapshot: Number,
        quantity: { type: Number, default: 1 },
        imageUrl: String,
        imageSnapshot: String,
        selectedVariant: {
            color: String,
            size: String,
            other: String,
        },
    }],

    deliveryLocation: String,

    deliveryAddress: String,

    fulfillmentMethod: {
        type: String,
        enum: ["delivery", "pickup"],
        default: "delivery",
    },

    pickupDetails: String,

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