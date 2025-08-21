import axios from 'axios';
import dotenv from 'dotenv';
import { NextResponse } from 'next/server';
import { connectDb } from '../../ults/db/ConnectDb';
import PaymentModel from '../../ults/models/PaymentModel';
import UserModel from '../../ults/models/UserModel';
import ReferralModel from '../../ults/models/ReferralModel'; // ✅ import this
import { verifyToken } from '../helper/VerifyToken';
import TransactionModel from '@/app/ults/models/TransactionModel';
import { corsHeaders } from '@/app/ults/corsHeaders/corsHeaders';

dotenv.config();

export async function OPTIONS() {
    return new NextResponse(null, {status:200, headers:corsHeaders()});
}

export async function POST(req) {
  const { transaction_id, mobileUserId } = await req.json();
  console.log("transaction_id:", transaction_id);

  if (!transaction_id) {
    return NextResponse.json({ success: false, message: 'No transaction ID provided' }, { status: 400, headers:corsHeaders() });
  }

  try {
    await connectDb();

     const userId = mobileUserId || await verifyToken(req);
    if (!userId) {
      return NextResponse.json({ success: false, message: 'User not authorized' }, { status: 401, headers:corsHeaders() });
    }
    
    const verifyUrl = `https://api.flutterwave.com/v3/transactions/${transaction_id}/verify`;
    const response = await axios.get(verifyUrl, {
      headers: {
        Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
      },
    });

    const { status, amount, tx_ref } = response.data.data;

    if (status === 'successful') {
      const existingPayment = await PaymentModel.findOne({ reference: tx_ref });

      if (!existingPayment) {
        return NextResponse.json({ success: false, message: 'Payment not found in DB' }, { status: 404, headers:corsHeaders() });
      }

      if (existingPayment.status === 'PAID') {
        return NextResponse.json({ success: true, message: 'Payment already verified' }, { status: 200, headers:corsHeaders() });
      }

      existingPayment.status = 'PAID';
      await existingPayment.save();

      const newTransaction = await TransactionModel.create(
        [{
          userId,
          type: "Wallet funding",
          amount,
          status: "success",
          reference: existingPayment._id,
        }],
      );

      const cleanAmount = Number(amount);
      if (isNaN(cleanAmount)) throw new Error('Invalid amount');

      await UserModel.findByIdAndUpdate(userId, { $inc: { walletBalance: cleanAmount } });

      // ✅ REFERRAL SETTLEMENT SECTION
      const referral = await ReferralModel.findOne({ referredUser: userId, rewardGiven: false });

      if (referral) {
        const bonusAmount = cleanAmount >= 1000 ? 50 : 10;
        await UserModel.findByIdAndUpdate(referral.referrer, { $inc: { commisionBalance: bonusAmount } });
        referral.rewardGiven = true;
        referral.fundedAmount = bonusAmount
        await referral.save();
      }

      return NextResponse.json({ success: true, message: 'Payment verified and wallet updated' }, { status: 200, headers:corsHeaders() });
    } else {
      return NextResponse.json({ success: false, message: 'Transaction not successful' }, { status: 400, headers:corsHeaders() });
    }
  } catch (err) {
    console.error(err.response?.data || err.message);
    return NextResponse.json({ success: false, message: 'Verification failed' }, { status: 500, headers:corsHeaders() });
  }
}
