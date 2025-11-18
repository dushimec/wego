import { type NextRequest, NextResponse } from "next/server"
import { driverService } from "@/lib/driver-service"
import { auth } from "@/lib/firebase-admin"

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("Authorization")?.replace("Bearer ", "")
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const decodedToken = await auth.verifyIdToken(token)

    const formData = await request.formData()
    let profileImageBuffer: Buffer | undefined

    const profileImage = formData.get("profileImage") as File
    if (profileImage) {
      profileImageBuffer = Buffer.from(await profileImage.arrayBuffer())
    }

    const driverData = {
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      licenseNumber: formData.get("licenseNumber") as string,
      licenseExpiry: formData.get("licenseExpiry") as string,
      address: formData.get("address") as string,
      profileImage: "",
      documents: [],
      experience: Number.parseInt(formData.get("experience") as string),
      languages: JSON.parse((formData.get("languages") as string) || '["English"]'),
      available: true,
      bio: formData.get("bio") as string,
    }

    const driver = await driverService.createDriver(driverData, profileImageBuffer)

    return NextResponse.json({ driver }, { status: 201 })
  } catch (error) {
    console.error("[v0] Driver creation error:", error)
    return NextResponse.json({ error: "Creation failed" }, { status: 500 })
  }
}
