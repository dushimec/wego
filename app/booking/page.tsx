'use client';

import { useState, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { DatePicker } from '@/components/ui/date-picker';
import { TimePicker } from '@/components/ui/time-picker';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { Car, Driver } from '@/lib/types';
import { useAuth } from '@/firebase/client-provider';
import { useRouter } from 'next/navigation';

const bookingSchema = z.object({
  bookingType: z.enum(['Car Only', 'Driver Only', 'Car + Driver']),
  car: z.string().optional(),
  driver: z.string().optional(),
  pickupLocation: z.string(),
  dropoffLocation: z.string(),
  pickupDate: z.date(),
  dropoffDate: z.date(),
  pickupTime: z.string(),
  dropoffTime: z.string(),
  message: z.string().optional(),
});

export default function BookingPage() {
  const firestore = useFirestore();
  const carsQuery = useMemoFirebase(() => collection(firestore, 'cars'), [firestore]);
  const driversQuery = useMemoFirebase(() => collection(firestore, 'drivers'), [firestore]);
  const router = useRouter();

  const { data: cars, isLoading: carsLoading } = useCollection<Car>(carsQuery);
  const { data: drivers, isLoading: driversLoading } = useCollection<Driver>(driversQuery);
  const { user, loading: authLoading } = useAuth();

  const [bookingType, setBookingType] = useState('Car Only');
  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      bookingType: 'Car Only',
    },
  });

  const onSubmit = (data) => {
    if (!user) {
      router.push('/login');
      return;
    }
    // TODO: Implement payment and booking creation logic
    console.log(data);
  };

  const isLoading = carsLoading || driversLoading || authLoading;

  return (
    <div className="container mx-auto px-4 py-12">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Book a Service</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label>Booking Type</Label>
              <Controller
                name="bookingType"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={(value) => {
                    field.onChange(value);
                    setBookingType(value);
                  }} defaultValue={field.value}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Car Only">Car Only</SelectItem>
                      <SelectItem value="Driver Only">Driver Only</SelectItem>
                      <SelectItem value="Car + Driver">Car + Driver</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {(bookingType === 'Car Only' || bookingType === 'Car + Driver') && (
              <div className="space-y-2">
                <Label>Car</Label>
                <Controller
                  name="car"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                      <SelectTrigger>
                        <SelectValue placeholder={isLoading ? "Loading cars..." : "Select a car"} />
                      </SelectTrigger>
                      <SelectContent>
                        {cars && cars.map(car => (
                          <SelectItem key={car.id} value={car.id}>{car.brand} {car.model}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            )}

            {(bookingType === 'Driver Only' || bookingType === 'Car + Driver') && (
              <div className="space-y-2">
                <Label>Driver</Label>
                <Controller
                  name="driver"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                      <SelectTrigger>
                        <SelectValue placeholder={isLoading ? "Loading drivers..." : "Select a driver"} />
                      </SelectTrigger>
                      <SelectContent>
                        {drivers && drivers.map(driver => (
                          <SelectItem key={driver.id} value={driver.id}>{driver.firstName} {driver.lastName}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Pickup Location</Label>
                <Controller
                  name="pickupLocation"
                  control={control}
                  render={({ field }) => <Input {...field} />}
                />
              </div>
              <div className="space-y-2">
                <Label>Drop-off Location</Label>
                <Controller
                  name="dropoffLocation"
                  control={control}
                  render={({ field }) => <Input {...field} />}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Pickup Date</Label>
                <Controller
                  name="pickupDate"
                  control={control}
                  render={({ field }) => <DatePicker {...field} />}
                />
              </div>
              <div className="space-y-2">
                <Label>Drop-off Date</Label>
                <Controller
                  name="dropoffDate"
                  control={control}
                  render={({ field }) => <DatePicker {...field} />}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Pickup Time</Label>
                <Controller
                  name="pickupTime"
                  control={control}
                  render={({ field }) => <TimePicker {...field} />}
                />
              </div>
              <div className="space-y-2">
                <Label>Drop-off Time</Label>
                <Controller
                  name="dropoffTime"
                  control={control}
                  render={({ field }) => <TimePicker {...field} />}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Message</Label>
              <Controller
                name="message"
                control={control}
                render={({ field }) => <Textarea {...field} />}
              />
            </div>

            {user ? (
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Loading...' : 'Book Now'}
              </Button>
            ) : (
              <Button type="button" onClick={() => router.push('/login')} disabled={isLoading}>
                {isLoading ? 'Loading...' : 'Login to Book'}
              </Button>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
