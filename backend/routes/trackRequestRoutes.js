import express from "express";
import TrackRequestService from "../services/trackRequestServices.js";
import verifyToken from "../middleware/verifyToken.js";

const router = express.Router();

router.post("/create-request", verifyToken, async (req, res) => {
    try {
        const { trackId, content } = req.body;
        const request = await TrackRequestService.createJoinRequest(req.userId, trackId, content);
        res.status(201).json(request);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;