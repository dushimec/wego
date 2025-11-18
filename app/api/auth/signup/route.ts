import { type NextRequest, NextResponse } from "next/server"
import { authService } from "@/lib/auth-service"

export async function POST(request: NextRequest) {
  try {
    const { displayName, email, phoneNumber, password } = await request.json()

    if (!displayName || !email || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const { uid, user } = await authService.createUser(email, password, displayName, phoneNumber)

    return NextResponse.json({ uid, user }, { status: 201 })
  } catch (error) {
    console.error("[v0] Signup error:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Signup failed" }, { status: 400 })
  }
}
