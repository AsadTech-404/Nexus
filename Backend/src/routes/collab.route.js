import express from "express";
import { createCollaborationRequest, getRequest, updateCollaborationRequestStatus } from "../controller/collaboration.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { collaborationRequestValidationRules, validateRequest } from "../middleware/validation.middleware.js";

const collabRoute = express.Router();

// Test route
collabRoute.get("/", (req, res) => {
    res.json({ message: "Collaboration route is working!" });
});

collabRoute.get('/request', authenticate, getRequest);
collabRoute.post('/new-request', authenticate, collaborationRequestValidationRules, validateRequest, createCollaborationRequest);
collabRoute.put('/:id/update-status', authenticate, updateCollaborationRequestStatus);

export default collabRoute;