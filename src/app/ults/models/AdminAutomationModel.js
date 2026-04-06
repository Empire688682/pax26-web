import mongoose from "mongoose";

const AdminAutomationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: [
        // WhatsApp
        "whatsapp_auto_reply",
        "whatsapp_follow_up",
        "whatsapp_ai_chatbox",

        // Telegram
        "telegram_auto_reply",
        "telegram_ai_chatbox",

        // Instagram
        "instagram_auto_reply",
        "instagram_ai_chatbox",

        // Facebook Messenger
        "messenger_auto_reply",
        "messenger_ai_chatbox",

        // SMS (Termii)
        "sms_auto_reply",
        "sms_follow_up",

        // Web Chat Widget
        "webchat_auto_reply",
        "webchat_ai_chatbox",

        // Cross-channel
        "follow_up",           // works across all channels
        "business_ai_chatbox", // master type — delegates to channel-specific
      ],
      required: true,
      unique: true,
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
      enum: [
        "whatsapp",
        "telegram",
        "instagram",
        "messenger",
        "sms",
        "webchat",
      ],
      default: ["whatsapp"],
    },

    active: {
      type: Boolean,
      default: true,
    },

    version: {
      type: Number,
      default: 1,
    },

    meta: {
      requiresTraining: { type: Boolean, default: false },

      // Channel connection requirements
      requiresWhatsAppConnection: { type: Boolean, default: false },
      requiresTelegramConnection: { type: Boolean, default: false },
      requiresInstagramConnection: { type: Boolean, default: false },
      requiresMessengerConnection: { type: Boolean, default: false },
      requiresSMSConnection: { type: Boolean, default: false },
      requiresWebChatSetup: { type: Boolean, default: false },

      systemCritical: { type: Boolean, default: false },

      // Provider info per channel
      providers: {
        sms: {
          type: String,
          enum: ["termii", "twilio", "africastalking"],
          default: "termii"
        },
        whatsapp: {
          type: String,
          enum: ["meta_cloud"],
          default: "meta_cloud"
        },
        telegram: {
          type: String,
          enum: ["telegram_bot_api"],
          default: "telegram_bot_api"
        },
        instagram: {
          type: String,
          enum: ["meta_graph"],
          default: "meta_graph"
        },
        messenger: {
          type: String,
          enum: ["meta_graph"],
          default: "meta_graph"
        },
        webchat: {
          type: String,
          enum: ["native"],
          default: "native"
        }
      }
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

const AdminAutomationModel =
  mongoose.models.AdminAutomation ||
  mongoose.model("AdminAutomation", AdminAutomationSchema);

export default AdminAutomationModel;