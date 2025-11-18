"use client"

import Image from "next/image"
import Link from "next/link"
import type { Car as CarType } from "@/lib/types"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useEffect, useState } from "react"
import { getCarImage } from "@/ai/flows/car-image-flow"
import { Skeleton } from "./ui/skeleton"
import { cn } from "@/lib/utils"

type CarCardProps = {
  car: CarType | null
  generateImage?: boolean
}

function CarCard({ car, generateImage = false }: CarCardProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const fallbackImage = "/classic-red-convertible.png"

  // Support new fields: prefer `cloudinaryUrl`, then `images[0]`, then `fileUrl`.
  const hasUserImage = !!(
    car && (
      (car as any).cloudinaryUrl || (car.images && car.images.length > 0) || (car as any).fileUrl
    )
  )
  const shouldGenerateImage = generateImage && !hasUserImage && car

  useEffect(() => {
    async function generate() {
      if (!car) {
        setLoading(true)
        return
      }
      setLoading(true)

      if (hasUserImage) {
        // Prefer cloudinaryUrl if present
        const cloudUrl = (car as any).cloudinaryUrl
        if (cloudUrl) {
          setImageUrl(cloudUrl)
          setLoading(false)
          return
        }

        // Next prefer images[0]
        if (car.images && car.images.length > 0) {
          setImageUrl(car.images[0])
          setLoading(false)
          return
        }

        // Then fileUrl
        const fileUrl = (car as any).fileUrl
        if (fileUrl) {
          setImageUrl(fileUrl)
          setLoading(false)
          return
        }
      }

      if (shouldGenerateImage) {
        try {
          const result = await getCarImage({
            carName: `${car.brand} ${car.model}`,
            carType: car.fuelType, // This is not a direct mapping, but best effort
            carDescription: car.description,
          })
          setImageUrl(result.imageUrl)
        } catch (error) {
          setImageUrl(fallbackImage)
        } finally {
          setLoading(false)
        }
      } else {
        setImageUrl(fallbackImage)
        setLoading(false)
      }
    }
    generate()
  }, [car, shouldGenerateImage, hasUserImage])

  if (!car) {
    return (
      <Card className="flex flex-col overflow-hidden transition-all duration-300 shadow-lg">
        <CardHeader className="p-0">
          <Skeleton className="h-56 w-full" />
        </CardHeader>
        <CardContent className="flex-grow p-4">
          <Skeleton className="h-6 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2 mb-3" />
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
          </div>
        </CardContent>
        <CardFooter className="p-4 flex items-center justify-between bg-secondary/30">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-10 w-24" />
        </CardFooter>
      </Card>
    )
  }

  const availabilityStyles = {
    true: "bg-green-500/20 text-green-400 border-green-500/30",
    false: "bg-red-500/20 text-red-400 border-red-500/30",
  }

  const isAvailable = car.available

  return (
    <Card
      className={cn(
        "flex flex-col overflow-hidden transition-all duration-300 hover:shadow-primary/20 shadow-lg",
        !isAvailable && "opacity-60 hover:opacity-80",
      )}
    >
      <CardHeader className="p-0">
        <Link href={`/browse/${car.id}`} className="block">
          <div className="relative h-56 w-full">
            {loading ? (
              <Skeleton className="w-full h-full" />
            ) : imageUrl ? (
              <Image
                src={imageUrl || "/placeholder.svg"}
                alt={`${car.brand} ${car.model}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center">
                <span className="material-symbols-outlined text-4xl text-muted-foreground">directions_car</span>
              </div>
            )}
            <Badge className={cn("absolute top-3 right-3", availabilityStyles[isAvailable.toString() as 'true' | 'false'])}>
              {isAvailable ? "Available" : "Booked"}
            </Badge>
          </div>
        </Link>
      </CardHeader>
      <CardContent className="flex-grow p-4">
        <CardTitle className="text-xl mb-2">
          <Link href={`/browse/${car.id}`} className="hover:text-primary transition-colors">
            {car.brand} {car.model}
          </Link>
        </CardTitle>
        <p className="text-sm text-muted-foreground mb-3">{car.year}</p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-lg text-primary">group</span>
            <span>{car.seats} Seats</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-lg text-primary">local_gas_station</span>
            <span>{car.fuelType}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-lg text-primary">settings</span>
            <span>{car.transmission}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 flex items-center justify-between bg-secondary/30">
        <div>
          <span className="text-2xl font-bold">{car.pricePerDay.toLocaleString()} RWF</span>
          <span className="text-sm text-muted-foreground">/day</span>
        </div>
        <Button asChild disabled={!isAvailable}>
          <Link href={`/browse/${car.id}`}>{isAvailable ? "Book Now" : "Not Available"}</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

export { CarCard }
export default CarCard
