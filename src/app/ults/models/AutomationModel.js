import mongoose from "mongoose";

const AutomationSchema = new mongoose.Schema(
  {
    // Owner
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Basic Info
    name: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      default: "",
    },

    // Automation category
    type: {
      type: String,
      enum: [
        "whatsapp",
        "email",
        "sms",
        "ai-agent",
        "webhook",
        "crm",
        "custom",
      ],
      required: true,
    },

    // Status control
    status: {
      type: String,
      enum: ["active", "inactive", "paused"],
      default: "inactive",
    },

    // Trigger configuration
    trigger: {
      type: {
        type: String,
        enum: ["webhook", "schedule", "event", "manual"],
        required: true,
      },

      endpoint: { type: String, default: "" }, // Pax AI webhook
      schedule: { type: String, default: "" }, // cron-like
      eventName: { type: String, default: "" },
    },

    // n8n or internal workflow reference
    workflow: {
      engine: {
        type: String,
        enum: ["n8n", "internal"],
        default: "internal",
      },

      workflowId: { type: String, default: "" }, // n8n workflow ID
      webhookUrl: { type: String, default: "" }, // hidden from users
    },

    // AI configuration (important for Pax AI)
    aiConfig: {
      model: {
        type: String,
        default: "gpt-4o-mini",
      },

      temperature: {
        type: Number,
        default: 0.7,
      },

      systemPrompt: {
        type: String,
        default: "",
      },
    },

    // Usage & monetization
    usage: {
      executions: { type: Number, default: 0 },
      monthlyLimit: { type: Number, default: 100 },
      lastExecutedAt: { type: Date },
    },

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

    // Soft delete
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const AutomationModel =
  mongoose.models.Automation ||
  mongoose.model("Automation", AutomationSchema);

export default AutomationModel;
