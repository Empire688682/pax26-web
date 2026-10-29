/**
 * MessagePackModel
 *
 * Stores the admin-configurable extra message top-up pack catalogue.
 * A single document (key: "default") holds the array of packs.
 * Admin edits these via the admin panel — no code change needed.
 *
 * Each pack:
 *   id       — stable identifier used in API calls (e.g. "small")
 *   label    — display name (e.g. "Small Pack")
 *   messages — number of messages added to the user's monthly quota
 *   price    — cost in NGN deducted from the user's wallet
 *   color    — hex accent for UI rendering
 *   isActive — whether this pack is shown to users
 */

import mongoose from "mongoose";

const PackItemSchema = new mongoose.Schema(
  {
    id:       { type: String, required: true },
    label:    { type: String, required: true },
    messages: { type: Number, required: true },
    price:    { type: Number, required: true },
    color:    { type: String, default: "#3b82f6" },
    isActive: { type: Boolean, default: true },
  },
  { _id: false }
);

const MessagePackSchema = new mongoose.Schema(
  {
    key:   { type: String, default: "default", unique: true },
    packs: { type: [PackItemSchema], default: [] },
  },
  { timestamps: true }
);

const MessagePackModel =
  mongoose.models.MessagePack ||
  mongoose.model("MessagePack", MessagePackSchema);

export default MessagePackModel;

// ── Default packs seeded on first use ─────────────────────────────
const DEFAULT_PACKS = [
  { id: "small",  label: "Small Pack",  messages: 200,  price: 500,  color: "#38bdf8", isActive: true },
  { id: "medium", label: "Medium Pack", messages: 500,  price: 1000, color: "#22c55e", isActive: true },
  { id: "large",  label: "Large Pack",  messages: 1500, price: 2500, color: "#f59e0b", isActive: true },
  { id: "xl",     label: "XL Pack",     messages: 5000, price: 7000, color: "#a78bfa", isActive: true },
];

/**
 * Fetch the active message packs from the DB.
 * Creates the default catalogue on first call if it doesn't exist.
 * Falls back to DEFAULT_PACKS if DB is unavailable — system never breaks.
 */
export async function getMessagePacks() {
  try {
    const doc = await MessagePackModel.findOneAndUpdate(
      { key: "default" },
      { $setOnInsert: { packs: DEFAULT_PACKS } },
      { upsert: true, new: true, lean: true }
    );
    return (doc.packs || []).filter(p => p.isActive);
  } catch {
    return DEFAULT_PACKS.filter(p => p.isActive);
  }
}
