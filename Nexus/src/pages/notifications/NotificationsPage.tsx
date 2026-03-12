import React, { useEffect, useState } from "react";
import { Bell, MessageCircle, UserPlus } from "lucide-react";
import { Card, CardBody } from "../../components/ui/Card";
import { Avatar } from "../../components/ui/Avatar";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import axios from "axios";
import { Notification } from "../../types";

const api = axios.create({
  baseURL: "http://localhost:8000/api",
  withCredentials: true
});

export const NotificationsPage: React.FC = () => {

  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await api.get("/notification/notifications")
        setNotifications(res.data.notifications)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    fetchNotifications()
  }, [])

  const handleMarkAll = async () => {
    try {
      await api.put("/notification/read-all")

      setNotifications(prev =>
        prev.map(n => ({ ...n, isRead: true }))
      )
    } catch (error) {
      console.error(error)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "message":
        return <MessageCircle size={16} className="text-primary-600" />

      case "collaboration-request":
        return <UserPlus size={16} className="text-secondary-600" />

      case "meeting-scheduled":
        return <Bell size={16} className="text-accent-600" />

      default:
        return <Bell size={16} className="text-gray-600" />
    }
  }

  if (loading) {
    return <div className="text-center py-10">Loading notifications...</div>
  }

  return (
    <div className="space-y-6 animate-fade-in">

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600">
            Stay updated with your network activity
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={handleMarkAll}>
          Mark all as read
        </Button>
      </div>

      <div className="space-y-4">

        {notifications.length === 0 && (
          <div className="text-center py-10 text-gray-500">
            <Bell size={40} className="mx-auto mb-4 text-gray-300" />
            No notifications yet
          </div>
        )}

        {notifications.map(notification => {

          const sender = notification.senderId

          return (
            <Card
              key={notification.id}
              className={`cursor-pointer transition ${
                !notification.isRead ? "bg-primary-50" : ""
              }`}
            >
              <CardBody className="flex items-start p-4">

                <Avatar
                  src={sender?.avatarUrl || "/images/default-avatar.png"}
                  alt={sender?.name}
                  size="md"
                  className="mr-4"
                />

                <div className="flex-1">

                  <div className="flex items-center gap-2">

                    <span className="font-medium text-gray-900">
                      {sender?.name}
                    </span>

                    {!notification.isRead && (
                      <Badge variant="primary" size="sm" rounded>
                        New
                      </Badge>
                    )}

                  </div>

                  <p className="text-gray-600 mt-1">
                    {notification.message}
                  </p>

                  <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                    {getNotificationIcon(notification.type)}

                    <span>
                      {new Date(notification.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                </div>
              </CardBody>
            </Card>
          )
        })}

      </div>
    </div>
  )
}