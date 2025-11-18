'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { DashboardLayout } from '@/components/dashboard-layout';
import { useAuthWithProfile } from '@/hooks/use-auth-with-profile';
import { RoleBasedDashboard } from '@/components/role-based-dashboard';

export default function DashboardPage() {
  const { user, isUserLoading, userProfile } = useAuthWithProfile();

  if (!user || isUserLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Button asChild>
          <Link href="/login">Please login to access the dashboard</Link>
        </Button>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <RoleBasedDashboard />
    </DashboardLayout>
  );
}
