import mongoose from "mongoose";

const SellerProductSchema = new mongoose.Schema({
    sellerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SellerProfile",
        required: true,
        index: true,
    },

    name: {
        type: String,
        required: true,
        trim: true,
    },

    // slug: URL-safe identifier  e.g. "nike-air-max-black" → /store/jaystore/nike-air-max-black
    // Auto-generated from name; can be customised by the seller
    slug: {
        type: String,
        trim: true,
        lowercase: true,
        index: true,
        // NOT globally unique — only unique within a seller (enforced at API level)
    },

    price: {
        type: Number,
        required: true,
    },

    // comparePrice: original / crossed-out price shown on storefront (future-ready)
    comparePrice: {
        type: Number,
        default: null,
    },

    // sku: seller's internal product code (future inventory management)
    sku: {
        type: String,
        trim: true,
        default: '',
    },

    description: {
        type: String,
        trim: true,
    },

    tags: {
        type: [String], // ["shoe", "black", "nike"]
        index: true,
    },

    category: {
        type: String, // "shoe", "bag", etc
    },

    stock: {
        type: Number,
        default: 0,
    },

    isAvailable: {
        type: Boolean,
        default: true,
    },

    discountPrice: {
        type: Number,
    },

    deliveryFee: {
        type: Number,
    },

    deliveryTimeFrame: {
        type: String, // "2-3 days", "Within 24 hours", etc
    },

    locationNotes: {
        type: String, // "Only within Lagos", "Nationwide", etc
    },

    isPhysical: {
        type: Boolean,
        default: true,
        required: true,
    },

    images: [
        {
            url: { type: String, required: true },
            publicId: { type: String, required: true },
        }
    ],

    // variants: flexible size/color/material options
    // Each variant can override price and stock independently
    // Future: each variant can have its own SKU and images
    variants: [
        {
            label: { type: String, required: true },   // e.g. "Size", "Color", "Material"
            options: [
                {
                    value: { type: String, required: true },  // e.g. "42", "Black", "Cotton"
                    priceAdjustment: { type: Number, default: 0 }, // +/- on base price
                    stock: { type: Number, default: 0 },
                    sku: { type: String, default: '' },
                    _id: false,
                }
            ],
            _id: false,
        }
    ],

}, { timestamps: true });

// Text index for AI semantic search (name + description + tags + category)
SellerProductSchema.index(
    { name: 'text', description: 'text', tags: 'text', category: 'text' },
    { weights: { name: 10, tags: 8, category: 6, description: 3 }, name: 'product_text_search' }
);

export default mongoose.models.SellerProduct ||
    mongoose.model("SellerProduct", SellerProductSchema);