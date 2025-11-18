"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { HeroEditor } from "@/components/admin/hero-editor"
import { HeroPreviewModal } from "@/components/admin/hero-preview-modal"

interface HeroContent {
  title: string
  subtitle: string
  ctaText: string
  backgroundVideo: string
}

export default function HeroManagementPage() {
  const [showPreview, setShowPreview] = useState(false)
  const [previewContent, setPreviewContent] = useState<HeroContent>({
    title: "Rent Your Perfect Car Today",
    subtitle: "Find and book the ideal vehicle for your journey",
    ctaText: "Browse Cars",
    backgroundVideo: "/hero-video.mp4",
  })

  const handlePreview = (content: HeroContent) => {
    setPreviewContent(content)
    setShowPreview(true)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-bold">Hero Section Management</h1>
          <p className="text-muted-foreground">Customize and preview the hero section</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <HeroEditor onPreview={handlePreview} />
        </div>
      </div>

      <HeroPreviewModal open={showPreview} onOpenChange={setShowPreview} content={previewContent} />
    </DashboardLayout>
  )
}
