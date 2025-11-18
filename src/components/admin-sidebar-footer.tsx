"use client"

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { signOut } from "firebase/auth"
import { useAuth } from "@/firebase"
import { useToast } from "@/hooks/use-toast"
import { useAuthWithProfile } from "@/hooks/use-auth-with-profile"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { SidebarFooter } from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function AdminSidebarFooter() {
  const router = useRouter()
  const { toast } = useToast()
  const auth = useAuth()
  const { userProfile } = useAuthWithProfile()

  const handleLogout = () => {
    signOut(auth).then(() => {
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      })
      router.push("/")
    })
  }

  const getInitials = (name: string | null | undefined) => {
    if (!name) return "??"
    const names = name.split(" ")
    return names.length > 1 ? `${names[0][0]}${names[names.length - 1][0]}` : names[0].substring(0, 2)
  }

  return (
    <SidebarFooter>
      <div className="px-2 py-2 border-t">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs">{getInitials(userProfile?.displayName)}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start text-xs flex-1">
                <p className="font-medium">{userProfile?.displayName}</p>
                <p className="text-muted-foreground text-xs capitalize">{userProfile?.role}</p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="right" align="end" className="w-56">
            <DropdownMenuLabel>Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push("/profile")}>
              <span className="material-symbols-outlined mr-2 h-4 w-4">person</span>
              Profile Settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/dashboard")}>
              <span className="material-symbols-outlined mr-2 h-4 w-4">dashboard</span>
              Dashboard
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-600">
              <span className="material-symbols-outlined mr-2 h-4 w-4">logout</span>
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </SidebarFooter>
  )
}
