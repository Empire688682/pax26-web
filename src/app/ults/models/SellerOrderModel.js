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
        // Not required at creation — populated when customer sends WhatsApp confirmation
        // or resolved from StorefrontSession token at checkout time
        default: "",
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
        // awaiting_payment: order confirmed on storefront, payment not yet received
        // pending:          payment proof received, awaiting seller verification
        // confirmed:        seller verified payment
        // paid:             marked as paid
        // delivered:        order delivered
        // cancelled:        order cancelled
        enum: ["awaiting_payment", "pending", "confirmed", "paid", "delivered", "cancelled"],
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
        // selectedVariants: captures size/color/material choices made on storefront
        // e.g. [{ label: "Size", value: "42" }, { label: "Color", value: "Black" }]
        selectedVariants: [{
            label: { type: String },
            value: { type: String },
            _id: false,
        }],
    }],

    deliveryLocation: String,
    deliveryAddress: String,
    selectedZoneName: String,   // name of the auto-detected delivery zone (zones model)

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

    // Source of the order — storefront (reliable) or whatsapp-chat (legacy fallback)
    orderSource: {
        type: String,
        enum: ["storefront", "whatsapp-chat"],
        default: "whatsapp-chat",
    },

}, { timestamps: true });

if (mongoose.models.SellerOrder) {
    delete mongoose.models.SellerOrder;
}

export default mongoose.model("SellerOrder", SellerOrderSchema);