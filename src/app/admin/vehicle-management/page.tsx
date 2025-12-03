'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { VehicleForm } from '@/components/admin/vehicle-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { Car } from '@/lib/types'
import { useAuth } from '@/firebase/client-provider'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

export default function VehicleManagementPage() {
  const [vehicles, setVehicles] = useState<Car[]>([])
  const [selectedVehicle, setSelectedVehicle] = useState<Car | undefined>()
  const [loading, setLoading] = useState(true)
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('add')

  const fetchVehicles = async () => {
    if (user) {
      setLoading(true)
      try {
        const token = await user.getIdToken()
        const response = await fetch('/api/vehicles/list', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error('Failed to fetch vehicles')
        }

        const data = await response.json()
        setVehicles(data.vehicles)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
  }

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      fetchVehicles()
    }
  }, [user])

  const handleSuccess = () => {
    setSelectedVehicle(undefined)
    fetchVehicles()
    setActiveTab('list')
  }

  const handleEdit = (vehicle: Car) => {
    setSelectedVehicle(vehicle)
    setActiveTab('add')
  }

  if (authLoading || (!user && !authLoading)) {
    return <div>Loading...</div>
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-bold">Vehicle Management</h1>
          <p className="text-muted-foreground">Add, edit, and preview vehicles</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="add">{selectedVehicle ? 'Edit Vehicle' : 'Add Vehicle'}</TabsTrigger>
            <TabsTrigger value="list">Vehicle List</TabsTrigger>
          </TabsList>

          <TabsContent value="add">
            <VehicleForm vehicle={selectedVehicle} onSuccess={handleSuccess} />
          </TabsContent>

          <TabsContent value="list">
            <Card>
              <CardHeader>
                <CardTitle>Vehicles</CardTitle>
                <CardDescription>Manage your vehicle inventory</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p>Loading...</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Brand</TableHead>
                        <TableHead>Model</TableHead>
                        <TableHead>Year</TableHead>
                        <TableHead>Price/Day</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {vehicles.map((vehicle) => (
                        <TableRow key={vehicle.id}>
                          <TableCell>{vehicle.brand}</TableCell>
                          <TableCell>{vehicle.model}</TableCell>
                          <TableCell>{vehicle.year}</TableCell>
                          <TableCell>{vehicle.pricePerDay}</TableCell>
                          <TableCell>
                            <Badge variant={vehicle.available ? 'default' : 'destructive'}>
                              {vehicle.available ? 'Available' : 'Unavailable'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button variant="outline" size="sm" onClick={() => handleEdit(vehicle)}>
                              Edit
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
