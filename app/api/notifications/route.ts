import { type NextRequest, NextResponse } from "next/server"
import { auth, db } from "@/lib/firebase-admin"

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("Authorization")?.replace("Bearer ", "")
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const decodedToken = await auth.verifyIdToken(token)
    const userId = decodedToken.uid

    const querySnapshot = await db
      .collection("notifications")
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc")
      .limit(50)
      .get()

    const notifications = querySnapshot.docs.map((doc) => doc.data())

    return NextResponse.json({ notifications }, { status: 200 })
  } catch (error) {
    console.error("[v0] Notifications fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 })
  }
}
