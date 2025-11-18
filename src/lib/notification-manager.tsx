import { firestore } from "@/firebase/firebase-admin"
import type { Notification } from "@/lib/types"

export type NotificationType =
  | "booking_update"
  | "system_alert"
  | "payment_update"
  | "driver_assignment"
  | "cancellation"
export type NotificationChannel = "in-app" | "email" | "sms" | "all"

interface NotificationPayload {
  userId: string
  title: string
  message: string
  type: NotificationType
  channel?: NotificationChannel
  metadata?: Record<string, string>
  bookingId?: string
  driverId?: string
}

interface EmailConfig {
  apiKey: string
  fromAddress: string
  fromName?: string
}

interface SmsConfig {
  accountSid: string
  authToken: string
  fromNumber: string
}

class NotificationManager {
  private emailConfig: EmailConfig | null = null
  private smsConfig: SmsConfig | null = null

  constructor() {
    // Configure email (SendGrid)
    if (process.env.SENDGRID_API_KEY && process.env.SENDGRID_FROM) {
      this.emailConfig = {
        apiKey: process.env.SENDGRID_API_KEY,
        fromAddress: process.env.SENDGRID_FROM,
        fromName: "WeGo",
      }
    }

    // Configure SMS (Twilio)
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_FROM) {
      this.smsConfig = {
        accountSid: process.env.TWILIO_ACCOUNT_SID,
        authToken: process.env.TWILIO_AUTH_TOKEN,
        fromNumber: process.env.TWILIO_FROM,
      }
    }
  }

  // Send in-app notification
  async sendInAppNotification(payload: NotificationPayload): Promise<boolean> {
    try {
      const notification: Notification = {
        id: firestore.collection("notifications").doc().id,
        userId: payload.userId,
        title: payload.title,
        message: payload.message,
        type: payload.type,
        channel: payload.channel || "in-app",
        read: false,
        createdAt: new Date().toISOString(),
      }

      await firestore.collection("notifications").doc(notification.id).set(notification)
      return true
    } catch (error) {
      console.error("Failed to send in-app notification:", error)
      return false
    }
  }

  // Send email notification
  async sendEmailNotification(
    email: string,
    title: string,
    message: string,
    metadata?: Record<string, string>,
  ): Promise<boolean> {
    if (!this.emailConfig) {
      console.warn("Email configuration not available")
      return false
    }

    try {
      // In production, integrate with SendGrid or similar
      // For now, log the email that would be sent
      console.log(`[EMAIL] To: ${email}, Subject: ${title}`)
      console.log(`[EMAIL] Body: ${message}`)

      // Example: You would call SendGrid API here
      // const sgMail = require('@sendgrid/mail');
      // sgMail.setApiKey(this.emailConfig.apiKey);
      // await sgMail.send({
      //   to: email,
      //   from: this.emailConfig.fromAddress,
      //   subject: title,
      //   html: this.getEmailTemplate(message, metadata),
      // });

      return true
    } catch (error) {
      console.error("Failed to send email:", error)
      return false
    }
  }

  // Send SMS notification
  async sendSmsNotification(phoneNumber: string, message: string): Promise<boolean> {
    if (!this.smsConfig) {
      console.warn("SMS configuration not available")
      return false
    }

    try {
      // Validate Rwandan phone number
      const rwandaPhoneRegex = /^(\+250|0)(7[0-9]|6[0-9])\d{7}$/
      if (!rwandaPhoneRegex.test(phoneNumber)) {
        console.warn("Invalid Rwandan phone number:", phoneNumber)
        return false
      }

      // In production, integrate with Twilio or similar
      // For now, log the SMS that would be sent
      console.log(`[SMS] To: ${phoneNumber}`)
      console.log(`[SMS] Message: ${message}`)

      // Example: You would call Twilio API here
      // const twilio = require('twilio')(this.smsConfig.accountSid, this.smsConfig.authToken);
      // await twilio.messages.create({
      //   body: message,
      //   from: this.smsConfig.fromNumber,
      //   to: phoneNumber,
      // });

      return true
    } catch (error) {
      console.error("Failed to send SMS:", error)
      return false
    }
  }

  // Send comprehensive notification (in-app + email + SMS)
  async sendNotification(
    payload: NotificationPayload,
    userEmail?: string,
    userPhone?: string,
  ): Promise<{ inApp: boolean; email: boolean; sms: boolean }> {
    const results = {
      inApp: false,
      email: false,
      sms: false,
    }

    const channel = payload.channel || "all"

    // Send in-app notification
    if (channel === "in-app" || channel === "all") {
      results.inApp = await this.sendInAppNotification(payload)
    }

    // Send email notification
    if ((channel === "email" || channel === "all") && userEmail) {
      results.email = await this.sendEmailNotification(userEmail, payload.title, payload.message, payload.metadata)
    }

    // Send SMS notification
    if ((channel === "sms" || channel === "all") && userPhone) {
      results.sms = await this.sendSmsNotification(userPhone, payload.message)
    }

    return results
  }

  // Send booking confirmation notification
  async sendBookingConfirmation(
    userId: string,
    bookingId: string,
    bookingDetails: {
      carModel: string
      startDate: string
      endDate: string
      totalPrice: number
    },
    userEmail?: string,
    userPhone?: string,
  ): Promise<void> {
    const message = `Your booking for ${bookingDetails.carModel} from ${new Date(bookingDetails.startDate).toLocaleDateString()} to ${new Date(bookingDetails.endDate).toLocaleDateString()} has been confirmed. Total: RWF ${bookingDetails.totalPrice.toLocaleString()}`

    await this.sendNotification(
      {
        userId,
        title: "Booking Confirmed",
        message,
        type: "booking_update",
        channel: "all",
        bookingId,
        metadata: {
          carModel: bookingDetails.carModel,
          totalPrice: bookingDetails.totalPrice.toString(),
        },
      },
      userEmail,
      userPhone,
    )
  }

  // Send payment notification
  async sendPaymentNotification(
    userId: string,
    bookingId: string,
    amount: number,
    paymentStatus: "pending" | "completed" | "failed",
    userEmail?: string,
    userPhone?: string,
  ): Promise<void> {
    const statusMessages = {
      pending: "Your payment is pending",
      completed: "Your payment has been successfully processed",
      failed: "Your payment failed. Please try again",
    }

    await this.sendNotification(
      {
        userId,
        title: `Payment ${paymentStatus}`,
        message: `${statusMessages[paymentStatus]}. Amount: RWF ${amount.toLocaleString()}`,
        type: "payment_update",
        channel: "all",
        bookingId,
        metadata: {
          amount: amount.toString(),
          status: paymentStatus,
        },
      },
      userEmail,
      userPhone,
    )
  }

  // Send driver assignment notification
  async sendDriverAssignment(
    userId: string,
    bookingId: string,
    driverId: string,
    driverDetails: {
      name: string
      phone: string
      rating: number
    },
    userEmail?: string,
    userPhone?: string,
  ): Promise<void> {
    const message = `A driver has been assigned to your booking. Driver: ${driverDetails.name} (★${driverDetails.rating.toFixed(1)}) | Phone: ${driverDetails.phone}`

    await this.sendNotification(
      {
        userId,
        title: "Driver Assigned",
        message,
        type: "driver_assignment",
        channel: "all",
        bookingId,
        driverId,
        metadata: {
          driverName: driverDetails.name,
          driverPhone: driverDetails.phone,
          rating: driverDetails.rating.toString(),
        },
      },
      userEmail,
      userPhone,
    )
  }

  // Send cancellation notification
  async sendCancellationNotification(
    userId: string,
    bookingId: string,
    reason: string,
    refundAmount: number,
    userEmail?: string,
    userPhone?: string,
  ): Promise<void> {
    const message = `Your booking has been cancelled. Reason: ${reason}. Refund: RWF ${refundAmount.toLocaleString()}`

    await this.sendNotification(
      {
        userId,
        title: "Booking Cancelled",
        message,
        type: "cancellation",
        channel: "all",
        bookingId,
        metadata: {
          reason,
          refundAmount: refundAmount.toString(),
        },
      },
      userEmail,
      userPhone,
    )
  }

  // Get email template (for HTML emails)
  private getEmailTemplate(message: string, metadata?: Record<string, string>): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #003d82; color: white; padding: 20px; border-radius: 5px; }
            .content { padding: 20px; }
            .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>WeGo Car Rental</h1>
            </div>
            <div class="content">
              <p>${message}</p>
              ${metadata ? `<pre>${JSON.stringify(metadata, null, 2)}</pre>` : ""}
            </div>
            <div class="footer">
              <p>&copy; 2025 WeGo Car Rental. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `
  }

  // Mark notification as read
  async markNotificationAsRead(notificationId: string): Promise<void> {
    await firestore.collection("notifications").doc(notificationId).update({
      read: true,
      updatedAt: new Date().toISOString(),
    })
  }

  // Get unread notification count
  async getUnreadCount(userId: string): Promise<number> {
    const snapshot = await firestore
      .collection("notifications")
      .where("userId", "==", userId)
      .where("read", "==", false)
      .count()
      .get()

    return snapshot.data().count
  }
}

export const notificationManager = new NotificationManager()
