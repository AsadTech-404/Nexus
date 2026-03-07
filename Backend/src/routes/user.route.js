import express from "express";
import { getConnectedUsers, getEntrepreneurs, getUserProfile, profile, searchUsers, updateProfile } from "../controller/user.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const userRoute = express.Router();

// Test route
userRoute.get("/", (req, res) => {
    res.json({ message: "User route is working!" });
});

userRoute.get('/profile', authenticate, profile);
userRoute.get('/entrepreneurs', authenticate, getEntrepreneurs);
userRoute.get('/search', authenticate, searchUsers);
userRoute.get('/connected-users', authenticate, getConnectedUsers);
userRoute.get('/:id', authenticate, getUserProfile);
userRoute.put('/update-profile', authenticate, updateProfile);

export default userRoute;