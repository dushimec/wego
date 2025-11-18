import { type NextRequest, NextResponse } from "next/server"
import { flutterwaveService } from "@/lib/flutterwave-service"
import { firestore } from "@/firebase/firebase-admin"
import { paymentService } from "@/lib/payment-service"

export async function POST(request: NextRequest) {
  try {
    const { transaction_id, tx_ref } = await request.json()

    if (!transaction_id) {
      return NextResponse.json({ error: "Missing transaction_id" }, { status: 400 })
    }

    console.log("[v0] Verifying payment:", { transaction_id, tx_ref })

    // Verify with Flutterwave
    const verifyResponse = await flutterwaveService.verifyPayment(transaction_id)

    if (verifyResponse.status !== "success") {
      return NextResponse.json({ error: "Verification failed" }, { status: 400 })
    }

    const transactionData = verifyResponse.data

    if (transactionData.status !== "successful") {
      return NextResponse.json({ error: `Payment status: ${transactionData.status}` }, { status: 400 })
    }

    // Get booking details from database
    const paymentRefSnapshot = await firestore
      .collection("payment_references")
      .doc(tx_ref || transactionData.tx_ref)
      .get()

    if (!paymentRefSnapshot.exists) {
      console.error("[v0] Payment reference not found:", tx_ref)
      return NextResponse.json({ error: "Payment reference not found" }, { status: 404 })
    }

    const paymentRefData = paymentRefSnapshot.data()
    const { bookingId, customerId, amount } = paymentRefData

    // Get booking and create invoice
    const bookingSnapshot = await firestore.collection("bookings").doc(bookingId).get()

    if (!bookingSnapshot.exists) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    const booking = bookingSnapshot.data()

    // Create invoice if not exists
    let invoiceId = booking.invoiceNumber
    if (!invoiceId) {
      const invoice = await paymentService.createInvoice(bookingId, customerId, [
        {
          description: `Car rental - ${booking.bookingType}`,
          quantity: 1,
          unitPrice: amount,
        },
      ])
      invoiceId = invoice.id
    }

    // Record payment
    await paymentService.recordPayment(
      invoiceId,
      bookingId,
      customerId,
      amount,
      "card",
      transactionData.flw_ref,
      "flutterwave",
    )

    // Update booking status
    await firestore.collection("bookings").doc(bookingId).update({
      paymentStatus: "paid",
      paymentMethod: paymentRefData.paymentMethod,
      flutterwaveTransactionId: transaction_id,
      updatedAt: new Date().toISOString(),
    })

    // Update payment reference status
    await firestore
      .collection("payment_references")
      .doc(tx_ref || transactionData.tx_ref)
      .update({
        status: "verified",
        flutterwaveTransactionId: transaction_id,
        verifiedAt: new Date().toISOString(),
      })

    console.log("[v0] Payment verified successfully:", { bookingId, amount })

    return NextResponse.json({
      success: true,
      message: "Payment verified successfully",
      bookingId,
      transactionId: transaction_id,
    })
  } catch (error) {
    console.error("[v0] Payment verification error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Payment verification failed" },
      { status: 500 },
    )
  }
}
