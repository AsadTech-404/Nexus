import jwt from "jsonwebtoken";

export const generateToken = (user) => {
    try {
        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });
        return token;
    } catch (error) {
        console.error("Error generating token:", error);
        return null;
    }
}