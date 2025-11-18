"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

type DeviceType = "desktop" | "tablet" | "mobile"

interface PreviewDeviceSelectorProps {
  onDeviceChange: (device: DeviceType) => void
  currentDevice: DeviceType
}

export function PreviewDeviceSelector({ onDeviceChange, currentDevice }: PreviewDeviceSelectorProps) {
  const devices: { id: DeviceType; label: string; icon: string; size: string }[] = [
    { id: "desktop", label: "Desktop", icon: "desktop_mac", size: "1024×768" },
    { id: "tablet", label: "Tablet", icon: "tablet_mac", size: "768×1024" },
    { id: "mobile", label: "Mobile", icon: "smartphone", size: "375×667" },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Device Preview</CardTitle>
        <CardDescription>Select a device to preview your site</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-2">
          {devices.map((device) => (
            <Button
              key={device.id}
              onClick={() => onDeviceChange(device.id)}
              variant={currentDevice === device.id ? "default" : "outline"}
              className="flex flex-col items-center gap-2 h-auto py-4"
            >
              <span className="material-symbols-outlined text-xl">{device.icon}</span>
              <div className="text-center">
                <p className="text-xs font-semibold">{device.label}</p>
                <p className="text-xs text-muted-foreground">{device.size}</p>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
