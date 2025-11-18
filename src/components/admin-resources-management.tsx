"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { Edit2, Plus, Trash2, Star } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"

interface Vehicle {
  id: string
  brand: string
  model: string
  year: number
  seats: number
  pricePerDay: number
  available: boolean
  location: string
  maintenanceSchedule?: {
    lastServiceDate: string
    nextServiceDate: string
  }
}

interface Driver {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  experience: number
  available: boolean
  rating?: number
  totalTrips?: number
}

interface AdminResourcesManagementProps {
  vehicles?: Vehicle[]
  drivers?: Driver[]
  onAddVehicle?: () => void
  onEditVehicle?: (vehicleId: string) => void
  onDeleteVehicle?: (vehicleId: string) => Promise<void>
  onAddDriver?: () => void
  onEditDriver?: (driverId: string) => void
  onDeleteDriver?: (driverId: string) => Promise<void>
}

export function AdminResourcesManagement({
  vehicles = [],
  drivers = [],
  onAddVehicle,
  onEditVehicle,
  onDeleteVehicle,
  onAddDriver,
  onEditDriver,
  onDeleteDriver,
}: AdminResourcesManagementProps) {
  const { toast } = useToast()
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: "vehicle" | "driver"; id: string } | null>(null)

  const handleDelete = async () => {
    if (!deleteConfirm) return

    try {
      setIsDeleting(true)
      if (deleteConfirm.type === "vehicle") {
        await onDeleteVehicle?.(deleteConfirm.id)
        toast({
          title: "Success",
          description: "Vehicle deleted successfully",
        })
      } else {
        await onDeleteDriver?.(deleteConfirm.id)
        toast({
          title: "Success",
          description: "Driver deleted successfully",
        })
      }
      setDeleteConfirm(null)
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Deletion failed",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="vehicles" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
          <TabsTrigger value="drivers">Drivers</TabsTrigger>
        </TabsList>

        {/* Vehicles Tab */}
        <TabsContent value="vehicles" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Vehicle Fleet</h2>
            <Button onClick={onAddVehicle}>
              <Plus className="w-4 h-4 mr-2" />
              Add Vehicle
            </Button>
          </div>

          <Card className="overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead>Seats</TableHead>
                  <TableHead>Price/Day</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vehicles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No vehicles added yet
                    </TableCell>
                  </TableRow>
                ) : (
                  vehicles.map((vehicle) => (
                    <TableRow key={vehicle.id}>
                      <TableCell className="font-medium">
                        {vehicle.brand} {vehicle.model}
                      </TableCell>
                      <TableCell>{vehicle.year}</TableCell>
                      <TableCell>{vehicle.seats}</TableCell>
                      <TableCell>RWF {vehicle.pricePerDay.toLocaleString()}/day</TableCell>
                      <TableCell>{vehicle.location}</TableCell>
                      <TableCell>
                        <Badge variant={vehicle.available ? "default" : "secondary"}>
                          {vehicle.available ? "Available" : "Unavailable"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => onEditVehicle?.(vehicle.id)}>
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteConfirm({ type: "vehicle", id: vehicle.id })}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* Drivers Tab */}
        <TabsContent value="drivers" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Driver Fleet</h2>
            <Button onClick={onAddDriver}>
              <Plus className="w-4 h-4 mr-2" />
              Add Driver
            </Button>
          </div>

          <Card className="overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Experience</TableHead>
                  <TableHead>Trips</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {drivers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No drivers added yet
                    </TableCell>
                  </TableRow>
                ) : (
                  drivers.map((driver) => (
                    <TableRow key={driver.id}>
                      <TableCell className="font-medium">
                        {driver.firstName} {driver.lastName}
                      </TableCell>
                      <TableCell className="text-sm">{driver.email}</TableCell>
                      <TableCell>{driver.phone}</TableCell>
                      <TableCell>{driver.experience} yrs</TableCell>
                      <TableCell>{driver.totalTrips || 0}</TableCell>
                      <TableCell>
                        {driver.rating && (
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-medium">{driver.rating.toFixed(1)}</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={driver.available ? "default" : "secondary"}>
                          {driver.available ? "Available" : "Busy"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => onEditDriver?.(driver.id)}>
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteConfirm({ type: "driver", id: driver.id })}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete this {deleteConfirm?.type}? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
