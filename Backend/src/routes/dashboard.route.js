import exress from "express";
import { getDashboardSummary } from "../controller/dashboard.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const dashboardRoute = exress.Router();

// Test route
dashboardRoute.get("/", (req, res) => {
    res.json({ message: "Dashboard route is working!" });
});

dashboardRoute.get('/summary', authenticate, getDashboardSummary);

export default dashboardRoute;