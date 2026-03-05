import CollaborationRequest from "../models/collaborationRequest.model.js";
import Notification from "../models/notification.model.js";
import { User } from "../models/user.model.js";
import mongoose from "mongoose";



// Get request for current user as investor or entrepreneur
export const getRequest = async (req, res) => {
    try {
        const { id, role } = req.user;
        let query = {};

        // Determine the query based on the user's role
        if (role === "investor") {
            query = { investorId: id };
        } else if (role === "entrepreneur") {
            query = { entrepreneurId: id };
        } else {
            return res.status(400).json({ success: false, message: "Invalid user role" });
        }
        
        // Fetch collaboration requests based on the user's role
        const collaborations = await CollaborationRequest.find(query).sort({ createdAt: -1 }).lean();

        // fetch user details for each collaboration request
        const collaborationsWithUserDetails = await Promise.all(collaborations.map(async (collab) => {
            const otherUserId = role === "investor" ? collab.entrepreneurId : collab.investorId;
            const otherUser = await User.findById(otherUserId).select("id name email role avatarUrl isOnline").lean();
            return { ...collab, otherUser };
        }));
        return res.status(200).json({ success: true, collaborations: collaborationsWithUserDetails });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// Create a new collaboration request
export const createCollaborationRequest = async (req, res) => {
    try {
        const { entrepreneurId, message } = req.body;
        const investorId = req.user.id;

        if(!entrepreneurId) {
            return res.status(400).json({ success: false, message: "Entrepreneur ID is required" });
        };

        const newRequest = new CollaborationRequest({
            id: new mongoose.Types.ObjectId(),
            investorId,
            entrepreneurId,
            message,
            status: "pending",
            createdAt: new Date().toISOString(),
        });

        await newRequest.save();

        // Create a notification for the entrepreneur
        const notification = new Notification({
            id: new mongoose.Types.ObjectId(),
            userId: entrepreneurId,
            type: "collaboration_request",
            title: `You have a new collaboration request`,
            message: `Sent you a request from ${req.user.name}`,
            link: '/dashboard/entrepreneur',
            isRead: false,
            createdAt: new Date().toISOString(),
        });

        await notification.save();
        return res.status(201).json({ success: true, message: "Collaboration request sent successfully", collaborationRequest: newRequest });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// Update collaboration request status (accept)
export const updateCollaborationRequestStatus = async (req, res) => {
    try {
        const { requestId } = req.params;
        const { status } = req.body;

        if (!["accepted", "rejected"].includes(status)) {
            return res.status(400).json({ success: false, message: "Invalid status value" });
        }

        const request = await CollaborationRequest.findOneAndUpdate(
            { requestId },
            { $set: { status } },
            { new: true }
        )

        if (!request) {
            return res.status(404).json({ success: false, message: "Collaboration request not found" });
        }

        // Create a notification for the investor
        const targetUserId = req.user?.role === "entrepreneur" ? request.investorId : request.entrepreneurId;
        
        const notification = new Notification({
            id: new mongoose.Types.ObjectId(),
            userId: targetUserId,
            type: status === "accepted" ? "collaboration_accepted" : "collaboration_rejected",
            title: `Your collaboration request has been ${status}`,
            message: `${req.user.name} has ${status} your collaboration request.`,
            link: 
                req.user?.role === "entrepreneur"
                ? '/dashboard/investor'
                : '/dashboard/entrepreneur',
            isRead: false,
            createdAt: new Date().toISOString(),
        });

        await notification.save();
        return res.status(200).json({ success: true, message: `Collaboration request ${status} successfully`, collaborationRequest: request });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error" });   
    }
};