"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { DashboardPreviewSwitcher } from "@/components/admin/dashboard-preview-switcher"
import { DashboardThemePreview } from "@/components/admin/dashboard-theme-preview"

type DashboardView = "overview" | "vehicles" | "bookings" | "drivers" | "reports"

export default function DashboardPreviewPage() {
  const [activeView, setActiveView] = useState<DashboardView>("overview")

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-bold">Dashboard Preview</h1>
          <p className="text-muted-foreground">Preview different dashboard views and themes</p>
        </div>

        <DashboardPreviewSwitcher onViewChange={setActiveView} />
        <DashboardThemePreview view={activeView} />
      </div>
    </DashboardLayout>
  )
}
