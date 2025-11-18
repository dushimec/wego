import { admin, firestore } from '@/firebase/firebase-admin';
import fetch from 'node-fetch';

type SendResult = { success: boolean; details?: any };

export type SendOptions = {
  force?: boolean; // if true, resend even if already processed
  channels?: Array<'email' | 'sms' | 'in_app'>; // explicit channels to deliver
};

/**
 * Send email using SendGrid if configured.
 */
async function sendEmail(sendTo: string, subject: string, text: string): Promise<SendResult> {
  const apiKey = process.env.SENDGRID_API_KEY;
  const from = process.env.SENDGRID_FROM || 'no-reply@example.com';
  if (!apiKey) {
    console.warn('SendGrid not configured, skipping email send');
    return { success: false, details: 'sendgrid-not-configured' };
  }

  const body = {
    personalizations: [{ to: [{ email: sendTo }] }],
    from: { email: from },
    subject,
    content: [{ type: 'text/plain', value: text }],
  };

  const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const textResp = await res.text();
    return { success: false, details: textResp };
  }
  return { success: true };
}

/**
 * Send SMS using Twilio if configured.
 */
async function sendSms(to: string, message: string): Promise<SendResult> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM;

  if (!accountSid || !authToken || !from) {
    console.warn('Twilio not configured, skipping SMS send');
    return { success: false, details: 'twilio-not-configured' };
  }

  const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
  const form = new URLSearchParams();
  form.append('From', from);
  form.append('To', to);
  form.append('Body', message);

  const res = await fetch(url, {
    method: 'POST',
    headers: { Authorization: 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64') },
    body: form,
  });

  if (!res.ok) {
    const textResp = await res.text();
    return { success: false, details: textResp };
  }
  return { success: true };
}

/**
 * High-level sender which inspects a notification document and attempts to deliver it via
 * configured channels. It supports options for forcing resends and channel selection.
 */
export async function sendNotificationById(notificationId: string, opts: SendOptions = {}) {
  const notifRef = firestore.collection('notifications').doc(notificationId);
  const docSnap = await notifRef.get();
  if (!docSnap.exists) throw new Error('Notification not found');

  const notif = docSnap.data() as any;

  // Avoid double-processing unless forced
  if (notif.processed && !opts.force) {
    return { skipped: true, deliveryResults: notif.deliveryResults || null };
  }

  // Attempt to find recipient contact info (prefer explicit fields on the notification)
  let email = notif.email;
  let phone = notif.phone;

  if ((!email || !phone) && notif.userId) {
    const userRef = firestore.collection('users').doc(notif.userId);
    const userSnap = await userRef.get();
    if (userSnap.exists) {
      const user = userSnap.data() as any;
      email = email || user.email;
      phone = phone || user.phoneNumber;
    }
  }

  // Determine channels: prefer explicit opts.channels, then notif.channel, then autodetect
  let channelsToSend: Array<'email' | 'sms' | 'in_app'> = [];
  if (opts.channels && opts.channels.length) channelsToSend = opts.channels;
  else if (notif.channel) channelsToSend = [notif.channel].filter(Boolean) as any;
  else {
    if (email) channelsToSend.push('email');
    if (phone) channelsToSend.push('sms');
    channelsToSend.push('in_app');
  }

  const results: any = {};

  // small retry helper
  async function retry<T>(fn: () => Promise<T>, attempts = 3, delayMs = 500): Promise<T> {
    let lastErr: any;
    for (let i = 0; i < attempts; i++) {
      try {
        return await fn();
      } catch (err) {
        lastErr = err;
        if (i < attempts - 1) await new Promise((r) => setTimeout(r, delayMs * (i + 1)));
      }
    }
    throw lastErr;
  }

  if (channelsToSend.includes('email') && email) {
    try {
      results.email = await retry(() => sendEmail(email, notif.title || 'Notification', notif.message || ''));
    } catch (err) {
      results.email = { success: false, details: err instanceof Error ? err.message : err };
    }
  }

  if (channelsToSend.includes('sms') && phone) {
    try {
      results.sms = await retry(() => sendSms(phone, notif.message || ''));
    } catch (err) {
      results.sms = { success: false, details: err instanceof Error ? err.message : err };
    }
  }

  // in_app is implicit; we already have the document stored. Add a flag to indicate delivered
  if (channelsToSend.includes('in_app')) {
    results.in_app = { success: true };
  }

  // mark notification as processed
  await notifRef.update({
    processed: true,
    processedAt: admin.firestore.FieldValue.serverTimestamp(),
    deliveryResults: results,
  });

  return { skipped: false, deliveryResults: results };
}

export default { sendNotificationById };
