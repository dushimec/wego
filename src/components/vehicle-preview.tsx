"use client"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import type { Car } from "@/lib/types"
import { useState } from "react"

interface VehiclePreviewProps {
  vehicle: Partial<Car>
}

export function VehiclePreview({ vehicle }: VehiclePreviewProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  const images = vehicle.images && vehicle.images.length > 0 ? vehicle.images : ["/classic-red-convertible.png"]

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Preview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Image Carousel */}
        <div className="relative w-full h-96 bg-muted rounded-lg overflow-hidden">
          <Carousel className="w-full h-full">
            <CarouselContent>
              {images.map((img, idx) => (
                <CarouselItem key={idx} className="w-full h-96">
                  <img
                    src={img || "/placeholder.svg"}
                    alt={`${vehicle.brand} ${vehicle.model}`}
                    className="w-full h-full object-cover"
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
            {images.length > 1 && (
              <>
                <CarouselPrevious className="left-2" />
                <CarouselNext className="right-2" />
              </>
            )}
          </Carousel>
          <Badge className="absolute top-3 right-3">{vehicle.available ? "Available" : "Booked"}</Badge>
        </div>

        {/* Vehicle Details */}
        <div className="space-y-3">
          <div>
            <h3 className="text-2xl font-bold">
              {vehicle.brand} {vehicle.model}
            </h3>
            <p className="text-sm text-muted-foreground">{vehicle.year}</p>
          </div>

          <p className="text-sm">{vehicle.description}</p>

          {/* Specs Grid */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">group</span>
              <span>{vehicle.seats} Seats</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">local_gas_station</span>
              <span>{vehicle.fuelType}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">settings</span>
              <span>{vehicle.transmission}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">location_on</span>
              <span>{vehicle.location}</span>
            </div>
          </div>

          {/* Features */}
          {vehicle.features && vehicle.features.length > 0 && (
            <div>
              <p className="font-semibold text-sm mb-2">Features</p>
              <div className="flex flex-wrap gap-2">
                {vehicle.features.map((feature) => (
                  <Badge key={feature} variant="secondary">
                    {feature}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Registration Info */}
          <div className="text-xs text-muted-foreground space-y-1 p-3 bg-muted rounded">
            <p>Registration: {vehicle.registrationNumber}</p>
            <p>Expires: {vehicle.registrationExpiry}</p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center bg-muted/50">
        <div>
          <span className="text-2xl font-bold">{vehicle.pricePerDay?.toLocaleString()} RWF</span>
          <span className="text-xs text-muted-foreground">/day</span>
        </div>
        <Button disabled={!vehicle.available}>{vehicle.available ? "Book Now" : "Not Available"}</Button>
      </CardFooter>
    </Card>
  )
}
