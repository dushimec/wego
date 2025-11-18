"use client"

import type React from "react"

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Logo } from "./logo"
import { usePathname } from "next/navigation"
import { useAuthWithProfile } from "@/hooks/use-auth-with-profile"
import { AdminSidebarFooter } from "./admin-sidebar-footer"

type DashboardLayoutProps = {
  children: React.ReactNode
  navItems?: {
    href: string
    label: string
    icon: string
  }[]
}

function DashboardLayout({ children, navItems = [] }: DashboardLayoutProps) {
  const pathname = usePathname()
  const { userProfile } = useAuthWithProfile()

  const getRoleBasedNavItems = (role: string) => {
    const baseItems = [{ href: "/profile", label: "Profile", icon: "person" }]

    const roleSpecificItems = {
      admin: [
        { href: "/admin", label: "Overview", icon: "dashboard" },
        { href: "/admin/vehicles", label: "Vehicles", icon: "directions_car" },
        { href: "/admin/drivers", label: "Drivers", icon: "people" },
        { href: "/admin/bookings", label: "Bookings", icon: "calendar_today" },
        { href: "/admin/reports", label: "Reports", icon: "assessment" },
      ],
      manager: [
        { href: "/dashboard", label: "Overview", icon: "dashboard" },
        { href: "/dashboard/vehicles", label: "Vehicles", icon: "directions_car" },
        { href: "/dashboard/drivers", label: "Drivers", icon: "people" },
        { href: "/dashboard/bookings", label: "Bookings", icon: "calendar_today" },
      ],
      driver: [
        { href: "/dashboard/driver", label: "My Trips", icon: "route" },
        { href: "/dashboard/driver/history", label: "History", icon: "history" },
      ],
      renter: [
        { href: "/dashboard/renter", label: "My Bookings", icon: "calendar_today" },
        { href: "/browse", label: "Browse Cars", icon: "search" },
        { href: "/map", label: "Find Nearby", icon: "map" },
        { href: "/dashboard/renter/history", label: "History", icon: "history" },
      ],
    }

    return [...baseItems, ...(roleSpecificItems[role] || [])]
  }

  const navItemsToUse = navItems.length > 0 ? navItems : getRoleBasedNavItems(userProfile?.role || "renter")

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <Sidebar>
          <SidebarHeader>
            <div className="hidden md:block">
              <Logo />
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {navItemsToUse.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton href={item.href} isActive={pathname === item.href} asChild tooltip={item.label}>
                    <a href={item.href}>
                      <span className="material-symbols-outlined">{item.icon}</span>
                      <span>{item.label}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <AdminSidebarFooter />
        </Sidebar>
        <main className="flex-1 flex flex-col">
          <div className="p-2 md:hidden">
            <SidebarTrigger />
          </div>
          <div className="flex-1 overflow-auto container mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  )
}

export { DashboardLayout }
export default DashboardLayout
