import User from "../models/User.js";
import jwt from "jsonwebtoken";
import Token from "../models/Token.js";
import { response } from "express";

const JWT_SECRET = "process.env.JWT_SECRET";

// create a user
export const createUser = async (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }
    try {
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            return res.status(409).json({ message: "Username or email already exists" });
        }
        const user = new User({ username, email, password });
        await user.save();
        const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "1h" });
        await Token.create({ userId: user._id, token });
        res.status(201).json({ message: "User created successfully", user, token });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ message: "Username or email already exists" });
        }
        res.status(500).json({ message: "Error creating user", error });
    }
};

export const signInUser = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }
        const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "1h" });
        await Token.create({ userId: user._id, token });
        res.status(200).json({ message: "User signed in successfully", user, token });
    } catch (error) {
        res.status(500).json({ message: "Error signing in user", error: error.message });
    }
};


export const userProfile = async (req, res) => {
    try {
        const user = await User.findById(req.userId).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ message: "User profile fetched successfully", user });
    } catch (error) {
        res.status(500).json({ message: "Error fetching user profile", error });
    }
};

export const logUserOut = async (req, res) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
        await Token.findOneAndDelete({ token });
        res.status(200).json({ message: "User logged out successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error logging out user", error });
    }
};


// get all users
export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select("-password");
        res.status(200).json({ message: "Users fetched successfully", users });
    } catch (error) {
        res.status(500).json({ message: "Error fetching users", error });
    }
};

export const updateUser = async (req, res) => {
    try {
        const updatedUser = await User.findByIdAndUpdate(
            req.userId,
            { username: req.body.username },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ message: "User updated successfully", updatedUser });
    } catch (error) {
        res.status(500).json({ error: "Something went wrong..." });
    }
};


export default { createUser, getAllUsers, signInUser, userProfile, logUserOut, updateUser };