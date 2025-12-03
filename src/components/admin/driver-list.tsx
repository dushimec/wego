'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Star, Edit, Trash2, MapPin, Phone } from 'lucide-react'
import type { Driver } from '@/lib/types'
import { useUser } from '@/firebase'

interface DriverListProps {
  onEdit?: (driver: Driver) => void
  onDelete?: (driverId: string) => void
}

export function DriverList({ onEdit, onDelete }: DriverListProps) {
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useUser()

  useEffect(() => {
    if (!user) return

    const fetchDrivers = async () => {
      try {
        const token = await user.getIdToken()
        const response = await fetch('/api/drivers/list', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        if (!response.ok) throw new Error('Failed to fetch drivers')
        const data = await response.json()
        setDrivers(data.drivers)
      } catch (error) {
        console.error('[v0] Error fetching drivers:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDrivers()
  }, [user])

  const handleDelete = async (driverId: string) => {
    if (!confirm('Are you sure you want to delete this driver?')) return

    try {
      const response = await fetch(`/api/drivers/${driverId}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Delete failed')

      setDrivers((prev) => prev.filter((d) => d.id !== driverId))
      onDelete?.(driverId)
    } catch (error) {
      console.error('[v0] Error deleting driver:', error)
    }
  }

  if (loading) return <div className='text-center py-8'>Loading drivers...</div>

  return (
    <div className='space-y-4'>
      {drivers.map((driver) => (
        <Card key={driver.id}>
          <CardContent className='pt-6'>
            <div className='flex flex-col sm:flex-row gap-4'>
              {driver.profileImage && (
                <img
                  src={driver.profileImage || '/placeholder.svg'}
                  alt={driver.firstName}
                  className='w-full sm:w-24 h-24 object-cover rounded-full'
                />
              )}

              <div className='flex-1'>
                <div className='flex items-start justify-between'>
                  <div>
                    <h3 className='font-semibold text-lg'>
                      {driver.firstName} {driver.lastName}
                    </h3>
                    <p className='text-sm text-muted-foreground flex items-center gap-1'>
                      <span>{driver.experience} years experience</span>
                    </p>
                  </div>
                  <div className='flex items-center gap-1'>
                    <Star className='w-4 h-4 fill-yellow-400 text-yellow-400' />
                    <span className='font-medium'>{driver.rating || 5.0}</span>
                  </div>
                </div>

                <div className='grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 text-sm'>
                  <div className='flex items-center gap-2'>
                    <Phone className='w-4 h-4 text-muted-foreground' />
                    <span>{driver.phone}</span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <MapPin className='w-4 h-4 text-muted-foreground' />
                    <span>{driver.address}</span>
                  </div>
                  <div>
                    <span className='text-muted-foreground'>License:</span> {driver.licenseNumber}
                  </div>
                  <div>
                    <Badge variant={driver.available ? 'default' : 'secondary'}>
                      {driver.available ? 'Available' : 'Unavailable'}
                    </Badge>
                  </div>
                </div>

                {driver.bio && <p className='text-sm mt-2 text-muted-foreground'>{driver.bio}</p>}
              </div>

              <div className='flex gap-2'>
                <Button variant='outline' size='sm' onClick={() => onEdit?.(driver)}>
                  <Edit className='w-4 h-4' />
                </Button>
                <Button variant='destructive' size='sm' onClick={() => handleDelete(driver.id)}>
                  <Trash2 className='w-4 h-4' />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
