import { NextResponse } from 'next/server';
import { connectDb } from '@/app/ults/db/ConnectDb';
import { corsHeaders } from '@/app/ults/corsHeaders/corsHeaders';
import ChatConversationModel from '@/app/ults/models/ChatConversationModel';

// Handle preflight OPTIONS request
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders(),
  });
}

// GET /api/chatbot/history?sessionId=<sid>
// Returns the 50 most recent messages for the session, ordered ascending by createdAt
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

    await connectDb();

    const doc = await ChatConversationModel.findOne({ sessionId });

    if (!doc) {
      return NextResponse.json(
        { messages: [] },
        { status: 200, headers: corsHeaders() }
      );
    }

    // Return last 50 messages, already stored in ascending createdAt order
    const messages = doc.messages.slice(-50);

    return NextResponse.json(
      { messages },
      { status: 200, headers: corsHeaders() }
    );
  } catch (error) {
    console.error('Chatbot history GET error:', error);
    return NextResponse.json(
      { message: 'An error occurred' },
      { status: 500, headers: corsHeaders() }
    );
  }
}

// DELETE /api/chatbot/history?sessionId=<sid>
// Deletes all messages for the session
export async function DELETE(req) {
  try {
    const { searchParams } = req.nextUrl;
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { message: 'sessionId is required' },
        { status: 400, headers: corsHeaders() }
      );
    }

    await connectDb();

    await ChatConversationModel.deleteOne({ sessionId });

    return NextResponse.json(
      { success: true },
      { status: 200, headers: corsHeaders() }
    );
  } catch (error) {
    console.error('Chatbot history DELETE error:', error);
    return NextResponse.json(
      { message: 'An error occurred' },
      { status: 500, headers: corsHeaders() }
    );
  }
}
