'use client';

import { useAuthWithProfile } from '@/hooks/use-auth-with-profile';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useState } from 'react';
import { VehicleForm } from '@/components/admin/vehicle-form';
import { VehicleList } from '@/components/admin/vehicle-list';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Car } from '@/lib/types';

export default function DashboardVehiclesPage() {
  const { userProfile } = useAuthWithProfile();
  const [selectedVehicle, setSelectedVehicle] = useState<Car | undefined>();
  const [refreshKey, setRefreshKey] = useState(0);

  // Only managers can access this page
  if (userProfile && userProfile.role !== 'manager') {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-3xl font-bold mb-4">Permission Denied</h1>
        <p className="text-muted-foreground mb-6">Only managers can access vehicle management.</p>
        <Button asChild>
          <Link href="/dashboard">Go to Dashboard</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Vehicle Management</h1>
        <p className="text-muted-foreground">Manage your fleet of vehicles</p>
      </div>

      <Tabs defaultValue="list" className="space-y-4">
        <TabsList>
          <TabsTrigger value="list">Vehicle List</TabsTrigger>
          <TabsTrigger value="add">Add Vehicle</TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <VehicleList key={refreshKey} onEdit={setSelectedVehicle} />
        </TabsContent>

        <TabsContent value="add">
          <VehicleForm onSuccess={() => setRefreshKey((k) => k + 1)} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
