import { type NextRequest, NextResponse } from "next/server"
import { documentService } from "@/lib/document-service"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const documentType = formData.get("documentType") as string
    const expiryDate = formData.get("expiryDate") as string
    const userId = formData.get("userId") as string

    if (!file || !documentType || !userId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer())

    // Upload document
    const uploadResult = await documentService.uploadDocument(
      userId,
      documentType as any,
      buffer,
      file.name,
      file.type,
      expiryDate || undefined,
    )

    if (!uploadResult.success) {
      return NextResponse.json({ error: uploadResult.error }, { status: 400 })
    }

    // Record document
    const document = await documentService.recordDocument(
      userId,
      documentType as any,
      file.name,
      uploadResult.documentUrl!,
      buffer.length,
      file.type,
      expiryDate || undefined,
    )

    return NextResponse.json({
      success: true,
      documentId: document.id,
      message: "Document uploaded successfully",
    })
  } catch (error) {
    console.error("Document upload error:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Upload failed" }, { status: 500 })
  }
}
