"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { VehiclePreview } from "../vehicle-preview"
import type { Car } from "@/lib/types"

interface VehiclePreviewModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  vehicle: Partial<Car>
}

export function VehiclePreviewModal({ open, onOpenChange, vehicle }: VehiclePreviewModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Vehicle Preview</DialogTitle>
        </DialogHeader>
        <VehiclePreview vehicle={vehicle} />
      </DialogContent>
    </Dialog>
  )
}
