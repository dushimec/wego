"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { CreditCard, Smartphone, Banknote } from "lucide-react"
import { FormDescription } from "@/components/ui/form"

interface PaymentCheckoutProps {
  bookingId: string
  customerId: string
  amount: number
  onSuccess?: (transactionId: string) => void
  onError?: (error: string) => void
}

export function PaymentCheckout({ bookingId, customerId, amount, onSuccess, onError }: PaymentCheckoutProps) {
  const { toast } = useToast()
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<"card" | "mobile-money" | "cash">("card")
  const [mobileProvider, setMobileProvider] = useState<"mtn" | "airtel">("mtn")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [cardDetails, setCardDetails] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
  })

  const handlePayment = async () => {
    try {
      setIsProcessing(true)

      // Validate input
      if (paymentMethod === "mobile-money" && !phoneNumber) {
        toast({
          title: "Error",
          description: "Please enter your phone number",
          variant: "destructive",
        })
        setIsProcessing(false)
        return
      }

      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookingId,
          customerId,
          amount,
          paymentMethod,
          provider: mobileProvider,
          phoneNumber,
          metadata: {
            cardNumber: cardDetails.cardNumber?.slice(-4),
          },
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Payment failed")
      }

      toast({
        title: "Success",
        description: data.message,
      })

      onSuccess?.(data.transactionId)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Payment failed"
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

  return (
    <Card className="w-full p-6">
      <h2 className="text-2xl font-bold mb-6">Payment Information</h2>

      <div className="mb-6 p-4 bg-secondary/5 rounded-lg">
        <p className="text-sm text-muted-foreground">Total Amount</p>
        <p className="text-3xl font-bold">RWF {amount.toLocaleString()}</p>
      </div>

      <Tabs value={paymentMethod} onValueChange={(v: any) => setPaymentMethod(v)}>
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="card" className="flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            <span className="hidden sm:inline">Card</span>
          </TabsTrigger>
          <TabsTrigger value="mobile-money" className="flex items-center gap-2">
            <Smartphone className="w-4 h-4" />
            <span className="hidden sm:inline">Mobile Money</span>
          </TabsTrigger>
          <TabsTrigger value="cash" className="flex items-center gap-2">
            <Banknote className="w-4 h-4" />
            <span className="hidden sm:inline">Cash</span>
          </TabsTrigger>
        </TabsList>

        {/* Card Payment */}
        <TabsContent value="card" className="space-y-4">
          <div>
            <Label>Card Number</Label>
            <Input
              placeholder="1234 5678 9012 3456"
              value={cardDetails.cardNumber}
              onChange={(e) => setCardDetails({ ...cardDetails, cardNumber: e.target.value })}
              disabled={isProcessing}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Expiry Date</Label>
              <Input
                placeholder="MM/YY"
                value={cardDetails.expiryDate}
                onChange={(e) => setCardDetails({ ...cardDetails, expiryDate: e.target.value })}
                disabled={isProcessing}
              />
            </div>
            <div>
              <Label>CVV</Label>
              <Input
                placeholder="123"
                type="password"
                value={cardDetails.cvv}
                onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                disabled={isProcessing}
              />
            </div>
          </div>
        </TabsContent>

        {/* Mobile Money Payment */}
        <TabsContent value="mobile-money" className="space-y-4">
          <div>
            <Label className="mb-3 block">Select Provider</Label>
            <RadioGroup value={mobileProvider} onValueChange={(v: any) => setMobileProvider(v)}>
              <div className="flex items-center space-x-2 mb-3 p-3 border rounded-lg cursor-pointer">
                <RadioGroupItem value="mtn" id="mtn" />
                <Label htmlFor="mtn" className="cursor-pointer flex-1">
                  MTN Mobile Money
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer">
                <RadioGroupItem value="airtel" id="airtel" />
                <Label htmlFor="airtel" className="cursor-pointer flex-1">
                  Airtel Money
                </Label>
              </div>
            </RadioGroup>
          </div>
          <div>
            <Label>Phone Number</Label>
            <Input
              placeholder="+250 7XX XXX XXX"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              disabled={isProcessing}
            />
            <FormDescription>
              Enter your {mobileProvider === "mtn" ? "MTN" : "Airtel"} registered phone number
            </FormDescription>
          </div>
        </TabsContent>

        {/* Cash Payment */}
        <TabsContent value="cash" className="space-y-4">
          <Card className="p-4 bg-blue-50">
            <p className="text-sm">
              You have selected cash payment. You will pay RWF {amount.toLocaleString()} upon delivery or at the pickup
              location.
            </p>
          </Card>
        </TabsContent>
      </Tabs>

      <Button onClick={handlePayment} disabled={isProcessing} className="w-full mt-6" size="lg">
        {isProcessing ? "Processing..." : `Pay RWF ${amount.toLocaleString()}`}
      </Button>
    </Card>
  )
}
