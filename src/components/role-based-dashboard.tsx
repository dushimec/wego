"use client"

import { useAuthWithProfile } from "@/hooks/use-auth-with-profile"
import { AdminDashboard } from "./admin-dashboard"
import { DriverDashboard } from "./driver-dashboard"
import { RenterDashboard } from "./renter-dashboard"
import { OwnerDashboard } from "./owner-dashboard" // Import OwnerDashboard
import { Card, CardContent } from "./ui/card"
import { useDoc } from "@/firebase"
import { doc } from "firebase/firestore"
import { useFirestore } from "@/firebase"
import type { User, Booking, Car } from "@/lib/types"
import { AnimatedSection } from "./animated-section"

export function RoleBasedDashboard() {
  const { userProfile, isLoading: authLoading } = useAuthWithProfile()
  const firestore = useFirestore()

  // Fetch collections based on role
  const bookingsDocRef = doc(firestore, "bookings", "all")
  const carsDocRef = doc(firestore, "cars", "all")
  const usersDocRef = doc(firestore, "users", "all")

  const { data: bookings, isLoading: bookingsLoading } = useDoc<{ bookings: Booking[] }>(bookingsDocRef)
  const { data: cars, isLoading: carsLoading } = useDoc<{ cars: Car[] }>(carsDocRef)
  const { data: users, isLoading: usersLoading } = useDoc<{ users: User[] }>(usersDocRef)

  const isLoading = authLoading || bookingsLoading || carsLoading || usersLoading

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-4">Loading...</CardContent>
      </Card>
    )
  }

  if (!userProfile) {
    return (
      <Card>
        <CardContent className="p-4">Please login to access the dashboard.</CardContent>
      </Card>
    )
  }

  // Render dashboard based on user role
  switch (userProfile.role) {
    case "admin":
      return (
        <AnimatedSection>
          <AdminDashboard
            users={users?.users || null}
            cars={cars?.cars || null}
            bookings={bookings?.bookings || null}
            loading={isLoading}
          />
        </AnimatedSection>
      )
    case "manager":
      return (
        <AnimatedSection>
          <OwnerDashboard
            ownerCars={cars?.cars?.filter((c) => c.managerId === userProfile.id) || null}
            ownerBookings={bookings?.bookings || null}
            carsLoading={isLoading}
            bookingsLoading={isLoading}
            user={userProfile}
          />
        </AnimatedSection>
      )
    case "driver":
      return (
        <AnimatedSection>
          <DriverDashboard
            driver={userProfile}
            cars={cars?.cars || null}
            bookings={bookings?.bookings || null}
            loading={isLoading}
          />
        </AnimatedSection>
      )
    case "renter":
    default:
      return (
        <AnimatedSection>
          <RenterDashboard
            renter={userProfile}
            cars={cars?.cars || null}
            bookings={bookings?.bookings || null}
            loading={isLoading}
          />
        </AnimatedSection>
      )
  }
}
