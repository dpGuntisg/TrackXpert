import User from "../models/User.js";
import jwt from "jsonwebtoken";
import Token from "../models/Token.js";

const JWT_SECRET = "process.env.JWT_SECRET";

class UserService {
    static async createUser({ username, email, password }) {
        if (!username || !email || !password) {
            throw new Error("All fields are required");
        }
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            throw new Error("Username or email already exists");
        }
        const user = new User({ username, email, password });
        await user.save();
        const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "1h" });
        await Token.create({ userId: user._id, token });
        return { user, token };
    }

    static async signInUser({ email, password }) {
        if (!email || !password) {
            throw new Error("Email and password are required");
        }
        const user = await User.findOne({ email });
        if (!user) {
            throw new Error("Invalid credentials");
        }
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            throw new Error("Invalid credentials");
        }
        const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "1h" });
        await Token.create({ userId: user._id, token });
        return { user, token };
    }

    static async getUserProfile(userId) {
        const user = await User.findById(userId).select("-password");
        if (!user) {
            throw new Error("User not found");
        }
        return user;
    }

    static async logUserOut(token) {
        await Token.findOneAndDelete({ token });
        return { message: "User logged out successfully" };
    }

    static async getAllUsers() {
        return await User.find().select("-password");
    }

    static async updateUser(userId, body) {
        const { username } = body;
        if (!username || typeof username !== 'string') {
            throw new Error("Invalid username");
        }
    
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { username },
            { new: true }
        );
        if (!updatedUser) {
            throw new Error("User not found");
        }
        return updatedUser;
    }
    
}

export default UserService;
