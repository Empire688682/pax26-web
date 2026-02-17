import mongoose from "mongoose";

const AutomationItemSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: [
        "whatsapp_auto_reply",
        "follow_up",
        "business_ai_chatbox",
      ],
      required: true,
    },

    name: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      default: "",
    },

    enabled: {
      type: Boolean,
      default: false,
    },

    // 🔒 System controlled
    system: {
      type: Boolean,
      default: true,
      immutable: true,
    },

    // Runtime tracking
    lastRunAt: Date,
    runCount: {
      type: Number,
      default: 0,
    },

    // Optional debug logs (future UI)
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
  { timestamps: true }
);


const UserAutomationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // 🚨 ONE RECORD PER USER
      index: true,
    },

    // PaxAI config (locked for now)
    aiConfig: {
      model: { type: String, default: "gpt-4o-mini" },
      temperature: { type: Number, default: 0.7 },
      locked: { type: Boolean, default: true },
    },

    automations: {
      type: [AutomationItemSchema],
      validate: {
        validator: function (autos) {
          const types = autos.map(a => a.type);
          return new Set(types).size === types.length;
        },
        message: "Duplicate automation types are not allowed",
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


const UserAutomationModel = mongoose.models.Automation ||
  mongoose.model("Automation", UserAutomationSchema);
export default UserAutomationModel;
