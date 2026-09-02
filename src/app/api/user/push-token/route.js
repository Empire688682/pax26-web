/**
 * POST /api/user/push-token
 * Saves the Expo push token for this user so the backend
 * can send real-time notifications to their phone.
 */
import { NextResponse } from 'next/server';
import { connectDb } from '@/app/ults/db/ConnectDb';
import { verifyToken } from '@/app/api/helper/VerifyToken';
import { corsHeaders } from '@/app/ults/corsHeaders/corsHeaders';
import UserModel from '@/app/ults/models/UserModel';

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders() });
}

export async function POST(req) {
  await connectDb();
  try {
    const userId = await verifyToken(req);
    if (!userId) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401, headers: corsHeaders() });
    }

    const { token } = await req.json();
    if (!token || typeof token !== 'string') {
      return NextResponse.json({ success: false, message: 'Push token is required' }, { status: 400, headers: corsHeaders() });
    }

    await UserModel.findByIdAndUpdate(userId, {
      $set: { 'mobilePushToken': token },
    });

    return NextResponse.json({ success: true }, { status: 200, headers: corsHeaders() });
  } catch (err) {
    console.error('push-token error:', err);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500, headers: corsHeaders() });
  }
}
