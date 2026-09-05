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
 *   new_lead     — new WhatsApp contact (first-time) messaged
 *   escalation   — customer asked for a human or expressed frustration
 *
 * Note: agent_reply type is intentionally retired — escalation replaces it
 *       with smarter, action-required-only alerting.
 */

import UserModel from '@/app/ults/models/UserModel';

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

/**
 * sendMobilePush
 *
 * @param {string|ObjectId} userId
 * @param {{
 *   type: 'new_order'|'sales_alert'|'new_lead'|'escalation',
 *   title: string,
 *   body: string,
 *   data?: object
 * }} payload
 */
export async function sendMobilePush(userId, { type, title, body, data = {} }) {
  try {
    const user = await UserModel.findById(userId).select('mobilePushToken mobileNotifPrefs').lean();
    const token = user?.mobilePushToken;

    if (!token) {
      // User hasn't registered a push token — no mobile app installed
      return;
    }

    // Gate notification against user's mobile notification preferences
    const prefs = user?.mobileNotifPrefs || {};
    if (type === 'new_order'   && prefs.newOrder === false)    { console.log('[pushNotif] ⏭️ Suppressed (newOrder disabled)'); return; }
    if (type === 'sales_alert' && prefs.salesAlert === false)   { console.log('[pushNotif] ⏭️ Suppressed (salesAlert disabled)'); return; }
    if (type === 'new_lead'    && prefs.newLead === false)      { console.log('[pushNotif] ⏭️ Suppressed (newLead disabled)'); return; }
    if (type === 'escalation'  && prefs.escalation === false)   { console.log('[pushNotif] ⏭️ Suppressed (escalation disabled)'); return; }

    const message = {
      to:    token,
      sound: 'default',
      title,
      body,
      data:  { type, ...data },
      badge: 1,
      // Android channel (must match channel created on app start)
      // escalation uses the 'orders' channel so it bypasses DnD like a sale
      channelId: type === 'new_order' || type === 'sales_alert' || type === 'escalation' ? 'orders' : 'messages',
      // Priority
      priority: type === 'new_order' || type === 'escalation' ? 'high' : 'normal',
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
