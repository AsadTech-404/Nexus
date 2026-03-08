import Notification from '../models/notification.model.js';
import { User } from '../models/user.model.js';
import Message from './../models/message.model.js';

// get current user message
export const getConversations = async (req, res) => {
    try {
        const userId = req.user._id;

        if(!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const messages = await Message.find({
            $or: [
                { senderId: userId },
                { receiverId: userId }
            ]
        }).sort({ timestamp: -1 });

        const conversationMap = new Map();

        for(const message of messages) {
            const otherUserId = message.senderId.toString() === userId.toString() ? message.receiverId : message.senderId;
            if(!conversationMap.has(otherUserId)) {
                const otherUser = await User.findOne({ _id: otherUserId }).select("name avatarUrl isOnline");
            if(otherUser) {
                conversationMap.set(otherUserId.toString(), {
                    id: otherUser._id,
                    otherUser: {
                        id: otherUser._id,
                        name: otherUser.name,
                        avatarUrl: otherUser.avatarUrl,
                        isOnline: otherUser.isOnline,
                    },
                    lastMessage: message,
                    updatedAt: message.updatedAt,
                });
            }
        }            
    }
    const conversations = Array.from(conversationMap.values());
    return res.status(200).json({ success: true, conversations });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// get messages between two users
export const getMessages = async (req, res) => {
    try {
        const userId = req.user._id;
        const { otherUserId } = req.params;

        if(!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const messages = await Message.find({
            $or: [
                { senderId: userId, receiverId: otherUserId },
                { senderId: otherUserId, receiverId: userId }
            ]
            }).sort({ timestamp: 1 });

            await Message.updateMany(
                { senderId: userId, receiverId: otherUserId, isRead: false },
                { $set: { isRead: true } },
            )

            return res.status(200).json({ success: true, messages });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// send message
export const sendMessage = async (req, res) => {
    try {
        const { content, receiverId } = req.body;
        const senderId = req.user._id;

        if(!senderId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const newMessage = new Message({
            senderId,
            receiverId,
            content,
            isRead: false,
            timestamp: new Date().toISOString(),
        });

        await newMessage.save();

        const sender = await User.findOne({ _id: senderId }).select("name");

        const notification = new Notification({
            userId: receiverId,
            type: "message",
            title: `New message from ${sender.name}`,
            message: `You have a new message from ${sender.name}`,
            link: `/chat/${senderId}`,
            isRead: false,
        });

        await notification.save();

        return res.status(201).json({ success: true, message: "Message sent successfully", newMessage });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// total message count
export const getTotalMessageCount = async (req, res) => {
    try {
        const userId = req.user._id;

        if(!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const totalMessages = await Message.countDocuments({
            receiverId: userId,
            isRead: false,
        });

        return res.status(200).json({ success: true, totalMessages });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};