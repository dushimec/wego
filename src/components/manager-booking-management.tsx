'use client';

import type { Booking } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function ManagerBookingManagement({ bookings }: { bookings: Booking[] }) {
  const handleApproveBooking = (bookingId: string) => {
    // TODO: Implement booking approval logic
    console.log(`Approving booking ${bookingId}`);
  };

  const handleDenyBooking = (bookingId: string) => {
    // TODO: Implement booking denial logic
    console.log(`Denying booking ${bookingId}`);
  };

  return (
    <div className="space-y-6">
      {bookings.map((booking) => (
        <Card key={booking.id}>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl">Booking #{booking.id.slice(0, 6)}...</CardTitle>
            <span className={`px-2 py-1 text-sm font-semibold rounded-full bg-yellow-200 text-yellow-800`}>
              {booking.status}
            </span>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h3 className="font-semibold">Details</h3>
                <p><strong>Pickup:</strong> {booking.pickupDate.toDate().toLocaleDateString()} at {booking.pickupTime}</p>
                <p><strong>Drop-off:</strong> {booking.dropoffDate.toDate().toLocaleDateString()} at {booking.dropoffTime}</p>
              </div>
              <div>
                <h3 className="font-semibold">Location</h3>
                <p><strong>From:</strong> {booking.pickupLocation}</p>
                <p><strong>To:</strong> {booking.dropoffLocation}</p>
              </div>
              <div>
                <h3 className="font-semibold">Actions</h3>
                <div className="flex space-x-2">
                  <Button onClick={() => handleApproveBooking(booking.id)}>Approve</Button>
                  <Button variant="destructive" onClick={() => handleDenyBooking(booking.id)}>Deny</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
