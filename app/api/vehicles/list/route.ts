import { type NextRequest, NextResponse } from "next/server"
import { vehicleService } from "@/lib/vehicle-service"
import { auth } from "@/lib/firebase-admin"

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("Authorization")?.replace("Bearer ", "")
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decodedToken = await auth.verifyIdToken(token)
    const ownerId = decodedToken.uid

    const vehicles = await vehicleService.getVehiclesByOwner(ownerId)

    return NextResponse.json({ vehicles }, { status: 200 })
  } catch (error) {
    console.error("Error fetching vehicles:", error)
    return NextResponse.json({ error: "Failed to fetch vehicles" }, { status: 500 })
  }
}
