import express from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { getConversations, getMessages, getTotalMessageCount, sendMessage } from "../controller/message.controller.js";

const messageRoute = express.Router();

// Test route
messageRoute.get("/", (req, res) => {
    res.json({ message: "Message route is working!" });
});

messageRoute.get('/messages', authenticate, getConversations);
messageRoute.get('/:otherUserId', authenticate, getMessages);
messageRoute.post('/send-message', authenticate, sendMessage);
messageRoute.get('/total-messages', authenticate, getTotalMessageCount);

export default messageRoute;