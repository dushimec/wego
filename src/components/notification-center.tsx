"use client"

import { useState } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Bell, X, CheckCircle, AlertCircle, Info } from "lucide-react"
import type { Notification } from "@/lib/types"

interface NotificationCenterProps {
  notifications?: Notification[]
  unreadCount?: number
  onMarkAsRead?: (notificationId: string) => Promise<void>
  onClearAll?: () => Promise<void>
}

export function NotificationCenter({
  notifications = [],
  unreadCount = 0,
  onMarkAsRead,
  onClearAll,
}: NotificationCenterProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "booking_update":
      case "payment_update":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "driver_assignment":
      case "system_alert":
        return <Info className="w-4 h-4 text-blue-500" />
      case "cancellation":
        return <AlertCircle className="w-4 h-4 text-red-500" />
      default:
        return <Bell className="w-4 h-4 text-gray-500" />
    }
  }

  const getNotificationTypeLabel = (type: string): string => {
    return type
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      setIsLoading(true)
      await onMarkAsRead?.(notificationId)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClearAll = async () => {
    try {
      setIsLoading(true)
      await onClearAll?.()
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center"
              variant="destructive"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:w-96">
        <SheetHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b">
          <SheetTitle>Notifications</SheetTitle>
          {notifications.length > 0 && (
            <Button variant="ghost" size="sm" onClick={handleClearAll} disabled={isLoading}>
              Clear All
            </Button>
          )}
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-100px)] mt-4">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Bell className="w-12 h-12 text-muted-foreground/20 mb-4" />
              <p className="text-muted-foreground">No notifications yet</p>
            </div>
          ) : (
            <div className="space-y-2 pr-4">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 rounded-lg border transition-colors ${
                    notification.read ? "bg-background border-border" : "bg-blue-50 border-blue-200"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2 flex-1">
                      {getNotificationIcon(notification.type)}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm">{notification.title}</p>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{notification.message}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {new Date(notification.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    {!notification.read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMarkAsRead(notification.id)}
                        disabled={isLoading}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
