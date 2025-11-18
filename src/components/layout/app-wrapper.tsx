"use client"

import type { ReactNode } from "react"
import { useAuthWithProfile } from "@/hooks/use-auth-with-profile"
import Header from "./header"
import Footer from "./footer"
import { DashboardLayout } from "../dashboard-layout"

interface AppWrapperProps {
  children: ReactNode
}

export function AppWrapper({ children }: AppWrapperProps) {
  const { user, userProfile, isLoading } = useAuthWithProfile()

  // Show dashboard layout for admin and manager
  const isAdminOrManager = !isLoading && user && (userProfile?.role === "admin" || userProfile?.role === "manager")

  if (isAdminOrManager) {
    return <DashboardLayout>{children}</DashboardLayout>
  }

  // Show normal layout with header and footer for other users
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}

export default AppWrapper
