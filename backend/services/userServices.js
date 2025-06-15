import User from "../models/User.js";
import jwt from "jsonwebtoken";
import Token from "../models/Token.js";
import Image from "../models/Images.js";
import Track from "../models/Track.js";
import Event from "../models/Event.js";
import Report from "../models/Report.js";
import { createImage } from "./helpers/imageHelper.js";
import { logActivity } from "./helpers/logHelper.js";
const JWT_SECRET = "process.env.JWT_SECRET";

class UserService {
    static async createUser({ name, surname, email, password }) {
        if (!name || !surname || !email || !password) {
            const error = new Error("All fields are required");
            error.translationKey = "auth.fieldsRequired";
            throw error;
        }
        if (!name.trim()) {
            const error = new Error("Name cannot be empty or consist only of spaces");
            error.translationKey = "auth.nameRequired";
            throw error;
        }
        if (!surname.trim()) {
            const error = new Error("Surname cannot be empty or consist only of spaces");
            error.translationKey = "auth.surnameRequired";
            throw error;
        }
        if (name.trim().length < 3) {
            const error = new Error("Name must be at least 3 characters long");
            error.translationKey = "auth.nameTooShort";
            throw error;
        }
        if (surname.trim().length < 3) {
            const error = new Error("Surname must be at least 3 characters long");
            error.translationKey = "auth.surnameTooShort";
            throw error;
        }
        if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
            const error = new Error("Invalid email format");
            error.translationKey = "auth.invalidEmail";
            throw error;
        }
        if (password.length < 8) {
            const error = new Error("Password must be at least 8 characters long");
            error.translationKey = "auth.passwordTooShort";
            throw error;
        }
        
        if (!/(?=.*[A-Z])(?=.*\d)(?=.*[a-z]).{8,}/.test(password)) {
            const error = new Error("Password must contain at least one uppercase letter, one lowercase letter and a number");
            error.translationKey = "auth.passwordRequirements";
            throw error;
        }
        
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            const error = new Error("An account with this email already exists");
            error.translationKey = "auth.emailExists";
            throw error;
        }
        
        // Create user
        const user = new User({
            name: name.trim(),
            surname: surname.trim(),
            email,
            password,
            username: email.split('@')[0] + Math.floor(Math.random() * 1000)
        });
        
        await user.save();
        const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "7d" });
        await Token.create({ userId: user._id, token });
        await logActivity(user._id, 'created_account', {
            username: user.username, 
            name: user.name,
            surname: user.surname,
            email
        });
        return { user, token };
    }
    
    static async signInUser({ email, password }) {
        if (!email || !password) {
            const error = new Error("Email and password are required");
            error.translationKey = "auth.fieldsRequired";
            throw error;
        }
        if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
            const error = new Error("Invalid email format");
            error.translationKey = "auth.invalidEmail";
            throw error;
        }
        const user = await User.findOne({ email });
        if (!user) {
            const error = new Error("Invalid credentials");
            error.translationKey = "auth.loginError";
            throw error;
        }
        
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            const error = new Error("Invalid credentials");
            error.translationKey = "auth.loginError";
            throw error;
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
                } else if (key === 'username') {
                    if (!updates.username || !updates.username.trim()) {
                        const error = new Error("Username cannot be empty");
                        error.translationKey = "profile.validation.usernameRequired";
                        throw error;
                    }
                    if (updates.username.trim().length < 3) {
                        const error = new Error("Username must be at least 3 characters long");
                        error.translationKey = "profile.validation.usernameTooShort";
                        throw error;
                    }
                    const existingUser = await User.findOne({ username: updates.username });
                    if (existingUser && existingUser._id.toString() !== userIdToUpdate) {
                        const error = new Error("Username is already taken");
                        error.translationKey = "profile.validation.usernameTaken";
                        throw error;
                    }
                    user[key] = updates[key].trim();
                } else if (key === 'name' || key === 'surname') {
                    if (!updates[key] || !updates[key].trim()) {
                        const error = new Error(`${key.charAt(0).toUpperCase() + key.slice(1)} cannot be empty`);
                        error.translationKey = `profile.validation.${key}Required`;
                        throw error;
                    }
                    if (updates[key].trim().length < 3) {
                        const error = new Error(`${key.charAt(0).toUpperCase() + key.slice(1)} must be at least 3 characters long`);
                        error.translationKey = `profile.validation.${key}TooShort`;
                        throw error;
                    }
                    user[key] = updates[key].trim();
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

    static async report({ reportedBy, targetType, targetId, reason }) {
        const existingReport = await Report.findOne({
          reportedBy,
          targetType,
          targetId,
        });
      
        if (existingReport) {throw { status: 400, message: "You have already reported this item"};}
        const report = new Report({ reportedBy, targetType, targetId, reason });
        await report.save();
        return report;
    }
}

export default UserService;