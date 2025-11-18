'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { getSmartRecommendations, SmartRecommendationsOutput } from '@/ai/flows/smart-recommendation-flow';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

const recommendationFormSchema = z.object({
  priceRange: z.string().min(1, 'Price range is required.'),
  carType: z.string().min(1, 'Car type is required.'),
  features: z.string().min(1, 'Please list at least one feature.'),
  purpose: z.string().min(1, 'Purpose of rental is required.'),
  location: z.string().min(1, 'Location is required.'),
});

type RecommendationFormValues = z.infer<typeof recommendationFormSchema>;

export default function RecommendationsPage() {
  const [recommendations, setRecommendations] = useState<SmartRecommendationsOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<RecommendationFormValues>({
    resolver: zodResolver(recommendationFormSchema),
    defaultValues: {
      priceRange: '65000-130000',
      carType: 'SUV',
      features: 'GPS, Bluetooth',
      purpose: 'Family trip',
      location: 'Kigali, Rwanda',
    },
  });

  async function onSubmit(data: RecommendationFormValues) {
    setIsLoading(true);
    setError(null);
    setRecommendations(null);

    try {
      const result = await getSmartRecommendations(data);
      setRecommendations(result);
    } catch (e) {
      setError('Failed to get recommendations. Please try again.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <span className="material-symbols-outlined text-5xl text-primary mb-4 mx-auto">auto_awesome</span>
        <h1 className="text-4xl font-headline font-bold mb-2">Smart Recommendations</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Tell us what you need, and our AI will find the perfect car for you.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <Card className="md:col-span-1 h-fit">
          <CardHeader>
            <CardTitle>Your Preferences</CardTitle>
            <CardDescription>Fill out the form to get started.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="priceRange"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price Range (RWF/day)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 65000-130000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="carType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Car Type</FormLabel>
                       <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a car type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="SUV">SUV</SelectItem>
                          <SelectItem value="Sedan">Sedan</SelectItem>
                          <SelectItem value="Hatchback">Hatchback</SelectItem>
                          <SelectItem value="Convertible">Convertible</SelectItem>
                           <SelectItem value="Truck">Truck</SelectItem>
                          <SelectItem value="Any">Any</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="features"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Desired Features</FormLabel>
                      <FormControl>
                        <Textarea placeholder="e.g., GPS, Apple CarPlay, Sunroof" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="purpose"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Purpose of Rental</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Business Trip, Family Vacation" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Kigali, Rwanda" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? <span className="material-symbols-outlined mr-2 h-4 w-4 animate-spin">progress_activity</span> : <span className="material-symbols-outlined mr-2 h-4 w-4">auto_awesome</span>}
                  Get Recommendations
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <div className="md:col-span-2">
          {isLoading && (
            <div className="flex flex-col items-center justify-center h-full space-y-4 rounded-lg border-2 border-dashed">
              <span className="material-symbols-outlined text-5xl animate-spin text-primary">progress_activity</span>
              <p className="text-muted-foreground">Our AI is finding the best cars for you...</p>
            </div>
          )}
          {error && <p className="text-destructive text-center p-8">{error}</p>}
          {recommendations && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Top Recommendations For You</h2>
              {recommendations.recommendations.map((rec, index) => (
                <Card key={index} className="overflow-hidden">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{rec.carName}</CardTitle>
                        <CardDescription>{rec.rentalCompany}</CardDescription>
                      </div>
                      <div className="text-right">
                          <p className="text-2xl font-bold">{rec.price.toLocaleString()} RWF</p>
                          <p className="text-sm text-muted-foreground">/day</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-4 text-sm">{rec.reasoning}</p>
                    <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-muted-foreground">Suitability:</p>
                        <Progress value={rec.suitabilityScore * 100} className="w-[100px]" />
                        <span className="text-sm font-semibold">{Math.round(rec.suitabilityScore * 100)}%</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          {!isLoading && !recommendations && !error && (
            <div className="flex items-center justify-center h-full border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground p-8 text-center">Your personalized recommendations will appear here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
