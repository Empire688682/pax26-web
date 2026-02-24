import mongoose from "mongoose";

const BusinessProfileSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        businessUrl: { type: String, default: '' },

        aiTrained: {
            type: Boolean,
            default: false,
        },

        businessName: {
            type: String,
            required: true,
            trim: true,
            maxlength: 120,
        },

        industry: {
            type: String,
            required: true,
            trim: true,
        },

        description: {
            type: String,
            trim: true,
            maxlength: 500,
        },

        services: {
            type: [String],
            default: [],
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

        knowledgeBase: [
            {
                question: String,
                answer: String
            }
        ],

        tone: {
            type: String,
            enum: ["friendly", "professional", "salesy"],
            default: "professional",
        },

        whatsappEnabled: {
            type: Boolean,
            default: true,
        },

        lastUpdated: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true, // adds createdAt & updatedAt automatically
    }
);

const BusinessProfileModel = mongoose.models.BusinessProfile || mongoose.model("BusinessProfile", BusinessProfileSchema);
export default BusinessProfileModel;

