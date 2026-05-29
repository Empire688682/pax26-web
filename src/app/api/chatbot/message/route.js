import { NextResponse } from 'next/server';
import { connectDb } from '@/app/ults/db/ConnectDb';
import { corsHeaders } from '@/app/ults/corsHeaders/corsHeaders';
import ChatConversationModel from '@/app/ults/models/ChatConversationModel';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { PAX26_KNOWLEDGE } from '@/config/pax26Knowledge';
import { verifyToken } from '@/app/api/helper/VerifyToken';

// Handle preflight OPTIONS request
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders(),
  });
}

// Sanitize user input: strip HTML tags, JS URIs, and event handler attributes
function sanitize(text) {
  return text
    .replace(/<[^>]*>/g, '')
    .replace(/javascript:/gi, '')
    .replace(/\bon\w+\s*=/gi, '')
    .trim();
}

export async function POST(req) {
  try {
    // --- Parse and validate request body ---
    const body = await req.json();
    const { sessionId, message } = body;

    if (!sessionId) {
      return NextResponse.json(
        { message: 'sessionId is required' },
        { status: 400, headers: corsHeaders() }
      );
    }

    if (!message || message.trim() === '') {
      return NextResponse.json(
        { message: 'message is required' },
        { status: 400, headers: corsHeaders() }
      );
    }

    if (message.length > 1000) {
      return NextResponse.json(
        { message: 'Message exceeds 1000 character limit' },
        { status: 400, headers: corsHeaders() }
      );
    }

    // --- Sanitize message ---
    const sanitizedMessage = sanitize(message);

    // --- Extract client IP ---
    const clientIp =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';

    // --- Connect to database ---
    await connectDb();

    // --- IP rate limit: rolling 1-hour window across all sessions ---
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const ipAggResult = await ChatConversationModel.aggregate([
      {
        $match: {
          ipAddress: clientIp,
          updatedAt: { $gte: oneHourAgo },
        },
      },
      {
        $group: {
          _id: null,
          totalMessages: { $sum: '$messageCount' },
        },
      },
    ]);

    const ipMessageTotal =
      ipAggResult.length > 0 ? ipAggResult[0].totalMessages : 0;

    if (ipMessageTotal > 200) {
      return NextResponse.json(
        { message: 'Too many requests from this IP. Please try again later.' },
        { status: 429, headers: corsHeaders() }
      );
    }

    // --- Session rate limit: fixed 24-hour window ---
    const userId = await verifyToken(req);
    const sessionLimit = userId ? 100 : 20;

    let existingDoc = await ChatConversationModel.findOne({ sessionId });

    if (existingDoc) {
      const now = new Date();
      const windowStart = existingDoc.windowStart
        ? new Date(existingDoc.windowStart)
        : now;
      const windowEnd = new Date(windowStart.getTime() + 24 * 60 * 60 * 1000);

      if (now < windowEnd) {
        // Window still active — check limit
        if (existingDoc.messageCount >= sessionLimit) {
          return NextResponse.json(
            {
              message: 'Daily message limit reached.',
              windowExpiry: windowEnd.toISOString(),
            },
            { status: 429, headers: corsHeaders() }
          );
        }
      } else {
        // Window expired — reset
        existingDoc.messageCount = 0;
        existingDoc.windowStart = now;
        await existingDoc.save();
      }
    }

    // --- Knowledge base check ---
    if (!PAX26_KNOWLEDGE || PAX26_KNOWLEDGE.trim() === '') {
      return NextResponse.json(
        { message: 'Knowledge base unavailable' },
        { status: 500, headers: corsHeaders() }
      );
    }

    // --- Build Gemini system prompt and conversation history ---
    const systemPrompt = `${PAX26_KNOWLEDGE}\n\nYou are the official Pax26 assistant. Do not identify yourself as a generic AI model. Only answer questions related to Pax26 services, features, pricing, and support. If a question is unrelated to Pax26, politely acknowledge it is outside your scope and redirect the user to ask about Pax26 services.`;

    const recentMessages = existingDoc ? existingDoc.messages.slice(-20) : [];
    const conversationHistory = recentMessages.map((msg) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.text }],
    }));

    // --- Call Gemini API ---
    let aiText;
    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        systemInstruction: systemPrompt,
      });
      const chat = model.startChat({ history: conversationHistory });
      const result = await chat.sendMessage(sanitizedMessage);
      aiText = result.response.text();
    } catch (aiError) {
      console.error('Gemini API error:', aiError);
      return NextResponse.json(
        { message: 'AI service unavailable. Please try again.' },
        { status: 500, headers: corsHeaders() }
      );
    }

    // --- Upsert conversation document ---
    let updatedDoc;
    try {
      const now = new Date();
      updatedDoc = await ChatConversationModel.findOneAndUpdate(
        { sessionId },
        {
          $push: {
            messages: {
              $each: [
                { role: 'user', text: sanitizedMessage, createdAt: now },
                {
                  role: 'assistant',
                  text: aiText,
                  createdAt: new Date(now.getTime() + 1),
                },
              ],
            },
          },
          $inc: { messageCount: 1 },
          $setOnInsert: { windowStart: now, ipAddress: clientIp, userId: userId || null },
        },
        { upsert: true, new: true }
      );
    } catch (dbError) {
      console.error('DB upsert error:', dbError);
      return NextResponse.json(
        { message: 'Failed to save message. Please try again.' },
        { status: 500, headers: corsHeaders() }
      );
    }

    // --- Return success response ---
    const isAuth = !!userId;
    const max = isAuth ? 100 : 20;
    const windowExpiry = updatedDoc.windowStart
      ? new Date(
          updatedDoc.windowStart.getTime() + 24 * 60 * 60 * 1000
        ).toISOString()
      : null;

    return NextResponse.json(
      {
        message: aiText,
        rateLimitInfo: {
          count: updatedDoc.messageCount,
          max,
          windowExpiry,
        },
      },
      { status: 200, headers: corsHeaders() }
    );
  } catch (error) {
    console.error('Chatbot message error:', error);
    return NextResponse.json(
      { message: 'An error occurred' },
      { status: 500, headers: corsHeaders() }
    );
  }
}
