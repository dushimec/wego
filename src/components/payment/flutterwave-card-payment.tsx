"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CreditCard, Lock } from "lucide-react"

interface FlutterwaveCardPaymentProps {
  bookingId: string
  amount: number
  onSuccess?: (transactionId: string) => void
  onError?: (error: string) => void
}

export function FlutterwaveCardPayment({ bookingId, amount, onSuccess, onError }: FlutterwaveCardPaymentProps) {
  const [formData, setFormData] = useState({
    cardNumber: "",
    cardHolder: "",
    expiryDate: "",
    cvv: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { name, value } = e.target

    // Format card number
    if (name === "cardNumber") {
      value = value
        .replace(/\s/g, "")
        .replace(/(\d{4})/g, "$1 ")
        .trim()
    }

    // Format expiry date
    if (name === "expiryDate") {
      value = value.replace(/\D/g, "")
      if (value.length >= 2) {
        value = value.substring(0, 2) + "/" + value.substring(2, 4)
      }
    }

    // Limit CVV to 4 digits
    if (name === "cvv") {
      value = value.replace(/\D/g, "").substring(0, 4)
    }

    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const validateForm = () => {
    if (!formData.cardNumber.replace(/\s/g, "") || formData.cardNumber.replace(/\s/g, "").length !== 16) {
      setError("Please enter a valid 16-digit card number")
      return false
    }
    if (!formData.cardHolder) {
      setError("Please enter cardholder name")
      return false
    }
    if (!formData.expiryDate || formData.expiryDate.length !== 5) {
      setError("Please enter expiry date (MM/YY)")
      return false
    }
    if (!formData.cvv || formData.cvv.length < 3) {
      setError("Please enter valid CVV")
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!validateForm()) return

    setLoading(true)

    try {
      // Initialize payment with Flutterwave
      const response = await fetch("/api/payments/flutterwave/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId,
          amount,
          paymentMethod: "card",
          cardData: {
            number: formData.cardNumber.replace(/\s/g, ""),
            holder: formData.cardHolder,
            expiry: formData.expiryDate,
            cvv: formData.cvv,
          },
        }),
      })

      if (!response.ok) throw new Error("Payment initialization failed")

      const data = await response.json()

      // Redirect to Flutterwave checkout
      if (data.link) {
        window.location.href = data.link
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Payment failed"
      setError(errorMsg)
      onError?.(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <CreditCard className="w-4 h-4" /> Card Number
            </label>
            <Input
              name="cardNumber"
              value={formData.cardNumber}
              onChange={handleInputChange}
              placeholder="1234 5678 9012 3456"
              maxLength={19}
            />
            <p className="text-xs text-muted-foreground">16-digit card number</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Cardholder Name</label>
            <Input name="cardHolder" value={formData.cardHolder} onChange={handleInputChange} placeholder="John Doe" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Expiry Date</label>
              <Input
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleInputChange}
                placeholder="MM/YY"
                maxLength={5}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Lock className="w-4 h-4" /> CVV
              </label>
              <Input
                name="cvv"
                value={formData.cvv}
                onChange={handleInputChange}
                placeholder="123"
                maxLength={4}
                type="password"
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Processing..." : `Pay ${amount.toLocaleString()} RWF`}
          </Button>

          <p className="text-xs text-center text-muted-foreground">Your payment is secure and encrypted</p>
        </form>
      </CardContent>
    </Card>
  )
}
