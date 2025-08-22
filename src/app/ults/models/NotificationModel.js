import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  title: { type: String, required: true },       
  message: { type: String, required: true },
  type: { type: String, enum: ["info", "alert", "success"], default: "info" }, 
  date: { type: Date, default: Date.now }, 
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now, expires: "7d" }
});

export const NotificationModel = mongoose.models.Notification || mongoose.model("Notification", notificationSchema);
