"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { CreditCard, Loader2 } from "lucide-react"
import { FormDescription } from "@/components/ui/form"

interface FlutterwaveCardPaymentProps {
  bookingId: string
  customerId: string
  amount: number
  customerEmail: string
  customerPhone: string
  customerName: string
  onSuccess?: (transactionId: string) => void
  onError?: (error: string) => void
}

export function FlutterwaveCardPayment({
  bookingId,
  customerId,
  amount,
  customerEmail,
  customerPhone,
  customerName,
  onSuccess,
  onError,
}: FlutterwaveCardPaymentProps) {
  const { toast } = useToast()
  const [isProcessing, setIsProcessing] = useState(false)
  const [cardDetails, setCardDetails] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardholderName: "",
  })

  const handlePayment = async () => {
    try {
      setIsProcessing(true)

      // Validate card details
      if (!cardDetails.cardNumber || !cardDetails.expiryDate || !cardDetails.cvv || !cardDetails.cardholderName) {
        toast({
          title: "Error",
          description: "Please fill in all card details",
          variant: "destructive",
        })
        setIsProcessing(false)
        return
      }

      // Validate card number (basic check)
      if (cardDetails.cardNumber.replace(/\s/g, "").length < 13) {
        toast({
          title: "Error",
          description: "Please enter a valid card number",
          variant: "destructive",
        })
        setIsProcessing(false)
        return
      }

      console.log("[v0] Initializing card payment:", { bookingId, amount })

      // Initialize payment with Flutterwave
      const initResponse = await fetch("/api/flutterwave/initialize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookingId,
          customerId,
          amount,
          customerEmail,
          customerPhone,
          customerName,
          paymentMethod: "card",
        }),
      })

      const initData = await initResponse.json()

      if (!initResponse.ok) {
        throw new Error(initData.error || "Payment initialization failed")
      }

      console.log("[v0] Payment link created:", initData.data.link)

      // Redirect to Flutterwave payment page
      window.location.href = initData.data.link
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Payment failed"
      console.error("[v0] Card payment error:", errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
      onError?.(errorMessage)
    } finally {
      setIsProcessing(false)
    }
  }

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "")
    const matches = v.match(/\d{4,16}/g)
    const match = (matches && matches[0]) || ""
    const parts = []

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }

    if (parts.length) {
      return parts.join(" ")
    } else {
      return value
    }
  }

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "")
    if (v.length >= 2) {
      return v.slice(0, 2) + "/" + v.slice(2, 4)
    }
    return v
  }

  return (
    <Card className="w-full p-6 space-y-6">
      <div className="flex items-center gap-2">
        <CreditCard className="w-5 h-5" />
        <h3 className="text-lg font-semibold">Debit/Credit Card</h3>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="cardholder">Cardholder Name</Label>
          <Input
            id="cardholder"
            placeholder="John Doe"
            value={cardDetails.cardholderName}
            onChange={(e) => setCardDetails({ ...cardDetails, cardholderName: e.target.value })}
            disabled={isProcessing}
          />
        </div>

        <div>
          <Label htmlFor="cardnumber">Card Number</Label>
          <Input
            id="cardnumber"
            placeholder="1234 5678 9012 3456"
            value={cardDetails.cardNumber}
            onChange={(e) => setCardDetails({ ...cardDetails, cardNumber: formatCardNumber(e.target.value) })}
            disabled={isProcessing}
            maxLength={19}
          />
          <FormDescription>Enter your 13-16 digit card number</FormDescription>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="expiry">Expiry Date</Label>
            <Input
              id="expiry"
              placeholder="MM/YY"
              value={cardDetails.expiryDate}
              onChange={(e) => setCardDetails({ ...cardDetails, expiryDate: formatExpiryDate(e.target.value) })}
              disabled={isProcessing}
              maxLength={5}
            />
          </div>
          <div>
            <Label htmlFor="cvv">CVV</Label>
            <Input
              id="cvv"
              placeholder="123"
              type="password"
              value={cardDetails.cvv}
              onChange={(e) =>
                setCardDetails({
                  ...cardDetails,
                  cvv: e.target.value.replace(/[^0-9]/g, "").slice(0, 4),
                })
              }
              disabled={isProcessing}
              maxLength={4}
            />
          </div>
        </div>

        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-900">
            You will be redirected to Flutterwave's secure payment page to complete your transaction.
          </p>
        </div>

        <Button onClick={handlePayment} disabled={isProcessing} className="w-full" size="lg">
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            `Pay RWF ${amount.toLocaleString()}`
          )}
        </Button>
      </div>
    </Card>
  )
}
