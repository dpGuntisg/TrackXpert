import express from "express";
import TrackRequestService from "../services/trackRequestServices.js";
import verifyToken from "../middleware/verifyToken.js";

const router = express.Router();

// Create a join request
router.post("/create-request", verifyToken, async (req, res) => {
    try {
        const { trackId, content } = req.body;
        const request = await TrackRequestService.createJoinRequest(req.userId, trackId, content);
        res.status(201).json(request);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get notifications (pending requests where user is receiver)
router.get("/notifications", verifyToken, async (req, res) => {
    try {
        const notifications = await TrackRequestService.getPendingNotifications(req.userId);
        res.status(200).json(notifications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get all requests (both sent and received)
router.get("/requests", verifyToken, async (req, res) => {
    try {
        const requests = await TrackRequestService.getTrackRequests(req.userId);
        res.status(200).json(requests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get only sent requests
router.get("/sent-requests", verifyToken, async (req, res) => {
    try {
        const requests = await TrackRequestService.getSentRequests(req.userId);
        res.status(200).json(requests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get only received requests
router.get("/received-requests", verifyToken, async (req, res) => {
    try {
        const requests = await TrackRequestService.getReceivedRequests(req.userId);
        res.status(200).json(requests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update request status
router.put("/update-request/:requestId", verifyToken, async (req, res) => {
    try {
        const { status } = req.body;
        await TrackRequestService.updateRequestStatus(req.params.requestId, status);
        const requests = await TrackRequestService.getAllUserTrackRequests(req.userId);
        res.status(200).json(requests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete a request
router.delete("/delete-request/:requestId", verifyToken, async (req, res) => {
    try{
        TrackRequestService.deleteRequests(req.params.requestId, req.userId);
        res.status(200).json({ message: "Request deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;