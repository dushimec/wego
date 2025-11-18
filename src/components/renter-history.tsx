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
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import type { Booking, Car } from '@/lib/types';
import { format } from 'date-fns';
import {
  AlertCircle,
  Star,
  MessageSquare,
  MapPin,
  Calendar,
  Users,
  CreditCard,
  CheckCircle,
  XCircle,
  TrendingUp,
  BarChart3,
} from 'lucide-react';
import { useFirestore } from '@/firebase';
import { doc, collection, query, where } from 'firebase/firestore';
import { useCollection as useCollectionHook } from '@/firebase/firestore/use-collection';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';

interface BookingReview {
  id: string;
  bookingId: string;
  rating: number;
  comment: string;
  vehicleCondition: number;
  driverBehavior?: number;
  createdAt: Date;
}

export function RenterHistory() {
  const { userProfile } = useAuthWithProfile();
  const { toast } = useToast();
  const firestore = useFirestore();

  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState(5);
  const [vehicleConditionRating, setVehicleConditionRating] = useState(5);
  const [driverBehaviorRating, setDriverBehaviorRating] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasReviewed, setHasReviewed] = useState<Set<string>>(new Set());

  // Build queries for collections
  const bookingsQuery = userProfile
    ? query(
        collection(firestore, 'bookings'),
        where('customerId', '==', userProfile.id)
      )
    : null;

  const { data: bookings, isLoading: loading } = userProfile && bookingsQuery
    ? useCollectionHook<Booking>(bookingsQuery)
    : { data: [], isLoading: true };

  const { data: cars } = useCollectionHook<Car>(collection(firestore, 'cars'));
  const { data: reviews } = useCollectionHook<BookingReview>(collection(firestore, 'booking-reviews'));

  if (!userProfile) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Please log in to view history</p>
      </div>
    );
  }

  // Filter bookings for this renter - only completed and cancelled
  const renterBookings = bookings?.filter((b) => b.customerId === userProfile.id) || [];
  const completedBookings = renterBookings.filter((b) => b.status === 'completed').sort((a, b) => {
    const dateA = new Date(a.endDate).getTime();
    const dateB = new Date(b.endDate).getTime();
    return dateB - dateA; // Most recent first
  });

  const cancelledBookings = renterBookings.filter((b) => b.status === 'cancelled').sort((a, b) => {
    const dateA = new Date(a.cancelledAt || a.createdAt).getTime();
    const dateB = new Date(b.cancelledAt || b.createdAt).getTime();
    return dateB - dateA; // Most recent first
  });

  const renterReviews = reviews?.filter((r) => {
    const booking = renterBookings.find((b) => b.id === r.bookingId);
    return booking && booking.customerId === userProfile.id;
  }) || [];

  // Calculate statistics
  const totalBookings = completedBookings.length + cancelledBookings.length;
  const completedCount = completedBookings.length;
  const cancelledCount = cancelledBookings.length;
  const averageRating = renterReviews.length > 0
    ? (renterReviews.reduce((acc, r) => acc + r.rating, 0) / renterReviews.length).toFixed(1)
    : 0;

  const totalSpent = completedBookings.reduce((sum, b) => sum + b.totalPrice, 0);

  const getCar = (carId: string | undefined) => {
    if (!carId) return null;
    return cars?.find((c) => c.id === carId);
  };

  const getStatusBadge = (status: Booking['status']) => {
    const variants: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
      completed: 'default',
      cancelled: 'destructive',
    };
    return (
      <Badge variant={variants[status] || 'secondary'} className="capitalize">
        {status === 'completed' ? '✓ Completed' : '✗ Cancelled'}
      </Badge>
    );
  };

  const renderStars = (count: number, onChange?: (value: number) => void) => {
    return (
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => onChange?.(star)}
            className={`text-2xl transition-all ${
              star <= count ? 'text-yellow-400' : 'text-gray-300'
            } ${onChange ? 'cursor-pointer hover:scale-110' : ''}`}
          >
            ★
          </button>
        ))}
      </div>
    );
  };

  const handleSubmitReview = async () => {
    if (!selectedBooking) {
      toast({
        title: 'Error',
        description: 'No booking selected',
        variant: 'destructive',
      });
      return;
    }

    if (!reviewText.trim()) {
      toast({
        title: 'Error',
        description: 'Please write a review',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const reviewId = `${selectedBooking.id}-${userProfile.id}-${Date.now()}`;
      const reviewRef = doc(firestore, 'booking-reviews', reviewId);

      const review: BookingReview = {
        id: reviewId,
        bookingId: selectedBooking.id,
        rating,
        comment: reviewText,
        vehicleCondition: vehicleConditionRating,
        driverBehavior: selectedBooking.bookingType === 'car-with-driver' ? driverBehaviorRating : undefined,
        createdAt: new Date(),
      };

      await setDocumentNonBlocking(reviewRef, review, { merge: false });

      // Update booking to mark as reviewed
      const bookingRef = doc(firestore, 'bookings', selectedBooking.id);
      await setDocumentNonBlocking(bookingRef, { hasReview: true }, { merge: true });

      setHasReviewed((prev) => new Set([...prev, selectedBooking.id]));
      setReviewText('');
      setRating(5);
      setVehicleConditionRating(5);
      setDriverBehaviorRating(5);
      setSelectedBooking(null);

      toast({
        title: 'Success',
        description: 'Your review has been submitted',
      });
    } catch (error) {
      console.error('Error submitting review:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit review',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const BookingCard = ({ booking, showReview = false }: { booking: Booking; showReview?: boolean }) => {
    const car = getCar(booking.carId);
    const bookingReview = renterReviews.find((r) => r.bookingId === booking.id);
    const hasUserReview = bookingReview !== undefined;

    return (
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg">
                {car ? `${car.brand} ${car.model}` : 'Vehicle'}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {car?.category || 'N/A'} • {car?.year || 'N/A'}
              </p>
            </div>
            {getStatusBadge(booking.status)}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Booking Details */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span>
                {format(new Date(booking.startDate), 'MMM dd')} -{' '}
                {format(new Date(booking.endDate), 'MMM dd')}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span className="capitalize">{booking.bookingType}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <span>{booking.pickupLocation}</span>
            </div>
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-muted-foreground" />
              <span className="font-semibold">₦{booking.totalPrice.toLocaleString()}</span>
            </div>
          </div>

          {/* Issues if any */}
          {booking.issues && booking.issues.length > 0 && (
            <Alert className="bg-orange-50 border-orange-200">
              <AlertCircle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800">
                {booking.issues.length} issue(s) reported:
                {booking.issues.map((issue, idx) => (
                  <div key={idx} className="text-xs mt-1">
                    • {issue.description}
                  </div>
                ))}
              </AlertDescription>
            </Alert>
          )}

          {/* Cancellation Reason */}
          {booking.status === 'cancelled' && booking.cancellationReason && (
            <Alert className="bg-red-50 border-red-200">
              <XCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <strong>Cancellation Reason:</strong> {booking.cancellationReason}
              </AlertDescription>
            </Alert>
          )}

          {/* Review Section */}
          {showReview && booking.status === 'completed' && (
            <div className="border-t pt-4">
              {hasUserReview ? (
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Your Review
                  </h4>
                  <div>
                    <p className="text-sm font-medium mb-1">Rating</p>
                    {renderStars(bookingReview.rating)}
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1">Vehicle Condition</p>
                    {renderStars(bookingReview.vehicleCondition)}
                  </div>
                  {bookingReview.driverBehavior && (
                    <div>
                      <p className="text-sm font-medium mb-1">Driver Behavior</p>
                      {renderStars(bookingReview.driverBehavior)}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium mb-1">Comment</p>
                    <p className="text-sm text-muted-foreground">{bookingReview.comment}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(bookingReview.createdAt), 'PPp')}
                  </p>
                </div>
              ) : (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => setSelectedBooking(booking)}
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Write a Review
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Review Your Booking</DialogTitle>
                      <DialogDescription>
                        Share your experience with {car?.brand} {car?.model}
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                      {/* Overall Rating */}
                      <div>
                        <label className="text-sm font-medium">Overall Rating *</label>
                        <p className="text-xs text-muted-foreground mb-2">How was your experience?</p>
                        {renderStars(rating, setRating)}
                      </div>

                      {/* Vehicle Condition */}
                      <div>
                        <label className="text-sm font-medium">Vehicle Condition *</label>
                        <p className="text-xs text-muted-foreground mb-2">Rate the vehicle condition</p>
                        {renderStars(vehicleConditionRating, setVehicleConditionRating)}
                      </div>

                      {/* Driver Behavior (if applicable) */}
                      {booking.bookingType === 'car-with-driver' && (
                        <div>
                          <label className="text-sm font-medium">Driver Behavior</label>
                          <p className="text-xs text-muted-foreground mb-2">
                            How was the driver?
                          </p>
                          {renderStars(driverBehaviorRating, setDriverBehaviorRating)}
                        </div>
                      )}

                      {/* Comment */}
                      <div>
                        <label htmlFor="review-comment" className="text-sm font-medium">
                          Your Review *
                        </label>
                        <Textarea
                          id="review-comment"
                          placeholder="Share your experience, highlights, and suggestions..."
                          value={reviewText}
                          onChange={(e) => setReviewText(e.target.value)}
                          className="mt-1 min-h-24"
                        />
                      </div>
                    </div>

                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                      </DialogClose>
                      <Button onClick={handleSubmitReview} disabled={isSubmitting}>
                        {isSubmitting ? 'Submitting...' : 'Submit Review'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Loading your history...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Bookings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBookings}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {completedCount} completed, {cancelledCount} cancelled
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Spent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₦{totalSpent.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Across all bookings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Average Rating
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-1">
              {averageRating}
              <span className="text-yellow-400">★</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              From {renterReviews.length} reviews
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completion Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalBookings > 0 ? Math.round((completedCount / totalBookings) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">Successful completions</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="completed" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="completed">
            Completed ({completedCount})
          </TabsTrigger>
          <TabsTrigger value="cancelled">
            Cancelled ({cancelledCount})
          </TabsTrigger>
        </TabsList>

        {/* Completed Bookings */}
        <TabsContent value="completed" className="space-y-4">
          {completedBookings.length > 0 ? (
            <div className="grid gap-4">
              {completedBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} showReview />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6 text-center">
                <CheckCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                <p className="text-muted-foreground">No completed bookings yet</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Cancelled Bookings */}
        <TabsContent value="cancelled" className="space-y-4">
          {cancelledBookings.length > 0 ? (
            <div className="grid gap-4">
              {cancelledBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6 text-center">
                <CheckCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                <p className="text-muted-foreground">No cancelled bookings</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
