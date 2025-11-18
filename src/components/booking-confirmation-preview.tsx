"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2 } from "lucide-react"

interface BookingConfirmationPreviewProps {
  bookingId: string
  onConfirm: () => void
  onCancel: () => void
}

export function BookingConfirmationPreview({ bookingId, onConfirm, onCancel }: BookingConfirmationPreviewProps) {
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <CheckCircle2 className="w-16 h-16 text-green-500" />
        </div>
        <CardTitle>Ready to Confirm?</CardTitle>
        <CardDescription>Review your booking one last time</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-muted p-4 rounded-lg">
          <p className="text-sm text-muted-foreground">Booking Reference</p>
          <p className="font-mono font-bold text-lg">{bookingId}</p>
        </div>
        <p className="text-sm text-muted-foreground">
          By confirming, you agree to our terms and conditions. A confirmation email will be sent to your registered
          email address.
        </p>
      </CardContent>
      <div className="flex gap-3 p-6 border-t">
        <Button onClick={onCancel} variant="outline" className="flex-1 bg-transparent">
          Cancel
        </Button>
        <Button onClick={onConfirm} className="flex-1">
          Confirm Booking
        </Button>
      </div>
    </Card>
  )
}
