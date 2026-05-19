/**
 * GET /api/referral/code
 * Returns the referral code for the authenticated user.
 * Only paid users (starter, business, enterprise) have a referral code.
 */
import { NextResponse } from 'next/server';
import { connectDb } from '@/app/ults/db/ConnectDb';
import { verifyToken } from '../../helper/VerifyToken';
import { corsHeaders } from '@/app/ults/corsHeaders/corsHeaders';
import UserModel from '@/app/ults/models/UserModel';
import { isPaidPlan, ensureReferralCode } from '@/app/lib/referralService';

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders() });
}

export async function GET(req) {
  await connectDb();
  try {
    const userId = await verifyToken(req);
    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401, headers: corsHeaders() }
      );
    }

    const user = await UserModel.findById(userId).select(
      'referralCode paxAI name'
    );

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404, headers: corsHeaders() }
      );
    }

    const plan = user.paxAI?.plan;
    const isPaid = await isPaidPlan(plan);
    if (!isPaid) {
      return NextResponse.json(
        {
          success: false,
          message: 'Referral codes are available for paid plan subscribers only.',
          isPaidUser: false,
        },
        { status: 403, headers: corsHeaders() }
      );
    }

    // Assign code if missing (idempotent)
    if (!user.referralCode) {
      await ensureReferralCode(user);
    }

    return NextResponse.json(
      {
        success: true,
        referralCode: user.referralCode,
        isPaidUser: true,
      },
      { status: 200, headers: corsHeaders() }
    );
  } catch (error) {
    console.error('Referral code error:', error);
    return NextResponse.json(
      { success: false, message: 'Something went wrong' },
      { status: 500, headers: corsHeaders() }
    );
  }
}
