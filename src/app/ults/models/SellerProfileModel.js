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

    businessDescription: {
        type: String,
        trim: true,
        required: true,
    },

    businessUrl: { type: String, default: '' },
    urlCache: { type: String, default: '' },
    urlCachedAt: { type: Date, default: null },

    industry: {
        type: String,
        required: true,
        trim: true,
    },

    whatsappNumber: {
        type: String,
        // Handled in backend from UserModel
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

    faqs: [
        {
            question: {
                type: String,
                required: true,
            },
            answer: {
                type: String,
                required: true,
            },
        },
    ],

    workingHours: {
        type: String,
        trim: true,
        // Example: "Mon–Fri 9am–6pm"
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

    //payment details
    paymentDetails: [
        {
            label: { type: String, default: '' },        // e.g. "GTBank", "Opay"
            bankName: { type: String, default: '' },
            accountNumber: {
                type: String,
                default: '',
                maxlength: 10,
                match: [/^\d{10}$/, 'Account number must be 10 digits']
            },
            accountName: { type: String, default: '' },
            active: { type: Boolean, default: false }
        }
    ],

    isActive: {
        type: Boolean,
        default: true,
    },

    lastUpdated: {
        type: Date,
        default: Date.now,
    },

}, { timestamps: true });

export default mongoose.models.SellerProfile ||
    mongoose.model("SellerProfile", SellerProfileSchema);
