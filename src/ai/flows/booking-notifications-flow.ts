import { onFlow } from '@genkit-ai/firebase/functions';
import { firestore } from 'firebase-admin/firestore';
import * as z from 'zod';

const BookingDataSchema = z.object({
  carId: z.string(),
  customerId: z.string(),
  ownerId: z.string(),
  status: z.string(),
});

export const onBookingCreated = onFlow(
  {
    name: 'onBookingCreated',
    trigger: {
      firestore: {
        document: 'bookings/{bookingId}',
        event: 'onCreate',
      },
    },
    inputSchema: z.any(),
    outputSchema: z.void(),
  },
  async (event) => {
    const bookingData = BookingDataSchema.parse(event.data?.after.data());

    if (!bookingData) {
      console.log('No data associated with the event');
      return;
    }

    const { ownerId, carId } = bookingData;

    const notification = {
      userId: ownerId,
      title: 'New Booking Request',
      message: `You have received a new booking request for car ID: ${carId}.`,
      type: 'booking_update',
      read: false,
      createdAt: firestore.FieldValue.serverTimestamp(),
    };

    await firestore().collection('notifications').add(notification);

    console.log(`Notification created for owner: ${ownerId}`);
  }
);
