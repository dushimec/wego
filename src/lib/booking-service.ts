import { db } from "./firebase-admin"
import type { Booking } from "./types"

export const bookingService = {
  async createBooking(bookingData: Omit<Booking, "id" | "createdAt" | "updatedAt">): Promise<Booking> {
    const docRef = db.collection("bookings").doc()
    const booking: Booking = {
      ...bookingData,
      id: docRef.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    await docRef.set(booking)
    return booking
  },

  async getBookingById(bookingId: string): Promise<Booking | null> {
    const doc = await db.collection("bookings").doc(bookingId).get()
    return doc.exists ? (doc.data() as Booking) : null
  },

  async getBookingsByCustomerId(customerId: string): Promise<Booking[]> {
    const querySnapshot = await db
      .collection("bookings")
      .where("customerId", "==", customerId)
      .orderBy("createdAt", "desc")
      .get()

    return querySnapshot.docs.map((doc) => doc.data() as Booking)
  },

  async updateBookingStatus(bookingId: string, status: Booking["status"]): Promise<void> {
    await db.collection("bookings").doc(bookingId).update({
      status,
      updatedAt: new Date().toISOString(),
    })
  },

  async cancelBooking(bookingId: string, reason: string): Promise<void> {
    await db.collection("bookings").doc(bookingId).update({
      status: "cancelled",
      cancellationReason: reason,
      cancellationDate: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
  },

  calculatePricing(
    basePrice: number,
    startDate: string,
    endDate: string,
    extras: { price: number }[] = [],
    taxRate = 0.18,
  ): { basePrice: number; extrasTotal: number; subtotal: number; taxAmount: number; totalPrice: number } {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) || 1

    const baseCost = basePrice * days
    const extrasTotal = extras.reduce((sum, extra) => sum + extra.price, 0)
    const subtotal = baseCost + extrasTotal
    const taxAmount = subtotal * taxRate
    const totalPrice = subtotal + taxAmount

    return {
      basePrice: baseCost,
      extrasTotal,
      subtotal,
      taxAmount,
      totalPrice,
    }
  },
}
