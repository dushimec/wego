"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useState } from "react"

type DashboardView = "overview" | "vehicles" | "bookings" | "drivers" | "reports"

interface DashboardPreviewSwitcherProps {
  onViewChange: (view: DashboardView) => void
}

export function DashboardPreviewSwitcher({ onViewChange }: DashboardPreviewSwitcherProps) {
  const [activeView, setActiveView] = useState<DashboardView>("overview")

  const views: { id: DashboardView; label: string; icon: string }[] = [
    { id: "overview", label: "Overview", icon: "dashboard" },
    { id: "vehicles", label: "Vehicles", icon: "directions_car" },
    { id: "bookings", label: "Bookings", icon: "calendar_today" },
    { id: "drivers", label: "Drivers", icon: "people" },
    { id: "reports", label: "Reports", icon: "assessment" },
  ]

  const handleViewChange = (view: DashboardView) => {
    setActiveView(view)
    onViewChange(view)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dashboard Views</CardTitle>
        <CardDescription>Switch between different dashboard sections to preview</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {views.map((view) => (
            <Button
              key={view.id}
              onClick={() => handleViewChange(view.id)}
              variant={activeView === view.id ? "default" : "outline"}
              className="flex flex-col items-center gap-2 h-auto py-3"
            >
              <span className="material-symbols-outlined">{view.icon}</span>
              <span className="text-xs text-center">{view.label}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
