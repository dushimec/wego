"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Upload, CheckCircle, AlertCircle } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { DocumentType, VerificationStatus } from "@/lib/document-service"

interface DocumentUploadProps {
  userId: string
  onUploadSuccess?: (documentId: string) => void
}

export function DocumentUpload({ userId, onUploadSuccess }: DocumentUploadProps) {
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [documentType, setDocumentType] = useState<DocumentType>("id")
  const [expiryDate, setExpiryDate] = useState("")
  const [uploadedDocuments, setUploadedDocuments] = useState<
    Array<{
      id: string
      documentType: DocumentType
      fileName: string
      verificationStatus: VerificationStatus
      uploadedAt: string
    }>
  >([])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const maxSize = 10 * 1024 * 1024 // 10MB
      if (file.size > maxSize) {
        toast({
          title: "File too large",
          description: "Maximum file size is 10MB",
          variant: "destructive",
        })
        return
      }

      const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/webp"]
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: "Only PDF, JPEG, PNG, and WebP files are allowed",
          variant: "destructive",
        })
        return
      }

      setSelectedFile(file)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please select a file to upload",
        variant: "destructive",
      })
      return
    }

    try {
      setIsUploading(true)
      setUploadProgress(0)

      const formData = new FormData()
      formData.append("file", selectedFile)
      formData.append("documentType", documentType)
      formData.append("expiryDate", expiryDate)
      formData.append("userId", userId)

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev < 90) return prev + Math.random() * 30
          return prev
        })
      }, 500)

      const response = await fetch("/api/documents/upload", {
        method: "POST",
        body: formData,
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Upload failed")
      }

      toast({
        title: "Success",
        description: "Document uploaded successfully. It will be verified shortly.",
      })

      // Add to uploaded documents
      setUploadedDocuments((prev) => [
        ...prev,
        {
          id: data.documentId,
          documentType: documentType as DocumentType,
          fileName: selectedFile.name,
          verificationStatus: "pending",
          uploadedAt: new Date().toISOString(),
        },
      ])

      setSelectedFile(null)
      setExpiryDate("")
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }

      onUploadSuccess?.(data.documentId)
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const getStatusIcon = (status: VerificationStatus) => {
    switch (status) {
      case "verified":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "rejected":
      case "expired":
        return <AlertCircle className="w-4 h-4 text-red-500" />
      default:
        return <AlertCircle className="w-4 h-4 text-yellow-500" />
    }
  }

  const getStatusLabel = (status: VerificationStatus) => {
    switch (status) {
      case "pending":
        return "Pending Verification"
      case "verified":
        return "Verified"
      case "rejected":
        return "Rejected"
      case "expired":
        return "Expired"
    }
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Upload Document</h3>

        <div className="space-y-4">
          <div>
            <Label htmlFor="doc-type">Document Type</Label>
            <Select value={documentType} onValueChange={(v: any) => setDocumentType(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="id">National ID / Passport</SelectItem>
                <SelectItem value="license">Driver's License</SelectItem>
                <SelectItem value="registration">Vehicle Registration</SelectItem>
                <SelectItem value="insurance">Insurance Certificate</SelectItem>
                <SelectItem value="certification">Professional Certification</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="expiry">Expiry Date (Optional)</Label>
            <Input
              id="expiry"
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              disabled={isUploading}
            />
          </div>

          <div>
            <Label htmlFor="file-upload">Choose File</Label>
            <div className="mt-2">
              <input
                ref={fileInputRef}
                type="file"
                id="file-upload"
                className="hidden"
                onChange={handleFileSelect}
                accept=".pdf,.jpg,.jpeg,.png,.webp"
                disabled={isUploading}
              />
              <Button
                type="button"
                variant="outline"
                className="w-full bg-transparent"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                <Upload className="w-4 h-4 mr-2" />
                {selectedFile ? selectedFile.name : "Select File"}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-2">Supported formats: PDF, JPEG, PNG, WebP (Max 10MB)</p>
          </div>

          {uploadProgress > 0 && uploadProgress < 100 && (
            <div>
              <Progress value={uploadProgress} className="w-full" />
              <p className="text-sm text-muted-foreground mt-2">{Math.round(uploadProgress)}%</p>
            </div>
          )}

          <Button onClick={handleUpload} disabled={!selectedFile || isUploading} className="w-full">
            {isUploading ? "Uploading..." : "Upload Document"}
          </Button>
        </div>
      </Card>

      {uploadedDocuments.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Your Documents</h3>
          <div className="space-y-3">
            {uploadedDocuments.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <p className="font-medium">{doc.fileName}</p>
                  <p className="text-sm text-muted-foreground">
                    {doc.documentType.charAt(0).toUpperCase() + doc.documentType.slice(1)} • Uploaded{" "}
                    {new Date(doc.uploadedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(doc.verificationStatus)}
                  <span className="text-sm font-medium">{getStatusLabel(doc.verificationStatus)}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
