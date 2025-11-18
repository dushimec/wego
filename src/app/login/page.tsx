"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/firebase"
import { signInWithEmailAndPassword } from "firebase/auth"
import { useAuthWithProfile } from "@/hooks/use-auth-with-profile"

export default function LoginPage() {
  const router = useRouter()
  const auth = useAuth()
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const { user, userProfile, isLoading } = useAuthWithProfile()

  // Redirect based on user role
  useEffect(() => {
    const redirectPaths = {
      admin: "/admin",
      manager: "/dashboard",
      driver: "/dashboard/driver",
      renter: "/browse",
    }
    if (userProfile) {
      router.push(redirectPaths[userProfile.role])
    }
  }, [userProfile, router])

  useEffect(() => {
    if (!isLoading && user && userProfile) {
      toast({
        title: "Login Successful",
        description: `Welcome back, ${userProfile.displayName}!`,
      })

      // Role-based redirection
      switch (userProfile.role) {
        case "admin":
          router.push("/admin")
          break
        case "manager":
          router.push("/dashboard")
          break
        case "driver":
          router.push("/dashboard/driver")
          break
        case "renter":
        default:
          router.push("/browse")
          break
      }
    }
  }, [user, userProfile, isLoading, router, toast])

  const handleLogin = async () => {
    if (!auth) return
    setIsLoggingIn(true)
    signInWithEmailAndPassword(auth, email, password).catch((error) => {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: error.message,
      })
      setIsLoggingIn(false)
    })
  }

  const isButtonDisabled = isLoggingIn || isLoading || !email || !password

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-14rem)] py-12">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>Enter your email below to login to your account.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="dushime@gmail.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col">
          <Button className="w-full" onClick={handleLogin} disabled={isButtonDisabled}>
            {(isLoggingIn || isLoading) && (
              <span className="material-symbols-outlined mr-2 h-4 w-4 animate-spin">progress_activity</span>
            )}
            Sign in
          </Button>
          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="underline">
              Sign up
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
