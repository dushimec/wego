import { db } from "./firebase-admin"
import type { Notification } from "./types"

export const notificationService = {
  async createNotification(
    userId: string,
    title: string,
    message: string,
    type: Notification["type"],
    channel: Notification["channel"] = "in-app",
  ): Promise<Notification> {
    const docRef = db.collection("notifications").doc()
    const notification: Notification = {
      id: docRef.id,
      userId,
      title,
      message,
      type,
      channel,
      read: false,
      createdAt: new Date().toISOString(),
      processed: false,
    }

    await docRef.set(notification)
    return notification
  },

  async getNotificationsByUserId(userId: string, unreadOnly = false): Promise<Notification[]> {
    let query = db.collection("notifications").where("userId", "==", userId)

    if (unreadOnly) {
      query = query.where("read", "==", false)
    }

    const querySnapshot = await query.orderBy("createdAt", "desc").get()
    return querySnapshot.docs.map((doc) => doc.data() as Notification)
  },

  async markAsRead(notificationId: string): Promise<void> {
    await db.collection("notifications").doc(notificationId).update({
      read: true,
      updatedAt: new Date().toISOString(),
    })
  },

  async deleteNotification(notificationId: string): Promise<void> {
    await db.collection("notifications").doc(notificationId).delete()
  },

  async notifyBookingConfirmation(bookingId: string, customerId: string, amount: number): Promise<void> {
    await this.createNotification(
      customerId,
      "Booking Confirmed",
      `Your booking has been confirmed. Amount: ${amount.toLocaleString()} RWF. Booking ID: ${bookingId.substring(0, 8)}`,
      "booking_update",
    )
  },

  async notifyPaymentUpdate(customerId: string, amount: number, status: string): Promise<void> {
    await this.createNotification(
      customerId,
      `Payment ${status}`,
      `Your payment of ${amount.toLocaleString()} RWF has been ${status}.`,
      "payment_update",
    )
  },

  async notifyDriverAssignment(customerId: string, driverName: string): Promise<void> {
    await this.createNotification(
      customerId,
      "Driver Assigned",
      `Your driver ${driverName} has been assigned to your booking.`,
      "driver_assignment",
    )
  },

  async notifyBookingCancellation(customerId: string, reason: string): Promise<void> {
    await this.createNotification(
      customerId,
      "Booking Cancelled",
      `Your booking has been cancelled. Reason: ${reason}`,
      "cancellation",
    )
  },
}
