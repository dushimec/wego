import { type NextRequest, NextResponse } from "next/server"
import { cloudinaryService } from "@/lib/cloudinary-service"

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const files: File[] = []

    // Extract files from FormData
    for (const [key, value] of formData.entries()) {
      if (key === "images" && value instanceof File) {
        files.push(value)
      }
    }

    if (files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 })
    }

    if (files.length > 4) {
      return NextResponse.json({ error: "Maximum 4 images allowed per vehicle" }, { status: 400 })
    }

    // Convert files to buffers
    const buffers = await Promise.all(files.map((file) => file.arrayBuffer().then((buffer) => Buffer.from(buffer))))

    // Upload to Cloudinary
    const imageUrls = await cloudinaryService.uploadMultipleImages(buffers, `car-rentals/${Date.now()}`)

    return NextResponse.json({ imageUrls })
  } catch (error) {
    console.error("[v0] Image upload error:", error)
    return NextResponse.json({ error: "Failed to upload images" }, { status: 500 })
  }
}
