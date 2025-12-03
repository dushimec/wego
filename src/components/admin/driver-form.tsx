"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"
import { Upload } from "lucide-react"
import type { Driver } from "@/lib/types"
import { useUser } from "@/firebase" // Import the useUser hook

interface DriverFormProps {
  driver?: Driver
  onSuccess?: () => void
}

export function DriverForm({ driver, onSuccess }: DriverFormProps) {
  const { user } = useUser() // Get the authenticated user
  const [formData, setFormData] = useState({
    firstName: driver?.firstName || "",
    lastName: driver?.lastName || "",
    email: driver?.email || "",
    phone: driver?.phone || "",
    licenseNumber: driver?.licenseNumber || "",
    licenseExpiry: driver?.licenseExpiry || "",
    address: driver?.address || "",
    experience: driver?.experience || 1,
    languages: driver?.languages || ["English"],
    bio: driver?.bio || "",
  })

  const [profileImage, setProfileImage] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "experience" ? Number.parseInt(value) : value,
    }))
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) setProfileImage(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      if (!user) {
        throw new Error("You must be logged in to perform this action.")
      }
      const token = await user.getIdToken()
      const formDataObj = new FormData()
      Object.entries(formData).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          formDataObj.append(key, JSON.stringify(value))
        } else {
          formDataObj.append(key, String(value))
        }
      })

      if (profileImage) {
        formDataObj.append("profileImage", profileImage)
      }

      const endpoint = driver ? `/api/drivers/${driver.id}` : "/api/drivers/create"
      const method = driver ? "PUT" : "POST"

      const response = await fetch(endpoint, {
        method,
        body: formDataObj,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) throw new Error("Operation failed")

      setSuccess(driver ? "Driver updated successfully" : "Driver added successfully")
      onSuccess?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Operation failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{driver ? "Edit Driver" : "Add New Driver"}</CardTitle>
        <CardDescription>Manage driver information and certifications</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert className="bg-green-50">
              <AlertDescription className="text-green-800">{success}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">First Name</label>
              <Input
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                placeholder="John"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Last Name</label>
              <Input
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                placeholder="Doe"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="john@example.com"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Phone</label>
              <Input
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="+250 7xx xxx xxx"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">License Number</label>
              <Input
                name="licenseNumber"
                value={formData.licenseNumber}
                onChange={handleInputChange}
                placeholder="DL123456"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">License Expiry</label>
              <Input
                name="licenseExpiry"
                type="date"
                value={formData.licenseExpiry}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Address</label>
              <Input
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Kigali, Rwanda"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Years of Experience</label>
              <Input
                name="experience"
                type="number"
                value={formData.experience}
                onChange={handleInputChange}
                min="1"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Bio</label>
            <Textarea
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              placeholder="Professional profile summary"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Profile Picture</label>
            <div className="border-2 border-dashed rounded-lg p-4">
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="profile-upload" />
              <label
                htmlFor="profile-upload"
                className="cursor-pointer flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground"
              >
                <Upload className="w-4 h-4" />
                Click to upload profile picture
              </label>
            </div>

            {profileImage && (
              <div className="relative inline-block">
                <img
                  src={URL.createObjectURL(profileImage) || "/placeholder.svg"}
                  alt="Preview"
                  className="w-24 h-24 object-cover rounded"
                />
              </div>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Saving..." : driver ? "Update Driver" : "Add Driver"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
