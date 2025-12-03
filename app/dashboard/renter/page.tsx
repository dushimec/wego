'use client';

import { useAuthWithProfile } from '@/hooks/use-auth-with-profile';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { RenterBookingManagement } from '@/components/renter-booking-management';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import type { Booking } from '@/lib/types';

export default function DashboardRenterPage() {
  const { user, userProfile, loading: authLoading } = useAuthWithProfile();
  const firestore = useFirestore();

  const bookingsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(firestore, 'bookings'), where('customerId', '==', user.uid));
  }, [firestore, user]);

  const { data: bookings, isLoading: bookingsLoading } = useCollection<Booking>(bookingsQuery);

  // Only renters can access this page
  if (userProfile && userProfile.role !== 'renter') {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-3xl font-bold mb-4">Permission Denied</h1>
        <p className="text-muted-foreground mb-6">Only renters can access this page.</p>
        <Button asChild>
          <Link href="/dashboard">Go to Dashboard</Link>
        </Button>
      </div>
    );
  }

  const isLoading = authLoading || bookingsLoading;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold mb-2">My Bookings</h1>
        <p className="text-lg text-muted-foreground">Manage your car rental bookings, report issues, and make payments</p>
      </div>

      {isLoading ? (
        <p>Loading bookings...</p>
      ) : bookings && bookings.length > 0 ? (
        <RenterBookingManagement bookings={bookings} />
      ) : (
        <p>You have no bookings.</p>
      )}
    </div>
  );
}
