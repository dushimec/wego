import { type NextRequest, NextResponse } from "next/server"
import { flutterwaveService } from "@/lib/flutterwave-service"
import { paymentService } from "@/lib/payment-service"
import { auth, db } from "@/lib/firebase-admin"
import type { User, Booking } from "@/lib/types"

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("Authorization")?.replace("Bearer ", "")
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const decodedToken = await auth.verifyIdToken(token)
    const userId = decodedToken.uid

    const { bookingId, amount, paymentMethod, cardData, mobileMoneyData } = await request.json()

    // Get user and booking data
    const userDoc = await db.collection("users").doc(userId).get()
    const user = userDoc.data() as User

    const bookingDoc = await db.collection("bookings").doc(bookingId).get()
    const booking = bookingDoc.data() as Booking

    if (!user || !booking || booking.customerId !== userId) {
      return NextResponse.json({ error: "Invalid booking" }, { status: 400 })
    }

    // Initialize Flutterwave payment
    const paymentResponse = await flutterwaveService.initializePayment(
      amount,
      user.email,
      user.phoneNumber || "",
      bookingId,
      user.displayName,
    )

    // Create payment record
    const paymentRecord = await paymentService.createPaymentRecord(
      bookingId,
      userId,
      amount,
      paymentMethod as any,
      paymentResponse.reference,
    )

    return NextResponse.json({ link: paymentResponse.link, reference: paymentResponse.reference }, { status: 200 })
  } catch (error) {
    console.error("[v0] Payment initialization error:", error)
    return NextResponse.json({ error: "Payment initialization failed" }, { status: 500 })
  }
}
