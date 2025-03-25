import express from "express";
import UserService from "../services/userServices.js";
import verifyToken from "../middleware/verifyToken.js";

const router = express.Router();

router.post("/signup", async (req, res) => {
  try {
    const { user, token } = await UserService.createUser(req.body);
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    res.status(201).json({ message: "User created successfully", user });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
});

router.post("/signin", async (req, res) => {
  try {
    const { user, token } = await UserService.signInUser(req.body);
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    res.status(200).json({ message: "User signed in successfully", user });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
});

router.get("/profile", verifyToken, async (req, res) => {
  try {
    const user = await UserService.getUserProfile(req.userId);
    res.status(200).json({ message: "User profile fetched successfully", user });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
});

router.post("/signout", async (req, res) => {
  try {
    const token = req.cookies.token;
    if (token) {
      await UserService.logUserOut(token);
    }
    res.clearCookie('token');
    res.status(200).json({ message: "User logged out successfully" });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
});

router.get("/all", async (req, res) => {
  try {
    const users = await UserService.getAllUsers();
    res.status(200).json({ message: "Users fetched successfully", users });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
});

router.patch("/update", verifyToken, async (req, res) => {
  try {
    const updatedUser = await UserService.updateUser(req.userId, req.userId, req.body);
    res.status(200).json({ message: "User updated successfully", updatedUser });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
});

router.delete("/delete", verifyToken, async (req, res) => {
  try {
    const loggedInUserId = req.userId;
    await UserService.deleteProfile(loggedInUserId, loggedInUserId);
    res.status(200).json({ message: "Profile deleted successfully" });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
});

export default router;