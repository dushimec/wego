'use client';

import { useAuthWithProfile } from '@/hooks/use-auth-with-profile';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import type { Booking } from '@/lib/types';
import { ManagerBookingManagement } from '@/components/manager-booking-management';

export default function BookingsPage() {
  const { user, userProfile, loading: authLoading } = useAuthWithProfile();
  const firestore = useFirestore();

  const bookingsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(firestore, 'bookings'), where('status', '==', 'pending'));
  }, [firestore, user]);

  const { data: bookings, isLoading: bookingsLoading } = useCollection<Booking>(bookingsQuery);

  // Verify user role
  if (userProfile && userProfile.role !== 'manager') {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-3xl font-bold mb-4">Permission Denied</h1>
        <p className="text-muted-foreground mb-6">Only managers can access this page.</p>
        <Button asChild>
          <Link href="/dashboard">Go to Dashboard</Link>
        </Button>
      </div>
    );
  }

  const isLoading = authLoading || bookingsLoading;

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-headline font-bold mb-8">Manage Bookings</h1>
      {isLoading ? (
        <p>Loading bookings...</p>
      ) : bookings && bookings.length > 0 ? (
        <ManagerBookingManagement bookings={bookings} />
      ) : (
        <p>No pending bookings.</p>
      )}
    </div>
  );
}
