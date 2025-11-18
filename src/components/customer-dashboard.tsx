'use client';

import type { Booking, Car } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import React from 'react';
import { format } from 'date-fns';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';

export function CustomerDashboard({ user, bookings, isLoading }: { user: any, bookings: Booking[] | null, isLoading: boolean }) {
  const firestore = useFirestore();
  const carsQuery = useMemoFirebase(() => collection(firestore, 'cars'), [firestore]);
  const { data: cars, isLoading: carsLoading } = useCollection<Car>(carsQuery);

  const getCarDetails = (carId: string) => {
    if (!cars) return null;
    return cars.find((c: Car) => c.id === carId);
  };

  const getStatusVariant = (status: Booking['status']) => {
    switch (status) {
      case 'approved': return 'default';
      case 'pending': return 'secondary';
      case 'completed': return 'outline';
      case 'rejected':
      case 'cancelled': return 'destructive';
      default: return 'secondary';
    }
  };

  return (
    <>
      <div className="mb-8">
          <h1 className="text-4xl font-headline font-bold mb-2">My Bookings</h1>
          <p className="text-lg text-muted-foreground">Welcome, {user.displayName}. View and manage your car rentals.</p>
      </div>
      
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vehicle</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Total Price</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading || carsLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24">Loading your bookings...</TableCell>
              </TableRow>
            ) : bookings && bookings.length > 0 ? bookings.map(booking => {
              const car = booking.carId ? getCarDetails(booking.carId) : null;
              return (
                <TableRow key={booking.id}>
                  <TableCell className="font-medium">{car ? `${car.brand} ${car.model}` : 'Car not found'}</TableCell>
                  <TableCell>{format(new Date(booking.startDate), 'MMM d, yyyy')}</TableCell>
                  <TableCell>{format(new Date(booking.endDate), 'MMM d, yyyy')}</TableCell>
                  <TableCell><Badge variant={getStatusVariant(booking.status)}>{booking.status}</Badge></TableCell>
                  <TableCell className="text-right">{booking.totalPrice.toLocaleString()} RWF</TableCell>
                </TableRow>
              );
            }) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24">You haven't booked any cars yet.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </>
  );
}
