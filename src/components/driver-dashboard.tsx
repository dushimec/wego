'use client';

import type { Booking, Car, User } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from './ui/button';
import { format } from 'date-fns';

export function DriverDashboard({ 
  driver,
  bookings, 
  cars,
  loading 
}: { 
  driver: User;
  bookings: Booking[] | null;
  cars: Car[] | null;
  loading: boolean;
}) {
  const driverBookings = bookings?.filter(b => 
    cars?.find(c => c.id === b.carId)?.ownerId === driver.id
  ) || [];

  const activeTrips = driverBookings.filter(b => b.status === 'approved');
  const completedTrips = driverBookings.filter(b => b.status === 'completed');
  const upcomingTrips = driverBookings.filter(b => b.status === 'pending');

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

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Trips</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeTrips.length}</div>
            <p className="text-xs text-muted-foreground">Currently in progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Trips</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedTrips.length}</div>
            <p className="text-xs text-muted-foreground">All time completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Trips</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingTrips.length}</div>
            <p className="text-xs text-muted-foreground">Pending approval</p>
          </CardContent>
        </Card>
      </div>

      {/* Active Trips */}
      <Card>
        <CardHeader>
          <CardTitle>Active Trips</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Trip ID</TableHead>
                <TableHead>Car</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activeTrips.map(booking => (
                <TableRow key={booking.id}>
                  <TableCell>{booking.id.slice(0, 8)}</TableCell>
                  <TableCell>
                    {cars?.find(c => c.id === booking.carId)?.brand} {cars?.find(c => c.id === booking.carId)?.model}
                  </TableCell>
                  <TableCell>{booking.customerId}</TableCell>
                  <TableCell>
                    {format(new Date(booking.startDate), 'MMM d')} - {format(new Date(booking.endDate), 'MMM d')}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(booking.status)}>
                      {booking.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm">Update Status</Button>
                  </TableCell>
                </TableRow>
              ))}
              {activeTrips.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">No active trips</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Upcoming Trips */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Trips</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Trip ID</TableHead>
                <TableHead>Car</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {upcomingTrips.map(booking => (
                <TableRow key={booking.id}>
                  <TableCell>{booking.id.slice(0, 8)}</TableCell>
                  <TableCell>
                    {cars?.find(c => c.id === booking.carId)?.brand} {cars?.find(c => c.id === booking.carId)?.model}
                  </TableCell>
                  <TableCell>{booking.customerId}</TableCell>
                  <TableCell>
                    {format(new Date(booking.startDate), 'MMM d')} - {format(new Date(booking.endDate), 'MMM d')}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(booking.status)}>
                      {booking.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm">Accept Trip</Button>
                  </TableCell>
                </TableRow>
              ))}
              {upcomingTrips.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">No upcoming trips</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
