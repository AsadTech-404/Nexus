import CollaborationRequest from "../models/collaborationRequest.model.js";
import { User } from "../models/user.model.js";
import mongoose from "mongoose";

// Get current user profile
export const profile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password -__v");

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        return res.status(200).json({ success: true, user });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};


// Search users by name, email, or ID (excluding the current user)
export const searchUsers = async (req, res) => {
    try {
        const { query } = req.query;
        const searchQuery = query || ""; 

        // Query against the actual database field: _id
        const searchCriteria = {
            _id: { $ne: req.user._id } // Assuming req.user was populated by your auth middleware
        }; 

        if (searchQuery.trim()) {
            const orConditions = [
                { name: { $regex: searchQuery, $options: "i" } },
                { email: { $regex: searchQuery, $options: "i" } },
            ];

            // ONLY add _id to the search if the query looks like a valid MongoDB ID
            if (mongoose.isValidObjectId(searchQuery.trim())) {
                orConditions.push({ _id: searchQuery.trim() });
            }

            searchCriteria.$or = orConditions;
        }

        // Mongoose includes _id by default, and our Schema transforms it to 'id' automatically
        const users = await User.find(searchCriteria)
            .select("name email avatarUrl role") 
            .limit(10);

        return res.status(200).json({ success: true, users });
    } catch (error) {
        console.error("Search Users Error:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// Get connected users (accepted collaborations)
export const getConnectedUsers = async (req, res) => {
    try {
        const { id } = req.user; // Assuming req.user is populated by your auth middleware

        // Find all accepted collaboration requests where the current user is either the investor or entrepreneur
        const acceptedRequests = await CollaborationRequest.find({
            status: "accepted",
            $or: [
                { investorId: id },
                { entrepreneurId: id },
            ],
            
        }) 

        // Accepted requests count
        const acceptedCount = acceptedRequests.length;

        // Extract the IDs of connected users from the accepted collaboration requests
        const connectedUserIds = acceptedRequests.map(request => {
             request.investorId === id ? request.entrepreneurId : request.investorId;
        });

        // Unique connected user IDs (in case of multiple collaborations with the same user)
        const uniqueConnectedUserIds = [...new Set(connectedUserIds)];

        // Fetch the connected users details using the extracted IDs
        const connectedUsers = await User.find({ _id: { $in: connectedUserIds } })
            .select("name email avatarUrl role startupName industry") 
            .lean();

        return res.status(200).json({ success: true, connectedUsers, acceptedCount, totalConnections: uniqueConnectedUserIds.length });
    } catch (error) {
        console.error("Error fetching connected users:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// Get user profile by ID
export const getUserProfile = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id).select("-password -__v");

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        return res.status(200).json({ success: true, user });
    } catch (error) {
        console.error("Error fetching user profile:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// Update user profile
export const updateProfile = async (req, res) => {
    try {
        const { email, password, id, role, ...otherfields } = req.body; // Exclude fields that should not be updated



        const updatedUser = await User.findOneAndUpdate(
            req.user._id,
            { $set: otherfields }, // Only update the allowed fields
            { new: true, runValidators: true } // Return the updated document and run validators
        ).select("-password -__v"); // Exclude sensitive fields from the response 

        if (!updatedUser) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        return res.status(200).json({ success: true, user: updatedUser });
    } catch (error) {
        console.error("Error updating user profile:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

