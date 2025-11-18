'use client';

import { useAuthWithProfile } from '@/hooks/use-auth-with-profile';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { BookingsManagement } from '@/components/admin/bookings-management';

export default function DashboardBookingsPage() {
  const { userProfile } = useAuthWithProfile();

  // Only managers can access this page
  if (userProfile && userProfile.role !== 'manager') {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-3xl font-bold mb-4">Permission Denied</h1>
        <p className="text-muted-foreground mb-6">Only managers can access booking management.</p>
        <Button asChild>
          <Link href="/dashboard">Go to Dashboard</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Booking Management</h1>
        <p className="text-muted-foreground">Manage all vehicle bookings and requests</p>
      </div>

      <BookingsManagement />
    </div>
  );
}
