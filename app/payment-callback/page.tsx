"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle, AlertCircle } from "lucide-react"
import Link from "next/link"

export default function PaymentCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [paymentStatus, setPaymentStatus] = useState<"loading" | "success" | "failed">("loading")
  const [message, setMessage] = useState("Verifying payment...")
  const [transactionId, setTransactionId] = useState<string | null>(null)
  const [bookingId, setBookingId] = useState<string | null>(null)

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const transaction_id = searchParams.get("transaction_id")
        const tx_ref = searchParams.get("tx_ref")

        if (!transaction_id) {
          setPaymentStatus("failed")
          setMessage("No transaction ID provided")
          return
        }

        console.log("[v0] Verifying payment callback:", { transaction_id, tx_ref })

        // Verify payment with backend
        const response = await fetch("/api/flutterwave/verify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            transaction_id,
            tx_ref,
          }),
        })

        const data = await response.json()

        if (!response.ok) {
          setPaymentStatus("failed")
          setMessage(data.error || "Payment verification failed")
          console.error("[v0] Payment verification failed:", data)
          return
        }

        // Payment successful
        setPaymentStatus("success")
        setMessage("Payment successful! Your booking has been confirmed.")
        setTransactionId(transaction_id)
        setBookingId(data.bookingId)

        console.log("[v0] Payment verified successfully:", data)
      } catch (error) {
        console.error("[v0] Payment callback error:", error)
        setPaymentStatus("failed")
        setMessage(error instanceof Error ? error.message : "Payment verification failed")
      }
    }

    verifyPayment()
  }, [searchParams])

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8">
        {paymentStatus === "loading" && (
          <div className="flex flex-col items-center justify-center space-y-4">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
            <h1 className="text-2xl font-bold text-center">Verifying Payment</h1>
            <p className="text-muted-foreground text-center">{message}</p>
            <p className="text-xs text-muted-foreground text-center mt-4">Please wait...</p>
          </div>
        )}

        {paymentStatus === "success" && (
          <div className="flex flex-col items-center justify-center space-y-4">
            <CheckCircle className="w-12 h-12 text-green-600" />
            <h1 className="text-2xl font-bold text-center text-green-900">Payment Successful!</h1>
            <p className="text-muted-foreground text-center">{message}</p>
            {transactionId && (
              <div className="w-full p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-muted-foreground">Transaction ID</p>
                <p className="text-sm font-mono break-all">{transactionId}</p>
              </div>
            )}
            <div className="flex gap-2 w-full">
              <Button asChild className="flex-1">
                <Link href={bookingId ? `/booking?id=${bookingId}` : "/bookings"}>View Booking</Link>
              </Button>
              <Button asChild variant="outline" className="flex-1 bg-transparent">
                <Link href="/">Home</Link>
              </Button>
            </div>
          </div>
        )}

        {paymentStatus === "failed" && (
          <div className="flex flex-col items-center justify-center space-y-4">
            <AlertCircle className="w-12 h-12 text-red-600" />
            <h1 className="text-2xl font-bold text-center text-red-900">Payment Failed</h1>
            <p className="text-muted-foreground text-center">{message}</p>
            <div className="flex gap-2 w-full">
              <Button asChild className="flex-1">
                <Link href="/checkout">Try Again</Link>
              </Button>
              <Button asChild variant="outline" className="flex-1 bg-transparent">
                <Link href="/">Cancel</Link>
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
