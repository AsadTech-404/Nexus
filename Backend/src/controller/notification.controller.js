
import Notification from './../models/notification.model.js';

// Get all notification for current user
export const getNotifications = async (req, res) => {
    try {
        const userId = req.user.id;
        const senderId = req.user._id;

        if(!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const notifications = await Notification.find({ userId, senderId }).populate("senderId", "name avatarUrl").sort({ createdAt: -1 });
        return res.status(200).json({ success: true, notifications });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// Mark notification as read
export const markNotificationAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        if(!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const notification = await Notification.findOneAndUpdate(
            { _id: id, userId },
            { $set: { isRead: true } },
            { new: true }
        );

        if(!notification) {
            return res.status(404).json({ success: false, message: "Notification not found" });
        }

        return res.status(200).json({ success: true, message: "Notification marked as read" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async (req, res) => {
    try {
        const userId = req.user.id;

        if(!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        await Notification.updateMany(
            { userId, isRead: false },
            { $set: { isRead: true } }
        );

        return res.status(200).json({ success: true, message: "All notifications marked as read" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// Delete notification
export const deleteNotification = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        if(!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" })
        }

        const notification = await Notification.findOneAndDelete({ _id: id, userId });
        if(!notification) {
            return res.status(404).json({ success: false, message: "Notification not found" });
        }

        return res.status(200).json({ success: true, message: "Notification deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};