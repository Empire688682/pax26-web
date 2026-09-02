/**
 * pushNotificationService.js
 *
 * Sends Expo push notifications to a seller's mobile device.
 * Called by:
 *   - salesNotificationService  → new order / sales alert
 *   - handleIncomingWhatsapp    → new lead / agent reply
 *
 * Types:
 *   new_order    — customer placed an order
 *   sales_alert  — payment proof received
 *   new_lead     — new WhatsApp contact messaged
 *   agent_reply  — AI agent responded to a customer
 */

import UserModel from '@/app/ults/models/UserModel';

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

/**
 * sendMobilePush
 *
 * @param {string|ObjectId} userId
 * @param {{
 *   type: 'new_order'|'sales_alert'|'new_lead'|'agent_reply',
 *   title: string,
 *   body: string,
 *   data?: object
 * }} payload
 */
export async function sendMobilePush(userId, { type, title, body, data = {} }) {
  try {
    const user = await UserModel.findById(userId).select('mobilePushToken').lean();
    const token = user?.mobilePushToken;

    if (!token) {
      // User hasn't registered a push token — no mobile app installed
      return;
    }

    const message = {
      to:    token,
      sound: 'default',
      title,
      body,
      data:  { type, ...data },
      badge: 1,
      // Android channel (must match channel created on app start)
      channelId: type === 'new_order' || type === 'sales_alert' ? 'orders' : 'messages',
      // Priority
      priority: type === 'new_order' ? 'high' : 'normal',
    };

    const res = await fetch(EXPO_PUSH_URL, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body:    JSON.stringify(message),
    });

    const result = await res.json();

    if (result?.data?.status === 'error') {
      console.warn('[pushNotif] Expo push error:', result.data.message);
    } else {
      console.log(`[pushNotif] ✅ Sent ${type} to ${token.slice(0, 20)}…`);
    }
  } catch (err) {
    // Never block the main flow for a push notification failure
    console.warn('[pushNotif] Non-fatal error:', err?.message ?? err);
  }
}
