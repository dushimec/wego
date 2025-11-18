"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FlutterwaveCardPayment } from "./flutterwave-card-payment"
import { FlutterwaveMomoPayment } from "./flutterwave-momo-payment"
import { CreditCard, Smartphone, Banknote } from "lucide-react"

interface FlutterwavePaymentFormProps {
  bookingId: string
  amount: number
  invoiceNumber: string
  onSuccess?: () => void
}

export function FlutterwavePaymentForm({ bookingId, amount, invoiceNumber, onSuccess }: FlutterwavePaymentFormProps) {
  const [paymentMethod, setPaymentMethod] = useState("card")

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Complete Payment</CardTitle>
        <CardDescription>Invoice: {invoiceNumber}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 p-3 bg-muted rounded-lg">
          <div className="flex justify-between text-sm">
            <span>Total Amount:</span>
            <span className="font-bold text-lg">{amount.toLocaleString()} RWF</span>
          </div>
        </div>

        <Tabs value={paymentMethod} onValueChange={setPaymentMethod}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="card" className="text-xs sm:text-sm">
              <CreditCard className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Card</span>
            </TabsTrigger>
            <TabsTrigger value="momo" className="text-xs sm:text-sm">
              <Smartphone className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">MoMo</span>
            </TabsTrigger>
            <TabsTrigger value="cash" className="text-xs sm:text-sm">
              <Banknote className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Cash</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="card" className="mt-4">
            <FlutterwaveCardPayment bookingId={bookingId} amount={amount} onSuccess={onSuccess} />
          </TabsContent>

          <TabsContent value="momo" className="mt-4">
            <FlutterwaveMomoPayment bookingId={bookingId} amount={amount} onSuccess={onSuccess} />
          </TabsContent>

          <TabsContent value="cash" className="mt-4 space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-900">
                You selected Cash on Delivery. The driver will collect payment upon delivery. A confirmation will be
                sent to you shortly.
              </p>
            </div>
            <div className="p-3 bg-muted rounded-lg text-center text-sm text-muted-foreground">
              Booking Reference: <span className="font-mono font-bold">{bookingId.substring(0, 8).toUpperCase()}</span>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
