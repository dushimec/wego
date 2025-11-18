import { type NextRequest, NextResponse } from "next/server"
import { bookingService } from "@/lib/booking-service"
import { invoiceService } from "@/lib/invoice-service"
import { auth } from "@/lib/firebase-admin"

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("Authorization")?.replace("Bearer ", "")
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decodedToken = await auth.verifyIdToken(token)
    const customerId = decodedToken.uid

    const bookingData = await request.json()

    const booking = await bookingService.createBooking({
      ...bookingData,
      customerId,
      status: "pending",
      paymentStatus: "pending",
    })

    // Generate invoice
    await invoiceService.generateInvoice(booking)

    return NextResponse.json({ bookingId: booking.id }, { status: 201 })
  } catch (error) {
    console.error("[v0] Booking creation error:", error)
    return NextResponse.json({ error: "Booking creation failed" }, { status: 500 })
  }
}
