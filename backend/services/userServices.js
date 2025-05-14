import User from "../models/User.js";
import jwt from "jsonwebtoken";
import Token from "../models/Token.js";
import Image from "../models/Images.js";
import Track from "../models/Track.js";
import Event from "../models/Event.js";
import { createImage } from "./helpers/imageHelper.js";
import { logActivity } from "./helpers/logHelper.js";
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
            username: email.split('@')[0] + Math.floor(Math.random() * 1000)
        });
        
        await user.save();
        const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "7d" });
        await Token.create({ userId: user._id, token });
        await logActivity(user._id, 'created_account', {
            username: user.username, 
            name,
            surname,
            email
        });
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
        
        const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "7d" });
        await Token.create({ userId: user._id, token });
        return { user, token };
    }
    
    static async getUserProfile(userId) {
        const user = await User.findById(userId)
        .populate("profile_image", "data mimeType")
        .select("-password");
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
    
    static async updateUser(userIdToUpdate, loggedInUserId, updates) {
        if (userIdToUpdate !== loggedInUserId) {
            throw new Error("Unauthorized");
        }

        const user = await User.findById(userIdToUpdate);
        if (!user) {
            throw new Error("User not found");
        }

        const allowedUpdates = ['username', 'name', 'surname', 'phonenumber'];
        for (const key in updates) {
            if (updates.hasOwnProperty(key) && allowedUpdates.includes(key)) {
                if (key === 'phonenumber') {
                    if (updates.phonenumber === null) {
                        user[key] = undefined;
                    } else {
                        if (!/^\+?[0-9]{7,15}$/.test(updates.phonenumber)) {
                            throw new Error("Invalid phone number format");
                        }
        
                        const existingUser = await User.findOne({ phonenumber: updates.phonenumber });
                        if (existingUser && existingUser._id.toString() !== userIdToUpdate) {
                            throw new Error("Phone number is already in use");
                        }
                        user[key] = updates[key];
                    }
                } else {
                    user[key] = updates[key];
                }
            }
        }



        if (updates.profile_image && updates.profile_image.data && updates.profile_image.mimeType) {
            // If a new profile image object is provided
            if (user.profile_image) {
                await Image.findByIdAndDelete(user.profile_image);
            }
            const profileImageData = await createImage(updates.profile_image.data, updates.profile_image.mimeType);
            user.profile_image = profileImageData._id;
        } else if (updates.profile_image === null) {
            // If profile_image is explicitly set to null, remove it
            if (user.profile_image) {
                await Image.findByIdAndDelete(user.profile_image);
            }
            user.profile_image = undefined;
        }

        const updatedUser = await user.save();
        await logActivity(user._id, 'updated_account', {
            username: updatedUser.username, 
            name: updatedUser.name,
            surname: updatedUser.surname,
            email: updatedUser.email
        });
        return updatedUser;
    }

    static async deleteProfile(profileIdToDelete, loggedInUserId) {
        try {
            if (profileIdToDelete !== loggedInUserId) {
                throw new Error("Unauthorized");
            }
            const user = await User.findById(profileIdToDelete);
            if (!user) {
                throw new Error("User not found");
            }
    
            await Token.deleteMany({ userId: profileIdToDelete });
    
            if (user.profile_image) {
                await Image.findByIdAndDelete(user.profile_image);
            }

            await Track.deleteMany({ created_by: profileIdToDelete });
            await Event.deleteMany({ created_by: profileIdToDelete });

            await logActivity(profileIdToDelete, 'deleted_account', {
                username: user.username, 
                name: user.name,
                surname: user.surname,
                email: user.email
            });
    
            await User.findByIdAndDelete(profileIdToDelete);
    
            return { message: "User deleted successfully" };
        } catch (error) {
            throw new Error(error.message);
        }
    }
    
}

export default UserService;