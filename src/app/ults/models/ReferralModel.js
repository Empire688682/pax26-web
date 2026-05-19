import mongoose from 'mongoose';

const referralSchema = new mongoose.Schema(
  {
    /* ── Participants ─────────────────────────────────────────────── */
    referrer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    referredUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    /* ── Status ───────────────────────────────────────────────────── */
    // pending  → referred user signed up but not yet paid
    // rewarded → referred user paid; reward credited to referrer wallet
    // invalid  → flagged (self-referral attempt, duplicate, etc.)
    status: {
      type: String,
      enum: ['pending', 'rewarded', 'invalid'],
      default: 'pending',
      index: true,
    },

    /* ── Reward ───────────────────────────────────────────────────── */
    rewardGiven: { type: Boolean, default: false },
    rewardAmount: { type: Number, default: 0 }, // in Naira
    planKey: { type: String, default: '' },      // which plan triggered the reward
    rewardedAt: { type: Date, default: null },

    /* ── Abuse prevention ─────────────────────────────────────────── */
    // Snapshot of the referral code used at sign-up
    referralCodeUsed: { type: String, default: '' },
  },
  { timestamps: true }
);

/* ── Unique constraint: one record per (referrer, referredUser) pair ── */
referralSchema.index({ referrer: 1, referredUser: 1 }, { unique: true });

export default mongoose.models.Referral || mongoose.model('Referral', referralSchema);
