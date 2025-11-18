import { db, storage } from "./firebase-admin"
import { cloudinaryService } from "./cloudinary-service"
import type { Driver, DriverAssignment } from "./types"

export const driverService = {
  async createDriver(
    driverData: Omit<
      Driver,
      "id" | "createdAt" | "updatedAt" | "rating" | "totalTrips" | "completedTrips" | "cancelledTrips"
    >,
    profileImageFile?: Buffer,
  ): Promise<Driver> {
    const docRef = db.collection("drivers").doc()
    let profileImageUrl = ""

    if (profileImageFile) {
      try {
        // Upload driver profile image to Cloudinary
        const imageUrls = await cloudinaryService.uploadMultipleImages([profileImageFile], `drivers/${docRef.id}/profile`)
        profileImageUrl = imageUrls[0]
      } catch (error) {
        console.error("[v0] Error uploading driver profile image to Cloudinary:", error)
        throw new Error("Failed to upload driver profile image")
      }
    }

    const driver: Driver = {
      ...driverData,
      id: docRef.id,
      profileImage: profileImageUrl,
      rating: 5,
      totalTrips: 0,
      completedTrips: 0,
      cancelledTrips: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    await docRef.set(driver)
    return driver
  },

  async getDriverById(driverId: string): Promise<Driver | null> {
    const doc = await db.collection("drivers").doc(driverId).get()
    return doc.exists ? (doc.data() as Driver) : null
  },

  async getAllDrivers(): Promise<Driver[]> {
    const querySnapshot = await db.collection("drivers").orderBy("createdAt", "desc").get()

    return querySnapshot.docs.map((doc) => doc.data() as Driver)
  },

  async getAvailableDrivers(): Promise<Driver[]> {
    const querySnapshot = await db.collection("drivers").where("available", "==", true).orderBy("rating", "desc").get()

    return querySnapshot.docs.map((doc) => doc.data() as Driver)
  },

  async updateDriver(driverId: string, updates: Partial<Driver>): Promise<void> {
    await db
      .collection("drivers")
      .doc(driverId)
      .update({
        ...updates,
        updatedAt: new Date().toISOString(),
      })
  },

  async toggleAvailability(driverId: string, available: boolean): Promise<void> {
    await db.collection("drivers").doc(driverId).update({
      available,
      updatedAt: new Date().toISOString(),
    })
  },

  async rateDriver(driverId: string, rating: number): Promise<void> {
    const driver = await this.getDriverById(driverId)
    if (!driver) return

    const currentRating = driver.rating || 5
    const currentTrips = driver.completedTrips || 0
    const newRating = (currentRating * currentTrips + rating) / (currentTrips + 1)

    await this.updateDriver(driverId, {
      rating: Math.round(newRating * 10) / 10,
      completedTrips: currentTrips + 1,
    })
  },

  async assignDriverToBooking(bookingId: string, driverId: string): Promise<DriverAssignment> {
    const docRef = db.collection("driver_assignments").doc()
    const assignment: DriverAssignment = {
      id: docRef.id,
      bookingId,
      driverId,
      assignedAt: new Date().toISOString(),
      status: "assigned",
    }

    await docRef.set(assignment)

    // Update booking with driver ID
    await db.collection("bookings").doc(bookingId).update({
      driverId,
      status: "approved",
    })

    return assignment
  },

  async updateAssignmentStatus(assignmentId: string, status: DriverAssignment["status"]): Promise<void> {
    const assignment = await db.collection("driver_assignments").doc(assignmentId).get()
    if (!assignment.exists) return

    const data = assignment.data() as DriverAssignment

    if (status === "completed") {
      const driver = await this.getDriverById(data.driverId)
      if (driver) {
        await this.updateDriver(data.driverId, {
          completedTrips: (driver.completedTrips || 0) + 1,
        })
      }
    } else if (status === "cancelled") {
      const driver = await this.getDriverById(data.driverId)
      if (driver) {
        await this.updateDriver(data.driverId, {
          cancelledTrips: (driver.cancelledTrips || 0) + 1,
        })
      }
    }

    await db
      .collection("driver_assignments")
      .doc(assignmentId)
      .update({
        status,
        [`${status}At`]: new Date().toISOString(),
      })
  },

  async deleteDriver(driverId: string): Promise<void> {
    const driver = await this.getDriverById(driverId)
    if (!driver) return

    // Delete profile image from Cloudinary
    if (driver.profileImage) {
      try {
        await cloudinaryService.deleteImage(driver.profileImage)
      } catch (error) {
        console.error("[v0] Error deleting driver image from Cloudinary:", error)
      }
    }

    await db.collection("drivers").doc(driverId).delete()
  },
}
