import express from "express";
import { forgotPassword, login, logout, register, resetPassword, updatePassword } from "../controller/auth.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { loginValidationRules, registerValidationRules } from "../middleware/validation.middleware.js";

const authRoute = express.Router();

// Test route
authRoute.get("/", (req, res) => {
    res.json({ message: "Auth route is working!" });
});

authRoute.post("/register", registerValidationRules, register);
authRoute.post("/login", loginValidationRules, login);
authRoute.post('/logout', authenticate, logout);
authRoute.post('/forgot-password', forgotPassword);
authRoute.post('/reset-password', resetPassword);
authRoute.put('/update-password', authenticate, updatePassword);

export default authRoute;