/**
 * POST /api/webhooks/flutterwave
 *
 * Flutterwave sends this webhook server-to-server the moment a payment
 * is completed — independent of what the user does after paying.
 * This ensures no wallet funding is ever lost due to a failed browser redirect.
 *
 * Security:  verif-hash header  ←→  FLW_SECRET_HASH env var
 * Idempotent: skips silently if transaction is already "success"
 * Always returns 200 so Flutterwave doesn't retry unnecessarily
 */

import { NextResponse } from 'next/server';
import { connectDb } from '@/app/ults/db/ConnectDb';
import TransactionModel from '@/app/ults/models/TransactionModel';
import UserModel from '@/app/ults/models/UserModel';

export async function POST(req) {
  try {
    // ── 1. Signature verification ───────────────────────────────────────
    // Flutterwave passes your FLW_SECRET_HASH as the "verif-hash" header.
    // Reject anything that doesn't match — could be a spoofed request.
    const secretHash = process.env.FLW_SECRET_HASH;
    const signature = req.headers.get('verif-hash');

    if (!signature || signature !== secretHash) {
      console.warn('⚠️  Flutterwave webhook: invalid or missing verif-hash signature');
      // Return 401 so you know about spoofed requests, but this won't cause
      // Flutterwave to stop sending (it only retries on 5xx).
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // ── 2. Parse payload ────────────────────────────────────────────────
    const payload = await req.json();
    const { event, data } = payload;

    console.log(`📦 Flutterwave webhook received — event: "${event}"`);

    // ── 3. Only handle charge.completed ────────────────────────────────
    if (event !== 'charge.completed') {
      // Other event types (e.g. transfer.completed) — acknowledge and ignore
      return NextResponse.json({ message: `Event "${event}" acknowledged but not handled` }, { status: 200 });
    }

    // ── 4. Only process successfully charged payments ───────────────────
    if (!data || data.status !== 'successful') {
      console.log(`ℹ️  Webhook: charge not successful (status: "${data?.status}") — skipping`);
      return NextResponse.json({ message: 'Charge not successful — skipped' }, { status: 200 });
    }

    const { tx_ref, amount, id: flwTransactionId } = data;

    if (!tx_ref) {
      console.warn('⚠️  Webhook: payload missing tx_ref');
      return NextResponse.json({ message: 'Missing tx_ref' }, { status: 200 });
    }

    // ── 5. Connect to DB and find the pending transaction ───────────────
    await connectDb();

    const transaction = await TransactionModel.findOne({ reference: tx_ref });

    if (!transaction) {
      // Could happen if save-payment-to-db never fired (edge case).
      // Log for manual review but return 200 so Flutterwave stops retrying.
      console.warn(`⚠️  Webhook: no DB transaction found for tx_ref="${tx_ref}"`);
      return NextResponse.json({ message: 'Transaction not found — acknowledged' }, { status: 200 });
    }

    // ── 6. Idempotency guard — never double-credit ──────────────────────
    // The redirect-based verify-payment route may have already processed this.
    if (transaction.status === 'success') {
      console.log(`✅ Webhook: tx_ref="${tx_ref}" already processed — skipping`);
      return NextResponse.json({ message: 'Already processed' }, { status: 200 });
    }

    // ── 7. Tamper check — amount must match what was saved in DB ────────
    if (Number(transaction.amount) !== Number(amount)) {
      console.error(
        `❌ Webhook: amount mismatch for tx_ref="${tx_ref}". ` +
        `DB: ₦${transaction.amount}, Flutterwave: ₦${amount}`
      );
      // Mark as failed and flag for manual review
      transaction.status = 'failed';
      transaction.failureReason =
        `Webhook amount mismatch — expected ₦${transaction.amount}, received ₦${amount}`;
      await transaction.save();
      return NextResponse.json({ message: 'Amount mismatch — transaction flagged' }, { status: 200 });
    }

    // ── 8. Fetch the user ───────────────────────────────────────────────
    const user = await UserModel.findById(transaction.userId);
    if (!user) {
      console.error(`❌ Webhook: user not found for userId=${transaction.userId} (tx_ref="${tx_ref}")`);
      return NextResponse.json({ message: 'User not found — acknowledged' }, { status: 200 });
    }

    // ── 9. Compute balance and update transaction ───────────────────────
    const cleanAmount = Number(amount);
    const balanceAfter = Number(user.walletBalance) + cleanAmount;

    transaction.status = 'success';
    // Store the Flutterwave transaction ID so you can trace it on their dashboard
    transaction.providerReference = String(flwTransactionId);
    transaction.meta.wallet.balanceAfter = balanceAfter;
    transaction.markModified('meta.wallet'); // required for nested schema updates
    await transaction.save();

    // ── 10. Credit the user's wallet ────────────────────────────────────
    await UserModel.findByIdAndUpdate(transaction.userId, {
      $inc: { walletBalance: cleanAmount },
    });

    console.log(
      `✅ Webhook: wallet credited ₦${cleanAmount} for userId=${transaction.userId} ` +
      `(tx_ref="${tx_ref}", flwId=${flwTransactionId})`
    );

    return NextResponse.json({ message: 'Wallet credited successfully' }, { status: 200 });

  } catch (error) {
    // Log the full error for debugging but still return 200.
    // Returning 500 here would cause Flutterwave to retry — which could
    // cause a double-credit if the error happened after the wallet update.
    console.error('❌ Flutterwave webhook — unhandled error:', error.message, error.stack);
    return NextResponse.json(
      { message: 'Internal error — logged for review' },
      { status: 200 }
    );
  }
}
