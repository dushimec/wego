"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface HeroContent {
  title: string
  subtitle: string
  ctaText: string
  backgroundVideo: string
}

interface HeroPreviewModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  content: HeroContent
}

export function HeroPreviewModal({ open, onOpenChange, content }: HeroPreviewModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[600px]">
        <DialogHeader>
          <DialogTitle>Hero Section Preview</DialogTitle>
        </DialogHeader>
        <div className="relative w-full h-full rounded-lg overflow-hidden bg-black">
          <video autoPlay muted loop className="w-full h-full object-cover">
            <source src={content.backgroundVideo} type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <div className="text-center text-white max-w-2xl mx-auto px-4">
              <h1 className="text-5xl font-bold mb-4">{content.title}</h1>
              <p className="text-xl mb-8">{content.subtitle}</p>
              <button className="bg-primary text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary/90">
                {content.ctaText}
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
