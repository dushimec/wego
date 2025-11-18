import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import fetch from 'node-fetch';

if (!admin.apps.length) {
  admin.initializeApp();
}

const firestore = admin.firestore();

// Read secrets in this order: functions.config() (deployed), then process.env (local/env)
const getConfig = () => {
  let cfg: any = {};
  try {
    // functions.config may throw if not available in this environment
    cfg = (functions as any).config ? (functions as any).config() : {};
  } catch (e) {
    cfg = {};
  }
  return cfg;
};

type SendResult = { success: boolean; details?: any };

async function sendEmail(sendTo: string, subject: string, text: string): Promise<SendResult> {
  const cfg = getConfig();
  const apiKey = process.env.SENDGRID_API_KEY || cfg.sendgrid?.key || cfg.sendgrid?.api_key;
  const from = process.env.SENDGRID_FROM || cfg.sendgrid?.from || 'no-reply@example.com';
  if (!apiKey) {
    console.warn('SendGrid not configured (process.env or functions.config), skipping email send');
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

async function sendSms(to: string, message: string): Promise<SendResult> {
  const cfg = getConfig();
  const accountSid = process.env.TWILIO_ACCOUNT_SID || cfg.twilio?.sid || cfg.twilio?.account_sid;
  const authToken = process.env.TWILIO_AUTH_TOKEN || cfg.twilio?.token || cfg.twilio?.auth_token;
  const from = process.env.TWILIO_FROM || cfg.twilio?.from;

  if (!accountSid || !authToken || !from) {
    console.warn('Twilio not configured (process.env or functions.config), skipping SMS send');
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
    body: form as any,
  });

  if (!res.ok) {
    const textResp = await res.text();
    return { success: false, details: textResp };
  }

  return { success: true };
}

/**
 * Firestore trigger: onCreate notification document -> attempt delivery
 */
export const onNotificationCreate = functions.region('us-central1')
  .firestore.document('notifications/{id}')
  .onCreate(async (snap: functions.firestore.DocumentSnapshot, ctx: functions.EventContext) => {
    const id = ctx.params.id as string;
    const notif = snap.data() as any;

    try {
      let email = notif.email;
      let phone = notif.phone;

      if ((!email || !phone) && notif.userId) {
        const userSnap = await firestore.collection('users').doc(notif.userId).get();
        if (userSnap.exists) {
          const user = userSnap.data() as any;
          email = email || user.email;
          phone = phone || user.phoneNumber;
        }
      }

      const results: any = { email: null, sms: null };

      if (email) {
        try {
          results.email = await sendEmail(email, notif.title || 'Notification', notif.message || '');
        } catch (err) {
          results.email = { success: false, details: err instanceof Error ? err.message : err };
        }
      }

      if (phone) {
        try {
          results.sms = await sendSms(phone, notif.message || '');
        } catch (err) {
          results.sms = { success: false, details: err instanceof Error ? err.message : err };
        }
      }

      await snap.ref.update({
        processed: true,
        processedAt: admin.firestore.FieldValue.serverTimestamp(),
        deliveryResults: results,
      });
    } catch (err) {
      console.error('Notification delivery failed for', id, err);
      await snap.ref.update({
        processed: false,
        processedAt: admin.firestore.FieldValue.serverTimestamp(),
        deliveryResults: { error: err instanceof Error ? err.message : err },
      });
    }
});
