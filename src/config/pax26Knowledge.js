/**
 * Pax26 Knowledge Base
 *
 * This file is the single source of truth for the Pax26 AI assistant.
 * It is prepended as the system context for every Gemini API request.
 */

export const PAX26_KNOWLEDGE = `
## About Pax26

Pax26 is an all-in-one digital platform built for Nigerians that combines utility bill payments with AI-powered business automation tools. Whether you need to top up airtime, pay your electricity bill, or automate your customer support on WhatsApp, Pax26 brings it all together in one seamless experience.

Website: https://pax26.com
Contact page: https://pax26.com/contact
Support email: info@pax26.com

---

## Utility Payment Services

### Airtime
Buy airtime instantly for all major Nigerian networks:
- MTN
- Airtel
- Glo
- 9mobile (Etisalat)

Airtime purchases are processed in real time and delivered directly to the recipient's phone number.

### Data Bundles
Purchase data bundles for all major networks:
- MTN data plans (daily, weekly, monthly, SME data)
- Airtel data plans (daily, weekly, monthly)
- Glo data plans (daily, weekly, monthly)
- 9mobile data plans (daily, weekly, monthly)

Data bundles are activated immediately after payment.

### Electricity Bills
Pay prepaid and postpaid electricity bills for all major Nigerian electricity distribution companies (DISCOs):
- AEDC — Abuja Electricity Distribution Company
- IKEDC — Ikeja Electric (Lagos)
- EKEDC — Eko Electricity Distribution Company (Lagos)
- IBEDC — Ibadan Electricity Distribution Company
- JED — Jos Electricity Distribution
- Kaduna Electric — Kaduna Electricity Distribution Company
- KEDCO — Kano Electricity Distribution Company
- BEDC — Benin Electricity Distribution Company
- EEDC — Enugu Electricity Distribution Company
- PHED — Port Harcourt Electricity Distribution Company
- YEDC — Yola Electricity Distribution Company

For prepaid meters, a token is generated and delivered instantly. For postpaid, the bill is paid directly to the DISCO.

### TV Subscriptions
Renew or subscribe to cable TV packages:
- DSTV — all bouquets (Padi, Yanga, Confam, Compact, Compact Plus, Premium)
- GOtv — all packages (Lite, Jinja, Jolli, Max, Supa, Supa Plus)
- Startimes — all packages (Nova, Basic, Smart, Classic, Super)

Subscriptions are activated within minutes of payment.

### Gift Cards
Buy digital gift cards for popular platforms and retailers. Gift cards are delivered electronically to your email or Pax26 wallet.

---

## AI Automation Features

Pax26 offers a suite of AI-powered automation tools designed to help businesses and individuals automate customer communication and follow-ups.

### WhatsApp Auto-Reply Bot
Connect your WhatsApp Business number to Pax26 and set up an AI-powered auto-reply bot that:
- Responds to customer messages 24/7 without manual intervention
- Handles FAQs, product inquiries, and order status questions automatically
- Escalates complex queries to a human agent when needed
- Supports custom reply rules and keyword triggers

### AI Chatbot Builder
Build a custom AI chatbot for your business using Pax26's no-code chatbot builder:
- Train the chatbot on your own business knowledge base
- Deploy the chatbot on your website or WhatsApp
- Customize the chatbot's tone, persona, and response style
- View conversation analytics and performance metrics

### Smart Follow-Up Tools
Automate follow-up messages to leads and customers:
- Schedule follow-up messages after a customer inquiry
- Set up drip campaigns via WhatsApp
- Track open rates and response rates
- Integrate with your existing CRM workflow

### Customer Support Automation
Reduce support workload with AI-driven automation:
- Auto-categorize and route incoming support messages
- Generate AI-suggested replies for your support team
- Maintain a full conversation history and audit trail
- Handoff to live agents seamlessly when the AI cannot resolve an issue

---

## Pricing

Pax26 offers flexible pricing to suit individuals and businesses of all sizes.

### Free Tier
- Access to all utility payment services (airtime, data, electricity, TV, gift cards)
- Basic account features
- No monthly fee

### Starter Plan (AI Automation)
- Includes WhatsApp auto-reply bot
- Limited number of automated conversations per month
- Basic analytics dashboard
- Suitable for small businesses and freelancers

### Business Plan (AI Automation)
- Everything in Starter
- Higher conversation limits
- AI chatbot builder with custom training
- Smart follow-up tools
- Priority support

### Enterprise Plan (AI Automation)
- Everything in Business
- Unlimited conversations
- Dedicated account manager
- Custom integrations and API access
- SLA-backed uptime guarantee

For the latest pricing details and to compare plans, visit https://pax26.com or contact the sales team at info@pax26.com.

---

## How to Get Started

1. Visit https://pax26.com and click "Sign Up" to create a free account.
2. Verify your email address using the link sent to your inbox.
3. Fund your Pax26 wallet using bank transfer, card payment, or USSD.
4. Navigate to the service you need (airtime, data, electricity, etc.) and complete your transaction.
5. For AI automation features, go to the Automations section in your dashboard and follow the setup wizard.

---

## How to Fund Your Wallet

- Log in to your Pax26 account.
- Go to "Wallet" in the dashboard.
- Click "Fund Wallet" and choose your preferred payment method: bank transfer, debit/credit card, or USSD.
- Enter the amount and complete the payment.
- Your wallet balance is updated instantly.

---

## How to Connect WhatsApp

1. Go to the "Automations" section in your Pax26 dashboard.
2. Click "Connect WhatsApp."
3. Scan the QR code with your WhatsApp Business app or enter your WhatsApp Business API credentials.
4. Follow the on-screen instructions to verify the connection.
5. Once connected, configure your auto-reply rules and activate the bot.

Note: You need a WhatsApp Business account or WhatsApp Business API access to use this feature.

---

## Frequently Asked Questions (FAQs)

**Q: What networks are supported for airtime and data?**
A: Pax26 supports all four major Nigerian networks — MTN, Airtel, Glo, and 9mobile.

**Q: How long does an airtime or data purchase take?**
A: Airtime and data purchases are processed in real time, usually within seconds.

**Q: How long does an electricity token take to arrive?**
A: Prepaid electricity tokens are generated and delivered instantly after payment. If you do not receive your token within 5 minutes, contact support at info@pax26.com.

**Q: Can I pay electricity bills for any state in Nigeria?**
A: Yes. Pax26 supports all major electricity distribution companies across Nigeria, including AEDC, IKEDC, EKEDC, IBEDC, JED, Kaduna Electric, KEDCO, BEDC, EEDC, PHED, and YEDC.

**Q: Is my payment information secure?**
A: Yes. Pax26 uses industry-standard encryption and does not store your card details. All transactions are processed through secure, PCI-compliant payment gateways.

**Q: Can I use Pax26 without creating an account?**
A: Some features may require an account. Creating a free account gives you access to all utility payment services and the ability to track your transaction history.

**Q: How do I reset my password?**
A: Click "Forgot Password" on the login page, enter your registered email address, and follow the instructions in the reset email.

**Q: What is the transaction limit per day?**
A: Transaction limits depend on your account verification level. Verified accounts have higher limits. Contact support for details.

**Q: How do I get a receipt for my transaction?**
A: Transaction receipts are sent to your registered email address automatically after each successful transaction. You can also download receipts from your transaction history in the dashboard.

**Q: Does Pax26 have a mobile app?**
A: Yes. Pax26 is available on both the Google Play Store and the Apple App Store. Search for "Pax26" to download the app.

**Q: How do I contact Pax26 support?**
A: You can reach Pax26 support by emailing info@pax26.com or by visiting the contact page at https://pax26.com/contact.

**Q: What AI model powers the Pax26 chatbot?**
A: The Pax26 assistant is powered by Google Gemini and is specifically trained on Pax26's services and knowledge base to give you accurate, relevant answers.

**Q: Can I cancel my AI automation subscription?**
A: Yes. You can cancel or downgrade your plan at any time from the Billing section of your dashboard. Your access continues until the end of the current billing period.

**Q: Is there a free trial for AI automation features?**
A: Pax26 offers a free tier that includes basic utility payment services. For AI automation features, check the current promotions on https://pax26.com or contact info@pax26.com for trial options.

---

## Support Channels

- **Email**: info@pax26.com
- **Contact page**: https://pax26.com/contact
- **In-app support**: Available from the dashboard help section

Support is available during business hours (Monday–Friday, 9 AM–6 PM WAT). For urgent issues, email info@pax26.com with "URGENT" in the subject line.
`;
