"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

type DashboardView = "overview" | "vehicles" | "bookings" | "drivers" | "reports"

interface DashboardThemePreviewProps {
  view: DashboardView
}

export function DashboardThemePreview({ view }: DashboardThemePreviewProps) {
  const getPreviewContent = (view: DashboardView) => {
    const content = {
      overview: {
        title: "Dashboard Overview",
        metrics: [
          { label: "Total Revenue", value: "$45,231", trend: "+20.1%" },
          { label: "Active Bookings", value: "12", trend: "+5" },
          { label: "Total Users", value: "284", trend: "+12" },
          { label: "Fleet Size", value: "48", trend: "+3" },
        ],
      },
      vehicles: {
        title: "Vehicle Management",
        metrics: [
          { label: "Total Vehicles", value: "48", trend: "+2" },
          { label: "Available", value: "42", trend: "+1" },
          { label: "In Maintenance", value: "3", trend: "0" },
          { label: "Booked", value: "3", trend: "+1" },
        ],
      },
      bookings: {
        title: "Booking Management",
        metrics: [
          { label: "Total Bookings", value: "156", trend: "+28" },
          { label: "Approved", value: "142", trend: "+22" },
          { label: "Pending", value: "8", trend: "+3" },
          { label: "Completed", value: "128", trend: "+25" },
        ],
      },
      drivers: {
        title: "Driver Management",
        metrics: [
          { label: "Total Drivers", value: "34", trend: "+5" },
          { label: "Active", value: "28", trend: "+4" },
          { label: "Avg Rating", value: "4.8", trend: "+0.1" },
          { label: "New This Month", value: "7", trend: "+7" },
        ],
      },
      reports: {
        title: "Analytics & Reports",
        metrics: [
          { label: "Monthly Revenue", value: "$145,231", trend: "+15%" },
          { label: "Conversion Rate", value: "8.2%", trend: "+1.2%" },
          { label: "Avg Booking Value", value: "$892", trend: "+$45" },
          { label: "Customer Satisfaction", value: "4.7", trend: "+0.2" },
        ],
      },
    }

    return content[view]
  }

  const content = getPreviewContent(view)

  return (
    <Card>
      <CardHeader>
        <CardTitle>{content.title}</CardTitle>
        <CardDescription>Live theme preview of selected dashboard view</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {content.metrics.map((metric, idx) => (
            <Card key={idx} className="bg-muted/50">
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">{metric.label}</p>
                  <div className="flex items-end justify-between">
                    <span className="text-2xl font-bold">{metric.value}</span>
                    <Badge variant="secondary" className="text-xs">
                      {metric.trend}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
