import { db, storage } from "./firebase-admin"
import { cloudinaryService } from "./cloudinary-service"
import type { Car } from "./types"

export const vehicleService = {
  async createVehicle(
    ownerId: string,
    vehicleData: Omit<Car, "id" | "createdAt" | "updatedAt">,
    imageFiles: Buffer[] = [],
  ): Promise<Car> {
    const docRef = db.collection("vehicles").doc()
    let imageUrls: string[] = vehicleData.images || []

    // Upload car images to Cloudinary only if files are provided (server-side upload)
    if (imageFiles.length > 0) {
      try {
        const urls = await cloudinaryService.uploadMultipleImages(imageFiles, `car-rentals/vehicles/${docRef.id}`)
        imageUrls = urls
      } catch (error) {
        console.error("[v0] Error uploading vehicle images to Cloudinary:", error)
        throw new Error("Failed to upload vehicle images")
      }
    }

    // If no images array was provided but we have URLs, use the first URL as the primary one
    const cloudinaryUrl = imageUrls.length > 0 ? imageUrls[0] : undefined

    const vehicle: Car = {
      ...vehicleData,
      id: docRef.id,
      ownerId,
      images: imageUrls,
      cloudinaryUrl,
      fileUrl: cloudinaryUrl,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    await docRef.set(vehicle)
    return vehicle
  },

  async getVehicleById(vehicleId: string): Promise<Car | null> {
    const doc = await db.collection("vehicles").doc(vehicleId).get()
    return doc.exists ? (doc.data() as Car) : null
  },

  async getVehiclesByOwner(ownerId: string): Promise<Car[]> {
    const querySnapshot = await db
      .collection("vehicles")
      .where("ownerId", "==", ownerId)
      .orderBy("createdAt", "desc")
      .get()

    return querySnapshot.docs.map((doc) => doc.data() as Car)
  },

  async getAllAvailableVehicles(): Promise<Car[]> {
    const querySnapshot = await db
      .collection("vehicles")
      .where("available", "==", true)
      .orderBy("createdAt", "desc")
      .get()

    return querySnapshot.docs.map((doc) => doc.data() as Car)
  },

  async updateVehicle(vehicleId: string, updates: Partial<Car>): Promise<void> {
    await db
      .collection("vehicles")
      .doc(vehicleId)
      .update({
        ...updates,
        updatedAt: new Date().toISOString(),
      })
  },

  async toggleAvailability(vehicleId: string, available: boolean, reason?: string): Promise<void> {
    await db.collection("vehicles").doc(vehicleId).update({
      available,
      unavailabilityReason: reason,
      updatedAt: new Date().toISOString(),
    })
  },

  async deleteVehicle(vehicleId: string): Promise<void> {
    const vehicle = await this.getVehicleById(vehicleId)
    if (!vehicle) return

    // Delete images from Cloudinary
    for (const imageUrl of vehicle.images) {
      try {
        await cloudinaryService.deleteImage(imageUrl)
      } catch (error) {
        console.error("[v0] Error deleting vehicle image from Cloudinary:", error)
      }
    }

    await db.collection("vehicles").doc(vehicleId).delete()
  },

  async checkAvailability(vehicleId: string, startDate: string, endDate: string): Promise<boolean> {
    const querySnapshot = await db
      .collection("bookings")
      .where("carId", "==", vehicleId)
      .where("status", "in", ["pending", "approved", "in-progress"])
      .get()

    const start = new Date(startDate)
    const end = new Date(endDate)

    return !querySnapshot.docs.some((doc) => {
      const booking = doc.data()
      const bookingStart = new Date(booking.startDate)
      const bookingEnd = new Date(booking.endDate)
      return !(end <= bookingStart || start >= bookingEnd)
    })
  },
}
