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

    // Second phone number — optional, provided by customer during checkout
    customerPhone2: {
        type: String,
        default: "",
    },

    // WhatsApp inbound phone — the Meta/WhatsApp number the customer used to contact the store.
    // This is the account identity key for lookups, push, and leadStage updates.
    // It is SEPARATE from customerPhone (the delivery/contact number from the storefront form).
    whatsappPhone: {
        type: String,
        default: "",
        index: true,
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
    selectedZoneName: String,       // name of the auto-detected delivery zone (zones model)
    deliveryZoneTimeframe: String,  // estimated delivery timeframe e.g. "Same Day", "2-4 days"

    fulfillmentMethod: {
        type: String,
        enum: ["delivery", "pickup"],
        default: "delivery",
    },

    pickupDetails: String,

    // Extra notes from the customer at checkout (gate colour, landmark, etc.)
    additionalInfo: {
        type: String,
        default: "",
    },

    // ── TTL for abandoned awaiting_payment orders ─────────────
    // Set to 48 hours after creation for awaiting_payment orders only.
    // MongoDB TTL index auto-deletes the document when this date is reached.
    // For ALL other statuses (pending, confirmed, paid, delivered, cancelled)
    // this field is null — TTL index ignores null, so they are never auto-deleted.
    awaitingPaymentExpiresAt: {
        type: Date,
        default: null,
        index: { expireAfterSeconds: 0 }, // MongoDB TTL — deletes doc when this date passes
    },

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