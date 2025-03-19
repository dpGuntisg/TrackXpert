import express from "express";
import UserService from "../services/userServices.js";
import verifyToken from "../middleware/verifyToken.js";

const router = express.Router();

router.post("/signup", async (req, res) => {
  try {
    const { user, token } = await UserService.createUser(req.body);
    res.status(201).json({ message: "User created successfully", user, token });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
});

router.post("/signin", async (req, res) => {
  try {
    const { user, token } = await UserService.signInUser(req.body);
    res.status(200).json({ message: "User signed in successfully", user, token });
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
    await UserService.logUserOut(req.headers.authorization.split(" ")[1]);
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

export default router;
