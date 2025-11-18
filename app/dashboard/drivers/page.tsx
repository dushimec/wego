'use client';

import { useAuthWithProfile } from '@/hooks/use-auth-with-profile';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useState } from 'react';
import { DriverList } from '@/components/admin/driver-list';
import { DriverForm } from '@/components/admin/driver-form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Driver } from '@/lib/types';

export default function DashboardDriversPage() {
  const { userProfile } = useAuthWithProfile();
  const [selectedDriver, setSelectedDriver] = useState<Driver | undefined>();
  const [refreshKey, setRefreshKey] = useState(0);

  // Only managers can access this page
  if (userProfile && userProfile.role !== 'manager') {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-3xl font-bold mb-4">Permission Denied</h1>
        <p className="text-muted-foreground mb-6">Only managers can access driver management.</p>
        <Button asChild>
          <Link href="/dashboard">Go to Dashboard</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Driver Management</h1>
        <p className="text-muted-foreground">Manage your team of drivers</p>
      </div>

      <Tabs defaultValue="list" className="space-y-4">
        <TabsList>
          <TabsTrigger value="list">Driver List</TabsTrigger>
          <TabsTrigger value="add">Add Driver</TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <DriverList key={refreshKey} onEdit={setSelectedDriver} />
        </TabsContent>

        <TabsContent value="add">
          <DriverForm onSuccess={() => setRefreshKey((k) => k + 1)} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
