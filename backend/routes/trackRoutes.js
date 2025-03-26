import express from "express";
import TrackService from "../services/trackServices.js";
import verifyToken from "../middleware/verifyToken.js";

const router = express.Router();

router.post("/createtrack", verifyToken, async (req, res) => {
  try {
    const track = await TrackService.createTrack(req.userId, req.body);
    res.status(201).json({ message: "Track created successfully", track });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 6;
    const filters = {
      search: req.query.search,
      tags: req.query.tags ? JSON.parse(req.query.tags) : undefined,
      minLength: req.query.minLength,
      maxLength: req.query.maxLength,
      availability: req.query.availability ? JSON.parse(req.query.availability) : undefined
    };
    const { tracks, totalPages } = await TrackService.getAllTracks({ page, limit, filters });
    res.status(200).json({ message: "Tracks fetched successfully", tracks, totalPages });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const track = await TrackService.getTrackById(req.params.id);
    res.status(200).json({ message: "Track fetched successfully", track });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
});

router.patch("/:id", verifyToken, async (req, res) => {
  try {
    const updatedTrack = await TrackService.updateTrack(req.params.id, req.userId, req.body);
    res.status(200).json({ message: "Track updated successfully", updatedTrack });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
});

router.delete("/:id", verifyToken, async (req, res) => {
  try {
    await TrackService.deleteTrack(req.params.id, req.userId);
    res.status(200).json({ message: "Track deleted successfully" });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
});

router.get("/profile/:userId/tracks", verifyToken, async (req, res) => {
  try {
    const tracks = await TrackService.getTracksByUserId(req.params.userId);
    res.status(200).json({ message: "User tracks fetched successfully", tracks });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
});

router.post("/:id/like", verifyToken, async (req, res) => {
  try {
    const track = await TrackService.likeTrack(req.params.id, req.userId);
    res.status(200).json({ message: "Track liked successfully", track });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
});

router.post("/:id/unlike", verifyToken, async (req, res) => {
  try {
    const track = await TrackService.unlikeTrack(req.params.id, req.userId);
    res.status(200).json({ message: "Track unliked successfully", track });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
});

router.get("/profile/:userId/liked", verifyToken, async (req, res) => {
  try {
    const tracks = await TrackService.getLikedTracks(req.params.userId);
    res.status(200).json({ message: "Liked tracks fetched successfully", tracks });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
});

export default router;
