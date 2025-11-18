"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Smartphone } from "lucide-react"

interface FlutterwaveMomoPaymentProps {
  bookingId: string
  amount: number
  onSuccess?: (transactionId: string) => void
  onError?: (error: string) => void
}

export function FlutterwaveMomoPayment({ bookingId, amount, onSuccess, onError }: FlutterwaveMomoPaymentProps) {
  const [formData, setFormData] = useState({
    provider: "mtn", // mtn or airtel
    phoneNumber: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target
    // Only allow Rwandan phone numbers
    const cleaned = value.replace(/\D/g, "").slice(-9)
    setFormData((prev) => ({
      ...prev,
      phoneNumber: cleaned ? `250${cleaned}` : "",
    }))
  }

  const validateForm = () => {
    if (!formData.provider) {
      setError("Please select a provider (MTN or Airtel)")
      return false
    }
    if (!formData.phoneNumber || formData.phoneNumber.length !== 12) {
      setError("Please enter a valid Rwandan phone number")
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
      const response = await fetch("/api/payments/flutterwave/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId,
          amount,
          paymentMethod: "mobile-money",
          mobileMoneyData: {
            provider: formData.provider,
            phoneNumber: formData.phoneNumber,
          },
        }),
      })

      if (!response.ok) throw new Error("Payment initialization failed")

      const data = await response.json()

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
            <label className="text-sm font-medium">Provider</label>
            <Select value={formData.provider} onValueChange={(v) => setFormData((prev) => ({ ...prev, provider: v }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mtn">MTN Mobile Money</SelectItem>
                <SelectItem value="airtel">Airtel Money</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Smartphone className="w-4 h-4" /> Phone Number
            </label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground font-medium">+</span>
              <Input
                value={formData.phoneNumber}
                onChange={handleInputChange}
                placeholder="250 7xx xxx xxx"
                type="tel"
              />
            </div>
            <p className="text-xs text-muted-foreground">Rwandan phone number</p>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Processing..." : `Pay ${amount.toLocaleString()} RWF`}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            You will receive a prompt on your phone to authorize the payment
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
