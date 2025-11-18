import axios, { type AxiosInstance } from "axios"

export type FlutterwavePaymentMethod =
  | "card"
  | "mobile_money_uganda"
  | "mobile_money_rwanda"
  | "mobile_money_tanzania"
  | "mobile_money_kenya"
  | "ussd"
  | "bank_transfer"

interface FlutterwaveConfig {
  publicKey: string
  secretKey: string
  baseUrl: string
}

interface FlutterwaveCustomer {
  email: string
  phonenumber: string
  name: string
}

interface FlutterwavePaymentPayload {
  tx_ref: string
  amount: number
  currency: string
  payment_options: string
  redirect_url?: string
  customer: FlutterwaveCustomer
  customizations: {
    title: string
    description: string
    logo?: string
  }
  meta?: {
    bookingId?: string
    customerId?: string
    paymentMethod?: string
  }
}

interface FlutterwaveVerifyResponse {
  status: string
  message: string
  data: {
    id: number
    tx_ref: string
    flw_ref: string
    device_fingerprint: string
    amount: number
    currency: string
    charged_amount: number
    app_fee: number
    merchant_fee: number
    processor_response: string
    auth_model: string
    currency_symbol: string
    customer: {
      id: number
      customer_code: string
      email: string
      name: string
      phone_number: string
    }
    payment_type: string
    plan_name: string | null
    plan: string | null
    order_id: string | null
    payment_page: string | null
    paymentplan: string | null
    settlement_token: string | null
    risk_assessment: string | null
    settlement_account: string | null
    meta: any
    status: "successful" | "pending" | "failed"
    created_at: string
  }
}

interface FlutterwaveInitializeResponse {
  status: string
  message: string
  data: {
    link: string
  }
}

class FlutterwaveService {
  private apiClient: AxiosInstance
  private config: FlutterwaveConfig

  constructor() {
    const secretKey = process.env.FLUTTERWAVE_SECRET_KEY
    const baseUrl = process.env.FLUTTERWAVE_API_URL || "https://api.flutterwave.com/v3"

    if (!secretKey) {
      throw new Error("FLUTTERWAVE_SECRET_KEY is not set in environment variables")
    }

    this.config = {
      publicKey: process.env.NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY || "",
      secretKey,
      baseUrl,
    }

    this.apiClient = axios.create({
      baseURL: this.config.baseUrl,
      headers: {
        Authorization: `Bearer ${this.config.secretKey}`,
        "Content-Type": "application/json",
      },
    })
  }

  /**
   * Initialize a payment transaction
   * Used for card and mobile money payments
   */
  async initializePayment(payload: FlutterwavePaymentPayload): Promise<FlutterwaveInitializeResponse> {
    try {
      const response = await this.apiClient.post<FlutterwaveInitializeResponse>("/payments", payload)

      console.log("[v0] Flutterwave payment initialized:", response.data)
      return response.data
    } catch (error) {
      console.error("[v0] Flutterwave initialization error:", error)
      throw this.handleError(error)
    }
  }

  /**
   * Verify a completed payment transaction
   */
  async verifyPayment(transactionId: string): Promise<FlutterwaveVerifyResponse> {
    try {
      const response = await this.apiClient.get<FlutterwaveVerifyResponse>(`/transactions/${transactionId}/verify`)

      console.log("[v0] Flutterwave payment verified:", response.data)
      return response.data
    } catch (error) {
      console.error("[v0] Flutterwave verification error:", error)
      throw this.handleError(error)
    }
  }

  /**
   * Process a refund for a completed transaction
   */
  async refundPayment(transactionId: string, amount?: number): Promise<any> {
    try {
      const payload = amount ? { amount } : {}

      const response = await this.apiClient.post(`/transactions/${transactionId}/refund`, payload)

      console.log("[v0] Flutterwave refund processed:", response.data)
      return response.data
    } catch (error) {
      console.error("[v0] Flutterwave refund error:", error)
      throw this.handleError(error)
    }
  }

  /**
   * Get payment status
   */
  async getPaymentStatus(transactionId: string): Promise<any> {
    try {
      const response = await this.apiClient.get(`/transactions/${transactionId}`)
      return response.data
    } catch (error) {
      console.error("[v0] Error fetching payment status:", error)
      throw this.handleError(error)
    }
  }

  /**
   * Handle API errors
   */
  private handleError(error: any): Error {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message || error.message
      return new Error(`Flutterwave API Error: ${message}`)
    }
    return new Error(`Flutterwave Service Error: ${error instanceof Error ? error.message : "Unknown error"}`)
  }

  /**
   * Get public key for client-side integration
   */
  getPublicKey(): string {
    return this.config.publicKey
  }

  /**
   * Create payment reference
   */
  createPaymentReference(bookingId: string): string {
    return `WGO-${bookingId}-${Date.now()}`
  }
}

export const flutterwaveService = new FlutterwaveService()
