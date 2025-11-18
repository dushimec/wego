"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { BookingPreview } from "@/components/booking-preview"
import { BookingConfirmationPreview } from "@/components/booking-confirmation-preview"
import { useState } from "react"
import type { Car } from "@/lib/types"

const mockCar: Car = {
  id: "1",
  brand: "Toyota",
  model: "Camry",
  year: 2023,
  category: "Sedan",
  fuelType: "Hybrid",
  transmission: "Automatic",
  seats: 5,
  pricePerDay: 50000,
  registrationNumber: "RAB 123 A",
  registrationExpiry: "2025-12-31",
  description: "Comfortable sedan perfect for city driving",
  features: ["Air Conditioning", "Power Steering", "ABS"],
  location: "Kigali",
  images: ["/toyota-camry.png"],
  available: true,
  ownerId: "owner1",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

export default function BookingPreviewPage() {
  const [showConfirmation, setShowConfirmation] = useState(false)

  const mockBooking = {
    car: mockCar,
    startDate: new Date(),
    endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    pickupLocation: "Kigali City Center",
    dropoffLocation: "Kigali Airport",
    pickupTime: "08:00",
    dropoffTime: "17:00",
    selectedExtras: ["GPS", "baby-seat"],
    totalPrice: 165000,
  }

  const handleConfirm = () => {
    alert("Booking confirmed!")
  }

  const handleCancel = () => {
    setShowConfirmation(false)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div>
          <h1 className="text-4xl font-bold">Booking Preview</h1>
          <p className="text-muted-foreground">Review your complete booking before confirmation</p>
        </div>

        {!showConfirmation ? (
          <>
            <BookingPreview booking={mockBooking} />
            <button
              onClick={() => setShowConfirmation(true)}
              className="w-full px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90"
            >
              Proceed to Confirmation
            </button>
          </>
        ) : (
          <BookingConfirmationPreview bookingId="BK-2024-001234" onConfirm={handleConfirm} onCancel={handleCancel} />
        )}
      </div>
    </DashboardLayout>
  )
}
