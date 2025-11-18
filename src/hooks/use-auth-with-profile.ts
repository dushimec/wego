"use client"

import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase"
import { doc } from "firebase/firestore"
import type { User } from "@/lib/types"
import { useEffect } from "react"

export function useAuthWithProfile() {
  const { user, isUserLoading, userError } = useUser()
  const firestore = useFirestore()

  const userDocRef = useMemoFirebase(() => {
    if (!user?.uid || !firestore) return null
    return doc(firestore, "users", user.uid)
  }, [user?.uid, firestore])

  const { data: userProfile, isLoading: isProfileLoading, error: profileError } = useDoc<User>(userDocRef)

  // Redirect based on user role
  useEffect(() => {
    if (userProfile && !isProfileLoading && !isUserLoading) {
      const path = window.location.pathname
      const role = userProfile.role

      const allowedPaths = {
        admin: ["/admin", "/dashboard"],
        manager: ["/dashboard"],
        driver: ["/dashboard/driver"],
        renter: ["/dashboard/renter", "/browse", "/booking", "/map", "/recommendations"],
        customer: ["/browse", "/booking", "/map", "/recommendations", "/dashboard/renter"],
      }

      // Check if user has access to current path
      const hasAccess = allowedPaths[role].some((allowedPath) => path.startsWith(allowedPath))

      // Redirect if user doesn't have access
      if (!hasAccess) {
        const defaultPaths = {
          admin: "/admin",
          manager: "/dashboard",
          driver: "/dashboard/driver",
          renter: "/dashboard/renter",
          customer: "/browse",
        }
        window.location.href = defaultPaths[role]
      }
    }
  }, [userProfile, isProfileLoading, isUserLoading])

  return {
    user,
    userProfile,
    isLoading: isUserLoading || (user && !userProfile && isProfileLoading),
    error: userError || profileError,
  }
}
