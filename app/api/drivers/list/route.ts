import { NextResponse } from "next/server";
import { driverService } from "@/lib/driver-service";

export async function GET() {
  try {
    const drivers = await driverService.getAllDrivers();
    return NextResponse.json({ drivers });
  } catch (error) {
    console.error("[v0] Error fetching drivers:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
