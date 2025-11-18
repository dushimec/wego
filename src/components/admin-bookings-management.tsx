"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { ChevronRight, Check, X } from "lucide-react"

interface Booking {
  id: string
  customerName: string
  customerEmail: string
  carModel: string
  startDate: string
  endDate: string
  totalPrice: number
  bookingType: "car-only" | "car-with-driver" | "driver-only"
  status: "pending" | "approved" | "rejected" | "completed" | "cancelled"
  paymentStatus: "pending" | "paid" | "partial"
}

interface AdminBookingsManagementProps {
  bookings: Booking[]
  onApprove?: (bookingId: string) => Promise<void>
  onReject?: (bookingId: string, reason: string) => Promise<void>
}

export function AdminBookingsManagement({ bookings = [], onApprove, onReject }: AdminBookingsManagementProps) {
  const { toast } = useToast()
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [isApproving, setIsApproving] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")
  const [showRejectDialog, setShowRejectDialog] = useState(false)

  const filteredBookings = bookings.filter((booking) => {
    const matchesStatus = selectedStatus === "all" || booking.status === selectedStatus
    const matchesSearch =
      booking.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.carModel.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesStatus && matchesSearch
  })

  const handleApprove = async (bookingId: string) => {
    try {
      setIsApproving(true)
      await onApprove?.(bookingId)
      toast({
        title: "Success",
        description: "Booking approved successfully",
      })
      setSelectedBooking(null)
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to approve booking",
        variant: "destructive",
      })
    } finally {
      setIsApproving(false)
    }
  }

  const handleReject = async () => {
    if (!selectedBooking || !rejectionReason) {
      toast({
        title: "Error",
        description: "Please provide a rejection reason",
        variant: "destructive",
      })
      return
    }

    try {
      setIsApproving(true)
      await onReject?.(selectedBooking.id, rejectionReason)
      toast({
        title: "Success",
        description: "Booking rejected",
      })
      setSelectedBooking(null)
      setShowRejectDialog(false)
      setRejectionReason("")
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to reject booking",
        variant: "destructive",
      })
    } finally {
      setIsApproving(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "secondary",
      approved: "default",
      rejected: "destructive",
      completed: "default",
      cancelled: "outline",
    }
    return <Badge variant={variants[status] || "default"}>{status}</Badge>
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label>Search</Label>
            <Input
              placeholder="Search by customer or car..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <Label>Status</Label>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Bookings Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Vehicle</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Dates</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBookings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No bookings found
                </TableCell>
              </TableRow>
            ) : (
              filteredBookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{booking.customerName}</p>
                      <p className="text-sm text-muted-foreground">{booking.customerEmail}</p>
                    </div>
                  </TableCell>
                  <TableCell>{booking.carModel}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {booking.bookingType.replace("-", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {new Date(booking.startDate).toLocaleDateString()} -{" "}
                    {new Date(booking.endDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="font-semibold">RWF {booking.totalPrice.toLocaleString()}</TableCell>
                  <TableCell>{getStatusBadge(booking.status)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => setSelectedBooking(booking)}>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Booking Details Dialog */}
      <Dialog open={!!selectedBooking} onOpenChange={() => setSelectedBooking(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
          </DialogHeader>

          {selectedBooking && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Customer</p>
                <p className="font-medium">{selectedBooking.customerName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Vehicle</p>
                <p className="font-medium">{selectedBooking.carModel}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Booking Type</p>
                <p className="font-medium capitalize">{selectedBooking.bookingType.replace("-", " ")}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Dates</p>
                <p className="font-medium">
                  {new Date(selectedBooking.startDate).toLocaleDateString()} -{" "}
                  {new Date(selectedBooking.endDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Amount</p>
                <p className="text-2xl font-bold">RWF {selectedBooking.totalPrice.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Payment Status</p>
                <Badge variant={selectedBooking.paymentStatus === "paid" ? "default" : "secondary"}>
                  {selectedBooking.paymentStatus}
                </Badge>
              </div>

              {selectedBooking.status === "pending" && (
                <DialogFooter className="flex gap-2 pt-4">
                  <Button variant="destructive" onClick={() => setShowRejectDialog(true)} disabled={isApproving}>
                    <X className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                  <Button onClick={() => handleApprove(selectedBooking.id)} disabled={isApproving}>
                    <Check className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                </DialogFooter>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Reason Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Booking</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="reason">Rejection Reason</Label>
              <Input
                id="reason"
                placeholder="Explain why you're rejecting this booking..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                disabled={isApproving}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)} disabled={isApproving}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject} disabled={isApproving || !rejectionReason}>
              {isApproving ? "Rejecting..." : "Reject Booking"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
