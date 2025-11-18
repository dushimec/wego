'use client';

import { useEffect, useState } from 'react';
import { useAuthWithProfile } from '@/hooks/use-auth-with-profile';
import { useFirestore } from '@/firebase';
import type { Booking } from '@/lib/types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from '@/hooks/use-toast';
import Link from 'next/link';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

export function BookingNotificationListener() {
  const { userProfile } = useAuthWithProfile();
  const firestore = useFirestore();
  const [notifiedBookings, setNotifiedBookings] = useState<Set<string>>(new Set());
  const [shownNotifications, setShownNotifications] = useState<Set<string>>(new Set());
  const [approvedBooking, setApprovedBooking] = useState<Booking | null>(null);
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    if (!userProfile) return;

    // Set up real-time listener for bookings
    const bookingsQuery = query(
      collection(firestore, 'bookings'),
      where('customerId', '==', userProfile.id)
    );

    const unsubscribe = onSnapshot(bookingsQuery, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        const booking = { ...change.doc.data(), id: change.doc.id } as Booking;

        // Check if booking was just approved and we haven't notified yet
        if (
          booking.status === 'approved' &&
          !notifiedBookings.has(booking.id) &&
          !shownNotifications.has(booking.id)
        ) {
          // Show notification
          setApprovedBooking(booking);
          setShowDialog(true);
          setNotifiedBookings((prev) => new Set([...prev, booking.id]));
          setShownNotifications((prev) => new Set([...prev, booking.id]));

          // Show toast notification
          toast({
            title: '✅ Booking Approved!',
            description: `Your booking has been approved by the manager. Please complete the payment to proceed.`,
          });
        }
      });
    });

    return () => unsubscribe();
  }, [userProfile, firestore, notifiedBookings, shownNotifications]);

  return (
    <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>🎉 Booking Approved!</AlertDialogTitle>
          <AlertDialogDescription>
            Your booking has been accepted by the manager. You can now proceed with payment to confirm your
            reservation.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 my-4">
          <p className="text-sm text-blue-800">
            <strong>Next Step:</strong> Complete the payment to secure your booking. You'll receive a confirmation
            once payment is processed.
          </p>
        </div>
        <AlertDialogCancel>Close</AlertDialogCancel>
        <AlertDialogAction
          onClick={() => {
            setShowDialog(false);
            window.location.href = `/checkout?bookingId=${approvedBooking?.id}`;
          }}
        >
          Pay Now
        </AlertDialogAction>
      </AlertDialogContent>
    </AlertDialog>
  );
}
