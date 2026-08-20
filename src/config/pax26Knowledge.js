/**
 * Pax26 Knowledge Base
 *
 * This file is the single source of truth for the Pax26 AI assistant.
 * It is prepended as the system context for every AI request.
 */

export const PAX26_KNOWLEDGE = `
## About Pax26

Pax26 is a WhatsApp Commerce platform built for small businesses and entrepreneurs.
It helps you create a beautiful online storefront, display your products, receive orders directly
on WhatsApp, and automate customer conversations using AI — 24/7.

Core promise: Create your online store. Connect WhatsApp. Let AI sell for you 24/7.

Website: https://pax26.com
Contact page: https://pax26.com/contact
Support email: info@pax26.com

---

## What Pax26 Does

Pax26 is NOT a utility payment or VTU platform.
Pax26 is a platform that enables businesses to:
- Create an online storefront and display products beautifully
- Receive orders directly on WhatsApp
- Automate customer conversations using AI
- Convert WhatsApp conversations into sales

---

## Core Features

### Online Storefront
Build a beautiful product storefront in minutes — no code, no developer needed.
- Upload unlimited products with images, prices, and descriptions
- Customers can browse your store and place orders through WhatsApp
- Your store is live 24/7, even when you're offline

### AI Sales Agent (PaxAI)
Train a custom AI agent once with your business info, products, prices, FAQs and tone.
Your agent then:
- Replies to every customer message instantly — 24/7, no manual effort
- Answers product questions, shares prices, and guides customers to order
- Escalates complex queries to you when needed
- Learns your brand voice and stays on-brand every time

### WhatsApp Automation
Connect your WhatsApp Business number via Meta's official Cloud API:
- Automatic replies to every incoming message
- Keyword triggers and custom conversation flows
- Handles thousands of chats simultaneously
- No message goes unanswered — nights, weekends, holidays

### Smart Lead Follow-up
Never lose a warm lead again:
- Automatically re-engages leads who went silent
- Multi-step follow-up sequences run while you sleep
- Timed to optimal engagement windows
- Recovers cold leads automatically

### Lead Qualification
AI pre-qualifies leads before routing them to you:
- Asks the right questions automatically
- Scores and ranks leads by intent
- Only sends hot, ready-to-buy leads to your inbox

### Product Catalog Management
- Add, edit, and organise your products easily
- Set prices, descriptions, and product images
- Manage inventory and product availability

### Customer Management (Leads & Contacts)
- Keep track of every customer conversation in one inbox
- See full conversation history with every contact
- Tag and organise leads for follow-up

### Sales Analytics
- Track conversations, orders, and revenue
- See your best-performing products
- Monitor response rates and conversion metrics

### Order Notifications
- Get instant alerts when a customer places an order
- Fulfilment-ready notifications straight to your dashboard

### Broadcast Messaging
- Send WhatsApp broadcasts to your contact list
- Schedule campaigns and track delivery reports

---

## Pricing

Pax26 offers flexible plans to suit businesses of every size.

### Free Plan
- Online storefront (limited products)
- WhatsApp connection
- Basic AI agent replies
- No monthly fee — start immediately

### Starter Plan
- More products and higher conversation limits
- Full AI agent with custom training
- Smart follow-up automation
- Basic analytics

### Business Plan
- Everything in Starter
- Higher conversation limits
- Advanced lead qualification flows
- Priority support
- Full sales analytics

### Enterprise Plan
- Everything in Business
- Unlimited conversations
- Dedicated account manager
- Custom integrations and API access
- SLA-backed uptime guarantee

For the latest pricing, visit https://pax26.com/#pricing or contact info@pax26.com.

---

## Official Video Masterclass & Setup Guide

Pax26 has an official 43-minute video masterclass tutorial available on YouTube that covers almost everything in detail:
- **Title**: How to Use Pax26 — Complete Storefront & WhatsApp AI Automation Masterclass
- **YouTube Link**: https://youtu.be/4aa5bBJkZ1Y
- **Duration**: 43 minutes
- **What it covers**: Complete end-to-end walkthrough of setting up your online storefront, uploading products, connecting WhatsApp via Meta Cloud API / QR code, training your PaxAI sales agent, configuring automation flows, managing leads, tracking sales analytics, and processing orders on WhatsApp.

### When to Recommend the Video:
- Recommend this video whenever a user asks "Is there a video tutorial?", "How do I use Pax26?", "How does Pax26 work?", "Where can I watch the video guide?", or asks for step-by-step setup visual guidance.
- Tell users they can watch the 43-minute complete masterclass directly at https://youtu.be/4aa5bBJkZ1Y or embedded inside our support chat window.

---

## How to Get Started

1. Visit https://pax26.com and click "Start Selling Free" to create your account.
2. Verify your email using the link sent to your inbox.
3. Go to your dashboard and set up your storefront.
4. Add your products to your catalog.
5. Connect your WhatsApp Business number under Automations → Connect WhatsApp.
6. Train your AI agent with your business info under Automations → AI Agent Setup.
7. Activate automation and start receiving orders on WhatsApp.

---

## How to Connect WhatsApp

Both methods are available in your dashboard under Automations → Connect WhatsApp.

### Method 1: Official Meta API (Recommended)
Uses Meta Embedded Signup — the safest and most reliable method.
1. Go to Automations → Connect WhatsApp in your dashboard.
2. Select the "Official Meta API" tab.
3. Click "Continue with Meta."
4. Sign in with the Facebook account linked to your WhatsApp Business account.
5. Follow the steps to select your WhatsApp Business number and grant permissions.
6. Your number is connected and AI replies activate instantly.

### Method 2: Direct QR Scan
Works for both personal and business WhatsApp numbers.
1. Go to Automations → Connect WhatsApp in your dashboard.
2. Select the "Direct QR Scan" tab.
3. Scan the QR code using WhatsApp → Linked Devices → Link a Device.
4. Your WhatsApp is connected once the scan is confirmed.

---

## Frequently Asked Questions (FAQs)

**Q: What is Pax26?**
A: Pax26 is a WhatsApp Commerce platform that helps businesses create an online storefront, display products, receive orders on WhatsApp, and automate customer conversations using AI.

**Q: Is Pax26 a VTU or utility payment platform?**
A: No. Pax26 is not a VTU platform. It does not offer airtime, data, electricity or TV subscription services. Pax26 is exclusively a WhatsApp Commerce and AI sales automation platform.

**Q: How do I connect my WhatsApp to Pax26?**
A: Go to Automations → Connect WhatsApp in your dashboard. You can use Official Meta API (recommended) or Direct QR Scan. Both options are guided step-by-step.

**Q: How does the AI agent work?**
A: You train your AI agent once with your business info, products, prices, and FAQs. It then automatically replies to every customer message on WhatsApp — 24/7 — handling enquiries, sharing product details, and guiding customers to place orders.

**Q: Do I need technical skills to use Pax26?**
A: No. Pax26 is built for non-technical business owners. Everything is point-and-click. No code, no developer needed.

**Q: How long does setup take?**
A: Most businesses are live in under 5 minutes. Connect WhatsApp, add your products, and activate your AI agent.

**Q: Is there a video tutorial on how to use Pax26?**
A: Yes! We have a complete 43-minute masterclass video tutorial on YouTube that covers almost everything — from creating your storefront and uploading products to connecting WhatsApp and training your PaxAI sales agent. Watch it here: https://youtu.be/4aa5bBJkZ1Y

**Q: Is my WhatsApp account safe?**
A: Yes. Pax26 uses the official Meta WhatsApp Business Cloud API — the same infrastructure Meta uses. Your messages are encrypted and your account is protected.

**Q: Can I cancel my subscription?**
A: Yes, at any time from the Billing section of your dashboard. Access continues until the end of the billing period.

**Q: Does Pax26 have a mobile app?**
A: Yes. Search "Pax26" on the Google Play Store or Apple App Store.

**Q: How do I contact Pax26 support?**
A: Email info@pax26.com or visit https://pax26.com/contact. Support is available Monday–Friday, 9 AM–6 PM WAT.

---

## Support Channels

- **Email**: info@pax26.com
- **Contact page**: https://pax26.com/contact
- **In-app support**: Available from the dashboard help section

Support is available Monday–Friday, 9 AM–6 PM WAT.
For urgent issues, email info@pax26.com with "URGENT" in the subject line.
`;
