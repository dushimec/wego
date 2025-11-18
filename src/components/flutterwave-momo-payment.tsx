"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/hooks/use-toast"
import { Smartphone, Loader2 } from "lucide-react"
import { FormDescription } from "@/components/ui/form"

interface FlutterwaveMomoPaymentProps {
  bookingId: string
  customerId: string
  amount: number
  customerEmail: string
  customerPhone: string
  customerName: string
  onSuccess?: (transactionId: string) => void
  onError?: (error: string) => void
}

export function FlutterwaveMomoPayment({
  bookingId,
  customerId,
  amount,
  customerEmail,
  customerPhone,
  customerName,
  onSuccess,
  onError,
}: FlutterwaveMomoPaymentProps) {
  const { toast } = useToast()
  const [isProcessing, setIsProcessing] = useState(false)
  const [momoProvider, setMomoProvider] = useState<"mtn" | "airtel">("mtn")
  const [phoneNumber, setPhoneNumber] = useState(customerPhone)

  const handlePayment = async () => {
    try {
      setIsProcessing(true)

      // Validate phone number
      if (!phoneNumber) {
        toast({
          title: "Error",
          description: "Please enter your phone number",
          variant: "destructive",
        })
        setIsProcessing(false)
        return
      }

      // Validate Rwanda phone format
      const rwandaPhoneRegex = /^(\+250|0)(7[0-9]|6[0-9])\d{7}$/
      if (!rwandaPhoneRegex.test(phoneNumber)) {
        toast({
          title: "Error",
          description: "Please enter a valid Rwandan phone number (e.g., +250 7XX XXX XXX)",
          variant: "destructive",
        })
        setIsProcessing(false)
        return
      }

      console.log("[v0] Initializing mobile money payment:", {
        bookingId,
        amount,
        provider: momoProvider,
      })

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
          customerPhone: phoneNumber,
          customerName,
          paymentMethod: "momo",
        }),
      })

      const initData = await initResponse.json()

      if (!initResponse.ok) {
        throw new Error(initData.error || "Payment initialization failed")
      }

      console.log("[v0] Payment link created for mobile money:", initData.data.link)

      // Redirect to Flutterwave payment page
      window.location.href = initData.data.link
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Payment failed"
      console.error("[v0] Mobile money payment error:", errorMessage)
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

  const formatPhoneNumber = (value: string) => {
    // Remove non-digit characters except +
    let v = value.replace(/[^\d+]/g, "")
    // Ensure it starts with + or 0
    if (!v.startsWith("+") && !v.startsWith("0")) {
      v = "+250" + v
    }
    return v
  }

  return (
    <Card className="w-full p-6 space-y-6">
      <div className="flex items-center gap-2">
        <Smartphone className="w-5 h-5" />
        <h3 className="text-lg font-semibold">Mobile Money</h3>
      </div>

      <div className="space-y-4">
        <div>
          <Label className="mb-3 block font-medium">Select Mobile Provider</Label>
          <RadioGroup value={momoProvider} onValueChange={(v: any) => setMomoProvider(v)}>
            <div
              className="flex items-center space-x-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors"
              onClick={() => setMomoProvider("mtn")}
            >
              <RadioGroupItem value="mtn" id="mtn" />
              <div className="flex-1">
                <Label htmlFor="mtn" className="cursor-pointer font-medium">
                  MTN Mobile Money
                </Label>
                <FormDescription>Send money via MTN USSD or app</FormDescription>
              </div>
            </div>

            <div
              className="flex items-center space-x-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors"
              onClick={() => setMomoProvider("airtel")}
            >
              <RadioGroupItem value="airtel" id="airtel" />
              <div className="flex-1">
                <Label htmlFor="airtel" className="cursor-pointer font-medium">
                  Airtel Money
                </Label>
                <FormDescription>Send money via Airtel Money</FormDescription>
              </div>
            </div>
          </RadioGroup>
        </div>

        <div className="border-t pt-4">
          <Label htmlFor="phone">{momoProvider === "mtn" ? "MTN" : "Airtel"} Phone Number</Label>
          <Input
            id="phone"
            placeholder="+250 7XX XXX XXX or 07XX XXX XXX"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(formatPhoneNumber(e.target.value))}
            disabled={isProcessing}
            type="tel"
          />
          <FormDescription>
            Enter the {momoProvider === "mtn" ? "MTN" : "Airtel"} registered phone number associated with your account
          </FormDescription>
        </div>

        <div className="p-4 bg-green-50 rounded-lg border border-green-200 space-y-2">
          <p className="text-sm font-medium text-green-900">How it works:</p>
          <ul className="text-sm text-green-800 list-disc list-inside space-y-1">
            <li>Click "Pay Now" to initiate the payment</li>
            <li>You will be redirected to Flutterwave's secure payment page</li>
            <li>Follow the prompts to complete your {momoProvider === "mtn" ? "MTN" : "Airtel"} payment</li>
            <li>Your booking will be confirmed once payment is successful</li>
          </ul>
        </div>

        <Button onClick={handlePayment} disabled={isProcessing} className="w-full" size="lg">
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Initializing Payment...
            </>
          ) : (
            `Pay RWF ${amount.toLocaleString()} with ${momoProvider.toUpperCase()}`
          )}
        </Button>
      </div>
    </Card>
  )
}
