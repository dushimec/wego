"use client"

import type React from "react"
import { VehiclePreviewModal } from "./vehicle-preview-modal"
import { useAuth } from "@/firebase/client-provider"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"
import { Upload, X, Loader2, AlertCircle } from "lucide-react"
import type { Car } from "@/lib/types"

const CATEGORIES = ["SUV", "Sedan", "Van", "Economy", "Luxury", "Minibus"]
const FUEL_TYPES = ["Gasoline", "Electric", "Hybrid", "Diesel"]
const TRANSMISSIONS = ["Automatic", "Manual"]
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"]

interface VehicleFormProps {
  vehicle?: Car
  onSuccess?: () => void
}

interface ImageUploadProgress {
  [key: number]: number
  total?: number
}

export function VehicleForm({ vehicle, onSuccess }: VehicleFormProps) {
  const { auth } = useAuth()
  const [formData, setFormData] = useState({
    brand: vehicle?.brand || "",
    model: vehicle?.model || "",
    year: vehicle?.year || new Date().getFullYear(),
    category: vehicle?.category || "Sedan",
    fuelType: vehicle?.fuelType || "Gasoline",
    transmission: vehicle?.transmission || "Automatic",
    seats: vehicle?.seats || 5,
    pricePerDay: vehicle?.pricePerDay || 50000,
    registrationNumber: vehicle?.registrationNumber || "",
    registrationExpiry: vehicle?.registrationExpiry || "",
    description: vehicle?.description || "",
    features: vehicle?.features || [],
    location: vehicle?.location || "",
  })

  const [images, setImages] = useState<File[]>([])
  const [existingImages, setExistingImages] = useState<string[]>(vehicle?.images || [])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [uploadProgress, setUploadProgress] = useState<ImageUploadProgress>({
    total: 0,
  })
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [showPreview, setShowPreview] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "year" || name === "seats" || name === "pricePerDay" ? Number.parseInt(value) : value,
    }))
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const totalImages = images.length + existingImages.length + files.length

    if (totalImages > 4) {
      setError(`Maximum 4 images allowed. Currently have ${existingImages.length + images.length} images.`)
      return
    }

    const validFiles: File[] = []
    const validationErrors: string[] = []

    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        validationErrors.push(`${file.name} exceeds 5MB limit`)
        continue
      }

      if (!ALLOWED_TYPES.includes(file.type)) {
        validationErrors.push(`${file.name} is not a supported image format`)
        continue
      }

      validFiles.push(file)
    }

    if (validationErrors.length > 0) {
      setError(validationErrors.join(", "))
      return
    }

    if (validFiles.length === 0) {
      return
    }

    const newPreviews = validFiles.map((file) => URL.createObjectURL(file))
    setImages((prev) => [...prev, ...validFiles])
    setImagePreviews((prev) => [...prev, ...newPreviews])
    setError("")
  }

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
    setImagePreviews((prev) => {
      URL.revokeObjectURL(prev[index])
      return prev.filter((_, i) => i !== index)
    })
    setUploadProgress((prev) => {
      const newProgress = { ...prev }
      delete newProgress[index]
      return newProgress
    })
  }

  const handleRemoveExistingImage = (index: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index))
  }

  const uploadImagesToCloudinary = async (): Promise<string[]> => {
    if (images.length === 0) {
      return existingImages
    }

    setUploading(true)
    try {
      const formDataObj = new FormData()
      images.forEach((img) => formDataObj.append("images", img))

      const xhr = new XMLHttpRequest()

      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          const percentComplete = (event.loaded / event.total) * 100
          setUploadProgress((prev) => ({
            ...prev,
            total: percentComplete,
          }))
        }
      })

      return new Promise((resolve, reject) => {
        xhr.onload = async () => {
          if (xhr.status === 200) {
            try {
              const response = JSON.parse(xhr.responseText)
              resolve([...existingImages, ...response.imageUrls])
            } catch (e) {
              reject(new Error("Invalid response format"))
            }
          } else {
            reject(new Error("Upload failed with status " + xhr.status))
          }
        }

        xhr.onerror = () => {
          reject(new Error("Network error during upload"))
        }

        xhr.open("POST", "/api/vehicles/upload-images")
        xhr.send(formDataObj)
      })
    } catch (err) {
      console.error("[v0] Upload error:", err)
      throw err instanceof Error ? err : new Error("Failed to upload images")
    } finally {
      setUploading(false)
      setUploadProgress({ total: 0 })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const allImageUrls = await uploadImagesToCloudinary()
      const token = await auth?.currentUser?.getIdToken()

      if (!token) {
        throw new Error("Authentication token not available.")
      }

      const submitData = {
        ...formData,
        images: allImageUrls,
        cloudinaryUrl: allImageUrls && allImageUrls.length > 0 ? allImageUrls[0] : undefined,
      }

      const endpoint = vehicle ? `/api/vehicles/${vehicle.id}` : "/api/vehicles/create"
      const method = vehicle ? "PUT" : "POST"

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(submitData),
      })

      if (!response.ok) throw new Error("Operation failed")

      setSuccess(vehicle ? "Vehicle updated successfully" : "Vehicle added successfully")
      setImages([])
      setImagePreviews([])
      onSuccess?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Operation failed")
    } finally {
      setLoading(false)
    }
  }

  const totalImages = images.length + existingImages.length
  const uploadProgressPercent = uploadProgress.total || 0

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{vehicle ? "Edit Vehicle" : "Add New Vehicle"}</CardTitle>
          <CardDescription>Manage vehicle details and specifications (Max 4 images)</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="w-4 h-4 mr-2" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {success && (
              <Alert className="bg-green-50 border-green-200">
                <AlertDescription className="text-green-800">{success}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Brand</label>
                <Input name="brand" value={formData.brand} onChange={handleInputChange} placeholder="Toyota" required />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Model</label>
                <Input name="model" value={formData.model} onChange={handleInputChange} placeholder="Prius" required />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Year</label>
                <Input name="year" type="number" value={formData.year} onChange={handleInputChange} required />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Select
                  value={formData.category}
                  onValueChange={(v) => setFormData((prev) => ({ ...prev, category: v as any }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Fuel Type</label>
                <Select
                  value={formData.fuelType}
                  onValueChange={(v) => setFormData((prev) => ({ ...prev, fuelType: v as any }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FUEL_TYPES.map((fuel) => (
                      <SelectItem key={fuel} value={fuel}>
                        {fuel}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Transmission</label>
                <Select
                  value={formData.transmission}
                  onValueChange={(v) => setFormData((prev) => ({ ...prev, transmission: v as any }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TRANSMISSIONS.map((trans) => (
                      <SelectItem key={trans} value={trans}>
                        {trans}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Seats</label>
                <Input name="seats" type="number" value={formData.seats} onChange={handleInputChange} required />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Price per Day (RWF)</label>
                <Input
                  name="pricePerDay"
                  type="number"
                  value={formData.pricePerDay}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Registration Number</label>
                <Input
                  name="registrationNumber"
                  value={formData.registrationNumber}
                  onChange={handleInputChange}
                  placeholder="RAB 123 A"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Registration Expiry</label>
                <Input
                  name="registrationExpiry"
                  type="date"
                  value={formData.registrationExpiry}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Location</label>
                <Input
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="Kigali, Rwanda"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Vehicle description"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Upload Images ({totalImages}/4)</label>
              <div className="border-2 border-dashed rounded-lg p-6 transition-colors hover:bg-muted/50">
                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                  disabled={totalImages >= 4 || uploading}
                />
                <label
                  htmlFor="image-upload"
                  className={`cursor-pointer flex flex-col items-center justify-center gap-2 ${
                    totalImages >= 4 || uploading
                      ? "text-muted-foreground opacity-50 cursor-not-allowed"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Upload className="w-5 h-5" />
                  <div className="text-center">
                    <p className="font-medium">
                      {totalImages >= 4 ? "Maximum images reached" : "Click to upload images or drag and drop"}
                    </p>
                    <p className="text-xs">PNG, JPG, WebP, GIF up to 5MB each</p>
                  </div>
                </label>
              </div>

              {uploading && uploadProgressPercent > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span>Uploading images to Cloudinary...</span>
                    <span className="font-medium">{Math.round(uploadProgressPercent)}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-blue-500 h-full rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgressPercent}%` }}
                    />
                  </div>
                </div>
              )}

              {existingImages.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Existing Images</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {existingImages.map((img, idx) => (
                      <div key={`existing-${idx}`} className="relative group">
                        <img
                          src={img || "/placeholder.svg"}
                          alt="Existing"
                          className="w-full h-24 object-cover rounded border border-muted"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveExistingImage(idx)}
                          className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {imagePreviews.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">New Images to Upload</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {imagePreviews.map((preview, idx) => (
                      <div key={`new-${idx}`} className="relative group">
                        <img
                          src={preview || "/placeholder.svg"}
                          alt="Preview"
                          className="w-full h-24 object-cover rounded border border-muted"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button type="submit" className="flex-1" disabled={loading || uploading}>
                {loading || uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {uploading ? "Uploading Images..." : "Saving..."}
                  </>
                ) : vehicle ? (
                  "Update Vehicle"
                ) : (
                  "Add Vehicle"
                )}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowPreview(true)}>
                <span className="material-symbols-outlined mr-2">preview</span>
                Preview
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <VehiclePreviewModal open={showPreview} onOpenChange={setShowPreview} vehicle={formData} />
    </>
  )
}
