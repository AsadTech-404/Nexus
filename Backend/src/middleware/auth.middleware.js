import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const authenticate = async (req, res, next) => {
    try {
        const token = req.cookies.token || req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            return res.status(401).json({ success: false, message: "Not authorized, please login" });
        }

        // 1. Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 2. Find the user in the database
        // We select("-password") because we don't want the hash floating around in 'req.user'
        const user = await User.findById(decoded.id).select("-password");

        if (!user) {
            return res.status(404).json({ success: false, message: "User no longer exists" });
        }

        // 3. Attach the user to the request object
        req.user = user; 
        next();
    } catch (error) {
        // If the token is expired or fake, jwt.verify throws an error
        console.error("Auth Error:", error.message);
        return res.status(401).json({ success: false, message: "Invalid or expired token" });
    }
};

// Check role 
export const checkRole = (roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ success: false, message: "You don't have access to this resource" });
        }
        next();
    }
}