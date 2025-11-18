"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CheckCircle, XCircle } from "lucide-react"
import type { Booking } from "@/lib/types"

export function BookingsManagement() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "completed" | "cancelled">("all")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await fetch(`/api/admin/bookings?status=${filter}`)
        if (!response.ok) throw new Error("Failed to fetch bookings")
        const data = await response.json()
        setBookings(data.bookings)
      } catch (error) {
        console.error("[v0] Error fetching bookings:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchBookings()
  }, [filter])

  const handleApprove = async (bookingId: string) => {
    try {
      const response = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "approved" }),
      })

      if (!response.ok) throw new Error("Update failed")
      setBookings((prev) => prev.map((b) => (b.id === bookingId ? { ...b, status: "approved" } : b)))
    } catch (error) {
      console.error("[v0] Error approving booking:", error)
    }
  }

  const handleReject = async (bookingId: string) => {
    try {
      const response = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "rejected" }),
      })

      if (!response.ok) throw new Error("Update failed")
      setBookings((prev) => prev.filter((b) => b.id !== bookingId))
    } catch (error) {
      console.error("[v0] Error rejecting booking:", error)
    }
  }

  if (loading) return <div className="text-center py-8">Loading bookings...</div>

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Select value={filter} onValueChange={(v) => setFilter(v as any)}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Bookings</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {bookings.map((booking) => (
        <Card key={booking.id}>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge
                    variant={
                      booking.status === "approved"
                        ? "default"
                        : booking.status === "pending"
                          ? "secondary"
                          : "destructive"
                    }
                  >
                    {booking.status}
                  </Badge>
                  <span className="text-sm font-medium">{booking.bookingType}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {booking.pickupLocation} → {booking.dropoffLocation}
                </p>
                <p className="text-sm mt-1">
                  {new Date(booking.startDate).toLocaleDateString()} to {new Date(booking.endDate).toLocaleDateString()}
                </p>
                <p className="text-sm font-bold mt-2 text-primary">{booking.totalPrice.toLocaleString()} RWF</p>
              </div>

              <div className="flex gap-2">
                {booking.status === "pending" && (
                  <>
                    <Button size="sm" onClick={() => handleApprove(booking.id)}>
                      <CheckCircle className="w-4 h-4 mr-2" /> Approve
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleReject(booking.id)}>
                      <XCircle className="w-4 h-4 mr-2" /> Reject
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
