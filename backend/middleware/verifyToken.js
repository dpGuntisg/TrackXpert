import jwt from "jsonwebtoken";
import Token from "../models/Token.js";

const JWT_SECRET = "process.env.JWT_SECRET";

export const verifyToken =  async (req, res, next) => {
    const token = req.headers.authorization && req.headers.authorization.split(" ")[1];  // Extract the token from the header
    if (!token) {
        return res.status(401).json({ message: "No token provided" });
    }
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const tokenExists = await Token.findOne({ userId: decoded.userId, token });
        if (!tokenExists) {
            return res.status(401).json({ message: "Invalid or expired token" });
        }
        req.userId = decoded.userId;
        next();
    } catch (error) {
        return res.status(401).json({ message: "Invalid or expired token" });
    }
};

export default verifyToken;