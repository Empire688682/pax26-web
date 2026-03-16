import axios from 'axios';
import { NextResponse } from 'next/server';
import { connectDb } from '../../ults/db/ConnectDb';
import UserModel from '../../ults/models/UserModel';
import ReferralModel from '../../ults/models/ReferralModel';
import { verifyToken } from '../helper/VerifyToken';
import TransactionModel from '@/app/ults/models/TransactionModel';
import { corsHeaders } from '@/app/ults/corsHeaders/corsHeaders';

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders() });
}

export async function POST(req) {

  const { transaction_id } = await req.json();

  if (!transaction_id) {
    return NextResponse.json({ success: false, message: 'No transaction ID provided' }, { status: 400, headers: corsHeaders() });
  }

  try {
    await connectDb();

    const userId = await verifyToken(req);

    if (!userId) {
      return NextResponse.json({ success: false, message: 'User not authorize' }, { status: 401, headers: corsHeaders() });
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404, headers: corsHeaders() }
      );
    }

    const verifyUrl = `https://api.flutterwave.com/v3/transactions/${transaction_id}/verify`;
    const response = await axios.get(verifyUrl, {
      headers: {
        Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
      },
    });

    const { status, amount, tx_ref } = response.data.data;

    if (status === 'successful') {
      const existingPayment = await TransactionModel.findOne({ reference: tx_ref });

      if (!existingPayment) {
        return NextResponse.json(
          { success: false, message: 'Payment not found in DB' },
          { status: 404, headers: corsHeaders() }
        );
      }

      if (existingPayment.status === 'success') {
        return NextResponse.json(
          { success: true, message: 'Payment already verified' },
          { status: 200, headers: corsHeaders() }
        );
      }

      // ✅ Tamper check
      if (Number(existingPayment.amount) !== Number(amount)) {
        return NextResponse.json(
          { success: false, message: 'Amount mismatch, possible tampering' },
          { status: 400, headers: corsHeaders() }
        );
      }

      const user = await UserModel.findById(userId);
      if (!user) {
        return NextResponse.json(
          { success: false, message: 'User not found' },
          { status: 404, headers: corsHeaders() }
        );
      }

      const cleanAmount = Number(amount);
      if (isNaN(cleanAmount)) throw new Error('Invalid amount');

      const balanceAfter = Number(user.walletBalance) + cleanAmount;

      existingPayment.status = 'success';
      existingPayment.meta.wallet.balanceAfter = balanceAfter;
      existingPayment.markModified('meta.wallet'); // ← critical
      await existingPayment.save();

      await UserModel.findByIdAndUpdate(userId, { $inc: { walletBalance: cleanAmount } });

      // Referral settlement
      const referral = await ReferralModel.findOne({ referredUser: userId, rewardGiven: false });
      if (referral) {
        const bonusAmount = cleanAmount >= 1000 ? 50 : 10;
        await UserModel.findByIdAndUpdate(referral.referrer, { $inc: { commissionBalance: bonusAmount } });
        referral.rewardGiven = true;
        referral.fundedAmount = bonusAmount;
        await referral.save();
      }

      return NextResponse.json(
        { success: true, message: 'Payment verified and wallet updated' },
        { status: 200, headers: corsHeaders() }
      );
    }
  } catch (err) {
    console.error("❌ Verification error:", err.response?.data || err.message);
    return NextResponse.json({ success: false, message: 'Verification failed' }, { status: 500, headers: corsHeaders() });
  }
}
