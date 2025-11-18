"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2 } from "lucide-react"
import type { Car } from "@/lib/types"

interface VehicleListProps {
  onEdit?: (vehicle: Car) => void
  onDelete?: (vehicleId: string) => void
}

export function VehicleList({ onEdit, onDelete }: VehicleListProps) {
  const [vehicles, setVehicles] = useState<Car[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const response = await fetch("/api/vehicles/list")
        if (!response.ok) throw new Error("Failed to fetch vehicles")
        const data = await response.json()
        setVehicles(data.vehicles)
      } catch (error) {
        console.error("[v0] Error fetching vehicles:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchVehicles()
  }, [])

  const handleDelete = async (vehicleId: string) => {
    if (!confirm("Are you sure you want to delete this vehicle?")) return

    try {
      const response = await fetch(`/api/vehicles/${vehicleId}`, { method: "DELETE" })
      if (!response.ok) throw new Error("Delete failed")

      setVehicles((prev) => prev.filter((v) => v.id !== vehicleId))
      onDelete?.(vehicleId)
    } catch (error) {
      console.error("[v0] Error deleting vehicle:", error)
    }
  }

  if (loading) return <div className="text-center py-8">Loading vehicles...</div>

  return (
    <div className="space-y-4">
      {vehicles.map((vehicle) => (
        <Card key={vehicle.id}>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              {vehicle.images[0] && (
                <img
                  src={vehicle.images[0] || "/placeholder.svg"}
                  alt={vehicle.model}
                  className="w-full sm:w-24 h-24 object-cover rounded"
                />
              )}

              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">
                      {vehicle.brand} {vehicle.model}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {vehicle.category} • {vehicle.year}
                    </p>
                  </div>
                  <Badge variant={vehicle.available ? "default" : "secondary"}>
                    {vehicle.available ? "Available" : "Unavailable"}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Seats:</span> {vehicle.seats}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Fuel:</span> {vehicle.fuelType}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Trans:</span> {vehicle.transmission}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Rate:</span> {vehicle.pricePerDay.toLocaleString()} RWF/day
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => onEdit?.(vehicle)}>
                  <Edit className="w-4 h-4" />
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(vehicle.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
