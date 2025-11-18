"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Car } from "@/lib/types"
import { format } from "date-fns"

interface BookingDetails {
  car: Car
  startDate: Date
  endDate: Date
  pickupLocation: string
  dropoffLocation: string
  pickupTime: string
  dropoffTime: string
  selectedExtras: string[]
  totalPrice: number
}

interface BookingPreviewProps {
  booking: BookingDetails
}

export function BookingPreview({ booking }: BookingPreviewProps) {
  const days = Math.ceil((booking.endDate.getTime() - booking.startDate.getTime()) / (1000 * 60 * 60 * 24))
  const basePrice = booking.car.pricePerDay * days
  const tax = basePrice * 0.1

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Booking Summary</CardTitle>
        <CardDescription>Review your booking details before confirmation</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Vehicle Info */}
        <div className="flex gap-4 pb-4 border-b">
          <img
            src={booking.car.images?.[0] || "/placeholder.svg"}
            alt={`${booking.car.brand} ${booking.car.model}`}
            className="w-24 h-24 rounded object-cover"
          />
          <div className="flex-1">
            <h3 className="text-lg font-semibold">
              {booking.car.brand} {booking.car.model}
            </h3>
            <p className="text-sm text-muted-foreground">{booking.car.year}</p>
            <div className="flex gap-2 mt-2">
              <Badge variant="outline">{booking.car.seats} seats</Badge>
              <Badge variant="outline">{booking.car.fuelType}</Badge>
            </div>
          </div>
        </div>

        {/* Dates & Times */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Pickup</p>
            <p className="font-semibold">{format(booking.startDate, "MMM d, yyyy")}</p>
            <p className="text-sm text-muted-foreground">
              {booking.pickupTime} • {booking.pickupLocation}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Dropoff</p>
            <p className="font-semibold">{format(booking.endDate, "MMM d, yyyy")}</p>
            <p className="text-sm text-muted-foreground">
              {booking.dropoffTime} • {booking.dropoffLocation}
            </p>
          </div>
        </div>

        {/* Pricing Breakdown */}
        <div className="space-y-2 p-4 bg-muted rounded-lg">
          <div className="flex justify-between text-sm">
            <span>Daily rate × {days} days</span>
            <span className="font-semibold">${basePrice.toFixed(2)}</span>
          </div>
          {booking.selectedExtras.length > 0 && (
            <div className="flex justify-between text-sm">
              <span>Add-ons</span>
              <span className="font-semibold">$45.00</span>
            </div>
          )}
          <div className="border-t pt-2 flex justify-between text-sm">
            <span>Subtotal</span>
            <span className="font-semibold">${(basePrice + 45).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Tax (10%)</span>
            <span className="font-semibold">${tax.toFixed(2)}</span>
          </div>
          <div className="border-t pt-2 flex justify-between font-bold text-base">
            <span>Total</span>
            <span>${booking.totalPrice.toFixed(2)}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <p className="text-xs text-muted-foreground">Please review all details before confirming your booking</p>
      </CardFooter>
    </Card>
  )
}
