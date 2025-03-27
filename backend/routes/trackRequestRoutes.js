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

router.get("/requests", verifyToken, async (req, res) => {
    try {
        const requests = await TrackRequestService.getTrackRequests(req.userId);
        res.status(200).json(requests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.put("/update-request/:requestId", verifyToken, async (req, res) => {
    try {
        const { status } = req.body;
        const request = await TrackRequestService.updateRequestStatus(req.params.requestId, status);
        res.status(200).json(request);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;