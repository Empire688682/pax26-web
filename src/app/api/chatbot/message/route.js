import { NextResponse } from 'next/server';
import { connectDb } from '@/app/ults/db/ConnectDb';
import { corsHeaders } from '@/app/ults/corsHeaders/corsHeaders';
import ChatConversationModel from '@/app/ults/models/ChatConversationModel';
import { verifyToken } from '@/app/api/helper/VerifyToken';
import { generateAIResponse } from '@/app/lib/aiProvider';
import { getPax26Context } from '@/app/lib/pax26Context';

// ---------------------------------------------------------------------------
// OPTIONS — preflight
// ---------------------------------------------------------------------------
export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders() });
}

// ---------------------------------------------------------------------------
// Sanitize user input: strip HTML tags, JS URIs, and event handler attributes
// ---------------------------------------------------------------------------
function sanitize(text) {
  return text
    .replace(/<[^>]*>/g, '')
    .replace(/javascript:/gi, '')
    .replace(/\bon\w+\s*=/gi, '')
    .trim();
}

// ---------------------------------------------------------------------------
// POST /api/chatbot/message
// ---------------------------------------------------------------------------
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

    // --- Build AI context (dynamic + cached) ---
    const knowledgeContext = await getPax26Context();

    // --- Build system prompt with updated brand positioning ---
    const systemPrompt = `${knowledgeContext}

---

## IDENTITY
You are the official Pax26 AI assistant. Pax26 is an AI automation and business growth platform focused on WhatsApp automation, AI chatbots, customer engagement, and smart workflow tools. VTU services (airtime, data, electricity, TV subscriptions) are secondary support services.

## ABSOLUTE FACTS — NEVER CONTRADICT THESE
1. Pax26 connects WhatsApp ONLY through Meta Embedded Signup (a Facebook/Meta login popup inside the Pax26 dashboard). There is NO QR code. There is NO WhatsApp scanning. If you mention a QR code or scanning in any WhatsApp-related answer, you are wrong.
2. The correct WhatsApp connection steps are: Dashboard → Automations → Connect WhatsApp → Meta/Facebook login popup → grant permissions → done.
3. Do not invent UI steps, button names, or features that are not in the knowledge base above.

## RESPONSE LENGTH RULES — STRICTLY FOLLOW
- Short or simple questions (greetings, yes/no, single-topic): reply in 1–3 sentences maximum. No bullet points, no headers.
- Medium questions (how-to, feature explanation): reply in 3–6 sentences or a short list of up to 4 items.
- Long or complex questions (multi-part, detailed setup, comparisons): reply with structured detail, but still be concise — no padding, no filler phrases like "I hope this helps" or "Feel free to ask".
- NEVER produce a long response for a short question. Match the depth of the answer to the depth of the question.
- Do not end responses with follow-up questions unless the user explicitly asked for guidance.

## SCOPE
Only answer questions related to Pax26 services, features, pricing, and support. If a question is unrelated to Pax26, say so in one sentence and redirect.

## BRAND PRIORITY
Lead with AI automation capabilities. Mention VTU services only when directly asked or relevant.`;

    // --- Build conversation history (last 20 messages, Gemini format) ---
    const recentMessages = existingDoc ? existingDoc.messages.slice(-20) : [];
    const conversationHistory = recentMessages.map((msg) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.text }],
    }));

    // --- Call AI provider (with automatic fallback chain) ---
    const aiResult = await generateAIResponse(
      systemPrompt,
      conversationHistory,
      sanitizedMessage
    );

    if (aiResult.error) {
      return NextResponse.json(
        { message: aiResult.error },
        { status: 503, headers: corsHeaders() }
      );
    }

    const aiText = aiResult.text;

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
                { role: 'user',      text: sanitizedMessage,                    createdAt: now },
                { role: 'assistant', text: aiText, createdAt: new Date(now.getTime() + 1) },
              ],
            },
          },
          $inc: { messageCount: 1 },
          $setOnInsert: {
            windowStart: now,
            ipAddress: clientIp,
            userId: userId || null,
          },
        },
        { upsert: true, new: true }
      );
    } catch (dbError) {
      console.error('[chatbot/message] DB upsert error:', dbError);
      return NextResponse.json(
        { message: 'Failed to save message. Please try again.' },
        { status: 500, headers: corsHeaders() }
      );
    }

    // --- Return success response ---
    const isAuth = !!userId;
    const max = isAuth ? 100 : 20;
    const windowExpiry = updatedDoc.windowStart
      ? new Date(updatedDoc.windowStart.getTime() + 24 * 60 * 60 * 1000).toISOString()
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
    console.error('[chatbot/message] Unhandled error:', error);
    return NextResponse.json(
      { message: 'An unexpected error occurred. Please try again.' },
      { status: 500, headers: corsHeaders() }
    );
  }
}
