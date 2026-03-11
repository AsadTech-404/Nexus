import CollaborationRequest from "../models/collaborationRequest.model.js";
import Meeting from "../models/meeting.model.js";
import Message from "../models/message.model.js";
import { User } from "../models/user.model.js";

export const getDashboardSummary = async (req, res) => {
    try {
        const userId = req.user._id;
        const role = req.user.role;

        // 1. Run counts in parallel for maximum speed
        const [pendingCount, connectionCount, unreadCount, meetingCount, upcomingMeetings] = await Promise.all([
            // Pending Requests (Role-sensitive)
            CollaborationRequest.countDocuments({
                status: "pending",
                ...(role === "entrepreneur" ? { entrepreneurId: userId } : { investorId: userId })
            }),

            // Total Connections
            CollaborationRequest.countDocuments({
                status: "accepted",
                $or: [{ investorId: userId }, { entrepreneurId: userId }]
            }),

            // Unread Messages
            Message.countDocuments({
                receiverId: userId,
                isRead: false
            }),

            // Total Upcoming Meetings Count
            Meeting.countDocuments({
                $or: [{ investorId: userId }, { entrepreneurId: userId }],
                scheduledTime: { $gte: new Date().toISOString() },
                status: { $in: ["pending", "accepted"] }
            }),

            // Actual Meeting Data (Limit 5)
            Meeting.find({
                $or: [{ investorId: userId }, { entrepreneurId: userId }],
                scheduledTime: { $gte: new Date().toISOString() },
                status: { $in: ["pending", "accepted"] }
            })
            .sort({ scheduledTime: 1 })
            .limit(5)
            .populate("investorId", "name avatarUrl isOnline") 
            .lean()
        ]);

        // 2. Build the response object
        const stats = {
            pendingRequests: pendingCount,
            totalConnections: connectionCount,
            unreadMessages: unreadCount,
            upcomingMeetingsCount: meetingCount,
            meetings: upcomingMeetings,
        };

        // 3. Add Role-Specific Metrics
        if (role === "entrepreneur") {
            stats.profileViews = 24 + Math.floor(Math.random() * 100); 
        } else {
            // Investors see platform-wide growth stats
            const [totalStartups] = await Promise.all([
                User.countDocuments({ role: "entrepreneur" }),
            ]);
            stats.platformStartups = totalStartups;
        }

        return res.status(200).json({ success: true, stats });
    } catch (error) {
        console.error("Dashboard Error:", error);
        res.status(500).json({ success: false, message: "Error fetching summary" });
    }
};