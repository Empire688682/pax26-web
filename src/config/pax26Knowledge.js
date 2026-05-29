/**
 * Pax26 Knowledge Base
 *
 * This file is the single source of truth for the Pax26 AI assistant.
 * It is prepended as the system context for every AI request.
 */

export const PAX26_KNOWLEDGE = `
## About Pax26

Pax26 is an AI automation and business growth platform built for businesses and individuals. It provides WhatsApp automation, AI chatbot tools, and customer engagement systems — plus utility payment services (airtime, data, electricity, TV subscriptions) as additional support features.

Website: https://pax26.com
Contact page: https://pax26.com/contact
Support email: info@pax26.com

---

## AI Automation Features

Pax26's core offering is a suite of AI-powered automation tools that help businesses automate customer communication, boost engagement, and grow faster.

### WhatsApp Auto-Reply Bot
Connect your WhatsApp Business number to Pax26 via Meta Embedded Signup and set up an AI-powered auto-reply bot that:
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

## Utility Payment Services

Pax26 also provides fast, reliable utility payment services for Nigerian users.

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
4. Navigate to the service you need and complete your transaction.
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

Pax26 uses Meta Embedded Signup to connect WhatsApp — there is no QR code scanning.

1. Go to the "Automations" section in your Pax26 dashboard.
2. Click "Connect WhatsApp."
3. A Meta/Facebook login popup will appear — sign in with the Facebook account linked to your WhatsApp Business account.
4. Follow the on-screen steps to grant Pax26 the required permissions.
5. Once the Meta signup flow is complete, your WhatsApp Business number is connected automatically.
6. Configure your auto-reply rules and activate the bot.

Note: You need a WhatsApp Business account registered through Meta to use this feature. Pax26 does not support personal WhatsApp numbers or QR code-based connections.

---

## Frequently Asked Questions (FAQs)

**Q: What is Pax26 primarily used for?**
A: Pax26 is primarily an AI automation platform — it helps businesses automate WhatsApp customer support, build AI chatbots, and manage customer engagement. It also offers utility payment services like airtime, data, electricity, and TV subscriptions.

**Q: How do I connect my WhatsApp to Pax26?**
A: Go to Automations → Connect WhatsApp in your dashboard. A Meta/Facebook login popup will appear — sign in with the Facebook account linked to your WhatsApp Business account and grant the required permissions. That's it. There is no QR code and no scanning involved. Pax26 uses Meta Embedded Signup exclusively.

**Q: What networks are supported for airtime and data?**
A: MTN, Airtel, Glo, and 9mobile.

**Q: How long does an airtime or data purchase take?**
A: Real time — usually within seconds.

**Q: How long does an electricity token take to arrive?**
A: Instantly after payment. If not received within 5 minutes, contact info@pax26.com.

**Q: Can I pay electricity bills for any state in Nigeria?**
A: Yes. Pax26 supports all major DISCOs across Nigeria.

**Q: Is my payment information secure?**
A: Yes. Pax26 uses industry-standard encryption and PCI-compliant payment gateways. Card details are never stored.

**Q: How do I reset my password?**
A: Click "Forgot Password" on the login page, enter your email, and follow the reset link.

**Q: Does Pax26 have a mobile app?**
A: Yes. Search "Pax26" on the Google Play Store or Apple App Store.

**Q: How do I contact Pax26 support?**
A: Email info@pax26.com or visit https://pax26.com/contact.

**Q: Can I cancel my AI automation subscription?**
A: Yes, at any time from the Billing section of your dashboard. Access continues until the end of the billing period.

---

## Support Channels

- **Email**: info@pax26.com
- **Contact page**: https://pax26.com/contact
- **In-app support**: Available from the dashboard help section

Support is available Monday–Friday, 9 AM–6 PM WAT. For urgent issues, email info@pax26.com with "URGENT" in the subject line.
`;
