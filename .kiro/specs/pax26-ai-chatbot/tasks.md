# Implementation Tasks — Pax26 AI Chatbot

## Task Overview

Tasks are ordered by dependency. Each task maps to one or more requirements and design sections.

---

## Task 1: Remove Tawk.io Integration

**Requirement:** Requirement 1
**Design ref:** Tawk.io Removal section

### Sub-tasks

- [x] 1.1 Open `src/app/ClientWrapper.js` and delete the `showTawk` variable, the `useEffect` that calls `Tawk_API.show()`/`Tawk_API.hide()`, and the `{showTawk && <Script id="tawk-to-live-chat" ... />}` JSX block. Remove the `Script` import if it is no longer used.
- [x] 1.2 Search the entire codebase (`src/`, root config files) for any remaining references to `Tawk_API`, `tawk.to`, or `embed.tawk.to` and remove them.
- [x] 1.3 Open `.env` (and `.env.local`, `.env.production`, `.env.development` if they exist) and remove any environment variable whose key contains `TAWK`.
- [x] 1.4 Verify `ClientWrapper.js` still compiles without errors after the removal.

---

## Task 2: Create the Pax26 Knowledge Base

**Requirement:** Requirement 5
**Design ref:** Knowledge Base section

### Sub-tasks

- [x] 2.1 Create the directory `src/config/` if it does not exist.
- [x] 2.2 Create `src/config/pax26Knowledge.js` that exports a named string constant `PAX26_KNOWLEDGE` containing a comprehensive description of Pax26's services (airtime, data, electricity, TV subscriptions, gift cards), AI automation features (WhatsApp auto-reply, chatbot builder, follow-up tools), pricing tiers, support channels (email: info@pax26.com), and common FAQs. The string must be non-empty.
- [x] 2.3 Confirm the file exports `PAX26_KNOWLEDGE` as a named export and that the string is at least 500 characters.

---

## Task 3: Create the ChatConversation Mongoose Model

**Requirement:** Requirement 8
**Design ref:** Database Schema section

### Sub-tasks

- [x] 3.1 Create `src/app/ults/models/ChatConversationModel.js` with the `MessageSchema` sub-document (`role` enum `['user','assistant']`, `text` maxlength 1000, `createdAt`) and the `ChatConversationSchema` (`sessionId` unique indexed, `ipAddress`, `userId` optional ObjectId ref User, `messages` array, `messageCount` default 0, `windowStart` Date, Mongoose `timestamps: true`).
- [x] 3.2 Export the model using the guard pattern: `mongoose.models.ChatConversation || mongoose.model('ChatConversation', ChatConversationSchema)`.
- [x] 3.3 Confirm the file follows the same ESM export style as other models in `src/app/ults/models/`.

---

## Task 4: Implement the POST /api/chatbot/message Route

**Requirements:** Requirements 3, 5, 6, 7, 8, 9
**Design ref:** API Route Design — POST /api/chatbot/message

### Sub-tasks

- [x] 4.1 Create `src/app/api/chatbot/message/route.js`. Export an `OPTIONS` handler returning CORS headers (matching the pattern in `src/app/api/auth/login/route.js`) and a `POST` handler.
- [x] 4.2 In the `POST` handler: validate that `sessionId` and `message` are present in the request body; return HTTP 400 with `{ message: "..." }` if either is missing.
- [x] 4.3 Validate `message.length <= 1000`; return HTTP 400 if exceeded.
- [x] 4.4 Implement the `sanitize(text)` helper that strips HTML tags, `javascript:` URI schemes, and `on\w+=` event handler attributes from the message text.
- [x] 4.5 Extract the client IP from the `x-forwarded-for` request header (first value) or fall back to `'unknown'`.
- [x] 4.6 Implement IP-based rate limiting: aggregate `messageCount` across all `ChatConversation` documents where `ipAddress` matches and `updatedAt >= now - 1 hour`; return HTTP 429 if total exceeds 200.
- [x] 4.7 Implement session-based rate limiting using the fixed-window logic: load the `ChatConversation` doc for the session; detect authenticated user by checking for a valid `UserToken` cookie (set limit to 100 for authenticated, 20 for guest); reset window if expired; return HTTP 429 with `{ message: "...", windowExpiry: <ISO timestamp> }` if limit reached.
- [x] 4.8 Import `PAX26_KNOWLEDGE` from `src/config/pax26Knowledge.js`; return HTTP 500 if the import fails or the string is empty.
- [x] 4.9 Build the Gemini API request using `@google/generative-ai`: set the system instruction to the knowledge base string plus the persona instruction `"You are the official Pax26 assistant. Do not identify yourself as a generic AI model."`. Include the last 20 messages from the conversation history as chat history. Send the sanitized user message.
- [x] 4.10 Call the Gemini Flash model (`gemini-1.5-flash`) using `GEMINI_API_KEY` from `process.env`. Return HTTP 500 if the API call fails.
- [x] 4.11 Upsert the `ChatConversation` document: use `findOneAndUpdate` with `upsert: true` to append both the user message and the AI response to `messages`, increment `messageCount` by 1, set `windowStart` on insert, and set `ipAddress` and `userId` on insert. Return HTTP 500 with `{ message: "Failed to save message. Please try again." }` if the write fails.
- [x] 4.12 Return HTTP 200 with `{ message: aiResponseText, rateLimitInfo: { count, max, windowExpiry } }`.

---

## Task 5: Implement the GET/DELETE /api/chatbot/history Route

**Requirements:** Requirements 4, 7
**Design ref:** API Route Design — GET and DELETE /api/chatbot/history

### Sub-tasks

- [x] 5.1 Create `src/app/api/chatbot/history/route.js`. Export `OPTIONS`, `GET`, and `DELETE` handlers.
- [x] 5.2 In the `GET` handler: read `sessionId` from `req.nextUrl.searchParams`; return HTTP 400 if missing. Find the `ChatConversation` doc; if not found return `{ messages: [] }` with HTTP 200. Return `{ messages: doc.messages.slice(-50) }` ordered by ascending `createdAt` with HTTP 200.
- [x] 5.3 In the `DELETE` handler: read `sessionId` from `req.nextUrl.searchParams`; return HTTP 400 if missing. Call `ChatConversation.deleteOne({ sessionId })`; return `{ success: true }` with HTTP 200.

---

## Task 6: Implement the GET /api/chatbot/rate-limit Route

**Requirements:** Requirements 6, 7
**Design ref:** API Route Design — GET /api/chatbot/rate-limit

### Sub-tasks

- [x] 6.1 Create `src/app/api/chatbot/rate-limit/route.js`. Export `OPTIONS` and `GET` handlers.
- [x] 6.2 In the `GET` handler: read `sessionId` from `req.nextUrl.searchParams`; return HTTP 400 if missing.
- [x] 6.3 Find the `ChatConversation` doc; if not found return `{ count: 0, max: 20, windowExpiry: null }` with HTTP 200.
- [x] 6.4 Determine `max` (100 for authenticated via `UserToken` cookie, 20 for guest). Compute `windowExpiry` as `windowStart + 24 hours`. Return `{ count: doc.messageCount, max, windowExpiry }` with HTTP 200.

---

## Task 7: Build the ChatbotWidget UI Component

**Requirements:** Requirements 2, 3, 4, 6, 10
**Design ref:** Component Design section

### Sub-tasks

- [x] 7.1 Create `src/components/Chatbot/ChatbotWidget.jsx` as a `"use client"` component. Import `useGlobalContext` for `pax26` theme tokens and `userData`. Import `framer-motion`'s `AnimatePresence` and `motion`.
- [x] 7.2 Implement session ID management on mount: read `pax26_chat_session_id` from `localStorage`; generate a UUID v4 with `crypto.randomUUID()` if absent; store it back; fall back to an in-memory variable if `localStorage` throws.
- [x] 7.3 On mount (after session ID is resolved), fetch conversation history from `GET /api/chatbot/history?sessionId=<sid>` with a 5-second `AbortController` timeout. Populate `messages` state on success. On error or timeout, set `historyError` state and leave `messages` empty.
- [x] 7.4 Render the floating action button (FAB): fixed position, bottom-right corner, background `pax26.primary`, using a chat bubble SVG icon. Apply `motion.button` with `whileHover` and `whileTap` scale animations.
- [x] 7.5 Render a notification badge (red dot) on the FAB when `hasUnread` is true and the chat window is closed.
- [x] 7.6 Wrap the chat window in `AnimatePresence` with a `motion.div` that animates `scale` from 0.95 to 1 and `opacity` from 0 to 1 on open, and reverses on close. Use a spring transition.
- [x] 7.7 Implement responsive sizing: on viewports `< 640px` the chat window uses `position: fixed; inset: 0` (full screen); on `≥ 640px` it is `position: fixed; bottom: 24px; right: 24px; width: 360px; height: 520px`.
- [x] 7.8 Render the chat window header with background `pax26.primary`, the text "Pax26 Assistant", an online status indicator (green dot), and a close button that sets `isOpen = false`.
- [x] 7.9 If `historyError` is set, render an inline error banner inside the chat window above the message thread.
- [x] 7.10 Render the message thread: map `messages` to `MessageBubble` sub-components. User messages align right with `pax26.primary` background; assistant messages align left with `pax26.secondaryBg` background. Each bubble shows the message text and a timestamp in `HH:MM` format.
- [x] 7.11 Render the typing indicator (three animated bouncing dots using `pax26.primary` color) when `isLoading` is true.
- [x] 7.12 Auto-scroll the message thread to the bottom whenever `messages` or `isLoading` changes, using a `ref` on a sentinel `<div>` at the end of the thread.
- [x] 7.13 Render the input area: a `<textarea>` that auto-resizes up to `maxHeight: 120px`, sends on Enter (without Shift), inserts newline on Shift+Enter, and is disabled while `isLoading` is true.
- [x] 7.14 Render the character counter below the textarea when `input.length > 800`, showing `1000 - input.length` (allow negative values).
- [x] 7.15 Render the rate-limit warning banner inside the chat window when `rateLimitInfo.count >= rateLimitInfo.max - 2`.
- [x] 7.16 Implement the `sendMessage` function: validate non-empty and `≤ 1000` chars; optimistically append the user message; set `isLoading = true`; POST to `/api/chatbot/message`; on 429 append a rate-limit error message with the expiry timestamp; on other errors append "Something went wrong. Please try again."; on success append the AI response and update `rateLimitInfo`; set `isLoading = false`; set `hasUnread = true` if `isOpen` is false.
- [x] 7.17 When the chat window is opened (`isOpen` becomes true), set `hasUnread = false`.

---

## Task 8: Integrate ChatbotWidget into the Contact Page

**Requirement:** Requirement 2
**Design ref:** Integration Points section

### Sub-tasks

- [~] 8.1 Open `src/app/contact/page.jsx`. Since it is a Server Component, add a new client wrapper or import `ChatbotWidget` directly. Because `ChatbotWidget` is a client component, create a thin `"use client"` wrapper file `src/components/Chatbot/ChatbotWidgetWrapper.jsx` that simply re-exports `ChatbotWidget` if needed, or import it directly (Next.js 15 supports importing client components into server components).
- [~] 8.2 Add `<ChatbotWidget />` to the JSX returned by the Contact page, placed after the `<Contact />` component so it renders as an overlay on top of the page content.
- [~] 8.3 Confirm the Contact page renders without errors and the FAB appears in the bottom-right corner.

---

## Task 9: Add GEMINI_API_KEY to Environment

**Requirement:** Requirement 9
**Design ref:** Security Considerations section

### Sub-tasks

- [~] 9.1 Open `.env` and add the line `GEMINI_API_KEY=` with the actual key value (do not commit the real key; document the variable name).
- [~] 9.2 Confirm `GEMINI_API_KEY` is listed in `.gitignore` coverage (it is inside `.env` which should already be ignored).
- [~] 9.3 Confirm no client-side file references `GEMINI_API_KEY` or `process.env.GEMINI_API_KEY` (it must only appear in server-side API routes).

---

## Task 10: End-to-End Verification

**Requirements:** All
**Design ref:** All sections

### Sub-tasks

- [~] 10.1 Start the dev server (`npm run dev`) and navigate to `/contact`. Confirm the FAB renders in the bottom-right corner with the brand primary color.
- [~] 10.2 Click the FAB. Confirm the chat window opens with a smooth animation and displays the welcome message.
- [~] 10.3 Type a message and press Enter. Confirm the user message appears immediately, the typing indicator shows, and an AI response arrives and replaces the indicator.
- [~] 10.4 Reload the page. Confirm the conversation history is restored from the API.
- [~] 10.5 Confirm no network requests to `tawk.to` appear in the browser DevTools Network tab on the Contact page.
- [~] 10.6 Confirm the chat window is full-screen on a mobile viewport (< 640px) and a fixed panel on desktop.
- [~] 10.7 Send a message with more than 800 characters and confirm the character counter appears. Confirm the send button is disabled for messages over 1000 characters (counter goes negative but submission is blocked).
- [~] 10.8 Confirm the `POST /api/chatbot/message` route returns HTTP 400 for a missing `sessionId`, HTTP 400 for a missing `message`, HTTP 400 for a message over 1000 characters, and HTTP 429 after the rate limit is exceeded.
