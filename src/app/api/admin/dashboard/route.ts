import { type NextRequest, NextResponse } from "next/server"
import { db, auth } from "@/lib/firebase-admin"
import type { User } from "@/lib/types"

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("Authorization")?.replace("Bearer ", "")
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const decodedToken = await auth.verifyIdToken(token)
    const userDoc = await db.collection("users").doc(decodedToken.uid).get()
    const user = userDoc.data() as User

    if (user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Get statistics
    const bookingsSnapshot = await db.collection("bookings").get()
    const vehiclesSnapshot = await db.collection("vehicles").where("available", "==", true).get()
    const driversSnapshot = await db.collection("drivers").where("available", "==", true).get()

    const totalRevenue = bookingsSnapshot.docs
      .filter((doc) => doc.data().paymentStatus === "paid")
      .reduce((sum, doc) => sum + (doc.data().totalPrice || 0), 0)

    return NextResponse.json({
      totalBookings: bookingsSnapshot.size,
      totalRevenue,
      activeVehicles: vehiclesSnapshot.size,
      activeDrivers: driversSnapshot.size,
    })
  } catch (error) {
    console.error("[v0] Dashboard error:", error)
    return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 })
  }
}
