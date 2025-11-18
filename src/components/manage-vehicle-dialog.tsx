'use client';

import { useFirestore } from '@/firebase';
import type { Car } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import React from 'react';
import { collection, doc, serverTimestamp } from 'firebase/firestore';
import {
  addDocumentNonBlocking,
  deleteDocumentNonBlocking,
  setDocumentNonBlocking,
} from '@/firebase/non-blocking-updates';
import { Switch } from '@/components/ui/switch';
import ImageUpload from './image-upload';

const carFormSchema = z.object({
  brand: z.string().min(1, 'Brand is required'),
  model: z.string().min(1, 'Model is required'),
  year: z.coerce.number().min(1900, 'Invalid year'),
  pricePerDay: z.coerce.number().min(0, 'Price must be positive'),
  fuelType: z.enum(['Gasoline', 'Diesel', 'Electric', 'Hybrid']),
  transmission: z.enum(['Automatic', 'Manual']),
  seats: z.coerce.number().min(1, 'At least 1 seat'),
  location: z.string().min(1, 'Location is required'),
  description: z.string().min(1, 'Description is required'),
  available: z.boolean().default(true),
  unavailabilityReason: z.string().optional(),
  features: z.string().optional(),
  images: z.array(z.string()).optional(),
});

type CarFormValues = z.infer<typeof carFormSchema>;

export function ManageVehicleDialog({ car, trigger, ownerId }: { car?: Car, trigger: React.ReactNode, ownerId: string }) {
  const firestore = useFirestore();
  const [open, setOpen] = React.useState(false);
  const isEditMode = !!car;

  const { register, handleSubmit, control, watch, formState: { errors } } = useForm<CarFormValues>({
    resolver: zodResolver(carFormSchema),
    defaultValues: {
      brand: car?.brand || '',
      model: car?.model || '',
      year: car?.year || new Date().getFullYear(),
      pricePerDay: car?.pricePerDay || 0,
      seats: car?.seats || 4,
      fuelType: car?.fuelType || 'Gasoline',
      transmission: car?.transmission || 'Automatic',
      description: car?.description || '',
      location: car?.location || '',
      available: car?.available ?? true,
      unavailabilityReason: car?.unavailabilityReason || '',
      features: car?.features?.join(', ') || '',
      images: car?.images || [],
    },
  });

  const available = watch('available');

  const onSubmit = (data: CarFormValues) => {
    const featuresArray = data.features ? data.features.split(',').map(f => f.trim()) : [];

    const imagesArr = data.images || [];
    const carData = {
      ...data,
      features: featuresArray,
      images: imagesArr,
      // Prefer the first image as the single-image convenience fields
      cloudinaryUrl: imagesArr.length > 0 ? imagesArr[0] : undefined,
      fileUrl: imagesArr.length > 0 ? imagesArr[0] : undefined,
      ownerId: car?.ownerId || ownerId,
      updatedAt: serverTimestamp(),
    };

    if (isEditMode && car) {
      setDocumentNonBlocking(doc(firestore, 'cars', car.id), carData, { merge: true });
    } else {
      addDocumentNonBlocking(collection(firestore, 'cars'), { ...carData, createdAt: serverTimestamp() });
    }

    setOpen(false);
  };

  const handleDelete = () => {
    if (car) {
      deleteDocumentNonBlocking(doc(firestore, 'cars', car.id));
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Manage Vehicle' : 'Add New Vehicle'}</DialogTitle>
          <DialogDescription>
            {isEditMode ? 'Update the details of this vehicle.' : 'Fill in the details to add a new vehicle.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="brand">Brand</Label>
              <Input id="brand" {...register('brand')} />
              {errors.brand && <p className="text-red-500 text-xs mt-1">{errors.brand.message}</p>}
            </div>
            <div>
              <Label htmlFor="model">Model</Label>
              <Input id="model" {...register('model')} />
              {errors.model && <p className="text-red-500 text-xs mt-1">{errors.model.message}</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="year">Year</Label>
              <Input id="year" type="number" {...register('year')} />
              {errors.year && <p className="text-red-500 text-xs mt-1">{errors.year.message}</p>}
            </div>
            <div>
              <Label htmlFor="pricePerDay">Price/Day (RWF)</Label>
              <Input id="pricePerDay" type="number" {...register('pricePerDay')} />
              {errors.pricePerDay && <p className="text-red-500 text-xs mt-1">{errors.pricePerDay.message}</p>}
            </div>
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" {...register('description')} />
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="location">Location</Label>
              <Input id="location" {...register('location')} placeholder="e.g. Kigali" />
              {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location.message}</p>}
            </div>
            <div>
              <Label htmlFor="features">Features (comma-separated)</Label>
              <Input id="features" {...register('features')} placeholder="e.g., GPS, Bluetooth" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Transmission</Label>
              <Controller name="transmission" control={control} render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Automatic">Automatic</SelectItem>
                    <SelectItem value="Manual">Manual</SelectItem>
                  </SelectContent>
                </Select>
              )} />
            </div>
            <div>
              <Label>Fuel Type</Label>
              <Controller name="fuelType" control={control} render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Gasoline">Gasoline</SelectItem>
                    <SelectItem value="Diesel">Diesel</SelectItem>
                    <SelectItem value="Hybrid">Hybrid</SelectItem>
                    <SelectItem value="Electric">Electric</SelectItem>
                  </SelectContent>
                </Select>
              )} />
            </div>
            <div>
              <Label htmlFor="seats">Seats</Label>
              <Input id="seats" type="number" {...register('seats')} />
              {errors.seats && <p className="text-red-500 text-xs mt-1">{errors.seats.message}</p>}
            </div>
          </div>

          <div className="items-center space-x-2">
            <Controller name="available" control={control} render={({ field }) => (
              <Switch id="available-switch" checked={field.value} onCheckedChange={field.onChange} />
            )} />
            <Label htmlFor="available-switch">Available for Rent</Label>
          </div>

          {!available && (
            <div>
              <Label htmlFor="unavailabilityReason">Reason for Unavailability</Label>
              <Input id="unavailabilityReason" {...register('unavailabilityReason')} />
            </div>
          )}

          <div>
            <Label>Car Images</Label>
            <Controller
              name="images"
              control={control}
              render={({ field }) => (
                <ImageUpload
                  value={field.value || []}
                  onChange={(url) => field.onChange([...(field.value || []), url])}
                  onRemove={(url) => field.onChange([...(field.value || []).filter((currentUrl) => currentUrl !== url)])}
                />
              )}
            />
          </div>

          <DialogFooter className="sm:justify-between pt-4">
            {isEditMode && <Button type="button" variant="destructive" onClick={handleDelete}>Delete Vehicle</Button>}
            {!isEditMode && <div />}
            <div className="flex gap-2">
              <DialogClose asChild>
                <Button type="button" variant="secondary">Cancel</Button>
              </DialogClose>
              <Button type="submit">Save</Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
