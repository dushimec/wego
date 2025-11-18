import { auth, db } from "./firebase-admin"
import type { User } from "./types"

export const authService = {
  async createUser(
    email: string,
    password: string,
    displayName: string,
    phoneNumber?: string,
  ): Promise<{ uid: string; user: User }> {
    const authUser = await auth.createUser({
      email,
      password,
      displayName,
      phoneNumber,
    })

    const newUser: User = {
      id: authUser.uid,
      email,
      displayName,
      phoneNumber,
      role: "renter",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true,
    }

    await db.collection("users").doc(authUser.uid).set(newUser)

    return { uid: authUser.uid, user: newUser }
  },

  async getUserById(userId: string): Promise<User | null> {
    const doc = await db.collection("users").doc(userId).get()
    return doc.exists ? (doc.data() as User) : null
  },

  async updateUserProfile(userId: string, updates: Partial<User>): Promise<User> {
    const updatedData = {
      ...updates,
      updatedAt: new Date().toISOString(),
    }

    await db.collection("users").doc(userId).update(updatedData)

    const doc = await db.collection("users").doc(userId).get()
    return doc.data() as User
  },

  async deleteUser(userId: string): Promise<void> {
    await auth.deleteUser(userId)
    await db.collection("users").doc(userId).delete()
  },
}
