import * as admin from 'firebase-admin';
import type { Booking } from './types';

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

export const bookingService = {
  async createBooking(bookingData: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>): Promise<Booking> {
    // Validation based on booking type
    if (bookingData.bookingType === 'car-only') {
      if (!bookingData.carId || bookingData.driverId) {
        throw new Error('For \'car-only\' bookings, a carId is required and a driverId should not be provided.');
      }
    } else if (bookingData.bookingType === 'driver-only') {
      if (!bookingData.driverId || bookingData.carId) {
        throw new Error('For \'driver-only\' bookings, a driverId is required and a carId should not be provided.');
      }
    } else if (bookingData.bookingType === 'car-with-driver') {
      if (!bookingData.carId || !bookingData.driverId) {
        throw new Error('For \'car-with-driver\' bookings, both a carId and a driverId are required.');
      }
    }

    const docRef = db.collection('bookings').doc();
    const booking: Booking = {
      ...bookingData,
      id: docRef.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await docRef.set(booking);
    return booking;
  },

  async getBookingById(bookingId: string): Promise<Booking | null> {
    const doc = await db.collection('bookings').doc(bookingId).get();
    return doc.exists ? (doc.data() as Booking) : null;
  },

  async getBookingsByCustomerId(customerId: string): Promise<Booking[]> {
    const querySnapshot = await db
      .collection('bookings')
      .where('customerId', '==', customerId)
      .orderBy('createdAt', 'desc')
      .get();

    return querySnapshot.docs.map((doc) => doc.data() as Booking);
  },

  async updateBookingStatus(bookingId: string, status: Booking['status']): Promise<void> {
    await db.collection('bookings').doc(bookingId).update({
      status,
      updatedAt: new Date().toISOString(),
    });
  },

  async cancelBooking(bookingId: string, reason: string): Promise<void> {
    await db.collection('bookings').doc(bookingId).update({
      status: 'cancelled',
      cancellationReason: reason,
      cancellationDate: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  },

  trackDriverLocation(driverId: string, callback: (location: any) => void): () => void {
    const driverLocationRef = db.collection('drivers').doc(driverId).collection('currentLocation');
    const unsubscribe = driverLocationRef.onSnapshot((snapshot) => {
      if (!snapshot.empty) {
        const locationData = snapshot.docs[0].data();
        callback(locationData);
      }
    });
    return unsubscribe;
  },
};
