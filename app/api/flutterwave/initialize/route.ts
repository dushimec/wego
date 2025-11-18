import { type NextRequest, NextResponse } from "next/server"
import { flutterwaveService } from "@/lib/flutterwave-service"
import { firestore } from "@/firebase/firebase-admin"

export async function POST(request: NextRequest) {
  try {
    const { bookingId, customerId, amount, customerEmail, customerPhone, customerName, paymentMethod } =
      await request.json()

    // Validate required fields
    if (!bookingId || !customerId || !amount || !customerEmail || !customerPhone || !customerName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Create payment reference
    const tx_ref = flutterwaveService.createPaymentReference(bookingId)

    // Determine payment options based on method
    let paymentOptions = "card,mobilemoneyuganda,ussd,banktransfer"
    if (paymentMethod === "card") {
      paymentOptions = "card"
    } else if (paymentMethod === "momo") {
      paymentOptions = "mobilemoneyrwanda"
    }

    // Initialize payment with Flutterwave
    const initResponse = await flutterwaveService.initializePayment({
      tx_ref,
      amount,
      currency: "RWF",
      payment_options: paymentOptions,
      redirect_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment-callback`,
      customer: {
        email: customerEmail,
        phonenumber: customerPhone,
        name: customerName,
      },
      customizations: {
        title: "WeGo Car Rental",
        description: `Payment for booking ${bookingId}`,
        logo: `${process.env.NEXT_PUBLIC_APP_URL}/logo.png`,
      },
      meta: {
        bookingId,
        customerId,
        paymentMethod,
      },
    })

    // Store payment reference in database
    await firestore
      .collection("payment_references")
      .doc(tx_ref)
      .set({
        tx_ref,
        bookingId,
        customerId,
        amount,
        currency: "RWF",
        paymentMethod,
        status: "initialized",
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
      })

    console.log("[v0] Payment initialization successful:", { tx_ref, amount })

    return NextResponse.json({
      success: true,
      data: initResponse.data,
      tx_ref,
    })
  } catch (error) {
    console.error("[v0] Payment initialization error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Payment initialization failed" },
      { status: 500 },
    )
  }
}
