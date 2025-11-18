"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { LivePreviewPanel } from "@/components/admin/live-preview-panel"
import { PreviewDeviceSelector } from "@/components/admin/preview-device-selector"
import { HeroSearchForm } from "@/components/hero-search-form"

type DeviceType = "desktop" | "tablet" | "mobile"

export default function LivePreviewPage() {
  const [device, setDevice] = useState<DeviceType>("desktop")

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-bold">Live Preview</h1>
          <p className="text-muted-foreground">Preview your site across different devices and themes</p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          <div>
            <PreviewDeviceSelector onDeviceChange={setDevice} currentDevice={device} />
          </div>

          <div className="lg:col-span-3">
            <LivePreviewPanel>
              <div className="p-4">
                <HeroSearchForm />
              </div>
            </LivePreviewPanel>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
