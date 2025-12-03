import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import fetch from 'node-fetch';
import { firestore } from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

const getConfig = () => {
  let cfg: any = {};
  try {
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

async function sendSms(to: string, message: string): Promise<SendResult> {
  const cfg = getConfig();
  const accountSid = process.env.TWILIO_ACCOUNT_SID || cfg.twilio?.sid || cfg.twilio?.account_sid;
  const authToken = process.env.TWILIO_AUTH_TOKEN || cfg.twilio?.token || cfg.twilio?.auth_token;
  const from = process.env.TWILIO_FROM || cfg.twilio?.from;

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
    body: form as any,
  });

  if (!res.ok) {
    const textResp = await res.text();
    return { success: false, details: textResp };
  }

  return { success: true };
}

async function createNotification(userId: string, title: string, message: string) {
    try {
        const notification = {
            userId,
            title,
            message,
            read: false,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        };
        await db.collection('notifications').add(notification);
    } catch (error) {
        console.error('Error creating notification:', error);
    }
}

export const onBookingCreate = functions.firestore
    .document('bookings/{bookingId}')
    .onCreate(async (snap, context) => {
        const booking = snap.data();
        const { customerId, managerId } = booking;

        try {
            await createNotification(customerId, 'Booking Pending', `Your booking #${context.params.bookingId} is pending approval.`);
            if (managerId) {
                await createNotification(managerId, 'New Booking', `A new booking #${context.params.bookingId} requires your approval.`);
            }
        } catch (error) {
            console.error('Error in onBookingCreate:', error);
        }
    });

export const onPaymentConfirmed = functions.firestore
    .document('payments/{paymentId}')
    .onUpdate(async (change, context) => {
        const payment = change.after.data();
        if (payment.status === 'completed') {
            const { bookingId, amount, customerId } = payment;

            try {
                await db.collection('bookings').doc(bookingId).update({ paymentStatus: 'paid', isPaid: true });
                const invoice = {
                    bookingId,
                    customerId,
                    amount,
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                    status: 'paid',
                };
                await db.collection('invoices').add(invoice);
                await createNotification(customerId, 'Payment Confirmed', `Your payment of ${amount} for booking #${bookingId} has been confirmed.`);
            } catch (error) {
                console.error('Error in onPaymentConfirmed:', error);
            }
        }
    });

export const onBookingUpdate = functions.firestore
    .document('bookings/{bookingId}')
    .onUpdate(async (change, context) => {
        const before = change.before.data();
        const after = change.after.data();
        const bookingId = context.params.bookingId;

        // Real-time status updates
        if (before.status !== after.status) {
            const { customerId, driverId, status } = after;
            try {
                let message = `Your booking #${bookingId} has been updated to: ${status}.`;
                await createNotification(customerId, `Booking ${status}`, message);
                if (driverId) {
                    await createNotification(driverId, `Booking ${status}`, message);
                }
            } catch (error) {
                console.error(`Error in onBookingUpdate for status change: ${error}`);
            }
        }

        // Real-time driver location updates for the booking
        if (before.driverId && after.driverId && before.driverId === after.driverId) {
            try {
                const driverLocationRef = db.collection('drivers').doc(after.driverId).collection('currentLocation').limit(1);
                const driverLocationSnap = await driverLocationRef.get();
                if (!driverLocationSnap.empty) {
                    const driverLocation = driverLocationSnap.docs[0].data();
                    await change.after.ref.update({ driverLocation });
                }
            } catch (error) {
                console.error(`Error in onBookingUpdate for location tracking: ${error}`);
            }
        }
    });

export const calculatePrice = functions.https.onCall(async (data, context) => {
    const { carId, driverId, startDate, endDate, extras, bookingType } = data;

    try {
        let total = 0;
        const start = new Date(startDate);
        const end = new Date(endDate);
        const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24));

        if (bookingType === 'car-only' || bookingType === 'car-with-driver') {
            if (!carId) throw new functions.https.HttpsError('invalid-argument', 'Car ID is required.');
            const carDoc = await db.collection('cars').doc(carId).get();
            if (!carDoc.exists) throw new functions.https.HttpsError('not-found', 'Car not found.');
            total += carDoc.data()!.pricePerDay * days;
        }

        if (bookingType === 'driver-only' || bookingType === 'car-with-driver') {
            if (!driverId) throw new functions.https.HttpsError('invalid-argument', 'Driver ID is required.');
            const driverDoc = await db.collection('drivers').doc(driverId).get();
            if (!driverDoc.exists) throw new functions.https.HttpsError('not-found', 'Driver not found.');
            const driverHourlyRate = driverDoc.data()!.experience * 10; // Example rate
            total += driverHourlyRate * 8 * days; // 8 hours per day
        }

        // Add logic for extras

        const tax = total * 0.1; // 10% tax
        total += tax;

        return { price: total };
    } catch (error) {
        console.error('Error in calculatePrice:', error);
        throw new functions.https.HttpsError('internal', 'Error calculating price');
    }
});

export const onDriverLocationWrite = functions.firestore
    .document('drivers/{driverId}/currentLocation/{locationId}')
    .onWrite(async (change, context) => {
        const { driverId } = context.params;
        const location = change.after.data();

        if (!location) return;

        try {
            const { latitude, longitude, timestamp } = location;
            const geopoint = new firestore.GeoPoint(latitude, longitude);

            await db.collection('drivers').doc(driverId).update({
                currentLocation: {
                    geopoint,
                    timestamp: admin.firestore.FieldValue.serverTimestamp(),
                },
            });
        } catch (error) {
            console.error('Error in onDriverLocationWrite:', error);
        }
    });

export const assignDriver = functions.https.onCall(async (data, context) => {
    const { bookingId, driverId } = data;

    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'You must be logged in to assign a driver.');
    }

    try {
        const bookingRef = db.collection('bookings').doc(bookingId);
        const driverRef = db.collection('drivers').doc(driverId);

        const [booking, driver] = await Promise.all([bookingRef.get(), driverRef.get()]);
        if (!booking.exists || !driver.exists) {
            throw new functions.https.HttpsError('not-found', 'Booking or driver not found.');
        }

        await bookingRef.update({ driverId });

        await db.collection('driverAssignments').add({
            bookingId,
            driverId,
            assignedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        await createNotification(driver.id, 'New Assignment', `You have been assigned to booking #${bookingId}.`);

        return { success: true };
    } catch (error) {
        console.error('Error assigning driver:', error);
        throw new functions.https.HttpsError('internal', 'Error assigning driver');
    }
});

export const cancelBooking = functions.https.onCall(async (data, context) => {
    const { bookingId, reason } = data;

    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'You must be logged in to cancel a booking.');
    }

    try {
        const bookingRef = db.collection('bookings').doc(bookingId);
        const booking = await bookingRef.get();

        if (!booking.exists) {
            throw new functions.https.HttpsError('not-found', 'Booking not found.');
        }

        if (booking.data()?.customerId !== context.auth.uid) {
            throw new functions.https.HttpsError('permission-denied', 'You are not authorized to cancel this booking.');
        }

        await bookingRef.update({
            status: 'cancelled',
            cancellationReason: reason,
            cancellationDate: admin.firestore.FieldValue.serverTimestamp(),
        });

        return { success: true };
    } catch (error) {
        console.error('Error cancelling booking:', error);
        throw new functions.https.HttpsError('internal', 'Error cancelling booking');
    }
});
