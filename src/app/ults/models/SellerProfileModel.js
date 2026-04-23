import mongoose from "mongoose";

const SellerProfileSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },

    businessName: {
        type: String,
        required: true,
        trim: true,
    },

    whatsappNumber: {
        type: String,
        required: true,
    },

    whatsappVerified: {
        type: Boolean,
        default: false,
    },

    // AI behavior control
    tone: {
        type: String,
        enum: ["friendly", "professional", "salesy"],
        default: "salesy",
    },

    autoReplyEnabled: {
        type: Boolean,
        default: true,
    },

    followUpEnabled: {
        type: Boolean,
        default: true,
    },

    followUpDelayMinutes: {
        type: Number,
        default: 30,
    },

    currency: {
        type: String,
        default: "NGN",
    },

    // Payment details (reuse idea from your old model)
    paymentDetails: [
        {
            label: String,
            bankName: String,
            accountNumber: String,
            accountName: String,
            active: { type: Boolean, default: true }
        }
    ],

    isActive: {
        type: Boolean,
        default: true,
    }

}, { timestamps: true });

export default mongoose.models.SellerProfile ||
    mongoose.model("SellerProfile", SellerProfileSchema);