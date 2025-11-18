'use client';

import { useFirestore } from '@/firebase';
import type { Driver } from '@/lib/types';
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
import { Textarea } from '@/components/ui/textarea';
import { ImageUpload } from './image-upload';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Switch } from './ui/switch';
import { z } from 'zod';
import React from 'react';
import { collection, doc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

const DriverSchema = z.object({
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Valid phone number is required'),
  licenseNumber: z.string().min(5, 'License number is required'),
  licenseExpiry: z.string().refine((date) => new Date(date) > new Date(), {
    message: 'License must not be expired',
  }),
  address: z.string().min(5, 'Address is required'),
  profileImage: z.string().min(1, 'Profile image is required'),
  documents: z.array(z.string()).min(1, 'At least one document scan is required'),
  experience: z.number().min(0, 'Experience must be 0 or greater'),
  languages: z.array(z.string()).min(1, 'At least one language is required'),
  available: z.boolean(),
  bio: z.string().min(10, 'Bio must be at least 10 characters'),
  rating: z.number().min(0).max(5).optional(),
  totalTrips: z.number().min(0).optional(),
  vehiclePreferences: z.array(z.string()).optional(),
  certifications: z.array(z.object({
    name: z.string(),
    issueDate: z.string(),
    expiryDate: z.string(),
  })).optional(),
});

type DriverFormData = z.infer<typeof DriverSchema>;

interface ManageDriverDialogProps {
  driver?: Driver;
  onSuccess?: () => void;
}

export function ManageDriverDialog({ driver, onSuccess }: ManageDriverDialogProps) {
  const firestore = useFirestore();
  const [open, setOpen] = React.useState(false);
  const { toast } = useToast();

  const form = useForm<DriverFormData>({
    resolver: zodResolver(DriverSchema),
    defaultValues: driver || {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      licenseNumber: '',
      licenseExpiry: '',
      address: '',
      profileImage: '',
      documents: [],
      experience: 0,
      languages: [],
      available: true,
      bio: '',
      rating: 0,
      totalTrips: 0,
      vehiclePreferences: [],
      certifications: [],
    },
  });

  async function onSubmit(data: DriverFormData) {
    try {
      const driverRef = driver?.id 
        ? doc(firestore, 'drivers', driver.id)
        : doc(collection(firestore, 'drivers'));

      await driverRef.set({
        ...data,
        id: driverRef.id,
        updatedAt: serverTimestamp(),
        createdAt: driver ? driver.createdAt : serverTimestamp(),
      }, { merge: true });

      toast({
        title: `Driver ${driver ? 'updated' : 'added'} successfully`,
        variant: 'default',
      });

      onSuccess?.();
      setOpen(false);
    } catch (error) {
      toast({
        title: 'Error saving driver',
        description: error instanceof Error ? error.message : 'Something went wrong',
        variant: 'destructive',
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={driver ? "outline" : "default"}>
          {driver ? "Edit Driver" : "Add Driver"}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{driver ? "Edit Driver" : "Add New Driver"}</DialogTitle>
          <DialogDescription>
            Fill in the driver details below. All fields marked with * are required.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Personal Information */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>First Name *</Label>
                <Input {...form.register('firstName')} />
                {form.formState.errors.firstName && (
                  <p className="text-sm text-red-500">{form.formState.errors.firstName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Last Name *</Label>
                <Input {...form.register('lastName')} />
                {form.formState.errors.lastName && (
                  <p className="text-sm text-red-500">{form.formState.errors.lastName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Email *</Label>
                <Input type="email" {...form.register('email')} />
                {form.formState.errors.email && (
                  <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Phone *</Label>
                <Input {...form.register('phone')} />
                {form.formState.errors.phone && (
                  <p className="text-sm text-red-500">{form.formState.errors.phone.message}</p>
                )}
              </div>
            </div>

            {/* License Information */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>License Number *</Label>
                <Input {...form.register('licenseNumber')} />
                {form.formState.errors.licenseNumber && (
                  <p className="text-sm text-red-500">{form.formState.errors.licenseNumber.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>License Expiry Date *</Label>
                <Input type="date" {...form.register('licenseExpiry')} />
                {form.formState.errors.licenseExpiry && (
                  <p className="text-sm text-red-500">{form.formState.errors.licenseExpiry.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Experience (years) *</Label>
                <Input 
                  type="number" 
                  {...form.register('experience', { valueAsNumber: true })} 
                />
                {form.formState.errors.experience && (
                  <p className="text-sm text-red-500">{form.formState.errors.experience.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label>Address *</Label>
            <Textarea {...form.register('address')} />
            {form.formState.errors.address && (
              <p className="text-sm text-red-500">{form.formState.errors.address.message}</p>
            )}
          </div>

          {/* Profile Image */}
          <div className="space-y-2">
            <Label>Profile Image *</Label>
            <ImageUpload
              value={[form.watch('profileImage')]}
              onChange={(urls) => form.setValue('profileImage', urls[0])}
              onRemove={() => form.setValue('profileImage', '')}
              maxImages={1}
            />
            {form.formState.errors.profileImage && (
              <p className="text-sm text-red-500">{form.formState.errors.profileImage.message}</p>
            )}
          </div>

          {/* Documents */}
          <div className="space-y-2">
            <Label>Documents *</Label>
            <ImageUpload
              value={form.watch('documents')}
              onChange={(urls) => form.setValue('documents', urls)}
              onRemove={(url) => {
                const current = form.watch('documents');
                form.setValue('documents', current.filter(u => u !== url));
              }}
            />
            {form.formState.errors.documents && (
              <p className="text-sm text-red-500">{form.formState.errors.documents.message}</p>
            )}
          </div>

          {/* Languages */}
          <div className="space-y-2">
            <Label>Languages *</Label>
            <div className="flex flex-wrap gap-2">
              {['English', 'French', 'Spanish', 'Arabic', 'Chinese'].map(lang => (
                <label key={lang} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={form.watch('languages').includes(lang)}
                    onChange={(e) => {
                      const current = form.watch('languages');
                      if (e.target.checked) {
                        form.setValue('languages', [...current, lang]);
                      } else {
                        form.setValue('languages', current.filter(l => l !== lang));
                      }
                    }}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="text-sm">{lang}</span>
                </label>
              ))}
            </div>
            {form.formState.errors.languages && (
              <p className="text-sm text-red-500">{form.formState.errors.languages.message}</p>
            )}
          </div>

          {/* Availability */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <Label>Available for Hire</Label>
              <p className="text-sm text-muted-foreground">
                Toggle if this driver is available for bookings
              </p>
            </div>
            <Controller
              name="available"
              control={form.control}
              render={({ field }) => (
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <Label>Bio *</Label>
            <Textarea 
              {...form.register('bio')} 
              placeholder="Enter driver bio..."
            />
            {form.formState.errors.bio && (
              <p className="text-sm text-red-500">{form.formState.errors.bio.message}</p>
            )}
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit">
              {driver ? "Update Driver" : "Add Driver"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
