const SellerLeadSchema = new mongoose.Schema({
    sellerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SellerProfile",
        required: true,
    },

    customerPhone: {
        type: String,
        required: true,
        index: true,
    },

    lastMessage: String,

    interestedProductId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SellerProduct",
    },

    status: {
        type: String,
        enum: ["new", "interested", "negotiating", "converted", "lost"],
        default: "new",
    },

    lastInteractionAt: Date,

    followUpScheduledAt: Date,

}, { timestamps: true });

export default mongoose.models.SellerLead ||
    mongoose.model("SellerLead", SellerLeadSchema);