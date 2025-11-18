"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Upload, CheckCircle, Clock } from "lucide-react"
import type { User } from "@/lib/types"

interface DocumentUploadProps {
  user: User
  onUploadSuccess?: () => void
}

export function DocumentUpload({ user, onUploadSuccess }: DocumentUploadProps) {
  const [uploading, setUploading] = useState<Record<string, boolean>>({})
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const documentTypes = [
    { id: "id", label: "National ID / Passport", required: true },
    { id: "license", label: "Driver's License", required: true },
    { id: "registration", label: "Vehicle Registration", required: false },
    { id: "insurance", label: "Insurance Document", required: false },
  ]

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, docType: string) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading((prev) => ({ ...prev, [docType]: true }))
    setError("")

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("documentType", docType)

      const response = await fetch("/api/documents/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Upload failed")
      }

      setSuccess(`${docType} uploaded successfully`)
      onUploadSuccess?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed")
    } finally {
      setUploading((prev) => ({ ...prev, [docType]: false }))
    }
  }

  const getDocumentStatus = (docType: string) => {
    const doc = user.documents?.find((d) => d.type === (docType as any))
    if (!doc) return null
    return {
      uploaded: true,
      verified: doc.verified,
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Documents</CardTitle>
        <CardDescription>Upload required documents for verification</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
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

        <div className="space-y-3">
          {documentTypes.map((docType) => {
            const status = getDocumentStatus(docType.id)

            return (
              <div key={docType.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{docType.label}</span>
                    {docType.required && <Badge variant="destructive">Required</Badge>}
                  </div>
                  {status?.uploaded && (
                    <div className="flex items-center gap-1 mt-1 text-sm">
                      {status.verified ? (
                        <>
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="text-green-600">Verified</span>
                        </>
                      ) : (
                        <>
                          <Clock className="w-4 h-4 text-yellow-600" />
                          <span className="text-yellow-600">Pending verification</span>
                        </>
                      )}
                    </div>
                  )}
                </div>

                <label className="relative">
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileUpload(e, docType.id)}
                    disabled={uploading[docType.id]}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant={status?.uploaded ? "outline" : "default"}
                    size="sm"
                    disabled={uploading[docType.id]}
                    onClick={(e) => {
                      e.preventDefault()
                      ;(e.currentTarget.parentElement?.querySelector("input") as HTMLInputElement)?.click()
                    }}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {uploading[docType.id] ? "Uploading..." : status?.uploaded ? "Replace" : "Upload"}
                  </Button>
                </label>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
