"use client"

import { useState, useMemo } from "react"
import "leaflet/dist/leaflet.css"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CarCard } from "@/components/car-card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import dynamic from "next/dynamic"
import type { Location, Car } from "@/lib/types"
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase"
import { collection } from "firebase/firestore"

function haversineDistance(coords1: [number, number], coords2: [number, number]): number {
  const toRad = (x: number) => (x * Math.PI) / 180
  const R = 6371 // Earth radius in km

  const dLat = toRad(coords2[0] - coords1[0])
  const dLon = toRad(coords2[1] - coords1[1])
  const lat1 = toRad(coords1[0])
  const lat2 = toRad(coords2[0])

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c
}

export default function MapPage() {
  const firestore = useFirestore()
  const carsQuery = useMemoFirebase(() => collection(firestore, "cars"), [firestore])
  const { data: cars, isLoading: carsLoading } = useCollection<Car>(carsQuery)
  const locationsQuery = useMemoFirebase(() => collection(firestore, "locations"), [firestore])
  const { data: locations, isLoading: locationsLoading } = useCollection<Location>(locationsQuery)

  const center: [number, number] = [-1.9441, 30.0619]
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)
  const [nearestLocation, setNearestLocation] = useState<Location | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [searchLocation, setSearchLocation] = useState("")
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)

  const handleFindNearest = () => {
    setIsLoading(true)
    setNearestLocation(null)
    setSelectedLocation(null)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userPos: [number, number] = [position.coords.latitude, position.coords.longitude]
          setUserLocation(userPos)

          if (!locations) {
            setIsLoading(false)
            return
          }

          let closestLocation: Location | null = null
          let minDistance = Number.POSITIVE_INFINITY

          locations.forEach((location) => {
            const distance = haversineDistance(userPos, location.position)
            if (distance < minDistance) {
              minDistance = distance
              closestLocation = location
            }
          })

          setNearestLocation(closestLocation)
          setSelectedLocation(closestLocation)
          setIsLoading(false)
        },
        (error) => {
          console.error("Error getting user location:", error)
          setIsLoading(false)
          alert("Could not get your location. Please enable location services.")
        },
      )
    } else {
      setIsLoading(false)
      alert("Geolocation is not supported by this browser.")
    }
  }

  const handleLocationSearch = (query: string) => {
    setSearchLocation(query)
    if (query.trim() === "") {
      setSelectedLocation(null)
      return
    }

    const found = locations?.find((loc) => loc.name.toLowerCase().includes(query.toLowerCase()))

    if (found) {
      setSelectedLocation(found)
      setNearestLocation(null)
    }
  }

  const Map = useMemo(
    () =>
      dynamic(() => import("@/components/map-component"), {
        loading: () => (
          <div className="h-[600px] w-full bg-muted flex items-center justify-center">
            <span className="material-symbols-outlined text-5xl animate-spin text-primary">progress_activity</span>
          </div>
        ),
        ssr: false,
      }),
    [],
  )

  const carsForLocation = useMemo(() => {
    const location = selectedLocation || nearestLocation
    if (!location || !cars) return []
    return cars.filter((car) => location.carIds.includes(car.id))
  }, [selectedLocation, nearestLocation, cars])

  const allLocations = useMemo(() => {
    if (!locations) return []
    if (searchLocation.trim() === "") return locations
    return locations.filter((loc) => loc.name.toLowerCase().includes(searchLocation.toLowerCase()))
  }, [locations, searchLocation])

  const displayLocation = selectedLocation || nearestLocation

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-headline font-bold mb-2">Car Rental Map of Rwanda</h1>
        <p className="text-lg text-muted-foreground mb-6">
          Find our locations and nearest available cars across the country.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <Input
              placeholder="Search locations..."
              value={searchLocation}
              onChange={(e) => handleLocationSearch(e.target.value)}
              className="w-full"
              type="text"
            />
            {searchLocation && allLocations.length > 0 && (
              <div className="mt-2 space-y-2">
                {allLocations.map((location) => (
                  <button
                    key={location.id}
                    onClick={() => handleLocationSearch(location.name)}
                    className="w-full text-left p-2 hover:bg-accent rounded border border-border/50 transition-colors"
                  >
                    <p className="font-medium">{location.name}</p>
                    <p className="text-sm text-muted-foreground">{location.carIds.length} cars available</p>
                  </button>
                ))}
              </div>
            )}
          </div>
          <Button onClick={handleFindNearest} disabled={isLoading || locationsLoading} className="w-full sm:w-auto">
            {isLoading || locationsLoading ? (
              <span className="material-symbols-outlined mr-2 h-4 w-4 animate-spin">progress_activity</span>
            ) : (
              <span className="material-symbols-outlined mr-2 h-4 w-4">my_location</span>
            )}
            Find Nearest
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden mb-8">
        <Map
          center={center}
          cars={cars || []}
          locations={locations || []}
          userLocation={userLocation}
          nearestLocation={displayLocation}
        />
      </Card>

      {displayLocation && (
        <div className="mt-8">
          <div className="mb-6 pb-6 border-b border-border">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-3xl font-bold">{displayLocation.name}</h2>
              <Badge variant="secondary">{carsForLocation.length} cars available</Badge>
            </div>
            <p className="text-muted-foreground">These cars are available at this location.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {carsLoading ? (
              Array.from({ length: displayLocation.carIds.length }).map((_, i) => <CarCard key={i} car={null} />)
            ) : carsForLocation.length > 0 ? (
              carsForLocation.map((car) => <CarCard key={car.id} car={car} />)
            ) : (
              <p className="col-span-full text-center text-muted-foreground py-8">
                No cars available at this location.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
