import mongoose from "mongoose";

const AdminAutomationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: [
        "whatsapp_auto_reply",
        "follow_up",
        "business_ai_chatbox",
      ],
      required: true,
      unique: true, // 🚨 one template per type
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    trigger: {
      type: String,
      required: true,
    },

    action: {
      type: String,
      required: true,
    },

    defaultEnabled: {
      type: Boolean,
      default: false,
    },

    channels: {
      type: [String],
      enum: ["whatsapp", "instagram", "messenger", "webchat", "email"],
      default: ["whatsapp"],
    },

    active: {
      type: Boolean,
      default: true, // admin can disable system-wide
    },

    version: {
      type: Number,
      default: 1,
    },

    meta: {
      requiresTraining: { type: Boolean, default: false },
      requiresWhatsAppConnection: { type: Boolean, default: false },
      systemCritical: { type: Boolean, default: false },
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // admin user
    },
  },
  { timestamps: true }
);

const AdminAutomationModel =
  mongoose.models.AdminAutomation ||
  mongoose.model("AdminAutomation", AdminAutomationSchema);

export default AdminAutomationModel;
