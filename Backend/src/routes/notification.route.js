import express from "express";
import { authenticate } from './../middleware/auth.middleware.js';
import { deleteNotification, getNotifications, markAllNotificationsAsRead, markNotificationAsRead } from "../controller/notification.controller.js";

const notificationRoute = express.Router();

// Test route
notificationRoute.get("/", (req, res) => {
    res.json({ message: "Notification route is working!" });
});

notificationRoute.get("/notifications", authenticate, getNotifications);
notificationRoute.put("/:id/read", authenticate, markNotificationAsRead);
notificationRoute.put("/read-all", authenticate, markAllNotificationsAsRead);
notificationRoute.delete("/:id", authenticate, deleteNotification);

export default notificationRoute;