'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useAuthWithProfile } from '@/hooks/use-auth-with-profile';
import { RoleBasedDashboard } from '@/components/role-based-dashboard';

export default function DashboardPage() {
  const { user, isLoading, userProfile } = useAuthWithProfile();

  if (!user || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Button asChild>
          <Link href="/login">Please login to access the dashboard</Link>
        </Button>
      </div>
    );
  }

  return (
    <RoleBasedDashboard />
  );
}
