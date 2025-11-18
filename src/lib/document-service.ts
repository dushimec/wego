import { admin, firestore } from "@/firebase/firebase-admin"
import { cloudinaryService } from "./cloudinary-service"

export type DocumentType = "id" | "license" | "registration" | "insurance" | "certification"
export type VerificationStatus = "pending" | "verified" | "rejected" | "expired"

export interface DocumentUpload {
  id: string
  userId: string
  documentType: DocumentType
  fileName: string
  fileUrl: string
  fileSize: number
  mimeType: string
  verificationStatus: VerificationStatus
  uploadedAt: string
  expiryDate?: string
  verifiedAt?: string
  verifiedBy?: string
  rejectionReason?: string
  metadata?: Record<string, string>
}

class DocumentService {
  // Validate document upload
  validateDocument(fileSize: number, mimeType: string, documentType: DocumentType): { valid: boolean; error?: string } {
    const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
    const ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/webp"]

    if (fileSize > MAX_FILE_SIZE) {
      return { valid: false, error: "File size exceeds 10MB limit" }
    }

    if (!ALLOWED_TYPES.includes(mimeType)) {
      return { valid: false, error: "Only PDF, JPEG, PNG, and WebP files are allowed" }
    }

    return { valid: true }
  }

  // Upload document to Cloudinary
  async uploadDocument(
    userId: string,
    documentType: DocumentType,
    file: Buffer,
    fileName: string,
    mimeType: string,
    expiryDate?: string,
  ): Promise<{ success: boolean; documentUrl?: string; error?: string }> {
    try {
      // Validate document
      const validation = this.validateDocument(file.length, mimeType, documentType)
      if (!validation.valid) {
        return { success: false, error: validation.error }
      }

      // Upload to Cloudinary
      const urls = await cloudinaryService.uploadMultipleImages([file], `driver-documents/${userId}/${documentType}`)
      const documentUrl = urls[0]

      return { success: true, documentUrl }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Document upload failed",
      }
    }
  }

  // Record document in database
  async recordDocument(
    userId: string,
    documentType: DocumentType,
    fileName: string,
    fileUrl: string,
    fileSize: number,
    mimeType: string,
    expiryDate?: string,
  ): Promise<DocumentUpload> {
    const document: DocumentUpload = {
      id: firestore.collection("documents").doc().id,
      userId,
      documentType,
      fileName,
      fileUrl,
      fileSize,
      mimeType,
      verificationStatus: "pending",
      uploadedAt: new Date().toISOString(),
      expiryDate,
    }

    await firestore.collection("documents").doc(document.id).set(document)

    // Update user profile with document reference
    await firestore
      .collection("users")
      .doc(userId)
      .update({
        documents: admin.firestore.FieldValue.arrayUnion({
          type: documentType,
          url: fileUrl,
          uploadedAt: document.uploadedAt,
          verified: false,
        }),
      })

    return document
  }

  // Get user documents
  async getUserDocuments(userId: string, documentType?: DocumentType): Promise<DocumentUpload[]> {
    let query = firestore.collection("documents").where("userId", "==", userId)

    if (documentType) {
      query = query.where("documentType", "==", documentType)
    }

    const snapshot = await query.get()
    return snapshot.docs.map((doc) => doc.data() as DocumentUpload)
  }

  // Verify document (admin action)
  async verifyDocument(
    documentId: string,
    verificationStatus: VerificationStatus,
    verifiedBy: string,
    rejectionReason?: string,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const docRef = firestore.collection("documents").doc(documentId)
      const docSnapshot = await docRef.get()

      if (!docSnapshot.exists) {
        return { success: false, error: "Document not found" }
      }

      const document = docSnapshot.data() as DocumentUpload

      // Update document
      await docRef.update({
        verificationStatus,
        verifiedAt: new Date().toISOString(),
        verifiedBy,
        rejectionReason,
      })

      // If verified, update user profile
      if (verificationStatus === "verified") {
        await firestore
          .collection("users")
          .doc(document.userId)
          .update({
            [`documents.${document.documentType}_verified`]: true,
          })
      }

      // Create notification
      await firestore
        .collection("notifications")
        .doc()
        .set({
          userId: document.userId,
          type: "document_verification",
          title: `Document ${verificationStatus}`,
          message: `Your ${document.documentType} document has been ${verificationStatus}${rejectionReason ? `: ${rejectionReason}` : ""}`,
          read: false,
          createdAt: new Date().toISOString(),
        })

      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Verification failed",
      }
    }
  }

  // Check document expiry
  async checkDocumentExpiry(userId: string): Promise<Array<{ documentType: DocumentType; daysUntilExpiry: number }>> {
    const documents = await this.getUserDocuments(userId)
    const today = new Date()
    const expiredDocs = []

    for (const doc of documents) {
      if (doc.expiryDate) {
        const expiryDate = new Date(doc.expiryDate)
        const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

        if (daysUntilExpiry <= 30 && daysUntilExpiry > 0) {
          expiredDocs.push({
            documentType: doc.documentType,
            daysUntilExpiry,
          })
        } else if (daysUntilExpiry <= 0) {
          // Mark as expired
          await firestore.collection("documents").doc(doc.id).update({
            verificationStatus: "expired",
          })
          expiredDocs.push({
            documentType: doc.documentType,
            daysUntilExpiry: 0,
          })
        }
      }
    }

    return expiredDocs
  }

  // Delete document from Cloudinary and database
  async deleteDocument(documentId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const docRef = firestore.collection("documents").doc(documentId)
      const docSnapshot = await docRef.get()

      if (!docSnapshot.exists) {
        return { success: false, error: "Document not found" }
      }

      const document = docSnapshot.data() as DocumentUpload

      // Delete from Cloudinary
      try {
        await cloudinaryService.deleteImage(document.fileUrl)
      } catch (error) {
        console.error("[v0] Error deleting document from Cloudinary:", error)
      }

      // Delete from database
      await docRef.delete()

      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Document deletion failed",
      }
    }
  }
}

export const documentService = new DocumentService()
