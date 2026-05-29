# Requirements Document

## Introduction

This feature replaces the existing Tawk.io third-party live chat widget on the Pax26 platform with a fully custom, AI-powered chatbot. The Pax26 AI Chatbot will be embedded on the Contact page as a floating widget, powered by Google Gemini Flash (free tier), backed by a MongoDB conversation store, and governed by a per-session rate limiter. All Tawk.io code, scripts, and environment variables will be removed from the codebase. The chatbot will behave as an official Pax26 assistant, answering questions about the platform using a centralized knowledge base file.

## Glossary

- **Chatbot**: The Pax26 AI-powered conversational widget embedded on the Contact page.
- **Conversation**: A sequence of messages between a User and the AI_Assistant within a single session.
- **Message**: A single text entry sent by either the User or the AI_Assistant.
- **Session**: A browser session identified by a unique session ID stored in the browser (localStorage or cookie).
- **Rate_Limiter**: The server-side component that tracks and enforces message quotas per session/IP.
- **Knowledge_Base**: The centralized file (`/src/config/pax26Knowledge.js`) containing Pax26 platform information used to ground AI responses.
- **AI_Assistant**: The Gemini Flash-powered backend service that generates responses on behalf of Pax26.
- **Guest_User**: A visitor who is not authenticated on the Pax26 platform.
- **Authenticated_User**: A visitor who is logged in to the Pax26 platform.
- **Chat_API**: The Next.js API route at `/api/chatbot/` that handles all chatbot backend operations.
- **Tawk_API**: The third-party Tawk.io JavaScript object previously injected into the platform.

---

## Requirements

### Requirement 1: Remove Tawk.io Integration

**User Story:** As a platform maintainer, I want all Tawk.io code removed from the codebase, so that the platform no longer depends on a third-party live chat service and makes no outbound requests to Tawk.io servers.

#### Acceptance Criteria

1. THE Platform application source files (under `src/`, `pages/`, `components/`, `app/`, `lib/`, `utils/`, `hooks/`, `config/`, `scripts/`, and root-level config files) SHALL contain no references to `Tawk_API`, `tawk.to`, or any Tawk.io script URLs.
2. THE Platform SHALL contain no Tawk.io-related environment variables in `.env`, `.env.local`, `.env.production`, or `.env.development`.
3. THE ClientWrapper SHALL not render any `<Script>` tag with a `src` pointing to `embed.tawk.to` or any Tawk.io domain.
4. IF the Contact page is loaded in a browser, THEN the browser SHALL make no network requests to any `tawk.to` domain.
5. THE ClientWrapper SHALL not contain any `showTawk` logic, `Tawk_API.show()`, or `Tawk_API.hide()` calls.

---

### Requirement 2: Pax26 AI Chatbot UI — Floating Widget

**User Story:** As a visitor on the Contact page, I want to see a floating chat button, so that I can open a chat window and interact with the Pax26 AI assistant without leaving the page.

#### Acceptance Criteria

1. WHEN a User visits the `/contact` page, THE Chatbot SHALL render a floating action button (FAB) anchored to the bottom-right corner of the viewport.
2. WHEN the User clicks the floating button, THE Chatbot SHALL expand into a chat window displaying the conversation history and an input field.
3. WHEN the chat window is open, THE Chatbot SHALL display a close/minimize button that collapses the window back to the FAB state.
4. WHEN a new conversation is started (no prior session history), THE Chatbot SHALL display a welcome message from the AI_Assistant as the first message in the thread.
5. THE Chatbot UI SHALL be responsive: on viewports narrower than 640px the chat window SHALL occupy the full viewport width and height; on viewports 640px and wider the chat window SHALL be a fixed-size panel (minimum 320px wide, minimum 480px tall) anchored to the bottom-right corner.
6. THE Chatbot SHALL support both dark and light themes, reading the active theme from the existing `next-themes` ThemeProvider.
7. THE Chatbot SHALL apply the primary brand color from `useGlobalContext().theme.primaryColor` as the FAB background color and the chat window header background color.
8. IF the Chat_API is unreachable when the chat window is opened, THEN THE Chatbot SHALL display an inline error banner inside the chat window and SHALL NOT prevent the User from typing a message.
9. THE Chatbot input field SHALL enforce a maximum of 1000 characters and SHALL display a character counter when the User's input length exceeds 800 characters.

---

### Requirement 3: Message Sending and AI Response

**User Story:** As a visitor, I want to type a message and receive an AI-generated response from the Pax26 assistant, so that I can get help with platform questions in real time.

#### Acceptance Criteria

1. WHEN the User submits a message, THE Chatbot SHALL display the User's message immediately in the conversation thread before the Chat_API call is initiated.
2. WHEN the User submits a message, THE Chatbot SHALL display a typing animation in the conversation thread while the AI_Assistant is generating a response.
3. WHEN the AI_Assistant returns a response, THE Chatbot SHALL replace the typing animation with the response text in the conversation thread.
4. IF the AI_Assistant has not yet returned a response, THEN THE Chatbot SHALL not display a completed response message in the thread.
5. WHEN a new message is added to the conversation thread, THE Chatbot SHALL auto-scroll the thread to make the new message fully visible.
6. WHEN the User presses Enter (without Shift) in the input field, THE Chatbot SHALL submit the message.
7. WHEN the User presses Shift+Enter in the input field, THE Chatbot SHALL insert a newline in the input field without submitting.
8. IF the AI_Assistant call fails due to a network or API error, THEN THE Chatbot SHALL display an error message in the conversation thread that includes the text "Something went wrong" and a suggestion to try again, without retrying automatically and without crashing.
9. WHILE a response is being generated, THE Chatbot SHALL disable both the send button and the Enter key submission to prevent duplicate submissions.
10. IF the User attempts to submit an empty message or a message containing only whitespace, THEN THE Chatbot SHALL not submit the message and SHALL not call the Chat_API.

---

### Requirement 4: Conversation Persistence

**User Story:** As a visitor, I want my conversation to be preserved if I reload the page, so that I do not lose context when navigating away and returning.

#### Acceptance Criteria

1. WHEN a User sends a message, THE Chat_API SHALL persist the Message to the MongoDB `chatbot_conversations` collection with the session ID, role, text content, and timestamp.
2. WHEN the Contact page loads and a session ID exists in localStorage, THE Chatbot SHALL retrieve and display the 100 most recent Conversation messages from the Chat_API. IF the Chat_API returns an error or does not respond within 5 seconds, THEN THE Chatbot SHALL display an empty conversation thread and allow the User to continue chatting.
3. IF no session ID exists in localStorage, THEN THE Chatbot SHALL generate a new UUID v4 session ID and store it in localStorage under the key `pax26_chat_session_id`. IF localStorage is unavailable (e.g., private browsing restrictions), THEN THE Chatbot SHALL generate an in-memory session ID for the duration of the page visit.
4. THE Chat_API SHALL return all stored messages for a session ordered by ascending `createdAt` timestamp.

---

### Requirement 5: Pax26 Knowledge Base

**User Story:** As a visitor, I want the AI assistant to answer questions specifically about Pax26, so that I receive accurate and relevant information about the platform.

#### Acceptance Criteria

1. THE Platform SHALL contain a centralized knowledge base file at `src/config/pax26Knowledge.js` that exports a string constant containing Pax26's services, features, pricing, FAQs, and support information.
2. WHEN the AI_Assistant generates a response, THE Chat_API SHALL prepend the Knowledge_Base string as the first `system` role message in the Gemini API request payload. IF the `pax26Knowledge.js` module fails to import or exports an empty string, THEN THE Chat_API SHALL return an HTTP 500 error and SHALL NOT forward the request to the Gemini API.
3. THE system prompt injected into every Gemini API request SHALL include the instruction: "You are the official Pax26 assistant. Do not identify yourself as a generic AI model."
4. WHEN a User asks a question that is not related to Pax26 (e.g., general trivia, unrelated technical topics), THE AI_Assistant SHALL respond with a message that acknowledges the question is outside its scope and redirects the User to ask about Pax26 services, features, or support.

---

### Requirement 6: Rate Limiting

**User Story:** As a platform operator, I want to limit the number of messages a guest user can send, so that the platform is protected from spam and excessive API usage.

#### Acceptance Criteria

1. THE Rate_Limiter SHALL allow a maximum of 20 messages per session within a fixed 24-hour window starting at the timestamp of the session's first message for Guest_Users.
2. WHEN a Guest_User's message count reaches 18 within the 24-hour window, THE Chatbot SHALL display a warning banner inside the chat window indicating that 2 messages remain before the limit is reached.
3. WHEN a Guest_User attempts to send a message after reaching the 20-message limit, THE Chat_API SHALL reject the request with HTTP 429 before calling the Gemini API, and THE Chatbot SHALL display a message stating the limit has been reached and showing the exact UTC timestamp when the 24-hour window expires.
4. THE Rate_Limiter SHALL persist the message count and window start timestamp in the `ChatConversation` MongoDB document for the session, and the count SHALL survive server restarts.
5. WHERE an Authenticated_User is detected via the existing session/auth context, THE Rate_Limiter SHALL apply a limit of 100 messages per 24-hour window using the same fixed-window logic.
6. WHEN the 24-hour window for a session expires (current time ≥ windowStart + 24 hours), THE Rate_Limiter SHALL reset the message count to 0 and set a new windowStart to the current timestamp on the next incoming message.

---

### Requirement 7: Backend API Routes

**User Story:** As a developer, I want clean, modular backend API routes for the chatbot, so that the system is maintainable and scalable.

#### Acceptance Criteria

1. WHEN a `POST /api/chatbot/message` request is received with a valid session ID and message body, THE Chat_API SHALL call the Gemini API and return the AI_Assistant's response with HTTP 200.
2. WHEN a `GET /api/chatbot/history` request is received with a valid session ID, THE Chat_API SHALL return the stored Conversation messages for that session, capped at the 50 most recent messages, ordered by ascending timestamp, with HTTP 200.
3. WHEN a `DELETE /api/chatbot/history` request is received with a valid session ID, THE Chat_API SHALL delete all messages for that session from the `chatbot_conversations` collection and return HTTP 200.
4. WHEN a `GET /api/chatbot/rate-limit` request is received with a valid session ID, THE Chat_API SHALL return the current message count, the maximum allowed messages, and the window expiry timestamp for that session with HTTP 200.
5. WHEN a request to `POST /api/chatbot/message`, `GET /api/chatbot/history`, `DELETE /api/chatbot/history`, or `GET /api/chatbot/rate-limit` is received without a session ID, THE Chat_API SHALL return HTTP 400 with a JSON body containing a `message` field describing the missing parameter.
6. WHEN a `POST /api/chatbot/message` request is received without a message body, THE Chat_API SHALL return HTTP 400 with a JSON body containing a `message` field describing the missing parameter.
7. THE Chat_API SHALL reject any message text that exceeds 1000 characters with HTTP 400, and SHALL strip all HTML tags and JavaScript event handler attributes (e.g., `onclick`, `onerror`) and `javascript:` URI schemes from message text before storing or forwarding to the Gemini API.
8. WHEN a `GET /api/chatbot/history` request is received with a session ID that has no stored conversation, THE Chat_API SHALL return HTTP 200 with an empty `messages` array.

---

### Requirement 8: Database Schema

**User Story:** As a developer, I want conversations stored in a structured MongoDB schema, so that data is consistent and queryable for future admin features.

#### Acceptance Criteria

1. THE Platform SHALL define a `ChatConversation` Mongoose model with fields: `sessionId` (String, required, indexed), `ipAddress` (String), `userId` (ObjectId, optional ref to User), `messages` (Array of `{ role: { type: String, enum: ['user', 'assistant'], required: true }, text: { type: String, required: true, maxlength: 1000 }, createdAt: { type: Date, default: Date.now } }`), `messageCount` (Number, default: 0), `windowStart` (Date), and `createdAt`/`updatedAt` timestamps (via Mongoose `timestamps: true`).
2. THE Platform SHALL create a unique index on the `ChatConversation` model's `sessionId` field.
3. WHEN a session's first message is received, THE Chat_API SHALL upsert a `ChatConversation` document: if no document exists for the session ID, create one with `messageCount: 1` and `windowStart` set to the current timestamp; if a document already exists, append the message to `messages` and increment `messageCount` by 1.
4. IF a MongoDB write operation fails when persisting a message, THEN THE Chat_API SHALL return HTTP 500 with a JSON body containing `{ "message": "Failed to save message. Please try again." }` and SHALL NOT forward the request to the Gemini API.

---

### Requirement 9: Security

**User Story:** As a platform operator, I want the chatbot to be secure against common web attacks, so that user data and API keys are protected.

#### Acceptance Criteria

1. THE Chat_API SHALL read the Gemini API key exclusively from the `GEMINI_API_KEY` server-side environment variable and SHALL NOT expose it to the client.
2. THE Chat_API SHALL sanitize all user-submitted message text to remove HTML tags and script injection patterns before processing or storing.
3. THE Chat_API SHALL enforce a maximum message length of 1000 characters per message and return HTTP 400 if exceeded.
4. THE Chat_API SHALL apply IP-based rate limiting in addition to session-based rate limiting to prevent abuse from clients that clear their session storage.
5. IF a request to any Chat_API route originates from an IP address that has exceeded 200 requests in one hour, THEN THE Chat_API SHALL return HTTP 429 and block further requests from that IP for the remainder of the hour.

---

### Requirement 10: UI/UX Polish

**User Story:** As a visitor, I want the chatbot to feel polished and professional, so that it reflects the quality of the Pax26 brand.

#### Acceptance Criteria

1. THE Chatbot SHALL display a smooth open/close animation when the chat window is toggled.
2. THE Chatbot SHALL display a typing indicator (animated dots) while the AI_Assistant is generating a response.
3. THE Chatbot SHALL display timestamps on each message in HH:MM format.
4. THE Chatbot SHALL display a notification badge on the FAB when the chat window is closed and a new AI response has arrived.
5. THE Chatbot input field SHALL auto-resize vertically as the User types multi-line messages, up to a maximum height of 120px.
6. THE Chatbot SHALL display a character counter when the User's input exceeds 800 characters, showing remaining characters until the 1000-character limit. WHILE the User continues typing beyond 1000 characters, THE Chatbot SHALL allow further input and display the counter with a negative remaining value.
