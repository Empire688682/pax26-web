# Design Document — Pax26 AI Chatbot

## Overview

This document describes the technical architecture for replacing the Tawk.io live chat widget with a fully custom, AI-powered chatbot on the Pax26 platform. The chatbot is a floating widget on the `/contact` page, powered by Google Gemini Flash, backed by MongoDB, and governed by a per-session rate limiter.

The implementation builds on the existing project conventions:
- **Framework**: Next.js 15 App Router, ESM (`"type": "module"`)
- **Styling**: Tailwind CSS v4 + inline styles using `pax26` theme tokens from `buildPax26Theme`
- **State/Theme**: `useGlobalContext()` from `@/components/Context` for `pax26` theme object and `userData`
- **Database**: Mongoose via `connectDb()` from `@/app/ults/db/ConnectDb`
- **AI SDK**: `@google/generative-ai` (already installed)
- **Animation**: `framer-motion` (already installed)

---

## Architecture

### High-Level Flow

```
Browser (Contact Page)
  └── <ChatbotWidget />          ← floating FAB + chat window
        ├── useChatSession()     ← session ID management (localStorage)
        ├── useChatHistory()     ← GET /api/chatbot/history
        └── useSendMessage()     ← POST /api/chatbot/message

Next.js API Routes (/api/chatbot/)
  ├── message/route.js           ← POST: sanitize → rate-limit → Gemini → persist
  ├── history/route.js           ← GET / DELETE: fetch or clear conversation
  └── rate-limit/route.js        ← GET: return current quota status

MongoDB (chatbot_conversations)
  └── ChatConversationModel      ← sessionId, messages[], messageCount, windowStart
```

---

## File Structure

```
src/
├── config/
│   └── pax26Knowledge.js                    ← Pax26 knowledge base string (NEW)
│
├── app/
│   ├── ClientWrapper.js                     ← MODIFY: remove Tawk.io code
│   ├── ults/
│   │   └── models/
│   │       └── ChatConversationModel.js     ← NEW: Mongoose schema
│   └── api/
│       └── chatbot/
│           ├── message/
│           │   └── route.js                 ← NEW: POST handler
│           ├── history/
│           │   └── route.js                 ← NEW: GET + DELETE handler
│           └── rate-limit/
│               └── route.js                 ← NEW: GET handler
│
└── components/
    └── Chatbot/
        └── ChatbotWidget.jsx                ← NEW: replaces existing Chatbot.jsx stub
```

> The existing `src/components/Chatbot/Chatbot.jsx` is a full-page chat UI (used elsewhere). The new `ChatbotWidget.jsx` is the floating widget specifically for the Contact page.

---

## Component Design

### `ChatbotWidget.jsx`

A single self-contained client component rendered inside `src/app/contact/page.jsx`.

**State:**
| State | Type | Purpose |
|---|---|---|
| `isOpen` | boolean | Chat window open/closed |
| `messages` | Message[] | Conversation thread |
| `input` | string | Textarea value |
| `isLoading` | boolean | Waiting for AI response |
| `hasUnread` | boolean | New AI message while window closed (badge) |
| `rateLimitInfo` | object | `{ count, max, windowExpiry }` |
| `historyError` | string\|null | Error loading history on mount |
| `sessionId` | string | UUID v4 from localStorage |

**Session ID logic (on mount):**
```js
let sid = localStorage.getItem('pax26_chat_session_id');
if (!sid) {
  sid = crypto.randomUUID();
  try { localStorage.setItem('pax26_chat_session_id', sid); } catch {}
}
// fallback: in-memory if localStorage throws
```

**History load (on mount, after sessionId resolved):**
- `GET /api/chatbot/history?sessionId=<sid>` with a 5-second `AbortController` timeout
- On success: populate `messages` state
- On error/timeout: set `historyError`, leave `messages` empty, allow chatting

**Send message flow:**
1. Validate: non-empty, ≤ 1000 chars
2. Append user message to `messages` optimistically
3. Set `isLoading = true`, disable input/send
4. `POST /api/chatbot/message` with `{ sessionId, message }`
5. On success: append AI response, update `rateLimitInfo`
6. On 429: show rate-limit message with expiry timestamp
7. On error: append error message with "Something went wrong"
8. Set `isLoading = false`

**Responsive layout:**
- `< 640px`: `position: fixed; inset: 0` (full screen)
- `≥ 640px`: `position: fixed; bottom: 24px; right: 24px; width: 360px; height: 520px`

**Theme integration:**
```js
const { pax26, userData } = useGlobalContext();
// FAB background: pax26.primary
// Header background: pax26.primary
// Message bubbles: pax26 token system (matches existing Chatbot.jsx patterns)
```

**Animation (framer-motion):**
```js
// Chat window: AnimatePresence + motion.div with scale/opacity spring
// FAB: motion.button with whileHover/whileTap
```

**Character counter:** shown when `input.length > 800`, displays `1000 - input.length` (can go negative).

**Rate limit warning banner:** shown when `rateLimitInfo.count >= rateLimitInfo.max - 2`.

---

## API Route Design

### `POST /api/chatbot/message`

**Request body:** `{ sessionId: string, message: string }`

**Processing pipeline:**
1. Validate `sessionId` present → 400
2. Validate `message` present and non-empty → 400
3. Validate `message.length <= 1000` → 400
4. Sanitize `message`: strip HTML tags, `javascript:` URIs, event handler attributes
5. Extract IP from `x-forwarded-for` or `req.ip`
6. **IP rate limit check**: query `ChatConversation` docs for this IP in the last hour; if total `messageCount` across sessions > 200 → 429
7. **Session rate limit check**: load `ChatConversation` for `sessionId`; determine user limit (100 if `userData` cookie present, else 20); check fixed window → 429 with expiry if exceeded; reset window if expired
8. Import `pax26Knowledge.js`; if empty/missing → 500
9. Build Gemini request: system prompt (knowledge base + persona instruction) + conversation history (last 20 messages) + new user message
10. Call Gemini Flash API via `@google/generative-ai`
11. Upsert `ChatConversation`: append both user message and AI response, increment `messageCount`
12. Return `{ message: aiText, rateLimitInfo: { count, max, windowExpiry } }` → 200

**Sanitization helper:**
```js
function sanitize(text) {
  return text
    .replace(/<[^>]*>/g, '')                          // strip HTML tags
    .replace(/javascript:/gi, '')                      // strip JS URIs
    .replace(/\bon\w+\s*=/gi, '')                     // strip event handlers
    .trim();
}
```

### `GET /api/chatbot/history`

**Query params:** `?sessionId=<sid>`

- Validate `sessionId` → 400 if missing
- Find `ChatConversation` by `sessionId`
- If not found → `{ messages: [] }` 200
- Return `{ messages: doc.messages.slice(-50) }` ordered by ascending `createdAt` → 200

### `DELETE /api/chatbot/history`

**Query params:** `?sessionId=<sid>`

- Validate `sessionId` → 400 if missing
- `ChatConversation.deleteOne({ sessionId })` → 200 `{ success: true }`

### `GET /api/chatbot/rate-limit`

**Query params:** `?sessionId=<sid>`

- Validate `sessionId` → 400 if missing
- Find doc; if not found return `{ count: 0, max: 20, windowExpiry: null }`
- Return `{ count: doc.messageCount, max, windowExpiry: windowStart + 24h }` → 200

---

## Database Schema

### `ChatConversationModel.js`

```js
// src/app/ults/models/ChatConversationModel.js
import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
  role:      { type: String, enum: ['user', 'assistant'], required: true },
  text:      { type: String, required: true, maxlength: 1000 },
  createdAt: { type: Date, default: Date.now },
}, { _id: false });

const ChatConversationSchema = new mongoose.Schema({
  sessionId:    { type: String, required: true, unique: true, index: true },
  ipAddress:    { type: String },
  userId:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  messages:     [MessageSchema],
  messageCount: { type: Number, default: 0 },
  windowStart:  { type: Date },
}, { timestamps: true });

export default mongoose.models.ChatConversation
  || mongoose.model('ChatConversation', ChatConversationSchema);
```

**Upsert pattern (on message send):**
```js
await ChatConversation.findOneAndUpdate(
  { sessionId },
  {
    $push: { messages: { $each: [userMsg, assistantMsg] } },
    $inc:  { messageCount: 1 },
    $setOnInsert: { windowStart: now, ipAddress, userId },
  },
  { upsert: true, new: true }
);
```

---

## Knowledge Base

### `src/config/pax26Knowledge.js`

Exports a single named string constant `PAX26_KNOWLEDGE`. The Chat_API prepends this as the system context for every Gemini request. The file covers:

- Platform overview and mission
- Services: airtime, data, electricity, TV subscriptions, gift cards
- AI automation features: WhatsApp auto-reply, chatbot builder, follow-up tools
- Pricing tiers
- Support channels and contact info
- FAQs

The system prompt template injected into Gemini:
```
${PAX26_KNOWLEDGE}

You are the official Pax26 assistant. Do not identify yourself as a generic AI model.
Only answer questions related to Pax26 services, features, pricing, and support.
If a question is unrelated to Pax26, politely acknowledge it is outside your scope
and redirect the user to ask about Pax26 services.
```

---

## Tawk.io Removal

**`ClientWrapper.js` changes:**
1. Remove the `showTawk` variable and its `useEffect`
2. Remove the `{showTawk && <Script id="tawk-to-live-chat" ... />}` JSX block
3. Remove the `Script` import if no longer used elsewhere in the file

**`.env` changes:**
- Remove any `TAWK_*` environment variables (check `.env`, `.env.local`, `.env.production`)

---

## Rate Limiting Design

### Session-based (fixed window)

```
windowStart = first message timestamp for this session
windowEnd   = windowStart + 24 hours
limit       = 20 (guest) | 100 (authenticated)

On each request:
  if now >= windowEnd:
    reset messageCount = 0, windowStart = now
  if messageCount >= limit:
    return 429 with windowEnd timestamp
  else:
    proceed, increment messageCount
```

### IP-based (rolling 1-hour window)

```
Count total messages across all ChatConversation docs
where ipAddress = req.ip AND updatedAt >= now - 1 hour

If total > 200: return 429
```

This is implemented via a MongoDB aggregation on the `ChatConversation` collection rather than a separate store, keeping the dependency count low.

---

## Security Considerations

- `GEMINI_API_KEY` is server-side only; never referenced in any client component
- All user input is sanitized before storage and before forwarding to Gemini
- Message length hard-capped at 1000 chars at both client and server
- IP extracted from `x-forwarded-for` header (Vercel/proxy-aware)
- Session IDs are UUIDs generated client-side; no PII is stored in the session ID itself

---

## Integration Points

| Integration | How |
|---|---|
| Theme | `useGlobalContext().pax26` — same token system as existing `Chatbot.jsx` |
| Auth detection | Read `UserToken` cookie in API route to determine guest vs. authenticated limit |
| DB connection | `connectDb()` from `@/app/ults/db/ConnectDb` — same pattern as all other routes |
| Contact page | Import `<ChatbotWidget />` into `src/app/contact/page.jsx` (client component) |
| Gemini SDK | `@google/generative-ai` — already in `package.json` |

---

## Non-Goals

- No admin dashboard for viewing conversations (future feature)
- No streaming responses (single-shot Gemini call for simplicity)
- No file/image upload in chat
- No multi-language support beyond English
- The existing full-page `Chatbot.jsx` (used in dashboard/AI features) is **not modified**
