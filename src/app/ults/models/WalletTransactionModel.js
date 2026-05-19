import mongoose from 'mongoose';

/**
 * WalletTransaction — ledger for every credit/debit on the Pax26 referral wallet.
 *
 * This is separate from TransactionModel (which tracks VTU / payment events).
 * Every change to a user's referralWalletBalance should be logged here.
 */
const walletTxSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: [
        'referral_reward',      // credited when referred user subscribes
        'subscription_payment', // deducted when user pays for a plan from wallet
        'ai_message_purchase',  // deducted when user buys extra AI messages
        'broadcast_purchase',   // deducted when user buys broadcast slots
        'withdrawal',           // deducted on approved withdrawal
        'adjustment',           // manual admin adjustment
      ],
      required: true,
      index: true,
    },

    direction: {
      type: String,
      enum: ['credit', 'debit'],
      required: true,
    },

    amount: { type: Number, required: true },
    balanceBefore: { type: Number, required: true },
    balanceAfter: { type: Number, required: true },

    description: { type: String, default: '' },

    // Reference to a ReferralModel doc (for referral_reward entries)
    referralId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Referral',
      default: null,
    },

    status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'completed',
    },
  },
  { timestamps: true }
);

export default mongoose.models.WalletTransaction ||
  mongoose.model('WalletTransaction', walletTxSchema);
