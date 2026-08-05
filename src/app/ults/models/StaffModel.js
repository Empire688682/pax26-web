import mongoose from "mongoose";

const StaffSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      default: "",
    },
    role: {
      type: String,
      enum: ["agent", "manager"],
      default: "agent",
    },
    status: {
      type: String,
      enum: ["active", "invited", "disabled"],
      default: "active",
    },
    avatar: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const StaffModel = mongoose.models.Staff || mongoose.model("Staff", StaffSchema);

export default StaffModel;
