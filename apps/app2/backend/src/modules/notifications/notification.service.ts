import webpush, { PushSubscription } from 'web-push';
import db from '../../config/database.js';
import { config } from '../../config/env.js';

const vapidConfigured = Boolean(config.vapidPublicKey && config.vapidPrivateKey && config.vapidSubject);
if (vapidConfigured) webpush.setVapidDetails(config.vapidSubject, config.vapidPublicKey, config.vapidPrivateKey);
else console.warn('[Push] VAPID keys are not configured; Web Push is disabled.');

export class NotificationService {
  static getPublicKey() { return config.vapidPublicKey || null; }

  static async saveSubscription(userId: string, subscription: PushSubscription) {
    await db.query(
      `INSERT INTO push_subscriptions (user_id, endpoint, subscription) VALUES ($1, $2, $3::jsonb)
       ON CONFLICT (endpoint) DO UPDATE SET user_id = EXCLUDED.user_id,
       subscription = EXCLUDED.subscription, updated_at = CURRENT_TIMESTAMP`,
      [userId, subscription.endpoint, JSON.stringify(subscription)],
    );
    return { success: true };
  }

  static async removeSubscription(userId: string, endpoint: string) {
    await db.query(`DELETE FROM push_subscriptions WHERE user_id = $1 AND endpoint = $2`, [userId, endpoint]);
    return { success: true };
  }

  static async sendToUser(userId: string, payload: { title: string; body: string; url?: string }) {
    if (!vapidConfigured) return { sent: 0, configured: false };
    const result = await db.query<{ endpoint: string; subscription: PushSubscription }>(
      `SELECT endpoint, subscription FROM push_subscriptions WHERE user_id = $1`, [userId],
    );
    let sent = 0;
    for (const row of result.rows) {
      try {
        await webpush.sendNotification(row.subscription, JSON.stringify(payload));
        sent += 1;
      } catch (error: any) {
        if (error.statusCode === 404 || error.statusCode === 410) {
          await db.query(`DELETE FROM push_subscriptions WHERE endpoint = $1`, [row.endpoint]);
        } else {
          console.error('[Push] Failed to send notification:', error);
        }
      }
    }
    return { sent, configured: true };
  }
}
