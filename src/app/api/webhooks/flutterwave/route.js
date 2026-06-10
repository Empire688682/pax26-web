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
 *
 * Supports both Flutterwave payload formats:
 *  - New format: { event: "charge.completed", data: { tx_ref, amount, ... } }
 *  - Old format: { "event.type": "BANK_TRANSFER_TRANSACTION", txRef, amount, ... }
 */

import { NextResponse } from 'next/server';
import { connectDb } from '@/app/ults/db/ConnectDb';
import TransactionModel from '@/app/ults/models/TransactionModel';
import UserModel from '@/app/ults/models/UserModel';

export async function POST(req) {
  try {
    // ── 1. Signature verification ───────────────────────────────────────
    const secretHash = process.env.FLW_SECRET_HASH;
    const signature = req.headers.get('verif-hash');

    console.log('💰 Flutterwave webhook: signature:', signature);

    if (!signature || signature !== secretHash) {
      console.log('⚠️  Flutterwave webhook: invalid or missing verif-hash signature');
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // ── 2. Parse payload ────────────────────────────────────────────────
    const payload = await req.json();
    console.log('📦 Flutterwave webhook payload raw:', JSON.stringify(payload));

    // ── 3. Detect payload format ────────────────────────────────────────
    // New format: payload.event = "charge.completed", payload.data = { ... }
    // Old format: payload["event.type"] = "BANK_TRANSFER_TRANSACTION", data at root
    const isNewFormat = !!payload.data && !!payload.event;
    const isOldFormat = !!payload['event.type'] || !!payload.txRef;

    const event = payload.event
      || payload['event.type']
      || payload['event-type']
      || payload.event_type
      || 'UNKNOWN';

    console.log(`📦 Flutterwave webhook received — event: "${event}" | format: ${isNewFormat ? 'new' : 'old'}`);

    // ── 4. Extract data based on format ─────────────────────────────────
    let data;
    let tx_ref;
    let amount;
    let flwTransactionId;
    let chargeStatus;

    if (isNewFormat) {
      // New format — data is nested under payload.data
      data = payload.data;
      tx_ref = data.tx_ref;
      amount = data.amount;
      flwTransactionId = data.id;
      chargeStatus = data.status;
    } else {
      // Old format — data is at the root of payload
      data = payload;
      tx_ref = payload.txRef || payload.tx_ref;
      amount = payload.amount;
      flwTransactionId = payload.id;
      chargeStatus = payload.status;
    }

    // ── 5. Filter to only charge/payment events ─────────────────────────
    const isChargeEvent =
      event === 'charge.completed' ||
      event === 'BANK_TRANSFER_TRANSACTION' ||
      event === 'CARD_TRANSACTION' ||
      event === 'USSD_TRANSACTION' ||
      event === 'MOBILEMONEY_TRANSACTION' ||
      String(event).includes('TRANSACTION');

    if (!isChargeEvent) {
      console.log(`ℹ️  Webhook: event "${event}" is not a charge event — acknowledged and ignored`);
      return NextResponse.json(
        { message: `Event "${event}" acknowledged but not handled` },
        { status: 200 }
      );
    }

    // ── 6. Only process successful charges ──────────────────────────────
    if (!chargeStatus || (chargeStatus !== 'successful' && chargeStatus !== 'success')) {
      console.log(`ℹ️  Webhook: charge not successful (status: "${chargeStatus}") — skipping`);
      return NextResponse.json({ message: 'Charge not successful — skipped' }, { status: 200 });
    }

    if (!tx_ref) {
      console.log('⚠️  Webhook: payload missing tx_ref/txRef');
      return NextResponse.json({ message: 'Missing tx_ref' }, { status: 200 });
    }

    console.log(`🔍 Webhook: processing tx_ref="${tx_ref}", amount=${amount}, flwId=${flwTransactionId}`);

    // ── 7. Connect to DB and find the pending transaction ───────────────
    await connectDb();

    const transaction = await TransactionModel.findOne({ reference: tx_ref });

    if (!transaction) {
      console.log(`⚠️  Webhook: no DB transaction found for tx_ref="${tx_ref}"`);
      return NextResponse.json({ message: 'Transaction not found — acknowledged' }, { status: 200 });
    }

    // ── 8. Idempotency guard — never double-credit ──────────────────────
    if (transaction.status === 'success') {
      console.log(`✅ Webhook: tx_ref="${tx_ref}" already processed — skipping`);
      return NextResponse.json({ message: 'Already processed' }, { status: 200 });
    }

    // ── 9. Tamper check — amount must match what was saved in DB ────────
    if (Number(transaction.amount) !== Number(amount)) {
      console.log(
        `❌ Webhook: amount mismatch for tx_ref="${tx_ref}". ` +
        `DB: ${transaction.amount}, Flutterwave: ${amount}`
      );
      transaction.status = 'failed';
      transaction.failureReason =
        `Webhook amount mismatch — expected ${transaction.amount}, received ${amount}`;
      await transaction.save();
      return NextResponse.json({ message: 'Amount mismatch — transaction flagged' }, { status: 200 });
    }

    // ── 10. Fetch the user ──────────────────────────────────────────────
    const user = await UserModel.findById(transaction.userId);
    if (!user) {
      console.error(`❌ Webhook: user not found for userId=${transaction.userId} (tx_ref="${tx_ref}")`);
      return NextResponse.json({ message: 'User not found — acknowledged' }, { status: 200 });
    }

    // ── 11. Compute balance and update transaction ──────────────────────
    const cleanAmount = Number(amount);
    const balanceAfter = Number(user.walletBalance) + cleanAmount;

    transaction.status = 'success';
    transaction.providerReference = String(flwTransactionId);

    if (!transaction.meta) transaction.meta = {};
    if (!transaction.meta.wallet) transaction.meta.wallet = {};
    transaction.meta.wallet.balanceAfter = balanceAfter;

    transaction.markModified('meta.wallet');
    await transaction.save();

    // ── 12. Credit the user's wallet ────────────────────────────────────
    await UserModel.findByIdAndUpdate(transaction.userId, {
      $inc: { walletBalance: cleanAmount },
    });

    console.log(
      `✅ Webhook: wallet credited ${cleanAmount} for userId=${transaction.userId} ` +
      `(tx_ref="${tx_ref}", flwId=${flwTransactionId}, format=${isNewFormat ? 'new' : 'old'})`
    );

    return NextResponse.json({ message: 'Wallet credited successfully' }, { status: 200 });

  } catch (error) {
    // Return 200 even on error to prevent Flutterwave retries that could
    // cause double-credits if error happened after the wallet update.
    console.error('❌ Flutterwave webhook — unhandled error:', error.message, error.stack);
    return NextResponse.json(
      { message: 'Internal error — logged for review' },
      { status: 200 }
    );
  }
}