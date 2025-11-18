"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FlutterwaveCardPayment } from "./flutterwave-card-payment"
import { FlutterwaveMomoPayment } from "./flutterwave-momo-payment"
import { CreditCard, Smartphone, Banknote } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface FlutterwavePaymentCheckoutProps {
  bookingId: string
  customerId: string
  amount: number
  customerEmail: string
  customerPhone: string
  customerName: string
  onSuccess?: (transactionId: string) => void
  onError?: (error: string) => void
}

export function FlutterwavePaymentCheckout({
  bookingId,
  customerId,
  amount,
  customerEmail,
  customerPhone,
  customerName,
  onSuccess,
  onError,
}: FlutterwavePaymentCheckoutProps) {
  const { toast } = useToast()
  const [paymentMethod, setPaymentMethod] = useState<"card" | "momo" | "cash">("card")
  const [isCashSelected, setIsCashSelected] = useState(false)

  const handleCashPayment = () => {
    setIsCashSelected(true)
    toast({
      title: "Cash Payment Selected",
      description: "You will pay RWF " + amount.toLocaleString() + " upon delivery.",
    })
  }

  return (
    <div className="w-full space-y-6">
      {/* Payment Amount Summary */}
      <Card className="p-6 bg-gradient-to-r from-slate-50 to-slate-100">
        <p className="text-sm text-muted-foreground mb-2">Total Amount to Pay</p>
        <p className="text-4xl font-bold text-slate-900">RWF {amount.toLocaleString()}</p>
        <p className="text-xs text-muted-foreground mt-2">Booking ID: {bookingId}</p>
      </Card>

      {/* Payment Method Tabs */}
      <Tabs value={paymentMethod} onValueChange={(v: any) => setPaymentMethod(v)}>
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="card" className="flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            <span className="hidden sm:inline">Card</span>
          </TabsTrigger>
          <TabsTrigger value="momo" className="flex items-center gap-2">
            <Smartphone className="w-4 h-4" />
            <span className="hidden sm:inline">Mobile Money</span>
          </TabsTrigger>
          <TabsTrigger value="cash" className="flex items-center gap-2">
            <Banknote className="w-4 h-4" />
            <span className="hidden sm:inline">Cash</span>
          </TabsTrigger>
        </TabsList>

        {/* Card Payment Tab */}
        <TabsContent value="card">
          <FlutterwaveCardPayment
            bookingId={bookingId}
            customerId={customerId}
            amount={amount}
            customerEmail={customerEmail}
            customerPhone={customerPhone}
            customerName={customerName}
            onSuccess={onSuccess}
            onError={onError}
          />
        </TabsContent>

        {/* Mobile Money Payment Tab */}
        <TabsContent value="momo">
          <FlutterwaveMomoPayment
            bookingId={bookingId}
            customerId={customerId}
            amount={amount}
            customerEmail={customerEmail}
            customerPhone={customerPhone}
            customerName={customerName}
            onSuccess={onSuccess}
            onError={onError}
          />
        </TabsContent>

        {/* Cash Payment Tab */}
        <TabsContent value="cash">
          <Card className="w-full p-6 space-y-6">
            <div className="flex items-center gap-2">
              <Banknote className="w-5 h-5" />
              <h3 className="text-lg font-semibold">Pay on Delivery</h3>
            </div>

            <div className="space-y-4">
              <Card className="p-4 bg-blue-50 border border-blue-200">
                <p className="text-sm text-blue-900 font-medium mb-3">Payment Terms:</p>
                <ul className="text-sm text-blue-800 space-y-2 list-disc list-inside">
                  <li>Pay RWF {amount.toLocaleString()} when the driver arrives</li>
                  <li>Cash payment only - no checks or credit</li>
                  <li>Receipt will be provided immediately</li>
                  <li>Booking is confirmed upon successful payment</li>
                </ul>
              </Card>

              <Button onClick={handleCashPayment} className="w-full bg-transparent" size="lg" variant="outline">
                Confirm Cash Payment Option
              </Button>

              {isCashSelected && (
                <Card className="p-4 bg-green-50 border border-green-200">
                  <p className="text-sm text-green-900">
                    Cash payment option has been selected. Your booking will be confirmed once you complete the
                    transaction on delivery.
                  </p>
                </Card>
              )}
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Security Notice */}
      <Card className="p-4 bg-slate-50">
        <p className="text-xs text-muted-foreground">
          <strong>Secure Payment:</strong> All payments are processed through Flutterwave's secure payment gateway with
          industry-standard encryption.
        </p>
      </Card>
    </div>
  )
}
