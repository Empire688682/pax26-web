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

    price: {
        type: Number,
        required: true,
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
    }

}, { timestamps: true });

export default mongoose.models.SellerProduct ||
    mongoose.model("SellerProduct", SellerProductSchema);