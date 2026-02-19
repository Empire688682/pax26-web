import mongoose from "mongoose";

const AutomationItemSchema = new mongoose.Schema(
  {
    // 🔗 Reference to Admin Automation (stored as ID string)
    automationId: {
      type: String, // comes from Admin backend
      required: true,
    },

    // Optional shortcut for faster filtering (not source of truth)
    type: {
      type: String,
      enum: [
        "whatsapp_auto_reply",
        "follow_up",
        "business_ai_chatbox",
      ],
      required: true,
    },

    // 👤 User toggle
    enabled: {
      type: Boolean,
      default: false,
    },

    // 📊 Runtime tracking
    lastRunAt: {
      type: Date,
    },

    runCount: {
      type: Number,
      default: 0,
    },

    // 🧾 Optional logs (keep lightweight)
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
      },
    ],
  },
  { _id: false } // prevent subdocument auto-id
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

    // 🤖 PaxAI Config (user-level AI settings)
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

    // 🔄 User automation toggles
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

    // 💳 Billing plan
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
