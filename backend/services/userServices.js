import User from "../models/User.js";
import jwt from "jsonwebtoken";
import Token from "../models/Token.js";
const JWT_SECRET = "process.env.JWT_SECRET";

class UserService {
    static async createUser({ name, surname, email, password }) {

        if (!name || !surname || !email || !password) {
            throw new Error("All fields are required");
        }
        if (name.length < 3) {
            throw new Error("Name must be at least 3 characters long");
        }
        if (surname.length < 3) {
            throw new Error("Surname must be at least 3 characters long");
        }
        if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
            throw new Error("Invalid email format");
        }
        if (password.length < 8) {
            throw new Error("Password must be at least 8 characters long");
        }
        
        if (!/(?=.*[A-Z])(?=.*\d)(?=.*[a-z]).{8,}/.test(password)) {
            throw new Error("Password must contain at least one uppercase letter, one lowercase letter and a number");
        }
        
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            throw new Error("An account with this email already exists");
        }
        
        // Create user
        const user = new User({
            name,
            surname,
            email,
            password,
            username: email.split('@')[0] + Math.floor(Math.random() * 1000) // Simple default username
        });
        
        await user.save();
        const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "1h" });
        await Token.create({ userId: user._id, token });
        return { user, token };
    }
    
    static async signInUser({ email, password }) {
        if (!email || !password) {
            throw new Error("Email and password are required");
        }
        if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
            throw new Error("Invalid email format");
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
    
    static async getCreatorInfo(userId) {
        const user = await User.findById(userId).select("username email");
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
        
        if (!username) {
            throw new Error("Username is required");
        }
        
        if (username.includes(' ')) { 
            throw new Error("Username cannot contain spaces");
        }
        
        if (username.length < 3) {
            throw new Error("Username must be at least 3 characters long");
        }
        
        if (username.length > 20) {
            throw new Error("Username must be at most 20 characters long");
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