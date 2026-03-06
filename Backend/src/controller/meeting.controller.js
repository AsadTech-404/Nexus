import Notification from "../models/notification.model.js";
import Meeting from "./../models/meeting.model.js";
import mongoose from "mongoose";

// Get all current user meeting
export const getMeetings = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const meetings = await Meeting.find({
      $or: [{ investorId: userId }, { entrepreneurId: userId }],
    }).sort({ scheduledTime: 1 });

    return res.status(200).json({ success: true, meetings });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

// Meeting schedule
export const scheduleMeeting = async (req, res) => {
  try {
    const {
      title,
      description,
      investorId,
      entrepreneurId,
      scheduledTime,
      endTime,
      location,
    } = req.body;

    const currUserId = req.user.id;

    if (currUserId !== entrepreneurId && currUserId !== investorId) {
      return res
        .status(403)
        .json({ success: false, message: "Unauthorized participant" });
    }

    // Conflict detection
    const conflictMeeting = await Meeting.findOne({
      status: { $in: ["pending", "accepted"] },
      $or: [{ investorId }, { entrepreneurId }],
      scheduledTime: { $lt: endTime },
      endTime: { $gt: scheduledTime },
    });

    if (conflictMeeting) {
      return res
        .status(400)
        .json({ success: false, message: "Time slot already booked" });
    }

    const newMeeting = new Meeting({
      title,
      description,
      investorId,
      entrepreneurId,
      scheduledTime,
      endTime,
      location,
      status: "pending",
    });
    await newMeeting.save();

    // Create other user notification
    const notification = new Notification({
      id: new mongoose.Types.ObjectId(),
      userId: entrepreneurId === currUserId ? investorId : entrepreneurId,
      type: "meeting-scheduled",
      title: `You have a new meeting scheduled`,
      message: `${req.user.name} has scheduled a meeting with you.`,
      link: "/meetings",
      isRead: false,
      createdAt: new Date().toISOString(),
    });
    await notification.save();

    return res
      .status(201)
      .json({
        success: true,
        message: "Meeting scheduled successfully",
        newMeeting,
      });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

// Update meeting status
export const updateMeetingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (!["accepted", "declined", "canceled"].includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid status value" });
    }

    const meeting = await Meeting.findOneAndUpdate(
      { _id: id, $or: [{ investorId: userId }, { entrepreneurId: userId }] },
      { $set: { status } },
      { new: true },
    );

    if (!meeting) {
      return res
        .status(404)
        .json({ success: false, message: "Meeting not found" });
    }

    if (meeting.investorId !== userId && meeting.entrepreneurId !== userId) {
      return res
        .status(403)
        .json({
          success: false,
          message: "You are not authorized to update this meeting",
        });
    }
    meeting.status = status;
    await meeting.save();

    // Create other user notification
    const notification = new Notification({
      id: new mongoose.Types.ObjectId(),
      userId:
        meeting.investorId === userId
          ? meeting.entrepreneurId
          : meeting.investorId,
      type: "meeting-status",
      title: `Your meeting has been ${status}`,
      message: `${req.user.name} has ${status} your meeting.`,
      link: "/meetings",
      isRead: false,
    });
    await notification.save();
    return res
      .status(200)
      .json({
        success: true,
        message: `Meeting status updated successfully`,
        meeting,
      });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

// Get meeting by id
export const getMeetingById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const meeting = await Meeting.findOne({
      _id: id,
      $or: [{ investorId: userId }, { entrepreneurId: userId }],
    });

    if (!meeting) {
      return res
        .status(404)
        .json({ success: false, message: "Meeting not found" });
    }

    return res.status(200).json({ success: true, meeting });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};
