import express from "express";
import { authenticate } from './../middleware/auth.middleware.js';
import { getMeetingById, getMeetings, scheduleMeeting, updateMeetingStatus } from "../controller/meeting.controller.js";

const meetingRoute = express.Router();

// Test route
meetingRoute.get("/", (req, res) => {
    res.json({ message: "Meeting route is working!" });
});

meetingRoute.get("/all-meetings", authenticate, getMeetings);
meetingRoute.post("/schedule", authenticate, scheduleMeeting);
meetingRoute.put("/:id/update-status", authenticate, updateMeetingStatus);
meetingRoute.get("/:id", authenticate, getMeetingById);

export default meetingRoute;