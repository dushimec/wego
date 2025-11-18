"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bell, Trash2, Check } from "lucide-react"
import type { Notification } from "@/lib/types"

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch("/api/notifications")
        if (!response.ok) throw new Error("Failed to fetch notifications")
        const data = await response.json()
        setNotifications(data.notifications)
        setUnreadCount(data.notifications.filter((n: any) => !n.read).length)
      } catch (error) {
        console.error("[v0] Error fetching notifications:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchNotifications()
  }, [])

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await fetch(`/api/notifications/${notificationId}/read`, { method: "PUT" })
      setNotifications((prev) => prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n)))
      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch (error) {
      console.error("[v0] Error marking notification as read:", error)
    }
  }

  const handleDelete = async (notificationId: string) => {
    try {
      await fetch(`/api/notifications/${notificationId}`, { method: "DELETE" })
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId))
    } catch (error) {
      console.error("[v0] Error deleting notification:", error)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          <h2 className="font-semibold text-lg">Notifications</h2>
          {unreadCount > 0 && <Badge className="ml-2">{unreadCount}</Badge>}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8 text-muted-foreground">Loading notifications...</div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">No notifications</div>
      ) : (
        notifications.map((notification) => (
          <Card key={notification.id} className={notification.read ? "" : "border-blue-200 bg-blue-50"}>
            <CardContent className="pt-4">
              <div className="flex gap-3 justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{notification.title}</h3>
                    {!notification.read && <Badge variant="default">New</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {new Date(notification.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex gap-2">
                  {!notification.read && (
                    <Button size="sm" variant="ghost" onClick={() => handleMarkAsRead(notification.id)}>
                      <Check className="w-4 h-4" />
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => handleDelete(notification.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
}
