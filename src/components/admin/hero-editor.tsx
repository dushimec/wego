"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface HeroContent {
  title: string
  subtitle: string
  ctaText: string
  backgroundVideo: string
}

interface HeroEditorProps {
  onPreview: (content: HeroContent) => void
}

export function HeroEditor({ onPreview }: HeroEditorProps) {
  const [content, setContent] = useState<HeroContent>({
    title: "Rent Your Perfect Car Today",
    subtitle: "Find and book the ideal vehicle for your journey",
    ctaText: "Browse Cars",
    backgroundVideo: "/hero-video.mp4",
  })

  const [saved, setSaved] = useState(false)

  const handleChange = (field: keyof HeroContent, value: string) => {
    setContent((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Hero Section Editor</CardTitle>
        <CardDescription>Customize the hero section content and preview in real-time</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {saved && (
          <Alert>
            <AlertDescription>Changes saved successfully!</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="title">Hero Title</Label>
          <Input
            id="title"
            value={content.title}
            onChange={(e) => handleChange("title", e.target.value)}
            placeholder="Main title"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="subtitle">Subtitle</Label>
          <Textarea
            id="subtitle"
            value={content.subtitle}
            onChange={(e) => handleChange("subtitle", e.target.value)}
            placeholder="Subtitle text"
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="ctaText">CTA Button Text</Label>
          <Input
            id="ctaText"
            value={content.ctaText}
            onChange={(e) => handleChange("ctaText", e.target.value)}
            placeholder="Button text"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="video">Background Video URL</Label>
          <Input
            id="video"
            value={content.backgroundVideo}
            onChange={(e) => handleChange("backgroundVideo", e.target.value)}
            placeholder="Video URL"
          />
        </div>

        <div className="flex gap-2">
          <Button onClick={handleSave} className="flex-1">
            Save Changes
          </Button>
          <Button onClick={() => onPreview(content)} variant="outline" className="flex-1">
            Preview
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
