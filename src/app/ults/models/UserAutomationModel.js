import mongoose from "mongoose";

const AutomationItemSchema = new mongoose.Schema(
  {
    automationId: {
      type: String,
      required: true,
    },

    type: {
      type: String,
      enum: [
        "whatsapp_auto_reply",
        "follow_up",
        "business_ai_chatbox",
      ],
      required: true,
    },

    enabled: {
      type: Boolean,
      default: false,
    },

    lastRunAt: Date,

    runCount: {
      type: Number,
      default: 0,
    },

    successCount: {
      type: Number,
      default: 0,
    },

    failureCount: {
      type: Number,
      default: 0,
    },
  },
  { _id: false }
);

const UserAutomationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },

    aiConfig: {
      model: {
        type: String,
        default: "gpt-4o-mini",
      },
      temperature: {
        type: Number,
        default: 0.7,
      },
      locked: {
        type: Boolean,
        default: true,
      },
    },

    automations: {
      type: [AutomationItemSchema],
      validate: {
        validator: function (autos) {
          const ids = autos.map(a => a.automationId);
          return new Set(ids).size === ids.length;
        },
        message: "Duplicate automationId entries are not allowed",
      },
    },

    billing: {
      plan: {
        type: String,
        enum: ["free", "starter", "business", "enterprise"],
        default: "free",
      },
    },
  },
  { timestamps: true }
);

const UserAutomationModel =
  mongoose.models.UserAutomation ||
  mongoose.model("UserAutomation", UserAutomationSchema);

export default UserAutomationModel;