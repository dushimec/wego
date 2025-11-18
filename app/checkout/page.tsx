'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useFirestore } from '@/firebase';
import { useAuthWithProfile } from '@/hooks/use-auth-with-profile';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle } from 'lucide-react';
import { FlutterwavePaymentCheckout } from '@/components/flutterwave-payment-checkout';
import { doc } from 'firebase/firestore';
import { useDoc } from '@/firebase/firestore/use-doc';
import type { Booking, Car, User } from '@/lib/types';
import { format } from 'date-fns';
import Link from 'next/link';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const bookingId = searchParams.get('bookingId');
  const firestore = useFirestore();
  const { userProfile } = useAuthWithProfile();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!bookingId) {
      setError('No booking ID provided');
      setLoading(false);
      return;
    }

    const fetchBooking = async () => {
      try {
        const bookingRef = doc(firestore, 'bookings', bookingId);
        const bookingDoc = await fetch(`/api/bookings/${bookingId}`);
        if (!bookingDoc.ok) throw new Error('Booking not found');
        const bookingData = await bookingDoc.json();
        setBooking(bookingData);

        // Fetch car details
        const carRef = doc(firestore, 'cars', bookingData.carId);
        const carDoc = await fetch(`/api/cars/${bookingData.carId}`);
        if (carDoc.ok) {
          const carData = await carDoc.json();
          setCar(carData);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load booking');
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId, firestore]);

  const handlePaymentSuccess = async (transactionId: string) => {
    try {
      if (!bookingId || !userProfile) return;

      const bookingRef = doc(firestore, 'bookings', bookingId);
      await setDocumentNonBlocking(
        bookingRef,
        {
          isPaid: true,
          paymentMethod: 'flutterwave',
          transactionId,
          paidAt: new Date(),
          status: 'approved',
        },
        { merge: true }
      );

      // Show success message and redirect
      setTimeout(() => {
        router.push('/dashboard/renter?paymentSuccess=true');
      }, 2000);
    } catch (err) {
      console.error('Failed to update booking payment status:', err);
    }
  };

  const handlePaymentError = (error: string) => {
    setError(error);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading payment details...</p>
        </div>
      </div>
    );
  }

  if (!booking || !bookingId) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error || 'Booking not found'}</AlertDescription>
        </Alert>
        <Button asChild className="mt-4">
          <Link href="/dashboard/renter">Back to Bookings</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Complete Payment</h1>
            <p className="text-lg text-muted-foreground">Finish your booking with a secure payment</p>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Payment Section */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Payment Method</CardTitle>
                </CardHeader>
                <CardContent>
                  <FlutterwavePaymentCheckout
                    bookingId={bookingId}
                    customerId={userProfile?.id || ''}
                    amount={booking.totalPrice}
                    customerEmail={userProfile?.email || ''}
                    customerPhone={userProfile?.phoneNumber || ''}
                    customerName={userProfile?.displayName || ''}
                    onSuccess={handlePaymentSuccess}
                    onError={handlePaymentError}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Booking Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle>Booking Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Vehicle */}
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Vehicle</p>
                    <p className="font-semibold">
                      {car?.brand} {car?.model}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {car?.category} • {car?.year}
                    </p>
                  </div>

                  {/* Dates */}
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Rental Period</p>
                    <p className="font-semibold">
                      {format(new Date(booking.startDate), 'MMM d, yyyy')}
                    </p>
                    <p className="text-xs">to</p>
                    <p className="font-semibold">
                      {format(new Date(booking.endDate), 'MMM d, yyyy')}
                    </p>
                  </div>

                  {/* Booking Type */}
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Booking Type</p>
                    <p className="font-semibold capitalize">{booking.bookingType || 'Car only'}</p>
                  </div>

                  {/* Price Breakdown */}
                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <p className="text-muted-foreground">Base Price</p>
                      <p>{booking.basePrice?.toLocaleString() || 'N/A'} RWF</p>
                    </div>
                    {booking.taxAmount && booking.taxAmount > 0 && (
                      <div className="flex justify-between text-sm">
                        <p className="text-muted-foreground">Tax</p>
                        <p>{booking.taxAmount.toLocaleString()} RWF</p>
                      </div>
                    )}
                    {booking.extras && booking.extras.length > 0 && (
                      <div className="flex justify-between text-sm">
                        <p className="text-muted-foreground">Extras</p>
                        <p>
                          {booking.extras.reduce((sum, e) => sum + (e.price || 0), 0).toLocaleString()} RWF
                        </p>
                      </div>
                    )}
                    <div className="flex justify-between font-semibold border-t pt-2">
                      <p>Total</p>
                      <p>{booking.totalPrice.toLocaleString()} RWF</p>
                    </div>
                  </div>

                  {/* Payment Status */}
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                    <p className="text-xs text-blue-800">
                      ℹ️ Your booking will be confirmed once payment is completed successfully.
                    </p>
                  </div>

                  {/* Back Button */}
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/dashboard/renter">Back to Bookings</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
