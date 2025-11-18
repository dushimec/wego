#!/usr/bin/env node
/**
 * Simple helper to create a test notification document in Firestore.
 * Usage:
 *   node createTestNotification.js --userId=<uid> --title="Test" --message="Hello"
 * If userId is omitted, it will write a generic notification without user association.
 */
const admin = require('firebase-admin');
const argv = require('minimist')(process.argv.slice(2));

if (!admin.apps.length) {
  // Initialize using Application Default Credentials or service account if set
  admin.initializeApp();
}

const firestore = admin.firestore();

async function main() {
  const userId = argv.userId || null;
  const title = argv.title || 'Test Notification';
  const message = argv.message || 'This is a test notification created by createTestNotification.js';

  const notifRef = firestore.collection('notifications').doc();
  const payload = {
    userId,
    title,
    message,
    type: 'system_alert',
    read: false,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  await notifRef.set(payload);
  console.log('Created notification', notifRef.id);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
