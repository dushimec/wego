"use client"

import { EventEmitter } from "events"
import type { FirestorePermissionError } from "./errors"

/**
 * Global error emitter for Firebase/Firestore errors
 * Used to emit permission errors that can be caught by error boundaries
 */
class FirebaseErrorEmitter extends EventEmitter {
  constructor() {
    super()
    this.setMaxListeners(10)
  }

  emitPermissionError(error: FirestorePermissionError) {
    this.emit("permission-error", error)
  }
}

export const errorEmitter = new FirebaseErrorEmitter()
