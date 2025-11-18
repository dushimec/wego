"use client"

/**
 * Error class for Firestore permission errors
 */
export class FirestorePermissionError extends Error {
  constructor(
    message = "Permission denied",
    public code = "permission-denied",
  ) {
    super(message)
    this.name = "FirestorePermissionError"
  }
}
