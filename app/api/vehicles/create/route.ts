import { type NextRequest, NextResponse } from "next/server"
import { vehicleService } from "@/lib/vehicle-service"
import { auth } from "@/lib/firebase-admin"

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("Authorization")?.replace("Bearer ", "")
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const decodedToken = await auth.verifyIdToken(token)
    const userId = decodedToken.uid

    const formData = await request.formData()
    const images: Buffer[] = []

    for (const [key, value] of formData.entries()) {
      if (key === "images" && value instanceof File) {
        images.push(Buffer.from(await value.arrayBuffer()))
      }
    }

    const vehicleData = {
      brand: formData.get("brand") as string,
      model: formData.get("model") as string,
      year: Number.parseInt(formData.get("year") as string),
      category: formData.get("category") as any,
      fuelType: formData.get("fuelType") as any,
      transmission: formData.get("transmission") as any,
      seats: Number.parseInt(formData.get("seats") as string),
      pricePerDay: Number.parseInt(formData.get("pricePerDay") as string),
      registrationNumber: formData.get("registrationNumber") as string,
      registrationExpiry: formData.get("registrationExpiry") as string,
      description: formData.get("description") as string,
      features: JSON.parse((formData.get("features") as string) || "[]"),
      images: [],
      location: "Kigali",
      available: true,
    }

    const vehicle = await vehicleService.createVehicle(userId, vehicleData, images)

    return NextResponse.json({ vehicle }, { status: 201 })
  } catch (error) {
    console.error("[v0] Vehicle creation error:", error)
    return NextResponse.json({ error: "Creation failed" }, { status: 500 })
  }
}
