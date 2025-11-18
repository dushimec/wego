'use client';

import { useState } from 'react';
import { useCollection } from '@/firebase/firestore/use-collection';
import type { Driver } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { ManageDriverDialog } from '@/components/manage-driver-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';

export default function DriversPage() {
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const { data: drivers, loading, error } = useCollection<Driver>('drivers');

  if (loading) {
    return <div>Loading drivers...</div>;
  }

  if (error) {
    return <div>Error loading drivers: {error.message}</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Drivers</h1>
        <ManageDriverDialog onSuccess={() => setSelectedDriver(null)} />
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Driver</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>License</TableHead>
              <TableHead>Experience</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {drivers?.map((driver) => (
              <TableRow key={driver.id}>
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src={driver.profileImage} alt={`${driver.firstName} ${driver.lastName}`} />
                      <AvatarFallback>{driver.firstName[0]}{driver.lastName[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{driver.firstName} {driver.lastName}</div>
                      <div className="text-sm text-gray-500">{driver.languages.join(', ')}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <div>{driver.email}</div>
                    <div>{driver.phone}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <div>{driver.licenseNumber}</div>
                    <div className="text-gray-500">
                      Expires: {new Date(driver.licenseExpiry).toLocaleDateString()}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {driver.experience} years
                </TableCell>
                <TableCell>
                  <Badge variant={driver.available ? 'success' : 'secondary'}>
                    {driver.available ? 'Available' : 'Unavailable'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <span className="text-yellow-500 mr-1">★</span>
                    <span>{driver.rating?.toFixed(1) || 'N/A'}</span>
                  </div>
                </TableCell>
                <TableCell>
                  {formatDistanceToNow(new Date(driver.updatedAt), { addSuffix: true })}
                </TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedDriver(driver)}
                  >
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {selectedDriver && (
        <ManageDriverDialog
          driver={selectedDriver}
          onSuccess={() => setSelectedDriver(null)}
        />
      )}
    </div>
  );
}
