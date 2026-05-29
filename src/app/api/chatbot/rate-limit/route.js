import { NextResponse } from 'next/server';
import { connectDb } from '@/app/ults/db/ConnectDb';
import { corsHeaders } from '@/app/ults/corsHeaders/corsHeaders';
import ChatConversationModel from '@/app/ults/models/ChatConversationModel';
import { verifyToken } from '@/app/api/helper/VerifyToken';

// Handle preflight OPTIONS request
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders(),
  });
}

// GET /api/chatbot/rate-limit?sessionId=<sid>
// Returns current message count, max allowed, and window expiry for the session
export async function GET(req) {
  try {
    const { searchParams } = req.nextUrl;
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { message: 'sessionId is required' },
        { status: 400, headers: corsHeaders() }
      );
    }

    // Determine limit based on auth status (100 authenticated, 20 guest)
    const userId = verifyToken(req);
    const max = userId ? 100 : 20;

    await connectDb();

    const doc = await ChatConversationModel.findOne({ sessionId });

    // No conversation yet — return zeroed state
    if (!doc) {
      return NextResponse.json(
        { count: 0, max, windowExpiry: null },
        { status: 200, headers: corsHeaders() }
      );
    }

    // Compute window expiry: windowStart + 24 hours
    const windowExpiry = doc.windowStart
      ? new Date(doc.windowStart.getTime() + 24 * 60 * 60 * 1000).toISOString()
      : null;

    return NextResponse.json(
      { count: doc.messageCount, max, windowExpiry },
      { status: 200, headers: corsHeaders() }
    );
  } catch (error) {
    console.error('Chatbot rate-limit GET error:', error);
    return NextResponse.json(
      { message: 'An error occurred' },
      { status: 500, headers: corsHeaders() }
    );
  }
}
