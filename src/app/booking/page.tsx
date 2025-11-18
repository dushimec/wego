'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import type { Booking, Car } from '@/lib/types';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, doc } from 'firebase/firestore';
import { useDoc } from '@/firebase/firestore/use-doc';

function BookingCard({ booking }: { booking: Booking }) {
    const firestore = useFirestore();
    const carRef = useMemoFirebase(() => doc(firestore, 'cars', booking.carId), [firestore, booking.carId]);
    const { data: car, isLoading } = useDoc<Car>(carRef);
    
    const getBadgeVariant = (status: Booking['status']): "default" | "secondary" | "outline" | "destructive" => {
        switch (status) {
            case 'pending': return 'default';
            case 'approved': return 'secondary';
            case 'completed': return 'outline';
            case 'rejected':
            case 'cancelled': return 'destructive';
            default: return 'default';
        }
    };

    if (isLoading) {
        return (
            <Card className="grid md:grid-cols-12 gap-4 items-center p-4">
                <div className="md:col-span-3">
                    <div className="relative aspect-video rounded-md overflow-hidden bg-muted animate-pulse" />
                </div>
                <div className="md:col-span-6 space-y-2">
                     <div className="h-5 w-20 rounded-full bg-muted animate-pulse" />
                     <div className="h-6 w-48 rounded-full bg-muted animate-pulse" />
                     <div className="h-4 w-32 rounded-full bg-muted animate-pulse" />
                </div>
                <div className="md:col-span-3 text-left md:text-right space-y-2">
                    <div className="h-8 w-24 ml-auto rounded-full bg-muted animate-pulse" />
                </div>
            </Card>
        )
    }

    if (!car) return null; // Or some fallback UI

    const carImage = car.images?.[0] || 'https://picsum.photos/seed/placeholder/800/600';

    return (
        <Card className="grid md:grid-cols-12 gap-4 items-center p-4 hover:bg-card/80 transition-colors">
            <div className="md:col-span-3">
                <div className="relative aspect-video rounded-md overflow-hidden">
                    <Image 
                        src={carImage} 
                        alt={`${car.brand} ${car.model}`} 
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 25vw"
                    />
                </div>
            </div>
            <div className="md:col-span-6">
                <CardHeader className="p-0">
                    <Badge variant={getBadgeVariant(booking.status)} className="w-fit mb-2 capitalize">{booking.status}</Badge>
                    <CardTitle className="text-xl">{car.brand} {car.model}</CardTitle>
                </CardHeader>
                <CardContent className="p-0 mt-2">
                    <p className="text-sm text-muted-foreground">
                        {format(new Date(booking.startDate), 'MMM d, yyyy')} to {format(new Date(booking.endDate), 'MMM d, yyyy')}
                    </p>
                </CardContent>
            </div>
            <div className="md:col-span-3 text-left md:text-right">
                <p className="text-2xl font-bold mb-2">{booking.totalPrice.toLocaleString()} RWF</p>
                {(booking.status === 'pending' || booking.status === 'approved') && <Button variant="outline" size="sm">Manage</Button>}
            </div>
        </Card>
    );
}


export default function BookingsPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const bookingsQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(collection(firestore, 'bookings'), where('customerId', '==', user.uid));
  }, [user, firestore]);

  const { data: bookings, isLoading } = useCollection<Booking>(bookingsQuery);

  if (isUserLoading) {
     return <div className="container mx-auto px-4 py-12 text-center"><p>Loading...</p></div>
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-3xl font-bold mb-4">Access Denied</h1>
        <p className="text-muted-foreground mb-6">Please log in to view your bookings.</p>
        <Button asChild>
          <Link href="/login">Login</Link>
        </Button>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-headline font-bold mb-2">My Bookings</h1>
        <p className="text-lg text-muted-foreground">Review your past, current, and future rentals.</p>
      </div>
      
      {isLoading ? (
         <div className="space-y-6">
            {Array.from({ length: 3 }).map((_, i) => <BookingCard key={i} booking={null as any} />)}
         </div>
      ) : bookings && bookings.length > 0 ? (
        <div className="space-y-6">
          {bookings.map((booking: Booking) => (
            <BookingCard key={booking.id} booking={booking} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
          <h2 className="text-2xl font-semibold mb-2">No Bookings Found</h2>
          <p className="text-muted-foreground mb-4">You haven't made any bookings yet.</p>
          <Button asChild>
            <Link href="/browse">Browse Cars</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
