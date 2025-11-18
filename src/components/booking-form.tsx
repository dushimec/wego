"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { CalendarIcon, Clock } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { Card } from "@/components/ui/card"
import { useEffect, useState } from "react"
import type { Car, BookingExtra } from "@/lib/types"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

const bookingExtras: BookingExtra[] = [
  {
    id: "gps",
    name: "GPS Navigation",
    description: "Advanced GPS with offline maps",
    price: 5,
    category: "navigation",
  },
  {
    id: "babySeat",
    name: "Baby Seat",
    description: "Safety certified child seat",
    price: 10,
    category: "safety",
  },
  {
    id: "insurance",
    name: "Additional Insurance",
    description: "Comprehensive coverage",
    price: 15,
    category: "safety",
  },
  {
    id: "roofRack",
    name: "Roof Rack",
    description: "Extra luggage capacity",
    price: 8,
    category: "convenience",
  },
  {
    id: "wifi",
    name: "WiFi Hotspot",
    description: "Mobile WiFi device",
    price: 3,
    category: "convenience",
  },
]

const FormSchema = z
  .object({
    bookingType: z.enum(["car-only", "car-with-driver", "driver-only"]),
    startDate: z.date({
      required_error: "Please select a start date",
    }),
    endDate: z.date({
      required_error: "Please select an end date",
    }),
    pickupTime: z.string().optional(),
    dropoffTime: z.string().optional(),
    pickupLocation: z.string().min(2, {
      message: "Pickup location is required",
    }),
    dropoffLocation: z.string().min(2, {
      message: "Drop-off location is required",
    }),
    extras: z.array(z.string()).default([]),
    driverId: z.string().optional(),
  })
  .refine(
    (data) => {
      return data.endDate >= data.startDate
    },
    {
      message: "End date must be after start date",
      path: ["endDate"],
    },
  )

type FormData = z.infer<typeof FormSchema>

interface BookingFormProps {
  car?: Car
  onSubmit: (data: FormData) => void
  isLoading?: boolean
  availableDrivers?: Array<{ id: string; name: string; rating: number }>
}

export function BookingForm({ car, onSubmit, isLoading = false, availableDrivers = [] }: BookingFormProps) {
  const { toast } = useToast()
  const [totalPrice, setTotalPrice] = useState(0)
  const [bookingType, setBookingType] = useState<"car-only" | "car-with-driver" | "driver-only">("car-only")

  const form = useForm<FormData>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      bookingType: "car-only",
      extras: [],
      pickupTime: "08:00",
      dropoffTime: "17:00",
    },
  })

  useEffect(() => {
    const values = form.getValues()
    if (!values.startDate || !values.endDate) return

    const days = Math.ceil((values.endDate.getTime() - values.startDate.getTime()) / (1000 * 60 * 60 * 24))

    let total = 0

    // Calculate base price based on booking type
    if (values.bookingType === "car-only" && car) {
      total = car.pricePerDay * days
    } else if (values.bookingType === "car-with-driver" && car) {
      total = (car.pricePerDay + 50) * days // +$50/day for driver
    } else if (values.bookingType === "driver-only") {
      total = 50 * days // Driver only option
    }

    // Add extras
    values.extras.forEach((extraId) => {
      const extra = bookingExtras.find((e) => e.id === extraId)
      if (extra) {
        total += extra.price * days
      }
    })

    // Add tax (10%)
    const tax = total * 0.1
    total += tax

    setTotalPrice(total)
  }, [form.watch(), car]) // Updated dependency array to include car

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="bookingType"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-semibold">Service Type</FormLabel>
              <FormDescription>Choose your preferred booking service</FormDescription>
              <Tabs
                value={field.value}
                onValueChange={(value: any) => {
                  field.onChange(value)
                  setBookingType(value)
                }}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="car-only">Car Only</TabsTrigger>
                  <TabsTrigger value="car-with-driver">Car + Driver</TabsTrigger>
                  <TabsTrigger value="driver-only">Driver Only</TabsTrigger>
                </TabsList>
              </Tabs>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Date Selection */}
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                      >
                        {field.value ? format(field.value, "PPP") : <span>Pick a start date</span>}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date < new Date() || date < new Date("1900-01-01")}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>End Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                      >
                        {field.value ? format(field.value, "PPP") : <span>Pick an end date</span>}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date < form.getValues("startDate") || date < new Date("1900-01-01")}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="pickupTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pickup Time</FormLabel>
                <FormControl>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <Input type="time" {...field} />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="dropoffTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dropoff Time</FormLabel>
                <FormControl>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <Input type="time" {...field} />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Location Fields */}
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="pickupLocation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pickup Location</FormLabel>
                <FormControl>
                  <Input placeholder="Enter pickup location" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="dropoffLocation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Drop-off Location</FormLabel>
                <FormControl>
                  <Input placeholder="Enter drop-off location" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {bookingType === "car-with-driver" && (
          <FormField
            control={form.control}
            name="driverId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Select Driver</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a driver" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {availableDrivers.map((driver) => (
                      <SelectItem key={driver.id} value={driver.id}>
                        {driver.name} (★{driver.rating.toFixed(1)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>Drivers are rated by previous customers</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Extras */}
        <FormField
          control={form.control}
          name="extras"
          render={() => (
            <FormItem>
              <div className="mb-4">
                <FormLabel className="text-base">Add-ons</FormLabel>
                <FormDescription>Select additional features for your rental</FormDescription>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {bookingExtras.map((item) => (
                  <FormField
                    key={item.id}
                    control={form.control}
                    name="extras"
                    render={({ field }) => {
                      return (
                        <FormItem
                          key={item.id}
                          className="flex flex-row items-start space-x-3 space-y-0 rounded-lg border p-3"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(item.id)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...field.value, item.id])
                                  : field.onChange(field.value?.filter((value) => value !== item.id))
                              }}
                            />
                          </FormControl>
                          <div className="flex-1">
                            <FormLabel className="font-medium">{item.name}</FormLabel>
                            <FormDescription className="text-xs">{item.description}</FormDescription>
                          </div>
                          <span className="text-sm font-semibold">${item.price}/day</span>
                        </FormItem>
                      )
                    }}
                  />
                ))}
              </div>
            </FormItem>
          )}
        />

        <Card className="p-4 bg-secondary/5">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Service</span>
              <span className="font-medium">
                {bookingType === "car-only"
                  ? "Car Rental"
                  : bookingType === "car-with-driver"
                    ? "Car + Driver"
                    : "Driver Only"}
              </span>
            </div>
            {form.getValues("extras").length > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Add-ons</span>
                <span className="font-medium">
                  $
                  {form
                    .getValues("extras")
                    .reduce((sum, extraId) => {
                      const extra = bookingExtras.find((e) => e.id === extraId)
                      return sum + (extra?.price || 0)
                    }, 0)
                    .toFixed(2)}
                </span>
              </div>
            )}
            <div className="border-t pt-2 flex justify-between text-base font-semibold">
              <span>Total (incl. tax)</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
          </div>
        </Card>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Processing..." : "Proceed to Checkout"}
        </Button>
      </form>
    </Form>
  )
}

export default BookingForm
