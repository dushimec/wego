"use client"

import { Card } from "@/components/ui/card"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { ArrowUpRight, ArrowDownRight, TrendingUp, Car, MapPin, DollarSign } from "lucide-react"

interface AdminOverviewProps {
  totalBookings: number
  totalRevenue: number
  pendingBookings: number
  activeVehicles: number
  bookingTrend: Array<{ date: string; count: number }>
  revenueTrend: Array<{ date: string; amount: number }>
  bookingStatus: Array<{ status: string; count: number }>
  paymentMethods: Array<{ method: string; count: number; revenue: number }>
}

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"]

export function AdminOverview({
  totalBookings = 0,
  totalRevenue = 0,
  pendingBookings = 0,
  activeVehicles = 0,
  bookingTrend = [],
  revenueTrend = [],
  bookingStatus = [],
  paymentMethods = [],
}: AdminOverviewProps) {
  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Bookings</p>
              <p className="text-3xl font-bold">{totalBookings}</p>
              <p className="text-xs text-green-600 flex items-center gap-1 mt-2">
                <ArrowUpRight className="w-3 h-3" /> 12% from last month
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-500 opacity-20" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Revenue</p>
              <p className="text-3xl font-bold">RWF {(totalRevenue / 1000).toFixed(0)}K</p>
              <p className="text-xs text-green-600 flex items-center gap-1 mt-2">
                <ArrowUpRight className="w-3 h-3" /> 8% from last month
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-green-500 opacity-20" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Pending Bookings</p>
              <p className="text-3xl font-bold">{pendingBookings}</p>
              <p className="text-xs text-red-600 flex items-center gap-1 mt-2">
                <ArrowDownRight className="w-3 h-3" /> 2 urgent
              </p>
            </div>
            <MapPin className="w-8 h-8 text-yellow-500 opacity-20" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active Vehicles</p>
              <p className="text-3xl font-bold">{activeVehicles}</p>
              <p className="text-xs text-blue-600 flex items-center gap-1 mt-2">
                <TrendingUp className="w-3 h-3" /> All healthy
              </p>
            </div>
            <Car className="w-8 h-8 text-blue-500 opacity-20" />
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Booking Trend */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Booking Trend (Last 7 Days)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={bookingTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} name="Bookings" />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Revenue Trend */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Revenue Trend (Last 7 Days)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="amount" fill="#10b981" name="Revenue (RWF)" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Booking Status */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Booking Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={bookingStatus}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="count"
              >
                {bookingStatus.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Payment Methods */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Payment Methods</h3>
          <div className="space-y-3">
            {paymentMethods.map((method) => (
              <div key={method.method} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium capitalize">{method.method}</p>
                  <p className="text-sm text-muted-foreground">{method.count} transactions</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">RWF {method.revenue.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">{((method.revenue / totalRevenue) * 100).toFixed(1)}%</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
