const SellerMediaSchema = new mongoose.Schema({
    sellerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SellerProfile",
        required: true,
        index: true,
    },

    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SellerProduct",
        default: null,
    },

    url: {
        type: String,
        required: true,
    },

    publicId: {
        type: String,
        required: true,
    },

    type: {
        type: String,
        enum: ["image", "video", "document"],
        default: "image",
    },

    tags: [String], // ["black", "shoe"]

    isPrimary: {
        type: Boolean,
        default: false,
    }

}, { timestamps: true });

export default mongoose.models.SellerMedia ||
    mongoose.model("SellerMedia", SellerMediaSchema);