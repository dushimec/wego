import { db } from "./firebase-admin"
import type { Invoice, Booking } from "./types"

export const invoiceService = {
  async generateInvoice(booking: Booking): Promise<Invoice> {
    const invoiceNumber = `INV-${Date.now()}-${booking.id.slice(0, 8)}`
    const docRef = db.collection("invoices").doc()

    const invoice: Invoice = {
      id: docRef.id,
      invoiceNumber,
      bookingId: booking.id,
      customerId: booking.customerId,
      issueDate: new Date().toISOString(),
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      items: [
        {
          description: `Car rental (${booking.bookingType})`,
          quantity: 1,
          unitPrice: booking.basePrice,
          amount: booking.basePrice,
        },
        ...(booking.extras?.map((extra) => ({
          description: `Add-on: ${extra.extraId}`,
          quantity: extra.quantity,
          unitPrice: extra.price,
          amount: extra.price * extra.quantity,
        })) || []),
      ],
      subtotal: booking.basePrice + (booking.extras?.reduce((sum, e) => sum + e.price * e.quantity, 0) || 0),
      tax: booking.taxAmount,
      total: booking.totalPrice,
      paidAmount: 0,
      remainingAmount: booking.totalPrice,
      status: "issued",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    await docRef.set(invoice)
    return invoice
  },

  async getInvoiceById(invoiceId: string): Promise<Invoice | null> {
    const doc = await db.collection("invoices").doc(invoiceId).get()
    return doc.exists ? (doc.data() as Invoice) : null
  },

  async updateInvoicePayment(invoiceId: string, paidAmount: number): Promise<void> {
    const invoice = await this.getInvoiceById(invoiceId)
    if (!invoice) return

    const newPaidAmount = invoice.paidAmount + paidAmount
    const remainingAmount = invoice.total - newPaidAmount
    const status = remainingAmount <= 0 ? "paid" : newPaidAmount > 0 ? "partial" : "issued"

    await db
      .collection("invoices")
      .doc(invoiceId)
      .update({
        paidAmount: newPaidAmount,
        remainingAmount: Math.max(0, remainingAmount),
        status,
        updatedAt: new Date().toISOString(),
      })
  },
}
