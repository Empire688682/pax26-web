import mongoose from "mongoose";

const AutomationExecutionSchema = new mongoose.Schema({
  userId: String,
  automationId: String,

  channel: String,

  input: String,
  output: String,

  status: {
    type: String,
    enum: ["success","failed"]
  },

  responseTime: Number,

  executedAt: {
    type: Date,
    default: Date.now
  }
});

const AutomationExecutionModel = mongoose.models.AutomationExecutionModel || mongoose.model("AutomationExecution", AutomationExecutionSchema);
export default AutomationExecutionModel;