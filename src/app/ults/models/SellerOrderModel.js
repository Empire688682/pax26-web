const SellerOrderSchema = new mongoose.Schema({
    sellerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SellerProfile",
        required: true,
    },

    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SellerProduct",
        required: true,
    },

    customerPhone: {
        type: String,
        required: true,
    },

    customerName: String,

    quantity: {
        type: Number,
        default: 1,
    },

    totalPrice: Number,

    status: {
        type: String,
        enum: ["pending", "confirmed", "paid", "delivered", "cancelled"],
        default: "pending",
    },

    deliveryAddress: String,

}, { timestamps: true });

export default mongoose.models.SellerOrder ||
    mongoose.model("SellerOrder", SellerOrderSchema);