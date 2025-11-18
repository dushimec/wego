import type { PaymentRecord, Invoice } from "@/lib/types"
import { firestore } from "@/firebase/firebase-admin"

export type PaymentMethod = "card" | "mobile-money" | "cash" | "bank-transfer"
export type MobileMoneyProvider = "mtn" | "airtel"

interface PaymentConfig {
  stripePublishableKey?: string
  stripeSecretKey?: string
  flutterwave?: {
    publicKey: string
    secretKey: string
  }
  mobileMoney?: {
    mtn?: {
      apiKey: string
      merchantCode: string
    }
    airtel?: {
      apiKey: string
      merchantCode: string
    }
  }
}

class PaymentService {
  private config: PaymentConfig

  constructor(config: PaymentConfig = {}) {
    this.config = {
      stripePublishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      stripeSecretKey: process.env.STRIPE_SECRET_KEY,
      flutterwave: {
        publicKey: process.env.NEXT_PUBLIC_FLUTTERWAVE_KEY || "",
        secretKey: process.env.FLUTTERWAVE_SECRET_KEY || "",
      },
      mobileMoney: {
        mtn: {
          apiKey: process.env.MTN_MONEY_API_KEY || "",
          merchantCode: process.env.MTN_MERCHANT_CODE || "",
        },
        airtel: {
          apiKey: process.env.AIRTEL_MONEY_API_KEY || "",
          merchantCode: process.env.AIRTEL_MERCHANT_CODE || "",
        },
      },
      ...config,
    }
  }

  // Generate invoice number
  async generateInvoiceNumber(): Promise<string> {
    const invoicesRef = firestore.collection("invoices")
    const invoicesCount = await invoicesRef.count().get()
    const timestamp = new Date().getTime()
    return `INV-${timestamp}-${invoicesCount.data().count + 1}`
  }

  // Create invoice for booking
  async createInvoice(
    bookingId: string,
    customerId: string,
    items: Array<{ description: string; quantity: number; unitPrice: number }>,
    taxPercentage = 10,
  ): Promise<Invoice> {
    const invoiceNumber = await this.generateInvoiceNumber()

    const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
    const tax = subtotal * (taxPercentage / 100)
    const total = subtotal + tax

    const invoice: Invoice = {
      id: firestore.collection("invoices").doc().id,
      invoiceNumber,
      bookingId,
      customerId,
      issueDate: new Date().toISOString(),
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      items: items.map((item) => ({
        ...item,
        amount: item.quantity * item.unitPrice,
      })),
      subtotal,
      tax,
      total,
      paidAmount: 0,
      remainingAmount: total,
      status: "issued",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // Save invoice to Firestore
    await firestore.collection("invoices").doc(invoice.id).set(invoice)

    return invoice
  }

  // Process card payment
  async processCardPayment(
    amount: number,
    currency = "RWF",
    metadata: any = {},
  ): Promise<{ success: boolean; transactionId?: string; error?: string }> {
    try {
      // In production, integrate with Stripe or Flutterwave
      // For now, return a mock response
      const transactionId = `CARD-${Date.now()}`

      return {
        success: true,
        transactionId,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Card payment failed",
      }
    }
  }

  // Process mobile money payment (MTN or Airtel)
  async processMobileMoneyPayment(
    phoneNumber: string,
    amount: number,
    provider: MobileMoneyProvider,
    currency = "RWF",
  ): Promise<{ success: boolean; transactionId?: string; error?: string }> {
    try {
      // Validate phone number for Rwandan format
      const rwandaPhoneRegex = /^(\+250|0)(7[0-9]|6[0-9])\d{7}$/
      if (!rwandaPhoneRegex.test(phoneNumber)) {
        return {
          success: false,
          error: "Invalid Rwandan phone number",
        }
      }

      // In production, integrate with MTN or Airtel API
      const transactionId = `${provider.toUpperCase()}-${Date.now()}`

      return {
        success: true,
        transactionId,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : `${provider} payment failed`,
      }
    }
  }

  // Record payment in database
  async recordPayment(
    invoiceId: string,
    bookingId: string,
    customerId: string,
    amount: number,
    method: PaymentMethod,
    transactionId: string,
    provider?: string,
  ): Promise<PaymentRecord> {
    const paymentRecord: PaymentRecord = {
      id: firestore.collection("payments").doc().id,
      invoiceId,
      bookingId,
      customerId,
      amount,
      method,
      provider,
      transactionId,
      status: "completed",
      paymentDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    await firestore.collection("payments").doc(paymentRecord.id).set(paymentRecord)

    // Update invoice paid amount
    const invoiceRef = firestore.collection("invoices").doc(invoiceId)
    const invoiceDoc = await invoiceRef.get()

    if (invoiceDoc.exists) {
      const invoice = invoiceDoc.data() as Invoice
      const newPaidAmount = invoice.paidAmount + amount
      const newRemainingAmount = Math.max(0, invoice.total - newPaidAmount)

      await invoiceRef.update({
        paidAmount: newPaidAmount,
        remainingAmount: newRemainingAmount,
        status: newRemainingAmount === 0 ? "paid" : "partial",
        updatedAt: new Date().toISOString(),
      })
    }

    return paymentRecord
  }

  // Handle refunds
  async processRefund(
    paymentId: string,
    refundAmount: number,
    reason: string,
  ): Promise<{ success: boolean; refundId?: string; error?: string }> {
    try {
      const paymentRef = firestore.collection("payments").doc(paymentId)
      const paymentDoc = await paymentRef.get()

      if (!paymentDoc.exists) {
        return { success: false, error: "Payment not found" }
      }

      const payment = paymentDoc.data() as PaymentRecord

      if (payment.status === "refunded") {
        return { success: false, error: "Payment already refunded" }
      }

      const refundId = `REFUND-${Date.now()}`

      // Update payment record
      await paymentRef.update({
        status: "refunded",
        refundDate: new Date().toISOString(),
        notes: reason,
        updatedAt: new Date().toISOString(),
      })

      // Update booking status
      await firestore.collection("bookings").doc(payment.bookingId).update({
        paymentStatus: "refunded",
        updatedAt: new Date().toISOString(),
      })

      return {
        success: true,
        refundId,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Refund processing failed",
      }
    }
  }
}

export const paymentService = new PaymentService()
