/**
 * POST /api/user/push-preferences
 * Updates the user's mobile push notification preferences in MongoDB.
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

    const { prefs } = await req.json();
    if (!prefs || typeof prefs !== 'object') {
      return NextResponse.json({ success: false, message: 'Invalid preferences format' }, { status: 400, headers: corsHeaders() });
    }

    const updateFields = {};
    if (typeof prefs.newOrder === 'boolean')   updateFields['mobileNotifPrefs.newOrder']   = prefs.newOrder;
    if (typeof prefs.salesAlert === 'boolean')  updateFields['mobileNotifPrefs.salesAlert']  = prefs.salesAlert;
    if (typeof prefs.agentReply === 'boolean')  updateFields['mobileNotifPrefs.agentReply']  = prefs.agentReply;
    if (typeof prefs.newLead === 'boolean')    updateFields['mobileNotifPrefs.newLead']    = prefs.newLead;

    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { $set: updateFields },
      { new: true }
    ).select('mobileNotifPrefs').lean();

    return NextResponse.json({
      success: true,
      mobileNotifPrefs: updatedUser?.mobileNotifPrefs || {}
    }, { status: 200, headers: corsHeaders() });

  } catch (err) {
    console.error('push-preferences error:', err);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500, headers: corsHeaders() });
  }
}
