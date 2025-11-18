"use client"

import Image from "next/image"
import type { Car } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import Link from "next/link"
import { useState } from "react"

type CarDetailsProps = {
  car: Car
  onBooking?: () => void
}

export function CarDetails({ car, onBooking }: CarDetailsProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const images = car.images && car.images.length > 0 ? car.images : ["/classic-red-convertible.png"]

  return (
    <div className="space-y-6">
      {/* Image Carousel */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          {images.length > 1 ? (
            <Carousel className="w-full">
              <CarouselContent>
                {images.map((image, idx) => (
                  <CarouselItem key={idx}>
                    <div className="relative w-full h-96">
                      <Image
                        src={image || "/placeholder.svg"}
                        alt={`${car.brand} ${car.model} - Image ${idx + 1}`}
                        fill
                        className="object-cover"
                        sizes="100vw"
                        priority={idx === 0}
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-4" />
              <CarouselNext className="right-4" />
            </Carousel>
          ) : (
            <div className="relative w-full h-96">
              <Image
                src={images[0] || "/placeholder.svg"}
                alt={`${car.brand} ${car.model}`}
                fill
                className="object-cover"
                sizes="100vw"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Vehicle Information */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-3xl mb-2">
                    {car.brand} {car.model}
                  </CardTitle>
                  <p className="text-lg text-muted-foreground">{car.year}</p>
                </div>
                <Badge className={car.available ? "bg-green-500" : "bg-red-500"}>
                  {car.available ? "Available" : "Unavailable"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-base text-muted-foreground">{car.description}</p>
            </CardContent>
          </Card>

          {/* Specifications */}
          <Card>
            <CardHeader>
              <CardTitle>Specifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Category</p>
                  <p className="font-semibold">{car.category}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Fuel Type</p>
                  <p className="font-semibold">{car.fuelType}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Transmission</p>
                  <p className="font-semibold">{car.transmission}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Seats</p>
                  <p className="font-semibold">{car.seats}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Registration Number</p>
                  <p className="font-semibold">{car.registrationNumber}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Reg. Expiry</p>
                  <p className="font-semibold">{car.registrationExpiry}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Features */}
          {car.features && car.features.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Features</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {car.features.map((feature, idx) => (
                    <Badge key={idx} variant="outline" className="justify-center py-2">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Booking Sidebar */}
        <div className="md:col-span-1">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle className="text-2xl">{car.pricePerDay.toLocaleString()} RWF</CardTitle>
              <p className="text-sm text-muted-foreground">per day</p>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button asChild className="w-full" disabled={!car.available} size="lg">
                <Link href={`/booking?carId=${car.id}`}>{car.available ? "Book Now" : "Not Available"}</Link>
              </Button>
              <Button variant="outline" className="w-full bg-transparent" asChild>
                <Link href="/browse">Browse More Cars</Link>
              </Button>

              {/* Location Info */}
              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground mb-2">Location</p>
                <p className="font-semibold">{car.location}</p>
              </div>

              {/* Insurance Info */}
              {car.insurance && (
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground mb-2">Insurance</p>
                  <p className="text-sm">
                    <span className="font-semibold">Provider:</span> {car.insurance.provider}
                  </p>
                  <p className="text-sm">
                    <span className="font-semibold">Policy:</span> {car.insurance.policyNumber}
                  </p>
                  <p className="text-sm">
                    <span className="font-semibold">Expires:</span> {car.insurance.expiryDate}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
