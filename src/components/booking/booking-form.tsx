"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { MapPin, Calendar, Users, Tag } from "lucide-react"
import { bookingService } from "@/lib/booking-service"

const BOOKING_TYPES = [
  { id: "car-only", label: "Car Only", description: "Drive yourself" },
  { id: "car-with-driver", label: "Car + Driver", description: "Professional driver included" },
  { id: "driver-only", label: "Driver Only", description: "Bring your own car" },
]

const EXTRAS = [
  { id: "gps", label: "GPS Navigation", price: 5000 },
  { id: "baby-seat", label: "Baby Seat", price: 3000 },
  { id: "wifi", label: "WiFi Hotspot", price: 2000 },
  { id: "insurance", label: "Extended Insurance", price: 10000 },
]

interface BookingFormProps {
  onBookingCreated?: (bookingId: string) => void
}

export function BookingForm({ onBookingCreated }: BookingFormProps) {
  const [step, setStep] = useState(1)
  const [bookingType, setBookingType] = useState<"car-only" | "car-with-driver" | "driver-only">("car-with-driver")
  const [selectedExtras, setSelectedExtras] = useState<string[]>([])
  const [formData, setFormData] = useState({
    pickupLocation: "",
    dropoffLocation: "",
    startDate: "",
    endDate: "",
    pickupTime: "09:00",
    dropoffTime: "17:00",
  })

  const extrasTotal = EXTRAS.filter((e) => selectedExtras.includes(e.id)).reduce((sum, e) => sum + e.price, 0)
  const basePrice = 50000 // Example price per day
  const pricing = bookingService.calculatePricing(
    basePrice,
    formData.startDate,
    formData.endDate,
    selectedExtras.map((id) => ({ price: EXTRAS.find((e) => e.id === id)?.price || 0 })),
  )

  const handleExtraToggle = (extraId: string) => {
    setSelectedExtras((prev) => (prev.includes(extraId) ? prev.filter((id) => id !== extraId) : [...prev, extraId]))
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async () => {
    try {
      const response = await fetch("/api/bookings/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingType,
          ...formData,
          extras: selectedExtras.map((id) => {
            const extra = EXTRAS.find((e) => e.id === id)
            return { extraId: id, quantity: 1, price: extra?.price || 0 }
          }),
          basePrice: pricing.basePrice,
          taxAmount: pricing.taxAmount,
          totalPrice: pricing.totalPrice,
        }),
      })

      if (!response.ok) throw new Error("Booking failed")

      const data = await response.json()
      onBookingCreated?.(data.bookingId)
    } catch (error) {
      console.error("[v0] Booking error:", error)
    }
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Book Your Ride</CardTitle>
        <CardDescription>Choose your service and customize your booking</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs defaultValue="car-with-driver" onValueChange={(v) => setBookingType(v as any)}>
          <TabsList className="grid w-full grid-cols-3">
            {BOOKING_TYPES.map((type) => (
              <TabsTrigger key={type.id} value={type.id} className="text-xs sm:text-sm">
                {type.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <MapPin className="w-4 h-4" /> Pickup Location
              </label>
              <Input
                name="pickupLocation"
                value={formData.pickupLocation}
                onChange={handleInputChange}
                placeholder="Enter pickup location"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <MapPin className="w-4 h-4" /> Dropoff Location
              </label>
              <Input
                name="dropoffLocation"
                value={formData.dropoffLocation}
                onChange={handleInputChange}
                placeholder="Enter dropoff location"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Calendar className="w-4 h-4" /> Start Date
              </label>
              <Input name="startDate" type="date" value={formData.startDate} onChange={handleInputChange} />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Calendar className="w-4 h-4" /> End Date
              </label>
              <Input name="endDate" type="date" value={formData.endDate} onChange={handleInputChange} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Users className="w-4 h-4" /> Pickup Time
              </label>
              <Input name="pickupTime" type="time" value={formData.pickupTime} onChange={handleInputChange} />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Users className="w-4 h-4" /> Dropoff Time
              </label>
              <Input name="dropoffTime" type="time" value={formData.dropoffTime} onChange={handleInputChange} />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-sm font-medium flex items-center gap-2">
            <Tag className="w-4 h-4" /> Add-ons
          </label>
          {EXTRAS.map((extra) => (
            <div key={extra.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={selectedExtras.includes(extra.id)}
                  onCheckedChange={() => handleExtraToggle(extra.id)}
                />
                <div>
                  <p className="font-medium text-sm">{extra.label}</p>
                  <p className="text-xs text-muted-foreground">{extra.price.toLocaleString()} RWF</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <Card className="bg-muted p-4">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>
                Base Price (
                {formData.startDate && formData.endDate
                  ? Math.ceil(
                      (new Date(formData.endDate).getTime() - new Date(formData.startDate).getTime()) /
                        (1000 * 60 * 60 * 24),
                    ) || 1
                  : 1}{" "}
                days):
              </span>
              <span className="font-medium">{pricing.basePrice.toLocaleString()} RWF</span>
            </div>
            {selectedExtras.length > 0 && (
              <div className="flex justify-between">
                <span>Add-ons:</span>
                <span className="font-medium">{pricing.extrasTotal.toLocaleString()} RWF</span>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t">
              <span>Subtotal:</span>
              <span className="font-medium">{pricing.subtotal.toLocaleString()} RWF</span>
            </div>
            <div className="flex justify-between">
              <span>Tax (18%):</span>
              <span className="font-medium">{pricing.taxAmount.toLocaleString()} RWF</span>
            </div>
            <div className="flex justify-between text-base font-bold pt-2 border-t">
              <span>Total:</span>
              <span className="text-primary">{pricing.totalPrice.toLocaleString()} RWF</span>
            </div>
          </div>
        </Card>

        <Button onClick={handleSubmit} className="w-full" size="lg">
          Proceed to Payment
        </Button>
      </CardContent>
    </Card>
  )
}
