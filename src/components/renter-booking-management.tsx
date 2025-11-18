'use client';

import { useState } from 'react';
import { useAuthWithProfile } from '@/hooks/use-auth-with-profile';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import type { Booking, Car } from '@/lib/types';
import { format } from 'date-fns';
import { AlertCircle, FileText, Trash2, CreditCard, MapPin, Calendar, Users } from 'lucide-react';
import Link from 'next/link';
import { useFirestore } from '@/firebase';
import { doc, collection, query, where } from 'firebase/firestore';
import { useCollection as useCollectionHook } from '@/firebase/firestore/use-collection';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';

export function RenterBookingManagement() {
  const { userProfile } = useAuthWithProfile();
  const { toast } = useToast();
  const firestore = useFirestore();
  
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [reportText, setReportText] = useState('');
  const [isReporting, setIsReporting] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState<Booking | null>(null);

  // Build queries for collections
  const bookingsQuery = userProfile ? query(
    collection(firestore, 'bookings'),
    where('customerId', '==', userProfile.id)
  ) : null;

  const { data: bookings, isLoading: loading } = userProfile && bookingsQuery 
    ? useCollectionHook<Booking>(bookingsQuery)
    : { data: [], isLoading: true };

  const { data: cars } = useCollectionHook<Car>(collection(firestore, 'cars'));

  if (!userProfile) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Please log in to view bookings</p>
      </div>
    );
  }

  // Filter bookings for this renter
  const renterBookings = bookings?.filter((b) => b.customerId === userProfile.id) || [];

  const activeBookings = renterBookings.filter((b) => b.status === 'approved');
  const pendingBookings = renterBookings.filter((b) => b.status === 'pending');
  const completedBookings = renterBookings.filter((b) => b.status === 'completed');
  const cancelledBookings = renterBookings.filter((b) => b.status === 'cancelled');

  const getStatusBadge = (status: Booking['status']) => {
    const variants: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
      pending: 'secondary',
      approved: 'default',
      completed: 'outline',
      cancelled: 'destructive',
      rejected: 'destructive',
    };
    return (
      <Badge variant={variants[status] || 'secondary'} className="capitalize">
        {status}
      </Badge>
    );
  };

  const handleReportIssue = async () => {
    if (!selectedBooking || !reportText.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a report description',
        variant: 'destructive',
      });
      return;
    }

    setIsReporting(true);
    try {
      const bookingRef = doc(firestore, 'bookings', selectedBooking.id);
      await setDocumentNonBlocking(
        bookingRef,
        {
          issues: [
            ...(selectedBooking.issues || []),
            {
              reportedAt: new Date(),
              description: reportText,
              reportedBy: userProfile.id,
            },
          ],
          hasIssue: true,
        },
        { merge: true }
      );

      toast({
        title: 'Report Submitted',
        description: 'Your issue has been reported. The manager will review it.',
      });

      setReportText('');
      setSelectedBooking(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit report. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsReporting(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!bookingToCancel) return;

    // Can only cancel pending bookings
    if (bookingToCancel.status !== 'pending') {
      toast({
        title: 'Cannot Cancel',
        description: 'You can only cancel pending bookings before the manager accepts them.',
        variant: 'destructive',
      });
      return;
    }

    setIsCancelling(true);
    try {
      const bookingRef = doc(firestore, 'bookings', bookingToCancel.id);
      await setDocumentNonBlocking(
        bookingRef,
        { status: 'cancelled', cancelledAt: new Date(), cancelledBy: 'renter' },
        { merge: true }
      );

      toast({
        title: 'Booking Cancelled',
        description: 'Your booking has been cancelled successfully.',
      });

      setBookingToCancel(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to cancel booking. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsCancelling(false);
    }
  };

  const getCarDetails = (carId: string | undefined) => {
    if (!carId) return undefined;
    return cars?.find((c) => c.id === carId);
  };

  const BookingRow = ({ booking }: { booking: Booking }) => {
    const car = booking.carId ? getCarDetails(booking.carId) : undefined;
    const canCancel = booking.status === 'pending';
    const needsPayment = booking.status === 'approved' && !booking.isPaid;

    return (
      <Card key={booking.id} className="mb-4">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Vehicle Info */}
            <div className="md:col-span-4">
              <h3 className="font-semibold text-lg mb-2">
                {car?.brand} {car?.model}
              </h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {format(new Date(booking.startDate), 'MMM d, yyyy')} -{' '}
                  {format(new Date(booking.endDate), 'MMM d, yyyy')}
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  {booking.bookingType || 'Car only'}
                </div>
                {booking.driverId && (
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Driver Assigned
                  </div>
                )}
              </div>
            </div>

            {/* Status & Price */}
            <div className="md:col-span-4">
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Status</p>
                  {getStatusBadge(booking.status)}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Price</p>
                  <p className="text-2xl font-bold">{booking.totalPrice.toLocaleString()} RWF</p>
                </div>
                {booking.isPaid && (
                  <Badge variant="default" className="bg-green-600">
                    ✓ Paid
                  </Badge>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="md:col-span-4 flex flex-col gap-2 justify-center">
              {needsPayment && (
                <Button asChild variant="default">
                  <Link href={`/checkout?bookingId=${booking.id}`}>
                    <CreditCard className="w-4 h-4 mr-2" />
                    Pay Now
                  </Link>
                </Button>
              )}

              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <FileText className="w-4 h-4 mr-2" />
                    Report Issue
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Report Issue</DialogTitle>
                    <DialogDescription>
                      Report any issues with your booking. The manager will be notified.
                    </DialogDescription>
                  </DialogHeader>
                  <Textarea
                    placeholder="Describe the issue in detail..."
                    value={reportText}
                    onChange={(e) => setReportText(e.target.value)}
                    className="min-h-[100px]"
                  />
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button
                      onClick={handleReportIssue}
                      disabled={isReporting || !reportText.trim()}
                    >
                      {isReporting ? 'Submitting...' : 'Submit Report'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {canCancel && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setBookingToCancel(booking)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Cancel Booking
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Cancel Booking?</DialogTitle>
                      <DialogDescription>
                        This action cannot be undone. Your booking will be cancelled and moved to
                        your cancellation history.
                      </DialogDescription>
                    </DialogHeader>
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        You can only cancel pending bookings before the manager accepts them.
                      </AlertDescription>
                    </Alert>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="outline">Keep Booking</Button>
                      </DialogClose>
                      <Button
                        variant="destructive"
                        onClick={handleCancelBooking}
                        disabled={isCancelling}
                      >
                        {isCancelling ? 'Cancelling...' : 'Confirm Cancel'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>

          {/* Issues Alert */}
          {booking.issues && booking.issues.length > 0 && (
            <Alert className="mt-4 border-yellow-500 bg-yellow-50">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                {booking.issues.length} issue(s) reported on this booking
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Loading your bookings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{activeBookings.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{pendingBookings.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{completedBookings.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Cancelled</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{cancelledBookings.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">Active ({activeBookings.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({pendingBookings.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedBookings.length})</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled ({cancelledBookings.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {activeBookings.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No active bookings</p>
          ) : (
            activeBookings.map((booking) => <BookingRow key={booking.id} booking={booking} />)
          )}
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          {pendingBookings.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No pending bookings</p>
          ) : (
            pendingBookings.map((booking) => <BookingRow key={booking.id} booking={booking} />)
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {completedBookings.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No completed bookings</p>
          ) : (
            completedBookings.map((booking) => <BookingRow key={booking.id} booking={booking} />)
          )}
        </TabsContent>

        <TabsContent value="cancelled" className="space-y-4">
          {cancelledBookings.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No cancelled bookings</p>
          ) : (
            cancelledBookings.map((booking) => <BookingRow key={booking.id} booking={booking} />)
          )}
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <div className="flex justify-center gap-4 pt-6">
        <Button asChild>
          <Link href="/browse">Browse More Cars</Link>
        </Button>
      </div>
    </div>
  );
}
