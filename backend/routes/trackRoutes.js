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
      // Extract pagination parameters from the query string (page, limit)
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 6; // Default to 6 per page
      
      const { tracks, totalPages } = await TrackService.getAllTracks({ page, limit });
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

export default router;
