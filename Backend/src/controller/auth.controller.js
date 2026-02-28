import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import validator from "validator";
import { generateToken } from "../config/token.js";
import jwt from 'jsonwebtoken';

// Register a new user
export const register = async (req, res) => {
    try {
        const { name, email, password, confirmPassword, role, isOnline, ...rest } = req.body;

        // Check existing user
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "User already exists" });
        }

        // Check email is valid
        if(!validator.isEmail(email)) {
            return res.status(400).json({ success: false, message: "Invalid email address" });
        }

        // CHeck password length
        if(password.length < 6) {
            return res.status(400).json({ success: false, message: "Password must be at least 6 characters long" });
        }

        // Check password and confirm password match
        if(password !== confirmPassword) {
            return res.status(400).json({ success: false, message: "Passwords do not match" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            avatarUrl: rest.avatarUrl || "https://via.placeholder.com/150",
            bio: rest.bio || "",
            role,
            isOnline: true,
            ...rest, // Spread any additional fields from the request body
            createdAt: new Date().toISOString(),
        })
        await newUser.save();

        const token = generateToken(newUser);

       res.cookie("token", token, {
            httpOnly: true,     // Prevents XSS (JavaScript can't read this)
            secure: false,      // Set to TRUE only if using HTTPS (keep false for localhost)
            sameSite: "lax",    // Essential for cross-origin requests like localhost:5173 -> :8000
            maxAge: 24 * 60 * 60 * 1000 // 1 day
        });

        res.status(201).json({ success: true, message: "User registered successfully", newUser });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// Login user
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check user exists
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ success: false, message: "User does not exist" });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Invalid credentials" });
        }

        user.isOnline = true;
        await user.save();

        const token = generateToken(user);

        res.cookie("token", token, {
            httpOnly: true,     // Prevents XSS (JavaScript can't read this)
            secure: false,      // Set to TRUE only if using HTTPS (keep false for localhost)
            sameSite: "lax",    // Essential for cross-origin requests like localhost:5173 -> :8000
            maxAge: 24 * 60 * 60 * 1000 // 1 day
        });

        res.status(200).json({ success: true, message: "Login successful", user });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}

// Logout user
export const logout = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if(user) {
            user.isOnline = false;
            await user.save();
        }
        res.clearCookie("token");
        return res.status(200).json({ success: true, message: "Logout successful" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Internal server error" });  
    }
};

// Forgot password
export const forgotPassword = async (req, res) => {
    try {
            const { email } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ success: false, message: "User does not exist" });
        }

        // Here you would generate a password reset token and send an email to the user with instructions on how to reset their password.
        const resetToken = generateToken(user, "30m"); // Generate a token that expires in 30 minutes
        
        await sendPasswordResetEmail(user.email, resetToken); // Implement this function to send the email
        return res.status(200).json({ success: true, message: "Password reset instructions sent to email" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// Reset password
export const resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        // Here you would verify the reset token and find the corresponding user
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Hash the new password and update the user's password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        
        const updatedUser = await User.findOneAndUpdate(
            { id: user.id }, // Use the user's ID from the decoded token
            { $set: { password: hashedPassword } }, // Update the password field
            { new: true, runValidators: true } // Return the updated document and run validators
        ).select("-password -__v"); // Exclude sensitive fields from the response

        return res.status(200).json({ success: true, message: "Password reset successful", user: updatedUser });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// Update user password
export const updatePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        const id = req.user?.id; // Use the authenticated user's ID from req.user, which should be set by your auth middleware

        const user = await User.findOne({ id });

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Check if the current password is correct
        const isMatch = await user.comparePassword(currentPassword);

        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Current password is incorrect" });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update the user's password
        user.password = hashedPassword;
        await user.save();

        return res.status(200).json({ success: true, message: "Password updated successfully" });
    } catch (error) {
        console.error("Error updating user password:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};