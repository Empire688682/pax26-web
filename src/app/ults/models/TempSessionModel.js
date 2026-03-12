import mongoose from "mongoose";

const TempSessionSchema = new mongoose.Schema(
    {
        sessionId: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },

        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        accessToken: {
            type: String,
            required: true,
        },

        phones: [
            {
                id: { type: String, required: true },
                display: { type: String },
                name: { type: String },
                quality: { type: String, enum: ["GREEN", "YELLOW", "RED", "UNKNOWN"], default: "UNKNOWN" },
                wabaId: { type: String },
                wabaName: { type: String },
            },
        ],

        expiresAt: {
            type: Date,
            required: true,
            index: { expires: 0 }, // ← MongoDB TTL index: auto-deletes document when expiresAt is reached
        },
    },
    {
        timestamps: true,
    }
);

const TempSessionModel =
    mongoose.models.TempSession ||
    mongoose.model("TempSession", TempSessionSchema);

export default TempSessionModel;