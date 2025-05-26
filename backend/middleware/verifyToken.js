import jwt from "jsonwebtoken";
import Token from "../models/Token.js";
import User from "../models/User.js";

const JWT_SECRET = "process.env.JWT_SECRET";

export const verifyToken = async (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ message: "No token provided" });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const tokenExists = await Token.findOne({ userId: decoded.userId, token });
        if (!tokenExists) {
            return res.status(401).json({ message: "Invalid or expired token" });
        }

        // Check if user is banned
        const user = await User.findById(decoded.userId);
        if (user.isBanned) {
            if (!user.bannedUntil) {
                return res.status(403).json({ 
                    banned: true, 
                    reason: user.banReason,
                    permanent: true
                });
            } else if (user.bannedUntil > new Date()) {
                return res.status(403).json({ 
                    banned: true, 
                    reason: user.banReason,
                    bannedUntil: user.bannedUntil
                });
            } else {
                // Ban has expired, unban the user
                user.isBanned = false;
                user.banReason = undefined;
                user.bannedUntil = undefined;
                await user.save();
            }
        }

        req.userId = decoded.userId;
        next();
    } catch (error) {
        return res.status(401).json({ message: "Invalid or expired token" });
    }
};

export default verifyToken;