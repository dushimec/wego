import { type NextRequest, NextResponse } from "next/server"
import { flutterwaveService } from "@/lib/flutterwave-service"
import { paymentService } from "@/lib/payment-service"
import { db } from "@/lib/firebase-admin"
import type { Booking } from "@/lib/types"

export async function POST(request: NextRequest) {
  try {
    const { transactionReference } = await request.json()

    if (!transactionReference) {
      return NextResponse.json({ error: "Missing transaction reference" }, { status: 400 })
    }

    // Verify payment with Flutterwave
    const paymentData = await flutterwaveService.verifyPayment(transactionReference)

    if (paymentData.status !== "successful") {
      return NextResponse.json({ error: "Payment verification failed", status: paymentData.status }, { status: 400 })
    }

    // Update booking and payment records
    const bookingDoc = await db.collection("bookings").doc(paymentData.bookingId).get()
    const booking = bookingDoc.data() as Booking

    // Update booking payment status
    await db.collection("bookings").doc(paymentData.bookingId).update({
      paymentStatus: "paid",
      status: "approved",
      updatedAt: new Date().toISOString(),
    })

    // Find and update payment record
    const payments = await paymentService.getPaymentsByBookingId(paymentData.bookingId)
    const payment = payments.find((p) => p.transactionId === transactionReference)

    if (payment) {
      await paymentService.updatePaymentStatus(payment.id, "completed")
    }

    return NextResponse.json(
      {
        success: true,
        bookingId: paymentData.bookingId,
        amount: paymentData.amount,
        currency: paymentData.currency,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("[v0] Payment verification error:", error)
    return NextResponse.json({ error: "Verification failed" }, { status: 500 })
  }
}
