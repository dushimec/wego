'use client';

import { useAuthWithProfile } from '@/hooks/use-auth-with-profile';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { RenterHistory } from '@/components/renter-history';

export default function DashboardRenterHistoryPage() {
  const { userProfile } = useAuthWithProfile();

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

  return (
    <div>
      <h1 className="text-4xl font-headline font-bold mb-2">Booking History</h1>
      <p className="text-lg text-muted-foreground mb-8">View your past bookings, reviews, and rental statistics</p>
      
      <RenterHistory />
    </div>
  );
}
