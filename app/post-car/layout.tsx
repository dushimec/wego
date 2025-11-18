'use client';

import React from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { useAuthWithProfile } from '@/hooks/use-auth-with-profile';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function PostCarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userProfile } = useAuthWithProfile();

  // Only managers can access this page
  if (userProfile && userProfile.role !== 'manager') {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-3xl font-bold mb-4">Permission Denied</h1>
          <p className="text-muted-foreground mb-6">Only managers can post vehicles.</p>
          <Button asChild>
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {children}
    </DashboardLayout>
  );
}
