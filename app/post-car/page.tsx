'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useUser, useFirestore } from '@/firebase';
import { useRouter } from 'next/navigation';
import { collection, addDoc } from "firebase/firestore"; 
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  make: z.string().min(2, { message: "Make must be at least 2 characters." }),
  model: z.string().min(2, { message: "Model must be at least 2 characters." }),
  year: z.coerce.number().int().min(1900, { message: "Please enter a valid year." }).max(new Date().getFullYear() + 1, { message: "Please enter a valid year."}),
  price: z.coerce.number().positive({ message: "Price must be a positive number."}),
  description: z.string().min(10, { message: "Description must be at least 10 characters."}),
  image: z.string().url({ message: "Please enter a valid URL."}),
});

export default function PostCarPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const db = useFirestore();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      make: "",
      model: "",
      year: undefined,
      price: undefined,
      description: "",
      image: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) {
      toast({ title: "Error", description: "You must be logged in to post a car.", variant: "destructive"});
      return;
    }
    try {
      await addDoc(collection(db, "cars"), {
        ...values,
        ownerId: user.uid,
      });
      toast({ title: "Success!", description: "Your car has been listed." });
      router.push('/browse');
    } catch (error) {
      console.error("Error adding document: ", error);
      toast({ title: "Error", description: "There was an error listing your car.", variant: "destructive"});
    }
  }

  if (isUserLoading) {
    return <p>Loading...</p>;
  }

  if (!user) {
    return (
      <div className="container mx-auto py-8 text-center">
        <h1 className="text-3xl font-bold">Post a Car</h1>
        <p className="mt-4">You must be logged in to post a car. Please log in to continue.</p>
        <Button onClick={() => router.push('/login')} className="mt-4">Login</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Post a Car</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="make"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Make</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Toyota" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="model"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Model</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Camry" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="year"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Year</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="e.g., 2023" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price per day</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="e.g., 50" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., A reliable and fuel-efficient sedan." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="image"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Image URL</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., https://example.com/car.jpg" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Listing..." : "List My Car"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
