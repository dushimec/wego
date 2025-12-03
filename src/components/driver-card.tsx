'use client'

import Image from "next/image"
import Link from "next/link"
import type { Driver } from "@/lib/types"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "./ui/skeleton"
import { cn } from "@/lib/utils"

type DriverCardProps = {
  driver: Driver | null
}

function DriverCard({ driver }: DriverCardProps) {
  if (!driver) {
    return (
      <Card className="group relative flex flex-col overflow-hidden transition-all duration-300 shadow-lg">
        <CardHeader className="p-0">
          <Skeleton className="h-56 w-full" />
        </CardHeader>
        <CardContent className="flex-grow p-4">
          <Skeleton className="h-6 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2 mb-3" />
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
          </div>
        </CardContent>
        <CardFooter className="p-4 flex items-center justify-between bg-secondary/30">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-10 w-24" />
        </CardFooter>
      </Card>
    )
  }

  const availabilityStyles = {
    true: "bg-green-500/20 text-green-400 border-green-500/30",
    false: "bg-red-500/20 text-red-400 border-red-500/30",
  }

  const isAvailable = driver.available

  return (
    <Card
      className={cn(
        "group relative flex flex-col overflow-hidden transition-all duration-300 hover:shadow-primary/20 shadow-lg",
        !isAvailable && "opacity-60 hover:opacity-80",
      )}
    >
      <CardHeader className="p-0">
        <Link href={`/drivers/${driver.id}`} className="block">
          <div className="relative h-56 w-full">
            <Image
              src={driver.profileImage || "/placeholder-user.jpg"}
              alt={`${driver.firstName} ${driver.lastName}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            <Badge className={cn("absolute top-3 right-3", availabilityStyles[isAvailable.toString() as 'true' | 'false'])}>
              {isAvailable ? "Available" : "Unavailable"}
            </Badge>
          </div>
        </Link>
      </CardHeader>
      <CardContent className="flex-grow p-4">
        <CardTitle className="text-xl mb-2">
          <Link href={`/drivers/${driver.id}`} className="hover:text-primary transition-colors">
            {driver.firstName} {driver.lastName}
          </Link>
        </CardTitle>
        <p className="text-sm text-muted-foreground mb-3">{driver.experience} years of experience</p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-lg text-primary">star</span>
            <span>{driver.rating?.toFixed(1) || "N/A"} Rating</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-lg text-primary">work</span>
            <span>{driver.totalTrips || 0} Trips</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-lg text-primary">language</span>
            <span>{driver.languages.join(", ")}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 flex items-center justify-between bg-secondary/30">
        <div>
          <span className="text-2xl font-bold">RWF {driver.rating && driver.experience ? (driver.rating * driver.experience * 1000).toLocaleString() : 'N/A'}</span>
          <span className="text-sm text-muted-foreground">/day</span>
        </div>
        <Button asChild disabled={!isAvailable}>
          <Link href={`/drivers/${driver.id}`}>{isAvailable ? "View Profile" : "Not Available"}</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

export { DriverCard }