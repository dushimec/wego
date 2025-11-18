'use client';

import Image from 'next/image';
import { notFound, useParams, useRouter } from 'next/navigation';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import type { Car } from '@/lib/types';
import Link from 'next/link';
import { useDoc, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { BookingForm } from '@/components/booking-form';

const getAvailabilityProps = (available: Car['available']) => {
    if (available) {
        return { icon: 'verified_user', text: 'Available', color: 'text-green-500', bgColor: 'bg-green-500/10' };
    }
    return { icon: 'lock', text: 'Booked', color: 'text-red-500', bgColor: 'bg-red-500/10' };
}

export default function CarDetailsPage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const firestore = useFirestore();
  const carRef = useMemoFirebase(() => doc(firestore, 'cars', id), [firestore, id]);
  const { data: car, isLoading: isCarLoading } = useDoc<Car>(carRef);
  const { user } = useUser();

  if (!isCarLoading && !car) {
    notFound();
  }

  if (isCarLoading) {
    return <CarDetailsSkeleton />;
  }

  if (!car) {
    notFound();
  }

  const carImages = car.images;
  const availability = getAvailabilityProps(car.available);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        <div>
          <Carousel className="w-full rounded-lg overflow-hidden shadow-lg">
            <CarouselContent>
              {carImages && carImages.length > 0 ? carImages.map((imgUrl, index) => (
                <CarouselItem key={index}>
                  <div className="relative aspect-[4/3]">
                    <Image
                      src={imgUrl}
                      alt={`${car.brand} ${car.model} view ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>
                </CarouselItem>
              )) : (
                 <CarouselItem>
                  <div className="relative aspect-[4/3] bg-muted flex items-center justify-center">
                    <span className="text-muted-foreground">No image available</span>
                  </div>
                </CarouselItem>
              )}
            </CarouselContent>
            <CarouselPrevious className="left-4" />
            <CarouselNext className="right-4" />
          </Carousel>
        </div>
        
        <div>
          <div className='flex justify-between items-start'>
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold font-headline mb-2">{car.brand} {car.model}</h1>
              <p className="text-lg text-muted-foreground">{car.year}</p>
            </div>
            <div className="flex items-center gap-2">
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${availability.bgColor} ${availability.color}`}>
                    <span className="material-symbols-outlined text-lg">{availability.icon}</span>
                    <span className="font-semibold">{availability.text}</span>
                </div>
            </div>
          </div>
          <p className="mt-4 text-lg text-muted-foreground">{car.description}</p>
          
          <div className="my-6 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="p-4 bg-card rounded-lg border">
              <span className="material-symbols-outlined text-3xl text-primary mb-2 mx-auto">group</span>
              <p className="font-semibold">{car.seats} Seats</p>
            </div>
            <div className="p-4 bg-card rounded-lg border">
              <span className="material-symbols-outlined text-3xl text-primary mb-2 mx-auto">local_gas_station</span>
              <p className="font-semibold">{car.fuelType}</p>
            </div>
            <div className="p-4 bg-card rounded-lg border">
              <span className="material-symbols-outlined text-3xl text-primary mb-2 mx-auto">settings</span>
              <p className="font-semibold">{car.transmission}</p>
            </div>
             <div className="p-4 bg-card rounded-lg border">
              <span className="material-symbols-outlined text-3xl text-primary mb-2 mx-auto">speed</span>
              <p className="font-semibold">Unlimited</p>
              <p className="text-xs text-muted-foreground">Mileage</p>
            </div>
          </div>
          
          <Card className="bg-secondary/30">
            <CardHeader>
              <CardTitle>Start Your Booking</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              {car.available && user ? (
                <BookingForm />
              ) : (
                <div className='flex flex-col items-center justify-center h-48'>
                  <p className='text-muted-foreground mb-4'>Please log in to book this car.</p>
                  <Button asChild>
                    <Link href="/login">Login</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      <div className="mt-16 grid md:grid-cols-2 gap-8 lg:gap-12">
        <div>
          <h2 className="text-2xl font-bold mb-4">Key Features</h2>
          <ul className="space-y-2">
            {car.features.map((feature, i) => (
              <li key={i} className="flex items-center text-lg">
                <span className="material-symbols-outlined w-5 h-5 mr-3 text-primary">check_circle</span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-4">Rental Policies</h2>
           <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>Driver Requirements</AccordionTrigger>
              <AccordionContent>
                All drivers must be at least 21 years old and hold a valid driver's license.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>Insurance Policy</AccordionTrigger>
              <AccordionContent>
                Basic insurance is included. Additional coverage options are available at the rental desk.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>Fuel Policy</AccordionTrigger>
              <AccordionContent>
                The vehicle must be returned with the same amount of fuel as at the start of the rental to avoid refueling charges.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </div>
  );
}


function CarDetailsSkeleton() {
    return (
        <div className="container mx-auto px-4 py-12">
            <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
                <div>
                    <Skeleton className="w-full aspect-[4/3] rounded-lg" />
                </div>
                <div>
                    <Skeleton className="h-12 w-3/4 mb-2" />
                    <Skeleton className="h-8 w-1/2 mb-4" />
                    <Skeleton className="h-6 w-1/4 mb-4" />
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6" />
                    </div>
                    <div className="my-6 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                        {Array.from({length: 4}).map((_, i) => <Skeleton key={i} className="h-24" />)}
                    </div>
                    <Skeleton className="h-64 w-full" />
                </div>
            </div>
             <div className="mt-16 grid md:grid-cols-2 gap-8 lg:gap-12">
                <div>
                    <Skeleton className="h-8 w-1/3 mb-4" />
                    <div className="space-y-2">
                        <Skeleton className="h-6 w-full" />
                        <Skeleton className="h-6 w-full" />
                        <Skeleton className="h-6 w-full" />
                    </div>
                </div>
                 <div>
                    <Skeleton className="h-8 w-1/3 mb-4" />
                     <div className="space-y-2">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                    </div>
                 </div>
            </div>
        </div>
    );
}
