'use client';

import type { User, Car, Booking } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ManageVehicleDialog } from './manage-vehicle-dialog';
import { Button } from './ui/button';
import { format } from 'date-fns';

export function AdminDashboard({ users, cars, bookings, loading }: { users: User[] | null, cars: Car[] | null, bookings: Booking[] | null, loading: boolean }) {

  // Calculate KPIs
  const totalUsers = users?.length || 0;
  const totalCars = cars?.length || 0;
  const totalBookings = bookings?.length || 0;
  const totalRevenue = bookings?.reduce((acc, booking) => acc + booking.totalPrice, 0) || 0;
  const activeBookings = bookings?.filter(b => b.status === 'approved').length || 0;
  const availableCars = cars?.filter(c => c.available).length || 0;

  // Calculate booking trends
  const getBookingTrends = () => {
    const last7Days = [...Array(7)].map((_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return format(date, 'yyyy-MM-dd');
    }).reverse();

    return last7Days.map(date => ({
      date,
      bookings: bookings?.filter(b => 
        format(new Date(b.startDate), 'yyyy-MM-dd') === date
      ).length || 0
    }));
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

  const bookingTrends = getBookingTrends();

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+20.1% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeBookings}</div>
            <p className="text-xs text-muted-foreground">{availableCars} cars available</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <p className="text-xs text-muted-foreground">Active customers</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fleet Size</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCars}</div>
            <p className="text-xs text-muted-foreground">{availableCars} available</p>
          </CardContent>
        </Card>
      </div>

      {/* Booking Trends Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Booking Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px]">
            {/* Replace with your preferred chart component */}
          </div>
        </CardContent>
      </Card>

      {/* Recent Bookings Table */}
      <div className="mb-8">
          <h1 className="text-4xl font-headline font-bold mb-2">Admin Dashboard</h1>
          <p className="text-lg text-muted-foreground">Platform-wide statistics and management.</p>
      </div>
      
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
             <span className="material-symbols-outlined text-muted-foreground">group</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cars</CardTitle>
            <span className="material-symbols-outlined text-muted-foreground">directions_car</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCars}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <span className="material-symbols-outlined text-muted-foreground">book_online</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBookings}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8">
        <Card>
            <CardHeader>
                <CardTitle>Users</CardTitle>
            </CardHeader>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                    <TableRow><TableCell colSpan={3} className="text-center h-24">Loading...</TableCell></TableRow>
                ) : users?.map(user => (
                  <TableRow key={user.id}>
                    <TableCell>{user.displayName}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell><Badge>{user.role}</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Cars</CardTitle>
            </CardHeader>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Price/Day</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                    <TableRow><TableCell colSpan={5} className="text-center h-24">Loading...</TableCell></TableRow>
                ) : cars?.map(car => {
                    const owner = users?.find(u => u.id === car.ownerId);
                    return (
                      <TableRow key={car.id}>
                        <TableCell>{car.brand} {car.model}</TableCell>
                        <TableCell>{owner?.displayName || 'N/A'}</TableCell>
                        <TableCell>{car.pricePerDay.toLocaleString()} RWF</TableCell>
                        <TableCell><Badge variant={car.available ? 'default' : 'secondary'}>{car.available ? 'Available' : 'Unavailable'}</Badge></TableCell>
                        <TableCell className="text-right">
                            <ManageVehicleDialog car={car} ownerId={car.ownerId} trigger={<Button variant="outline" size="sm">Manage</Button>} />
                        </TableCell>
                      </TableRow>
                    )
                })}
              </TableBody>
            </Table>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Bookings</CardTitle>
            </CardHeader>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Total Price</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                    <TableRow><TableCell colSpan={5} className="text-center h-24">Loading...</TableCell></TableRow>
                ) : bookings?.map(booking => {
                    const car = cars?.find(c => c.id === booking.carId);
                    const customer = users?.find(u => u.id === booking.customerId);
                    return (
                      <TableRow key={booking.id}>
                        <TableCell>{car ? `${car.brand} ${car.model}` : 'N/A'}</TableCell>
                        <TableCell>{customer?.displayName || 'N/A'}</TableCell>
                        <TableCell>{format(new Date(booking.startDate), 'MMM d')} - {format(new Date(booking.endDate), 'MMM d, yyyy')}</TableCell>
                        <TableCell><Badge variant={getStatusVariant(booking.status)}>{booking.status}</Badge></TableCell>
                        <TableCell className="text-right">{booking.totalPrice.toLocaleString()} RWF</TableCell>
                      </TableRow>
                    )
                })}
              </TableBody>
            </Table>
        </Card>
      </div>
    </div>
  );
}
