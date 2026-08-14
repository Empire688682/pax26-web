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

    // ── Storefront ────────────────────────────────────────────
    // slug: unique URL identifier  e.g. "jaystore" → /store/jaystore
    slug: {
        type: String,
        trim: true,
        lowercase: true,
        sparse: true,   // allows multiple docs with no slug yet
        unique: true,
        index: true,
    },
    // logoUrl: shown on storefront hero, product pages, and WhatsApp messages
    logoUrl: { type: String, default: '' },
    // storeTheme: controls the storefront color scheme
    // Options: "classic" | "midnight" | "forest" | "sunset" | "royal" | "ember"
    storeTheme: { type: String, default: 'classic' },

    // ── Promo Announcement ────────────────────────────────────
    promoAnnouncement: {
        enabled: { type: Boolean, default: false },
        text: { type: String, default: '', trim: true },
        badgeText: { type: String, default: 'PROMO', trim: true },
    },

    // ── Email sales alert ─────────────────────────────────────
    // Sends the seller an email whenever the AI sends payment details to a customer
    emailSalesAlerts: { type: Boolean, default: true },

    // ── Spam auto-handoff ─────────────────────────────────────
    // When a contact sends too many messages with no buying intent,
    // the AI hands them off automatically for 24 hours.
    spamAutoHandoff: { type: Boolean, default: true },
    // How many inbound messages in one session before triggering handoff (default 10)
    spamThreshold: { type: Number, default: 10 },

    // Online presence
    onlineStoreUrl: { type: String, default: '', trim: true },
    liveLocation: { type: String, default: '', trim: true },

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

    // Sales Notifications & Tracking
    salesNotificationsEnabled: {
        type: Boolean,
        default: true,
    },
    salesNotificationChannel: {
        type: String,
        enum: ["in-app", "whatsapp", "email", "both"],
        default: "in-app",
    },
    totalSalesCount: {
        type: Number,
        default: 0,
    },
    totalSalesAmount: {
        type: Number,
        default: 0,
    },

}, { timestamps: true });

export default mongoose.models.SellerProfile ||
    mongoose.model("SellerProfile", SellerProfileSchema);
