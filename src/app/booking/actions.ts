'use server';

import { z } from 'zod';
import { admin, firestore } from '@/firebase/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

const BookingSchema = z.object({
  carId: z.string(),
  customerId: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  totalPrice: z.number(),
  pickupLocation: z.string(),
  dropoffLocation: z.string(),
  withDriver: z.boolean(),
  extras: z.array(z.string()),
});

function getDatesInRange(startDate: Date, endDate: Date): string[] {
  const dates: string[] = [];
  let currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    dates.push(currentDate.toISOString().split('T')[0]);
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return dates;
}

export async function updateBookingStatus(
  bookingId: string,
  status: 'approved' | 'rejected' | 'cancelled' | 'completed',
  userId: string,
  userRole: string
) {
  try {
    const bookingRef = firestore.collection('bookings').doc(bookingId);
    const bookingDoc = await bookingRef.get();

    if (!bookingDoc.exists) {
      throw new Error('Booking not found');
    }

    const bookingData = bookingDoc.data();

    // Validate permissions
    if (
      (status === 'cancelled' && bookingData?.customerId !== userId) ||
      ((status === 'approved' || status === 'rejected') && userRole !== 'admin' && userRole !== 'manager') ||
      (status === 'completed' && userRole !== 'driver')
    ) {
      throw new Error('Unauthorized to update booking status');
    }

    // Start a transaction for the update
    await firestore.runTransaction(async (transaction) => {
      // Update booking status
      transaction.update(bookingRef, {
        status,
        updatedAt: admin.firestore.Timestamp.now()
      });

      // If booking is cancelled or completed, free up the car
      if (status === 'cancelled' || status === 'completed') {
        const carRef = firestore.collection('cars').doc(bookingData?.carId);
        transaction.update(carRef, {
          available: true,
          unavailabilityReason: null,
          availabilityDates: FieldValue.arrayRemove({
            start: bookingData?.startDate,
            end: bookingData?.endDate,
            bookingId
          })
        });
      }

      // Create notification for the customer
      const notificationRef = firestore.collection('notifications').doc();
      transaction.set(notificationRef, {
        userId: bookingData?.customerId,
        type: 'booking_status_update',
        bookingId,
        message: `Your booking has been ${status}`,
        createdAt: admin.firestore.Timestamp.now(),
        read: false
      });
    });

    return { success: true };
  } catch (error) {
    console.error('Error updating booking status:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update booking status' 
    };
  }
}

export async function submitBooking(bookingData: any) {
  try {
    const parsedData = BookingSchema.parse(bookingData);

    // Get car details and check availability
    const carRef = firestore.collection('cars').doc(parsedData.carId);
    const carDoc = await carRef.get();

    if (!carDoc.exists) {
      throw new Error('Car not found');
    }

    const car = carDoc.data();
    if (!car?.available) {
      throw new Error('Car is not available for the selected dates');
    }

    // If driver is requested, check driver availability
    if (parsedData.withDriver) {
      const driversRef = firestore.collection('drivers')
        .where('available', '==', true)
        .where('active', '==', true);
      
      const availableDrivers = await driversRef.get();
      if (availableDrivers.empty) {
        throw new Error('No drivers available for the selected dates');
      }
    }

    // Create the booking
    const bookingRef = firestore.collection('bookings').doc();
    const booking = {
      ...parsedData,
      status: 'pending',
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now(),
      id: bookingRef.id
    };

    // Start a transaction to ensure data consistency
    await firestore.runTransaction(async (transaction) => {
      // Update car availability
      transaction.update(carRef, {
        available: false,
        unavailabilityReason: `Booked (${bookingRef.id})`,
        availabilityDates: FieldValue.arrayUnion({
          start: parsedData.startDate,
          end: parsedData.endDate,
          bookingId: bookingRef.id
        })
      });

      // Create the booking
      transaction.set(bookingRef, booking);

      // Create notification for car owner
      const notificationRef = firestore.collection('notifications').doc();
      transaction.set(notificationRef, {
        userId: car.ownerId,
        type: 'new_booking',
        bookingId: bookingRef.id,
        message: `New booking request for your ${car.brand} ${car.model}`,
        createdAt: admin.firestore.Timestamp.now(),
        read: false
      });
    });

    return { success: true, bookingId: bookingRef.id };
  } catch (error) {
    console.error('Error creating booking:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to create booking' 
    };
  }
}
