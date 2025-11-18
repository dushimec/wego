"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import React from "react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { Logo } from "@/components/logo"
import { useAuth } from "@/firebase"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "../ui/avatar"
import { signOut } from "firebase/auth"
import { useToast } from "@/hooks/use-toast"
import { useAuthWithProfile } from "@/hooks/use-auth-with-profile"
import { NotificationBell } from "@/components/notification-bell"

const baseNavLinks = [
  { href: "/browse", label: "Browse Cars" },
  { href: "/recommendations", label: "Smart Recommendations" },
  { href: "/map", label: "Map" },
]

function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const { toast } = useToast()
  const [isSheetOpen, setIsSheetOpen] = React.useState(false)
  const { user, userProfile, isLoading } = useAuthWithProfile()
  const auth = useAuth()

  const handleLogout = () => {
    signOut(auth).then(() => {
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      })
      router.push("/")
    })
  }

  const getNavLinks = () => {
    if (!user) {
      return baseNavLinks
    }

    if (isLoading || !userProfile) {
      return []
    }

    switch (userProfile.role) {
      case "admin":
        return [{ href: "/admin", label: "Admin Dashboard" }]
      case "manager":
        return [{ href: "/dashboard", label: "Manager Dashboard" }]
      case "driver":
        return [{ href: "/dashboard/driver", label: "My Trips" }]
      case "renter":
      default:
        return [...baseNavLinks, { href: "/dashboard/renter", label: "My Bookings" }]
    }
  }

  const navLinks = getNavLinks()

  const getInitials = (name: string | null | undefined) => {
    if (!name) return "??"
    const names = name.split(" ")
    return names.length > 1 ? `${names[0][0]}${names[names.length - 1][0]}` : names[0].substring(0, 2)
  }

  const showSearchBar = !user || userProfile?.role === "renter"

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center px-4 sm:px-6 lg:px-8">
        <div className="flex w-full items-center justify-between gap-4">
          {/* Mobile Menu */}
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <span className="material-symbols-outlined">menu</span>
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="pr-0 sm:max-w-xs">
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              <div className="p-4 mb-4">
                <Logo />
              </div>
              <div className="space-y-4 py-4">
                <div className="px-3 py-2">
                  <div className="space-y-1">
                    {navLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setIsSheetOpen(false)}
                        className={cn(
                          "block rounded-md px-3 py-2 text-base font-medium transition-colors",
                          pathname === link.href
                            ? "bg-accent text-accent-foreground"
                            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                        )}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <div className="hidden md:block flex-shrink-0">
            <Logo />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex flex-1 items-center justify-center space-x-1 text-sm font-medium">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-3 py-2 rounded-md transition-colors",
                  pathname === link.href
                    ? "bg-accent text-accent-foreground"
                    : "text-foreground/60 hover:text-foreground hover:bg-accent/50",
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right side items */}
          <div className="flex items-center justify-end space-x-2 flex-shrink-0">
            <div className="hidden sm:flex items-center">
              <NotificationBell />
            </div>

            {isLoading ? (
              <div className="h-9 w-9 rounded-full bg-muted animate-pulse" />
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback>{getInitials(userProfile?.displayName)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{userProfile?.displayName}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push("/dashboard/renter")}>
                    <span className="material-symbols-outlined mr-2 h-4 w-4">dashboard</span>
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push("/profile")}>
                    <span className="material-symbols-outlined mr-2 h-4 w-4">person</span>
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <span className="material-symbols-outlined mr-2 h-4 w-4">logout</span>
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex gap-2">
                <Button variant="ghost" asChild size="sm">
                  <Link href="/login">Login</Link>
                </Button>
                <Button asChild size="sm">
                  <Link href="/signup">Sign Up</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export { Header }
export default Header
