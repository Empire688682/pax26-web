import mongoose from "mongoose";

const AutomationItemSchema = new mongoose.Schema(
  {
    automationId: {
      type: String,
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },
    createdBy: {
      type: String,
      enum: ["system", "user"],
      default: "user"
    },

    type: {
      type: String,
      enum: [
        "whatsapp_auto_reply",
        "ai_customer_support",
        "lead_capture",
        "follow_up",
        "notification",
      ],
      required: true,
    },

    trigger: {
      type: String,
      required: true,
    },

    action: {
      type: String,
      required: true,
    },

    enabled: {
      type: Boolean,
      default: true,
    },

    /* 🔮 FUTURE-SAFE FIELDS (ADD HERE) */

    conditions: [
      {
        field: String,
        operator: String, // equals, contains, greater_than
        value: mongoose.Schema.Types.Mixed,
      }
    ],

    channels: {
      type: [String],
      default: ["whatsapp"],
    },

    lastRunAt: {
      type: Date,
      default: null,
    },

    runCount: {
      type: Number,
      default: 0,
    },

    logs: [
      {
        status: {
          type: String,
          enum: ["success", "failed"],
        },
        message: String,
        executedAt: {
          type: Date,
          default: Date.now,
        },
      }
    ],

    poweredBy: {
      type: String,
      default: "PaxAI",
    },

    aiProfileVersion: {
      type: Number,
      default: 1,
    },

    notes: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const UserAutomationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // AI configuration (important for Pax AI)
    aiConfig: {
      model: { type: String, default: "gpt-4o-mini" },
      temperature: { type: Number, default: 0.7 },
      locked: { type: Boolean, default: true },
    },

    // Status control
    status: {
      type: String,
      enum: ["draft", "active", "inactive"],
      default: "draft",
    },

    aiProfileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BusinessProfile",
    },

    automations: [AutomationItemSchema],

    // Billing
    billing: {
      plan: {
        type: String,
        enum: ["free", "starter", "pro", "enterprise"],
        default: "free",
      },

      pricePerRun: {
        type: Number,
        default: 0,
      },
    },
  },
  { timestamps: true }
);

const UserAutomationModel = mongoose.models.Automation ||
  mongoose.model("Automation", UserAutomationSchema);
export default UserAutomationModel;
