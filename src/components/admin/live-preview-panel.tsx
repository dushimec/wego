"use client"

import type React from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useState } from "react"

type DeviceType = "desktop" | "tablet" | "mobile"

interface LivePreviewPanelProps {
  children: React.ReactNode
}

const DEVICE_SIZES = {
  desktop: { width: 1024, height: 768, label: "Desktop (1024px)" },
  tablet: { width: 768, height: 1024, label: "Tablet (768px)" },
  mobile: { width: 375, height: 667, label: "Mobile (375px)" },
}

export function LivePreviewPanel({ children }: LivePreviewPanelProps) {
  const [device, setDevice] = useState<DeviceType>("desktop")
  const [theme, setTheme] = useState<"light" | "dark">("light")

  const size = DEVICE_SIZES[device]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Live Preview</CardTitle>
        <CardDescription>See how your changes look in real-time</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Controls */}
        <div className="flex flex-wrap gap-2 p-3 bg-muted rounded-lg">
          <div className="flex gap-2">
            {Object.entries(DEVICE_SIZES).map(([key, value]) => (
              <button
                key={key}
                onClick={() => setDevice(key as DeviceType)}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  device === key ? "bg-primary text-white" : "bg-background border border-border hover:bg-muted"
                }`}
              >
                {value.label}
              </button>
            ))}
          </div>

          <div className="flex gap-2 ml-auto">
            {(["light", "dark"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors capitalize ${
                  theme === t ? "bg-primary text-white" : "bg-background border border-border hover:bg-muted"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Preview Container */}
        <div className={`rounded-lg border overflow-hidden ${theme === "dark" ? "bg-black" : "bg-white"}`}>
          <div
            style={{
              width: `${size.width}px`,
              height: `${size.height}px`,
              margin: "0 auto",
              overflow: "auto",
            }}
            className={`relative ${theme === "dark" ? "[color-scheme:dark]" : "[color-scheme:light]"}`}
          >
            {children}
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          Device: {size.label} • Theme: {theme === "light" ? "Light" : "Dark"}
        </p>
      </CardContent>
    </Card>
  )
}
