import { type NextRequest, NextResponse } from "next/server"
import { paymentService } from "@/lib/payment-service"
import { firestore } from "@/firebase/firebase-admin"

export async function POST(request: NextRequest) {
  try {
    const { bookingId, customerId, amount, paymentMethod, provider, phoneNumber, metadata } = await request.json()

    // Validate input
    if (!bookingId || !customerId || !amount || !paymentMethod) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    let paymentResult

    // Process payment based on method
    if (paymentMethod === "card") {
      paymentResult = await paymentService.processCardPayment(amount, "RWF", metadata)
    } else if (paymentMethod === "mobile-money") {
      if (!phoneNumber || !provider) {
        return NextResponse.json({ error: "Phone number and provider required for mobile money" }, { status: 400 })
      }
      paymentResult = await paymentService.processMobileMoneyPayment(phoneNumber, amount, provider as "mtn" | "airtel")
    } else if (paymentMethod === "cash") {
      // Cash payment marked as pending
      paymentResult = { success: true, transactionId: `CASH-${Date.now()}` }
    } else {
      return NextResponse.json({ error: "Invalid payment method" }, { status: 400 })
    }

    if (!paymentResult.success) {
      return NextResponse.json({ error: paymentResult.error || "Payment processing failed" }, { status: 400 })
    }

    // Record payment
    const booking = await firestore.collection("bookings").doc(bookingId).get()
    const invoiceId = booking.data()?.invoiceNumber || ""

    await paymentService.recordPayment(
      invoiceId,
      bookingId,
      customerId,
      amount,
      paymentMethod,
      paymentResult.transactionId!,
      provider,
    )

    // Update booking payment status
    await firestore
      .collection("bookings")
      .doc(bookingId)
      .update({
        paymentStatus: paymentMethod === "cash" ? "pending" : "paid",
        paymentMethod,
        updatedAt: new Date().toISOString(),
      })

    return NextResponse.json({
      success: true,
      transactionId: paymentResult.transactionId,
      message: `${paymentMethod === "cash" ? "Cash payment" : "Payment"} processed successfully`,
    })
  } catch (error) {
    console.error("Checkout error:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Checkout failed" }, { status: 500 })
  }
}
